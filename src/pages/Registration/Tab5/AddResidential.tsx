import React from 'react'
import { FloatLabel } from 'primereact/floatlabel';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { RESIDENTIAL_TYPE } from './Tab5';



export default function AddResidential({ handleRemoveUi, data, setResidentialData }:
    { handleRemoveUi: any, data: RESIDENTIAL_TYPE, setResidentialData: React.Dispatch<React.SetStateAction<RESIDENTIAL_TYPE[]>> }) {
    const handleUpdate = (field: string, value: any) => {
        setResidentialData(d => d.map(
            item =>
                item.id == data.id ?
                    { ...item, [field]: value }
                    : item
        ))
    }

    return (
        <div className='border py-5 rounded-md p-2 space-y-8 flex  justify-between flex-row-reverse shadow-md'>
            <div className='-mt-2'>
                <Button label='X' raised outlined severity='danger'
                    className=' py-2 rounded-[500px] w-10 h-10 flex justify-center'
                    onClick={() => handleRemoveUi(data.id)}
                />
            </div>
            <div className='space-y-7 w-full'>

                <FloatLabel>
                    <InputText
                        keyfilter="int"
                        className="border-1 w-[50%] p-2"
                        value={data['from_age'].toString()}
                        onChange={e => handleUpdate('from_age', isNaN(parseInt(e.target.value)) ? 0 : parseInt(e.target.value))}
                    />
                    <label>From Age</label>
                </FloatLabel>
                <FloatLabel>
                    <InputText
                        keyfilter="int"
                        className="border-1 w-[50%] p-2"
                        value={data['to_age'].toString()}
                        onChange={e => handleUpdate('to_age', isNaN(parseInt(e.target.value)) ? 0 : parseInt(e.target.value))}
                    />
                    <label>To Age</label>
                </FloatLabel>
                <FloatLabel>
                    <InputText
                        name='city'
                        className="border-1 w-[50%] p-2"
                        value={data['city']}
                        disabled={data['village'] !== ''}
                        onChange={e => handleUpdate('city', e.target.value)}
                    />
                    <label>City</label>
                </FloatLabel>
                <FloatLabel>
                    <InputText
                        name='village'
                        className="border-1 w-[50%] p-2"
                        value={data['village']}
                        disabled={data['city'] !== ''}
                        onChange={e => handleUpdate('village', e.target.value)}
                    />
                    <label>Village</label>
                </FloatLabel>
                <FloatLabel>
                    <InputText
                        name='state'
                        className="border-1 w-[50%] p-2"
                        value={data['state']}
                        onChange={e => handleUpdate('state', e.target.value)}
                    />
                    <label>State</label>
                </FloatLabel>
                <Dropdown
                    optionLabel="name"
                    optionValue="value"
                    className="border-1"
                    placeholder="Code"
                    value={data['code']}
                    options={[
                        { name: "Urban", value: 1 },
                        { name: "Rural", value: 2 },
                        { name: "Semi Urban", value: 3 },
                    ]}
                    onChange={e => handleUpdate('code', e.target.value)}
                />
            </div>



        </div>
    )
}
