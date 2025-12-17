'use client';

import { useState, useEffect } from 'react';
import { LocationAutocomplete } from './LocationAutocomplete';
import MapPinConfirmation from './MapPinConfirmation';
import { Badge } from './ui/badge';

interface LocationBuilderProps {
    onComplete: (data: {
        city: string;
        suburb: string;
        addressDetails: string;
        lat: number;
        lng: number;
        locationConfSource: string;
    }) => void;
    initialData?: {
        city?: string;
        suburb?: string;
        addressDetails?: string;
        lat?: number;
        lng?: number;
    }
}

const ZIMBABWE_CITIES = [
    'Harare',
    'Bulawayo',
    'Chitungwiza',
    'Mutare',
    'Gweru',
    'Kwekwe',
    'Kadoma',
    'Masvingo',
    'Chinhoyi',
    'Marondera',
    'Victoria Falls',
    'Hwange',
    'Zvishavane',
    'Other'
];

export default function LocationBuilder({ onComplete, initialData }: LocationBuilderProps) {
    const [step, setStep] = useState<'details' | 'confirm'>('details');

    // Form State
    const [city, setCity] = useState(initialData?.city || '');
    const [suburb, setSuburb] = useState(initialData?.suburb || '');
    const [details, setDetails] = useState(initialData?.addressDetails || '');

    // Geocoding context
    const [suburbCoords, setSuburbCoords] = useState<{ lat: number, lng: number } | null>(
        initialData?.lat && initialData?.lng ? { lat: initialData.lat, lng: initialData.lng } : null
    );

    // If initial data is complete, assume verified? 
    // Actually, we want user to confirm if editing.
    // But if we have initial data, we might want to skip map if strictly read-only? 
    // No, this is a builder, so edit mode.

    const canProceedToMap = city && suburb && suburbCoords;

    const handleSuburbChange = (val: string, coords?: { lat: number, lng: number }) => {
        setSuburb(val);
        if (coords) {
            setSuburbCoords(coords);
        }
    };

    const handleConfirm = (lat: number, lng: number) => {
        onComplete({
            city,
            suburb,
            addressDetails: details,
            lat,
            lng,
            locationConfSource: 'user_confirmed_pin'
        });
        // We could show a success state here or let parent handle
    };

    return (
        <div className="space-y-6">
            {step === 'details' ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    {/* City Selection */}
                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700">City / Town <span className="text-red-500">*</span></label>
                        <select
                            value={city}
                            onChange={(e) => {
                                setCity(e.target.value);
                                setSuburb(''); // Reset suburb when city changes
                                setSuburbCoords(null);
                            }}
                            className="w-full px-3 py-2.5 border rounded-lg bg-white focus:ring-2 focus:ring-[#1a2847] outline-none transition-all"
                        >
                            <option value="">Select City</option>
                            {ZIMBABWE_CITIES.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    {/* Suburb Autocomplete - Only enabled when City selected */}
                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700">Suburb / Area <span className="text-red-500">*</span></label>
                        <div className={!city ? 'opacity-50 pointer-events-none' : ''}>
                            <LocationAutocomplete
                                value={suburb}
                                onChange={handleSuburbChange}
                                placeholder={city ? `Search areas in ${city}...` : "Select a city first"}
                                className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#1a2847]"
                            />
                        </div>
                    </div>

                    {/* Details Free Text */}
                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700">Street Address (e.g. 1164 2nd Ave)</label>
                        <textarea
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            placeholder="e.g. 1164 2nd Ave, near Sam Levy's Village."
                            className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#1a2847] outline-none transition-all min-h-[80px]"
                        />
                        <p className="text-xs text-gray-500 mt-1">Landmarks help taskers find you faster.</p>
                    </div>

                    {/* Next Button */}
                    <button
                        disabled={!canProceedToMap}
                        onClick={() => setStep('confirm')}
                        className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${canProceedToMap
                            ? 'bg-[#1a2847] hover:bg-[#2a3857] shadow-lg hover:shadow-xl'
                            : 'bg-gray-300 cursor-not-allowed'
                            }`}
                    >
                        Next: Confirm Location on Map
                    </button>
                </div>
            ) : (
                <div className="animate-in fade-in zoom-in-95">
                    <MapPinConfirmation
                        initialLat={suburbCoords!.lat}
                        initialLng={suburbCoords!.lng}
                        city={city}
                        suburb={suburb}
                        onConfirm={handleConfirm}
                        onCancel={() => setStep('details')}
                    />
                </div>
            )}
        </div>
    );
}
