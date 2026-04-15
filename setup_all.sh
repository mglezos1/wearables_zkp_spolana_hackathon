#!/bin/bash
set -e

# Go to the root folder
cd /mnt/c/Users/mglez/.gemini/antigravity/scratch/zk-heartrate-insurance

echo "======================================"
echo "Setting up the Next.js Frontend"
echo "======================================"

# Automatically create the next.js frontend fully non-interactive
if [ ! -d "frontend" ]; then
    npx create-next-app@latest frontend --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes
fi

# Copy all the frontend files and generated zk circuits into the frontend folder
cp frontend-src/page.tsx frontend/src/app/page.tsx
cp frontend-src/zk.ts frontend/src/app/zk.ts

echo "Copying compiled ZK files to public..."
cp circuits/build/heartrate_js/heartrate.wasm frontend/public/ || true
cp circuits/heartrate_final.zkey frontend/public/ || true

cd frontend
echo "Installing zk libraries for the browser..."
npm install snarkjs @solana/web3.js

echo "======================================"
echo "Starting the Dashboard!"
echo "======================================"
echo "Navigate to http://localhost:3000 to see your new ZK Health Insurance App demo!"

npm run dev
