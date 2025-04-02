
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Calendar, MapPin, Search, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { events } from '@/data/eventsData';
import { Event } from '@/types';
import { cn } from '@/lib/utils';
import EventMap from '@/components/EventMap';
import haversineDistance from 'haversine-distance';

const Events: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const [sortedEvents, setSortedEvents] = useState<(Event & { distance?: number })[]>(events);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  // Get user's location when component mounts
  useEffect(() => {
    getUserLocation();
  }, []);

  // Sort events whenever user location or selected location changes
  useEffect(() => {
    const referenceLocation = selectedLocation || userLocation;
    if (referenceLocation) {
      sortEventsByDistance(referenceLocation);
    }
  }, [userLocation, selectedLocation]);

  const getUserLocation = () => {
    setIsLoading(true);
    setErrorMsg(null);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoords: [number, number] = [position.coords.longitude, position.coords.latitude];
          setUserLocation(userCoords);
          setIsLoading(false);
        },
        (error) => {
          console.error("Erreur de géolocalisation:", error);
          setErrorMsg("Impossible d'obtenir votre position. Veuillez entrer une localisation manuellement.");
          setIsLoading(false);
        }
      );
    } else {
      setErrorMsg("La géolocalisation n'est pas supportée par votre navigateur.");
      setIsLoading(false);
    }
  };

  const sortEventsByDistance = (referencePoint: [number, number]) => {
    // Make a copy of events and add distance
    const eventsWithDistance = events.map(event => {
      // For this example, we're using mock coordinates
      // In a real app, these would come from the events data
      const eventCoords = getEventCoordinates(event);
      
      // Calculate distance using Haversine formula
      const distance = haversineDistance(
        { lat: referencePoint[1], lng: referencePoint[0] },
        { lat: eventCoords[1], lng: eventCoords[0] }
      ) / 1000; // Convert to kilometers
      
      return {
        ...event,
        distance: parseFloat(distance.toFixed(1))
      };
    });
    
    // Sort by distance
    eventsWithDistance.sort((a, b) => {
      if (a.distance && b.distance) {
        return a.distance - b.distance;
      }
      return 0;
    });
    
    setSortedEvents(eventsWithDistance);
  };

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
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const handleLocationSelected = (coords: [number, number]) => {
    setSelectedLocation(coords);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container pt-20 pb-10 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-forest-dark">Événements</h1>
        <p className="text-gray-600 mt-2">
          Découvrez les événements VTT près de chez vous
        </p>
        
        <div className="mt-6 space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/3 bg-white shadow-md rounded-lg p-4">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-forest-dark mb-2">
                  Votre position
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={getUserLocation}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    <Navigation size={16} />
                    {isLoading ? "Localisation..." : "Me localiser"}
                  </Button>
                  {userLocation && (
                    <span className="text-sm text-gray-500">
                      Position obtenue
                    </span>
                  )}
                </div>
                {errorMsg && (
                  <p className="text-sm text-red-500 mt-2">{errorMsg}</p>
                )}
              </div>
              
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-forest-dark">Événements ({sortedEvents.length})</h2>
                <div className="max-h-[calc(100vh-300px)] overflow-y-auto space-y-4 pr-2">
                  {sortedEvents.map((event) => (
                    <div 
                      key={event.id}
                      className="border border-gray-200 rounded-lg p-3 hover:border-forest transition-colors cursor-pointer"
                      onClick={() => navigate(`/spots/${event.trailId}`)}
                    >
                      <div className="aspect-video mb-2 overflow-hidden rounded-md">
                        <img 
                          src={event.imageUrl} 
                          alt={event.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="font-semibold text-forest-dark">{event.title}</h3>
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <Calendar size={14} />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <MapPin size={14} />
                        <span>{event.location}</span>
                      </div>
                      {event.distance !== undefined && (
                        <div className="mt-2 text-right">
                          <span className="bg-trail/10 text-trail px-2 py-1 rounded-full text-xs font-medium">
                            {event.distance} km
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-2/3 h-[calc(100vh-200px)] bg-white shadow-md rounded-lg overflow-hidden">
              <EventMap 
                events={events}
                userLocation={userLocation}
                onLocationSelected={handleLocationSelected}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Events;
