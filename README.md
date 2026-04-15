# Welcome to the ZK Heart Rate Insurance Application Workspace

Because there were terminal runner limitations on WSL with `-c`, I have staged all your source files. You can now use your own terminal to safely orchestrate everything!

## 1. Compile the Circom Circuit

In your WSL terminal:
```bash
cd /mnt/c/Users/mglez/.gemini/antigravity/scratch/zk-heartrate-insurance/circuits
npm install

# Compile the circuit
npx circom heartrate.circom --wasm --r1cs -o build

# Run the setups to generate the keys
npx snarkjs powersoftau new bn128 12 pot12_0000.ptau -v
npx snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="First contribution" -v -e="random text"
npx snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau -v
npx snarkjs groth16 setup build/heartrate.r1cs pot12_final.ptau heartrate_0000.zkey
npx snarkjs zkey contribute heartrate_0000.zkey heartrate_final.zkey --name="1st Contribution Name" -v -e="more random text"
npx snarkjs zkey export verificationkey heartrate_final.zkey verification_key.json
```

## 2. Deploy the Solana Program

```bash
cd /mnt/c/Users/mglez/.gemini/antigravity/scratch/zk-heartrate-insurance
anchor init insurance_project
```
Then, copy the `contract-src/lib.rs` file I wrote into `insurance_project/programs/insurance_project/src/lib.rs`.
```bash
cd insurance_project
anchor build
anchor deploy
```

## 3. Create the Frontend (Next.js Application)

```bash
cd /mnt/c/Users/mglez/.gemini/antigravity/scratch/zk-heartrate-insurance
npx create-next-app@latest frontend
```
(Select **Yes** for TypeScript, Tailwind CSS, and App Router).

Now move my frontend files into your newly created frontend structure:
1. Replace `frontend/src/app/page.tsx` with `frontend-src/page.tsx`
2. Move `frontend-src/zk.ts` to `frontend/src/app/zk.ts`
3. Copy the compiled wasm and zkey to the public folder:
    - `cp circuits/build/heartrate_js/heartrate.wasm frontend/public/`
    - `cp circuits/heartrate_final.zkey frontend/public/`
4. Install exactly what we need for the browser proofs:
```bash
cd frontend
npm install snarkjs @solana/web3.js
```
Then start the server!
```bash
npm run dev
```

You can use the JSON provided at `circuits/input.json` on the website to generate the proof!
