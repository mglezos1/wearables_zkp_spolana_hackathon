import * as snarkjs from "snarkjs";

export async function generateProof(heartRate: number, systolic: number, diastolic: number, stress: number) {
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    { 
      heart_rate: heartRate, 
      systolic: systolic, 
      diastolic: diastolic, 
      stress: stress 
    },
    "/heartrate.wasm",
    "/heartrate_final.zkey"
  );
  return { proof, publicSignals };
}
