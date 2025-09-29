import { IonAlert, IonContent, IonPage } from '@ionic/react'
import React, { useEffect, useState } from 'react'
import Header from '../../../components/Header'
import { useLocation } from 'react-router'
import AddResidential from './AddResidential';
import { Button } from 'primereact/button';
import ShortUUID from 'short-uuid';
import { Link } from 'react-router-dom';
import { useSQLite } from '../../../utils/Sqlite';
export interface RESIDENTIAL_TYPE {
    from_age: number,
    to_age: number,
    city?: string,
    village?: string,
    state: string,
    code: number,
    id: string,
    user_id?: string
}
function isResidentialDataValid(data: RESIDENTIAL_TYPE[]): boolean {
    return data.every(item =>
        item.id?.trim() &&
        item.from_age > 0 &&
        item.to_age > 0 &&
        item.state?.trim() &&
        item.code > 0 &&
        (item.city?.trim() || item.village?.trim())
    );
}
export default function Tab5() {
    const location = useLocation();
    const [id, setId] = useState<string | null>('');
    const [editFlag , setEditFlag] = useState<string|null>(null) ;
    const searchParams = new URLSearchParams(location.search);
    const [residentialData, setResidentialData] = useState<RESIDENTIAL_TYPE[]>([]);
    const [alert, setAlert] = useState({
        show: false,
        header: "",
        message: "",
    }); 

    const { db ,sqlite } = useSQLite();
    useEffect(() => {
        setId(searchParams?.get('id'));
        setEditFlag(searchParams?.get('edit'))
    }, [location.pathname])
 
    const handleAddNewUi = () => {
        console.log('hello')
        const translator = ShortUUID();
        const newResidential: RESIDENTIAL_TYPE = {
            id: translator.new(),
            from_age: 0,
            to_age: 0,
            city: '',
            state: '',
            code: 0,
        };

        setResidentialData(d => ([...d, newResidential]))
    }
    const handleRemoveUi = (id: string) => {
        if (residentialData.length === 1) return;
        setResidentialData(d => d.filter(x => x.id !== id));
    }
    useEffect(() => {

        loadExisting()
    }, [db])
    const loadExisting = async () => {
        try {
            const query = `
                select * from residential_history where user_id = '${id}' ;    
            `
            const res = await db?.query(query)  
            console.log(query)
            const values = res?.values;
            console.log(values)
            if (values?.length === 0) {
                handleAddNewUi();
            }
            else {
                setResidentialData(values || []);
            } 
        } catch (error) {
            console.log(error);
        }
    }
    const handleSaveFresh = async() => { 
        console.log('hilo')
        //for fresh records
        if (!isResidentialDataValid(residentialData)) {
            return setAlert({
                show: true,
                header: 'FAILED',
                message: 'SOME FIELDS WERE MISSING!'
            })
        }
        const columns = ['from_age', 'to_age', 'city', 'village', 'state', 'code', 'id', 'user_id'];

        const valuesList = residentialData.map(item => {
            const values = [
                item.from_age,
                item.to_age,
                item.city ? `'${item.city}'` : 'NULL',
                item.village ? `'${item.village}'` : 'NULL',
                `'${item.state}'`,
                item.code,
                `'${item.id}'`,
                `'${id}'`
            ];

            return `(${values.join(', ')})`;
        });
        const query = `INSERT  OR IGNORE INTO residential_history (${columns.join(', ')}) VALUES\n  ${valuesList.join(',\n  ')};`;
        console.log(query); 
        await db?.run(query) ;
        await sqlite?.saveToStore('patientdb');
        try {
            await db?.run(query) ;    
        } catch (error) {
            console.log(error)
        }
    }
    const handleSaveUpdated = () => {
        //for updated records
    }

    return (
        <>
            <IonPage>
                <Header title={"Residential History"} />
                <IonContent class='' fullscreen>
                    <main className='mt-6 p-2  space-y-8'>
                        {
                            residentialData.map(item => (
                                <AddResidential
                                    handleRemoveUi={handleRemoveUi}
                                    key={item.id}
                                    data={item}
                                    setResidentialData={setResidentialData}
                                />
                            ))
                        }

                    </main>
                    <div className='mt-4 flex justify-end gap-4 pr-2 pb-5'>
                        <Button
                            label="+ Add new"
                            text raised
                            className="px-3 py-2 px-10 py-3 rounded-md font-bold"
                            onClick={handleAddNewUi}
                        />
                        {
                            editFlag ==='yes' ?
                                <Button
                                    label="Save"
                                    text raised
                                    className="px-3 py-2 px-10 py-3 rounded-md font-bold"
                                    onClick={handleSaveUpdated}
                                />
                                :
                                <Button
                                    label="Save"
                                    severity="success" text raised
                                    className="px-3 py-2 px-10 py-3 rounded-md font-bold"
                                    onClick={()=>handleSaveFresh()}
                                />
                        }

                    </div>
                    <IonAlert
                        isOpen={alert.show}
                        onDidDismiss={() => setAlert((a) => ({ ...a, show: false }))}
                        header={alert.header}
                        message={alert.message}
                        buttons={["OK"]}
                    />
                    <div className='flex gap-2 justify-end pb-5 pr-2'>
                        <Link to={`/tab1?id=${id}&edit=no`}>
                            <Button label='PREV' className='px-10 py-3  rounded-md' />
                        </Link>
                        <Link to={`/tab6?id=someid&edit=no`}>
                            <Button label='NEXT' className='px-10 py-3  rounded-md' />
                        </Link>

                    </div>
                </IonContent>
            </IonPage>
        </>
    )
}
