
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { trails } from "@/data/trailsData";
import { events } from "@/data/eventsData";
import { sessions } from "@/data/sessionsData";
import { Trail, Event, Session, BikeType, TrailType, DifficultyLevel } from "@/types";
import TrailMap from "@/components/TrailMap";
import FilterBar from "@/components/FilterBar";
import { ChevronRight, ChevronLeft, Map as MapIcon, CalendarDays, Users, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import haversineDistance from "haversine-distance";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const Map: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState<"all" | "trails" | "events" | "sessions">("all");
  const [selectedTrailId, setSelectedTrailId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    difficulty: 'Tous' as DifficultyLevel | 'Tous',
    trailType: 'Tous' as TrailType | 'Tous',
    bikeType: 'Tous' as BikeType,
    distanceRange: [0, 10] as [number, number],
    location: undefined as [number, number] | undefined,
    locationName: undefined as string | undefined,
  });
  
  const [filteredTrails, setFilteredTrails] = useState<Trail[]>(trails);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>(events);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>(sessions);
  const { toast } = useToast();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.longitude, position.coords.latitude]);
          toast({
            title: "Localisation activée",
            description: "Nous utilisons votre position pour trouver les spots près de chez vous.",
          });
        },
        (error) => {
          console.error("Error getting geolocation:", error);
          toast({
            variant: "destructive",
            title: "Erreur de géolocalisation",
            description: "Impossible d'obtenir votre position. Veuillez l'activer dans votre navigateur.",
          });
        }
      );
    }
  }, [toast]);

  useEffect(() => {
    let trailResults = trails.filter(trail => {
      const matchesSearch = searchTerm === "" || 
        trail.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trail.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDifficulty = filters.difficulty === "Tous" || 
        trail.difficulty === filters.difficulty;
      
      const matchesType = filters.trailType === "Tous" || 
        trail.trailType === filters.trailType;
      
      const matchesBike = filters.bikeType === "Tous" || 
        trail.recommendedBikes.includes(filters.bikeType);
      
      const matchesRegion = !selectedRegion || trail.region === selectedRegion;
      
      return matchesSearch && matchesDifficulty && matchesType && matchesBike && matchesRegion;
    });

    if (filters.location) {
      trailResults = trailResults
        .map(trail => {
          const distance = haversineDistance(
            { lat: filters.location![1], lng: filters.location![0] },
            { lat: trail.coordinates[1], lng: trail.coordinates[0] }
          ) / 1000;
          
          return {
            ...trail,
            distance: parseFloat(distance.toFixed(1))
          };
        })
        .filter(trail => 
          trail.distance !== undefined && 
          trail.distance >= filters.distanceRange[0] && 
          trail.distance <= filters.distanceRange[1]
        )
        .sort((a, b) => a.distance - b.distance);
    }

    setFilteredTrails(trailResults);

    let eventResults = events.filter(event => {
      const matchesSearch = searchTerm === "" || 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRegion = !selectedRegion || event.region === selectedRegion;
      
      return matchesSearch && matchesRegion;
    });

    if (filters.location) {
      eventResults = eventResults
        .map(event => {
          const coords = getEventCoordinates(event);
          
          const distance = haversineDistance(
            { lat: filters.location![1], lng: filters.location![0] },
            { lat: coords[1], lng: coords[0] }
          ) / 1000;
          
          return {
            ...event,
            distance: parseFloat(distance.toFixed(1))
          };
        })
        .filter(event => 
          event.distance !== undefined && 
          event.distance >= filters.distanceRange[0] && 
          event.distance <= filters.distanceRange[1]
        )
        .sort((a, b) => a.distance - b.distance);
    }

    setFilteredEvents(eventResults);

    let sessionResults = sessions.filter(session => {
      const matchesSearch = searchTerm === "" || 
        session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const relatedTrail = trails.find(t => t.id === session.trailId);
      const matchesRegion = !selectedRegion || (relatedTrail && relatedTrail.region === selectedRegion);
      
      return matchesSearch && matchesRegion;
    });

    if (filters.location) {
      sessionResults = sessionResults
        .map(session => {
          const relatedTrail = trails.find(t => t.id === session.trailId);
          if (!relatedTrail) return session;
          
          const distance = haversineDistance(
            { lat: filters.location![1], lng: filters.location![0] },
            { lat: relatedTrail.coordinates[1], lng: relatedTrail.coordinates[0] }
          ) / 1000;
          
          return {
            ...session,
            distance: parseFloat(distance.toFixed(1))
          };
        })
        .filter(session => 
          'distance' in session && 
          session.distance !== undefined && 
          session.distance >= filters.distanceRange[0] && 
          session.distance <= filters.distanceRange[1]
        )
        .sort((a, b) => {
          if ('distance' in a && 'distance' in b) {
            return a.distance! - b.distance!;
          }
          return 0;
        });
    }

    setFilteredSessions(sessionResults);
  }, [searchTerm, filters, selectedRegion]);

  const getEventCoordinates = (event: Event): [number, number] => {
    if (event.coordinates) {
      return event.coordinates;
    }
    
    const mockCoords: {[key: string]: [number, number]} = {
      "Parc National des Cévennes": [3.6, 44.2],
      "Montpellier": [3.8767, 43.6108],
      "Lyon": [4.8357, 45.7640],
      "Chamonix": [6.8696, 45.9237]
    };
    
    return mockCoords[event.location] || [2.3522, 48.8566];
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const handleFilterChange = (newFilters: {
    difficulty: DifficultyLevel | 'Tous';
    trailType: TrailType | 'Tous';
    bikeType: BikeType;
    distanceRange: [number, number];
    location?: [number, number];
    locationName?: string;
  }) => {
    setFilters({
      ...filters,
      ...newFilters,
      location: newFilters.location || filters.location,
      locationName: newFilters.locationName || filters.locationName
    });
  };

  return (
    <div className="min-h-screen flex">
      <Navbar />
      
      <div className="flex flex-1 pt-16">
        <div 
          className={cn(
            "h-[calc(100vh-64px)] transition-all duration-300 overflow-hidden bg-white border-r",
            sidebarOpen ? "w-96" : "w-0"
          )}
        >
          <div className="p-4 h-full flex flex-col overflow-hidden">
            <Tabs 
              value={activeView !== "all" ? activeView : "trails"}
              onValueChange={(value) => setActiveView(value as "all" | "trails" | "events" | "sessions")}
              className="mb-4"
            >
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="trails">Spots</TabsTrigger>
                <TabsTrigger value="events">Événements</TabsTrigger>
                <TabsTrigger value="sessions">Sessions</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <FilterBar
              onSearch={setSearchTerm}
              onFilterChange={handleFilterChange}
              mode={activeView === "trails" || activeView === "all" ? "trails" : activeView === "events" ? "events" : "sessions"}
            />
            
            {selectedRegion && (
              <div className="mt-4 mb-2">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-lg">{selectedRegion}</h2>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedRegion(null)}
                  >
                    Voir toutes les régions
                  </Button>
                </div>
              </div>
            )}
            
            <div className="mt-4 flex-1 overflow-y-auto">
              {(activeView === "trails" || activeView === "all") && (
                <>
                  <h2 className="font-semibold mb-2">Spots ({filteredTrails.length})</h2>
                  <div className="space-y-2">
                    {filteredTrails.length === 0 ? (
                      <div className="text-center py-6 text-gray-500">
                        Aucun spot ne correspond à vos critères
                      </div>
                    ) : (
                      filteredTrails.map(trail => (
                        <div 
                          key={trail.id}
                          className={cn(
                            "border rounded-lg p-3 cursor-pointer transition-colors",
                            selectedTrailId === trail.id 
                              ? "border-forest bg-forest/5" 
                              : "hover:border-gray-300"
                          )}
                          onClick={() => setSelectedTrailId(trail.id)}
                        >
                          <div className="flex gap-3">
                            <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                              <img src={trail.imageUrl} alt={trail.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium">{trail.name}</h3>
                              <p className="text-sm text-gray-500">{trail.location}</p>
                              <div className="flex items-center gap-2 mt-1 text-xs">
                                <span className={cn(
                                  "px-1.5 py-0.5 rounded text-white",
                                  trail.difficulty === "Débutant" ? "bg-green-500" :
                                  trail.difficulty === "Intermédiaire" ? "bg-blue-500" :
                                  trail.difficulty === "Avancé" ? "bg-orange-500" : "bg-red-500"
                                )}>
                                  {trail.difficulty}
                                </span>
                                <span className="text-gray-500">{trail.trailType}</span>
                                {"distance" in trail && (
                                  <span className="ml-auto font-medium">{trail.distance} km</span>
                                )}
                              </div>
                              <div className="mt-2 text-right">
                                <Link to={`/spots/${trail.id}`}>
                                  <Button size="sm" variant="outline" className="text-forest border-forest hover:bg-forest/10">
                                    Voir le spot
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
              
              {(activeView === "events" || activeView === "all") && (
                <>
                  <h2 className="font-semibold mb-2">Événements ({filteredEvents.length})</h2>
                  <div className="space-y-2">
                    {filteredEvents.length === 0 ? (
                      <div className="text-center py-6 text-gray-500">
                        Aucun événement ne correspond à vos critères
                      </div>
                    ) : (
                      filteredEvents.map(event => (
                        <div 
                          key={event.id}
                          className="border rounded-lg p-3 transition-colors hover:border-gray-300"
                          onClick={() => {
                            // When clicking an event, select its trail
                            if (event.trailId) {
                              setSelectedTrailId(event.trailId);
                            }
                          }}
                        >
                          <div className="aspect-video mb-2 rounded-md overflow-hidden">
                            <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                          </div>
                          <h3 className="font-medium">{event.title}</h3>
                          <p className="text-sm text-gray-500">{formatDate(event.date)}</p>
                          <p className="text-sm text-gray-500">{event.location}</p>
                          <div className="flex justify-between items-center mt-2">
                            {"distance" in event && (
                              <span className="text-xs font-medium px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                                {event.distance} km
                              </span>
                            )}
                            {event.trailId && (
                              <Link to={`/spots/${event.trailId}`}>
                                <Button size="sm" variant="outline" className="text-amber-600 border-amber-600 hover:bg-amber-50">
                                  Voir le spot
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
              
              {(activeView === "sessions" || activeView === "all") && (
                <>
                  <h2 className="font-semibold mb-2">Sessions ({filteredSessions.length})</h2>
                  <div className="space-y-2">
                    {filteredSessions.length === 0 ? (
                      <div className="text-center py-6 text-gray-500">
                        Aucune session ne correspond à vos critères
                      </div>
                    ) : (
                      filteredSessions.map(session => {
                        const relatedTrail = trails.find(t => t.id === session.trailId);
                        
                        return (
                          <div 
                            key={session.id}
                            className="border rounded-lg p-3 transition-colors hover:border-gray-300"
                            onClick={() => {
                              // When clicking a session, select its trail
                              setSelectedTrailId(session.trailId);
                            }}
                          >
                            <h3 className="font-medium">{session.title}</h3>
                            <p className="text-sm text-gray-500">{formatDate(session.date)} à {session.time}</p>
                            {relatedTrail && (
                              <p className="text-xs text-blue-600">
                                {relatedTrail.name}, {relatedTrail.location}
                              </p>
                            )}
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-1">
                                <div className="flex -space-x-1">
                                  {session.participants.slice(0, 3).map((p, idx) => (
                                    <div 
                                      key={p.userId}
                                      className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium border-2 border-white"
                                    >
                                      {p.username.charAt(0)}
                                    </div>
                                  ))}
                                </div>
                                {session.participants.length > 3 && (
                                  <span className="text-xs text-gray-500">
                                    +{session.participants.length - 3}
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {'distance' in session && session.distance !== undefined && (
                                  <span className="text-xs font-medium px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                                    {session.distance} km
                                  </span>
                                )}
                                
                                <Link to={`/spots/${session.trailId}`}>
                                  <Button size="sm" variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                                    Voir le spot
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex-1 relative">
          <Button 
            variant="secondary"
            size="icon"
            className="absolute top-4 left-4 z-10 shadow-md"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <ChevronLeft /> : <ChevronRight />}
          </Button>
          
          <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-md flex">
            <Button
              variant={activeView === "all" ? "default" : "ghost"}
              className="flex items-center gap-2 rounded-l-lg rounded-r-none"
              onClick={() => setActiveView("all")}
            >
              <MapIcon size={18} />
              <span className="hidden sm:inline">Tout</span>
            </Button>
            <Button
              variant={activeView === "trails" ? "default" : "ghost"}
              className="flex items-center gap-2 rounded-none border-x"
              onClick={() => {
                setActiveView("trails");
                setSidebarOpen(true);
              }}
            >
              <MapPin size={18} />
              <span className="hidden sm:inline">Spots</span>
            </Button>
            <Button
              variant={activeView === "events" ? "default" : "ghost"}
              className="flex items-center gap-2 rounded-none border-r"
              onClick={() => {
                setActiveView("events");
                setSidebarOpen(true);
              }}
            >
              <CalendarDays size={18} />
              <span className="hidden sm:inline">Événements</span>
            </Button>
            <Button
              variant={activeView === "sessions" ? "default" : "ghost"}
              className="flex items-center gap-2 rounded-r-lg rounded-l-none"
              onClick={() => {
                setActiveView("sessions");
                setSidebarOpen(true);
              }}
            >
              <Users size={18} />
              <span className="hidden sm:inline">Sessions</span>
            </Button>
          </div>
          
          <div className="h-[calc(100vh-64px)]">
            <TrailMap 
              selectedTrail={selectedTrailId}
              onTrailSelect={setSelectedTrailId}
              displayTrails={activeView === "all" || activeView === "trails"}
              displayEvents={activeView === "all" || activeView === "events"}
              displaySessions={activeView === "all" || activeView === "sessions"}
              userLocation={userLocation}
              onRegionSelect={setSelectedRegion}
              selectedRegion={selectedRegion}
              activeView={activeView}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;
