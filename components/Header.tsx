
import React, { useState, useEffect } from 'react';
import { FlightPhase } from '../types';

interface HeaderProps {
  currentPhase: FlightPhase;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentPhase, activeTab, setActiveTab }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setShowInstallModal(true);
    }
  };

  return (
    <header className="sticky top-0 z-50 glass border-b border-slate-700/50 p-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
            {/* Airplane Icon */}
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight leading-tight">CloudLog AI</h1>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">CRM Augmentation System</p>
            <p className="text-[9px] text-blue-400/80 font-bold uppercase tracking-widest mt-0.5">Developed by Medhat Khalil</p>
          </div>
        </div>

        <nav className="flex gap-2">
          {['Dashboard', 'Analytics', 'Simulation', 'Philosophy'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button 
            onClick={handleInstallClick}
            className="hidden sm:flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-700 transition-all shadow-lg active:scale-95"
            title="Download App Icon"
          >
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            App Icon
          </button>

          <div className="flex items-center gap-4 bg-slate-900/50 px-4 py-2 rounded-full border border-slate-700">
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-widest text-slate-500">Flight Phase</span>
              <span className="text-sm font-semibold text-blue-400">{currentPhase}</span>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs font-mono">SYS: READY</span>
            </div>
          </div>
        </div>
      </div>

      {/* Install Modal */}
      {showInstallModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm glass liquid-glass border border-white/20 rounded-[40px] p-8 shadow-2xl animate-bounceScale">
            <div className="flex flex-col items-center text-center gap-6">
              <div className="bg-blue-600 p-5 rounded-[24px] shadow-2xl shadow-blue-500/40">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Install CloudLog AI</h2>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Add this dashboard to your home screen for quick, full-screen access to flight operations.
                </p>
              </div>
              
              <div className="w-full bg-slate-900/50 p-6 rounded-3xl border border-white/10 text-left space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-black text-[10px] shrink-0">1</div>
                  <p className="text-[11px] text-slate-300 font-medium">Open your mobile browser menu (three dots or share icon).</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-black text-[10px] shrink-0">2</div>
                  <p className="text-[11px] text-slate-300 font-medium">Select <span className="text-white font-bold">"Add to Home Screen"</span> or <span className="text-white font-bold">"Install App"</span>.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-black text-[10px] shrink-0">3</div>
                  <p className="text-[11px] text-slate-300 font-medium">The <span className="text-blue-400 font-bold">CloudLog AI</span> icon will appear on your dashboard.</p>
                </div>
              </div>

              <button 
                onClick={() => setShowInstallModal(false)}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-xs rounded-2xl transition-all tracking-widest shadow-lg shadow-blue-500/20"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
