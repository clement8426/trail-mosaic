
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Calendar, MapPin, Navigation, Filter, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { events } from '@/data/eventsData';
import { Event } from '@/types';
import EventMap from '@/components/EventMap';
import haversineDistance from 'haversine-distance';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

const Events: React.FC = () => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const [filteredEvents, setFilteredEvents] = useState<(Event & { distance?: number })[]>(events);
  const [sortedEvents, setSortedEvents] = useState<(Event & { distance?: number })[]>(events);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const navigate = useNavigate();

  // Get unique categories and regions for filtering
  const categories = Array.from(new Set(events.map(event => event.category)));
  const regions = Array.from(new Set(events.map(event => event.region)));

  // Get user's location when component mounts
  useEffect(() => {
    getUserLocation();
  }, []);

  // Filter and sort events when filters or location changes
  useEffect(() => {
    let filtered = [...events];
    
    // Apply text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(event => selectedCategories.includes(event.category));
    }
    
    // Apply region filter
    if (selectedRegions.length > 0) {
      filtered = filtered.filter(event => selectedRegions.includes(event.region));
    }
    
    setFilteredEvents(filtered);
    
    // Sort by distance if location is available
    const referenceLocation = selectedLocation || userLocation;
    if (referenceLocation) {
      sortEventsByDistance(filtered, referenceLocation);
    } else {
      // Default sort by date if no location
      const sortedByDate = [...filtered].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      setSortedEvents(sortedByDate);
    }
  }, [searchQuery, selectedCategories, selectedRegions, userLocation, selectedLocation]);

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

  const sortEventsByDistance = (eventsToSort: Event[], referencePoint: [number, number]) => {
    // Make a copy of events and add distance
    const eventsWithDistance = eventsToSort.map(event => {
      // Calculate distance using Haversine formula
      const distance = haversineDistance(
        { lat: referencePoint[1], lng: referencePoint[0] },
        { lat: event.coordinates[1], lng: event.coordinates[0] }
      ) / 1000; // Convert to kilometers
      
      return {
        ...event,
        distance: parseFloat(distance.toFixed(1))
      };
    });
    
    // Sort by distance
    eventsWithDistance.sort((a, b) => {
      if (a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance;
      }
      return 0;
    });
    
    setSortedEvents(eventsWithDistance);
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

  const toggleCategoryFilter = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleRegionFilter = (region: string) => {
    setSelectedRegions(prev => 
      prev.includes(region)
        ? prev.filter(r => r !== region)
        : [...prev, region]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedRegions([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container pt-20 pb-10 max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-forest-dark">Événements</h1>
            <p className="text-gray-600 mt-1">
              Découvrez les événements VTT près de chez vous
            </p>
          </div>
          
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
              <Badge variant="outline" className="bg-green-50">
                Position obtenue
              </Badge>
            )}
          </div>
        </div>
        
        {/* Search and filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <Input
            placeholder="Rechercher un événement..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          
          <div className="flex gap-2">
            {/* Category filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter size={16} />
                  Catégories
                  <ChevronDown size={14} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-3">
                <div className="space-y-2">
                  <h3 className="font-medium text-sm">Catégories d'événements</h3>
                  <div className="flex flex-col gap-2">
                    {categories.map((category) => (
                      <div key={category} className="flex items-center gap-2">
                        <Checkbox
                          id={`category-${category}`}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => toggleCategoryFilter(category)}
                        />
                        <label
                          htmlFor={`category-${category}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            {/* Region filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <MapPin size={16} />
                  Régions
                  <ChevronDown size={14} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-3">
                <div className="space-y-2">
                  <h3 className="font-medium text-sm">Régions</h3>
                  <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                    {regions.map((region) => (
                      <div key={region} className="flex items-center gap-2">
                        <Checkbox
                          id={`region-${region}`}
                          checked={selectedRegions.includes(region)}
                          onCheckedChange={() => toggleRegionFilter(region)}
                        />
                        <label
                          htmlFor={`region-${region}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {region}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            {/* Clear filters button */}
            {(selectedCategories.length > 0 || selectedRegions.length > 0 || searchQuery) && (
              <Button variant="ghost" onClick={clearAllFilters} size="sm">
                Effacer les filtres
              </Button>
            )}
          </div>
        </div>
        
        {/* Active filters display */}
        {(selectedCategories.length > 0 || selectedRegions.length > 0) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedCategories.map(category => (
              <Badge key={`badge-${category}`} variant="secondary" className="flex items-center gap-1">
                {category}
                <button 
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5" 
                  onClick={() => toggleCategoryFilter(category)}
                >
                  <ChevronDown size={14} />
                </button>
              </Badge>
            ))}
            
            {selectedRegions.map(region => (
              <Badge key={`badge-${region}`} variant="outline" className="flex items-center gap-1">
                {region}
                <button 
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5" 
                  onClick={() => toggleRegionFilter(region)}
                >
                  <ChevronDown size={14} />
                </button>
              </Badge>
            ))}
          </div>
        )}
        
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
            {errorMsg}
          </div>
        )}
        
        <div className="mt-6 space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3 space-y-4">
              <div className="bg-white shadow-md rounded-lg p-4">
                <h2 className="text-lg font-semibold text-forest-dark mb-4">
                  Événements ({sortedEvents.length})
                </h2>
                
                {sortedEvents.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <p className="text-gray-500">Aucun événement ne correspond à vos critères.</p>
                    <Button 
                      variant="link" 
                      onClick={clearAllFilters}
                      className="mt-2"
                    >
                      Effacer les filtres
                    </Button>
                  </div>
                ) : (
                  <div className="max-h-[calc(100vh-280px)] overflow-y-auto space-y-4 pr-2">
                    {sortedEvents.map((event) => (
                      <div 
                        key={event.id}
                        className="border border-gray-200 rounded-lg p-3 hover:border-forest transition-colors cursor-pointer"
                        onClick={() => event.trailId ? navigate(`/spots/${event.trailId}`) : null}
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
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {event.category}
                          </Badge>
                          {event.distance !== undefined && (
                            <span className="bg-trail/10 text-trail px-2 py-1 rounded-full text-xs font-medium">
                              {event.distance} km
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="w-full md:w-2/3 h-[calc(100vh-200px)] bg-white shadow-md rounded-lg overflow-hidden">
              <EventMap 
                events={filteredEvents}
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
