'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { Task } from '@/types';

interface TaskMapProps {
    tasks: Task[];
    onTaskSelect: (taskId: string) => void;
}

// Zimbabwe coordinates (Harare center)
const ZIMBABWE_CENTER: [number, number] = [31.0335, -17.8252]; // lng, lat for MapLibre

export default function TaskMap({ tasks, onTaskSelect }: TaskMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const markersRef = useRef<maplibregl.Marker[]>([]);

    useEffect(() => {
        if (!mapContainer.current) return;
        if (map.current) return; // Initialize map only once

        // Initialize map with light style
        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
            center: ZIMBABWE_CENTER,
            zoom: 11,
        });

        // Add navigation controls
        map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

        map.current.on('load', () => {
            setMapLoaded(true);
        });

        return () => {
            // Clean up markers
            markersRef.current.forEach(m => m.remove());
            markersRef.current = [];
            map.current?.remove();
            map.current = null;
        };
    }, []);

    useEffect(() => {
        if (!map.current || !mapLoaded) return;

        // Clear existing markers
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];

        // Add markers for tasks
        tasks.forEach((task) => {
            if (!map.current) return;

            // Generate random coordinates around Harare
            const latOffset = (Math.random() - 0.5) * 0.1;
            const lngOffset = (Math.random() - 0.5) * 0.1;
            const coordinates: [number, number] = [
                ZIMBABWE_CENTER[0] + lngOffset,
                ZIMBABWE_CENTER[1] + latOffset,
            ];

            // Create custom marker element
            const el = document.createElement('div');
            el.className = 'custom-marker';
            el.style.width = '30px';
            el.style.height = '30px';
            el.style.borderRadius = '50%';
            el.style.backgroundColor = '#292d73';
            el.style.border = '3px solid white';
            el.style.cursor = 'pointer';
            el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';

            // Create popup
            const popupContent = document.createElement('div');
            popupContent.style.padding = '12px';
            popupContent.style.minWidth = '220px';
            popupContent.innerHTML = `
        <h3 style="font-weight: 600; margin-bottom: 10px; font-size: 15px; color: #1a2847;">${task.title}</h3>
        <div style="font-size: 13px; color: #6b7280; margin-bottom: 10px;">
          <div style="margin-bottom: 4px;">📍 ${task.location}</div>
          <div style="font-weight: bold; color: #292d73; font-size: 18px; margin-top: 8px;">$${task.budget}</div>
        </div>
      `;

            const viewButton = document.createElement('button');
            viewButton.textContent = 'View Details';
            viewButton.style.cssText = 'color: #292d73; text-decoration: underline; font-size: 13px; background: none; border: none; cursor: pointer; padding: 0; font-weight: 600;';
            viewButton.onclick = (e) => {
                e.stopPropagation();
                onTaskSelect(task.id);
            };
            popupContent.appendChild(viewButton);

            const popup = new maplibregl.Popup({
                offset: 35,
                closeButton: true,
                closeOnClick: false,
                maxWidth: '300px',
            }).setDOMContent(popupContent);

            // Add marker
            const marker = new maplibregl.Marker({ element: el })
                .setLngLat(coordinates)
                .setPopup(popup)
                .addTo(map.current);

            // Store marker reference
            markersRef.current.push(marker);

            // Show popup on marker click
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                marker.togglePopup();
            });
        });
    }, [tasks, mapLoaded, onTaskSelect]);

    return <div ref={mapContainer} className="h-full w-full" style={{ minHeight: '600px' }} />;
}
