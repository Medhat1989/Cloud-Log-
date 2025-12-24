
import React from 'react';

const SystemInfo: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-fadeIn pb-20">
      <section className="space-y-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">System Philosophy & Just Culture</h2>
        <p className="text-slate-300 leading-relaxed">
          CloudLog AI is not a surveillance tool. It is a **Team Resilience Radar**. Built on the foundations of 
          **Crew Resource Management (CRM)**, it identifies when systemic pressures exceed human cognitive 
          capacity, allowing for real-time support rather than retrospective punishment.
        </p>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
            <h3 className="font-bold text-emerald-400 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Supportive (Yes)
            </h3>
            <ul className="text-sm text-slate-400 space-y-2">
              <li>• Real-time workload redistribution</li>
              <li>• Fatigue-risk identification</li>
              <li>• Spatial bottleneck detection</li>
              <li>• Anonymized systemic feedback</li>
            </ul>
          </div>
          <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20">
            <h3 className="font-bold text-red-400 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Evaluative (No)
            </h3>
            <ul className="text-sm text-slate-400 space-y-2">
              <li>• Individual performance scoring</li>
              <li>• Precision GPS/Surveillance</li>
              <li>• Lexical (word) surveillance</li>
              <li>• Disciplinary record integration</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Spatial Tracking & Privacy</h2>
        <div className="glass p-8 rounded-3xl border border-slate-700/50 space-y-4 text-sm text-slate-300">
          <p>
            CloudLog AI utilizes **Zone-Level Beacons** (e.g., Bluetooth LE anchors in the galleys and cabin bulkheads) 
            rather than high-precision GPS or visual surveillance. This ensures the system only knows 
            *which* zone a crew member is supporting, not their exact physical posture or identity-linked movements.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
              <div className="text-blue-400 font-bold mb-1">Overload Detection</div>
              <p className="text-[10px] opacity-70">Identifies when cabin demand in Zone 4 exceeds the capabilities of a single crew member.</p>
            </div>
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
              <div className="text-blue-400 font-bold mb-1">Coverage Gaps</div>
              <p className="text-[10px] opacity-70">Detects when service areas are left unattended during high-workload phases like Descent.</p>
            </div>
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
              <div className="text-blue-400 font-bold mb-1">SOP Guardrails</div>
              <p className="text-[10px] opacity-70">Automated check-ins if crew members remain in high-stress zones for extended durations.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold">V1 Architecture</h2>
        <div className="glass p-8 rounded-3xl border border-slate-700/50">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center font-mono text-xs text-blue-400">01</div>
                <div>
                  <h4 className="font-bold">Acoustic Feature Extraction</h4>
                  <p className="text-xs text-slate-500">Processing MFCCs and Pitch at the interphone level.</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center font-mono text-xs text-blue-400">02</div>
                <div>
                  <h4 className="font-bold">Spatial Beacon Sync</h4>
                  <p className="text-xs text-slate-500">Matching crew proximity signals to zone-level SOP maps.</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center font-mono text-xs text-blue-400">03</div>
                <div>
                  <h4 className="font-bold">Contextual Smoothing</h4>
                  <p className="text-xs text-slate-500">Filtering "burst" noise and temporary transitions for accuracy.</p>
                </div>
              </div>
            </div>
            <div className="w-full md:w-64 aspect-square bg-slate-900 rounded-2xl border border-slate-700 flex items-center justify-center p-8">
              <svg className="w-full h-full text-blue-500/20" viewBox="0 0 200 200" fill="none">
                <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                <path d="M100 20V180M20 100H180" stroke="currentColor" strokeWidth="1" />
                <rect x="70" y="70" width="60" height="60" rx="8" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" />
                <text x="100" y="105" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">AI CORE</text>
              </svg>
            </div>
          </div>
        </div>
      </section>

      <div className="p-8 bg-blue-600 rounded-3xl text-center space-y-4">
        <h3 className="text-2xl font-bold">Ready for Pilot Phase?</h3>
        <p className="text-blue-100 opacity-80 max-w-xl mx-auto">
          CloudLog AI represents a shift from surveillance to support. We are currently inviting 
          forward-thinking airlines to participate in our anonymized CRM-enhancement trials.
        </p>
        <button className="px-8 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-slate-100 transition-all">
          Request Technical Briefing
        </button>
      </div>
    </div>
  );
};

export default SystemInfo;
