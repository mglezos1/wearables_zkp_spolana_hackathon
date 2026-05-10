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

  // Low heart rate variability (adjusted for demo noise margin): 20% weight
  if (heartRate.length > 0) {
    const minHr = Math.min(...heartRate);
    const maxHr = Math.max(...heartRate);
    if (maxHr - minHr <= 12) {
      anxietyScore += 20;
      factors.push("Low heart rate variability");
    }
  }

  // Elevated resting heart rate (>90 BPM): 35% weight
  if (heartRate.length > 0) {
    const avgHr = heartRate.reduce((a, b) => a + b, 0) / heartRate.length;
    if (avgHr > 90) {
      anxietyScore += 35;
      factors.push("Elevated resting heart rate");
    }
  }

  // High Systolic blood pressure check: 20% weight
  if (bloodPressure.length > 0) {
    const avgSys = bloodPressure.reduce((a, b) => a + b.systolic, 0) / bloodPressure.length;
    if (avgSys > 130) {
      anxietyScore += 20;
      factors.push("High systolic pressure");
    }
  }

  // Sustained high stress (>60): 25% weight
  if (stressLevel.length > 0) {
    const avgStress = stressLevel.reduce((a, b) => a + b, 0) / stressLevel.length;
    if (avgStress > 60) {
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
