
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { Event } from '@/types';

// Set your Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoiY2xlbTg0MjYiLCJhIjoiY2x1bDUxcmNwMHE4ZzJrcGg3eWVnamR0NyJ9.0b5j0eigjauA52msWlo3WQ';

interface EventMapProps {
  events: Event[];
  userLocation: [number, number] | null;
  onLocationSelected?: (coords: [number, number]) => void;
}

const EventMap: React.FC<EventMapProps> = ({ events, userLocation, onLocationSelected }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Initialize map when component mounts
  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [2.3522, 46.8566], // Default to center of France
      zoom: 5
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
    
    // Add geocoder (search) control
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      placeholder: 'Rechercher un lieu',
      language: 'fr',
      countries: 'fr'
    });

    map.current.addControl(geocoder, 'top-left');
    
    // Listen for selection in the geocoder
    geocoder.on('result', (e) => {
      if (onLocationSelected && e.result.center) {
        const coords: [number, number] = [e.result.center[0], e.result.center[1]];
        onLocationSelected(coords);
      }
    });

    map.current.on('load', () => {
      setLoaded(true);
    });

    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [onLocationSelected]);

  // Add user location when available
  useEffect(() => {
    if (!map.current || !loaded || !userLocation) return;
    
    // Add a marker for the user's location
    new mapboxgl.Marker({ color: '#3b82f6' })
      .setLngLat(userLocation)
      .addTo(map.current)
      .setPopup(new mapboxgl.Popup().setHTML('<div class="font-semibold">Votre position</div>'));
    
    // Center map on user location
    map.current.flyTo({
      center: userLocation,
      zoom: 10,
      essential: true
    });
  }, [userLocation, loaded]);

  // Add event markers
  useEffect(() => {
    if (!map.current || !loaded) return;
    
    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];
    
    // Add markers for each event
    events.forEach(event => {
      // Get mock coordinates for the event
      const coords = getEventCoordinates(event);
      
      // Create marker element
      const el = document.createElement('div');
      el.className = 'event-marker';
      
      // Create marker
      const marker = new mapboxgl.Marker({ color: '#f59e0b', element: el })
        .setLngLat(coords)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div>
              <h3 class="font-semibold text-orange-600">${event.title}</h3>
              <p class="text-xs text-gray-600">${event.date}</p>
              <p class="text-xs text-gray-600">${event.location}</p>
            </div>
          `)
        )
        .addTo(map.current);
      
      markers.current.push(marker);
    });
  }, [events, loaded]);

  // Helper to get event coordinates (mock data for now)
  const getEventCoordinates = (event: Event): [number, number] => {
    // Mock function to return coordinates for an event
    // In a real app, these should be stored in your event data
    const mockCoords: {[key: string]: [number, number]} = {
      "Parc National des Cévennes": [3.6, 44.2],
      "Montpellier": [3.8767, 43.6108],
      "Lyon": [4.8357, 45.7640],
      "Chamonix": [6.8696, 45.9237]
    };
    
    return mockCoords[event.location] || [2.3522, 48.8566]; // Default to Paris if not found
  };

  return (
    <div className="w-full h-full" ref={mapContainer} />
  );
};

export default EventMap;
