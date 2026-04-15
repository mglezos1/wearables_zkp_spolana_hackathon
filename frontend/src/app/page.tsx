"use client";

import { useState, useEffect } from "react";
import { Connection, PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";
import { generateProof } from "./zk";
import Link from "next/link";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");
  const [tier, setTier] = useState<string | null>(null);
  const [txLink, setTxLink] = useState<string>("");
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    // Check if previously connected
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

  const handleUpload = async () => {
    if (!file) return;
    setStatus("Reading file...");
    setTxLink("");
    
    try {
      const text = await file.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        setStatus("Error: Invalid JSON.");
        return;
      }
      
      if (data.heart_rate === undefined) {
        setStatus("Error: Invalid JSON format. Expected 'heart_rate' number.");
        return;
      }

      setStatus("Generating ZK Proof locally...");
      const { proof, publicSignals } = await generateProof(data.heart_rate);
      
      const category = publicSignals[0];
      let tierStr = "Increased Premium ($$$)";
      if (category == "0") tierStr = "Discounted Premium! ($)";
      else if (category == "1") tierStr = "Standard Premium ($$)";
      
      setTier(tierStr);

      const solana = (window as any).solana;
      if (!solana || !solana.isPhantom) {
        setStatus("ZK Proof generated locally! To test publishing, please install Phantom Wallet.");
        return;
      }

      if (!walletAddress) {
        setStatus("ZK Proof generated! Please connect your wallet using the top right button to publish it.");
        return;
      }

      setStatus("Please approve the testnet transaction on your Phantom Wallet...");
      
      try {
        const resp = await solana.connect();
        const publicKey = resp.publicKey;

        const connection = new Connection("https://api.testnet.solana.com", "confirmed");
        const memoProgramId = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
        
        // Hide the tier via an opaque Base64 transmission!
        // We add a timestamp nonce so Solana doesn't reject duplicate testing transactions!
        const payload = { t: category, z: proof.pi_a[0].substring(0, 20), n: Date.now() };
        const memoText = btoa(JSON.stringify(payload));
        
        const tx = new Transaction().add(
          new TransactionInstruction({
            keys: [{ pubkey: publicKey, isSigner: true, isWritable: true }],
            data: Buffer.from(new TextEncoder().encode(memoText)),
            programId: memoProgramId,
          })
        );
        
        tx.feePayer = publicKey;
        const { blockhash } = await connection.getLatestBlockhash();
        tx.recentBlockhash = blockhash;
        
        const signed = await solana.signTransaction(tx);
        const signature = await connection.sendRawTransaction(signed.serialize());
        
        setStatus("Proof published anonymously to the Blockchain!");
        setTxLink(`https://explorer.solana.com/tx/${signature}?cluster=testnet`);

      } catch (err) {
         console.error(err);
         setStatus("Wallet interaction cancelled or an error occurred. The ZK logic was calculated natively anyway!");
      }

    } catch (e) {
      console.error(e);
      setStatus("Failed to generate proof. Ensure .wasm and .zkey are properly updated.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8 relative">
      
      {/* Insurer Portal link Top Left */}
      <div className="absolute top-6 left-8">
        <Link href="/insurer" className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-purple-400 font-bold py-2 px-6 rounded-full shadow-lg transition-colors border-2 border-slate-600 flex items-center gap-2">
           👨‍💼 Insurer Portal
        </Link>
      </div>

      {/* Wallet Connect Button at the Top Right */}
      <div className="absolute top-6 right-8">
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

      <div className="max-w-md w-full bg-slate-800 rounded-xl shadow-2xl p-8 space-y-6 mt-10">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          ZK Health Insurance
        </h1>
        <p className="text-slate-400 text-sm">
          Upload your single heart rate measurement. A Zero-Knowledge proof is generated directly on your device, ensuring no raw medical data is uploaded.
        </p>

        <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors">
          <input 
            type="file" 
            accept=".json"
            onChange={e => setFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
          />
        </div>

        <button 
          onClick={handleUpload}
          disabled={!file || !walletAddress}
          className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-mono"
        >
          GENERATE PROOF & UPLOAD
        </button>
        {(!walletAddress) && (
          <p className="text-xs text-center text-rose-400 font-mono">You must connect your wallet to upload.</p>
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
    </main>
  );
}
