'use client';

import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

interface LocationAutocompleteProps {
    value: string;
    onChange: (location: string, coordinates?: { lat: number; lng: number }) => void;
    placeholder?: string;
    className?: string;
}

// Dynamically import the component with the autocomplete hook to avoid SSR issues
const LocationAutocompleteInternal = dynamic(
    () => import('./LocationAutocompleteInternal').then(mod => ({ default: mod.LocationAutocompleteInternal })),
    {
        ssr: false,
        loading: () => <Input placeholder="Loading..." disabled />,
    }
);

export function LocationAutocomplete({
    value,
    onChange,
    placeholder = 'e.g., Borrowdale, Harare',
    className,
}: LocationAutocompleteProps) {
    const [isMounted, setIsMounted] = useState(false);
    const hasGoogleMaps = typeof window !== 'undefined' && window.google && window.google.maps;

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Don't render autocomplete on server or if not mounted
    if (!isMounted || !hasGoogleMaps) {
        return (
            <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={className}
            />
        );
    }

    // Only use places autocomplete if Google Maps is available and we're on client
    return <LocationAutocompleteInternal
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={className}
    />;
}
