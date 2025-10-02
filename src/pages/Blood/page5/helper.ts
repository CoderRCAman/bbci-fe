import shortUUID from "short-uuid";
import { RFTType } from "../page3/BloodPage3";

const testNames: string[] = [
  "White Blood Cells (WBC)",
  "Neutrophil",
  "Lymphocyte",
  "Monocyte",
  "Eosinophil",
  "Basophil",
  "Red Blood Cell",
  "Hemoglobin (Hb)",
  "Haematocrit",
  "Mean Corpuscular Hemoglobin Concentration(MCHC)",
  "Platelet count",
  "Mean Platelet Volume(MPV)",
  "Mean Corpuscular Haemoglobin(MCH)",
  "Mean Corpuscular Volum(MCV)",
];
export const getInitialDataSet = (sampleId: string) => {
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
