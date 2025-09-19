import { FloatLabel } from "primereact/floatlabel"
import { InputText } from "primereact/inputtext"
import { TOBACCO_ALCOHOL_CONSUMPION } from "./Tab11"
import { useEffect, useState } from "react"
import shortUUID from "short-uuid"
import OtherAlcohol from "./OtherAlcohol"

const data = [
    {
        product: 'Beer',
    }
    ,
    {
        product: 'Whisky'
    },
    {
        product: 'Vodka'
    },
    {
        product: 'Rum'
    },
    {
        product: 'Wine'
    },
    {
        product: 'Breezer'
    },
    {
        product: 'North-east'
    }
]
export default function Alcohol() {

    const [otherProd, setOtherProd] = useState<TOBACCO_ALCOHOL_CONSUMPION[]>([])
    useEffect(() => {
        if (otherProd.length === 0) addNewOtherUi();
    }, [])
    const addNewOtherUi = () => {
        console.log('hello')
        const translator = shortUUID();
        let newProd: TOBACCO_ALCOHOL_CONSUMPION = {
            type: 'alcohol',
            user_id: 'test_id',
            id: translator.new(),
        }
        setOtherProd(d => [...d, newProd])
    }
    const handleRemoveUi = (id: string) => {
        if (otherProd.length === 1) return;
        setOtherProd(d => d.filter(x => x.id !== id));
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
                        <input type="radio" /> Refused to answer</div>
                </div>
            </div>
            <div className="mt-2 space-y-2 text-slate-600">
                {
                    data.map((item, index) => (
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
                {otherProd.map((item, index) => (
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
