import {
  SQLiteConnection,
  SQLiteDBConnection,
} from "@capacitor-community/sqlite";
import shortUUID from "short-uuid";
import { saveToStore } from "../../../utils/helper";
export interface TOBACCO_ALCOHOL_CONSUMPION {
  id: string;
  user_id: string;
  type:
    | "smoking_tobacco"
    | "chewing_tobacco"
    | "chewing_without_tobacco"
    | "alcohol";
  product?: string;
  consumes?: number;
  from_age?: number;
  to_age?: number;
  number_per_day?: number;
  days_in_week?: number;
  days_in_month?: number;
  duration_placement_hr?: number;
  duration_placement_min?: number;
  site_of_placement_L?: number; //0 or 1
  site_of_placement_R?: number; //0 or 1
  site_of_placement_F?: number; //0 or 1
  site_of_placement_NA?: number; //0 or 1
  without_tobacco?: number; // 0 or 1
  consumption_unit_per_day?: number; // for alcohol
  is_other_product?: number; // 0 or 1
  master_id?: string;
  tab_id?: string;
}

export interface initialState {
  type:
    | "smoking_tobacco"
    | "chewing_tobacco"
    | "chewing_without_tobacco"
    | "alcohol";
  consumed: number;
  products: TOBACCO_ALCOHOL_CONSUMPION[];
  id: string;
  tab_id?: string;
  user_id?: string;
}

export class TobaccoAlcoholConsumption {
  id: string = "";
  user_id: string = "";
  type:
    | "smoking_tobacco"
    | "chewing_tobacco"
    | "chewing_without_tobacco"
    | "alcohol" = "smoking_tobacco";
  product: string = "";
  consumes: number = 2;
  from_age: number = 0;
  to_age: number = 0;
  number_per_day: number = 0;
  days_in_week: number = 0;
  duration_placement_hr: number = 0;
  duration_placement_min: number = 0;
  site_of_placement_L: number = 0;
  site_of_placement_R: number = 0;
  site_of_placement_F: number = 0;
  site_of_placement_NA: number = 0;
  without_tobacco: number = 0;
  consumption_unit_per_day: number = 0;
  is_other_product: number = 0;
  master_id: string = "";
  tab_id: string = "";
  days_in_month: number = 0;
  constructor(init?: Partial<TobaccoAlcoholConsumption>) {
    Object.assign(this, { ...this, ...init });
  }
}

export const generateDefaultState = (
  user_id: string,
  masterData: initialState[],
  tab_id: string
) => {
  const translator = shortUUID();
  const smokingProdArr = [
    "Manufactured Cigarette",
    "Bidi (Manufactured/Roll your own)",
  ];
  const smokingProds = smokingProdArr.map((item) => {
    return new TobaccoAlcoholConsumption({
      id: translator.generate(),
      product: item,
      type: "smoking_tobacco",
    });
  });
  smokingProds.push(
    new TobaccoAlcoholConsumption({
      id: translator.generate(),
      product: "",
      type: "smoking_tobacco",
      is_other_product: 1,
    })
  );

  const chewingTobaccoArr = [
    "Tobacco Only",
    "Tobacco with Lime(Khaini)",
    "Betel quid (pan) with tobacco",
  ];
  const chewingTobaccoProds = chewingTobaccoArr.map((item) => {
    return new TobaccoAlcoholConsumption({
      id: translator.generate(),
      product: item,
      type: "chewing_tobacco",
    });
  });
  chewingTobaccoProds.push(
    new TobaccoAlcoholConsumption({
      id: translator.generate(),
      product: "",
      type: "smoking_tobacco",
      is_other_product: 1,
    })
  );

  const chewing_without_tobaccoArr = ["Paan (betel leaf) without areca nut"];

  const chewing_without_tobaccoProds = chewing_without_tobaccoArr.map(
    (item) => {
      return new TobaccoAlcoholConsumption({
        id: translator.generate(),
        product: "",
        type: "chewing_without_tobacco",
      });
    }
  );

  chewing_without_tobaccoProds.push(
    new TobaccoAlcoholConsumption({
      id: translator.generate(),
      product: "",
      type: "chewing_without_tobacco",
      is_other_product: 1,
    })
  );

  const alcoholArr = [
    "Beer",
    "Whisky",
    "Vodka",
    "Rum",
    "Wine",
    "Breezer",
    "Local",
  ];
  const alcoholProds = alcoholArr.map((item) => {
    return new TobaccoAlcoholConsumption({
      id: translator.generate(),
      product: item,
      type: "alcohol",
    });
  });
  alcoholProds.push(
    new TobaccoAlcoholConsumption({
      id: translator.generate(),
      product: "",
      type: "alcohol",
      is_other_product: 1,
    })
  );

  const findExisting = (type: initialState["type"]) =>
    masterData?.find((item) => item.type === type);

  const initialState: initialState[] = [
    // 1. Smoking Tobacco
    findExisting("smoking_tobacco")
      ? {
          // Preserve existing ID, consumed status, and other fields
          ...findExisting("smoking_tobacco")!,
          // Safely overwrite the products list with the new default array
          products: smokingProds,
        }
      : {
          // If no existing data, create a new default master record
          type: "smoking_tobacco",
          consumed: 2,
          products: smokingProds,
          id: translator.generate(),
        },

    // 2. Chewing Tobacco
    findExisting("chewing_tobacco")
      ? {
          // Preserve existing properties
          ...findExisting("chewing_tobacco")!,
          // Safely overwrite the products list
          products: chewingTobaccoProds,
        }
      : {
          // New default master record
          type: "chewing_tobacco",
          consumed: 2,
          products: chewingTobaccoProds,
          id: translator.generate(),
        },

    // 3. Chewing Without Tobacco
    findExisting("chewing_without_tobacco")
      ? {
          // Preserve existing properties
          ...findExisting("chewing_without_tobacco")!,
          // Safely overwrite the products list
          products: chewing_without_tobaccoProds,
        }
      : {
          // New default master record
          type: "chewing_without_tobacco",
          consumed: 2,
          products: chewing_without_tobaccoProds,
          id: translator.generate(),
        },

    // 4. Alcohol
    findExisting("alcohol")
      ? {
          // Preserve existing properties
          ...findExisting("alcohol")!,
          // Safely overwrite the products list
          products: alcoholProds,
        }
      : {
          // New default master record
          type: "alcohol",
          consumed: 2,
          products: alcoholProds,
          id: translator.generate(),
        },
  ];
  return initialState;
};

