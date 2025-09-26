import { IonContent, IonPage } from '@ionic/react'
import { useEffect, useState } from 'react'
import Header from '../../../components/Header'
import { useLocation } from 'react-router';
import { useSQLite } from '../../../utils/Sqlite';
import SampleCollectionType from './SampleCollectionType';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import shortUUID from 'short-uuid';

export interface BLOOD_SAMPLE_COLLECTION {
    blood_collection_tube: string,
    blood_collection_tube_other: string,
    identification_code_tube: string,
    volume: number,
    characteristic: string,
    id: string,
}

class BloodSample implements BLOOD_SAMPLE_COLLECTION {
    blood_collection_tube: string = '';
    blood_collection_tube_other: string = '';
    identification_code_tube: string = '';
    volume: number = 0;
    characteristic: string = '';
    id: string = '';
    constructor(init?: Partial<BLOOD_SAMPLE_COLLECTION>) {
        Object.assign(this, { ...this, ...init });
    }
    // You can add methods here if needed
}

export default function BloodPage2() {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const [id, setId] = useState('');
    const { db, sqlite } = useSQLite();
    const [participant, setParticipants] = useState<any | null>(null);
    const [sampleCollectionDate, setSampleCollectionDate] = useState(new Date())
    const [sampleCollectionTime, setSampleCollectionTime] = useState('')
    const [bloodSampleCollectionTube, setBloodSampleCollectionTube] = useState<BLOOD_SAMPLE_COLLECTION[]>([])
    console.log(bloodSampleCollectionTube)
    useEffect(() => {
        const curId = searchParams.get('id') || ''
        setId(curId);
        async function fetchCurrentUser() {
            try {
                const query = `
                        select * from patients where id = '${curId}'
                    `
                const res = await db?.query(query);
                setParticipants(res?.values?.[0]);

            } catch (error) {
                console.log(error);
            }
        }
        fetchCurrentUser();
    }, [location.pathname, db])

    const addNewCollectionTube = () => {
        const translator = shortUUID();
        const newSample = new BloodSample(
            {
                blood_collection_tube: '',
                blood_collection_tube_other: '',
                identification_code_tube: '',
                volume: 0,
                characteristic: '',
                id: translator.generate()
            }
        )
        setBloodSampleCollectionTube(prev => [...prev, newSample])
    }
    const removeCollectionTube = (id: string) => {
        if (bloodSampleCollectionTube.length === 1) return;
        setBloodSampleCollectionTube(prev => prev.filter(item => item.id !== id))
    }

    useEffect(() => {
        if (bloodSampleCollectionTube.length > 0) return;
        addNewCollectionTube();
    }, [location.pathname])




    return (
        <>
            <IonPage>
                <Header title={"Blood sample report"} />
                <IonContent fullscreen>
                    <main className='p-2' >
                        <div className="p-2 shadow border rounded text-slate-600">
                            <p className="text-lg  font-semibold">Participant's details</p>
                            <div>
                                <span className="font-semibold">ID: </span> <span>{participant?.id}</span>
                            </div>
                            <div>
                                <span className="font-semibold">Name: </span> <span>{participant?.name}</span>
                            </div>
                        </div>
                        <div className='mt-10 p-2 py-5 shadow border rounded text-slate-600'>
                            <div className='flex items-center gap-5'>
                                <p className='font-semibold'>Blood sample collected</p>
                                <div className='flex gap-1'>
                                    <input name='collected' type="radio" />
                                    <p>YES</p>
                                </div>
                                <div className='flex gap-1'>
                                    <input type="radio" name='collected' />
                                    <p>NO</p>
                                </div>
                            </div>
                            {
                                bloodSampleCollectionTube.map((item, index) =>
                                    <SampleCollectionType
                                        addNewCollectionTube={addNewCollectionTube}
                                        key={index} 
                                        data={item}
                                        removeCollectionTube={removeCollectionTube}
                                        setBloodSampleCollectionTube={setBloodSampleCollectionTube}
                                    />
                                )
                            }


                            <div>
                                <p className='font-semibold'>Sample Classification (Please tick in the appropriate option)</p>
                                <div className='space-y-3'>
                                    <div className='flex gap-4'>
                                        <p>a. Category B(UN3373)[Non-Biohazard]</p>
                                        <input type='checkbox' name='sample_classification' />
                                    </div>
                                    <div className='flex gap-4'>
                                        <p>b. Category A(UN2814)[Biohazard]</p>
                                        <input type='checkbox' name='sample_classification' />
                                    </div>
                                    <div className='flex gap-4'>
                                        <p>c. Don't Know</p>
                                        <input type='checkbox' name='sample_classification' />
                                    </div>
                                </div>
                            </div>

                            <div className='flex mt-10 gap-5 items-center'>
                                <p className='font-semibold'>Date of blood sample collection</p>
                                <Calendar
                                    className="border-1 p-2 focus:outline-none p-2"

                                    value={sampleCollectionDate}
                                    onChange={(e) => setSampleCollectionDate(e.value || new Date())}
                                    showIcon
                                />
                            </div>
                            <div className='flex mt-10 gap-5 items-center'>
                                <p className='font-semibold'>Time of blood sample collection</p>
                                <div className='flex gap-1'>
                                    <div>
                                        <input type="text" className='w-8 border rounded focus:outline-none text-center' />
                                        <input type="text" className='w-8 border rounded focus:outline-none text-center' />
                                    </div>
                                    <span className='font-bold text-lg'>:</span>
                                    <div>
                                        <input type="text" className='w-8 border rounded focus:outline-none text-center' />
                                        <input type="text" className='w-8 border rounded focus:outline-none text-center' />
                                    </div>
                                    <div className='flex cursor-pointer text-sm'>
                                        <div className='border flex items-center  px-2 rounded'>AM</div>
                                        <div className='border flex items-center  px-2 rounded'>PM</div>
                                    </div>
                                </div>
                            </div>
                            <div className='mt-10 space-y-2'>
                                <p className='font-semibold'>Date and Time of last meal subject had before blood sample collection</p>
                                <div className='flex gap-5 items-center'>
                                    <p>Date</p>
                                    <Calendar
                                        className="border-1 p-2 focus:outline-none p-2"
                                        showIcon
                                    />
                                </div>
                                <div className='flex gap-5 items-center'>
                                    <p>Time</p>
                                    <div className='flex gap-1'>
                                        <div>
                                            <input type="text" className='w-8 border rounded focus:outline-none text-center' />
                                            <input type="text" className='w-8 border rounded focus:outline-none text-center' />
                                        </div>
                                        <span className='font-bold text-lg'>:</span>
                                        <div>
                                            <input type="text" className='w-8 border rounded focus:outline-none text-center' />
                                            <input type="text" className='w-8 border rounded focus:outline-none text-center' />
                                        </div>
                                        <div className='flex cursor-pointer text-sm'>
                                            <div className='border flex items-center  px-2 rounded'>AM</div>
                                            <div className='border flex items-center  px-2 rounded'>PM</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className='mt-10'>
                                <p className='font-semibold'>If you have received blood from donor in the last six month?</p>
                                <div className='flex gap-4'>
                                    <div className='flex gap-2'>
                                        <input type="radio" name='last' value={1} />
                                        <p>YES</p>
                                    </div>
                                    <div className='flex gap-2'>
                                        <input type="radio" value={2} />
                                        <p>NO</p>
                                    </div>
                                    <div className='flex gap-2'>
                                        <input type="radio" value={8} />
                                        <p>Don't Know</p>
                                    </div>
                                    <div className='flex gap-2'>
                                        <input type="radio" value={9} />
                                        <p>Refused to answer</p>
                                    </div>
                                </div>
                            </div>
                            <div className='mt-5'>
                                <Button label='SAVE' severity='success' className='px-10 py-2 rounded-full' />
                            </div>
                        </div>
                    </main>
                </IonContent>
            </IonPage>
        </>
    )
}
