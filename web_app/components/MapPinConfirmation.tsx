'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface MapPinConfirmationProps {
    initialLat: number;
    initialLng: number;
    onConfirm: (lat: number, lng: number) => void;
    onCancel?: () => void;
    city: string;
    suburb: string;
}

export default function MapPinConfirmation({
    initialLat,
    initialLng,
    onConfirm,
    onCancel,
    city,
    suburb
}: MapPinConfirmationProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const marker = useRef<maplibregl.Marker | null>(null);
    const [currentPos, setCurrentPos] = useState({ lat: initialLat, lng: initialLng });

    useEffect(() => {
        if (!mapContainer.current) return;
        if (map.current) return;

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
            center: [initialLng, initialLat],
            zoom: 15,
        });

        // Add controls
        map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

        // Create draggable marker
        marker.current = new maplibregl.Marker({
            draggable: true,
            color: '#1a2847' // Brand color
        })
            .setLngLat([initialLng, initialLat])
            .addTo(map.current);

        marker.current.on('dragend', () => {
            const lngLat = marker.current!.getLngLat();
            setCurrentPos({ lat: lngLat.lat, lng: lngLat.lng });
        });

        // Also move marker on map click
        map.current.on('click', (e) => {
            marker.current?.setLngLat(e.lngLat);
            setCurrentPos({ lat: e.lngLat.lat, lng: e.lngLat.lng });
        });

    }, [initialLat, initialLng]);

    return (
        <div className="bg-gray-50 p-4 rounded-lg border space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="font-semibold text-[#1a2847]">Confirm Location</h3>
                    <p className="text-xs text-gray-500">Drag the pin to the exact entrance</p>
                </div>
            </div>

            <div className="h-[400px] w-full rounded-lg overflow-hidden border relative">
                <div ref={mapContainer} className="h-full w-full" />

                {/* Overlay helper */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-md text-xs font-medium text-gray-700 pointer-events-none z-10">
                    📍 Pin location for {suburb}, {city}
                </div>
            </div>

            <div className="flex gap-3 justify-end">
                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
                    >
                        Change Address
                    </button>
                )}
                <button
                    onClick={() => onConfirm(currentPos.lat, currentPos.lng)}
                    className="px-6 py-2 bg-[#1a2847] text-white text-sm font-semibold rounded-md hover:bg-[#2a3857]"
                >
                    Confirm Location
                </button>
            </div>
        </div>
    );
}
