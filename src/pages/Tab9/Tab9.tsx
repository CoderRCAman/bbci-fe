import { IonAlert, IonContent, IonPage } from "@ionic/react";
import Header from "../../components/Header";
import { useLocation } from "react-router";
import { useEffect, useState } from "react";
import shortUUID from "short-uuid";
import AddIndoorAirPollution from "./AddIndoorAirPollution";
import { Button } from "primereact/button";
import { Link } from "react-router-dom";
export interface INDOOR_AIR_POLLUTION {
    id: string,
    from_age: number,
    to_age: number,
    hours: number,
    minutes: number,
    ventilation: number,
    most_common_cooking_fuel: number,
    smokiness: number,
    most_cooking: number,
}
function isIndoorAirPollutionDataValid(data: INDOOR_AIR_POLLUTION[]): boolean {
    return data.every(item =>
        item.id?.trim() &&
        item.from_age > 0 &&
        item.to_age > 0 &&
        item.hours > -1 &&
        item.minutes > -1 &&
        item.ventilation > -1 &&
        item.most_common_cooking_fuel > -1 &&
        item.smokiness > -1 &&
        item.most_cooking > -1
    );
}
export default function Tab9() {
    const location = useLocation();
    const [id, setId] = useState<string | null>('');
    const [editFlag, setEditFlag] = useState(false);
    const searchParams = new URLSearchParams(location.search);
    const [indoorAirData, setIndoorAirData] = useState<INDOOR_AIR_POLLUTION[]>([]);
    const [alert, setAlert] = useState({
        show: false,
        header: "",
        message: "",
    });

    useEffect(() => {
        setId(searchParams?.get('id'));
        setEditFlag(searchParams?.get('edit') === 'YES');
    }, [location.pathname])

    const handleAddNewUi = () => {
        const translator = shortUUID();
        const newResidential: INDOOR_AIR_POLLUTION = {
            id: translator.new(),
            from_age: 0,
            to_age: 0,
            hours: -1,
            minutes: -1,
            most_common_cooking_fuel: -1,
            ventilation: -1,
            smokiness: -1,
            most_cooking: -1,

        };
        setIndoorAirData(d => ([...d, newResidential]))
    }
    const handleRemoveUi = (id: string) => {
        if (indoorAirData.length === 1) return;
        setIndoorAirData(d => d.filter(x => x.id !== id));
    }
    useEffect(() => {
        if (indoorAirData.length === 0)
            handleAddNewUi();
    }, [])

    const handleSaveFresh = () => {
        //for fresh records
        console.log('hello')
        if (!isIndoorAirPollutionDataValid(indoorAirData)) {
            return setAlert({
                show: true,
                header: 'FAILED',
                message: 'SOME FIELDS WERE MISSING!'
            })
        }
        const columns = [
            'from_age',
            'to_age',
            'hours',
            'minutes',
            'ventilation',
            'most_common_cooking_fuel',
            'smokiness',
            'most_cooking',
            'id',
            'user_id'
        ];

        const valuesList = indoorAirData.map(item => {
            const values = [
                item.from_age,
                item.to_age,
                item.hours,
                item.minutes,
                item.ventilation,
                item.most_common_cooking_fuel,
                item.smokiness,
                item.most_cooking,
                `'${item.id}'`,
                `${id}`
            ];

            return `(${values.join(', ')})`;
        });

        const query = `INSERT INTO indoor_air_pollution (${columns.join(', ')}) VALUES\n  ${valuesList.join(',\n  ')};`;

        console.log(query);

    }
    const handleSaveUpdated = () => {
        //for updated records
    }

    return (
        <IonPage>
            <Header title={0 ? "Edit Indoor Air Pollution" : "Indoor Air Pollution"} />
            <IonContent class='' fullscreen>
                <main className="p-2 space-y-2">
                    {
                        indoorAirData.map(data => (
                            <AddIndoorAirPollution
                                data={data}
                                handleRemoveUi={handleRemoveUi}
                                setIndoorAirData={setIndoorAirData}
                            />
                        ))
                    }
                    <div className='mt-4 flex justify-end gap-4 pr-2 pb-5'>
                        <Button
                            label="+ Add new"
                            text raised
                            className="px-3 py-2 px-10 py-3 rounded-md font-bold"
                            onClick={handleAddNewUi}
                        />
                        {
                            editFlag ?
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
                                    onClick={handleSaveFresh}
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
                    <div className="pt-10 flex justify-end gap-2">
                        <Link
                            to={'/tab8'}
                        >
                            <Button className='px-10 py-2 rounded' label='PREV' />
                        </Link>
                        <Link
                            to={'/tab10'}
                        >
                            <Button className='px-10 py-2 rounded' label='NEXT' />
                        </Link>
                    </div>

                </main>
            </IonContent>
        </IonPage>
    )
}
