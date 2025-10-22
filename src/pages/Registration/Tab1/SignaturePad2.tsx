import React, { useRef, useEffect, useState } from 'react';
import SignaturePad from 'signature_pad';
import { Button } from 'primereact/button';

// Define props for the component
interface SignaturePadProps {
    onSave: (dataUrl: string) => void;
}

const SignaturePad2: React.FC<SignaturePadProps> = ({ onSave }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [signaturePad, setSignaturePad] = useState<SignaturePad | null>(null);

    // Initialize SignaturePad
    useEffect(() => {
        if (canvasRef.current) {
            const pad = new SignaturePad(canvasRef.current, {
                backgroundColor: 'rgb(255, 255, 255)', // White background
            });
            setSignaturePad(pad);

            // This function sets the internal canvas size to match its CSS size
            // We still need this to run *once*
            const setCanvasSize = () => {
                if (canvasRef.current) {
                    const ratio = Math.max(window.devicePixelRatio || 1, 1);
                    canvasRef.current.width = canvasRef.current.offsetWidth * ratio;
                    canvasRef.current.height = canvasRef.current.offsetHeight * ratio;
                    canvasRef.current.getContext('2d')?.scale(ratio, ratio);
                    pad.clear();
                }
            };

            // We run this *once* after a short delay.
            // This lets WindiCSS apply 'w-full h-72' *before* we read the size.
            const timer = setTimeout(setCanvasSize, 100);

            // Cleanup function to clear the timeout if the component unmounts
            return () => {
                clearTimeout(timer);
            };
        }
    }, []); // Empty array means this effect runs only once on mount

    // Handler for the "Clear" button
    const handleClear = () => {
        signaturePad?.clear();
    };

    // Handler for the "Save" button
    const handleSave = () => {
        if (signaturePad && !signaturePad.isEmpty()) {
            const dataUrl = signaturePad.toDataURL('image/png');
            onSave(dataUrl);
        } else {
            alert('Please provide a signature first.');
        }
    };

    return (
        // WindiCSS classes for the main container
        <div className="flex flex-col w-full h-72 border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
            {/* The canvas element itself.
        WindiCSS sets its *display* size.
        The useEffect sets its *internal drawing* size.
      */}
            <canvas ref={canvasRef} className="w-full h-full flex-grow"></canvas>

            {/* Action buttons container */}
            <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 space-x-2">
                {/* PrimeReact Button for "Clear" */}
                <Button
                    label="Clear"
                    icon="pi pi-trash"
                    severity="secondary"
                    outlined
                    onClick={handleClear}
                    className="flex-1"
                    type='button'
                />

                {/* PrimeReact Button for "Save" */}
                <Button
                    label="Save"
                    icon="pi pi-check"
                    severity="success"
                    onClick={handleSave}
                    className="flex-1"
                    type='button'
                />
            </div>
        </div>
    );
};

export default SignaturePad2;