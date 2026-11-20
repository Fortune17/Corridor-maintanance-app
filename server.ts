import 'dotenv/config';
import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, Modality } from '@google/genai';
import type { LiveServerMessage } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

const SYSTEM_INSTRUCTION = `You are the Corridor Hill Student Residence Voice Assistant.
You help students and residence staff with clear, concise spoken answers about:
1. Residence Maintenance: how to log repair requests, urgency tiers (Urgent < 2h, High < 24h, Normal 48-72h, Low 3-5 days), room access windows (including Security Escort), and 30-second self-checks before lodging a ticket.
2. Residence Blocks: Buildings A through F (Block A Oak Hall, Block B Pine Hall, Block C Maple Hall, Block D Cedar Hall, Block E Willow Annex, Block F Birch Hall) plus Communal Facilities.
3. Community & Announcements: Students can customize their profile (course, bio, interests), follow each other (mutual follows become Friends), post on the Residence Forum visible to Everyone or Friends Only, and read pinned Announcements from Residence Managers and Maintenance Staff.
4. 24/7 Emergencies: For active water flooding, sparking electrical outlets, gas smells, or lockouts, always advise calling 24/7 Residence Security immediately at +27 (0)11 555-0199 (Block B Main Reception).
Keep replies natural, warm, practical, and concise for voice conversation.`;

async function startServer() {
  const app = express();
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      liveVoiceConfigured: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  const httpServer = http.createServer(app);

  // WebSocket bridge for Gemini Live API (gemini-3.8-live)
  const wss = new WebSocketServer({ server: httpServer, path: '/api/live' });

  wss.on('connection', async (clientWs: WebSocket) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(
          JSON.stringify({
            error: 'GEMINI_API_KEY is not configured on the server. Add it to your environment secrets to enable live voice conversations.',
          })
        );
        clientWs.close();
      }
      return;
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    let liveSession: Awaited<ReturnType<typeof ai.live.connect>> | null = null;
    let closedByClient = false;

    const sendToClient = (payload: Record<string, unknown>) => {
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify(payload));
      }
    };

    try {
      liveSession = await ai.live.connect({
        model: 'gemini-3.8-live',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: 'Zephyr',
              },
            },
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: SYSTEM_INSTRUCTION,
        },
        callbacks: {
          onopen: () => {
            sendToClient({ connected: true });
          },
          onmessage: (message: LiveServerMessage) => {
            const content = message.serverContent;
            if (!content) return;

            if (content.inputTranscription?.text) {
              sendToClient({ inputTranscript: content.inputTranscription.text });
            }
            if (content.outputTranscription?.text) {
              sendToClient({ outputTranscript: content.outputTranscription.text });
            }

            for (const part of content.modelTurn?.parts ?? []) {
              if (part.inlineData?.data) {
                sendToClient({ audio: part.inlineData.data });
              }
            }

            if (content.interrupted) {
              sendToClient({ interrupted: true });
            }
            if (content.turnComplete) {
              sendToClient({ turnComplete: true });
            }
          },
          onerror: (err: unknown) => {
            const msg = err instanceof Error ? err.message : 'Live voice session encountered an error.';
            sendToClient({ error: msg });
          },
          onclose: () => {
            if (!closedByClient) {
              sendToClient({ closed: true });
            }
          },
        },
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Failed to connect to Gemini Live voice service.';
      sendToClient({ error: msg });
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.close();
      }
      return;
    }

    clientWs.on('message', (raw) => {
      if (!liveSession) return;
      try {
        const parsed = JSON.parse(raw.toString()) as {
          audio?: string;
          text?: string;
          end?: boolean;
        };

        if (parsed.audio) {
          liveSession.sendRealtimeInput({
            audio: {
              data: parsed.audio,
              mimeType: 'audio/pcm;rate=16000',
            },
          });
        } else if (parsed.text) {
          liveSession.sendRealtimeInput({
            text: parsed.text,
          });
        } else if (parsed.end) {
          closedByClient = true;
          liveSession.close();
          clientWs.close();
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Invalid audio stream frame.';
        sendToClient({ error: msg });
      }
    });

    clientWs.on('close', () => {
      closedByClient = true;
      if (liveSession) {
        try {
          liveSession.close();
        } catch {
          // Ignore close cleanup errors
        }
        liveSession = null;
      }
    });
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Corridor Hill Maintenance server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
