import { Button } from "primereact/button";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { TOBACCO_ALCOHOL_CONSUMPION } from "./data";
import { Fieldset } from "primereact/fieldset";
import { Checkbox } from "primereact/checkbox";

export default function OtherAlcohol({
  data,
  handleRemoveUi,
  handleChangeProds,
  addNewOtherUi,
  isDisabled,
}: {
  addNewOtherUi: any;
  data: TOBACCO_ALCOHOL_CONSUMPION;
  handleRemoveUi: any;
  handleChangeProds: (
    id: string,
    type: string,
    field: string,
    value: any
  ) => void;
  isDisabled: boolean;
}) {
  // Helper array for Site of Placement checkboxes
  const siteOptions = [
    { label: "L", key: "site_of_placement_L" },
    { label: "R", key: "site_of_placement_R" },
    { label: "F", key: "site_of_placement_F" },
    { label: "n/a", key: "site_of_placement_NA" },
  ];

  return (
    // Use a Fieldset for a premium, collapsible container
    <Fieldset legend="Other" toggleable className="mt-5">
      {/* Add padding and consistent vertical spacing */}
      <div className="p-4 space-y-7">
        {/* Use p-fluid to make all child inputs full-width */}
        <div className="p-fluid space-y-7">
          <FloatLabel>
            <InputText
              id={`${data?.id}_product`}
              value={data?.product || ''} // Use optional chaining and default
              disabled={isDisabled}
              onChange={(e) => // Added the missing onChange handler
                handleChangeProds(
                  data?.id,
                  "alcohol",
                  "product",
                  e.target.value
                )
              }
            />
            <label htmlFor={`${data?.id}_product`}>Specify Other</label>
          </FloatLabel>

          <FloatLabel>
            <InputText
              keyfilter="int"
              // Removed 'border-1 p-2'
              value={data?.from_age?.toString() || ''}
              onChange={(e) =>
                handleChangeProds(
                  data?.id,
                  "alcohol",
                  "from_age",
                  isNaN(parseInt(e.target.value)) ? 0 : parseInt(e.target.value)
                )
              }
              disabled={isDisabled}
            />
            <label>From age</label>
          </FloatLabel>

          <FloatLabel>
            <InputText
              keyfilter="int"
              // Removed 'border-1 p-2'
              value={data?.to_age?.toString() || ''}
              onChange={(e) =>
                handleChangeProds(
                  data?.id,
                  "alcohol",
                  "to_age",
                  isNaN(parseInt(e.target.value)) ? 0 : parseInt(e.target.value)
                )
              }
              disabled={isDisabled}
            />
            <label>To age</label>
          </FloatLabel>

          <FloatLabel>
            <InputText
              keyfilter="int"
              // Removed 'border-1 p-2'
              value={data?.number_per_day?.toString() || ''}
              onChange={(e) =>
                handleChangeProds(
                  data?.id,
                  "alcohol",
                  "number_per_day",
                  isNaN(parseInt(e.target.value)) ? 0 : parseInt(e.target.value)
                )
              }
              disabled={isDisabled}
            />
            <label>Number per day</label>
          </FloatLabel>

          <FloatLabel>
            <InputText
              keyfilter="int"
              // Removed 'border-1 p-2'
              value={data?.days_in_week?.toString() || ''}
              onChange={(e) =>
                handleChangeProds(
                  data?.id,
                  "alcohol",
                  "days_in_week",
                  isNaN(parseInt(e.target.value)) ? 0 : parseInt(e.target.value)
                )
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
              className="w-20 text-center"
              keyfilter={"int"}
              value={data?.duration_placement_hr?.toString() || ''}
              onChange={(e) =>
                handleChangeProds(
                  data?.id,
                  "alcohol",
                  "duration_placement_hr",
                  isNaN(parseInt(e.target.value)) ? 0 : parseInt(e.target.value)
                )
              }
              disabled={isDisabled}
            />
            <label>HOUR</label>
            <span className="font-bold mx-1">:</span>
            <InputText
              className="w-20 text-center"
              keyfilter={"int"}
              value={data?.duration_placement_min?.toString() || ''}
              onChange={(e) =>
                handleChangeProds(
                  data?.id,
                  "alcohol",
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
                  checked={data?.[site.key as keyof typeof data] === 1}
                  onChange={(e) =>
                    // Use correct checkbox logic (e.checked) from the pattern
                    handleChangeProds(
                      data?.id,
                      "alcohol",
                      site.key,
                      e.checked ? 1 : 0
                    )
                  }
                  disabled={isDisabled}
                />
                <label htmlFor={`${data?.id}_${site.key}`}>
                  {site.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Styled buttons at the bottom */}
        <div className="mt-6 flex gap-3 justify-end">
          <Button
            label="Add Product"
            icon="pi pi-plus"
            onClick={() => addNewOtherUi(data?.type)}
            outlined
            disabled={isDisabled} // Disable add button if section is disabled
          />
          <Button
            label="REMOVE"
            icon="pi pi-trash"
            onClick={() => handleRemoveUi(data?.id, data?.type)}
            severity="danger"
            // Do not disable remove, so user can remove it even if disabled
          />
        </div>
      </div>
    </Fieldset>
  );
}