export const populateWithBackend = (
  masterData: initialState[],
  backendData: TOBACCO_ALCOHOL_CONSUMPION[],
  user_id: string | "",
  tab_id: string
) => {
  const translator = shortUUID();
  const defaultState = generateDefaultState(user_id, masterData, tab_id);
  const normalize = (str?: string) => (str || "").trim().toLowerCase();
  // Group backend data by type
  const backendByType: Record<string, TOBACCO_ALCOHOL_CONSUMPION[]> = {};
  backendData?.forEach((item) => {
    if (!backendByType[item.type]) backendByType[item.type] = [];
    backendByType[item.type].push(item);
  });

  return defaultState.map((defaultGroup) => {
    const type = defaultGroup.type;
    const backendProducts = backendByType[type] || [];

    let mergedProducts: TOBACCO_ALCOHOL_CONSUMPION[] = [];

    const defaultProducts = defaultGroup?.products?.filter(
      (p) => !p.is_other_product
    );
    const hasBackendOther = backendProducts?.some(
      (p) => p.is_other_product === 1
    );

    if (backendProducts.length > 0) {
      // If backend has data for this type, merge it with defaults
      for (const defaultProduct of defaultProducts) {
        const match = backendProducts.find(
          (p) =>
            normalize(p.product) === normalize(defaultProduct.product) &&
            !p.is_other_product
        );

        if (match) {
          mergedProducts.push(match);
        } else {
          mergedProducts.push(defaultProduct);
        }
      }

      // Handle other product
      if (hasBackendOther) {
        const other = backendProducts?.filter((p) => p.is_other_product === 1);
        if (other.length > 0) mergedProducts = [...mergedProducts, ...other];
      } else {
        mergedProducts.push(
          new TobaccoAlcoholConsumption({
            id: translator.generate(),
            user_id,
            type,
            product: "",
            is_other_product: 1,
          })
        );
      }
      return {
        type: type,
        consumed: defaultGroup.consumed, // ✅ Mark as consumed
        products: mergedProducts,
        id: defaultGroup.id,
      };
    } else {
      // No data from backend — use default products as-is (but still ensure 'Other' exists)
      const products = [...defaultProducts];

      // Add "Other" product
      products.push(
        new TobaccoAlcoholConsumption({
          id: translator.generate(),
          user_id,
          type,
          product: "",
          is_other_product: 1,
        })
      );

      return {
        type: type,
        consumed: defaultGroup.consumed,
        products,
        id: defaultGroup.id,
      };
    }
  });
};

