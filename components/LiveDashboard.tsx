
import React, { useState, useEffect, useRef } from 'react';
import { StressLevel, CrewMember, ZoneStatus, CrewTask, MovementMarker, EmergencyAlert } from '../types';
import { analyzeCrewDynamics } from '../services/geminiService';

interface LiveDashboardProps {
  activeAlert: EmergencyAlert | null;
  onClearAlert: () => void;
}

const MOCK_CREW: CrewMember[] = [
  { id: '1', name: 'Sarah J.', position: 'Lead', zone: 1, stress: StressLevel.BASELINE, lastCommunication: '2m ago', heartRate: 72, fatigueScore: 15, movementHistory: [], currentTaskTime: 450, currentTaskDuration: 450, currentTask: 'Galley Duty' },
  { id: '2', name: 'Mark T.', position: 'Cabin 1', zone: 2, stress: StressLevel.ELEVATED, lastCommunication: '30s ago', heartRate: 88, fatigueScore: 45, movementHistory: [], currentTaskTime: 120, currentTaskDuration: 120, currentTask: 'Meal Distribution' },
  { id: '3', name: 'Elena R.', position: 'Cabin 2', zone: 3, stress: StressLevel.BASELINE, lastCommunication: '5m ago', heartRate: 68, fatigueScore: 22, movementHistory: [], currentTaskTime: 600, currentTaskDuration: 600, currentTask: 'Galley Duty' },
  { id: '4', name: 'David W.', position: 'Cabin 3', zone: 5, stress: StressLevel.HIGH, lastCommunication: '10s ago', heartRate: 104, fatigueScore: 82, movementHistory: [], currentTaskTime: 30, currentTaskDuration: 30, currentTask: 'Medical Case' },
  { id: '5', name: 'Li N.', position: 'Cabin 4', zone: 5, stress: StressLevel.BASELINE, lastCommunication: '1m ago', heartRate: 75, fatigueScore: 30, movementHistory: [], currentTaskTime: 200, currentTaskDuration: 200, currentTask: 'Meal Distribution' },
  { id: '6', name: 'Tom H.', position: 'Cabin 5', zone: 6, stress: StressLevel.BASELINE, lastCommunication: '4m ago', heartRate: 70, fatigueScore: 18, movementHistory: [], currentTaskTime: 150, currentTaskDuration: 150, currentTask: 'Safety Check' },
  { id: '7', name: 'Sofia B.', position: 'Cabin 6', zone: 4, stress: StressLevel.ELEVATED, lastCommunication: '2m ago', heartRate: 92, fatigueScore: 55, movementHistory: [], currentTaskTime: 300, currentTaskDuration: 300, currentTask: 'Passenger Assist' },
  { id: '8', name: 'James K.', position: 'Cabin 7', zone: 5, stress: StressLevel.BASELINE, lastCommunication: '3m ago', heartRate: 74, fatigueScore: 25, movementHistory: [], currentTaskTime: 400, currentTaskDuration: 400, currentTask: 'Meal Distribution' },
];

const INITIAL_ZONES: ZoneStatus[] = [
  { zoneId: 1, coverage: 98, activityLevel: 'Low', requestsPending: 0, isOverloaded: false, sopRequiredStaff: 1, currentStaffCount: 1 },
  { zoneId: 2, coverage: 85, activityLevel: 'Normal', requestsPending: 2, isOverloaded: false, sopRequiredStaff: 2, currentStaffCount: 1 },
  { zoneId: 3, coverage: 90, activityLevel: 'Low', requestsPending: 1, isOverloaded: false, sopRequiredStaff: 1, currentStaffCount: 1 },
  { zoneId: 4, coverage: 65, activityLevel: 'Normal', requestsPending: 8, isOverloaded: false, sopRequiredStaff: 3, currentStaffCount: 1 },
  { zoneId: 5, coverage: 50, activityLevel: 'Intense', requestsPending: 14, isOverloaded: true, sopRequiredStaff: 3, currentStaffCount: 3 },
  { zoneId: 6, coverage: 75, activityLevel: 'Normal', requestsPending: 3, isOverloaded: false, sopRequiredStaff: 1, currentStaffCount: 1 },
];

const ZONE_LABELS: Record<number, string> = {
  1: 'FWD GAL',
  2: 'BUS CAB',
  3: 'MID GAL',
  4: 'ECO 1',
  5: 'ECO 2',
  6: 'AFT GAL'
};

const TaskIcon: React.FC<{ task?: CrewTask; className?: string }> = ({ task, className }) => {
  switch (task) {
    case 'Meal Distribution':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7z" />
          <path d="M18.5 14V2c-2.76 0-5 2.24-5 4v8h2.5v8H21v-8h-2.5z" />
        </svg>
      );
    case 'Medical Case':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20M2 12h20" />
        </svg>
      );
    case 'Safety Check':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case 'Passenger Assist':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    case 'Galley Duty':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
          <line x1="6" y1="1" x2="6" y2="4" />
          <line x1="10" y1="1" x2="10" y2="4" />
          <line x1="14" y1="1" x2="14" y2="4" />
        </svg>
      );
    case 'Rest':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 4v16" />
          <path d="M2 8h18a2 2 0 0 1 2 2v10" />
          <path d="M2 17h20" />
          <path d="M6 8v9" />
        </svg>
      );
    default:
      return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>;
  }
};

