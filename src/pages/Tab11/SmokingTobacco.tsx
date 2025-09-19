import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
const data = [
    {
        product: "Manufactured Cigarette"
    },
    {
        product: "Bidi (Manufactured/Roll your own)"
    }
]
export default function SmokingTobacco() {
    return (
        <div className="space-y-2 border p-3 shadow rounded">
            <h1 className="text-slate-600 font-semibold">
                Smoking Tobacco
            </h1>
            <div className="text-slate-600 ">
                <p className="">Have you ever smoked regularly? </p>
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
                <div className="mt-2 space-y-2">
                    {data.map((item, index) => (
                        <div key={index} className="border p-2 rounded space-y-1">
                            <h1>{item.product}</h1>
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
                            </div>
                        </div>
                    ))}

                    {/* -------------------------------------------------------------- */}

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
                        </div>

                    </div>


                </div>
            </div>
        </div>
    )
}
