'use client';

import { useEffect, useState } from 'react';

interface GoogleMapsLoaderProps {
    children: React.ReactNode;
    onLoad?: () => void;
}

export function GoogleMapsLoader({ children, onLoad }: GoogleMapsLoaderProps) {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

        // If no API key, still render children (graceful degradation)
        if (!apiKey) {
            console.warn('Google Maps API key not found. Location autocomplete will use fallback.');
            setIsLoaded(true);
            return;
        }

        // Check if already loaded
        if (window.google && window.google.maps) {
            setIsLoaded(true);
            onLoad?.();
            return;
        }

        // Check if script is already in the document to prevent duplicates
        const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
        if (existingScript) {
            // Script is loading or already loaded, wait for it
            const handleLoad = () => {
                setIsLoaded(true);
                onLoad?.();
            };

            if (window.google && window.google.maps) {
                handleLoad();
            } else {
                existingScript.addEventListener('load', handleLoad);
                return () => {
                    existingScript.removeEventListener('load', handleLoad);
                };
            }
            return;
        }

        // Load Google Maps script
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
            setIsLoaded(true);
            onLoad?.();
        };
        script.onerror = () => {
            console.error('Error loading Google Maps');
            setIsLoaded(true); // Still render, will use fallback
        };

        document.head.appendChild(script);

        // Don't remove the script on cleanup - it should persist across component remounts
        // This prevents the duplicate loading warning
    }, [onLoad]);

    if (!isLoaded) {
        return <div className="text-center py-8">Loading Google Maps...</div>;
    }

    return <>{children}</>;
}
