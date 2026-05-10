# 🧬 VITRAM: Zero-Knowledge Employee Wellness

VITRAM is a privacy-first web3 biometric wellness platform built on Solana. It allows users to securely verify their health and anxiety metrics to their employers or health insurance providers **without ever revealing their raw medical data**.

By utilizing on-device Deterministic AI and Zero-Knowledge (ZK) Cryptography, your highly sensitive heart rate and blood pressure data never leaves your device. Only a cryptographic proof of your health status is generated and securely broadcasted to the blockchain.

## 🚀 How It Works (Website User Guide)

When you access the VITRAM application, the flow is separated into two simple perspectives: the **Employee** (Data Generator) and the **Company/Insurer** (Data Verifier).

### 1. Generating Your Health Proof (For Employees)
1. **Connect Your Wallet:** Click the "Connect Phantom" button in the top right of the ZK Employee Wellness dashboard.
2. **Sync Biometrics:** Click "Connect Smart Watch" to securely pull your local mock Apple Health telemetry (Heart Rate, Blood Pressure, and Stress Levels).
3. **Local AI Analysis:** VITRAM's on-device AI will evaluate your metrics locally to generate an Anxiety Score. Behind the scenes, your raw numbers are permanently siloed—they never hit a server.
4. **Generate & Upload Proof:** Once analyzed, click the "Generate Proof & Upload" button. A mathematical Zero-Knowledge proof is computed locally securely hiding your data, and the encrypted payload is uploaded to the custom VITRAM Smart Contract on the Solana Testnet.
5. **Save Your Signature:** You will be provided a unique Solana Transaction Signature URL. Copy this signature—it is your unhackable, anonymous ticket!

### 2. Verifying the Proof (For Employers / Verifiers)
1. **Access the Portal:** Navigate to the **🏢 View Company Portal** via the navigation menu.
2. **Input Signature:** Paste the Solana Transaction Signature provided by the employee into the secure box.
3. **Automated Verification:** Click "Verify". The portal will query the blockchain, instantly decouple the mathematical ZK-proof, and automatically issue an "ALL CLEAR" or "SEEK SUPPORT" status based entirely on cryptographic math—with zero exposure to the user's actual underlying heart rate data!

---

*Securing the future of decentralized health with Zero-Knowledge Cryptography & Edge AI.*
