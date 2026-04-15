#!/bin/bash
set -e
cd /mnt/c/Users/mglez/.gemini/antigravity/scratch/zk-heartrate-insurance/circuits

# Safely remove old keys to allow overwriting
rm -f heartrate_0000.zkey heartrate_final.zkey

# Recompile circuit
circom heartrate.circom --wasm --r1cs -o build

# Re-generate setup and keys
npx snarkjs groth16 setup build/heartrate.r1cs pot12_final.ptau heartrate_0000.zkey
npx snarkjs zkey contribute heartrate_0000.zkey heartrate_final.zkey --name="1st" -v -e="random text"

# Export verification key just in case
npx snarkjs zkey export verificationkey heartrate_final.zkey verification_key.json

# Copy out correctly patched WASM and ZKEY to the NextJS framework
cp build/heartrate_js/heartrate.wasm ../frontend/public/
cp heartrate_final.zkey ../frontend/public/

echo "=========================================="
echo "Compilation updated successfully!"
echo "Refresh localhost:3000 and test the file!"
echo "=========================================="
