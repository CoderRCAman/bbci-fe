import { RFTType } from "./page3/BloodPage3";

export function validateRFTArray(samples: RFTType[]): string | null {
  for (let i = 0; i < samples.length; i++) {
    const sampleNumber = i + 1; // human-friendly numbering starts at 1
    const sample = samples[i];
    if (typeof sample.test_name !== "string" || !sample.test_name.trim()) {
      return `Error in sample number ${sampleNumber}: Test name is missing or invalid.`;
    }
    if (
      typeof sample.result !== "number" ||
      isNaN(sample.result) ||
      sample.result <= 0
    ) {
      return `Error in sample number ${sampleNumber}: Result must be greater than zero.`;
    }


    if (typeof sample.unit !== "string" || !sample.unit.trim()) {
      return `Error in sample number ${sampleNumber}: Unit is missing or invalid.`;
    }

    if (typeof sample.id !== "string" || !sample.id.trim()) {
      return `Error in sample number ${sampleNumber}: ID is missing or invalid.`;
    }
    if (sample.sampleId !== undefined && typeof sample.sampleId !== "string") {
      return `Error in sample number ${sampleNumber}: Sample ID is invalid.`;
    }
    if (sample.test_type !== undefined && typeof sample.test_type !== "string") {
      return `Error in sample number ${sampleNumber}: test type is invalid.`;
    }
  }
  return null; // no errors found
}
