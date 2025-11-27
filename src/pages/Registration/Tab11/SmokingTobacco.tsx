import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { initialState, TOBACCO_ALCOHOL_CONSUMPION } from "./data";
import { RadioButton } from "primereact/radiobutton";
import { Card } from "primereact/card";
import { Fieldset } from "primereact/fieldset";
const test = [
  {
    product: "Manufactured Cigarette",
  },
  {
    product: "Bidi (Manufactured/Roll your own)",
  },
];
export default function SmokingTobacco({
  data,
  handleChangeMaster,
  handleChangeProds,
  ageLimit,
  isDisabled
}: {
  data: initialState;
  handleChangeMaster: (id: string, field: string, value: any) => void;
  handleChangeProds: (
    id: string,
    type: string,
    field: string,
    value: any
  ) => void;
  ageLimit: number;
  isDisabled: boolean
}) {
  // Helper array for the master radio buttons 
  console.log(data)
  const masterOptions = [
    { name: "YES", value: 1 },
    { name: "NO", value: 2 },
    { name: "DON'T KNOW", value: 8 },
    { name: "Refused to answer", value: 9 },
  ];

  return (
    // Use a <Card> for a premium container
    <Card className="shadow-lg ">
      <div
        className="sticky -mt-10 top-0 text-center py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
        style={{ zIndex: 10 }}
      >
        <h1 className="font-semibold text-primary-600 dark:text-primary-300 text-lg m-0">
          Smoking Tobacco
        </h1>
      </div>
      <div className="space-y-6 mt-6">
        {" "}
        {/* Increased vertical spacing */}
        <div className="text-slate-600 dark:text-gray-300">
          <p className="font-semibold mb-3">Have you ever smoked regularly?</p>
          {/* Use a grid for a cleaner radio layout */}
          <div className="grid grid-cols-2 gap-4">
            {masterOptions.map((option) => (
              <div key={option.value} className="flex align-items-center gap-2">
                <RadioButton
                  inputId={`master_consumed_${option.value}`}
                  name="master_consumed"
                  value={option.value}
                  // Use optional chaining and simplified check
                  checked={data?.consumed === option.value}
                  onChange={(e) =>
                    handleChangeMaster(
                      data?.id, // Use optional chain
                      "consumed",
                      parseInt(e.value)
                    )
                  }
                  disabled={isDisabled}
                />
                <label htmlFor={`master_consumed_${option.value}`}>
                  {option.name}
                </label>
              </div>
            ))}
          </div>
        </div>
        {/* This div will contain all the product fieldsets */}
        <div className="mt-4 space-y-4">
          {data?.products
            ?.filter((x) => x?.is_other_product !== 1)
            .map((item, index) => (
              // Use a <Fieldset> for each product
              <Fieldset
                key={item?.id || index}
                legend={item?.product}
                toggleable
              >
                {/* Add p-fluid to make inputs full-width */}
                <div className="p-fluid space-y-7">
                  <div className="flex gap-5">
                    <div className="flex align-items-center gap-2">
                      <RadioButton
                        inputId={`${item?.id}_consumes_1`}
                        name={`consumes_${item?.id}`}
                        value={1}
                        checked={item?.consumes === 1}
                        onChange={(e) =>
                          handleChangeProds(
                            item?.id,
                            item?.type || "",
                            "consumes",
                            parseInt(e.value)
                          )
                        }
                        disabled={data?.consumed !== 1 || isDisabled}
                      />
                      <label htmlFor={`${item?.id}_consumes_1`}>YES</label>
                    </div>
                    <div className="flex align-items-center gap-2">
                      <RadioButton
                        inputId={`${item?.id}_consumes_2`}
                        name={`consumes_${item?.id}`}
                        value={2}
                        checked={item?.consumes === 2}
                        onChange={(e) =>
                          handleChangeProds(
                            item?.id,
                            item?.type || "",
                            "consumes",
                            parseInt(e.value)
                          )
                        }
                        disabled={data?.consumed !== 1 || isDisabled}
                      />
                      <label htmlFor={`${item?.id}_consumes_2`}>NO</label>
                    </div>
                  </div>

                  {/* Inputs grouped together */}
                  <FloatLabel>
                    <InputText
                      keyfilter="int"
                      type="number"
                      // Removed 'border-1 p-2'
                      value={item?.from_age?.toString() || ""} // Handle null/undefined
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (raw === "") {
                          handleChangeProds(item?.id, item?.type || "", "from_age", "");
                          return;
                        }
                        let num = parseInt(raw);
                        if (num > ageLimit) num = ageLimit;
                        handleChangeProds(item?.id, item?.type || "", "from_age", num);
                      }
                      }
                      disabled={data?.consumed !== 1 || item?.consumes !== 1 || isDisabled}
                    />
                    <label>From age</label>
                  </FloatLabel>

                  <FloatLabel>
                    <InputText
                      keyfilter="int"
                      type="number"
                      // Removed 'border-1 p-2'
                      value={item?.to_age?.toString() || ""}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (raw === "") {
                          handleChangeProds(item?.id, item?.type || "", "to_age", "");
                          return;
                        }
                        let num = parseInt(raw);
                        if (num > ageLimit) num = ageLimit;
                        handleChangeProds(item?.id, item?.type || "", "to_age", num);
                      }
                      }
                      disabled={data?.consumed !== 1 || item?.consumes !== 1 || isDisabled}
                    />
                    <label>To age</label>
                  </FloatLabel>

                  <FloatLabel>
                    <InputText
                      keyfilter="int"
                      type="number"
                      // Removed 'border-1 p-2'
                      value={item?.number_per_day?.toString() || ""}
                      onChange={(e) =>
                        handleChangeProds(
                          item?.id,
                          item?.type || "",
                          "number_per_day",
                          e.target.value ? parseInt(e.target.value) : ""
                        )
                      }
                      disabled={data?.consumed !== 1 || item?.consumes !== 1 || isDisabled}
                    />
                    <label>Number per day</label>
                  </FloatLabel>

                  <FloatLabel>
                    <InputText
                      keyfilter="int"
                      type="number"
                      // Removed 'border-1 p-2'
                      value={item?.days_in_week?.toString() || ""}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (raw === "") {
                          handleChangeProds(item?.id, item?.type || "", "days_in_week", "");
                          return;
                        }
                        let num = parseInt(raw);
                        if (num > 7) num = 7;
                        handleChangeProds(item?.id, item?.type || "", "days_in_week", num);
                      }
                      }
                      disabled={data?.consumed !== 1 || item?.consumes !== 1 || isDisabled}
                    />
                    <label>Days in a week</label>
                  </FloatLabel>
                </div>
              </Fieldset>
            ))}

          {/* -------------------------------------------------------------- */}
          {/* "Other" Section */}
          {data?.products
            ?.filter((p) => p?.is_other_product === 1)
            .map((p, index) => (
              <Fieldset key={p?.id || index} legend="Other" toggleable>
                <div className="p-fluid space-y-7">
                  {/* Replaced plain input with PrimeReact FloatLabel/InputText */}
                  <FloatLabel>
                    <InputText
                      value={p?.product || ""}
                      onChange={(e) =>
                        handleChangeProds(
                          p?.id,
                          p?.type || "",
                          "product",
                          e.target.value
                        )
                      }
                      disabled={data?.consumed !== 1 || isDisabled}
                    />
                    <label>Specify Other</label>
                  </FloatLabel>

                  <FloatLabel>
                    <InputText
                      keyfilter="int"
                      type="number"
                      // Removed 'border-1 p-2'
                      value={p?.from_age?.toString() || ""}
                      onChange={(e) =>
                        handleChangeProds(
                          p.id,
                          p.type || "",
                          "from_age",
                          e.target.value === "" ? "" : Math.min(parseInt(e.target.value), ageLimit)
                        )
                      }
                      disabled={data?.consumed !== 1 || isDisabled}
                    />
                    <label>From age</label>
                  </FloatLabel>

                  <FloatLabel>
                    <InputText
                      keyfilter="int"
                      type="number"
                      // Removed 'border-1 p-2'
                      value={p?.to_age?.toString() || ""}
                      onChange={(e) =>
                        handleChangeProds(
                          p.id,
                          p.type || "",
                          "to_age",
                          e.target.value === "" ? "" : Math.min(parseInt(e.target.value), ageLimit)
                        )
                      }
                      disabled={data?.consumed !== 1 || isDisabled}
                    />
                    <label>To age</label>
                  </FloatLabel>

                  <FloatLabel>
                    <InputText
                      keyfilter="int"
                      type="number"
                      // Removed 'border-1 p-2'
                      value={p?.number_per_day?.toString() || ""}
                      onChange={(e) =>
                        handleChangeProds(
                          p?.id,
                          p?.type || "",
                          "number_per_day",
                          e.target.value ? parseInt(e.target.value) : ""
                        )
                      }
                      disabled={data?.consumed !== 1 || isDisabled}
                    />
                    <label>Number per day</label>
                  </FloatLabel>

                  <FloatLabel>
                    <InputText
                      keyfilter="int"
                      type="number"
                      // Removed 'border-1 p-2'
                      value={p?.days_in_week?.toString() || ""}
                      onChange={(e) =>
                        handleChangeProds(
                          p.id,
                          p.type || "",
                          "days_in_week",
                          e.target.value === "" ? "" : Math.min(parseInt(e.target.value), 7)
                        )
                      }
                      disabled={data?.consumed !== 1 || isDisabled}
                    />
                    <label>Days in a week</label>
                  </FloatLabel>
                </div>
              </Fieldset>
            ))}
        </div>
      </div>
    </Card>
  );
}
