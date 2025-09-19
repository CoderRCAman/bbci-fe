import { Button } from "primereact/button";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { TOBACCO_ALCOHOL_CONSUMPION } from "./Tab11";

export default function OtherProdWithTobacco({
    data, handleRemoveUi, setOtherProd
    , addNewOtherUi
}: {
    addNewOtherUi: any
    data: TOBACCO_ALCOHOL_CONSUMPION,
    handleRemoveUi: any
    setOtherProd: React.Dispatch<React.SetStateAction<TOBACCO_ALCOHOL_CONSUMPION[]>>
}) {
    return (
        <div className="mt-5">
            <div className="border p-2 rounded space-y-1">
                <h1>Other</h1>

                <div className="flex gap-2">
                    <p> Specify</p>
                    <input type="text" className='border-b-2 focus:outline-none focus:border-slate-500 w-[60%]' />

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
                <div className="mt-3 flex gap-2 justify-end">
                    <Button
                        label='Add Product below'
                        className="rounded px-10 py-2"
                        onClick={() => addNewOtherUi()}
                    />
                    <Button
                        onClick={() => handleRemoveUi(data.id)}
                        label='REMOVE'
                        className="rounded px-10 py-2"
                        severity="danger"
                    />
                </div>
            </div>

        </div>
    )
}
