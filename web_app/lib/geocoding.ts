/**
 * Free Geocoding Stack
 * - Photon (OpenStreetMap) for autocomplete - unlimited free
 * - LocationIQ for geocoding on submit - 5,000/day free
 * 
 * Architecture: Autocomplete → Select → Geocode ONCE on submit → Store forever
 */

export interface PlaceResult {
    label: string;
    displayName: string;
    lat: number;
    lng: number;
    city?: string;
    country?: string;
}

// Cache for autocomplete results
const autocompleteCache = new Map<string, PlaceResult[]>();
const MAX_CACHE_SIZE = 50;

/**
 * Photon Autocomplete (FREE - OpenStreetMap based)
 * Good Zimbabwe/Africa coverage
 * Rate: ~1-5 req/sec recommended
 */
export async function searchPlaces(query: string): Promise<PlaceResult[]> {
    if (!query || query.length < 3) return [];

    // Check cache first
    const cacheKey = query.toLowerCase().trim();
    if (autocompleteCache.has(cacheKey)) {
        return autocompleteCache.get(cacheKey)!;
    }

    try {
        // Bias towards Zimbabwe (Harare coordinates)
        const response = await fetch(
            `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5&lat=-17.8252&lon=31.0335`
        );

        if (!response.ok) {
            console.warn('Photon API error:', response.status);
            return [];
        }

        const data = await response.json();

        const results: PlaceResult[] = (data.features || []).map((feature: any) => {
            const props = feature.properties || {};
            const coords = feature.geometry?.coordinates || [0, 0];

            // Build a readable label
            const parts = [
                props.name,
                props.street,
                props.city || props.town || props.village,
                props.state,
                props.country
            ].filter(Boolean);

            return {
                label: parts.join(', '),
                displayName: props.name || parts[0] || 'Unknown',
                lat: coords[1], // Photon uses [lng, lat]
                lng: coords[0],
                city: props.city || props.town || props.village,
                country: props.country
            };
        });

        // Cache the results
        if (autocompleteCache.size >= MAX_CACHE_SIZE) {
            const firstKey = autocompleteCache.keys().next().value;
            if (firstKey) autocompleteCache.delete(firstKey);
        }
        autocompleteCache.set(cacheKey, results);

        return results;
    } catch (error) {
        console.error('Photon search error:', error);
        return [];
    }
}

/**
 * LocationIQ Geocoding (FREE 5,000/day)
 * Use ONLY on form submit, not on keystroke!
 */
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
    const apiKey = process.env.NEXT_PUBLIC_LOCATIONIQ_API_KEY;

    if (!apiKey) {
        console.error('LocationIQ API key not configured');
        return null;
    }

    if (!address || address.length < 3) return null;

    try {
        const response = await fetch(
            `https://us1.locationiq.com/v1/search?key=${apiKey}&q=${encodeURIComponent(address)}&format=json&limit=1`
        );

        if (!response.ok) {
            console.warn('LocationIQ API error:', response.status);
            return null;
        }

        const data = await response.json();

        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon)
            };
        }

        return null;
    } catch (error) {
        console.error('LocationIQ geocode error:', error);
        return null;
    }
}

/**
 * Haversine Distance (NO API CALLS!)
 * Calculate distance between two points in kilometers
 */
export function distanceKm(
    a: { lat: number; lng: number },
    b: { lat: number; lng: number }
): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLon = ((b.lng - a.lng) * Math.PI) / 180;

    const haversine =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((a.lat * Math.PI) / 180) *
        Math.cos((b.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;

    return 2 * R * Math.asin(Math.sqrt(haversine));
}

/**
 * Debounce helper for autocomplete
 * Use 400ms minimum to avoid rate limiting
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}
