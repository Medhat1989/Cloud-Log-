
import React from 'react';
import { FlightPhase } from '../types';

interface HeaderProps {
  currentPhase: FlightPhase;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentPhase, activeTab, setActiveTab }) => {
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
    </header>
  );
};

export default Header;
