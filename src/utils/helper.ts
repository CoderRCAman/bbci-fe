import { SQLiteConnection, SQLiteDBConnection } from "@capacitor-community/sqlite";
import { isPlatform, getPlatforms } from '@ionic/react';
export const generateUniqueId = () => {
  const prefix = "ZGC";

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const random6 = Math.floor(100000 + Math.random() * 900000);

  return `${prefix}${year}${month}${day}/${random6}`;
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

export const fetchCurrentUserDetails = async (db: SQLiteDBConnection | null, id: string) => {
  try {
    if (!db) return null;
    const result = await db?.query(`SELECT * FROM patients WHERE id = ? `, [id]);
    if (result.values)
      return result?.values[0];
    return null;
  } catch (error) {
    console.log(error);
  }
}