import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { trails } from '../data/trailsData';
import { events } from '../data/eventsData';
import { sessions } from '../data/sessionsData';
import { Trail, Event, Session } from '@/types';
import { Button } from '@/components/ui/button';
import { X, MapPin, Calendar, Users, Navigation, ExternalLink } from 'lucide-react';
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

type MarkerType = 'trail' | 'trail-event' | 'trail-session' | 'trail-event-session';

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
  const markers = useRef<{marker: mapboxgl.Marker, id: string, type: MarkerType}[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    type: 'trail' | 'event' | 'session';
    id: string;
    data: Trail | Event | Session;
  } | null>(null);
  const [zoomLevel, setZoomLevel] = useState(5);
  const [mapCenter, setMapCenter] = useState<[number, number]>([2.3522, 46.8566]);
  const [isLowZoom, setIsLowZoom] = useState(false);

  const { toast } = useToast();
  
  // Initialize map when component mounts
  useEffect(() => {
    if (!mapContainerRef.current) return;

    console.log('Initializing TrailMap with initial center:', [2.3522, 46.8566], 'zoom:', 5);

    map.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [2.3522, 46.8566], // Default to center of France
      zoom: 5,
      projection: {name: 'mercator'} as mapboxgl.Projection,
      renderWorldCopies: false, // Prevent multiple world copies which can cause marker issues
      antialias: true, // Try adding antialiasing
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
    
    // Listen for map load event
    map.current.on('load', () => {
      console.log('TrailMap loaded successfully');
      setMapLoaded(true);
      
      // Add bounds checking to prevent excessive panning
      map.current!.setMaxBounds([
        [-180, -85], // Southwest coordinates
        [180, 85]    // Northeast coordinates
      ]);
    });

    // Listen for zoom start events
    map.current.on('zoomstart', () => {
      console.log('Zoom start event triggered');
    });

    // Listen for zoom events
    map.current.on('zoom', () => {
      if (map.current) {
        const newZoomLevel = Math.floor(map.current.getZoom());
        const newCenter = map.current.getCenter();
        console.log('Zoom event triggered, new zoom level:', newZoomLevel, 'center:', [newCenter.lng, newCenter.lat]);
        
        if (newZoomLevel !== zoomLevel) {
          console.log('Zoom level changed from', zoomLevel, 'to', newZoomLevel);
          setZoomLevel(newZoomLevel);
          
          // Check if we're in a low zoom level
          setIsLowZoom(newZoomLevel < 2);
        }
        
        setMapCenter([newCenter.lng, newCenter.lat]);
        
        // Log marker positions during zoom
        if (markers.current.length > 0) {
          console.log('-------- Marker positions during zoom --------');
          markers.current.forEach((markerObj, index) => {
            const position = markerObj.marker.getLngLat();
            console.log(`Marker ${index} (${markerObj.id}, ${markerObj.type}): LngLat(${position.lng.toFixed(6)}, ${position.lat.toFixed(6)})`);
          });
        }
      }
    });
    
    // Listen for move end events
    map.current.on('moveend', () => {
      if (map.current) {
        const newCenter = map.current.getCenter();
        console.log('Move end event triggered, new center:', [newCenter.lng, newCenter.lat]);
      }
    });

    // Clean up on unmount
    return () => {
      if (map.current) {
        markers.current.forEach(markerObj => markerObj.marker.remove());
        map.current.remove();
      }
    };
  }, []);

  // Update markers when map is loaded or data changes
  useEffect(() => {
    if (!mapLoaded || !map.current) return;
    
    console.log("Updating markers, zoom level:", zoomLevel, "activeView:", activeView, "map center:", mapCenter, "isLowZoom:", isLowZoom);
    
    // Clear existing markers
    markers.current.forEach(markerObj => markerObj.marker.remove());
    markers.current = [];
    
    let visibleTrails: Trail[] = [];
    let visibleEvents: Event[] = [];
    let visibleSessions: Session[] = [];
    
    // Get all trails based on active view and filters
    if (displayTrails && (activeView === 'all' || activeView === 'trails')) {
      visibleTrails = selectedRegion 
        ? trails.filter(trail => trail.region === selectedRegion)
        : [...trails];
    }
    
    // Handle events visibility
    if (displayEvents && (activeView === 'all' || activeView === 'events')) {
      // For events view, show all visible events and their associated trails
      visibleEvents = selectedRegion 
        ? events.filter(event => event.region === selectedRegion)
        : [...events];
      
      // Add trails associated with events if not already visible
      const eventTrailIds = new Set(visibleEvents.map(e => e.trailId).filter(Boolean));
      
      // If we're in events view, only show trails that have events
      if (activeView === 'events') {
        visibleTrails = trails.filter(trail => eventTrailIds.has(trail.id));
        if (selectedRegion) {
          visibleTrails = visibleTrails.filter(trail => trail.region === selectedRegion);
        }
      } else if (activeView === 'all') {
        // In all view, make sure to include trails with events
        const additionalTrails = trails.filter(
          trail => eventTrailIds.has(trail.id) && !visibleTrails.some(t => t.id === trail.id)
        );
        visibleTrails = [...visibleTrails, ...additionalTrails];
      }
    }
    
    // Handle sessions visibility
    if (displaySessions && (activeView === 'all' || activeView === 'sessions')) {
      // For sessions view, show all visible sessions and their associated trails
      visibleSessions = [...sessions];
      if (selectedRegion) {
        const regionTrailIds = new Set(trails.filter(t => t.region === selectedRegion).map(t => t.id));
        visibleSessions = visibleSessions.filter(session => regionTrailIds.has(session.trailId));
      }
      
      // Add trails associated with sessions if not already visible
      const sessionTrailIds = new Set(visibleSessions.map(s => s.trailId));
      
      // If we're in sessions view, only show trails that have sessions
      if (activeView === 'sessions') {
        visibleTrails = trails.filter(trail => sessionTrailIds.has(trail.id));
        if (selectedRegion) {
          visibleTrails = visibleTrails.filter(trail => trail.region === selectedRegion);
        }
      } else if (activeView === 'all') {
        // In all view, make sure to include trails with sessions
        const additionalTrails = trails.filter(
          trail => sessionTrailIds.has(trail.id) && !visibleTrails.some(t => t.id === trail.id)
        );
        visibleTrails = [...visibleTrails, ...additionalTrails];
      }
    }
    
    console.log(`Displaying: ${visibleTrails.length} trails, ${visibleEvents.length} events, ${visibleSessions.length} sessions`);
    
    // Calculate bounds for all visible markers
    const bounds = new mapboxgl.LngLatBounds();
    
    // For each trail, check if it has associated events or sessions and add markers
    visibleTrails.forEach(trail => {
      // Find events and sessions associated with this trail
      const trailEvents = visibleEvents.filter(event => event.trailId === trail.id);
      const trailSessions = visibleSessions.filter(session => session.trailId === trail.id);
      
      // Determine marker type based on associations
      let markerType: MarkerType = 'trail';
      if (trailEvents.length > 0 && trailSessions.length > 0) {
        markerType = 'trail-event-session';
      } else if (trailEvents.length > 0) {
        markerType = 'trail-event';
      } else if (trailSessions.length > 0) {
        markerType = 'trail-session';
      }
      
      // Add the marker to the map
      addTrailMarker(trail, markerType, trailEvents, trailSessions);
      
      // Extend the bounds
      bounds.extend(trail.coordinates);
    });
    
    // If we have visible trails, fit bounds unless a specific trail is selected
    if (visibleTrails.length > 0 && !selectedTrail && !userLocation && map.current) {
      try {
        map.current.fitBounds(bounds, {
          padding: 100,
          maxZoom: 12
        });
      } catch (error) {
        console.error("Error fitting bounds:", error);
      }
    }
      
    // If selectedTrail is set, select it
    if (selectedTrail) {
      const trail = trails.find(t => t.id === selectedTrail);
      if (trail) {
        console.log('Selecting pre-selected trail:', trail.name);
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
    zoomLevel,
    isLowZoom
  ]);

  // Center map on user location when available
  useEffect(() => {
    if (!map.current || !mapLoaded || !userLocation) return;
    
    console.log('Adding user location marker at:', userLocation);
    
    // Add a marker for the user's location
    const userMarker = new mapboxgl.Marker({ 
      color: '#3b82f6',
      anchor: 'center', // Ensure marker is properly centered
      offset: [0, 0], // Explicit offset to ensure consistency
      pitchAlignment: 'viewport', // Try viewport alignment instead of map
      rotationAlignment: 'viewport' // Try viewport alignment instead of map
    })
      .setLngLat(userLocation)
      .addTo(map.current)
      .setPopup(new mapboxgl.Popup().setHTML('<div class="font-semibold">Votre position</div>'));
    
    markers.current.push({
      marker: userMarker,
      id: 'user-location',
      type: 'trail' // Using trail as default type for user marker
    });
    
    // Center map on user location
    map.current.flyTo({
      center: userLocation,
      zoom: 10,
      essential: true
    });
    
    console.log('Map centered on user location, new zoom:', 10);

    // Show toast notification
    toast({
      title: "Localisation trouvée",
      description: "Les spots sont maintenant triés par distance.",
    });
  }, [userLocation, mapLoaded, toast]);

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

  const addTrailMarker = (
    trail: Trail, 
    type: MarkerType,
    trailEvents: Event[],
    trailSessions: Session[]
  ) => {
    if (!map.current) return;

    const coords = trail.coordinates;
    console.log(`Creating marker for ${trail.name} (${type}) at coordinates:`, coords);
    
    // If we're at a very low zoom, we might want to adjust marker behavior
    let markerCoords = coords;
    if (isLowZoom) {
      // For low zoom levels, ensure we're using a normalized position
      markerCoords = normalizeCoordinates(coords, mapCenter, zoomLevel);
      console.log(`Normalized position for marker ${trail.name}:`, markerCoords);
    }
    
    let color: string;
    let borderColor: string = 'white';
    let size: number = 24;

    // Determine marker color based on type
    switch (type) {
      case 'trail-event-session':
        color = '#9b87f5'; // Purple for spots with both events and sessions
        borderColor = '#FEC6A1'; // Orange border
        size = 32; // Larger marker
        break;
      case 'trail-event':
        color = '#f59e0b'; // Orange/amber for spots with events
        borderColor = '#FEF7CD'; // Yellow border
        size = 28;
        break;
      case 'trail-session':
        color = '#3b82f6'; // Blue for spots with sessions
        borderColor = '#D3E4FD'; // Soft blue border
        size = 28;
        break;
      default:
        color = '#16a34a'; // Green for regular spots
        break;
    }

    // Create marker element
    const el = document.createElement('div');
    el.className = `marker-${type}`;
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.borderRadius = '50%';
    el.style.backgroundColor = color;
    el.style.border = `3px solid ${borderColor}`;
    el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
    el.style.cursor = 'pointer';
    
    // Log marker DOM element details
    console.log(`Marker for ${trail.name} element:`, {
      type,
      width: el.style.width,
      height: el.style.height,
      backgroundColor: el.style.backgroundColor,
      borderColor: el.style.border
    });
    
    // Add icons or counters for spots with events/sessions
    if (type === 'trail-event-session' || type === 'trail-event' || type === 'trail-session') {
      // Add a counter for multiple events/sessions
      const countersDiv = document.createElement('div');
      countersDiv.style.position = 'absolute';
      countersDiv.style.bottom = '-5px';
      countersDiv.style.right = '-5px';
      countersDiv.style.display = 'flex';
      
      if (type === 'trail-event' || type === 'trail-event-session') {
        const eventCounter = document.createElement('div');
        eventCounter.style.width = '16px';
        eventCounter.style.height = '16px';
        eventCounter.style.borderRadius = '50%';
        eventCounter.style.backgroundColor = '#f59e0b';
        eventCounter.style.color = 'white';
        eventCounter.style.fontSize = '10px';
        eventCounter.style.display = 'flex';
        eventCounter.style.alignItems = 'center';
        eventCounter.style.justifyContent = 'center';
        eventCounter.style.fontWeight = 'bold';
        eventCounter.style.border = '1px solid white';
        eventCounter.textContent = trailEvents.length.toString();
        countersDiv.appendChild(eventCounter);
      }
      
      if (type === 'trail-session' || type === 'trail-event-session') {
        const sessionCounter = document.createElement('div');
        sessionCounter.style.width = '16px';
        sessionCounter.style.height = '16px';
        sessionCounter.style.borderRadius = '50%';
        sessionCounter.style.backgroundColor = '#3b82f6';
        sessionCounter.style.color = 'white';
        sessionCounter.style.fontSize = '10px';
        sessionCounter.style.display = 'flex';
        sessionCounter.style.alignItems = 'center';
        sessionCounter.style.justifyContent = 'center';
        sessionCounter.style.fontWeight = 'bold';
        sessionCounter.style.border = '1px solid white';
        sessionCounter.style.marginLeft = type === 'trail-event-session' ? '2px' : '0';
        sessionCounter.textContent = trailSessions.length.toString();
        countersDiv.appendChild(sessionCounter);
      }
      
      el.appendChild(countersDiv);
      el.style.position = 'relative';
    }
    
    // Create marker with enhanced settings to prevent drifting at any zoom level
    const marker = new mapboxgl.Marker({ 
      element: el,
      anchor: 'center', // Ensures the marker is centered on its coordinates
      offset: [0, 0], // Explicit offset to ensure consistency
      pitchAlignment: 'viewport', // Try viewport alignment instead of map
      rotationAlignment: 'viewport' // Try viewport alignment instead of map
    })
      .setLngLat(markerCoords)
      .addTo(map.current);
      
    console.log(`Marker for ${trail.name} added to map, position:`, marker.getLngLat());
    
    // Add popup with trail info and event/session counts
    let popupContent = `
      <div>
        <h3 class="font-semibold">${trail.name}</h3>
        <p class="text-xs text-gray-600">${trail.location}</p>
    `;
    
    if (trailEvents.length > 0) {
      popupContent += `
        <p class="text-xs mt-1">
          <span class="font-medium text-amber-600">Events: ${trailEvents.length}</span>
        </p>
      `;
    }
    
    if (trailSessions.length > 0) {
      popupContent += `
        <p class="text-xs">
          <span class="font-medium text-blue-600">Sessions: ${trailSessions.length}</span>
        </p>
      `;
    }
    
    popupContent += `</div>`;
    
    marker.setPopup(new mapboxgl.Popup().setHTML(popupContent));
    
    // Add click event to marker
    el.addEventListener('click', () => {
      handleItemSelect('trail', trail);
      console.log('Marker clicked, selected trail:', trail.name);
    });
    
    markers.current.push({
      marker,
      id: trail.id,
      type
    });
  };

  const handleItemSelect = (type: 'trail' | 'event' | 'session', item: Trail | Event | Session) => {
    setSelectedItem({ type, id: item.id, data: item });
    console.log(`Selected ${type} with id ${item.id}`);
    
    // If it's a trail and we have an onTrailSelect callback, call it
    if (type === 'trail' && onTrailSelect) {
      onTrailSelect(item.id);
    }
    
    // Fly to item location
    if (map.current) {
      let coords: [number, number];
      let trailId: string;
      
      switch (type) {
        case 'trail':
          coords = (item as Trail).coordinates;
          trailId = (item as Trail).id;
          break;
        case 'event':
          // For events, find the associated trail and zoom to it
          trailId = (item as Event).trailId;
          const eventTrail = trails.find(t => t.id === trailId);
          coords = eventTrail ? eventTrail.coordinates : getEventCoordinates(item as Event);
          break;
        case 'session':
          // For sessions, find the associated trail and zoom to it
          trailId = (item as Session).trailId;
          const sessionTrail = trails.find(t => t.id === trailId);
          coords = sessionTrail ? sessionTrail.coordinates : [0, 0];
          break;
        default:
          return;
      }
      
      // If we have an onTrailSelect callback, call it with the trail ID
      if (onTrailSelect && (type === 'event' || type === 'session')) {
        onTrailSelect(trailId);
      }
      
      console.log(`Flying to ${type} location:`, coords);
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
    console.log('Info panel closed');
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

  // Render a debug panel with detailed information about the map and markers
  const renderDebugInfo = () => {
    return (
      <div className="absolute bottom-12 left-4 bg-white p-2 rounded shadow text-xs z-10 max-w-xs max-h-48 overflow-auto">
        <div><strong>Zoom:</strong> {zoomLevel.toFixed(2)}</div>
        <div><strong>Center:</strong> [{mapCenter[0].toFixed(4)}, {mapCenter[1].toFixed(4)}]</div>
        <div><strong>Markers:</strong> {markers.current.length}</div>
        <div><strong>Map loaded:</strong> {mapLoaded ? 'Yes' : 'No'}</div>
        <div><strong>Active view:</strong> {activeView}</div>
        <div><strong>Selected region:</strong> {selectedRegion || 'None'}</div>
        <div><strong>Low zoom mode:</strong> {isLowZoom ? 'Yes' : 'No'}</div>
        <details className="mt-1">
          <summary className="cursor-pointer text-blue-600">Marker details</summary>
          <div className="pl-2 pt-1">
            {markers.current.map((m, i) => (
              <div key={i} className="mb-1 border-t pt-1">
                <div>#{i}: {m.id.substring(0, 8)}</div>
                <div>Type: {m.type}</div>
                <div>
                  Pos: [{m.marker.getLngLat().lng.toFixed(4)}, {m.marker.getLngLat().lat.toFixed(4)}]
                </div>
              </div>
            ))}
          </div>
        </details>
      </div>
    );
  };

  return (
    <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden">
      <div
        ref={mapContainerRef}
        className="w-full h-full"
      />
      
      {/* Debug info panel */}
      {renderDebugInfo()}
      
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
              <span className="text-xs font-medium capitalize">
                {selectedItem.type === 'trail' ? 'Spot' : 
                 selectedItem.type === 'event' ? 'Événement' : 'Session'}
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
              
              {/* Show event and session counts if they exist */}
              {(() => {
                const trailEvents = events.filter(event => event.trailId === selectedItem.id);
                const trailSessions = sessions.filter(session => session.trailId === selectedItem.id);
                
                if (trailEvents.length > 0 || trailSessions.length > 0) {
                  return (
                    <div className="flex gap-2 mt-2">
                      {trailEvents.length > 0 && (
                        <div className="flex items-center text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                          <Calendar size={12} className="mr-1" />
                          {trailEvents.length} événement{trailEvents.length > 1 ? 's' : ''}
                        </div>
                      )}
                      {trailSessions.length > 0 && (
                        <div className="flex items-center text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          <Users size={12} className="mr-1" />
                          {trailSessions.length} session{trailSessions.length > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              })()}
              
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
                    className="w-full bg-amber-500 text-white py-2 rounded mt-3 text-sm font-medium hover:bg-amber-600 transition-colors"
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
      
      {/* Debug display for zoom level - helpful for development */}
      <div className="absolute bottom-4 left-4 bg-white px-2 py-1 rounded shadow text-xs">
        Zoom: {zoomLevel}
      </div>
    </div>
  );
};

export default TrailMap;
