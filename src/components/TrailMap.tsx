
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { trails } from '../data/trailsData';
import { events } from '../data/eventsData';
import { Trail, Event, Session } from '@/types';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';

// Set Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoiY2xlbTg0MjYiLCJhIjoiY2x1bDUxcmNwMHE4ZzJrcGg3eWVnamR0NyJ9.0b5j0eigjauA52msWlo3WQ';

interface TrailMapProps {
  selectedTrail?: string | null;
  onTrailSelect?: (trailId: string | null) => void;
  displaySessions?: boolean;
  displayEvents?: boolean;
  displayTrails?: boolean;
  userLocation?: [number, number] | null;
}

// Mock sessions data
const mockSessions: Session[] = [
  {
    id: "session1",
    title: "Sortie groupe intermédiaire",
    description: "Session de groupe pour riders intermédiaires",
    date: "2023-07-15",
    time: "14:00",
    createdBy: "user1",
    participants: [
      { userId: "user1", username: "Alex", status: "going" },
      { userId: "user2", username: "Marine", status: "going" },
    ],
    trailId: "trail1"
  },
  {
    id: "session2",
    title: "Entraînement technique",
    description: "Focus sur les sauts et les virages relevés",
    date: "2023-07-20",
    time: "10:00",
    createdBy: "user3",
    participants: [
      { userId: "user3", username: "Thomas", status: "going" },
      { userId: "user4", username: "Julie", status: "interested" },
    ],
    trailId: "trail2"
  }
];