export const checkElibleToSave = async (
  db: SQLiteDBConnection,
  user_id: string,
  tab_id: string,
  table_name: string = "patients",
  field_name: string = "id"
) => {
  try {
    if (!table_name) return false;
    const res = await db.query(
      `select * from ${table_name} where ${field_name} = '${user_id}'`
    );
    const user = res?.values?.[0];
    if (!user) return true;
    if (user.tab_id !== tab_id) return false;
    return true;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
export const saveToDBAlcohol = async (
  db: SQLiteDBConnection,
  sqlite: SQLiteConnection,
  dirtyMaster: initialState[],
  dirtyProds: TOBACCO_ALCOHOL_CONSUMPION[],
  deletedIds: string[],
  user_id: string,
  tab_id: string
) => {
  console.log(dirtyMaster);
  try {
    const queryM = `
    INSERT INTO TOBACCO_ALCOHOL_CONSUMPTION_MASTER (
      id,
      type,
      user_id,
      consumed,
      tab_id,
      created_at
    ) VALUES (?, ?, ?, ?, ?,?)
    ON CONFLICT(id) DO UPDATE SET
      type = excluded.type,
      user_id = excluded.user_id,
      consumed = excluded.consumed,
      tab_id = excluded.tab_id;
  `;

    for (const data of dirtyMaster) {
      const values = [
        data.id,
        data.type,
        user_id,
        data.consumed,
        tab_id,
        new Date().toLocaleString("sv-SE").replace("T", " "),
      ];
      await db.run(queryM, values);
    }

    const query = `
    INSERT INTO TOBACCO_ALCOHOL_CONSUMPTION (
      id, user_id, type, product, consumes, from_age, to_age, number_per_day,
      days_in_week, days_in_month, duration_placement_hr, duration_placement_min,
      site_of_placement_L, site_of_placement_R, site_of_placement_F, site_of_placement_NA,
      without_tobacco, consumption_unit_per_day, is_other_product, tab_id, master_id , created_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? , ?
    )
    ON CONFLICT(id) DO UPDATE SET
      user_id = excluded.user_id,
      type = excluded.type,
      product = excluded.product,
      consumes = excluded.consumes,
      from_age = excluded.from_age,
      to_age = excluded.to_age,
      number_per_day = excluded.number_per_day,
      days_in_week = excluded.days_in_week,
      days_in_month = excluded.days_in_month,
      duration_placement_hr = excluded.duration_placement_hr,
      duration_placement_min = excluded.duration_placement_min,
      site_of_placement_L = excluded.site_of_placement_L,
      site_of_placement_R = excluded.site_of_placement_R,
      site_of_placement_F = excluded.site_of_placement_F,
      site_of_placement_NA = excluded.site_of_placement_NA,
      without_tobacco = excluded.without_tobacco,
      consumption_unit_per_day = excluded.consumption_unit_per_day,
      is_other_product = excluded.is_other_product,
      tab_id = excluded.tab_id,
      master_id = excluded.master_id;
  `;

    for (const data of dirtyProds) {
      const values = [
        data.id,
        user_id,
        data.type,
        data.product,
        data.consumes,
        data.from_age,
        data.to_age,
        data.number_per_day,
        data.days_in_week,
        data.days_in_month,
        data.duration_placement_hr,
        data.duration_placement_min,
        data.site_of_placement_L,
        data.site_of_placement_R,
        data.site_of_placement_F,
        data.site_of_placement_NA,
        data.without_tobacco,
        data.consumption_unit_per_day,
        data.is_other_product,
        tab_id,
        data.master_id,
        new Date().toLocaleString("sv-SE").replace("T", " "),
      ];

      await db.run(query, values);
    }
    await db?.run(
      `delete from TOBACCO_ALCOHOL_CONSUMPTION where id in ('${deletedIds.join(
        "','"
      )}')`
    );
    await saveToStore(sqlite);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export function validateTobaccoAlcohol(
  dirtyValuesMaster: initialState[],
  dirtyValuesProduct: TOBACCO_ALCOHOL_CONSUMPION[],
  userDob: string
) {
  const birthYear = new Date(userDob).getFullYear();
  const currentYear = new Date().getFullYear();
  const userAge = currentYear - birthYear; 

  const productsByType = dirtyValuesProduct.reduce((acc, product) => {
    acc[product.type] = acc[product.type] || [];
    acc[product.type].push(product);
    return acc;
  }, {} as Record<string, TOBACCO_ALCOHOL_CONSUMPION[]>); 

  for (const masterItem of dirtyValuesMaster) {
    // Only check if the master item is marked as consumed
    if (masterItem.consumed === 1) {
      const productType = masterItem.type;
      const associatedProducts = productsByType[productType]; 

      if (!associatedProducts || associatedProducts.length === 0) {
        throw new Error(
          `Consumption details are required for ${productType}. Please add product details.`
        );
      } 

      for (const product of associatedProducts) {
        
        if (!product.product || product.product.trim() === "") {
          throw new Error(
            `Product name cannot be empty for ${productType} when consumption is active.`
          );
        } 

        if (typeof product.to_age !== "number" || product.to_age <= 0) {
          throw new Error(
            `To age must be greater than 0 for ${productType} consumption.`
          );
        }
      }
    }
  } 

  for (const item of dirtyValuesProduct) {
    const { from_age, to_age } = item;

    if (from_age !== undefined) {
      if (from_age < 0) {
        throw new Error(`From age cannot be negative.`);
      }
      if (from_age > userAge) {
        throw new Error(
          `From age (${from_age}) cannot exceed patient's age (${userAge}).`
        );
      }
    }

    if (to_age !== undefined) {
      
      if (to_age < 0) {
        throw new Error(`To age cannot be negative.`);
      }
      if (to_age > userAge) {
        throw new Error(
          `To age (${to_age}) cannot exceed patient's age (${userAge}).`
        );
      }
    }

    if (from_age !== undefined && to_age !== undefined && from_age > to_age) {
      throw new Error(
        `From age (${from_age}) cannot be greater than to age (${to_age}).`
      );
    }
  }
}
