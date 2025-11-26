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
  ageLimit
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
  ageLimit: number;
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
      <div className="p-4 space-y-7">

        {/* Product Name */}
        <FloatLabel>
          <InputText 
            id={`${data.id}_product`}
            value={data.product || ""}
            disabled={isDisabled}
            onChange={(e) =>
              handleChangeProds(data.id, "alcohol", "product", e.target.value)
            }
          />
          <label htmlFor={`${data.id}_product`}>Specify Other</label>
        </FloatLabel>

        {/* FROM AGE */}
        <FloatLabel>
          <InputText
            keyfilter="int" 
            type="number"
            value={data.from_age?.toString() || ""}
            onChange={(e) =>
              handleChangeProds(
                data.id,
                "alcohol",
                "from_age",
                e.target.value === "" ? "" : Math.min(parseInt(e.target.value), ageLimit)
              )
            }
            disabled={isDisabled}
          />
          <label>From age</label>
        </FloatLabel>

        {/* TO AGE */}
        <FloatLabel>
          <InputText
            keyfilter="int" 
            type="number"
            value={data.to_age?.toString() || ""}
            onChange={(e) =>
              handleChangeProds(
                data.id,
                "alcohol",
                "to_age",
                e.target.value === "" ? "" : Math.min(parseInt(e.target.value), ageLimit)
              )
            }
            disabled={isDisabled}
          />
          <label>To age</label>
        </FloatLabel>


        {/* Number per day */}
        <FloatLabel>
          <InputText
            keyfilter="int"
            type="number"
            value={data.number_per_day?.toString() || ""}
            onChange={(e) =>
              handleChangeProds(
                data.id,
                "alcohol",
                "number_per_day",
                e.target.value === "" ? "" : parseInt(e.target.value)
              )
            }
            disabled={isDisabled}
          />
          <label>Number of times per day</label>
        </FloatLabel>


        {/* Days in Week / Month */}
        <div>
          <p className="text-slate-600 dark:text-gray-300 mb-3">
            Days in a week or Days in a Month
          </p>

          <div className="grid grid-cols-2 gap-4 mt-7">

            <FloatLabel>
              <InputText
                keyfilter="int" 
                type="number"
                value={data.days_in_week?.toString() || ""}
                onChange={(e) =>
                  handleChangeProds(
                    data.id,
                    "alcohol",
                    "days_in_week",
                    e.target.value === "" ? "" : Math.min(parseInt(e.target.value), 7)
                  )
                }
                disabled={isDisabled}
              />
              <label>Days in a Week</label>
            </FloatLabel>

            <FloatLabel>
              <InputText
                keyfilter="int" 
                type="number"
                value={data.days_in_month?.toString() || ""}
                onChange={(e) =>
                  handleChangeProds(
                    data.id,
                    "alcohol",
                    "days_in_month",
                    e.target.value === "" ? "" : Math.min(parseInt(e.target.value), 31)
                  )
                }
                disabled={isDisabled}
              />
              <label>Days in a Month</label>
            </FloatLabel>

          </div>
        </div>


        {/* Consumption Unit */}
        <FloatLabel >
          <InputText
            keyfilter="int" 
            type="number" 
            className="w-[50%]"
            value={data.consumption_unit_per_day?.toString() || ""}
            onChange={(e) =>
              handleChangeProds(
                data.id,
                "alcohol",
                "consumption_unit_per_day",
                e.target.value === "" ? "" : parseInt(e.target.value)
              )
            }
            disabled={isDisabled}
          />
          <label>Consumption Unit per day *(ml / Glass)</label>
        </FloatLabel>


        {/* Buttons */}
        <div className="mt-6 flex gap-3 justify-end">
          <Button
            label="Add Product"
            icon="pi pi-plus"
            onClick={() => addNewOtherUi(data.type)}
            outlined
            disabled={isDisabled}
          />
          <Button
            label="REMOVE"
            icon="pi pi-trash"
            severity="danger"
            onClick={() => handleRemoveUi(data.id, data.type)}
          />
        </div>

      </div>
    </Fieldset>

  );
}
