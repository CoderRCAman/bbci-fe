import React, { useState, useCallback, useMemo, ChangeEvent } from 'react';
// Attempting the most explicit component import paths to resolve recurring resolution errors
import { Card } from 'primereact/card'; 
import { RadioButton, RadioButtonChangeEvent } from 'primereact/radiobutton';
import { InputText } from 'primereact/inputtext';

// --- Type Definitions for IDs ---

/** Defines the possible ID types (string literal union) the user can select. */
type CardStringType = 'Voter ID' | 'Aadhaar Card' | 'PAN Card' | 'Driving License' | 'Passport';

/** Defines the state type, which includes the possibility of being null (unselected). */
type CardType = CardStringType | null;

/** Props for the IDVerificationInput component. */
interface IDVerificationInputProps {
    /** Function to update the selected card type in the parent state. */
    setCardType: React.Dispatch<React.SetStateAction<string>>
    /** Function to update the entered card number/input in the parent state. */
    setCardInput: React.Dispatch<React.SetStateAction<string>>
}

// --- ID Verification Component ---

/**
 * A specialized component for selecting an ID type and entering the corresponding number.
 * It is designed to be controlled by a parent component via the provided setters.
 * @param setCardType Function to set the selected card type in the parent state.
 * @param setCardInput Function to set the entered card number in the parent state.
 */

const UserVerificationCard: React.FC<IDVerificationInputProps> = ({ setCardType, setCardInput }) => {
    // Local state to manage the selected type and input value within this component
    const [selectedType, setSelectedType] = useState<CardType>(null);
    const [inputValue, setInputValue] = useState<string>('');
    const [selectedIndex , setSelectedIndex] = useState(-1) ; 
    // List of available ID options (guaranteed to be strings)
    const idOptions: CardStringType[] = useMemo(() => [
        'Voter ID',
        'Aadhaar Card',
        'PAN Card',
        'Driving License',
        'Passport',
    ], []);
    const placeholder = useMemo(()=>[
        'Example - ABC1234567',
        'Example - 1234 5678 9012',
        'Example - ABCDE1234F', 
        'Example - MH0120150012345',
        'Example - P1234567'
    ], [])
    /**
     * Handles the selection of a radio button (ID type).
     * Refactored to accept the value directly instead of the full event,
     * resolving the TypeScript error on the <div>'s onClick handler.
     */
    const handleTypeChange = useCallback((value: CardStringType) => {
        // value is guaranteed to be one of CardStringType
        setSelectedType(value);
        setCardType(value);
        
        // Clear the input value when the card type changes
        setInputValue('');
        setCardInput('');
    }, [setCardType, setCardInput]);

    /**
     * Handles changes to the input field (card number).
     * @param e The input change event.
     */
    const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        setCardInput(newValue);
    }, [setCardInput]);
    console.log(selectedIndex)
    return (
        <div className="flex flex-col gap-6 w-full">
            {/* Part 1: ID Type Selection */}
            <Card title="Select Identification Type" className="shadow rounded-xl">
                <p className="text-sm text-gray-500 mb-4">
                    Please choose one of the following official documents for verification.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {idOptions.map((option , index) => (
                        <div 
                            key={option} 
                            className={`flex items-center p-3 border rounded-xl transition-colors cursor-pointer ${
                                selectedType === option 
                                ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-300' 
                                : 'hover:bg-gray-50 border-gray-300'
                            }`}
                            // Direct call to handleTypeChange with the option string
                            onClick={() => {
                                 handleTypeChange(option) 
                                 setSelectedIndex(index);
                            }}
                        >
                            <RadioButton
                                inputId={option} 
                                name="idType"
                                value={option}
                                // Handle change by extracting the value from the event
                                onChange={(e) => {
                                    handleTypeChange(e.value as CardStringType)  
                                }}
                                checked={selectedType === option}
                            />
                            <label htmlFor={option} className="ml-3 cursor-pointer font-medium text-sm">
                                {option}
                            </label>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Part 2: Card Number Input (Conditionally rendered) */}
            <Card 
                title={selectedType ? `Enter ${selectedType} Number` : 'Enter Card Number'} 
                className={`shadow rounded-xl transition-all duration-300 ${selectedType ? 'opacity-100 h-auto p-6' : 'opacity-50 h-0 p-0 overflow-hidden'}`}
            >
                <div className="p-field flex flex-col gap-2">
                    {selectedType ? (
                        <>
                            <label htmlFor="cardInput" className="font-semibold text-sm">
                                {selectedType} Number:
                            </label>
                            <InputText
                                id="cardInput"
                                value={inputValue}
                                onChange={handleInputChange}
                                placeholder={placeholder[selectedIndex]}
                                className="w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                type="text"
                            />
                        </>
                    ) : (
                        <p className="text-gray-400">
                            Please select an identification type above to proceed.
                        </p>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default UserVerificationCard ;