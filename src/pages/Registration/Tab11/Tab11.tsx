import { IonAlert, IonContent, IonPage } from "@ionic/react";
import Header from "../../../components/Header";
import SmokingTobacco from "./SmokingTobacco";
import ChewingTobacco from "./ChewingTobacco";
import ChewingWithoutTobacco from "./ChewingWithoutTobacco";
import Alcohol from "./Alcohol";
import { Button } from "primereact/button";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Accordion, AccordionTab } from "primereact/accordion";
import {
  checkElibleToSave,
  initialState,
  populateWithBackend,
  saveToDBAlcohol,
  TOBACCO_ALCOHOL_CONSUMPION,
} from "./data";
import { useSQLite } from "../../../utils/Sqlite";
import shortUUID from "short-uuid";

export default function Tab11() {
  const [alert, setAlert] = useState({
    show: false,
    header: "",
    message: "",
  });
  const [allowNext, setAllowNext] = useState(false);
  const location = useLocation();
  const [id, setId] = useState<string>("");
  const searchParams = new URLSearchParams(location.search);
  useEffect(() => {
    setId(searchParams?.get("id") || "");
  }, [location.pathname]);
  const { db, sqlite, tabId } = useSQLite();
  const [data, setData] = useState<initialState[]>([]);
  const [dirtyValuesProduct, setDirtyValuesProduct] = useState<
    TOBACCO_ALCOHOL_CONSUMPION[]
  >([]);
  const [dirtyValuesMaster, setDirtyValuesMaster] = useState<initialState[]>(
    []
  );
  useEffect(() => {
    async function fetchInitialData() {
      const id = searchParams.get("id") || "";
      try {
        const res = await db?.query(`
                        select * from TOBACCO_ALCOHOL_CONSUMPTION where user_id = '${id}'
                    `);
        const res2 = await db?.query(`
                       select * from TOBACCO_ALCOHOL_CONSUMPTION_MASTER where user_id = '${id}'
                    `);
        const values = res?.values as TOBACCO_ALCOHOL_CONSUMPION[];
        const masterValue = res2?.values as initialState[];
        if (values?.length > 0 || masterValue?.length > 0) setAllowNext(true);
        console.log(res);
        const result = populateWithBackend(masterValue, values, id, tabId);
        setData(result);
      } catch (error) {
        console.log(error);
      }
    }
    fetchInitialData();
  }, [db, location.pathname]);
  const handleChangeMaster = (id: string, field: string, value: any) => {
    setData((prevState) => {
      const updated = prevState.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      });
      const updatedItem = updated.find((item) => item.id === id);
      setDirtyValuesMaster((prev) => {
        const exists = prev.some((x) => x.id === id);

        if (exists) {
          // Update the field in the existing object
          return prev.map((item) =>
            item.id === id ? { ...item, [field]: value } : item
          );
        }

        // Find the full updated item from your main data source
        const updatedItem = data.find((item) => item.id === id);
        if (!updatedItem) return prev; // Fallback: shouldn't happen, but safe to handle

        // Add new entry to dirty state, with updated field
        return [...prev, { ...updatedItem, [field]: value }];
      });
      return updated;
    });
  };

  const handleChangeProds = (
    id: string,
    type: string,
    field: string,
    value: any
  ) => {
    console.log(type, id, field, value);
    setData((prev) => {
      const updatedStates = prev.map((stateItem) => {
        // ✅ only modify this state group if its product_type matches
        if (stateItem.product_type !== type) {
          return stateItem;
        }

        const updatedProducts = stateItem.products.map((prod) => {
          if (prod.id === id) {
            const updated = { ...prod, [field]: value };

            // ✅ Track this in dirty list
            setDirtyValuesProduct((prevDirty) => {
              const exists = prevDirty.find((p) => p.id === id);
              if (exists) {
                // update existing
                return prevDirty.map((p) =>
                  p.id === id && p.type === type ? updated : p
                );
              } else {
                // insert new
                return [...prevDirty, updated];
              }
            });

            return updated;
          }
          return prod;
        });

        return { ...stateItem, products: updatedProducts };
      });

      return updatedStates;
    });
  };

  const addNewOtherUi = (
    type:
      | "smoking_tobacco"
      | "chewing_tobacco"
      | "chewing_without_tobacco"
      | "alcohol"
  ) => {
    const id = searchParams.get("id") || "";
    const translator = shortUUID();
    let newProd: TOBACCO_ALCOHOL_CONSUMPION = {
      type: type,
      user_id: id,
      id: translator.generate(),
      is_other_product: 1,
    };
    setData((d) =>
      d.map((item) =>
        item.product_type === type
          ? { ...item, products: [...item.products, newProd] }
          : item
      )
    );
  };
  const handleRemoveUi = (
    id: string,
    type:
      | "smoking_tobacco"
      | "chewing_tobacco"
      | "chewing_without_tobacco"
      | "alcohol"
  ) => {
    if (
      data
        .find((x) => x.product_type === type)
        ?.products.filter((x) => x.is_other_product).length === 1
    )
      return;
    setData((d) =>
      d.map((item) =>
        item.product_type === type
          ? {
              ...item,
              products: item.products.filter((x) => x.id !== id),
            }
          : item
      )
    );
  };

  async function handleSave() {
    try {
      if (!db || !sqlite) return;
      if (db && !(await checkElibleToSave(db, id || "", tabId))) {
        return setAlert({
          header: "Restricted access",
          message: "This user was registered with a different tab id.",
          show: true,
        });
      }
      await saveToDBAlcohol(
        db,
        sqlite,
        dirtyValuesMaster,
        dirtyValuesProduct,
        id,
        tabId
      );
      setAlert({
        header: "Success",
        message: "Saved successfully",
        show: true,
      });
      setAllowNext(true);
    } catch (error) {
      setAlert({
        header: "Error",
        message: "Something went wrong",
        show: true,
      });
    }
  }

  console.log(dirtyValuesMaster, dirtyValuesProduct, data);

  return (
    <IonPage>
      <Header
        title={
          0
            ? "Edit Tobacco and Alcohol Consumption"
            : "Tobacco and Alcohol Consumption"
        }
      />
      <IonContent class="" fullscreen>
        <main className="p-2 space-y-10">
          <Accordion className="space-y-2 outline-none" activeIndex={0}>
            <AccordionTab
              className="border-1 rounded  border-slate-200"
              header="Smoking tobacco"
            >
              <SmokingTobacco
                handleChangeMaster={handleChangeMaster}
                data={data?.[0]}
                handleChangeProds={handleChangeProds}
              />
            </AccordionTab>
            <AccordionTab
              className="border-1 rounded  border-slate-200"
              header="Chewing tobacco"
            >
              <ChewingTobacco
                data={data?.[1]}
                handleChangeMaster={handleChangeMaster}
                handleChangeProds={handleChangeProds}
                addNewOtherUi={addNewOtherUi}
                handleRemoveUi={handleRemoveUi}
              />
            </AccordionTab>
            <AccordionTab
              className="border-1 rounded  border-slate-200"
              header="Chewing without tobacco"
            >
              <ChewingWithoutTobacco
                data={data?.[2]}
                addNewOtherUi={addNewOtherUi}
                handleRemoveUi={handleRemoveUi}
                handleChangeMaster={handleChangeMaster}
                handleChangeProds={handleChangeProds}
              />
            </AccordionTab>
            <AccordionTab
              className="border-1 rounded  border-slate-200"
              header="Alcohol"
            >
              <Alcohol
                data={data?.[3]}
                addNewOtherUi={addNewOtherUi}
                handleRemoveUi={handleRemoveUi}
                handleChangeMaster={handleChangeMaster}
                handleChangeProds={handleChangeProds}
              />
            </AccordionTab>
          </Accordion>
          <div className="flex justify-end ">
            <Button
              label="Save"
              severity="success"
              className="py-2"
              onClick={handleSave}
            />
          </div>
        </main>
        <IonAlert
          isOpen={alert.show}
          onDidDismiss={() => setAlert((a) => ({ ...a, show: false }))}
          header={alert.header}
          message={alert.message}
          buttons={["OK"]}
        />
        <div className="pt-10 pb-2 px-2 flex justify-end gap-2">
          <Link to={"/tab9?id=" + id}>
            <Button className="px-10 py-2 rounded" label="PREV" />
          </Link>
          <Link to={"/tab12?id=" + id}>
            <Button className="px-10 py-2 rounded" label="NEXT" />
          </Link>
        </div>
      </IonContent>
    </IonPage>
  );
}
