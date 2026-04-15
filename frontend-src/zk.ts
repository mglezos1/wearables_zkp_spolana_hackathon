import * as snarkjs from "snarkjs";

export async function generateProof(heartRates: number[]) {
    // This expects you to copy the heartrate.wasm and heartrate_final.zkey into the Next.js /public folder
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        { heart_rates: heartRates },
        "/heartrate.wasm",
        "/heartrate_final.zkey"
    );
    return { proof, publicSignals };
}
