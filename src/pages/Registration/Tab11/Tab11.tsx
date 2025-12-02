import {
  IonAlert,
  IonContent,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
} from "@ionic/react";
import Header from "../../../components/Header";
import SmokingTobacco from "./SmokingTobacco";
import ChewingTobacco from "./ChewingTobacco";
import ChewingWithoutTobacco from "./ChewingWithoutTobacco";
import Alcohol from "./Alcohol";
import { Button } from "primereact/button";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Accordion, AccordionTab } from "primereact/accordion";
import {
  checkElibleToSave,
  initialState,
  populateWithBackend,
  saveToDBAlcohol,
  TOBACCO_ALCOHOL_CONSUMPION,
  TobaccoAlcoholConsumption,
  validateTobaccoAlcohol,
} from "./data";
import { useSQLite } from "../../../utils/Sqlite";
import shortUUID from "short-uuid";
import ShowRegisteredTab from "../../../components/ShowRegisteredTab";
import { useBlockNavigation } from "../../../utils/blockBackNavigation";
import RegistrationCrumbs from "../../../components/RegistrationCrumbs";
import { differenceInYears } from "date-fns";

export default function Tab11() {
  const [alert, setAlert] = useState({
    show: false,
    header: "",
    message: "",
  });
  const [allowNext, setAllowNext] = useState(false);
  const location = useLocation();
  const [id, setId] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);
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
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [isUnsaved, setIsUnsaved] = useState(false);
  const [ageLimit, setAgeLimit] = useState(-1);
  const [isDisabled, setIsDisabled] = useState(false);
  const resetProduct = (
    p: TOBACCO_ALCOHOL_CONSUMPION
  ): TOBACCO_ALCOHOL_CONSUMPION => ({
    ...p,
    consumes: 2,
    from_age: 0,
    to_age: 0,
    number_per_day: 0,
    days_in_week: 0,
    duration_placement_hr: 0,
    duration_placement_min: 0,
    site_of_placement_L: 0,
    site_of_placement_R: 0,
    site_of_placement_F: 0,
    site_of_placement_NA: 0,
    without_tobacco: 0,
    consumption_unit_per_day: 0,
    days_in_month: 0,
    product: p.is_other_product === 1 ? "" : p.product,
  });

  async function fetchInitialData() {
    const id = searchParams.get("id") || "";
    try {
      const res = await db?.query(`
                        select * from TOBACCO_ALCOHOL_CONSUMPTION where user_id = '${id}'
                    `);
      const res2 = await db?.query(`
                       select * from TOBACCO_ALCOHOL_CONSUMPTION_MASTER where user_id = '${id}'
                    `);
      const values = (res?.values as TOBACCO_ALCOHOL_CONSUMPION[]) || [];
      const masterValue = (res2?.values as initialState[]) || [];
      console.log(res, res2);
      if (values?.length > 0 || masterValue?.length > 0) setAllowNext(true);
      if (masterValue?.[0]?.tab_id) {
        console.log(tabId);
        setIsDisabled(masterValue?.[0]?.tab_id !== tabId);
      }

      const result = populateWithBackend(masterValue, values, id, tabId);
      setData(result);
      const res3 = await db?.query(
        `select * from patients where id = '${id}' ;`
      );
      setAgeLimit(
        differenceInYears(new Date(), new Date(res3?.values?.[0].dob))
      );
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    if (isUnsaved) return;
    setIsDisabled(false);
    fetchInitialData();
  }, [db, location.pathname]);
  useBlockNavigation(isUnsaved, () => {
    setAlert({
      show: true,
      header: "Unsaved Changes",
      message: "You have unsaved changes. Are you sure you want to leave?",
    });
  });
  const productChangedAfterReset = (oldP: any, resetP: any) => {
    return JSON.stringify(oldP) !== JSON.stringify(resetP);
  };

  const handleChangeMaster = (id: string, field: string, value: any) => {
    setIsUnsaved(true);

    setData((prevState) => {
      const updated = prevState.map((item) => {
        if (item.id !== id) return item;

        let updatedItem = { ...item, [field]: value };

        // RUN RESET ONLY WHEN consumed ≠ 1
        if (field === "consumed" && value !== 1) {
          const resetProducts = updatedItem.products.map((p) =>
            resetProduct(p)
          );

          // Replace all products with reset versions
          updatedItem = { ...updatedItem, products: resetProducts };

          // Detect duplicate "other" items
          const idsDeleted = resetProducts
            .filter((p) => p.is_other_product === 1)
            .map((p) => p.id);

          // Remove duplicates (keep first)
          if (idsDeleted.length > 1) {
            const toDelete = idsDeleted.slice(1);

            setDeletedIds(toDelete);

            updatedItem.products = updatedItem.products.filter(
              (p) => !toDelete.includes(p.id)
            );
          }

          // ⭐ DIRTY ONLY THE PRODUCTS THAT CHANGED
          setDirtyValuesProduct((prevDirty) => {
            let cleaned = [...prevDirty];

            // 1️⃣ Remove deleted IDs from dirty list
            cleaned = cleaned.filter(
              (p) =>
                !(idsDeleted.length > 1 && idsDeleted.slice(1).includes(p.id))
            );

            // 2️⃣ Remove all products of this type (since master reset)
            cleaned = cleaned.filter((p) => p.type !== item.type);

            // 3️⃣ Add only changed products (not all resetProducts)
            const productsToDirty: any[] = [];

            updatedItem.products.forEach((resetP, index) => {
              const oldP = item.products[index];
              if (productChangedAfterReset(oldP, resetP)) {
                productsToDirty.push(resetP);
              }
            });

            return [...cleaned, ...productsToDirty];
          });
        }

        return updatedItem;
      });

      // MASTER dirty tracking stays the same
      setDirtyValuesMaster((prev) => {
        const exists = prev.some((x) => x.id === id);
        if (exists) {
          return prev.map((item) =>
            item.id === id ? { ...item, [field]: value } : item
          );
        }
        const original = data.find((item) => item.id === id);
        if (!original) return prev;

        return [...prev, { ...original, [field]: value }];
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
    setIsUnsaved(true);

    setData((prev) =>
      prev.map((stateItem) => {
        if (stateItem.type !== type) return stateItem;

        const updatedProducts = stateItem.products.map((prod) => {
          if (prod.id !== id) return prod;

          let updated = { ...prod, [field]: value };

          // 1️⃣ RESET CASE
          if (field === "consumes" && value !== 1) {
            updated = resetProduct(updated);

            // dirty update for RESET
            setDirtyValuesProduct((prevDirty) => {
              const exists = prevDirty.some((p) => p.id === id);
              if (exists) {
                return prevDirty.map((p) =>
                  p.id === id && p.type === type ? updated : p
                );
              }
              return [...prevDirty, updated];
            });
          } else {
            // 2️⃣ NORMAL DIRTY UPDATE (when NOT resetting)
            setDirtyValuesProduct((prevDirty) => {
              const exists = prevDirty.some((p) => p.id === id);
              if (exists) {
                return prevDirty.map((p) =>
                  p.id === id && p.type === type ? updated : p
                );
              }
              return [...prevDirty, updated];
            });
          }

          return updated;
        });

        return { ...stateItem, products: updatedProducts };
      })
    );
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
    setIsUnsaved(true);
    setData((d) =>
      d.map((item) =>
        item.type === type
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
        .find((x) => x.type === type)
        ?.products.filter((x) => x.is_other_product).length === 1
    )
      return;
    setIsUnsaved(true);
    setDeletedIds((ids) => [...ids, id]);
    setData((d) =>
      d.map((item) =>
        item.type === type
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
      if (
        db &&
        !(await checkElibleToSave(
          db,
          id || "",
          tabId,
          "TOBACCO_ALCOHOL_CONSUMPTION_MASTER",
          "user_id"
        ))
      ) {
        return setAlert({
          header: "Restricted access",
          message: "This user was registered with a different tab id.",
          show: true,
        });
      }

      try {
        const userRes = await db?.query(`SELECT * FROM PATIENTS WHERE id = ?`, [
          id,
        ]);
        const userData = userRes?.values?.[0];
        validateTobaccoAlcohol(data, dirtyValuesProduct, userData.dob);
      } catch (error: any) {
        return setAlert({
          show: true,
          header: "Error",
          message: error.message,
        });
      }
      await saveToDBAlcohol(
        db,
        sqlite,
        dirtyValuesMaster,
        dirtyValuesProduct,
        deletedIds,
        id,
        tabId
      );
      setAlert({
        header: "Success",
        message: "Saved successfully",
        show: true,
      });
      setAllowNext(true);
      setIsUnsaved(false);
    } catch (error) {
      setAlert({
        header: "Error",
        message: "Something went wrong",
        show: true,
      });
    }
  }
  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await fetchInitialData();
    setIsUnsaved(false);
    event.detail.complete();
  };
  console.log(data);
  console.log(dirtyValuesMaster, dirtyValuesProduct, deletedIds);
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
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent
            className="spinner-only"
            refreshingSpinner="circles"
          />
        </IonRefresher>
        <RegistrationCrumbs currentPageLabel="Tobacco and Alcohol" />
        <ShowRegisteredTab
          id={id || ""}
          table_name="TOBACCO_ALCOHOL_CONSUMPTION_MASTER"
          field_name="user_id"
        />
        <main ref={scrollRef} className="p-2 space-y-10">
          <Accordion className="space-y-2 outline-none" activeIndex={0}>
            <AccordionTab
              className="border-1 rounded  border-slate-200"
              header="Smoking tobacco"
            >
              <SmokingTobacco
                handleChangeMaster={handleChangeMaster}
                data={data?.[0]}
                handleChangeProds={handleChangeProds}
                ageLimit={ageLimit}
                isDisabled={isDisabled}
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
                ageLimit={ageLimit}
                isDisabled={isDisabled}
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
                ageLimit={ageLimit}
                isDisabled={isDisabled}
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
                ageLimit={ageLimit}
                isDisabled={isDisabled}
              />
            </AccordionTab>
          </Accordion>
          <div className="flex justify-end ">
            <Button
              onClick={handleSave}
              label="Save"
              severity="success"
              icon="pi pi-check" // Added icon
              raised // Added for emphasis
              disabled={isDisabled}
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

        <div className="pt-10 pb-2 px-2 flex justify-between gap-2">
          <Link to={"/tab9?id=" + id}>
            <Button
              className="px-10 py-2 rounded"
              label="PREV"
              icon="pi pi-arrow-left" // Added icon
              severity="secondary" // Use secondary style
              outlined
            />
          </Link>
          <Link to={"/tab12?id=" + id}>
            <Button
              className="px-10 py-2 rounded"
              label="NEXT"
              icon="pi pi-arrow-right" // Added icon
              severity="secondary" // Use secondary style
              outlined
            />
          </Link>
        </div>
        <Button
          icon="pi pi-arrow-up"
          // WindiCSS classes for styling and position
          className={`
                fixed bottom-20 right-6 
                p-button-rounded p-button-secondary shadow-lg
                transition-opacity duration-300
                
              `} // <-- Fixed broken string
          style={{ zIndex: 2000 }}
          onClick={() => {
            console.log("HELLo");
            if (scrollRef.current)
              scrollRef.current.scrollIntoView({ behavior: "smooth" });
          }}
        />
        <div className="pb-[250px]"></div>
      </IonContent>
    </IonPage>
  );
}
