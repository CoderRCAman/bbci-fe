import axios from 'axios';
import { Button } from 'primereact/button';
import React, { useState } from 'react'
import { useSQLite } from '../utils/Sqlite';
interface DATA_TYPE {
    id: string,
    data:
    {
        field: string,
        value: any
    }[]

}
export default function HandleSelect({ items, setAlert, fetchPatients }: {
    items: any[],
    setAlert: any
    fetchPatients: any
}) {
    const { baseUrl } = useSQLite();
    const [sendData, setSendData] = useState<DATA_TYPE[]>([]);
    const { db, sqlite } = useSQLite();
    const handleUpdate = async () => {
        console.log(sendData[0], items?.slice(0, -3));
        if (sendData.length == 0) return;
        const isToUpdate = items?.slice(0, -3)?.every(item => sendData[0].data.some(d => d.field === item.Field)) //validate if every record is present 
        if (!isToUpdate) {
            return;
        }
        try {
            const res = await axios.put(
                `${baseUrl}/api/patient`,
                sendData[0]
            )
            const afterSave = res.data?.data;
            console.log(afterSave);
            if (res.status == 200) {
                setAlert({
                    show: true,
                    header: 'Success!',
                    message: res.data?.message
                })
                //update actually in the database!
                await db?.run(`
                    UPDATE patients SET 
                        name = '${afterSave?.Name}',
                        age = ${afterSave?.Age},
                        gender = '${afterSave?.Gender}',
                        lat = ${afterSave?.Lat},
                        long = ${afterSave?.Long},
                        dob = '${afterSave?.Dob}',
                        updated_by = '${afterSave?.Updated_By}',
                        i_emp_code = '${afterSave?.I_Emp_Code}',
                        i_name = '${afterSave?.I_Name}',
                        time = '${afterSave?.Time}',
                        date = '${afterSave?.Date}',
                        _rev = '${afterSave?._rev}'
                    where id = '${afterSave?.Id}'
                    `);
                await db?.run(`
                    UPDATE tracksync SET 
                    synch = 1 
                    where patient_id = '${afterSave?.Id}'    
                `)
               await sqlite?.saveToStore('patientdb');
                await fetchPatients();
            }
        } catch (error) {
            console.log(error)
            setAlert({
                show: true,
                header: 'Error during record update',
                message: 'Something went wrong !'
            })
        }
    }
    const isSelected = (id: string, field: string, value: any) => {
        // Find the record by id
        const record = sendData.find(r => r.id === id);
        if (!record) return false;

        // Check if field-value pair exists in record.data
        return record.data.some(d => d.field === field && d.value === value);
    };
    const handleSelect = (id: string, field: string, value: any) => {
        setSendData((prevData) => {
            // Check if record with this id exists
            const existingRecordIndex = prevData.findIndex(x => x.id === id);

            if (existingRecordIndex !== -1) {
                // Record exists: update or add field inside data array

                const existingRecord = prevData[existingRecordIndex];

                // Check if field exists in data
                const fieldIndex = existingRecord.data.findIndex(f => f.field === field);

                let newDataForRecord;

                if (fieldIndex !== -1) {
                    // Field exists — update its value
                    newDataForRecord = [...existingRecord.data];
                    newDataForRecord[fieldIndex] = { field, value };
                } else {
                    // Field does not exist — add new field-value pair
                    newDataForRecord = [...existingRecord.data, { field, value }];
                }

                // Create updated record
                const updatedRecord = {
                    ...existingRecord,
                    data: newDataForRecord,
                };

                // Build new array with updated record
                return [
                    ...prevData.slice(0, existingRecordIndex),
                    updatedRecord,
                    ...prevData.slice(existingRecordIndex + 1),
                ];

            } else {
                // Record doesn't exist — add new record
                return [
                    ...prevData,
                    {
                        id,
                        data: [{ field, value }],
                    },
                ];
            }
        });
    };
    return (
        <div>
            {items?.slice(0, -3).map((item, index) => (
                <div key={index} className="grid grid-cols-5 gap-2 border-b pb-5">
                    <div>
                        <p className="font-semibold">FIELD </p>
                        <div className="p-2  bg-red-200 rounded-md mt-2 ">
                            {item?.Field}
                        </div>
                    </div>
                    <div className="col-span-4 flex flex-col items-end">
                        <p className="font-semibold">CHANGES</p>
                        <div className="space-y-2">
                            <div
                                style={{
                                    borderColor: isSelected(items?.at(-1).Value1, item?.Field, item?.Value1) ? '#34d399' : '#f87171'
                                }}
                                onClick={() => handleSelect(items?.at(-1).Value1, item?.Field, item?.Value1)} className="border-red-200 border-2 px-4 w-full py-2 rounded-md">
                                {item?.Value1}{" "}
                                <span className="text-xs">(YOUR CHANGES)</span>
                            </div>
                            <div
                                style={{
                                    borderColor: isSelected(items?.at(-1).Value1, item?.Field, item?.Value2) ? '#34d399' : '#f87171'
                                }}
                                className="border-red-200 border-2 px-4 py-2  rounded-md"
                                onClick={() => handleSelect(items?.at(-1).Value1, item?.Field, item?.Value2)}
                            >
                                {item?.Value2}{" "}
                                <span className="text-xs">(Value in server)</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            <div className='flex justify-end'>
                <Button onClick={handleUpdate} label='Update Record' className='px-5 py-2 rounded-full mt-2 text-sm font-semibold' />
            </div>

        </div>
    )
}
