'use client';

import { Input } from '@/components/ui/input';
import usePlacesAutocomplete, {
    getGeocode,
    getLatLng,
} from 'use-places-autocomplete';
import { useEffect } from 'react';

interface LocationAutocompleteProps {
    value: string;
    onChange: (location: string, coordinates?: { lat: number; lng: number }) => void;
    placeholder?: string;
    className?: string;
}

export function LocationAutocompleteInternal({
    value,
    onChange,
    placeholder = 'e.g., Borrowdale, Harare',
    className,
}: LocationAutocompleteProps) {
    const {
        ready,
        value: searchValue,
        suggestions: { status, data },
        setValue,
        clearSuggestions,
    } = usePlacesAutocomplete({
        requestOptions: {
            componentRestrictions: { country: 'zw' }, // Zimbabwe only
        },
        debounce: 300,
        defaultValue: value,
    });

    // Sync external value with internal value
    useEffect(() => {
        if (value !== searchValue) {
            setValue(value, false);
        }
    }, [value, searchValue, setValue]);

    const handleSelect = async (description: string) => {
        setValue(description, false);
        clearSuggestions();

        try {
            const results = await getGeocode({ address: description });
            const { lat, lng } = await getLatLng(results[0]);
            onChange(description, { lat, lng });
        } catch (error) {
            console.error('Error getting location details:', error);
            onChange(description);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setValue(newValue);
        onChange(newValue);
    };

    return (
        <div className="relative">
            <Input
                value={searchValue}
                onChange={handleInputChange}
                disabled={!ready}
                placeholder={placeholder}
                className={className}
            />

            {status === 'OK' && data.length > 0 && (
                <div className="absolute z-10 w-full bg-white border rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                    {data.map((suggestion) => {
                        const {
                            place_id,
                            structured_formatting: { main_text, secondary_text },
                        } = suggestion;

                        return (
                            <button
                                key={place_id}
                                type="button"
                                onClick={() => handleSelect(suggestion.description)}
                                className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-start gap-2 border-b last:border-b-0"
                            >
                                <span className="text-gray-400 mt-0.5">📍</span>
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900">{main_text}</div>
                                    {secondary_text && (
                                        <div className="text-sm text-gray-500">{secondary_text}</div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
