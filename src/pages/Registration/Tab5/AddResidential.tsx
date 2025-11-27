import React from "react";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { RESIDENTIAL_TYPE } from "./Tab5";

export default function AddResidential({
  handleRemoveUi,
  data,
  setResidentialData,
  setIsUnsaved,
  ageLimit,
  isDisabled
}: {
  handleRemoveUi: any;
  data: RESIDENTIAL_TYPE;
  setResidentialData: React.Dispatch<React.SetStateAction<RESIDENTIAL_TYPE[]>>;
  setIsUnsaved: React.Dispatch<React.SetStateAction<boolean>>
  ageLimit: number;
  isDisabled: boolean
}) {
  const handleUpdate = (field: string, value: any) => {
    setIsUnsaved(true);
    setResidentialData((d) =>
      d.map((item) => (item.id == data.id ? { ...item, [field]: value } : item))
    );
  };

  return (
    /* Use a softer shadow, larger rounding, and better padding */
    <div className="border border-gray-200 dark:border-gray-700 py-4 px-4 rounded-lg flex justify-between flex-row-reverse shadow-lg">
      <div className="-mt-3 -mr-1">
        {/* Delete Button */}
        <Button
          icon="pi pi-trash"
          text
          severity="danger"
          onClick={() => handleRemoveUi(data.id)}
        />
      </div>

      {/* Form Fields: Using Grid Layout for Two Columns */}
      <div className="w-full p-4 p-fluid grid grid-cols-2 gap-x-4 gap-y-7">

        {/* Row 1: Age Range */}
        <FloatLabel>
          <InputText
            keyfilter="int"
            type="number"
            value={data["from_age"].toString()}
            max={ageLimit}
            disabled={isDisabled}
            onChange={(e) => {
              let val = e.target.value;
              if (val === "") {
                handleUpdate("from_age", "");
                return;
              }
              let num = parseInt(val);
              if (num > ageLimit) num = ageLimit;  // enforce max
              handleUpdate("from_age", num);
            }
            }
          />
          <label>From Age</label>
        </FloatLabel>

        <FloatLabel>
          <InputText
            keyfilter="int"
            type="number"
            value={data["to_age"].toString()}
            disabled={isDisabled}
            onChange={(e) => {
              let val = e.target.value;
              if (val === "") {
                handleUpdate("to_age", "");
                return;
              }
              let num = parseInt(val);
              if (num > ageLimit) num = ageLimit;  // enforce max
              handleUpdate("to_age", num);
            }
            }
          />
          <label>To Age</label>
        </FloatLabel>

        {/* Row 2: Location (City/Village) */}
        <FloatLabel>
          <InputText
            name="city"
            value={data["city"]}
            disabled={data["village"] !== "" || isDisabled}

            onChange={(e) => handleUpdate("city", e.target.value)}
          />
          <label>City</label>
        </FloatLabel>

        <FloatLabel>
          <InputText
            name="village"
            value={data["village"]}
            disabled={data["city"] !== "" || isDisabled}

            onChange={(e) => handleUpdate("village", e.target.value)}
          />
          <label>Village</label>
        </FloatLabel>

        {/* Row 3: State / Code */}
        <FloatLabel>
          <InputText
            name="state"
            value={data["state"]}
            disabled={isDisabled}
            onChange={(e) => handleUpdate("state", e.target.value)}
          />
          <label>State</label>
        </FloatLabel>

        <FloatLabel>
          <Dropdown
            disabled={isDisabled}
            optionLabel="name"
            optionValue="value"
            placeholder="Code"
            value={data["code"]}
            options={[
              { name: "Urban", value: 1 },
              { name: "Rural", value: 2 },
              { name: "Semi Urban", value: 3 },
            ]}
            onChange={(e) => handleUpdate("code", e.target.value)}
          />
          <label>Code (Urban/Rural)</label>
        </FloatLabel>
      </div>
    </div>
  );
}
