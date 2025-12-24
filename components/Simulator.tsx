
import React, { useState, useRef, useEffect } from 'react';
import { analyzeVoiceStress } from '../services/geminiService';
import { EmergencyAlert } from '../types';

interface SimulatorProps {
  onEmergencyDetected?: (alert: EmergencyAlert) => void;
}

const Simulator: React.FC<SimulatorProps> = ({ onEmergencyDetected }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [testPassed, setTestPassed] = useState<boolean | null>(null);
  const [waveform, setWaveform] = useState<number[]>(new Array(50).fill(2));
  const [analysis, setAnalysis] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const requestRef = useRef<number>();

  const runDiagnostic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Just testing
      setTestPassed(true);
      setTimeout(() => setTestPassed(null), 3000);
    } catch (err) {
      setTestPassed(false);
      console.error("Diagnostic failed", err);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Setup Visualizer
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyzerRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyzerRef.current);
      analyzerRef.current.fftSize = 64;
      
      // Setup MediaRecorder for Analysis
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      setIsRecording(true);
      setAnalysis(null);
      mediaRecorder.start();
      animate();
    } catch (err) {
      console.error("Microphone access denied", err);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const processAudio = async (blob: Blob) => {
    setIsAnalyzing(true);
    try {
      const base64 = await blobToBase64(blob);
      const result = await analyzeVoiceStress(base64, 'audio/webm');
      setAnalysis(result);

      // Extract Emergency Data if present
      const emergencyRegex = /\[EMERGENCY_DATA\]([\s\S]*?)\[\/EMERGENCY_DATA\]/;
      const match = result.match(emergencyRegex);
      
      if (onEmergencyDetected && (result.toLowerCase().includes('medical') || result.toLowerCase().includes('emergency') || match)) {
        let medicalType = 'Unspecified';
        let sopBrief = ['Assess CAB', 'Notify Flight Deck', 'Request Medical Volunteer'];

        if (match) {
          const content = match[1];
          const typeMatch = content.match(/Type:\s*(.*)/);
          const sopMatch = content.match(/SOP:\s*(.*)/);
          
          if (typeMatch) medicalType = typeMatch[1].trim();
          if (sopMatch) sopBrief = sopMatch[1].split(';').map(s => s.trim());
        }

        onEmergencyDetected({
          id: Math.random().toString(36).substr(2, 9),
          type: 'Medical',
          medicalType,
          sopBrief,
          seatNumber: '42K', // In a real system, this would be derived from sensor proximity
          crewName: 'David W.',
          timestamp: Date.now()
        });
      }
    } catch (err) {
      setAnalysis("Analysis error: System was unable to process the acoustic vector.");
    } finally {
      setIsAnalyzing(false);
      if (audioContextRef.current) audioContextRef.current.close();
    }
  };

  const animate = () => {
    if (!analyzerRef.current) return;
    const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount);
    analyzerRef.current.getByteFrequencyData(dataArray);
    
    const normalizedData = Array.from(dataArray).map(val => Math.max(2, val / 4));
    setWaveform(normalizedData);
    requestRef.current = requestAnimationFrame(animate);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Voice Analysis Simulator</h2>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto italic">
          Experience real-time tonal assessment. CloudLog AI detects stress through non-lexical markers, helping crew members maintain composure during critical flight phases.
        </p>
        <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest border border-emerald-500/20 bg-emerald-500/5 px-4 py-1 rounded-full inline-block">
          Prototype: Say "Passenger has chest pain in 42K" to trigger medical alert
        </div>
      </div>

      <div className="glass p-8 md:p-12 rounded-[40px] border border-slate-700/50 flex flex-col items-center relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px]"></div>

        <div className="h-24 flex items-center justify-center gap-1.5 w-full mb-12">
          {waveform.map((val, i) => (
            <div 
              key={i} 
              className={`w-1 md:w-2 rounded-full transition-all duration-75 ${isRecording ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]' : 'bg-slate-800'}`}
              style={{ height: `${val}%` }}
            ></div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center items-center">
          <button 
            onClick={runDiagnostic}
            disabled={isRecording || isAnalyzing}
            className={`px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.2em] transition-all border flex items-center gap-2 ${
              testPassed === true ? 'bg-green-500/20 border-green-500 text-green-400' :
              testPassed === false ? 'bg-red-500/20 border-red-500 text-red-400' :
              'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${testPassed === true ? 'bg-green-500' : testPassed === false ? 'bg-red-500' : 'bg-slate-500'}`}></div>
            {testPassed === true ? 'Diagnostic Passed' : testPassed === false ? 'Diagnostic Failed' : 'Run Diagnostic Test'}
          </button>

          {!isRecording ? (
            <button 
              onClick={startRecording}
              disabled={isAnalyzing}
              className="group relative px-10 py-4 bg-blue-600 rounded-full font-black uppercase text-sm tracking-widest hover:bg-blue-500 transition-all active:scale-95 shadow-xl shadow-blue-500/20 disabled:opacity-50"
            >
              Start Monitoring Audio
              <div className="absolute -inset-1 bg-blue-500 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
            </button>
          ) : (
            <button 
              onClick={stopRecording}
              className="px-10 py-4 bg-red-600 rounded-full font-black uppercase text-sm tracking-widest hover:bg-red-500 transition-all active:scale-95 animate-pulse shadow-xl shadow-red-500/20"
            >
              Stop & Analyze Tone
            </button>
          )}
        </div>

        {isAnalyzing && (
          <div className="mt-12 flex flex-col items-center gap-4">
             <div className="flex gap-1.5">
               <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
               <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
               <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
             </div>
             <p className="text-[10px] uppercase font-black tracking-[0.3em] text-blue-400">Extracting Acoustic Vectors</p>
          </div>
        )}

        {analysis && (
          <div className="mt-12 w-full glass bg-slate-950/60 p-8 rounded-3xl border border-blue-500/30 animate-slideUp shadow-2xl relative">
            <div className="absolute top-4 right-4 text-[8px] font-black text-blue-500/40 uppercase tracking-widest">Acoustic Signal Processing v1.2</div>
            <h4 className="text-[10px] font-black uppercase text-blue-400 mb-6 tracking-[0.4em] flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
              CRM Tonal Diagnostic Report
            </h4>
            <div className="prose prose-invert prose-sm max-w-none">
              <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-900/40 p-4 rounded-xl border border-white/5">
                {analysis}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Simulator;
