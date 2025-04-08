
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { Event } from '@/types';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Calendar } from 'lucide-react';

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
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Initialize map when component mounts
  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [2.3522, 46.8566], // Default to center of France
      zoom: 5,
      projection: 'mercator' // Using Mercator projection (flat world map)
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
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = '#f59e0b';
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      el.style.cursor = 'pointer';
      
      // Create marker
      const marker = new mapboxgl.Marker({ 
        element: el,
        anchor: 'center' // Ensures the marker is centered on its coordinates
      })
        .setLngLat(coords)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div>
              <h3 class="font-semibold text-orange-600">${event.title}</h3>
              <p class="text-xs text-gray-600">${event.date}</p>
              <p class="text-xs text-gray-600">${event.location}</p>
              ${event.trailId ? `<p class="text-xs mt-1"><a href="/spots/${event.trailId}" class="text-blue-600 underline">Voir le spot</a></p>` : ''}
            </div>
          `)
        )
        .addTo(map.current);
      
      // Add click event to marker
      el.addEventListener('click', () => {
        setSelectedEvent(event);
      });
      
      markers.current.push(marker);
    });
  }, [events, loaded]);

  // Helper to get event coordinates (mock data for now)
  const getEventCoordinates = (event: Event): [number, number] => {
    // Use event coordinates if available
    if (event.coordinates) {
      return event.coordinates;
    }
    
    // Mock function to return coordinates for an event
    const mockCoords: {[key: string]: [number, number]} = {
      "Parc National des Cévennes": [3.6, 44.2],
      "Montpellier": [3.8767, 43.6108],
      "Lyon": [4.8357, 45.7640],
      "Chamonix": [6.8696, 45.9237]
    };
    
    return mockCoords[event.location] || [2.3522, 48.8566]; // Default to Paris if not found
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="relative w-full h-full">
      <div className="w-full h-full" ref={mapContainer} />
      
      {/* Event info panel */}
      {selectedEvent && (
        <div className="absolute bottom-4 right-4 w-72 bg-white rounded-lg shadow-lg p-4 z-10">
          <div className="flex justify-between">
            <h3 className="font-bold text-amber-700">{selectedEvent.title}</h3>
            <button 
              onClick={() => setSelectedEvent(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          
          <div className="mt-2 text-sm">
            <div className="flex items-center text-gray-600 mb-1">
              <Calendar size={14} className="mr-1" />
              {formatDate(selectedEvent.date)}
            </div>
            <p className="text-gray-600 mb-2">{selectedEvent.location}</p>
            <p className="text-gray-700 mb-3 text-xs">{selectedEvent.description}</p>
            
            {selectedEvent.trailId && (
              <Link to={`/spots/${selectedEvent.trailId}`}>
                <Button size="sm" className="w-full bg-amber-600 hover:bg-amber-700">
                  Voir le spot associé
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventMap;
