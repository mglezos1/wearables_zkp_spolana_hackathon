"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Generator() {
  const [data, setData] = useState({
    heartbeat: 0,
    systolic: 0,
    diastolic: 0,
    stress: 0,
  });

  const [animating, setAnimating] = useState(false);
  const [connected, setConnected] = useState(false);

  const handleAction = () => {
    if (connected) {
      setConnected(false);
      return;
    }
    
    setAnimating(true);
    setTimeout(() => {
      setData({
        heartbeat: Math.floor(Math.random() * (115 - 60 + 1) + 60),
        systolic: Math.floor(Math.random() * (150 - 100 + 1) + 100),
        diastolic: Math.floor(Math.random() * (90 - 65 + 1) + 65),
        stress: Math.floor(Math.random() * 101),
      });
      setConnected(true);
      setAnimating(false);
    }, 1500); // 1.5s simulated pairing delay for smartwatch
  };

  const downloadJSON = () => {
    const payload = JSON.stringify({ 
      heart_rate: data.heartbeat,
      systolic: data.systolic,
      diastolic: data.diastolic,
      stress: data.stress 
    }, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wearable_output_${data.heartbeat}bpm.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500 opacity-10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-500 opacity-10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Navigation App Map */}
      <div className="absolute top-6 left-8 flex flex-col gap-3 z-50">
        <Link href="/" className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 font-bold py-2 px-6 rounded-full shadow-lg transition-colors border-2 border-slate-600 flex items-center gap-2 text-sm w-max">
           ← View ZK Dashboard
        </Link>
        <Link href="/insurer" className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-purple-400 font-bold py-2 px-6 rounded-full shadow-lg transition-colors border-2 border-slate-600 flex items-center gap-2 text-sm w-max">
           👨‍💼 View Insurer Portal
        </Link>
      </div>

      <div className="max-w-2xl w-full bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] p-10 space-y-10 z-10 min-h-[400px] flex flex-col justify-center">
        <div className="text-center space-y-2 mb-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Smartwatch Telemetry
          </h1>
          <p className="text-slate-400 text-sm">
            Generate synthetic wearable metrics mimicking Apple Health telemetry and pipe them out physically as JSON objects for local Proof computation!
          </p>
        </div>

        {connected ? (
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-opacity duration-300 ${animating ? "opacity-30" : "opacity-100"}`}>
            
            {/* Heart Rate Animated Tracker */}
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700 shadow-inner flex flex-col items-center justify-center relative overflow-hidden group hover:border-rose-500 transition-colors">
              <div className="absolute inset-0 bg-rose-500/5 group-hover:bg-rose-500/10 transition-colors"></div>
              <p className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-4 z-10">Heart Rate</p>
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full text-rose-500 animate-pulse absolute opacity-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                <svg className="w-12 h-12 text-rose-500 z-10" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              </div>
              <div className="flex items-baseline mt-4 z-10">
                <span className="text-5xl font-black text-white font-mono">{data.heartbeat}</span>
                <span className="text-rose-400 ml-1 text-sm font-bold">bpm</span>
              </div>
            </div>

            {/* Blood Pressure Track */}
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700 shadow-inner flex flex-col items-center justify-center relative overflow-hidden group hover:border-cyan-500 transition-colors">
              <div className="absolute inset-0 bg-cyan-500/5 group-hover:bg-cyan-500/10 transition-colors"></div>
              <p className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-4 z-10 text-center">Blood Pressure</p>
              <div className="relative w-24 h-24 flex items-center justify-center">
                <div className="absolute w-20 h-20 border-4 border-cyan-500/30 rounded-full"></div>
                <div className="absolute w-16 h-16 border-4 border-cyan-500/50 rounded-full border-t-cyan-400 animate-spin"></div>
              </div>
              <div className="flex items-baseline mt-4 z-10">
                <span className="text-3xl font-black text-white font-mono">{data.systolic}</span>
                <span className="text-cyan-400 mx-1 font-bold">/</span>
                <span className="text-xl font-bold text-white font-mono">{data.diastolic}</span>
              </div>
            </div>

            {/* Stress Level Fluid Metric */}
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700 shadow-inner flex flex-col items-center justify-center relative overflow-hidden group hover:border-amber-500 transition-colors">
              <div className="absolute inset-0 bg-amber-500/5 group-hover:bg-amber-500/10 transition-colors"></div>
              <p className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-4 z-10">Stress Level</p>
              <div className="relative w-24 h-24 flex items-center justify-center">
                <div className="absolute w-full h-full bg-slate-800 rounded-full overflow-hidden flex items-end shadow-inner">
                   <div className={`w-full transition-all duration-1000 ${data.stress < 40 ? 'bg-emerald-500' : data.stress < 75 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ height: `${data.stress}%` }}></div>
                </div>
                <span className="z-10 text-xl font-black text-white mix-blend-difference">{data.stress}%</span>
              </div>
              <div className="flex items-baseline mt-4 z-10">
                <span className={`text-sm font-bold uppercase tracking-wider ${data.stress < 40 ? 'text-emerald-400' : data.stress < 75 ? 'text-amber-400' : 'text-red-400'}`}>
                  {data.stress < 40 ? "Relaxed" : data.stress < 75 ? "Elevated" : "High Stress"}
                </span>
              </div>
            </div>

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <div className="w-24 h-24 rounded-full bg-slate-700/50 flex items-center justify-center shadow-inner border border-slate-600 relative">
               <div className="absolute w-32 h-32 rounded-full border border-slate-600/30 animate-ping"></div>
               <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p className="text-slate-500 font-mono text-sm uppercase tracking-widest">Awaiting Bluetooth telemetry sync...</p>
          </div>
        )}

        <div className="flex gap-4 pt-8 border-t border-slate-700 z-10 relative">
          <button 
            onClick={handleAction}
            disabled={animating}
            className={`flex-1 py-4 font-bold rounded-xl shadow-lg transition-all border font-mono text-sm flex items-center justify-center gap-2 ${connected ? 'bg-rose-500 hover:bg-rose-600 border-rose-400 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]' : 'bg-emerald-500 hover:bg-emerald-600 border-emerald-400 text-white animate-pulse shadow-[0_0_20px_rgba(16,185,129,0.3)]'}`}
          >
            {animating ? (
               "📡 PAIRING DEVICE..."
            ) : (
              connected ? "🔌 DISCONNECT SMART WATCH" : "⌚ CONNECT SMART WATCH"
            )}
          </button>
          
          {connected && (
            <button 
              onClick={downloadJSON}
              disabled={animating}
              className="flex-1 py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all border border-indigo-400 font-mono text-sm active:scale-95 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              EXPORT RAW JSON MATCH
            </button>
          )}
        </div>

      </div>
    </main>
  );
}
