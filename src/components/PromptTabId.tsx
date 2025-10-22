import { IonAlert, IonToast } from "@ionic/react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { useEffect, useState } from "react";
import { useSQLite } from "../utils/Sqlite";
import { saveToStore } from "../utils/helper";
import { Dropdown } from "primereact/dropdown";

export default function PromptTabId() {
  const { db, sqlite, tabId, setTabId } = useSQLite();
  const [tabInput, setTabInput] = useState("");
  const [visible, setVisible] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    header: "",
    message: "",
  });
  useEffect(() => {
    if (tabId !== "t") setTabInput(tabId || "");
    setVisible(tabId ? false : true);
  }, [tabId]);
  const handleSave = async () => {
    try {
      if (!tabId) {
        setAlert({
          show: true,
          header: "Error",
          message: "Tab Id cannot be empty.",
        });
      }
      const query = `
         INSERT OR REPLACE INTO tablet_data (id, tab_id) VALUES (1, ?); 
        `;
      await db?.run(query, [tabInput]);
      await saveToStore(sqlite);
      setTabId(tabInput);
      setVisible(false);
      setAlert({
        show: true,
        header: "Success",
        message: "Tab Id saved successfully.",
      });
    } catch (error) {
      setAlert({
        show: true,
        header: "Error",
        message: "Failed to save Tab Id. Please try again.",
      });
    }
  };
  return (
    <div>
      <Dialog
        header="Tablet regstration"
        visible={visible}
        style={{ width: "50vw" }}
        onHide={() => {
          if (!visible) return;
          //   setVisible(false);
        }}

      >
        <main className="py-5">
          {/* <FloatLabel>
            <InputText
              className="border-1 p-2"
              value={tabInput}
              onChange={(e) => {
                setTabInput(e.target.value);
              }}
            />
            <label>Enter Tablet Id</label>
          </FloatLabel> */}
          <div>
            <p>Select tablet Id</p>
            <Dropdown
              onChange={(e) => setTabInput(e.value)}
              optionLabel="name"
              value={tabInput}
              className="border-1"
              placeholder="Select empoloyee code"
              options={[
                { name: "TAB1 GREEN", value: "TAB1_GREEN" },
                { name: "TAB2 BLUE ", value: "TAB2_BLUE" },
              ]}
            />
          </div>
          <Button
            label="Save"
            className="mt-4"
            disabled={!tabInput?.trim()}
            onClick={() => {
              handleSave();
            }}
          />
          <IonToast
            trigger={alert.show ? "show-toast" : undefined}
            message={alert.message}
            duration={5000}
          ></IonToast>
        </main>
      </Dialog>
    </div>
  );
}
