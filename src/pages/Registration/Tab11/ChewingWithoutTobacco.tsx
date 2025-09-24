import { FloatLabel } from 'primereact/floatlabel'
import { InputText } from 'primereact/inputtext'
import React, { useEffect, useState } from 'react'

import shortUUID from 'short-uuid'
import OtherProdWithTobacco from './OtherProdWithTobacco'
import { initialState, TOBACCO_ALCOHOL_CONSUMPION } from './data'

export default function ChewingWithoutTobacco({ data }: { data: initialState }) {
    const [otherProd, setOtherProd] = useState<TOBACCO_ALCOHOL_CONSUMPION[]>([])
    useEffect(() => {
        if (otherProd.length === 0) addNewOtherUi();
    }, [])
    const addNewOtherUi = () => {
        console.log('hello')
        const translator = shortUUID();
        let newProd: TOBACCO_ALCOHOL_CONSUMPION = {
            type: 'chewing_tobacco',
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
                Chewing Without Tobacco
            </h1>
            <div className="text-slate-600">
                <p className="">Have you ever chewed without tobacco regularly? </p>
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
                <div className="border p-2 rounded space-y-1">
                    <h1>Paan (betel leaf) without areca nut</h1>
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
                            <p>Total duration of placement per day.</p>
                            <div className="flex gap-2 font-semibold text-sm text-slate-500">
                                <div>HOUR</div>
                                <div>
                                    <InputText
                                        className="border  w-[30px] text-center"
                                        keyfilter={'int'}
                                    />
                                </div>
                                <div>:</div>
                                <div>
                                    <InputText
                                        className="border  w-[30px] text-center"
                                        keyfilter={'int'}
                                    /></div>
                                <div>MINUTES</div>

                            </div>
                        </div>
                        <div>
                            <p>Site of placement</p>
                            <div className="flex gap-8">
                                <div>
                                    <input type="checkbox" name="" id="" /> L
                                </div>

                                <div>
                                    <input type="checkbox" name="" id="" /> R
                                </div>
                                <div>
                                    <input type="checkbox" name="" id="" /> F
                                </div>
                                <div>
                                    <input type="checkbox" name="" id="" /> n/a
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
                {/* -------------------------------------------------------------- */}
                <div>
                    {otherProd.map((item, index) => (
                        <OtherProdWithTobacco
                            key={index}
                            data={item}
                            handleRemoveUi={handleRemoveUi}
                            setOtherProd={setOtherProd}
                            addNewOtherUi={addNewOtherUi}
                        />

                    ))}
                </div>

            </div>
        </div>
    )
}
