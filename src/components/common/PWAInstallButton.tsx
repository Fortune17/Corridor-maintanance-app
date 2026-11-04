import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { 
  Smartphone, 
  Download, 
  X, 
  Share2, 
  PlusSquare, 
  Laptop, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'header' | 'banner' | 'card';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'header',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // If already running in standalone mode or manually dismissed, do not render
  if (isInstalled || isDismissed) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (!outcome) {
        setShowGuideModal(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  if (variant === 'banner') {
    return (
      <>
        <div className={`p-3 bg-gradient-to-r from-sky-900 via-slate-900 to-sky-950 text-white rounded-xl border border-sky-700/60 shadow-lg flex items-center justify-between gap-3 ${className}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 border border-sky-400/30">
              <Smartphone className="w-5 h-5 text-sky-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white leading-tight">
                  Install Corridor Hill Web App
                </span>
                <span className="text-[10px] bg-sky-500/30 text-sky-200 px-1.5 py-0.5 rounded-full font-semibold border border-sky-400/30">
                  PWA Ready
                </span>
              </div>
              <span className="text-[11px] text-slate-300 block">
                Instant home-screen access, full-screen mode & quick room logging
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleClick}
              className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1.5 text-slate-400 hover:text-white rounded-md transition-colors"
              aria-label="Dismiss install banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Guided Instructions Modal */}
        {showGuideModal && (
          <InstallInstructionsModal onClose={() => setShowGuideModal(false)} isIOS={isIOS} />
        )}
      </>
    );
  }

  // Header button variant
  return (
    <>
      <button
        onClick={handleClick}
        className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors border bg-sky-50 text-sky-800 border-sky-300 hover:bg-sky-100 shadow-2xs ${className}`}
        title="Install Corridor Hill Web App on mobile or desktop"
      >
        <Smartphone className="w-3.5 h-3.5 text-sky-700" />
        <span className="hidden sm:inline">Install Web App</span>
        <span className="sm:hidden">Install</span>
      </button>

      {/* Guided Instructions Modal */}
      {showGuideModal && (
        <InstallInstructionsModal onClose={() => setShowGuideModal(false)} isIOS={isIOS} />
      )}
    </>
  );
};

// Reusable modal with browser-specific steps
interface InstallInstructionsModalProps {
  onClose: () => void;
  isIOS: boolean;
}

const InstallInstructionsModal: React.FC<InstallInstructionsModalProps> = ({ onClose, isIOS }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-slate-900 animate-in fade-in zoom-in-95">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-sky-100 flex items-center justify-center text-sky-800 font-bold">
              <Sparkles className="w-5 h-5 text-sky-700" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Install Corridor Hill Maintenance
              </h3>
              <p className="text-xs text-slate-500">Fast, offline-ready progressive web app</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isIOS ? (
          /* iOS Safari Guide */
          <div className="py-4 space-y-3.5 text-xs text-slate-700 leading-relaxed">
            <p className="font-semibold text-slate-900 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-sky-600" />
              Follow these simple steps in Safari:
            </p>
            <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                1
              </div>
              <p>
                Tap the <strong>Share</strong> button <Share2 className="w-3.5 h-3.5 inline text-sky-700 mx-0.5" /> in the Safari toolbar at the bottom of your screen.
              </p>
            </div>
            <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                2
              </div>
              <p>
                Scroll down and select <strong>Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline text-sky-700 mx-0.5" />.
              </p>
            </div>
            <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                3
              </div>
              <p>
                Tap <strong>Add</strong> in the top right. Corridor Hill will now open like a native app on your phone!
              </p>
            </div>
          </div>
        ) : (
          /* Desktop Chrome / Android Guide */
          <div className="py-4 space-y-3.5 text-xs text-slate-700 leading-relaxed">
            <div className="p-3 bg-sky-50 rounded-lg border border-sky-200 text-sky-950">
              <p className="font-semibold flex items-center gap-1.5 mb-1 text-sky-900">
                <Laptop className="w-4 h-4 text-sky-700" />
                Desktop Chrome & Edge
              </p>
              <p className="text-slate-600">
                Look for the <strong>Install</strong> icon <Download className="w-3.5 h-3.5 inline text-sky-700 mx-0.5" /> in your browser address bar on the right side, or click browser menu (<strong>⋮</strong>) &rarr; <strong>Install Corridor Hill Maintenance</strong>.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="font-semibold flex items-center gap-1.5 mb-1 text-slate-900">
                <Smartphone className="w-4 h-4 text-emerald-700" />
                Android Chrome & Samsung Internet
              </p>
              <p className="text-slate-600">
                Tap the three dots (<strong>⋮</strong>) at top-right &rarr; tap <strong>Install App</strong> or <strong>Add to Home screen</strong>.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Full standalone window, zero URL bar, offline caching enabled.</span>
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-sky-900 hover:bg-sky-800 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs"
          >
            Got It, Close
          </button>
        </div>
      </div>
    </div>
  );
};