const getTaskVisuals = (task?: CrewTask) => {
  switch (task) {
    case 'Medical Case':
      return { color: 'text-red-100', bg: 'bg-red-600', ring: 'ring-red-500/50', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.7)]' };
    case 'Meal Distribution':
      return { color: 'text-sky-100', bg: 'bg-sky-600', ring: 'ring-sky-500/50', glow: 'shadow-[0_0_15px_rgba(14,165,233,0.5)]' };
    case 'Safety Check':
      return { color: 'text-amber-100', bg: 'bg-amber-600', ring: 'ring-amber-500/50', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.5)]' };
    case 'Galley Duty':
      return { color: 'text-slate-100', bg: 'bg-slate-700', ring: 'ring-slate-500/50', glow: 'shadow-[0_0_10px_rgba(71,85,105,0.4)]' };
    case 'Rest':
      return { color: 'text-indigo-100', bg: 'bg-indigo-600', ring: 'ring-indigo-500/50', glow: 'shadow-[0_0_10px_rgba(79,70,229,0.4)]' };
    case 'Passenger Assist':
      return { color: 'text-emerald-100', bg: 'bg-emerald-600', ring: 'ring-emerald-500/50', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.5)]' };
    default:
      return { color: 'text-slate-100', bg: 'bg-slate-800', ring: 'ring-slate-700/50', glow: '' };
  }
};

