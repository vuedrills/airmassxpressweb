'use client';

/**
 * GoogleMapsLoader - DEPRECATED
 * 
 * We've migrated to a free geocoding stack:
 * - Photon (OpenStreetMap) for autocomplete
 * - LocationIQ for geocoding
 * - MapLibre for map display
 * 
 * This component now just renders its children directly.
 * Keeping it as a pass-through to avoid breaking existing imports.
 */

interface GoogleMapsLoaderProps {
    children: React.ReactNode;
    onLoad?: () => void;
}

export function GoogleMapsLoader({ children, onLoad }: GoogleMapsLoaderProps) {
    // Call onLoad immediately since we don't need to load anything
    if (onLoad) {
        // Use setTimeout to avoid calling during render
        setTimeout(onLoad, 0);
    }

    // Just render children directly - no loading, no blocking
    return <>{children}</>;
}
