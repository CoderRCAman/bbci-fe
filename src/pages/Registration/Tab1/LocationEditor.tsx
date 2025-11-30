import React, { use, useEffect, useState } from "react";
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
    const [locationSpinner, setLocationSpinner] = useState(false);
    const [error, setError] = useState("");
    useEffect(() => {
        return () => {
            setError("");
        }
    }, [])
    const getCurrentPosition = async () => {
        try {
            setLocationSpinner(true);

            const result = await Geolocation.getCurrentPosition({
                maximumAge: 0,
                // Extended timeout to allow GPS time to lock (20 seconds is a good start)
                timeout: 20000,
                enableHighAccuracy: true,
            });

            const { latitude, longitude, accuracy } = result.coords;

            // --- ACCURACY CHECK FIX ---
            // Discard result if accuracy is poor (e.g., greater than 50 meters), 
            // as this indicates a network-based fix (the source of your 2km error).
            if (accuracy > 50) {
                setLocationSpinner(false);
                // Throw a custom error to enter the catch block
                throw new Error(`Location accuracy is poor (${accuracy.toFixed(1)}m). Please try again or manually enter gps coordinates.`);
            }

            // If execution reaches here, the position is accurate
            setLocationSpinner(false);
            setPatient((prev: any) => ({
                ...prev,
                lat: latitude,
                long: longitude
            }));

            setIsUnsaved(true);

        } catch (err: any) { // Type the error as 'any' for initial handling
            setLocationSpinner(false);

            // --- TYPESCRIPT ERROR HANDLING FIX ---
            let errorMessage: string;

            // Check if the error is a standard GeolocationPositionError
            if (err.code !== undefined && err.message !== undefined) {
                // This is the standard W3C Geolocation error object
                const geoError = err as GeolocationPositionError;

                switch (geoError.code) {
                    case GeolocationPositionError.PERMISSION_DENIED:
                        errorMessage = "Location access was denied. Please check your app permissions.";
                        break;
                    case GeolocationPositionError.TIMEOUT:
                        errorMessage = "Location request timed out. Try again or manually enter";
                        break;
                    case GeolocationPositionError.POSITION_UNAVAILABLE:
                        errorMessage = "Location is unavailable. Ensure GPS is enabled and try again.";
                        break;
                    default:
                        errorMessage = `GPS Error (${geoError.code}): ${geoError.message}`;
                }
            } else if (err instanceof Error) {
                // Handle custom errors (like the accuracy check above) or general JS errors
                errorMessage = err.message;
            } else {
                // Fallback for unknown error types
                errorMessage = "An unexpected location error occurred.";
            }

            console.error("GPS error:", errorMessage);
            setError(errorMessage);
        }
    }
    console.log(error);
    return (
        <div className="p-4 border rounded-md space-y-3 bg-gray-50">

            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-sm font-medium text-gray-700">Location</h3>
                    {
                        error && <p className="text-sm text-red-500">{error}</p>
                    }
                </div>

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
                    {
                        <Button
                            type="button"
                            label="Use Current Location"
                            icon="pi pi-map-marker"
                            className="p-button-sm"
                            onClick={getCurrentPosition}
                            disabled={isDisabled || locationSpinner} // Disable if overall form disabled OR spinner is active
                            loading={locationSpinner} // This automatically shows the spinner and overrides the icon
                        />
                    }
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