const CabinStaffingMap: React.FC<{ zones: ZoneStatus[], crew: CrewMember[], latencies: Record<number, number> }> = ({ zones, crew, latencies }) => {
  const [hoveredZone, setHoveredZone] = useState<number | null>(null);

  return (
    <div className="glass p-6 rounded-[40px] border border-slate-700/50 mb-8 bg-slate-950 shadow-2xl overflow-hidden relative min-h-[500px]">
      <div className="flex justify-between items-center mb-6 relative z-20 px-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sky-500/20 rounded-xl border border-sky-500/30">
            <svg className="w-5 h-5 text-sky-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-base font-black uppercase text-slate-200 tracking-widest">A330-300 CRM Dynamic Radar</h3>
            <p className="text-[10px] text-sky-500 font-mono font-bold uppercase tracking-tighter">Real-Time Asset Positioning & Metabolic Health</p>
          </div>
        </div>
        <div className="hidden md:flex gap-6 text-[10px] uppercase font-black text-slate-500">
           <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-sky-500 rounded-full shadow-[0_0_8px_rgba(14,165,233,0.5)]"></div> Normal</span>
           <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div> Medical/Shortage</span>
           <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div> Fatigue Risk</span>
        </div>
      </div>
      
      <div className="relative w-full h-[400px] flex items-center px-4 overflow-x-auto no-scrollbar py-12">
        <div className="relative h-80 min-w-[1100px] xl:min-w-full xl:max-w-7xl mx-auto flex items-stretch border-y-[4px] border-x-[2px] border-sky-400/30 rounded-l-[320px] rounded-r-[60px] bg-slate-900/40 shadow-[0_0_80px_rgba(14,165,233,0.03)] overflow-hidden">
          
          <div className="w-40 bg-gradient-to-r from-sky-400/40 to-slate-900/60 flex items-center justify-center border-r border-sky-400/20 relative">
            <div className="absolute top-1/4 left-12 w-14 h-6 bg-sky-200/10 rounded-sm -skew-x-[25deg] border-l border-white/10 shadow-[0_0_15px_rgba(186,230,253,0.1)]"></div>
            <div className="absolute bottom-1/4 left-12 w-14 h-6 bg-sky-200/10 rounded-sm skew-x-[25deg] border-l border-white/10 shadow-[0_0_15px_rgba(186,230,253,0.1)]"></div>
            <div className="absolute top-1/2 left-4 w-4 h-12 bg-sky-400/20 blur-sm rounded-full -translate-y-1/2"></div>
            <span className="text-[10px] font-black text-sky-200/60 uppercase -rotate-90 tracking-[0.4em] translate-x-4">Flight Deck</span>
          </div>

          <div className="flex-1 flex gap-0">
            {zones.map(z => {
              const delta = z.currentStaffCount - z.sopRequiredStaff;
              const zoneCrew = crew.filter(c => c.zone === z.zoneId);
              const hasMedical = zoneCrew.some(c => c.currentTask === 'Medical Case');
              const latency = latencies[z.zoneId] || 0;
              
              const isBusiness = z.zoneId === 2;
              const isEconomy = z.zoneId === 4 || z.zoneId === 5;

              return (
                <div 
                  key={z.zoneId} 
                  onMouseEnter={() => setHoveredZone(z.zoneId)}
                  onMouseLeave={() => setHoveredZone(null)}
                  className={`flex-1 min-w-[150px] border-r border-white/5 relative flex flex-col justify-center items-center group transition-all duration-500 ${
                    hasMedical ? 'bg-red-950/30' : delta < 0 ? 'bg-red-500/5 shadow-[inset_0_0_20px_rgba(239,68,68,0.05)]' : 'hover:bg-white/[0.01]'
                  }`}
                >
                  {isBusiness && (
                    <>
                      <div className="absolute top-[32%] left-0 right-0 h-6 bg-slate-950/60 z-0 border-y border-white/5 pointer-events-none"></div>
                      <div className="absolute bottom-[32%] left-0 right-0 h-6 bg-slate-950/60 z-0 border-y border-white/5 pointer-events-none"></div>
                    </>
                  )}
                  {isEconomy && (
                    <>
                      <div className="absolute top-[28%] left-0 right-0 h-6 bg-slate-950/60 z-0 border-y border-white/5 pointer-events-none"></div>
                      <div className="absolute bottom-[28%] left-0 right-0 h-6 bg-slate-950/60 z-0 border-y border-white/5 pointer-events-none"></div>
                    </>
                  )}

                  {(z.zoneId === 1 || z.zoneId === 3 || z.zoneId === 6) && (
                    <>
                      <div className="absolute -top-1 left-4 w-8 h-1 bg-amber-500/60 rounded-full z-40"></div>
                      <div className="absolute -bottom-1 left-4 w-8 h-1 bg-amber-500/60 rounded-full z-40"></div>
                    </>
                  )}

                  <div className="absolute inset-0 p-4 flex flex-col justify-between z-0 pointer-events-none">
                    {z.zoneId === 2 ? (
                       <div className="flex-1 flex items-center"><CabinSeatingBlock rows={6} config="2-2-2" color="bg-slate-500" /></div>
                    ) : z.zoneId === 4 || z.zoneId === 5 ? (
                       <div className="flex-1 flex items-center"><CabinSeatingBlock rows={12} config="2-4-2" color="bg-sky-800" /></div>
                    ) : (
                       <div className="flex-1 flex flex-col gap-6 items-center justify-center opacity-10">
                          <div className="grid grid-cols-2 gap-8">
                             <div className="w-10 h-10 border border-white/20 rounded-lg flex items-center justify-center font-black text-[8px] bg-white/5">GAL</div>
                             <div className="w-10 h-10 border border-white/20 rounded-lg flex items-center justify-center font-black text-[8px] bg-white/5">LAV</div>
                          </div>
                       </div>
                    )}
                  </div>

                  {delta !== 0 && (
                    <div className={`absolute top-0 px-2 py-0.5 rounded-full text-[9px] font-black shadow-xl z-50 animate-bounce ${
                      delta < 0 ? 'bg-red-500 text-white border border-red-300' : 'bg-emerald-500 text-white border border-emerald-300'
                    }`}>
                      {delta > 0 ? `+${delta}` : delta}
                    </div>
                  )}

                  <div className="absolute top-3 right-3 px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 backdrop-blur-sm z-30 pointer-events-none flex items-center gap-1.5 group-hover:bg-white/10 transition-colors">
                    <div className={`w-1 h-1 rounded-full ${z.currentStaffCount >= z.sopRequiredStaff ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></div>
                    <span className="text-[9px] font-black text-slate-400 font-mono tracking-tighter">
                      {z.currentStaffCount}/{z.sopRequiredStaff}
                    </span>
                  </div>

                  {hoveredZone === z.zoneId && (
                    <div className="absolute top-4 z-50 glass bg-slate-900/95 px-4 py-3 rounded-2xl border border-sky-500/40 shadow-2xl animate-fadeIn pointer-events-none flex flex-col gap-1.5 min-w-[140px]">
                      <span className="text-[8px] font-black text-sky-400 uppercase tracking-[0.2em] mb-1">CRM Analytics Z{z.zoneId}</span>
                      <div className="flex justify-between items-center text-[10px] font-mono font-black">
                        <span className="text-slate-400">Latency</span>
                        <span className={latency > 800 ? 'text-red-400' : latency > 500 ? 'text-amber-400' : 'text-emerald-400'}>{latency}ms</span>
                      </div>
                    </div>
                  )}

                  <div className="relative z-30 flex gap-5 flex-wrap justify-center items-center max-w-[95%] min-h-[140px]">
                    {zoneCrew.map(c => {
                      const visuals = getTaskVisuals(c.currentTask);
                      return (
                        <div key={c.id} className="relative group/crew transition-transform duration-300 hover:scale-110">
                          {/* Main Avatar Container with Dynamic Task Glow */}
                          <div className={`w-14 h-14 rounded-full p-1 border-2 transition-all duration-700 relative ${visuals.ring} ${visuals.glow} ${c.currentTask === 'Medical Case' ? 'animate-pulse scale-105' : ''}`}>
                            <div className={`w-full h-full rounded-full flex items-center justify-center font-black text-sm relative overflow-hidden glass shadow-inner ${
                              c.currentTask === 'Medical Case' ? 'bg-red-600/40' : 'bg-slate-800/60'
                            }`}>
                              <span className={`transition-opacity duration-300 ${c.currentTask === 'Medical Case' ? 'text-white' : 'text-slate-200'} group-hover/crew:opacity-20`}>
                                {c.name.charAt(0)}
                              </span>
                              
                              {/* Integrated Task Icon - Centered on Hover for extreme legibility */}
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/crew:opacity-100 transition-opacity duration-300">
                                <TaskIcon task={c.currentTask} className="w-7 h-7 text-white drop-shadow-lg" />
                              </div>

                              {/* Persistent Task Badge - Modern Liquid Style */}
                              <div className={`absolute -bottom-1 -right-1 p-1.5 rounded-full border border-slate-950 shadow-2xl transition-all ${visuals.bg} ${visuals.color} ring-2 ring-slate-900/50`}>
                                 <TaskIcon task={c.currentTask} className="w-4 h-4" />
                              </div>
                            </div>
                          </div>
                          
                          {/* Stress Indicator Ping */}
                          {c.stress === StressLevel.HIGH && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-slate-900 animate-ping z-10"></div>
                          )}
                          
                          {/* Name Label on Hover */}
                          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover/crew:opacity-100 transition-all duration-300 pointer-events-none">
                             <span className="text-[8px] font-black text-sky-400 bg-slate-900/80 px-2 py-0.5 rounded-full border border-sky-400/20 shadow-xl uppercase tracking-widest">{c.name}</span>
                          </div>
                        </div>
                      );
                    })}
                    {delta < 0 && Array.from({ length: Math.abs(delta) }).map((_, i) => (
                      <div key={`req-${i}`} className="w-14 h-14 rounded-full border-2 border-dashed border-red-500/30 flex items-center justify-center bg-red-500/5 transition-colors hover:bg-red-500/10">
                         <span className="text-[8px] font-black text-red-500/50 uppercase tracking-tighter text-center leading-none px-2">SOP REQ</span>
                      </div>
                    ))}
                  </div>

                  <div className="absolute bottom-3 inset-x-0 text-center pointer-events-none">
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-900/90 px-3 py-1 rounded-full border border-white/10 shadow-lg">{ZONE_LABELS[z.zoneId]}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="w-40 bg-gradient-to-l from-sky-500/60 to-slate-900/60 rounded-r-[60px] flex items-center justify-center relative border-l border-white/20 overflow-hidden shadow-[inset_20px_0_40px_rgba(0,0,0,0.4)]">
             <div className="absolute top-0 right-10 h-full w-4 bg-white/5 border-l border-white/10"></div>
             <span className="text-[11px] font-black text-sky-100/40 uppercase rotate-90 tracking-[0.5em] whitespace-nowrap">Aft Bulkhead</span>
          </div>
        </div>
      </div>
      
      {/* Refined Legend Section */}
      <div className="mt-4 px-6 flex flex-wrap justify-center gap-6 opacity-80">
        {[
          { label: 'Galley Ops', task: 'Galley Duty' as CrewTask, color: 'text-slate-400' },
          { label: 'Meal Service', task: 'Meal Distribution' as CrewTask, color: 'text-sky-400' },
          { label: 'Safety Check', task: 'Safety Check' as CrewTask, color: 'text-amber-400' },
          { label: 'Passenger Assist', task: 'Passenger Assist' as CrewTask, color: 'text-emerald-400' },
          { label: 'Medical Alert', task: 'Medical Case' as CrewTask, color: 'text-red-400' },
          { label: 'Rest Period', task: 'Rest' as CrewTask, color: 'text-indigo-400' },
        ].map((item, i) => {
           const v = getTaskVisuals(item.task);
           return (
            <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/40 border border-white/5 hover:border-white/20 transition-all cursor-default group">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${v.bg} shadow-lg`}>
                <TaskIcon task={item.task} className="w-3.5 h-3.5 text-white" />
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest ${item.color}`}>{item.label}</span>
            </div>
           );
        })}
      </div>
    </div>
  );
};

const StaffingDiscrepancyMonitor: React.FC<{ zones: ZoneStatus[] }> = ({ zones }) => {
  const discrepancies = zones.filter(z => z.currentStaffCount !== z.sopRequiredStaff);
  const isCompliant = discrepancies.length === 0;

  return (
    <div className={`glass p-6 rounded-[32px] border transition-all duration-500 mb-8 ${
      isCompliant ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5 shadow-[0_0_30px_rgba(239,68,68,0.05)]'
    }`}>
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col gap-1">
          <h3 className="text-xs font-black uppercase tracking-[0.25em] text-slate-400 flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${isCompliant ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`}></div>
            A330 SOP Deployment Monitor
          </h3>
          <p className="text-[10px] text-slate-500 font-medium">Compliance Check against wide-body staffing minimums</p>
        </div>
        <span className={`text-[10px] font-black tracking-widest px-3 py-1 rounded-full border ${isCompliant ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse'}`}>
          {isCompliant ? 'FULLY COMPLIANT' : 'DISCREPANCY DETECTED'}
        </span>
      </div>

      <div className="space-y-4">
        {isCompliant ? (
          <div className="flex items-center gap-4 p-4 bg-slate-900/40 rounded-2xl border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            </div>
            <p className="text-sm text-slate-300 font-medium leading-relaxed">
              Standard Operating Procedure (SOP) met. Staffing levels align with current flight phase and cabin safety requirements.
            </p>
          </div>
        ) : (
          discrepancies.map(z => {
            const delta = z.currentStaffCount - z.sopRequiredStaff;
            const isShort = delta < 0;
            const recommendation = isShort 
              ? `${ZONE_LABELS[z.zoneId]} requires ${Math.abs(delta)} additional crew member${Math.abs(delta) > 1 ? 's' : ''} for optimal service flow.`
              : `${ZONE_LABELS[z.zoneId]} has ${delta} surplus crew member${delta > 1 ? 's' : ''} available for redistribution to high-demand zones.`;

            return (
              <div key={z.zoneId} className={`flex flex-col gap-4 p-5 rounded-3xl border transition-all duration-300 hover:scale-[1.01] ${
                isShort ? 'bg-red-500/10 border-red-500/30 shadow-[0_4px_20px_rgba(239,68,68,0.1)]' : 'bg-amber-500/10 border-amber-500/30 shadow-[0_4px_20px_rgba(245,158,11,0.1)]'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-lg ${
                      isShort ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'
                    }`}>
                      Z0{z.zoneId}
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-100 uppercase tracking-tight">{ZONE_LABELS[z.zoneId]}</div>
                      <div className="text-[10px] text-slate-500 font-mono font-bold mt-0.5">MIN: {z.sopRequiredStaff} | CUR: {z.currentStaffCount}</div>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <div className={`text-xl font-black italic tracking-tighter ${isShort ? 'text-red-400' : 'text-amber-400'}`}>
                      {isShort ? `${delta} SHORT` : `+${delta} SURPLUS`}
                    </div>
                    <div className="text-[9px] uppercase font-black tracking-widest text-slate-500 mt-1">
                      {isShort ? 'High Workload Risk' : 'Redundant Capacity'}
                    </div>
                  </div>
                </div>
                
                <div className={`flex items-start gap-3 p-3 rounded-xl border-l-4 shadow-inner ${
                  isShort ? 'bg-red-950/40 border-l-red-500 text-red-100' : 'bg-amber-950/40 border-l-amber-500 text-amber-100'
                }`}>
                  <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Strategic CRM Action</span>
                    <p className="text-xs font-bold leading-relaxed">{recommendation}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const FatigueMeter: React.FC<{ score: number }> = ({ score }) => {
  return (
    <div className="w-full mt-3">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Metabolic Exhaustion</span>
        <span className={`text-[10px] font-mono font-bold ${score > 75 ? 'text-red-400' : score > 40 ? 'text-amber-400' : 'text-green-500'}`}>
          {score}%
        </span>
      </div>
      <div className="h-1.5 w-full bg-slate-800/50 rounded-full overflow-hidden border border-white/5 shadow-inner">
        <div 
          className="h-full transition-all duration-1000 relative"
          style={{ 
            width: `${score}%`,
            background: `linear-gradient(to right, #22c55e, #eab308, #ef4444)`
          }}
        >
          {score > 75 && <div className="absolute inset-0 bg-white/30 animate-pulse"></div>}
        </div>
      </div>
    </div>
  );
};

const FatigueStatusIndicator: React.FC<{ score: number }> = ({ score }) => {
  const isCritical = score > 75;
  const isModerate = score > 40;
  
  const config = isCritical 
    ? { color: 'text-red-400', bg: 'bg-red-400/10', label: 'Critical' } 
    : isModerate 
      ? { color: 'text-amber-400', bg: 'bg-amber-400/10', label: 'Moderate' } 
      : { color: 'text-green-400', bg: 'bg-green-400/10', label: 'Normal' };

  return (
    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-white/5 ${config.bg} ${isCritical ? 'animate-pulse' : ''}`}>
       <div className={`w-1.5 h-1.5 rounded-full ${isCritical ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : isModerate ? 'bg-amber-500' : 'bg-green-500'}`}></div>
       <span className={`text-[8px] font-black uppercase tracking-widest ${config.color}`}>{config.label} Fatigue</span>
    </div>
  );
};

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};

const LiveDashboard: React.FC<LiveDashboardProps> = ({ activeAlert, onClearAlert }) => {
  const [crew, setCrew] = useState<CrewMember[]>(MOCK_CREW);
  const [zones, setZones] = useState<ZoneStatus[]>(INITIAL_ZONES);
  const [trends, setTrends] = useState<any[]>([]);
  const [latencies, setLatencies] = useState<Record<number, number>>({});
  const [aiInsight, setAiInsight] = useState<string>("Initializing Wide-Body CRM Engine...");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const notifiedFatigueIds = useRef<Set<string>>(new Set());
  const audioContext = useRef<AudioContext | null>(null);

  const playSoftChime = () => {
    try {
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContext.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.5);
    } catch (e) { console.warn("Audio alert failed:", e); }
  };

  const playHiChime = (count: number = 1) => {
    try {
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContext.current;
      const playOne = (timeOffset: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1480, ctx.currentTime + timeOffset);
        gain.gain.setValueAtTime(0, ctx.currentTime + timeOffset);
        gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + timeOffset + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + timeOffset + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + timeOffset);
        osc.stop(ctx.currentTime + timeOffset + 0.8);
      };
      for(let i = 0; i < count; i++) { playOne(i * 0.8); }
    } catch (e) { console.warn("Hi-Chime alert failed:", e); }
  };

  useEffect(() => {
    if (activeAlert) playHiChime(3);
  }, [activeAlert]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTrends(prev => {
        const newPoint = {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          avgStress: Math.random() * 40 + 10,
          coordination: Math.random() * 30 + 70,
        };
        return [...prev.slice(-14), newPoint];
      });

      const newLatencies: Record<number, number> = {};
      zones.forEach(z => {
        newLatencies[z.zoneId] = Math.floor(Math.random() * 600 + 200);
        if (z.isOverloaded) newLatencies[z.zoneId] += 300;
      });
      setLatencies(newLatencies);

      setCrew(prev => {
        const updated = prev.map(c => {
          let fatigueChange = 0;
          if (Math.random() > 0.8) fatigueChange = 1;
          if (c.stress === StressLevel.HIGH) fatigueChange = 2;
          const newFatigue = Math.min(100, c.fatigueScore + fatigueChange);
          
          if (newFatigue > 85 && !notifiedFatigueIds.current.has(c.id)) {
            playSoftChime();
            notifiedFatigueIds.current.add(c.id);
          } else if (newFatigue <= 85) {
            notifiedFatigueIds.current.delete(c.id);
          }

          let currentTask = c.currentTask;
          let taskDuration = c.currentTaskDuration + 2;
          if (Math.random() > 0.98) {
             const tasks: CrewTask[] = ['Meal Distribution', 'Safety Check', 'Galley Duty', 'Passenger Assist'];
             currentTask = tasks[Math.floor(Math.random() * tasks.length)];
             taskDuration = 0;
          }

          if (Math.random() > 0.95) {
            const newZone = Math.floor(Math.random() * 6) + 1;
            return { ...c, zone: newZone, currentTaskTime: 0, currentTask, currentTaskDuration: taskDuration, fatigueScore: newFatigue };
          }
          return { ...c, currentTaskTime: c.currentTaskTime + 2, currentTask, currentTaskDuration: taskDuration, fatigueScore: newFatigue };
        });
        return updated;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [zones]);

  useEffect(() => {
    setZones(prev => prev.map(z => {
      const currentStaff = crew.filter(c => c.zone === z.zoneId).length;
      const isOverloaded = currentStaff < z.sopRequiredStaff;
      return { 
        ...z, 
        currentStaffCount: currentStaff,
        isOverloaded,
        coverage: Math.min(100, Math.max(0, (currentStaff / z.sopRequiredStaff) * 100 - (z.requestsPending * 2)))
      };
    }));
  }, [crew]);

  const triggerAnalysis = async () => {
    setIsAnalyzing(true);
    const summary = crew.map(c => `${c.name} (${c.position}): Stress=${c.stress}, Task=${c.currentTask}, Zone=${c.zone}`).join('\n');
    const spatial = zones.map(z => `Zone ${z.zoneId}: Staff=${z.currentStaffCount}/${z.sopRequiredStaff}, Req=${z.requestsPending}`).join('\n');
    const insight = await analyzeCrewDynamics(summary, spatial, "Long-Haul Cruise (A330)");
    setAiInsight(insight);
    setIsAnalyzing(false);
  };

  const getStressColor = (level: StressLevel) => {
    switch (level) {
      case StressLevel.BASELINE: return 'text-green-400 bg-green-400/10 border-green-400/20';
      case StressLevel.ELEVATED: return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case StressLevel.HIGH: return 'text-red-400 bg-red-400/10 border-red-400/20';
    }
  };

  const medicalActive = crew.some(c => c.currentTask === 'Medical Case') || activeAlert !== null;

  return (
    <div className="flex flex-col gap-8 animate-fadeIn pb-12 relative">
      {activeAlert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md glass bg-red-950/40 border-2 border-red-500 rounded-[40px] p-8 shadow-[0_0_100px_rgba(239,68,68,0.3)] animate-bounceScale">
            <div className="flex flex-col items-center text-center gap-6">
              <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center shadow-2xl animate-pulse">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="space-y-1">
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Medical Alert</h2>
                <div className="px-3 py-1 bg-red-600 rounded-full inline-block text-[10px] font-black tracking-widest text-white uppercase shadow-lg">
                  Category: {activeAlert.medicalType || 'Detected'}
                </div>
              </div>
              <div className="w-full space-y-4 text-left">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-slate-900/60 rounded-2xl border border-red-500/20">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Assigned Crew</span>
                    <span className="text-sm font-bold text-white">{activeAlert.crewName}</span>
                  </div>
                  <div className="p-4 bg-slate-900/60 rounded-2xl border border-red-500/20">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Location</span>
                    <span className="text-sm font-black text-red-400 tracking-widest">{activeAlert.seatNumber}</span>
                  </div>
                </div>
                <div className="p-5 bg-slate-900/40 rounded-3xl border border-red-500/10">
                  <span className="text-[10px] font-black text-red-400 uppercase tracking-widest block mb-3">Required SOP Steps</span>
                  <div className="space-y-2">
                    {activeAlert.sopBrief?.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-slate-300">
                        <div className="w-4 h-4 rounded-full border border-red-500/40 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[8px] font-black text-red-400">{idx + 1}</span>
                        </div>
                        <p className="text-[11px] font-medium leading-tight">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="w-full grid grid-cols-2 gap-4">
                <button onClick={onClearAlert} className="py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black uppercase text-xs rounded-2xl transition-all tracking-widest">Dismiss</button>
                <button onClick={onClearAlert} className="py-4 bg-red-600 hover:bg-red-500 text-white font-black uppercase text-xs rounded-2xl transition-all tracking-widest shadow-lg shadow-red-500/20">Acknowledge</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <div className="flex items-center gap-3">
             <div className="w-1.5 h-6 bg-purple-500 rounded-full shadow-[0_0_12px_rgba(168,85,247,0.4)]"></div>
             <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 italic">A330 Dynamic CRM Asset Deployment Radar</h2>
          </div>
          <button 
            onClick={triggerAnalysis}
            disabled={isAnalyzing}
            className="group relative text-[10px] bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 px-6 py-2.5 rounded-full transition-all flex items-center gap-3 uppercase font-black tracking-widest active:scale-95 disabled:opacity-50 overflow-hidden shadow-2xl"
          >
            {isAnalyzing ? <div className="w-3 h-3 border-2 border-sky-500/50 border-t-sky-500 rounded-full animate-spin"></div> : <div className="w-2 h-2 bg-sky-500 rounded-full group-hover:animate-ping"></div>}
            <span className="relative z-10">Generate CRM Briefing</span>
          </button>
        </div>
        <CabinStaffingMap zones={zones} crew={crew} latencies={latencies} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <div className="w-1 h-4 bg-sky-500 rounded-full"></div>Metabolic & Stress Status
            </h2>
            {medicalActive && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/20 border border-red-500 animate-pulse">
                 <TaskIcon task="Medical Case" className="w-2.5 h-2.5 text-red-500" />
                 <span className="text-[9px] font-black text-red-500 uppercase">MEDICAL EMERGENCY</span>
              </div>
            )}
          </div>
          <div className="grid gap-5">
            {crew.map((member) => {
              const isCriticalFatigue = member.fatigueScore > 75;
              const isHighAlert = member.fatigueScore > 85;
              const isMedical = member.currentTask === 'Medical Case' || (activeAlert?.crewName === member.name);
              const visuals = getTaskVisuals(member.currentTask);
              return (
                <div key={member.id} className={`glass p-5 rounded-[32px] border transition-all duration-700 relative group ${isMedical ? 'border-red-500 bg-red-500/10 shadow-[0_0_30px_rgba(239,68,68,0.15)]' : isHighAlert ? 'border-red-600 bg-red-600/5 ring-2 ring-red-600/30' : isCriticalFatigue ? 'border-red-500/40 bg-red-500/5 ring-1 ring-red-500/20' : 'border-slate-800/80 hover:bg-slate-800/10 hover:border-slate-700'}`}>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="flex gap-4 items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg relative transition-all duration-700 ${isMedical ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]' : isCriticalFatigue ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-400'}`}>
                        {member.name.charAt(0)}
                        <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full border border-slate-900 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${visuals.bg} ${visuals.color}`}>
                          <TaskIcon task={member.currentTask} className="w-4 h-4" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="font-bold text-slate-100">{member.name}</div>
                          <FatigueStatusIndicator score={member.fatigueScore} />
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mt-0.5">{member.position} • {isMedical ? 'Medical Assist' : member.currentTask}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] px-2 py-1 rounded-md border font-black uppercase tracking-widest shadow-sm ${getStressColor(member.stress)}`}>{member.stress}</span>
                    </div>
                  </div>
                  <FatigueMeter score={member.fatigueScore} />
                  <div className="mt-4 flex justify-between items-center pt-4 border-t border-white/5 relative z-10">
                     <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-600 uppercase">Task Engagement</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-mono font-bold text-slate-400">{formatDuration(member.currentTaskDuration)}</span>
                          <div className={`h-1 flex-1 min-w-[60px] rounded-full bg-slate-800`}><div className={`h-full rounded-full ${visuals.bg} ${visuals.glow}`} style={{ width: isMedical ? '100%' : Math.min(100, (member.currentTaskDuration / 1200) * 100) + '%' }}></div></div>
                        </div>
                     </div>
                     <div className="text-right flex flex-col items-end">
                        <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">Zone {member.zone}</div>
                        <div className="text-[8px] text-slate-600 font-black uppercase mt-0.5">Dwell: {Math.floor(member.currentTaskTime / 60)}m</div>
                     </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="lg:col-span-2 space-y-8">
          <StaffingDiscrepancyMonitor zones={zones} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {zones.map(zone => (
              <div key={zone.zoneId} className={`glass p-6 rounded-[32px] border transition-all duration-500 relative overflow-hidden group ${zone.isOverloaded ? 'border-red-500/50 bg-red-500/5 shadow-[0_0_20px_rgba(239,68,68,0.05)]' : 'border-slate-800/80 hover:bg-slate-800/10 hover:border-slate-700'}`}>
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><span className="text-5xl font-black italic text-slate-400 uppercase select-none">{ZONE_LABELS[zone.zoneId]}</span></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">Asset Z0{zone.zoneId} Profile</span>
                      <h3 className="text-2xl font-black flex items-center gap-2 mt-1">{zone.activityLevel} Activity {zone.isOverloaded && <span className="text-red-500 text-sm animate-pulse">⚠</span>}</h3>
                    </div>
                    <div className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-widest border ${zone.coverage < 60 ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>{Math.round(zone.coverage)}% FLOW</div>
                  </div>
                  <div className="mb-6 bg-slate-950/60 p-4 rounded-2xl border border-white/5 shadow-inner">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">SOP Minimum Staffing</span>
                      <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-md ${zone.currentStaffCount < zone.sopRequiredStaff ? 'text-red-400 bg-red-400/10' : 'text-sky-400 bg-sky-400/10'}`}>{zone.currentStaffCount} / {zone.sopRequiredStaff}</span>
                    </div>
                    <div className="flex gap-2 h-5">
                      {Array.from({ length: Math.max(zone.sopRequiredStaff, zone.currentStaffCount) }).map((_, i) => (
                        <div key={i} className={`flex-1 rounded-md border transition-all duration-700 ${i < zone.currentStaffCount ? 'bg-sky-600 border-sky-400/50 shadow-[0_0_12px_rgba(14,165,233,0.3)]' : i < zone.sopRequiredStaff ? 'bg-transparent border-red-500/50 border-dashed animate-pulse' : 'bg-slate-800 border-slate-700 opacity-50'}`}></div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-end text-[11px] font-mono uppercase tracking-tighter">
                    <div className="flex flex-col"><span className="text-slate-500 text-[9px] font-black uppercase mb-0.5">Cabin Call Queue</span><div className="text-slate-300 font-bold">Pending: <span className="text-sky-400 font-black">{zone.requestsPending}</span></div></div>
                    {zone.isOverloaded && <div className="text-red-400 font-black text-right">Action Required</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="glass p-8 rounded-[40px] border-l-4 border-l-sky-500 bg-gradient-to-br from-sky-500/5 to-transparent shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5"><svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg></div>
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="p-3 bg-sky-600 rounded-2xl shadow-xl shadow-sky-500/20"><svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg></div>
              <div><h3 className="text-lg font-black text-slate-100 tracking-tight italic">AI Strategic Insights</h3><p className="text-[10px] text-sky-400 uppercase font-black tracking-[0.3em] -mt-1">Wide-Body Ops Briefing</p></div>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-medium relative z-10">{aiInsight}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const CabinSeatingBlock: React.FC<{ rows: number, config: string, color: string }> = ({ rows, config, color }) => {
  const parts = config.split('-');
  return (
    <div className="flex flex-col gap-1.5 w-full opacity-30 group-hover:opacity-50 transition-opacity z-10">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 justify-center w-full">
          {parts.map((p, pIdx) => (
            <div key={pIdx} className="flex gap-1">
              {Array.from({ length: parseInt(p) }).map((_, s) => (
                <div key={s} className={`w-2.5 h-3 rounded-t-sm border border-white/10 ${color} shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] relative`}>
                   <div className="absolute top-0.5 left-0.5 right-0.5 h-0.5 bg-black/20 rounded-t-[1px]"></div>
                   <div className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-black/40 rounded-b-[1px]"></div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default LiveDashboard;
