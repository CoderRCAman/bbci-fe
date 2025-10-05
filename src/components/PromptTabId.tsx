import { IonAlert } from "@ionic/react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { useState } from "react";
import { useSQLite } from "../utils/Sqlite";

export default function PromptTabId({
  visible,
  setVisible,
}: {
  visible: boolean;
  setVisible: (v: boolean) => void;
}) {
  const { db } = useSQLite();
  const [tabId, setTabId] = useState<string>("");
  const [alert, setAlert] = useState({
    show: false,
    header: "",
    message: "",
  });
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
      await db?.run(query, [tabId]);
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
        header="Header"
        visible={visible}
        style={{ width: "50vw" }}
        onHide={() => {
          if (!visible) return;
          setVisible(false);
        }}
      >
        <FloatLabel>
          <InputText
            keyfilter="int"
            className="border-1 p-2"
            onChange={(e) => {
              setTabId(e.target.value);
            }}
          />
          <label>Enter Tablet Id</label>
          <Button
            label="Save"
            className="mt-4"
            disabled={!tabId?.trim()}
            onClick={() => {
              handleSave();
            }}
          />
          <IonAlert
            isOpen={alert.show}
            onDidDismiss={() => setAlert((a) => ({ ...a, show: false }))}
            header={alert.header}
            message={alert.message}
            buttons={["OK"]}
          />
        </FloatLabel>
      </Dialog>
    </div>
  );
}
