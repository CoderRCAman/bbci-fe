import shortUUID from "short-uuid";
import { RFTType } from "../page3/BloodPage3";

const testNames: string[] = [
  "HIV-I",
  "HIV-II",
  "HBsAg",
  "HCV",
  "Blood Sugar Random",
  "Blood Sugar Fasting",
];
export const getInitialDataSet = (sampleId: string): RFTType[] => {
  const CBCData: RFTType[] = testNames.map((name) => ({
    test_name: name,
    result: 0,
    hl_flag: "",
    unit: "",
    bio_ref_interval: "",
    id: shortUUID().generate(),
    sampleId: sampleId,
  }));
  return CBCData;
};
