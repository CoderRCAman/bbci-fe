import { DataTable } from "primereact/datatable";
import { useSQLite } from "../utils/Sqlite";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Link } from "react-router-dom";

export default function ShowConflicts({ conflictedList }: { conflictedList: any[] }) {
  console.log(conflictedList);
  return (
    <div className=" show_conflict_bg  border-round-md p-2 mt-5 bg-danger">
      <p>
        These rows were not updated due to conflict errors. Please manually fix
        them.
      </p>
      <div className="">
        <DataTable
          value={conflictedList?.map((item) => ({
            id: item?.at(-1)?.Value2,
            name: item?.at(-3)?.Value2,
            updated_by: item?.at(-2)?.Value2,
          }))}
          className="bg-white text-black"
        >
          <Column field="id" header="Id"></Column>
          <Column field="name" header="Name"></Column>
          <Column field="updated_by" header="Updated By"></Column>
        </DataTable>
        <Link
          to={"/tab4"} // this is for fixing conflicts
        >
          <Button
            className="px-5 py-2 border-round-md mt-2"
            severity="danger"
            label="Fix me!"
          />
        </Link>
      </div>
    </div>
  );
}
