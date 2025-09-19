
export default function DemoInput({ item }: { item: { type: string, data: string[] } }) {
    return (
        <div>
            <div className="text-slate-600 border p-3 rounded shadow">
                <h1 className="font-semibold ">{item.type}</h1>
                <div className="space-y-3 mt-2">
                    {item.data.map((d, index) => (
                        <>
                            {

                                d === 'Other' ?
                                    <div className="flex gap-2">
                                        <p> Other </p>
                                        <input type="text" className='border-b-2 focus:outline-none focus:border-slate-500 w-[60%]' />
                                    </div> :
                                    <div key={index} className="flex gap-2">
                                        <input type="checkbox" value={d} name="" id="" />
                                        <p>{d}</p>
                                    </div>
                            }

                        </>

                    ))}
                </div>
            </div>
        </div>
    )
}
