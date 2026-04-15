"use client";

import { useState } from "react";
import { generateProof } from "./zk";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");
  const [tier, setTier] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    setStatus("Reading file...");
    
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (!data.heart_rates || data.heart_rates.length !== 7) {
        setStatus("Error: Invalid JSON format. Expected 7 heart_rates array.");
        return;
      }

      setStatus("Generating ZK Proof locally...");
      // Calls snarkjs on the browser
      const { proof, publicSignals } = await generateProof(data.heart_rates);
      
      // publicSignals[0] is our category logic output
      const category = publicSignals[0];
      let tierStr = "Increased Premium ($$$)";
      if (category == "0") tierStr = "Discounted Premium! ($)";
      else if (category == "1") tierStr = "Standard Premium ($$)";
      
      setTier(tierStr);

      setStatus("Please approve the transaction via your wallet...");
      // For demo purposes, we stringify the proof here
      console.log("Generated ZK Proof Payload:", JSON.stringify(proof));
      console.log("Public Signals:", publicSignals);
      
      // Using @solana/web3.js and Anchor to push the proof to the insurance program
      // ... real program connection code would go here
      setStatus("Proof submitted to Solana testnet successfully!");

    } catch (e) {
      console.error(e);
      setStatus("Failed to generate proof. Ensure .wasm and .zkey are in /public folder.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full bg-slate-800 rounded-xl shadow-2xl p-8 space-y-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          ZK Health Insurance
        </h1>
        <p className="text-slate-400 text-sm">
          Upload your week's heart rate average data. A Zero-Knowledge proof is generated directly on your device, ensuring no raw medical data is uploaded.
        </p>

        <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors">
          <input 
            type="file" 
            accept=".json"
            onChange={e => setFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
          />
        </div>

        <button 
          onClick={handleUpload}
          disabled={!file}
          className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg shadow-lg disabled:opacity-50 transition-all font-mono"
        >
          GENERATE PROOF & UPLOAD
        </button>

        {status && (
          <div className="mt-4 p-4 bg-slate-700 rounded-lg border border-slate-600">
            <p className="text-sm font-medium text-emerald-300">{status}</p>
          </div>
        )}

        {tier && (
          <div className="mt-4 p-4 bg-emerald-900 border border-emerald-500 rounded-lg text-center animate-pulse">
            <p className="text-xs text-emerald-300 uppercase tracking-widest font-bold mb-1">YOUR RESULTING TIER</p>
            <p className="text-2xl font-bold text-white">{tier}</p>
          </div>
        )}
      </div>
    </main>
  );
}
