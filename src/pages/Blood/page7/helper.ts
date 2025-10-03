import shortUUID from "short-uuid";
import { RFTType } from "../page3/BloodPage3";

const testNames = [
  { name: "HIV-I", unit: "Positive/Negative" },
  { name: "HIV-II", unit: "Positive/Negative" },
  { name: "HBsAg", unit: "Positive/Negative" },
  { name: "HCV", unit: "Positive/Negative" },
  { name: "Blood Sugar Random", unit: "mg/dL" },
  { name: "Blood Sugar Fasting", unit: "mg/dL" }
];
export const getInitialDataSet = (sampleId: string): RFTType[] => {
  const CBCData: RFTType[] = testNames.map((item) => ({
    test_name: item.name,
    result: 0,
    hl_flag: "",
    unit: item.unit,
    bio_ref_interval: "",
    id: shortUUID().generate(),
    sampleId: sampleId,
  }));
  return CBCData;
};
