import { useEffect, useState } from "react"
import { useSQLite } from "../utils/Sqlite";
import { Tag } from "primereact/tag";

export default function ShowRegisteredTab({ id, table_name = 'patients' }: { id: string, table_name?: string }) {
    const { db } = useSQLite();
    const [user, setUser] = useState<any>(null);
    useEffect(() => {
        console.log('oi' , id)
        async function fetchUserInfo() {
            try {
                if (!table_name) return;
                const res = await db?.query(`select * from ${table_name} where id = '${id}'`);
                setUser(res?.values?.[0]);
            } catch (error) {
                console.log(error);

            }
        }
        fetchUserInfo();
    }, [id, db, table_name])
    console.log(user)
    return (
        <div className="p-2 flex  ">
            {user &&
                <div className="text-slate-600 rounded-md my-4 border p-2 text-slate-500 text-sm font-semibold">
                    <p>This record has been registered with TAB ID: <Tag value={user?.tab_id}></Tag></p>
                </div>
            }
        </div>
    )
}
