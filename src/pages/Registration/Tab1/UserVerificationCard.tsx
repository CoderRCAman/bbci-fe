import React, { useMemo } from "react";
import { RadioButton } from "primereact/radiobutton";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";

export type CardStringType =
    | "Voter ID"
    | "Aadhaar Card"
    | "PAN Card"
    | "Driving License"
    | "Passport";

interface VerificationCardProps {
    selectedInput: string;
    selectedType: string;
    setSelectedType: (v: CardStringType) => void;
    setSelectedInput: (v: string) => void;
    setIsUnsave: React.Dispatch<React.SetStateAction<boolean>>
}

const VerificationCard: React.FC<VerificationCardProps> = ({
    selectedInput,
    selectedType,
    setSelectedType,
    setSelectedInput,
    setIsUnsave
}) => {
    const idOptions: CardStringType[] = useMemo(
        () => [
            "Voter ID",
            "Aadhaar Card",
            "PAN Card",
            "Driving License",
            "Passport",
        ],
        []
    );

    const placeholders: Record<string, string> = {
        "Voter ID": "Example: ABC1234567",
        "Aadhaar Card": "Example: 1234 5678 9012",
        "PAN Card": "Example: ABCDE1234F",
        "Driving License": "Example: MH0120150012345",
        "Passport": "Example: P1234567",
    };

    return (
        <div className="space-y-4">
            {/* {idOptions.map((option) => {
                const isSelected = selectedType === option;

                return (
                    <div
                        key={option}
                        className={`flex items-center p-3 border rounded-xl transition-colors cursor-pointer ${isSelected
                            ? "bg-blue-50 border-blue-500 ring-2 ring-blue-300"
                            : "hover:bg-gray-50 border-gray-300"
                            }`}
                        onClick={() => {
                            setSelectedType(option)

                        }} // ✔ entire card clickable
                    >
                        <RadioButton
                            inputId={option}
                            name="idType"
                            value={option}
                            checked={isSelected} // ✔ auto-select when state is already set
                            onChange={(e) => {
                                setSelectedType(e.value as CardStringType)
                                setIsUnsave(true);
                            }}
                        />

                        <label
                            htmlFor={option}
                            className="ml-3 cursor-pointer font-medium text-sm"
                        >
                            {option}
                        </label>
                    </div>
                );
            })} */}
             {/* Dropdown for ID selection */}
            <div className="w-full">
                <label className="block mb-2 font-medium text-sm">
                    Select ID Type
                </label>

                <Dropdown
                    value={selectedType || null}
                    options={idOptions}
                    onChange={(e) => {
                        setSelectedType(e.value as CardStringType);
                        setIsUnsave(true);
                    }}
                    placeholder="Select ID Type"
                    className="w-full"
                />
            </div>

            {/* ID Input shown only when a type is selected */}
            {selectedType && (
                <div className="mt-3">
                    <label className="block mb-2 font-medium text-sm">
                        Enter {selectedType} Number
                    </label>

                    <InputText
                        value={selectedInput}
                        placeholder={placeholders[selectedType]}
                        className="p-inputtext-sm w-full p-2 border rounded-md"
                        onChange={(e) => {
                            setSelectedInput(e.target.value)
                            setIsUnsave(true)
                        }
                        }
                    />
                </div>
            )}
        </div>
    );
};

export default VerificationCard;