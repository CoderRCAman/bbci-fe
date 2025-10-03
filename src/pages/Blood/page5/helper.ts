import shortUUID from "short-uuid";
import { RFTType } from "../page3/BloodPage3";

const testNames = [
  { name: "White Blood Cells (WBC)", unit: "10^3/uL" },
  { name: "Neutrophil", unit: "%" },
  { name: "Lymphocyte", unit: "%" },
  { name: "Monocyte", unit: "%" },
  { name: "Eosinophil", unit: "%" },
  { name: "Basophil", unit: "%" },
  { name: "Red Blood Cell", unit: "10^6/uL" },
  { name: "Hemoglobin (Hb)", unit: "g/dL" },
  { name: "Haematocrit", unit: "%" },
  { name: "Mean Corpuscular Hemoglobin Concentration(MCHC)", unit: "g/dL" },
  { name: "Platelet count", unit: "10^3/uL" },
  { name: "Mean Platelet Volume(MPV)", unit: "fL" },
  { name: "Mean Corpuscular Haemoglobin(MCH)", unit: "pg" },
  { name: "Mean Corpuscular Volum(MCV)", unit: "fL" }
];

export const getInitialDataSet = (sampleId: string) => {
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
