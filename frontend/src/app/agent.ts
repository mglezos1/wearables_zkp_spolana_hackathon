export interface BloodPressure {
  systolic: number;
  diastolic: number;
}

export interface AnxietyResult {
  anxietyScore: number;
  hasAnxiety: boolean;
  confidence: number;
  factors: string[];
}

export function analyzeAnxiety(
  heartRate: number[],
  bloodPressure: BloodPressure[],
  stressLevel: number[]
): AnxietyResult {
  let anxietyScore = 0;
  const factors: string[] = [];

  // Low heart rate variability: 30% weight
  if (heartRate.length > 0) {
    const minHr = Math.min(...heartRate);
    const maxHr = Math.max(...heartRate);
    // If variability is low (max and min are close)
    if (maxHr - minHr <= 5) {
      anxietyScore += 30;
      factors.push("Low heart rate variability");
    }
  }

  // Elevated resting heart rate (>100 BPM): 25% weight
  if (heartRate.length > 0) {
    const avgHr = heartRate.reduce((a, b) => a + b, 0) / heartRate.length;
    if (avgHr > 100) {
      anxietyScore += 25;
      factors.push("Elevated resting heart rate");
    }
  }

  // Blood pressure fluctuations: 20% weight
  if (bloodPressure.length > 0) {
    const systolics = bloodPressure.map((bp) => bp.systolic);
    const minSys = Math.min(...systolics);
    const maxSys = Math.max(...systolics);
    // Fluctuation threshold of 15
    if (maxSys - minSys > 15) {
      anxietyScore += 20;
      factors.push("Blood pressure fluctuations");
    }
  }

  // Sustained high stress (>70): 25% weight
  if (stressLevel.length > 0) {
    const avgStress = stressLevel.reduce((a, b) => a + b, 0) / stressLevel.length;
    if (avgStress > 70) {
      anxietyScore += 25;
      factors.push("Sustained high stress");
    }
  }

  return {
    anxietyScore,
    hasAnxiety: anxietyScore > 60,
    confidence: 0.95,
    factors,
  };
}
