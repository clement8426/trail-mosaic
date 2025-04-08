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
  const [mapZoom, setMapZoom] = useState<number>(5);
  const [mapCenter, setMapCenter] = useState<[number, number]>([2.3522, 46.8566]);
  const [isLowZoom, setIsLowZoom] = useState<boolean>(false);

  // Initialize map when component mounts
  useEffect(() => {
    if (!mapContainer.current) return;
    
    console.log('Initializing map with center:', [2.3522, 46.8566], 'zoom:', 5);

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [2.3522, 46.8566], // Default to center of France
      zoom: 5,
      projection: {name: 'mercator'} as mapboxgl.Projection, // Fixed: Using proper Projection type
      renderWorldCopies: false, // Prevent multiple world copies which can cause marker issues
      maxZoom: 18,
      minZoom: 1 // Set minimum zoom to 1 to prevent issues at zoom level 0
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
        console.log('Location selected from geocoder:', coords);
        onLocationSelected(coords);
      }
    });

    map.current.on('load', () => {
      console.log('Map loaded');
      setLoaded(true);
    });
    
    // Add zoom change listener
    map.current.on('zoom', () => {
      if (map.current) {
        const newZoom = map.current.getZoom();
        const newCenter = map.current.getCenter();
        console.log('Map zoom changed:', newZoom, 'center:', [newCenter.lng, newCenter.lat]);
        setMapZoom(newZoom);
        setMapCenter([newCenter.lng, newCenter.lat]);
        
        // Check if we're at a low zoom level
        setIsLowZoom(newZoom < 2);
        
        // Log each marker's position after zoom
        if (markers.current.length > 0) {
          console.log('-------- Marker positions after zoom --------');
          markers.current.forEach((marker, index) => {
            const position = marker.getLngLat();
            console.log(`Marker ${index}: LngLat(${position.lng.toFixed(6)}, ${position.lat.toFixed(6)})`);
          });
        }
      }
    });
    
    // Add move end listener
    map.current.on('moveend', () => {
      if (map.current) {
        const newCenter = map.current.getCenter();
        console.log('Map move ended, center:', [newCenter.lng, newCenter.lat]);
      }
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
    
    console.log('Adding user location marker at:', userLocation);
    
    // Add a marker for the user's location
    new mapboxgl.Marker({ 
      color: '#3b82f6',
      anchor: 'center', // Ensure marker is properly centered
      offset: [0, 0] // Explicit offset to ensure consistency
    })
      .setLngLat(userLocation)
      .addTo(map.current)
      .setPopup(new mapboxgl.Popup().setHTML('<div class="font-semibold">Votre position</div>'));
    
    // Center map on user location
    map.current.flyTo({
      center: userLocation,
      zoom: 10,
      essential: true
    });
    
    console.log('Map centered on user location, new zoom:', 10);
  }, [userLocation, loaded]);

  // Add event markers
  useEffect(() => {
    if (!map.current || !loaded) return;
    
    console.log('Adding event markers, count:', events.length, 'current zoom:', mapZoom);
    
    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];
    
    // Calculate bounds of our events
    const bounds = new mapboxgl.LngLatBounds();
    events.forEach(event => {
      const coords = getEventCoordinates(event);
      bounds.extend(coords);
    });
    
    // Add markers for each event
    events.forEach((event, index) => {
      // Get mock coordinates for the event
      const coords = getEventCoordinates(event);
      console.log(`Event ${index} (${event.title}): Creating marker at coordinates:`, coords);
      
      // If we're at a very low zoom, we might want to adjust marker behavior
      if (isLowZoom && map.current) {
        // For low zoom levels, ensure we're using a normalized position
        // that stays within the visible bounds of the map
        const normalizedPos = normalizeCoordinates(coords, mapCenter, mapZoom);
        console.log(`Normalized position for marker ${index}:`, normalizedPos);
      }
      
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
      
      // Log marker DOM element details
      console.log(`Event ${index} marker element:`, {
        width: el.style.width,
        height: el.style.height,
        backgroundColor: el.style.backgroundColor
      });
      
      // Create marker with full explicit settings to prevent drifting
      const marker = new mapboxgl.Marker({ 
        element: el,
        anchor: 'center', // Ensures the marker is centered on its coordinates
        offset: [0, 0], // Explicit offset to ensure consistency
        pitchAlignment: 'viewport', // Use viewport alignment instead of map
        rotationAlignment: 'viewport' // Use viewport alignment instead of map
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
        
      console.log(`Event ${index} marker added to map, position:`, marker.getLngLat());
      
      // Add click event to marker
      el.addEventListener('click', () => {
        setSelectedEvent(event);
        console.log('Marker clicked, selected event:', event.title);
      });
      
      markers.current.push(marker);
    });
    
    // If we have events, fit the map to show all event markers
    if (events.length > 0 && !userLocation && map.current) {
      try {
        map.current.fitBounds(bounds, {
          padding: 100,
          maxZoom: 12
        });
      } catch (error) {
        console.error("Error fitting bounds:", error);
      }
    }
    
    console.log('Total markers added:', markers.current.length);
  }, [events, loaded, mapZoom, isLowZoom, mapCenter]);

  // Helper to normalize coordinates for low zoom levels
  const normalizeCoordinates = (coords: [number, number], center: [number, number], zoom: number): [number, number] => {
    if (zoom >= 2) return coords;
    
    // At very low zoom, we need to adjust the longitude to prevent wrapping
    // This is a simplified approach - for a full solution, consider using a proper map projection library
    const [lng, lat] = coords;
    
    // Keep longitude within reasonable bounds around the center
    let normalizedLng = lng;
    const centerLng = center[0];
    
    // If the longitude is too far from the center, adjust it
    const lngDiff = Math.abs(normalizedLng - centerLng);
    if (lngDiff > 180) {
      normalizedLng = normalizedLng > centerLng ? normalizedLng - 360 : normalizedLng + 360;
    }
    
    return [normalizedLng, lat];
  };

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

  // Add debug information overlay
  const renderDebugInfo = () => {
    return (
      <div className="absolute bottom-14 left-4 bg-white p-2 rounded shadow text-xs z-10 max-w-xs max-h-48 overflow-auto">
        <div><strong>Zoom:</strong> {mapZoom.toFixed(2)}</div>
        <div><strong>Center:</strong> [{mapCenter[0].toFixed(4)}, {mapCenter[1].toFixed(4)}]</div>
        <div><strong>Markers:</strong> {markers.current.length}</div>
        <div><strong>Map loaded:</strong> {loaded ? 'Yes' : 'No'}</div>
        <div><strong>Low zoom mode:</strong> {isLowZoom ? 'Yes' : 'No'}</div>
      </div>
    );
  };

  return (
    <div className="relative w-full h-full">
      <div className="w-full h-full" ref={mapContainer} />
      
      {/* Debug info panel */}
      {renderDebugInfo()}
      
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