const TrailMap: React.FC<TrailMapProps> = ({ 
  selectedTrail, 
  onTrailSelect, 
  displaySessions = true, 
  displayEvents = true, 
  displayTrails = true,
  userLocation = null
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    type: 'trail' | 'event' | 'session';
    id: string;
    data: Trail | Event | Session;
  } | null>(null);
  
  // Initialize map when component mounts
  useEffect(() => {
    if (!mapContainerRef.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainerRef.current,
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
    
    // Listen for map load event
    map.current.on('load', () => {
      setMapLoaded(true);
    });

    // Clean up on unmount
    return () => {
      if (map.current) {
        markers.current.forEach(marker => marker.remove());
        map.current.remove();
      }
    };
  }, []);

  // Update markers when map is loaded and data changes
  useEffect(() => {
    if (!mapLoaded || !map.current) return;
    
    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];
    
    // Add trail markers
    if (displayTrails) {
      trails.forEach(trail => {
        addMarker('trail', trail);
      });
    }

    // Add event markers
    if (displayEvents) {
      events.forEach(event => {
        addMarker('event', event);
      });
    }

    // Add session markers
    if (displaySessions) {
      mockSessions.forEach(session => {
        const relatedTrail = trails.find(t => t.id === session.trailId);
        if (relatedTrail) {
          addMarker('session', session, relatedTrail.coordinates);
        }
      });
    }

    // If selectedTrail is set, select it
    if (selectedTrail) {
      const trail = trails.find(t => t.id === selectedTrail);
      if (trail) {
        handleItemSelect('trail', trail);
      }
    }
  }, [mapLoaded, displayTrails, displayEvents, displaySessions, selectedTrail]);

  // Center map on user location when available
  useEffect(() => {
    if (!map.current || !mapLoaded || !userLocation) return;
    
    // Add a marker for the user's location
    const userMarker = new mapboxgl.Marker({ color: '#3b82f6' })
      .setLngLat(userLocation)
      .addTo(map.current)
      .setPopup(new mapboxgl.Popup().setHTML('<div class="font-semibold">Votre position</div>'));
    
    markers.current.push(userMarker);
    
    // Center map on user location
    map.current.flyTo({
      center: userLocation,
      zoom: 10,
      essential: true
    });
  }, [userLocation, mapLoaded]);

  const addMarker = (type: 'trail' | 'event' | 'session', item: Trail | Event | Session, coordinates?: [number, number]) => {
    if (!map.current) return;

    let coords: [number, number];
    let color: string;
    let title: string;
    let subtitle: string;

    // Determine coordinates and marker properties based on type
    switch (type) {
      case 'trail':
        const trail = item as Trail;
        coords = trail.coordinates;
        color = '#16a34a'; // Green
        title = trail.name;
        subtitle = trail.location;
        break;
      case 'event':
        const event = item as Event;
        coords = getEventCoordinates(event);
        color = '#f59e0b'; // Orange/yellow
        title = event.title;
        subtitle = event.date;
        break;
      case 'session':
        const session = item as Session;
        coords = coordinates || [0, 0]; // Use provided coordinates or default
        color = '#3b82f6'; // Blue
        title = session.title;
        subtitle = `${session.date} - ${session.time}`;
        break;
      default:
        return;
    }

    // Create marker element
    const el = document.createElement('div');
    el.className = `marker-${type}`;
    el.style.width = '24px';
    el.style.height = '24px';
    el.style.borderRadius = '50%';
    el.style.backgroundColor = color;
    el.style.border = '2px solid white';
    el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
    el.style.cursor = 'pointer';
    
    // Create marker
    const marker = new mapboxgl.Marker({ element: el })
      .setLngLat(coords)
      .addTo(map.current);
    
    // Add click event to marker
    el.addEventListener('click', () => {
      handleItemSelect(type, item);
    });
    
    markers.current.push(marker);
  };

  const handleItemSelect = (type: 'trail' | 'event' | 'session', item: Trail | Event | Session) => {
    setSelectedItem({ type, id: item.id, data: item });
    
    // If it's a trail and we have an onTrailSelect callback, call it
    if (type === 'trail' && onTrailSelect) {
      onTrailSelect(item.id);
    }
    
    // Fly to item location
    if (map.current) {
      let coords: [number, number];
      
      switch (type) {
        case 'trail':
          coords = (item as Trail).coordinates;
          break;
        case 'event':
          coords = getEventCoordinates(item as Event);
          break;
        case 'session':
          const sessionTrail = trails.find(t => t.id === (item as Session).trailId);
          coords = sessionTrail ? sessionTrail.coordinates : [0, 0];
          break;
        default:
          return;
      }
      
      map.current.flyTo({
        center: coords,
        zoom: 12,
        essential: true
      });
    }
  };

  const closeInfoPanel = () => {
    setSelectedItem(null);
    if (onTrailSelect) {
      onTrailSelect(null);
    }
  };

  // Helper to get event coordinates
  const getEventCoordinates = (event: Event): [number, number] => {
    // Mock function to return coordinates for an event
    // In a real app, these should be stored in your event data
    const mockCoords: {[key: string]: [number, number]} = {
      "Parc National des Cévennes": [3.6, 44.2],
      "Montpellier": [3.8767, 43.6108],
      "Lyon": [4.8357, 45.7640],
      "Chamonix": [6.8696, 45.9237]
    };
    
    if (event.coordinates) {
      return event.coordinates;
    }
    
    return mockCoords[event.location] || [2.3522, 48.8566]; // Default to Paris if not found
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden">
      <div
        ref={mapContainerRef}
        className="w-full h-full"
      />
      
      {/* Selected item info panel */}
      {selectedItem && (
        <div className="absolute bottom-4 right-4 w-72 bg-white rounded-lg shadow-lg p-4 z-10">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ 
                  backgroundColor: selectedItem.type === 'trail' ? '#16a34a' : 
                                  selectedItem.type === 'event' ? '#f59e0b' : '#3b82f6' 
                }}
              ></div>
              <span className="text-xs font-medium capitalize">{selectedItem.type}</span>
            </div>
            <Button 
              size="sm" 
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={closeInfoPanel}
            >
              <X size={16} />
            </Button>
          </div>
          
          {selectedItem.type === 'trail' && (
            <>
              <h3 className="font-bold text-forest-dark mt-2">{(selectedItem.data as Trail).name}</h3>
              <p className="text-sm text-gray-500">{(selectedItem.data as Trail).location}</p>
              
              <div className="flex justify-between mt-2 text-sm">
                <span>{(selectedItem.data as Trail).distance} km</span>
                <span>{(selectedItem.data as Trail).difficulty}</span>
                <span>{(selectedItem.data as Trail).trailType}</span>
              </div>
              <Link to={`/spots/${selectedItem.id}`}>
                <Button 
                  className="w-full bg-forest text-white py-2 rounded mt-3 text-sm font-medium hover:bg-forest-dark transition-colors"
                >
                  Voir les détails
                </Button>
              </Link>
            </>
          )}
          
          {selectedItem.type === 'event' && (
            <>
              <h3 className="font-bold text-forest-dark mt-2">{(selectedItem.data as Event).title}</h3>
              <p className="text-sm text-gray-500">{(selectedItem.data as Event).location}</p>
              <p className="text-sm text-gray-500 mt-1">{formatDate((selectedItem.data as Event).date)}</p>
              <p className="text-sm mt-2">{(selectedItem.data as Event).description}</p>
              {(selectedItem.data as Event).trailId && (
                <Link to={`/spots/${(selectedItem.data as Event).trailId}`}>
                  <Button 
                    className="w-full bg-trail text-white py-2 rounded mt-3 text-sm font-medium hover:bg-trail/80 transition-colors"
                  >
                    Voir le spot associé
                  </Button>
                </Link>
              )}
            </>
          )}
          
          {selectedItem.type === 'session' && (
            <>
              <h3 className="font-bold text-forest-dark mt-2">{(selectedItem.data as Session).title}</h3>
              <p className="text-sm text-gray-600">{formatDate((selectedItem.data as Session).date)} à {(selectedItem.data as Session).time}</p>
              <p className="text-sm mt-2">{(selectedItem.data as Session).description}</p>
              
              <div className="mt-3">
                <p className="text-xs font-medium text-gray-500">Participants:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(selectedItem.data as Session).participants.map(p => (
                    <span 
                      key={p.userId}
                      className="px-2 py-1 bg-gray-100 rounded-full text-xs"
                    >
                      {p.username}
                    </span>
                  ))}
                </div>
              </div>
              
              <Link to={`/spots/${(selectedItem.data as Session).trailId}`}>
                <Button 
                  className="w-full bg-blue-500 text-white py-2 rounded mt-3 text-sm font-medium hover:bg-blue-600 transition-colors"
                >
                  Voir le spot associé
                </Button>
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TrailMap;
