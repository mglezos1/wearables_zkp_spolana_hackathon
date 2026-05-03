"use client";

import { useState } from "react";
import { Connection } from "@solana/web3.js";
import Link from "next/link";

export default function CompanyPortal() {
  const [signature, setSignature] = useState("");
  const [status, setStatus] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!signature) return;
    setStatus("Fetching record from Solana Testnet...");
    setResult(null);

    try {
      const connection = new Connection("https://api.testnet.solana.com", "confirmed");
      // Use getParsedTransaction to easily grab the memo
      const tx = await connection.getParsedTransaction(signature, { maxSupportedTransactionVersion: 0 });
      
      if (!tx) {
        setStatus("Error: Signature not found on Testnet! Make sure the transaction went through.");
        return;
      }

      // Look for the memo instruction
      let memoData = null;
      for (const ix of tx.transaction.message.instructions) {
         if ("program" in ix && ix.program === "spl-memo") {
            memoData = (ix as any).parsed;
            break;
         }
      }

      if (!memoData) {
        setStatus("Error: Transaction does not contain a secure ZK Memo! Are you sure this is a ZK Heartrate transaction?");
        return;
      }

      setStatus(`Verified secure blockchain record at block ${tx.slot}! Decrypting payload...`);

      try {
        const decoded = atob(memoData);
        const data = JSON.parse(decoded);

        if (data.agentAnalysis) {
          const { anxietyScore } = data.agentAnalysis;
          // Calculate anxiety status freshly based on the score in case older blockchain payloads have a buggy 'hasAnxiety' flag
          if (anxietyScore > 60) {
            setResult(`ANXIOUS (Score: ${anxietyScore}): SEEK SUPPORT`);
          } else {
            setResult(`RELAXED (Score: ${anxietyScore}): ALL CLEAR`);
          }
        } else {
          const tier = data.t;
          if (tier === "0") {
            setResult("HEALTHY: DISCOUNT APPLIED!");
          } else if (tier === "1") {
            setResult("NORMAL: PRICE STAYS SAME");
          } else if (tier === "2") {
            setResult("UNHEALTHY: PRICE INCREASE");
          } else {
            setStatus("Error: Unrecognized ZK Insure payload format.");
          }
        }
      } catch (parseErr) {
        setStatus("Error: Could not decouple the mathematical ZK packet. It may be incorrectly formatted.");
      }
    } catch (err) {
      console.error(err);
      setStatus("Failed to fetch signature details. Make sure it's a valid tx string.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8 relative">
      {/* Navigation App Map */}
      <div className="absolute top-6 left-8 flex flex-col gap-3 z-50">
        <Link href="/" className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 font-bold py-2 px-6 rounded-full shadow-lg transition-colors border-2 border-slate-600 flex items-center gap-2 text-sm w-max">
          ← View ZK Dashboard
        </Link>
        <Link href="/generator" className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-blue-400 font-bold py-2 px-6 rounded-full shadow-lg transition-colors border-2 border-slate-600 flex items-center gap-2 text-sm w-max">
           🧬 Data Generator
        </Link>
      </div>

      <div className="max-w-md w-full bg-slate-800 rounded-xl shadow-2xl p-8 space-y-6">
        <div className="text-center">
          <div className="bg-white inline-block p-4 rounded-2xl shadow-lg mb-4">
            <img src="/vitram-logo.png" alt="VITRAM Logo" className="h-8 mx-auto" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Company Wellness Portal
          </h1>
        </div>
        <p className="text-slate-400 text-sm">
          Paste the verified Solana transaction signature below to determine the employee's anxiety status. Raw medical data is 100% hidden by ZK Math.
        </p>

        <div className="space-y-4 text-center">
          <input 
            type="text" 
            placeholder="Paste Solana TX Signature..."
            value={signature}
            onChange={e => setSignature(e.target.value)}
            className="w-full bg-slate-700 text-white placeholder-slate-400 text-sm border-2 border-slate-600 focus:border-purple-500 rounded-lg p-3 outline-none transition-colors font-mono"
          />
        </div>

        <button 
          onClick={handleVerify}
          disabled={!signature}
          className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-mono"
        >
          VERIFY SIGNATURE
        </button>

        {status && (
          <div className="mt-4 p-4 bg-slate-700 rounded-lg border border-slate-600 shadow-inner">
            <p className="text-sm font-medium text-purple-300">{status}</p>
          </div>
        )}

        {result && (
          <div className="mt-4 p-4 bg-purple-900 border border-purple-500 rounded-lg text-center shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400 opacity-10 rounded-full blur-3xl"></div>
            <p className="text-xs text-purple-300 uppercase tracking-widest font-bold mb-1 relative z-10">AUTOMATED ACTION</p>
            <p className="text-2xl font-bold text-white relative z-10">{result}</p>
          </div>
        )}
      </div>
    </main>
  );
}
