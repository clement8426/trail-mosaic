import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { trails } from '../data/trailsData';
import { events } from '../data/eventsData';
import { Trail, Event, Session, RegionSummary } from '@/types';
import { Button } from '@/components/ui/button';
import { X, MapPin, Calendar, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

// Set Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoiY2xlbTg0MjYiLCJhIjoiY2x1bDUxcmNwMHE4ZzJrcGg3eWVnamR0NyJ9.0b5j0eigjauA52msWlo3WQ';

interface TrailMapProps {
  selectedTrail?: string | null;
  onTrailSelect?: (trailId: string | null) => void;
  displaySessions?: boolean;
  displayEvents?: boolean;
  displayTrails?: boolean;
  userLocation?: [number, number] | null;
  onRegionSelect?: (region: string | null) => void;
  selectedRegion?: string | null;
  activeView?: 'all' | 'trails' | 'events' | 'sessions';
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

// Define mock regions
const regions: RegionSummary[] = [
  { name: 'Île-de-France', coordinates: [2.3522, 48.8566], spotCount: 3, eventCount: 2, sessionCount: 1 },
  { name: 'Auvergne-Rhône-Alpes', coordinates: [4.8357, 45.7640], spotCount: 5, eventCount: 3, sessionCount: 2 },
  { name: 'Occitanie', coordinates: [3.8767, 43.6108], spotCount: 4, eventCount: 1, sessionCount: 3 },
  { name: 'Bretagne', coordinates: [-1.6777, 48.1173], spotCount: 2, eventCount: 1, sessionCount: 0 }
];

const TrailMap: React.FC<TrailMapProps> = ({ 
  selectedTrail, 
  onTrailSelect, 
  displaySessions = true, 
  displayEvents = true, 
  displayTrails = true,
  userLocation = null,
  onRegionSelect,
  selectedRegion = null,
  activeView = 'all'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const regionMarkers = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    type: 'trail' | 'event' | 'session' | 'region';
    id: string;
    data: Trail | Event | Session | RegionSummary;
  } | null>(null);
  const [zoomLevel, setZoomLevel] = useState(5);
  const ZOOM_THRESHOLD = 7; // Zoom level threshold to switch between regions and individual markers

  const { toast } = useToast();
  
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

    // Listen for zoom events
    map.current.on('zoom', () => {
      if (map.current) {
        const newZoomLevel = map.current.getZoom();
        setZoomLevel(newZoomLevel);
      }
    });

    // Clean up on unmount
    return () => {
      if (map.current) {
        markers.current.forEach(marker => marker.remove());
        regionMarkers.current.forEach(marker => marker.remove());
        map.current.remove();
      }
    };
  }, []);

  // Update markers when map is loaded, data changes, or zoom level changes
  useEffect(() => {
    if (!mapLoaded || !map.current) return;
    
    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];
    regionMarkers.current.forEach(marker => marker.remove());
    regionMarkers.current = [];
    
    // If a specific region is selected OR zoom level is above threshold, show individual markers
    if (selectedRegion || zoomLevel >= ZOOM_THRESHOLD) {
      // Show individual markers
      if (displayTrails) {
        trails
          .filter(trail => !selectedRegion || trail.region === selectedRegion)
          .forEach(trail => {
            addMarker('trail', trail);
          });
      }

      if (displayEvents) {
        events
          .filter(event => !selectedRegion || event.region === selectedRegion)
          .forEach(event => {
            addMarker('event', event);
          });
      }

      if (displaySessions) {
        mockSessions.forEach(session => {
          const relatedTrail = trails.find(t => t.id === session.trailId);
          if (relatedTrail && (!selectedRegion || relatedTrail.region === selectedRegion)) {
            addMarker('session', session, relatedTrail.coordinates);
          }
        });
      }
      
      // If a region is selected, zoom in to it
      if (selectedRegion && !userLocation) {
        const regionData = regions.find(r => r.name === selectedRegion);
        if (regionData && map.current) {
          map.current.flyTo({
            center: regionData.coordinates,
            zoom: 8,
            essential: true
          });
        }
      }
    } else {
      // Show region summaries at lower zoom levels
      regions.forEach(region => {
        addRegionMarker(region);
      });
    }

    // If selectedTrail is set, select it
    if (selectedTrail) {
      const trail = trails.find(t => t.id === selectedTrail);
      if (trail) {
        handleItemSelect('trail', trail);
      }
    }
  }, [
    mapLoaded, 
    displayTrails, 
    displayEvents, 
    displaySessions, 
    selectedTrail, 
    activeView, 
    selectedRegion,
    zoomLevel // Dependency on zoom level to refresh markers
  ]);

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

    // Show toast notification
    toast({
      title: "Localisation trouvée",
      description: "Les spots sont maintenant triés par distance.",
    });
  }, [userLocation, mapLoaded, toast]);

  const addRegionMarker = (region: RegionSummary) => {
    if (!map.current) return;

    // Create marker element
    const el = document.createElement('div');
    el.className = `region-marker`;
    el.style.width = '40px';
    el.style.height = '40px';
    el.style.borderRadius = '50%';
    el.style.backgroundColor = 'rgba(66, 133, 244, 0.6)';
    el.style.border = '2px solid white';
    el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
    el.style.cursor = 'pointer';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.fontWeight = 'bold';
    el.style.color = 'white';
    el.innerHTML = `${region.spotCount + region.eventCount + region.sessionCount}`;
    
    // Create marker
    const marker = new mapboxgl.Marker({ element: el })
      .setLngLat(region.coordinates)
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div>
            <h3 class="font-semibold">${region.name}</h3>
            <div class="text-sm">
              <p><span class="text-forest-dark">${region.spotCount}</span> spots</p>
              <p><span class="text-trail-dark">${region.eventCount}</span> événements</p>
              <p><span class="text-blue-500">${region.sessionCount}</span> sessions</p>
            </div>
            <button 
              class="w-full mt-2 bg-blue-500 text-white py-1 px-2 rounded text-sm"
              onclick="window.regionSelected('${region.name}')"
            >
              Voir les détails
            </button>
          </div>
        `)
      )
      .addTo(map.current);
    
    // Add click event to marker
    el.addEventListener('click', () => {
      handleRegionSelect(region);
    });
    
    regionMarkers.current.push(marker);
  };

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

  const handleRegionSelect = (region: RegionSummary) => {
    // Select the region
    setSelectedItem({ type: 'region', id: region.name, data: region });
    
    if (onRegionSelect) {
      onRegionSelect(region.name);
    }
  };

  const closeInfoPanel = () => {
    setSelectedItem(null);
    if (onTrailSelect) {
      onTrailSelect(null);
    }
  };

  const handleBackToRegions = () => {
    if (onRegionSelect) {
      onRegionSelect(null);
    }
  };

  // Helper to get event coordinates
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  // Make region selection available to global scope for popup buttons
  useEffect(() => {
    window.regionSelected = (regionName: string) => {
      if (onRegionSelect) {
        onRegionSelect(regionName);
      }
    };
    
    return () => {
      delete window.regionSelected;
    };
  }, [onRegionSelect]);

  return (
    <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden">
      <div
        ref={mapContainerRef}
        className="w-full h-full"
      />
      
      {/* Back to regions button */}
      {selectedRegion && (
        <Button
          className="absolute top-4 left-4 z-10 bg-white text-gray-800 hover:bg-gray-100"
          onClick={handleBackToRegions}
        >
          ← Retour aux régions
        </Button>
      )}
      
      {/* Selected item info panel */}
      {selectedItem && (
        <div className="absolute bottom-4 right-4 w-72 bg-white rounded-lg shadow-lg p-4 z-10">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ 
                  backgroundColor: selectedItem.type === 'trail' ? '#16a34a' : 
                                  selectedItem.type === 'event' ? '#f59e0b' : 
                                  selectedItem.type === 'region' ? '#4285F4' : '#3b82f6' 
                }}
              ></div>
              <span className="text-xs font-medium capitalize">
                {selectedItem.type === 'trail' ? 'Spot' : 
                 selectedItem.type === 'event' ? 'Événement' : 
                 selectedItem.type === 'region' ? 'Région' : 'Session'}
              </span>
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
          
          {selectedItem.type === 'region' && (
            <>
              <h3 className="font-bold text-blue-700 mt-2">{(selectedItem.data as RegionSummary).name}</h3>
              
              <div className="mt-3">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-green-50 rounded">
                    <div className="text-lg font-bold text-forest-dark">{(selectedItem.data as RegionSummary).spotCount}</div>
                    <div className="text-xs text-gray-600">Spots</div>
                  </div>
                  <div className="p-2 bg-amber-50 rounded">
                    <div className="text-lg font-bold text-trail-dark">{(selectedItem.data as RegionSummary).eventCount}</div>
                    <div className="text-xs text-gray-600">Événements</div>
                  </div>
                  <div className="p-2 bg-blue-50 rounded">
                    <div className="text-lg font-bold text-blue-600">{(selectedItem.data as RegionSummary).sessionCount}</div>
                    <div className="text-xs text-gray-600">Sessions</div>
                  </div>
                </div>
              </div>
              
              <Button 
                className="w-full bg-blue-500 text-white py-2 rounded mt-4 text-sm font-medium hover:bg-blue-600 transition-colors"
                onClick={() => onRegionSelect && onRegionSelect((selectedItem.data as RegionSummary).name)}
              >
                Voir les détails
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// Add to window global for TypeScript
declare global {
  interface Window {
    regionSelected: (regionName: string) => void;
  }
}

export default TrailMap;
