import { SQLiteConnection } from "@capacitor-community/sqlite";
import { isPlatform, getPlatforms } from '@ionic/react';
export const generateUniqueId = (name = "") => {
  const timestamp = Date.now();
  const cleanName =
    name
      .toLowerCase()
      .split(" ")[0]
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 8) || "user";

  return `${cleanName}_${timestamp}`;
};

export const getMisMatchFields = (obj1: any, obj2: any) => {
  const keys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
  const mismatched = [];

  for (const key of keys) {
    if (obj1[key] !== obj2[key]) {
      mismatched.push(key);
    }
  }

  return mismatched;
};

export const saveToStore = async (sqlite: SQLiteConnection | null) => {
  try {
    if (isPlatform('mobileweb') || isPlatform('desktop'))
      await sqlite?.saveToStore('patientdb');
  } catch (error) {
    console.log(error)
  }
}