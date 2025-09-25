import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";

export default function SampleCollectionType() {
    return (
        <div className="border rounded p-2 my-5 space-y-5">
            <div className="flex items-center gap-4">
                <p className="">
                    Blood Collection Tube:
                </p>
                <Dropdown
                    optionLabel="name"
                    optionValue="value"
                    className="border-1"
                    placeholder="Select"
                    style={{ width: '250px' }}
                    options={[
                        { name: "EDTA", value: "EDTA" },
                        { name: "SST", value: "SST" },
                        { name: "SST-With Gel", value: "SST-With Gel" },
                        { name: "Other", value: "Other" },
                    ]}
                />
            </div>


            <div className="flex gap-5 items-center">
                <p>Identific code of the Blood collection tube</p>
                <InputText
                    className="border-1 p-2"
                />
            </div>

            <div className="flex gap-5 items-center">
                <p>Volume (ml)</p>
                <InputText
                    className="border-1 p-2"
                />
            </div>

            <div className="flex gap-5 items-center">
                <p>Select sample characteristic*</p>
                <Dropdown
                    optionLabel="name"
                    optionValue="value"
                    className="border-1"
                    placeholder="Select"
                    style={{ width: '250px' }}
                    options={[
                        { name: "Normal-1111", value: "Normal-1111" },
                        { name: "Hemolysed-2222", value: "Hemolysed-2222" },
                        { name: "Lipemic-3333", value: "Lipemic-3333" },
                        { name: "Ictric-4444", value: "Ictric-4444" },
                        { name: "Clotted-5555", value: "Clotted-5555" },
                    ]}
                />
            </div>
            <div className='flex justify-end gap-3'>
                <Button label='Add more' className='px-10 py-3 rounded-full' severity='info' />
                <Button label='Remove' className='px-10 py-3 rounded-full' severity='danger' />
            </div>
        </div>
    )
}
