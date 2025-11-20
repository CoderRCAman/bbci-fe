import { FloatLabel } from "primereact/floatlabel";
import { INDOOR_AIR_POLLUTION } from "./Tab9";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";

export default function AddIndoorAirPollution({
  handleRemoveUi,
  data,
  setIndoorAirData,
  setIsUnsaved
}: {
  handleRemoveUi: any;
  data: INDOOR_AIR_POLLUTION;
  setIndoorAirData: React.Dispatch<
    React.SetStateAction<INDOOR_AIR_POLLUTION[]>
  >;
  setIsUnsaved: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const handleUpdate = (field: string, value: any) => {
    setIsUnsaved(true);
    setIndoorAirData((d) =>
      d.map((item) => (item.id == data.id ? { ...item, [field]: value } : item))
    );
  };
  return (
    <div className="border py-10 rounded-md p-4 space-y-8 shadow-md">
      <FloatLabel>
        <InputText
          keyfilter="int"
          className="border-1 w-[50%] p-2"
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
          className="border-1 w-[50%] p-2"
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
      <div className="space-y-2">
        <p className="text-slate-500">Most Common Cooking Fuel</p>
        <Dropdown
          optionLabel="name"
          optionValue="value"
          className="border-1"
          placeholder="Select Most Common Cooking Fuel"
          value={data["most_common_cooking_fuel"]}
          options={[
            { name: "Gas", value: 0 },
            { name: "Wood", value: 1 },
            { name: "Coal", value: 2 },
            { name: "Crop residue / Cow dung", value: 3 },
            { name: "Kerosen / Stove", value: 4 },
            { name: "Electric heater / Induction", value: 5 },
            { name: "Microwave oven", value: 6 },
          ]}
          onChange={(e) =>
            handleUpdate("most_common_cooking_fuel", e.target.value)
          }
        />
      </div>
      <div className="border p-2 rounded space-y-2">
        <p className="text-sm text-slate-500">
          How long you stay in place where cooking is being done
        </p>
        <div className="flex gap-2 font-semibold items-center text-sm text-slate-500">
          <div>HOUR</div>

          <InputText
            className="border  w-[60px] text-sm text-center"
            keyfilter={"int"}
            value={data["hours"] == -1 ? "" : data["hours"].toString()}
            onChange={(e) => handleUpdate("hours", e.target.value)}
          />
          <div>:</div>

          <InputText
            className="border  w-[60px] text-center"
            keyfilter={"int"}
            value={data["minutes"] == -1 ? "" : data["minutes"].toString()}
            onChange={(e) => handleUpdate("minutes", e.target.value)}
          />
          <div>MINUTES</div>
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-slate-500">Ventilaton in Kitchen </p>
        <Dropdown
          optionLabel="name"
          optionValue="value"
          className="border-1"
          placeholder="Select Ventilation in Kitchen"
          value={data["ventilation"]}
          options={[
            { name: "Cooking done outside", value: 0 },
            { name: "Exhaust fan", value: 1 },
            { name: "Window", value: 2 },
            { name: "Chimney", value: 3 },
            { name: "No ventilation", value: 4 },
            { name: "Others(Specify)", value: 5 },
          ]}
          onChange={(e) => handleUpdate("ventilation", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <p className="text-slate-500">Level of smokiness</p>
        <Dropdown
          optionLabel="name"
          optionValue="value"
          className="border-1"
          placeholder="Select Level of smokiness"
          value={data["smokiness"]}
          options={[
            { name: "No Smokiness", value: 0 },
            { name: "Little smoke", value: 1 },
            { name: "Much, but not enough to irritate the eyes", value: 2 },
            { name: "Smokiness enough to irritate the eyes", value: 3 },
          ]}
          onChange={(e) => handleUpdate("smokiness", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <p className="text-slate-500">Where do you do most of your cooking?</p>
        <Dropdown
          optionLabel="name"
          optionValue="value"
          className="border-1"
          placeholder="Select Where do you do most of your cooking?"
          value={data["most_cooking"]}
          options={[
            { name: "Indoor in main living area", value: 0 },
            { name: "Indoor in Kitchen", value: 1 },
            { name: "Outdoor, In shed", value: 2 },
            { name: "Outdoor, in open air", value: 3 },
          ]}
          onChange={(e) => handleUpdate("most_cooking", e.target.value)}
        />
      </div>

      <div>
        <Button
          label="- Remove"
          raised
          severity="danger"
          className="px-10 py-2 rounded-md"
          onClick={() => handleRemoveUi(data.id)}
        />
      </div>
    </div>
  );
}
