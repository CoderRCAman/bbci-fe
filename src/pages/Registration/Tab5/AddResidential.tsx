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
}: {
  handleRemoveUi: any;
  data: RESIDENTIAL_TYPE;
  setResidentialData: React.Dispatch<React.SetStateAction<RESIDENTIAL_TYPE[]>>;
}) {
  const handleUpdate = (field: string, value: any) => {
    setResidentialData((d) =>
      d.map((item) => (item.id == data.id ? { ...item, [field]: value } : item))
    );
  };

  return (
    /* Use a softer shadow, larger rounding, and better padding */
    <div className="border border-gray-200 dark:border-gray-700 py-4 px-4 rounded-lg space-y-8 flex justify-between flex-row-reverse shadow-lg">
      <div className="-mt-3 -mr-1">
        {/* Use an icon, make it fully rounded */}
        <Button
          icon="pi pi-trash" // Use icon instead of label='X'
          text
          severity="danger"
          onClick={() => handleRemoveUi(data.id)}
        />
      </div>

      {/* Key Change: Added 'p-fluid' class. 
        This makes all child PrimeReact inputs full-width.
      */}
      <div className="space-y-7 w-full p-fluid">
        <FloatLabel>
          <InputText
            keyfilter="int"
            // Removed w-[50%], border-1, and p-2. 'p-fluid' handles it.
            value={data["from_age"].toString()}
            onChange={(e) =>
              handleUpdate(
                "from_age",
                isNaN(parseInt(e.target.value)) ? 0 : parseInt(e.target.value)
              )
            }
          />
          <label>From Age</label>
        </FloatLabel>

        <FloatLabel>
          <InputText
            keyfilter="int"
            // Removed w-[50%], border-1, and p-2.
            value={data["to_age"].toString()}
            onChange={(e) =>
              handleUpdate(
                "to_age",
                isNaN(parseInt(e.target.value)) ? 0 : parseInt(e.target.value)
              )
            }
          />
          <label>To Age</label>
        </FloatLabel>

        <FloatLabel>
          <InputText
            name="city"
            // Removed w-[50%], border-1, and p-2.
            value={data["city"]}
            disabled={data["village"] !== ""}
            onChange={(e) => handleUpdate("city", e.target.value)}
          />
          <label>City</label>
        </FloatLabel>

        <FloatLabel>
          <InputText
            name="village"
            // Removed w-[50%], border-1, and p-2.
            value={data["village"]}
            disabled={data["city"] !== ""}
            onChange={(e) => handleUpdate("village", e.target.value)}
          />
          <label>Village</label>
        </FloatLabel>

        <FloatLabel>
          <InputText
            name="state"
            // Removed w-[50%], border-1, and p-2.
            value={data["state"]}
            onChange={(e) => handleUpdate("state", e.target.value)}
          />
          <label>State</label>
        </FloatLabel>

        {/* Wrapped Dropdown in FloatLabel for consistency */}
        <FloatLabel>
          <Dropdown
            optionLabel="name"
            optionValue="value"
            // Removed border-1. 'p-fluid' makes it full-width.
            placeholder="Code" // This will be replaced by the label
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
