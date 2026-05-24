import { RFTType } from "./page3/BloodPage3";


export function validateRFTArray(samples: RFTType[]): string | null {
  const allowedEmptyTests = [
    "Blood Sugar Random",
    "Blood Sugar Fasting",
  ];

  for (let i = 0; i < samples.length; i++) {
    const sample = samples[i];
    const sampleNumber = i + 1;

    if (
      (sample.result === "") &&
      !allowedEmptyTests.includes(sample.test_name)
    ) {
      return `Error in sample number ${sampleNumber}: Result is required.`;
    }
  }

  return null;
}

