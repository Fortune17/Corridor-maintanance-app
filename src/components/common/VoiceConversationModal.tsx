import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Mic,
  MicOff,
  PhoneOff,
  PhoneCall,
  Volume2,
  Send,
  AlertCircle,
} from 'lucide-react';

interface VoiceConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TranscriptLine {
  id: string;
  speaker: 'you' | 'desk';
  text: string;
}

type VoiceState = 'idle' | 'connecting' | 'live' | 'error';

function float32ToPcm16Base64(float32: Float32Array): string {
  const int16 = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  const bytes = new Uint8Array(int16.buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function base64Pcm16ToFloat32(base64: string): Float32Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const int16 = new Int16Array(bytes.buffer);
  const float32 = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i++) {
    float32[i] = int16[i] / 32768;
  }
  return float32;
}

export const VoiceConversationModal: React.FC<VoiceConversationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transcripts, setTranscripts] = useState<TranscriptLine[]>([]);
  const [textInput, setTextInput] = useState('');

  const wsRef = useRef<WebSocket | null>(null);
  const inputCtxRef = useRef<AudioContext | null>(null);
  const outputCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const isMutedRef = useRef<boolean>(false);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  const stopAllPlayback = () => {
    activeSourcesRef.current.forEach((src) => {
      try {
        src.stop();
      } catch {
        // Already stopped
      }
    });
    activeSourcesRef.current.clear();
    if (outputCtxRef.current) {
      nextStartTimeRef.current = outputCtxRef.current.currentTime;
    } else {
      nextStartTimeRef.current = 0;
    }
    setIsSpeaking(false);
  };

  const cleanupSession = () => {
    stopAllPlayback();

    if (processorRef.current) {
      try {
        processorRef.current.disconnect();
      } catch {}
      processorRef.current.onaudioprocess = null;
      processorRef.current = null;
    }

    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.disconnect();
      } catch {}
      sourceNodeRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (inputCtxRef.current) {
      inputCtxRef.current.close().catch(() => {});
      inputCtxRef.current = null;
    }

    if (outputCtxRef.current) {
      outputCtxRef.current.close().catch(() => {});
      outputCtxRef.current = null;
    }

    if (wsRef.current) {
      try {
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ end: true }));
        }
        wsRef.current.close();
      } catch {}
      wsRef.current = null;
    }
  };

  useEffect(() => {
    if (!isOpen) {
      cleanupSession();
      setVoiceState('idle');
      setIsMuted(false);
      setIsSpeaking(false);
      setErrorMessage(null);
    }
    return () => {
      cleanupSession();
    };
  }, [isOpen]);

  const appendTranscript = (speaker: 'you' | 'desk', delta: string) => {
    if (!delta) return;
    setTranscripts((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.speaker === speaker) {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...last,
          text: `${last.text}${delta}`,
        };
        return updated;
      }
      return [
        ...prev,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          speaker,
          text: delta,
        },
      ];
    });
  };

  const playAudioChunk = (base64Audio: string) => {
    const outCtx = outputCtxRef.current;
    if (!outCtx) return;

    if (outCtx.state === 'suspended') {
      outCtx.resume().catch(() => {});
    }

    const pcmFloat = base64Pcm16ToFloat32(base64Audio);
    const buffer = outCtx.createBuffer(1, pcmFloat.length, 24000);
    buffer.getChannelData(0).set(pcmFloat);

    const source = outCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(outCtx.destination);

    const startTime = Math.max(nextStartTimeRef.current, outCtx.currentTime);
    source.start(startTime);
    nextStartTimeRef.current = startTime + buffer.duration;

    activeSourcesRef.current.add(source);
    setIsSpeaking(true);

    source.onended = () => {
      activeSourcesRef.current.delete(source);
      if (activeSourcesRef.current.size === 0) {
        setIsSpeaking(false);
      }
    };
  };

  const startVoiceConversation = async () => {
    setErrorMessage(null);
    setVoiceState('connecting');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const inputCtx = new AudioContext({ sampleRate: 16000 });
      const outputCtx = new AudioContext({ sampleRate: 24000 });
      inputCtxRef.current = inputCtx;
      outputCtxRef.current = outputCtx;
      nextStartTimeRef.current = outputCtx.currentTime;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}/api/live`);
      wsRef.current = ws;

      ws.onopen = () => {
        const micSource = inputCtx.createMediaStreamSource(stream);
        const processor = inputCtx.createScriptProcessor(4096, 1, 1);
        sourceNodeRef.current = micSource;
        processorRef.current = processor;

        micSource.connect(processor);
        processor.connect(inputCtx.destination);

        processor.onaudioprocess = (e) => {
          if (isMutedRef.current) return;
          if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
          const samples = e.inputBuffer.getChannelData(0);
          const base64 = float32ToPcm16Base64(samples);
          wsRef.current.send(JSON.stringify({ audio: base64 }));
        };
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as {
            connected?: boolean;
            audio?: string;
            inputTranscript?: string;
            outputTranscript?: string;
            interrupted?: boolean;
            closed?: boolean;
            error?: string;
          };

          if (msg.error) {
            setErrorMessage(msg.error);
            setVoiceState('error');
            cleanupSession();
            return;
          }

          if (msg.connected) {
            setVoiceState('live');
          }

          if (msg.inputTranscript) {
            appendTranscript('you', msg.inputTranscript);
          }

          if (msg.outputTranscript) {
            appendTranscript('desk', msg.outputTranscript);
          }

          if (msg.interrupted) {
            stopAllPlayback();
          }

          if (msg.audio) {
            playAudioChunk(msg.audio);
          }

          if (msg.closed) {
            setVoiceState('idle');
            cleanupSession();
          }
        } catch {
          // Ignore malformed frame
        }
      };

      ws.onerror = () => {
        setErrorMessage('Could not connect to the live voice server. Ensure the backend server is running.');
        setVoiceState('error');
        cleanupSession();
      };

      ws.onclose = () => {
        setVoiceState((prev) => (prev === 'error' ? 'error' : 'idle'));
      };
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Microphone permission is required for real-time voice conversations.';
      setErrorMessage(msg);
      setVoiceState('error');
      cleanupSession();
    }
  };

  const handleEndCall = () => {
    cleanupSession();
    setVoiceState('idle');
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = textInput.trim();
    if (!clean || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ text: clean }));
    appendTranscript('you', clean);
    setTextInput('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs">
      <div
        className="w-full max-w-lg bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[88vh]"
        role="dialog"
        aria-label="Corridor Hill Live Voice Desk"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Residence Live Voice Desk
            </h2>
            <p className="text-xs text-slate-500">
              Speak naturally about repairs, blocks A–F, SLA times, or residence procedures
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              cleanupSession();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200/60"
            aria-label="Close voice desk"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status & Controls Bar */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                voiceState === 'live'
                  ? isSpeaking
                    ? 'bg-emerald-600 text-white'
                    : 'bg-sky-600 text-white'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {isSpeaking ? <Volume2 className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-sm font-semibold">
                {voiceState === 'idle' && 'Ready to Start Voice Call'}
                {voiceState === 'connecting' && 'Connecting Live Audio...'}
                {voiceState === 'live' && (isSpeaking ? 'Speaking Response' : isMuted ? 'Microphone Muted' : 'Listening')}
                {voiceState === 'error' && 'Connection Unavailable'}
              </p>
              <p className="text-xs text-slate-400">
                Real-time two-way audio · Gemini Live
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {voiceState === 'live' ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsMuted((m) => !m)}
                  className={`px-3 py-2 text-xs font-semibold rounded-md inline-flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                    isMuted
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700'
                  }`}
                >
                  {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  <span>{isMuted ? 'Unmute' : 'Mute'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleEndCall}
                  className="px-3 py-2 text-xs font-semibold rounded-md bg-red-600 hover:bg-red-700 text-white inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
                >
                  <PhoneOff className="w-3.5 h-3.5" />
                  <span>End</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={startVoiceConversation}
                disabled={voiceState === 'connecting'}
                className="px-4 py-2 text-xs font-semibold rounded-md bg-sky-500 hover:bg-sky-400 text-slate-950 inline-flex items-center gap-1.5 transition-colors disabled:opacity-60 whitespace-nowrap"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{voiceState === 'connecting' ? 'Connecting...' : 'Start Voice'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-5 mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Live Transcript Feed */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 min-h-[200px] bg-slate-50/50">
          {transcripts.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500 space-y-1">
              <p className="font-medium text-slate-700">
                Tap "Start Voice" to ask questions hands-free.
              </p>
              <p>
                Ask things like "How urgent is a leaking pipe?" or "How do friends posts work?"
              </p>
            </div>
          ) : (
            transcripts.map((line) => (
              <div
                key={line.id}
                className={`p-3 rounded-lg border text-xs sm:text-sm ${
                  line.speaker === 'you'
                    ? 'bg-sky-50 border-sky-200 ml-8 text-slate-900'
                    : 'bg-white border-slate-200 mr-8 text-slate-800'
                }`}
              >
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-0.5">
                  {line.speaker === 'you' ? 'You' : 'Voice Desk'}
                </span>
                <p className="leading-relaxed">{line.text}</p>
              </div>
            ))
          )}
        </div>

        {/* Optional Text Prompt During Active Call */}
        {voiceState === 'live' && (
          <form
            onSubmit={handleSendText}
            className="p-3 border-t border-slate-200 bg-white flex gap-2"
          >
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Or type a message during your call..."
              className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-sky-600"
            />
            <button
              type="submit"
              disabled={!textInput.trim()}
              className="px-3 py-2 bg-sky-900 hover:bg-sky-800 text-white text-xs font-semibold rounded-md inline-flex items-center gap-1 disabled:opacity-50 whitespace-nowrap"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
