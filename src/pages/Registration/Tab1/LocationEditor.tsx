import React, { useState } from "react";
import { Geolocation } from "@capacitor/geolocation";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

interface LocationEditorProps {
    patient: any;
    setPatient: React.Dispatch<React.SetStateAction<any>>;
    setIsUnsaved: React.Dispatch<React.SetStateAction<boolean>>;
    isDisabled: boolean
}

const LocationEditor: React.FC<LocationEditorProps> = ({
    patient,
    setPatient,
    setIsUnsaved,
    isDisabled
}) => {
    const [edit, setEdit] = useState(false);

    const getCurrentPosition = async () => {
        try {
            const result = await Geolocation.getCurrentPosition({
                maximumAge: 0,
                timeout: 1000,
            });

            const { latitude, longitude } = result.coords;

            setPatient((prev: any) => ({
                ...prev,
                lat: latitude,
                long: longitude
            }));

            setIsUnsaved(true);
        } catch (err) {
            console.error("GPS error:", err);
        }
    };

    return (
        <div className="p-4 border rounded-md space-y-3 bg-gray-50">

            <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-700">Location</h3>

                <Button
                    type="button"
                    icon="pi pi-pencil"
                    disabled={isDisabled}
                    className="p-button-text p-button-sm"
                    onClick={() => setEdit(!edit)}
                />
            </div>

            {/* Normal View Mode */}
            {!edit && (
                <div className="space-y-1 text-gray-700">
                    <p><strong>Latitude:</strong> {patient.lat}</p>
                    <p><strong>Longitude:</strong> {patient.long}</p>

                    <Button
                        type="button"
                        label="Use Current Location"
                        icon="pi pi-map-marker"
                        className="p-button-sm"
                        onClick={getCurrentPosition}
                        disabled={isDisabled}
                    />
                </div>
            )}

            {/* Manual Edit Mode */}
            {edit && (
                <div className="space-y-3">

                    <div>
                        <label className="block mb-1 text-sm text-gray-600">Latitude</label>
                        <InputText
                            value={patient.lat.toString()}
                            onChange={(e) => {
                                setPatient((prev: any) => ({
                                    ...prev,
                                    lat: parseFloat(e.target.value) || 0
                                }));
                                setIsUnsaved(true);
                            }}
                            className="p-2 border w-full"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-sm text-gray-600">Longitude</label>
                        <InputText
                            value={patient.long.toString()}
                            onChange={(e) => {
                                setPatient((prev: any) => ({
                                    ...prev,
                                    long: parseFloat(e.target.value) || 0
                                }));
                                setIsUnsaved(true);
                            }}
                            className="p-2 border w-full"
                        />
                    </div>

                    <Button
                        label="Done"
                        icon="pi pi-check"
                        className="p-button-sm"
                        onClick={() => setEdit(false)}
                    />
                </div>
            )}
        </div>
    );
};

export default LocationEditor;
