'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { Task } from '@/types';

interface TaskMapProps {
    tasks: Task[];
    onTaskSelect: (taskId: string) => void;
    focusedTaskId?: string | null;
}

// Zimbabwe coordinates (Harare center)
const ZIMBABWE_CENTER: [number, number] = [31.0335, -17.8252]; // lng, lat for MapLibre

export default function TaskMap({ tasks, onTaskSelect, focusedTaskId }: TaskMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const markersRef = useRef<maplibregl.Marker[]>([]);
    const activePopupRef = useRef<maplibregl.Popup | null>(null);

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

    // Effect to handle focusing on a specific task
    useEffect(() => {
        if (!map.current || !mapLoaded || !focusedTaskId) return;

        const taskToFocus = tasks.find(t => t.id === focusedTaskId);
        if (taskToFocus) {
            const performFlyTo = (lng: number, lat: number) => {
                if (!map.current) return;

                map.current.flyTo({
                    center: [lng, lat],
                    zoom: 15,
                    essential: true
                });

                // Find and open popup
                // We need a slight delay to ensure markers are created if this is the first load
                setTimeout(() => {
                    const marker = markersRef.current.find(m => (m as any)._taskId === focusedTaskId);
                    if (marker) {
                        // Close existing popup
                        if (activePopupRef.current) {
                            activePopupRef.current.remove();
                        }

                        marker.togglePopup();
                        activePopupRef.current = marker.getPopup();
                    }
                }, 500);
            };

            if (taskToFocus.lat && taskToFocus.lng) {
                performFlyTo(taskToFocus.lng, taskToFocus.lat);
            } else if (taskToFocus.location) {
                // Geocode on the fly
                import('use-places-autocomplete').then(async ({ getGeocode, getLatLng }) => {
                    try {
                        const results = await getGeocode({ address: taskToFocus.location });
                        const { lat, lng } = await getLatLng(results[0]);
                        performFlyTo(lng, lat);
                    } catch (error) {
                        console.error("Failed to geocode for flyTo:", error);
                    }
                });
            }
        }
    }, [focusedTaskId, mapLoaded, tasks]);

    useEffect(() => {
        if (!map.current || !mapLoaded) return;

        // Clear existing markers
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];

        // Helper to add a marker
        const addMarker = (task: Task, lng: number, lat: number) => {
            if (!map.current) return;

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
                .setLngLat([lng, lat])
                .setPopup(popup)
                .addTo(map.current!); // Non-null assertion safe because of check at start of function

            // Store task ID on marker for reference
            (marker as any)._taskId = task.id;

            // Store marker reference
            markersRef.current.push(marker);

            // Show popup on marker click and close others
            el.addEventListener('click', (e) => {
                e.stopPropagation();

                // Close currently active popup if it's different
                if (activePopupRef.current && activePopupRef.current !== popup) {
                    activePopupRef.current.remove();
                }

                marker.togglePopup();
                activePopupRef.current = popup;
            });

            // Also update active popup ref when popup is closed via X button
            popup.on('close', () => {
                if (activePopupRef.current === popup) {
                    activePopupRef.current = null;
                }
            });
        };

        // Process tasks
        tasks.forEach(async (task) => {
            if (task.lat && task.lng) {
                // If we have coordinates, use them
                addMarker(task, task.lng, task.lat);
            } else if (task.location) {
                // If no coordinates but we have a location string, try to geocode it
                try {
                    // We need to dynamically import these to avoid SSR issues and ensure Google Maps is loaded
                    const { getGeocode, getLatLng } = await import('use-places-autocomplete');
                    const results = await getGeocode({ address: task.location });
                    const { lat, lng } = await getLatLng(results[0]);
                    addMarker(task, lng, lat);
                } catch (error) {
                    console.warn(`Failed to geocode location for task ${task.id} (${task.location}):`, error);
                    // If geocoding fails, we simply don't show the marker.
                    // This is better than showing it in the wrong place (Harare).
                }
            }
        });
    }, [tasks, mapLoaded, onTaskSelect]);

    return <div ref={mapContainer} className="h-full w-full" style={{ minHeight: '600px' }} />;
}
