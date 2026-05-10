"use client";

import { useState, useEffect } from "react";
import { Connection, PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";
import { generateProof } from "./zk";
import { analyzeAnxiety, AnxietyResult } from "./agent";
import Link from "next/link";

const IDLE_LOGS = [
  "Awaiting biometric vector hooks...",
  "Listening for unverified payload...",
  "Listening on ZK local host...",
  "Healthkit daemon suspended.",
  "Connection idle..."
];

const PROCESS_LOGS = [
  "Initializing deterministic AI engine...",
  "Loading baseline physiological models...",
  "Ingesting Apple Health telemetry stream...",
  "Calculating Heart Rate Variability (HRV) indices...",
  "Analyzing systolic/diastolic pressure fluctuations...",
  "Correlating stress levels with cortisol predictors...",
  "Evaluating biometric anomalies against baseline...",
  "Synthesizing state confidence vectors...",
  "Finalizing diagnostic matrices...",
  "Awaiting transmission instructions..."
];

const BackendDaemonTerminal = ({ isActive }: { isActive: boolean }) => {
  const [logs, setLogs] = useState<{time: string, text: string}[]>([]);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    setLogs([{
        time: new Date().toISOString().split('T')[1].slice(0, 8),
        text: "[SYSTEM] Daemon initialized. Listening on port 3042..."
    }]);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    let index = 0;
    const getTime = () => new Date().toISOString().split('T')[1].slice(0, 8);
    
    if (isActive) {
      setLogs(prev => [...prev, { time: getTime(), text: "[AGENT] Payload received. Spinning up analyzer..." }].slice(-7));
      const interval = setInterval(() => {
        if (index < PROCESS_LOGS.length) {
          const newLog = `[PROCESS] ${PROCESS_LOGS[index]}`;
          setLogs(prev => [...prev, { time: getTime(), text: newLog }].slice(-7));
          index++;
        }
      }, 350);
      return () => clearInterval(interval);
    } else {
      const interval = setInterval(() => {
        const randomIdle = IDLE_LOGS[Math.floor(Math.random() * IDLE_LOGS.length)];
        setLogs(prev => [...prev, { time: getTime(), text: `[SYSTEM] ${randomIdle}` }].slice(-7));
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isActive, mounted]);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-slate-950/95 border border-indigo-500/30 p-4 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-md z-50 flex flex-col font-mono text-[10px] sm:text-xs">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
         <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M4 17a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2z" /></svg>
            <span className="text-indigo-400 font-bold tracking-widest uppercase text-xs">Agent Backend Node</span>
         </div>
         <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-amber-400 animate-[pulse_0.5s_infinite]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`}></div>
      </div>
      <div className="h-36 overflow-y-hidden flex flex-col justify-end space-y-1 relative">
        <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-slate-950/95 to-transparent z-10 pointer-events-none"></div>
        {logs.map((log, i) => (
          <div key={i} className="text-indigo-300/70 animate-[pulse_0.4s_ease-out_1] flex gap-2 w-full break-words">
            <span className="text-slate-600 shrink-0">{log.time}</span>
            <span className={isActive && i === logs.length - 1 ? 'text-amber-300 shadow-[0_0_5px_rgba(251,191,36,0.5)]' : 'text-indigo-300/80'}>{log.text}</span>
          </div>
        ))}
        {isActive && (
           <div className="text-amber-400 animate-[bounce_0.5s_infinite] ml-16">_</div>
        )}
      </div>
    </div>
  );
};

export default function Home() {
  const [data, setData] = useState({
    heartbeat: 0,
    systolic: 0,
    diastolic: 0,
    stress: 0,
  });

  const [history, setHistory] = useState<{
    heartRate: number[],
    bloodPressure: {systolic: number, diastolic: number}[],
    stressLevel: number[]
  }>({ heartRate: [], bloodPressure: [], stressLevel: [] });

  const [animating, setAnimating] = useState(false);
  const [connected, setConnected] = useState(false);

  const [isAgentRunning, setIsAgentRunning] = useState(false);
  const [agentAnalysis, setAgentAnalysis] = useState<AnxietyResult | null>(null);

  const [status, setStatus] = useState<string>("");
  const [txLink, setTxLink] = useState<string>("");
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    const solana = (window as any).solana;
    if (solana?.isPhantom) {
      solana.connect({ onlyIfTrusted: true }).then((resp: any) => {
        setWalletAddress(resp.publicKey.toString());
      }).catch(() => {});
    }
  }, []);

  const connectWallet = async () => {
    const solana = (window as any).solana;
    if (!solana || !solana.isPhantom) {
      setStatus("Please install the Phantom Wallet extension!");
      window.open("https://phantom.app/", "_blank");
      return;
    }
    try {
      const resp = await solana.connect();
      setWalletAddress(resp.publicKey.toString());
      setStatus("Wallet successfully connected!");
    } catch (err) {
      console.error("Wallet connection failed", err);
      setStatus("Wallet connection cancelled.");
    }
  };

  const handleAction = () => {
    if (connected) {
      setConnected(false);
      setAgentAnalysis(null);
      return;
    }
    
    setAnimating(true);
    setTimeout(() => {
      const currentHeartbeat = Math.floor(Math.random() * (115 - 60 + 1) + 60);
      const currentSystolic = Math.floor(Math.random() * (150 - 100 + 1) + 100);
      const currentDiastolic = Math.floor(Math.random() * (90 - 65 + 1) + 65);
      const currentStress = Math.floor(Math.random() * 101);

      setData({
        heartbeat: currentHeartbeat,
        systolic: currentSystolic,
        diastolic: currentDiastolic,
        stress: currentStress,
      });

      // Generate a mock history of 5 readings 
      // (With slight variations to trigger conditions procedurally based on current levels)
      setHistory({
        heartRate: Array.from({length: 5}, () => currentHeartbeat + Math.floor(Math.random() * 11 - 5)),
        bloodPressure: Array.from({length: 5}, () => ({
          systolic: currentSystolic + Math.floor(Math.random() * 21 - 10),
          diastolic: currentDiastolic + Math.floor(Math.random() * 11 - 5)
        })),
        stressLevel: Array.from({length: 5}, () => currentStress + Math.floor(Math.random() * 11 - 5))
      });
      setConnected(true);
      setAnimating(false);
    }, 1500); // 1.5s simulated pairing delay for smartwatch
  };

  const handleUpload = async () => {
    if (!connected) return;
    setStatus("Reading data...");
    setTxLink("");
    
    try {
      setStatus("Generating ZK Proof locally...");
      const { proof, publicSignals } = await generateProof(data.heartbeat, data.systolic, data.diastolic, data.stress);
      
      const category = publicSignals[0];

      const solana = (window as any).solana;
      if (!solana || !solana.isPhantom) {
        setStatus("ZK Proof generated locally! To publish, please install Phantom.");
        return;
      }

      if (!walletAddress) {
        setStatus("ZK Proof generated! Connect your wallet using the top right button to publish it.");
        return;
      }
      
      try {
        const resp = await solana.connect();
        const publicKey = resp.publicKey;

        const connection = new Connection("https://api.testnet.solana.com", "confirmed");
        const customProgramId = new PublicKey("EadtZD4nK7oxpbwS59BxDJF1Bmv9DJjV6CZKWVHMRVYr");
        
        setStatus("AI Agent analyzing biometric history...");
        setIsAgentRunning(true);
        const anxietyAnalysis = analyzeAnxiety(history.heartRate, history.bloodPressure, history.stressLevel);
        
        // Artificial delay to simulate agent "thinking" visually
        await new Promise(r => setTimeout(r, 4000));
        setAgentAnalysis(anxietyAnalysis);
        setIsAgentRunning(false);
        
        setStatus("Please approve the testnet transaction on your Phantom Wallet...");

        // Hide the tier via an opaque Base64 transmission!
        // We add a timestamp nonce so Solana doesn't reject duplicate testing transactions!
        const payload = { 
          t: category, 
          z: proof.pi_a[0].substring(0, 20), 
          n: Date.now(),
          agentAnalysis: anxietyAnalysis
        };
        const memoText = btoa(JSON.stringify(payload));
        
        // Dynamically calculate Anchor discriminator for `submit_telemetry` 
        const encoder = new TextEncoder();
        const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode("global:submit_telemetry"));
        const discriminator = new Uint8Array(hashBuffer).slice(0, 8);
        
        // Serialize String argument: [4 byte little-endian length] + [UTF-8 string bytes]
        const payloadBytes = encoder.encode(memoText);
        const lengthBuffer = new ArrayBuffer(4);
        new DataView(lengthBuffer).setUint32(0, payloadBytes.length, true);
        
        const ixData = new Uint8Array(8 + 4 + payloadBytes.length);
        ixData.set(discriminator, 0);
        ixData.set(new Uint8Array(lengthBuffer), 8);
        ixData.set(payloadBytes, 12);
        
        const tx = new Transaction().add(
          new TransactionInstruction({
            keys: [], // Empty accounts matching the Anchor validation scope
            data: Buffer.from(ixData),
            programId: customProgramId,
          })
        );
        
        tx.feePayer = publicKey;
        const { blockhash } = await connection.getLatestBlockhash();
        tx.recentBlockhash = blockhash;
        
        const signed = await solana.signTransaction(tx);
        // Skip preflight simulation to prevent Phantom's local RPC race condition duplicate error
        const signature = await connection.sendRawTransaction(signed.serialize(), { skipPreflight: true });
        
        setStatus("Proof published anonymously to the Blockchain!");
        setTxLink(`https://explorer.solana.com/tx/${signature}?cluster=testnet`);

      } catch (err) {
         console.error(err);
         setStatus("Wallet interaction cancelled or an error occurred.");
      }

    } catch (e) {
      console.error(e);
      setStatus("Failed to generate proof. Have you run 'bash recompile.sh' yet?");
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-500 opacity-10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-500 opacity-10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Navigation App Map Top Left */}
      <div className="absolute top-6 left-8 flex flex-col gap-3 z-50">
        <a href="https://v0-vitram-landing-page.vercel.app/" className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 font-bold py-2 px-6 rounded-full shadow-lg transition-colors border-2 border-slate-600 flex items-center gap-2 text-sm w-max">
           🏠 Main Website
        </a>
        <Link href="/insurer" className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-purple-400 font-bold py-2 px-6 rounded-full shadow-lg transition-colors border-2 border-slate-600 flex items-center gap-2 text-sm w-max">
           🏢 View Company Portal
        </Link>
      </div>

      {/* Wallet Connect Button at the Top Right */}
      <div className="absolute top-6 right-8 z-50">
        {walletAddress ? (
          <div className="bg-slate-800 border-2 border-emerald-500 text-emerald-400 px-5 py-2 rounded-full font-mono text-sm shadow-xl flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
          </div>
        ) : (
          <button 
            onClick={connectWallet}
            className="bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold py-2 px-6 rounded-full shadow-lg transition-colors border-2 border-emerald-400 flex items-center gap-2"
          >
            Connect Phantom
          </button>
        )}
      </div>

      <div className="max-w-2xl w-full bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] p-10 space-y-10 z-10 min-h-[400px] flex flex-col justify-center">
        <div className="flex flex-col items-center text-center space-y-4 mb-6">
          {/* Prominent SVG Logo */}
          <div className="flex items-center font-sans font-black tracking-widest text-5xl text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <span>VITR</span>
            <div className="relative flex items-center justify-center w-14 h-14 -mx-1">
              <svg viewBox="0 0 40 40" className="w-full h-full text-white">
                <path d="M 8 36 L 20 6 L 32 36" stroke="currentColor" strokeWidth="5" fill="none" strokeLinejoin="round" strokeLinecap="round" />
                <path d="M 12 25 Q 26 23 37 9 L 27 9 M 37 9 L 37 19" stroke="#22d3ee" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span>M</span>
          </div>

          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent uppercase tracking-wider">
            ZK Employee Wellness
          </h1>
          <p className="text-slate-400 text-sm">
            Generate synthetic wearable metrics mimicking Apple Health telemetry. A Zero-Knowledge proof calculates your anxiety status directly on your device before publishing to Solana.
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

        {/* Agent Visualizer */}
        {(isAgentRunning || agentAnalysis) && (
          <div className="w-full bg-slate-900/60 p-6 rounded-2xl border border-indigo-500/30 shadow-inner flex flex-col relative overflow-hidden group hover:border-indigo-500/50 transition-colors mt-2 mb-6">
            <div className="absolute inset-0 bg-indigo-500/5 transition-colors"></div>
            
            <div className="flex items-center gap-3 z-10 mb-4">
               <div className={`w-3 h-3 rounded-full ${isAgentRunning ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]'}`}></div>
               <h3 className="text-indigo-300 font-bold tracking-widest uppercase text-sm font-mono">
                 {isAgentRunning ? "Agent Processing..." : "AI Agent Analysis Results"}
               </h3>
            </div>

            {isAgentRunning ? (
              <div className="z-10 space-y-2">
                 <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden relative">
                    <div className="absolute top-0 left-0 h-full bg-indigo-500 animate-pulse w-full"></div>
                 </div>
                 <p className="text-xs text-indigo-400 font-mono animate-pulse">Running complex biometric analysis...</p>
                 <p className="text-[10px] text-slate-500 font-mono">See backend terminal panel for real-time daemon logs.</p>
              </div>
            ) : agentAnalysis && (
              <div className="z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                 <div className="space-y-1">
                   <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Anxiety Score</p>
                   <div className="flex items-baseline gap-2">
                     <span className={`text-4xl font-black font-mono ${agentAnalysis.hasAnxiety ? 'text-rose-400' : 'text-emerald-400'}`}>
                       {agentAnalysis.anxietyScore}
                     </span>
                     <span className="text-sm text-slate-500">/ 100</span>
                   </div>
                 </div>
                 
                 <div className="flex-1 max-w-sm space-y-1">
                   <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Identified Factors</p>
                   <div className="flex flex-wrap gap-2">
                     {agentAnalysis.factors.length > 0 ? (
                       agentAnalysis.factors.map((f, i) => (
                         <span key={i} className="px-2 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded text-xs mt-1">
                           {f}
                         </span>
                       ))
                     ) : (
                       <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-xs mt-1">
                         No elevated risks detected
                       </span>
                     )}
                   </div>
                 </div>
                 
                 <div className="space-y-1 text-right">
                   <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Status</p>
                   <p className={`text-sm font-bold px-3 py-1 rounded-full text-center ${agentAnalysis.hasAnxiety ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                     {agentAnalysis.hasAnxiety ? "Anxious" : "Relaxed"}
                   </p>
                 </div>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-4 pt-8 border-t border-slate-700 z-10 relative">
          <div className="flex gap-4">
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
                onClick={handleUpload}
                disabled={animating || !walletAddress}
                className={`flex-1 py-4 text-white font-bold rounded-xl transition-all border font-mono text-sm flex items-center justify-center gap-2 ${(!walletAddress) ? 'bg-slate-600 border-slate-500 opacity-50 cursor-not-allowed' : 'bg-indigo-500 hover:bg-indigo-600 border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.3)] active:scale-95'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                GENERATE PROOF & UPLOAD
              </button>
            )}
          </div>
          
          {connected && !walletAddress && (
            <p className="text-xs text-center text-rose-400 font-mono">You must connect your wallet using the top right button to generate and upload the proof.</p>
          )}

          {status && (
            <div className="mt-4 p-4 bg-slate-700 rounded-lg border border-slate-600 shadow-inner">
              <p className="text-sm font-medium text-emerald-300 break-words">{status}</p>
            </div>
          )}

          {txLink && (
             <a 
                href={txLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block mt-4 text-center text-sm font-bold text-cyan-400 hover:text-cyan-300 underline underline-offset-4"
             >
                🌍 View on Solana Testnet Explorer
             </a>
          )}
        </div>

      </div>
      
      <BackendDaemonTerminal isActive={isAgentRunning} />
    </main>
  );
}
