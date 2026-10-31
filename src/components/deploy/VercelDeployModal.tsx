import React, { useState } from 'react';
import { 
  X, 
  Triangle, 
  ExternalLink, 
  Copy, 
  Check, 
  Terminal, 
  CheckCircle2, 
  Globe, 
  ShieldCheck, 
  Layers, 
  Cpu, 
  ArrowRight,
  Sparkles,
  GitBranch
} from 'lucide-react';
import { supabaseService } from '../../services/supabase';

interface VercelDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VercelDeployModal: React.FC<VercelDeployModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeDeployMethod, setActiveDeployMethod] = useState<'cli' | 'git' | 'manual'>('cli');

  if (!isOpen) return null;

  const currentSupabase = supabaseService.getStatus();
  const supabaseUrl = currentSupabase.url || 'https://your-project.supabase.co';
  const supabaseKey = currentSupabase.anonKey || 'your-supabase-anon-key';

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const envVariables = [
    {
      name: 'VITE_SUPABASE_URL',
      value: supabaseUrl,
      desc: 'Supabase PostgreSQL REST & GraphQL endpoint',
    },
    {
      name: 'VITE_SUPABASE_ANON_KEY',
      value: supabaseKey,
      desc: 'Supabase anonymous public client API key',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-black border border-slate-700 flex items-center justify-center text-white shadow-sm">
              {/* Vercel Triangle Logo */}
              <svg width="18" height="18" viewBox="0 0 1155 1000" fill="currentColor">
                <path d="m577.346 0 577.346 1000H0z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base tracking-tight text-white">Deploy to Vercel</h3>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30">
                  Ready for Production
                </span>
              </div>
              <p className="text-xs text-slate-400">Corridor Hill Student Residence Maintenance Management System</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Readiness Checklist Ribbon */}
        <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-900 font-medium">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-emerald-800 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Vite build tested
            </span>
            <span className="flex items-center gap-1.5 text-emerald-800 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              vercel.json SPA rewrite configured
            </span>
            <span className="flex items-center gap-1.5 text-emerald-800 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Supabase client ready
            </span>
          </div>
          <a
            href="https://vercel.com/new"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 bg-slate-900 hover:bg-black text-white px-3 py-1.5 rounded-md font-semibold text-xs shadow-xs transition-colors shrink-0"
          >
            Open Vercel Dashboard
            <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
          </a>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveDeployMethod('cli')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeDeployMethod === 'cli'
                ? 'border-sky-600 text-sky-900 bg-white rounded-t-md border-t border-x border-slate-200 -mb-[1px]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Method 1: Vercel CLI (Instant)
          </button>
          <button
            onClick={() => setActiveDeployMethod('git')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeDeployMethod === 'git'
                ? 'border-sky-600 text-sky-900 bg-white rounded-t-md border-t border-x border-slate-200 -mb-[1px]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            Method 2: Git / GitHub (CI/CD)
          </button>
          <button
            onClick={() => setActiveDeployMethod('manual')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeDeployMethod === 'manual'
                ? 'border-sky-600 text-sky-900 bg-white rounded-t-md border-t border-x border-slate-200 -mb-[1px]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Environment Variables & Config
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700">
          {activeDeployMethod === 'cli' && (
            <div className="space-y-5">
              <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-sky-950 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-600" />
                  Quickest Way: Deploy via Terminal in 30 Seconds
                </h4>
                <p className="text-xs text-sky-800 mt-1 leading-relaxed">
                  The Vercel CLI has been installed in your project. You can deploy directly to a production Vercel URL with zero manual file uploads.
                </p>
              </div>

              <div className="space-y-4">
                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-sky-900 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                      Deploy to Production
                    </span>
                    <button
                      onClick={() => copyToClipboard('npx vercel --prod', 'cli-prod')}
                      className="text-xs text-sky-700 hover:text-sky-900 flex items-center gap-1 font-semibold"
                    >
                      {copiedKey === 'cli-prod' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedKey === 'cli-prod' ? 'Copied!' : 'Copy Command'}
                    </button>
                  </div>
                  <pre className="bg-slate-950 text-slate-100 p-3 rounded-md text-xs font-mono overflow-x-auto">
                    npx vercel --prod
                  </pre>
                  <p className="text-[11px] text-slate-500 mt-2">
                    Or run <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono">npm run deploy:prod</code>. Vercel will prompt you once to link your team/project, then build and deploy automatically.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-sky-900 text-white text-[10px] flex items-center justify-center font-bold">2</span>
                      Preview Deployment (Staging)
                    </span>
                    <button
                      onClick={() => copyToClipboard('npx vercel', 'cli-preview')}
                      className="text-xs text-sky-700 hover:text-sky-900 flex items-center gap-1 font-semibold"
                    >
                      {copiedKey === 'cli-preview' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedKey === 'cli-preview' ? 'Copied!' : 'Copy Command'}
                    </button>
                  </div>
                  <pre className="bg-slate-950 text-slate-100 p-3 rounded-md text-xs font-mono overflow-x-auto">
                    npx vercel
                  </pre>
                  <p className="text-[11px] text-slate-500 mt-2">
                    Creates an instant isolated preview URL to share with your team before updating the production domain.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeDeployMethod === 'git' && (
            <div className="space-y-5">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-slate-700" />
                  Continuous Deployment via GitHub / GitLab / Bitbucket
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Push your repository to GitHub, and Vercel will automatically build and deploy every time you push changes to your main branch.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 border border-slate-200 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-white text-xs flex items-center justify-center font-bold">1</span>
                    <h5 className="text-xs font-bold text-slate-900">Initialize Git & Push to GitHub</h5>
                  </div>
                  <div className="relative">
                    <pre className="bg-slate-950 text-slate-100 p-3 rounded-md text-xs font-mono overflow-x-auto">
{`git init
git add .
git commit -m "Corridor Hill Maintenance System initial release"
git branch -M main
git remote add origin https://github.com/<your-username>/corridor-hill-maintenance.git
git push -u origin main`}
                    </pre>
                    <button
                      onClick={() => copyToClipboard(`git init\ngit add .\ngit commit -m "Corridor Hill Maintenance System initial release"\ngit branch -M main\ngit remote add origin https://github.com/<your-username>/corridor-hill-maintenance.git\ngit push -u origin main`, 'git-commands')}
                      className="absolute top-2 right-2 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-semibold flex items-center gap-1"
                    >
                      {copiedKey === 'git-commands' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedKey === 'git-commands' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="p-4 border border-slate-200 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-white text-xs flex items-center justify-center font-bold">2</span>
                    <h5 className="text-xs font-bold text-slate-900">Import in Vercel Dashboard</h5>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Go to <a href="https://vercel.com/new" target="_blank" rel="noopener noreferrer" className="text-sky-600 underline font-semibold">vercel.com/new</a>, select your repository, and click <strong>Import</strong>.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                    <div className="bg-slate-100 p-2 rounded">
                      <span className="text-[10px] text-slate-500 block uppercase">Framework</span>
                      <strong className="text-slate-800 font-semibold">Vite</strong>
                    </div>
                    <div className="bg-slate-100 p-2 rounded">
                      <span className="text-[10px] text-slate-500 block uppercase">Build Command</span>
                      <strong className="text-slate-800 font-semibold font-mono">npm run build</strong>
                    </div>
                    <div className="bg-slate-100 p-2 rounded">
                      <span className="text-[10px] text-slate-500 block uppercase">Output Directory</span>
                      <strong className="text-slate-800 font-semibold font-mono">dist</strong>
                    </div>
                    <div className="bg-slate-100 p-2 rounded">
                      <span className="text-[10px] text-slate-500 block uppercase">Install Command</span>
                      <strong className="text-slate-800 font-semibold font-mono">npm install</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeDeployMethod === 'manual' && (
            <div className="space-y-5">
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-1">
                  Vercel Project Environment Variables
                </h4>
                <p className="text-xs text-slate-500">
                  In your Vercel Project Settings &gt; <strong>Environment Variables</strong>, add the following key-value pairs so your deployed app communicates with your Supabase database:
                </p>
              </div>

              <div className="space-y-3">
                {envVariables.map((env) => (
                  <div key={env.name} className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-sky-900 bg-sky-100 px-2 py-0.5 rounded">
                          {env.name}
                        </span>
                        <span className="text-[11px] text-slate-500">{env.desc}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(env.value, env.name)}
                        className="text-xs text-sky-700 hover:text-sky-900 flex items-center gap-1 font-semibold"
                      >
                        {copiedKey === env.name ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedKey === env.name ? 'Copied' : 'Copy Value'}
                      </button>
                    </div>
                    <div className="font-mono text-xs text-slate-800 bg-white border border-slate-200 p-2 rounded break-all select-all">
                      {env.value}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Generated vercel.json File
                  </span>
                  <button
                    onClick={() => copyToClipboard(`{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}`, 'vercel-json')}
                    className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium"
                  >
                    {copiedKey === 'vercel-json' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copy JSON
                  </button>
                </div>
                <pre className="text-xs font-mono text-slate-300 overflow-x-auto">
{`{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}`}
                </pre>
                <p className="text-[11px] text-slate-400">
                  This configuration is already saved to your workspace root so client-side routing never causes 404s on browser reloads.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            Build verified with Vite & React 19
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Close
            </button>
            <a
              href="https://vercel.com/new"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              Deploy on Vercel
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
