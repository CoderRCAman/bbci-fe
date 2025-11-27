// --- Add these imports from primereact ---
import { Card } from 'primereact/card';
import { Checkbox } from 'primereact/checkbox';
import { InputText } from 'primereact/inputtext';
import { FloatLabel } from 'primereact/floatlabel';
// --- (Keep your DEMOGRAPHIC_INFO import) ---
import { DEMOGRAPHIC_INFO } from "./Tab12";

export default function DemoInput({
  item,
  data,
  handleChange,
  isDisabled
}: {
  item: { type: string; data: string[]; field: string };
  handleChange: (type: string, value: string) => void;
  data: DEMOGRAPHIC_INFO;
  isDisabled: boolean
}) {
  return (
    // 1. Use <Card> as the main container, removing old styles
    <Card className="shadow-lg border">
      {/* 2. Add the sticky header for the title */}
      <div
        className="sticky top-0 text-center py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
        style={{ zIndex: 10 }}
      >
        <h1 className="font-semibold text-primary-600 dark:text-primary-300 text-lg m-0">
          {item?.type}
        </h1>
      </div>

      {/* 3. Add padding and spacing to the content area */}
      <div className="space-y-4 p-4">
        {item?.data?.map((d, index) => (
          <div key={index}>
            {d === "Other" ? (
              // 4. Preserve your "Other" logic
              !item?.data?.includes(
                data?.[item.field as keyof DEMOGRAPHIC_INFO] || ""
              ) && (
                // 5. Enhance the Ḍtext input with <FloatLabel> and <InputText>
                <div className="p-fluid mt-6"> {/* p-fluid for full width */}
                  <FloatLabel>
                    <InputText
                      value={
                        data?.[item.field as keyof DEMOGRAPHIC_INFO] || ""
                      }
                      onChange={(e) =>
                        handleChange(item?.field, e.target.value)
                      }
                      disabled={isDisabled}
                    />
                    <label>Other (Specify)</label>
                  </FloatLabel>
                </div>
              )
            ) : (
              // 6. Enhance the checkbox input with <Checkbox>
              <div className="flex align-items-center gap-3">
                <Checkbox
                  inputId={`${item?.field}_${index}`}
                  value={d}
                  name={item?.field}
                  // 7. Preserve your checked and onChange logic
                  checked={
                    data?.[item.field as keyof DEMOGRAPHIC_INFO] === d
                  }
                  onChange={(e) =>
                    handleChange(item?.field, e.checked ? d : "")
                  } 
                  disabled={isDisabled}
                />
                <label htmlFor={`${item?.field}_${index}`}>{d}</label>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}