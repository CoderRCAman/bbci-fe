import { FloatLabel } from "primereact/floatlabel"
import { InputText } from "primereact/inputtext"
import { useEffect, useState } from "react"
import shortUUID from "short-uuid"
import OtherAlcohol from "./OtherAlcohol"
import { initialState, TOBACCO_ALCOHOL_CONSUMPION, TobaccoAlcoholConsumption } from "./data"
import { produce } from "immer"

export default function Alcohol({ data, user_id, setData }: { data: initialState, user_id: string, setData: React.Dispatch<React.SetStateAction<initialState[]>> }) {

    const [otherProd, setOtherProd] = useState<TOBACCO_ALCOHOL_CONSUMPION[]>([])
    console.log(data)
    const addNewOtherUi = () => {
        console.log('hello')
        const translator = shortUUID();
        setData(prev => produce(prev, draftState => {
            draftState[3].products.push(new TobaccoAlcoholConsumption({
                id: translator.generate(),
                product: '',
                type: 'alcohol',
                is_other_product: 1
            }))
        }))
    }
    const handleRemoveUi = (id: string) => {
        if (data?.products.filter(item => item.is_other_product).length > 0) {
            setData(prev => produce(prev, draftState => {
                draftState[3].products = draftState[3].products.filter(item => item.id !== id)
            }))
        }
    }
    return (
        <div className="p-3 border mt-5 shadow space-y-2">
            <h1 className="font-semibold text-slate-600">
                Alcohol
            </h1>
            <div className="text-slate-600">
                <p className="">Have you ever consumed regularly alcoholid beverages?</p>
                <div className="flex gap-5">
                    <div>
                        <input type="radio" /> YES
                    </div>
                    <div>
                        <input type="radio" /> NO
                    </div>
                    <div>
                        <input type="radio" /> DON'T KNOW
                    </div>
                    <div>
                        <input type="radio" /> Refused to answer
                    </div>
                </div>
            </div>
            <div className="mt-2 space-y-2 text-slate-600">
                {
                    data?.products?.filter(x => !x.is_other_product)
                        .map((item, index) => (
                            <div key={index} className="border p-2 rounded space-y-1">
                                <h1 className="text-slate-700 font-semibold">{item.product}</h1>
                                <div className="flex gap-2">
                                    <div><input type="radio" /> YES</div>
                                    <div><input type="radio" /> NO</div>
                                </div>
                                <div className="space-y-5 pt-4">
                                    <div>
                                        <FloatLabel>
                                            <InputText
                                                keyfilter="int"
                                                className="border-1 p-2"
                                            />
                                            <label>From age</label>
                                        </FloatLabel>
                                    </div>
                                    <div>
                                        <FloatLabel>
                                            <InputText
                                                keyfilter="int"
                                                className="border-1 p-2"
                                            />
                                            <label>To age</label>
                                        </FloatLabel>
                                    </div>
                                    <div>
                                        <FloatLabel>
                                            <InputText
                                                keyfilter="int"
                                                className="border-1 p-2"
                                            />
                                            <label>Number per day</label>
                                        </FloatLabel>
                                    </div>
                                    <div>
                                        <FloatLabel>
                                            <InputText
                                                keyfilter="int"
                                                className="border-1 p-2"
                                            />
                                            <label>Days in a week</label>
                                        </FloatLabel>
                                    </div>

                                    <div>
                                        <p>Days in a week or Days in a Month</p>
                                        <div className="space-y-4">
                                            <div className="flex gap-2">
                                                <p> Week</p>
                                                <input type="number" className='border-b-2 focus:outline-none focus:border-slate-500 w-[20%]' />
                                            </div>
                                            <div className="flex gap-2">
                                                <p> Month</p>
                                                <input type="number" className='border-b-2 focus:outline-none focus:border-slate-500 w-[20%]' />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-10">
                                        <div>
                                            <FloatLabel>
                                                <InputText
                                                    keyfilter="int"
                                                    className="border-1 p-2 w-[60%] "
                                                />
                                                <label>Consumption Unit per day *(ml/ Glass)</label>
                                            </FloatLabel>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        ))
                }

            </div>
            {/* ----------------------------------------------------- */}
            <div>
                {data?.products?.filter(item => item.is_other_product).map((item, index) => (
                    <OtherAlcohol
                        key={index}
                        data={item}
                        handleRemoveUi={handleRemoveUi}
                        setOtherProd={setOtherProd}
                        addNewOtherUi={addNewOtherUi}
                    />

                ))}
            </div>
        </div>
    )
}
