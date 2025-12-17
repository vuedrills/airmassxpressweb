'use client';

import { Input } from '@/components/ui/input';
import { useState, useEffect, useCallback, useRef } from 'react';
import { searchPlaces, PlaceResult } from '@/lib/geocoding';

interface LocationAutocompleteProps {
    value: string;
    onChange: (location: string, coordinates?: { lat: number; lng: number }, place?: PlaceResult) => void;
    placeholder?: string;
    className?: string;
}

/**
 * Location Autocomplete using Photon (OpenStreetMap)
 * FREE - No API costs, good Zimbabwe coverage
 */
export function LocationAutocomplete({
    value,
    onChange,
    placeholder = 'e.g., Borrowdale, Harare',
    className,
}: LocationAutocompleteProps) {
    const [inputValue, setInputValue] = useState(value);
    const [suggestions, setSuggestions] = useState<PlaceResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Sync external value
    useEffect(() => {
        if (value !== inputValue) {
            setInputValue(value);
        }
    }, [value]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounced search (400ms to avoid rate limiting Photon)
    const doSearch = useCallback(async (query: string) => {
        if (query.length < 3) {
            setSuggestions([]);
            setIsOpen(false);
            return;
        }

        setIsLoading(true);
        try {
            const results = await searchPlaces(query);
            setSuggestions(results);
            setIsOpen(results.length > 0);
        } catch (error) {
            console.error('Search error:', error);
            setSuggestions([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        onChange(newValue); // Update parent without coordinates yet

        // Debounce the search
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }


        debounceRef.current = setTimeout(() => {
            doSearch(newValue);
        }, 300);
    };

    const handleSelect = (place: PlaceResult) => {
        // Use displayName for cleaner input (e.g. "Avondale" instead of "Avondale, Harare...")
        const cleanName = place.displayName || place.label.split(',')[0];
        setInputValue(cleanName);
        setSuggestions([]);
        setIsOpen(false);

        // Pass label, coordinates, and full details to parent
        onChange(cleanName, { lat: place.lat, lng: place.lng }, place);
    };

    return (
        <div ref={containerRef} className="relative">
            <Input
                value={inputValue}
                onChange={handleInputChange}
                onFocus={() => suggestions.length > 0 && setIsOpen(true)}
                placeholder={placeholder}
                className={className}
            />

            {isLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                </div>
            )}

            {isOpen && suggestions.length > 0 && (
                <div className="absolute z-50 w-full bg-white border rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                    {suggestions.map((place, index) => (
                        <button
                            key={`${place.lat}-${place.lng}-${index}`}
                            type="button"
                            onClick={() => handleSelect(place)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-start gap-2 border-b last:border-b-0 transition-colors"
                        >
                            <span className="text-gray-400 mt-0.5">📍</span>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 truncate">
                                    {place.displayName}
                                </div>
                                {place.city && (
                                    <div className="text-sm text-gray-500 truncate">
                                        {place.city}{place.country ? `, ${place.country}` : ''}
                                    </div>
                                )}
                            </div>
                        </button>
                    ))}
                    <div className="px-4 py-2 text-xs text-gray-400 bg-gray-50 border-t">
                        Powered by OpenStreetMap
                    </div>
                </div>
            )}
        </div>
    );
}
