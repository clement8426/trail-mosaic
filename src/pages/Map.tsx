
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { trails } from "@/data/trailsData";
import { events } from "@/data/eventsData";
import { Trail, Event, Session, BikeType, TrailType, DifficultyLevel } from "@/types";
import TrailMap from "@/components/TrailMap";
import FilterBar from "@/components/FilterBar";
import { ChevronRight, ChevronLeft, Map as MapIcon, CalendarDays, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import haversineDistance from "haversine-distance";

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

const Map: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"map" | "trails" | "events" | "sessions">("map");
  const [selectedTrailId, setSelectedTrailId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
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
  const [filteredSessions, setFilteredSessions] = useState<Session[]>(mockSessions);

  // Get user location when component mounts
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.longitude, position.coords.latitude]);
        },
        (error) => {
          console.error("Error getting geolocation:", error);
        }
      );
    }
  }, []);

  // Apply filters to the data
  useEffect(() => {
    // Filter trails
    let trailResults = trails.filter(trail => {
      // Search term filter
      const matchesSearch = searchTerm === "" || 
        trail.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trail.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Difficulty filter
      const matchesDifficulty = filters.difficulty === "Tous" || 
        trail.difficulty === filters.difficulty;
      
      // Trail type filter
      const matchesType = filters.trailType === "Tous" || 
        trail.trailType === filters.trailType;
      
      // Bike type filter
      const matchesBike = filters.bikeType === "Tous" || 
        trail.recommendedBikes.includes(filters.bikeType);
      
      return matchesSearch && matchesDifficulty && matchesType && matchesBike;
    });

    // Apply distance filter if location is set
    if (filters.location) {
      trailResults = trailResults
        .map(trail => {
          const distance = haversineDistance(
            { lat: filters.location![1], lng: filters.location![0] },
            { lat: trail.coordinates[1], lng: trail.coordinates[0] }
          ) / 1000; // Convert to kilometers
          
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
        .sort((a, b) => {
          if (a.distance !== undefined && b.distance !== undefined) {
            return a.distance - b.distance;
          }
          return 0;
        });
    }

    setFilteredTrails(trailResults);

    // Filter events
    let eventResults = events.filter(event => {
      const matchesSearch = searchTerm === "" || 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });

    // Apply distance filter if location is set
    if (filters.location) {
      eventResults = eventResults
        .map(event => {
          // Get event coordinates
          const coords = getEventCoordinates(event);
          
          const distance = haversineDistance(
            { lat: filters.location![1], lng: filters.location![0] },
            { lat: coords[1], lng: coords[0] }
          ) / 1000; // Convert to kilometers
          
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
        .sort((a, b) => {
          if (a.distance !== undefined && b.distance !== undefined) {
            return a.distance - b.distance;
          }
          return 0;
        });
    }

    setFilteredEvents(eventResults);

    // Filter sessions
    let sessionResults = mockSessions.filter(session => {
      const matchesSearch = searchTerm === "" || 
        session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });

    // Apply distance filter if location is set
    if (filters.location) {
      sessionResults = sessionResults
        .map(session => {
          // Find related trail to get coordinates
          const relatedTrail = trails.find(t => t.id === session.trailId);
          if (!relatedTrail) return session;
          
          const distance = haversineDistance(
            { lat: filters.location![1], lng: filters.location![0] },
            { lat: relatedTrail.coordinates[1], lng: relatedTrail.coordinates[0] }
          ) / 1000; // Convert to kilometers
          
          return {
            ...session,
            distance: parseFloat(distance.toFixed(1))
          };
        })
        .filter(session => 
          session.distance !== undefined && 
          session.distance >= filters.distanceRange[0] && 
          session.distance <= filters.distanceRange[1]
        )
        .sort((a, b) => {
          if (a.distance !== undefined && b.distance !== undefined) {
            return a.distance - b.distance;
          }
          return 0;
        });
    }

    setFilteredSessions(sessionResults);
  }, [searchTerm, filters]);

  // Helper to get event coordinates
  const getEventCoordinates = (event: Event): [number, number] => {
    // Mock function to return coordinates for an event
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
    <div className="min-h-screen flex">
      <Navbar />
      
      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <div 
          className={cn(
            "h-[calc(100vh-64px)] transition-all duration-300 overflow-hidden bg-white border-r",
            sidebarOpen ? "w-96" : "w-0"
          )}
        >
          <div className="p-4 h-full flex flex-col overflow-hidden">
            {/* Tabs */}
            <Tabs 
              value={activeTab !== "map" ? activeTab : "trails"}
              onValueChange={(value) => setActiveTab(value as "trails" | "events" | "sessions")}
              className="mb-4"
            >
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="trails">Spots</TabsTrigger>
                <TabsTrigger value="events">Événements</TabsTrigger>
                <TabsTrigger value="sessions">Sessions</TabsTrigger>
              </TabsList>
            </Tabs>
            
            {/* Filters */}
            <FilterBar
              onSearch={setSearchTerm}
              onFilterChange={setFilters}
              mode={activeTab === "trails" ? "trails" : activeTab === "events" ? "events" : "sessions"}
            />
            
            {/* Results */}
            <div className="mt-4 flex-1 overflow-y-auto">
              {activeTab === "trails" && (
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
                            <div>
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
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
              
              {activeTab === "events" && (
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
                          className="border rounded-lg p-3 cursor-pointer hover:border-gray-300 transition-colors"
                        >
                          <div className="aspect-video mb-2 rounded-md overflow-hidden">
                            <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                          </div>
                          <h3 className="font-medium">{event.title}</h3>
                          <p className="text-sm text-gray-500">{formatDate(event.date)}</p>
                          <p className="text-sm text-gray-500">{event.location}</p>
                          {"distance" in event && (
                            <div className="text-right mt-1">
                              <span className="text-xs font-medium px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                                {event.distance} km
                              </span>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
              
              {activeTab === "sessions" && (
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
                            className="border rounded-lg p-3 cursor-pointer hover:border-gray-300 transition-colors"
                          >
                            <h3 className="font-medium">{session.title}</h3>
                            <p className="text-sm text-gray-500">{formatDate(session.date)} à {session.time}</p>
                            {relatedTrail && (
                              <p className="text-xs text-blue-600">
                                {relatedTrail.name}, {relatedTrail.location}
                              </p>
                            )}
                            <div className="flex items-center gap-1 mt-2">
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
                              {"distance" in session && (
                                <div className="ml-auto">
                                  <span className="text-xs font-medium px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                                    {session.distance} km
                                  </span>
                                </div>
                              )}
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
        
        {/* Map Container */}
        <div className="flex-1 relative">
          {/* Sidebar toggle button */}
          <Button 
            variant="secondary"
            size="icon"
            className="absolute top-4 left-4 z-10 shadow-md"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <ChevronLeft /> : <ChevronRight />}
          </Button>
          
          {/* View type buttons */}
          <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-md flex">
            <Button
              variant={activeTab === "map" ? "default" : "ghost"}
              className="flex items-center gap-2 rounded-l-lg rounded-r-none"
              onClick={() => setActiveTab("map")}
            >
              <MapIcon size={18} />
              <span className="hidden sm:inline">Carte</span>
            </Button>
            <Button
              variant={activeTab === "trails" && activeTab !== "map" ? "default" : "ghost"}
              className="flex items-center gap-2 rounded-none border-x"
              onClick={() => {
                setActiveTab("trails");
                setSidebarOpen(true);
              }}
            >
              <MapIcon size={18} />
              <span className="hidden sm:inline">Spots</span>
            </Button>
            <Button
              variant={activeTab === "events" ? "default" : "ghost"}
              className="flex items-center gap-2 rounded-none border-r"
              onClick={() => {
                setActiveTab("events");
                setSidebarOpen(true);
              }}
            >
              <CalendarDays size={18} />
              <span className="hidden sm:inline">Événements</span>
            </Button>
            <Button
              variant={activeTab === "sessions" ? "default" : "ghost"}
              className="flex items-center gap-2 rounded-r-lg rounded-l-none"
              onClick={() => {
                setActiveTab("sessions");
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
              displayTrails={activeTab === "map" || activeTab === "trails"}
              displayEvents={activeTab === "map" || activeTab === "events"}
              displaySessions={activeTab === "map" || activeTab === "sessions"}
              userLocation={userLocation}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;
