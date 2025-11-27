import { Button } from "primereact/button";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { TOBACCO_ALCOHOL_CONSUMPION } from "./data";
import { Checkbox } from "primereact/checkbox";
import { Fieldset } from "primereact/fieldset";

export default function OtherProdWithTobacco({
  data,
  handleRemoveUi,
  addNewOtherUi,
  handleChangeProds,
  isDisabled,
  ageLimit,
}: {
  data: TOBACCO_ALCOHOL_CONSUMPION;
  handleChangeProds: (
    id: string,
    type: string,
    field: string,
    value: any
  ) => void;
  addNewOtherUi: (
    type:
      | "smoking_tobacco"
      | "chewing_tobacco"
      | "chewing_without_tobacco"
      | "alcohol"
  ) => void;
  handleRemoveUi: (
    id: string,
    type:
      | "smoking_tobacco"
      | "chewing_tobacco"
      | "chewing_without_tobacco"
      | "alcohol"
  ) => void;
  isDisabled: boolean;
  ageLimit: number
}) {
  // Helper array for Site of Placement checkboxes
  const siteOptions = [
    { label: "L", key: "site_of_placement_L" },
    { label: "R", key: "site_of_placement_R" },
    { label: "F", key: "site_of_placement_F" },
    { label: "n/a", key: "site_of_placement_NA" },
  ];

  return (
    // Use a Fieldset for a professional container
    <Fieldset legend="Other" toggleable className="mt-5">
      {/* p-fluid makes child inputs full-width */}
      <div className="p-fluid space-y-7">
        {/* Replaced plain input with PrimeReact FloatLabel/InputText */}
        <FloatLabel>
          <InputText
            value={data?.product || ""} // Use optional chaining
            onChange={(e) =>
              handleChangeProds(data?.id, data?.type, "product", e.target.value)
            }
            disabled={isDisabled}
          />
          <label>Specify Other</label>
        </FloatLabel>

        <FloatLabel>
          <InputText
            keyfilter="int"
            type="number"
            // Removed 'border-1 p-2'
            value={data?.from_age?.toString() || ""}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === "") {
                handleChangeProds(data?.id, data?.type, "from_age", "");
                return;
              }
              let num = parseInt(raw);
              if (num > ageLimit) num = ageLimit;
              handleChangeProds(data?.id, data?.type, "from_age", num);
            }
            }
            disabled={isDisabled}
          />
          <label>From age</label>
        </FloatLabel>

        <FloatLabel>
          <InputText
            keyfilter="int"
            type="number"
            // Removed 'border-1 p-2'
            value={data?.to_age?.toString() || ""}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === "") {
                handleChangeProds(data?.id, data?.type, "to_age", "");
                return;
              }
              let num = parseInt(raw);
              if (num > ageLimit) num = ageLimit;
              handleChangeProds(data?.id, data?.type, "to_age", num);
            }
            }
            disabled={isDisabled}
          />
          <label>To age</label>
        </FloatLabel>

        <FloatLabel>
          <InputText
            keyfilter="int"
            type="number"
            // Removed 'border-1 p-2'
            value={data?.number_per_day?.toString() || ""}
            onChange={(e) =>
              handleChangeProds(
                data?.id,
                data?.type,
                "number_per_day",
                e.target.value === "" ? "" : parseInt(e.target.value)
              )
            }
            disabled={isDisabled}
          />
          <label>Number per day</label>
        </FloatLabel>

        <FloatLabel>
          <InputText
            keyfilter="int"
            type="number"
            // Removed 'border-1 p-2'
            value={data?.days_in_week?.toString() || ""}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === "") {
                handleChangeProds(data?.id, data?.type, "days_in_week", "");
                return;
              }
              let num = parseInt(raw);
              if (num > 7) num = 7;
              handleChangeProds(data?.id, data?.type, "days_in_week", num);
            }
            }
            disabled={isDisabled}
          />
          <label>Days in a week</label>
        </FloatLabel>
      </div>

      {/* Custom layout for HR/MIN - outside p-fluid */}
      <div className="mt-6">
        <p className="text-slate-600 dark:text-gray-300 mb-2">
          Total duration of placement per day.
        </p>
        <div className="flex gap-2 items-center font-semibold text-sm text-slate-500">
          <InputText
            className="w-20 text-center" // Wider, cleaner input
            keyfilter={"int"}
            type="number"
            value={data?.duration_placement_hr?.toString() || ""}
            onChange={(e) =>
              handleChangeProds(
                data?.id,
                data?.type,
                "duration_placement_hr",
                isNaN(parseInt(e.target.value)) ? 0 : parseInt(e.target.value)
              )
            }
            disabled={isDisabled}
          />
          <label>HOUR</label>
          <span className="font-bold mx-1">:</span>
          <InputText
            className="w-20 text-center" // Wider, cleaner input
            keyfilter={"int"}
            type="number"
            value={data?.duration_placement_min?.toString() || ""}
            onChange={(e) =>
              handleChangeProds(
                data?.id,
                data?.type,
                "duration_placement_min",
                isNaN(parseInt(e.target.value)) ? 0 : parseInt(e.target.value)
              )
            }
            disabled={isDisabled}
          />
          <label>MINUTES</label>
        </div>
      </div>

      {/* Custom layout for Checkboxes - outside p-fluid */}
      <div className="mt-6">
        <p className="text-slate-600 dark:text-gray-300 mb-2">
          Site of placement
        </p>
        <div className="flex flex-wrap gap-5">
          {siteOptions.map((site) => (
            <div key={site.key} className="flex align-items-center gap-2">
              <Checkbox
                inputId={`${data?.id}_${site.key}`}
                // Use optional chaining
                checked={data?.[site.key as keyof typeof data] === 1}
                onChange={(e) => {
                  // This logic is preserved from your original code
                  handleChangeProds(
                    data?.id,
                    data?.type || "",
                    site.key,
                    e.checked ? 1 : 0 // Pass 1 or 0
                  );
                }}
                disabled={isDisabled}
              />
              <label htmlFor={`${data?.id}_${site.key}`}>{site.label}</label>
            </div>
          ))}
        </div>
      </div>

      {/* Styled Buttons */}
      <div className="mt-6 flex gap-2 justify-end">
        <Button
          label="Add Product" // Changed label
          icon="pi pi-plus" // Added icon
          outlined
          onClick={() => addNewOtherUi(data?.type)}
          disabled={isDisabled}
        />
        <Button
          label="Remove" // Changed label
          icon="pi pi-trash" // Added icon
          onClick={() => handleRemoveUi(data?.id, data?.type)}
          severity="danger"
          disabled={isDisabled}
        />
      </div>
    </Fieldset>
  );
}
