
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LiveDashboard from './components/LiveDashboard';
import Simulator from './components/Simulator';
import SystemInfo from './components/SystemInfo';
import { FlightPhase, EmergencyAlert } from './types';

const LandingPage: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  const [isLaunching, setIsLaunching] = useState(false);

  const handleStart = () => {
    setIsLaunching(true);
    setTimeout(() => {
      onStart();
    }, 3000);
  };

  if (isLaunching) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#020617] animate-fadeIn">
        <div className="relative">
          {/* Central Logo */}
          <div className="bg-blue-600 p-6 rounded-[24px] shadow-2xl shadow-blue-500/40 relative z-10 animate-pulse">
            <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
            </svg>
          </div>
          {/* Orbiting Aircraft */}
          <div className="orbiting-aircraft text-blue-400">
            <svg className="w-6 h-6 transform rotate-90" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
            </svg>
          </div>
          <div className="absolute top-32 left-1/2 -translate-x-1/2 text-center w-64">
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 animate-pulse">System Initialization</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950 px-6 overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]"></div>

      <div className="shining-outline-container w-full max-w-lg">
        <div className="shining-outline-content liquid-glass p-12 flex flex-col items-center gap-8 border border-white/10 shadow-2xl">
          <div className="bg-blue-600 p-5 rounded-[24px] shadow-2xl shadow-blue-500/30">
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
            </svg>
          </div>
          
          <div className="text-center space-y-2">
            <h1 className="text-5xl font-black text-white tracking-tighter">CloudLog AI</h1>
            <p className="text-sm font-bold text-blue-400 uppercase tracking-[0.3em]">Developed by Medhat Khalil</p>
          </div>

          <button 
            onClick={handleStart}
            className="group relative px-12 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-sm tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:scale-95 overflow-hidden"
          >
            <span className="relative z-10">Start Flight Ops</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [currentPhase] = useState<FlightPhase>(FlightPhase.CRUISE);
  const [activeAlert, setActiveAlert] = useState<EmergencyAlert | null>(null);
  const [isLaunched, setIsLaunched] = useState(false);

  const triggerAlert = (alert: EmergencyAlert) => {
    setActiveAlert(alert);
  };

  const clearAlert = () => {
    setActiveAlert(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <LiveDashboard activeAlert={activeAlert} onClearAlert={clearAlert} />;
      case 'Simulation':
        return <Simulator onEmergencyDetected={triggerAlert} />;
      case 'Philosophy':
        return <SystemInfo />;
      case 'Analytics':
        return (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
            <div className="p-6 bg-slate-900 rounded-full">
              <svg className="w-16 h-16 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-200">Post-Flight Analytics</h2>
              <p className="text-slate-500 max-w-md mx-auto mt-2">
                Detailed cohesion metrics and stress timeline mapping are generated after the "De-boarding" phase is complete to ensure total data anonymization.
              </p>
            </div>
            <button className="text-blue-400 font-bold hover:underline">Download Sample Debrief Report (PDF)</button>
          </div>
        );
      default:
        return <LiveDashboard activeAlert={activeAlert} onClearAlert={clearAlert} />;
    }
  };

  if (!isLaunched) {
    return <LandingPage onStart={() => setIsLaunched(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col animate-fadeIn">
      <Header 
        currentPhase={currentPhase} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />
      
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 overflow-y-auto">
        {renderContent()}
      </main>

      <footer className="p-4 border-t border-slate-800 text-center text-[10px] text-slate-600 uppercase tracking-widest font-mono">
        CloudLog AI Prototype v1.2.4-BETA // ALIGNED WITH ICAO ANNEX 19 & CRM PRINCIPLES
      </footer>
    </div>
  );
};

export default App;
