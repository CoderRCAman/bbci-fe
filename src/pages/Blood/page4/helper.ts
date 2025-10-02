import shortUUID from "short-uuid";
import { RFTType } from "../page3/BloodPage3";

export const getInitialDataSet = (sampleId: string): RFTType[] => {
  const LFTData: RFTType[] = [
    {
      test_name: "Serum Bilirubin ",
      result: 0,
      hl_flag: "",
      unit: "",
      bio_ref_interval: "",
      id: shortUUID().generate(),
      sampleId: sampleId,
    },
    {
      test_name: "Serum Bilirubin  Direct",
      result: 0,
      hl_flag: "",
      unit: "",
      bio_ref_interval: "",
      id: shortUUID().generate(),
      sampleId: sampleId,
    },
    {
      test_name: "SGOT",
      result: 0,
      hl_flag: "",
      unit: "",
      bio_ref_interval: "",
      id: shortUUID().generate(),
      sampleId: sampleId,
    },
    {
      test_name: "SGPT",
      result: 0,
      hl_flag: "",
      unit: "",
      bio_ref_interval: "",
      id: shortUUID().generate(),
      sampleId: sampleId,
    },
    {
      test_name: "ALP",
      result: 0,
      hl_flag: "",
      unit: "",
      bio_ref_interval: "",
      id: shortUUID().generate(),
      sampleId: sampleId,
    },
    {
      test_name: "Total Protein",
      result: 0,
      hl_flag: "",
      unit: "",
      bio_ref_interval: "",
      id: shortUUID().generate(),
      sampleId: sampleId,
    },
    {
      test_name: "Albumin",
      result: 0,
      hl_flag: "",
      unit: "",
      bio_ref_interval: "",
      id: shortUUID().generate(),
      sampleId: sampleId,
    },
  ];
  return LFTData;
};
