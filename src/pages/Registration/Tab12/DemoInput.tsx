import { DEMOGRAPHIC_INFO } from "./Tab12";

export default function DemoInput({
  item,
  data,
  handleChange,
}: {
  item: { type: string; data: string[],field : string };
  handleChange: (type: string, value: string) => void;
  data: DEMOGRAPHIC_INFO;
}) {

  return (
    <div>
      <div className="text-slate-600 border p-3 rounded shadow">
        <h1 className="font-semibold ">{item.type}</h1>
        <div className="space-y-3 mt-2">
          {item.data.map((d, index) => (
            <div key={index}>
              {d === "Other" ? (
                !item.data.includes(
                  data?.[item.type as keyof DEMOGRAPHIC_INFO] || ""
                ) && (
                  <div  className="flex gap-2">
                    <p> Other </p>
                    <input
                      value={data?.[item.field as keyof DEMOGRAPHIC_INFO] || ""}
                      type="text"
                      onChange={(e) => handleChange(item.field, e.target.value)}
                      className="border-b-2 focus:outline-none focus:border-slate-500 w-[60%]"
                    />
                  </div>
                )
              ) : (
                <div  className="flex gap-2">
                  <input
                    type="checkbox"
                    value={d}
                    name=""
                    id=""
                    checked={data?.[item.field as keyof DEMOGRAPHIC_INFO] === d}
                    onChange={(e) =>
                      handleChange(item.field, e.target.checked ? d : "")
                    }
                  />
                  <p>{d}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
