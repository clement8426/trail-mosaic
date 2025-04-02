
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { User, Calendar, MapPin, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Session, Trail } from '@/types';
import { trails } from '@/data/trailsData';
import FilterBar from '@/components/FilterBar';
import { Link } from 'react-router-dom';

// Mock sessions data
const mockSessions: Session[] = [
  {
    id: "session1",
    title: "Sortie groupe intermédiaire",
    description: "Session de groupe pour riders intermédiaires sur le spot des Cévennes. Parfait pour améliorer sa technique en descente.",
    date: "2023-07-15",
    time: "14:00",
    createdBy: "user1",
    participants: [
      { userId: "user1", username: "Alex", status: "going" },
      { userId: "user2", username: "Marine", status: "going" },
      { userId: "user3", username: "Thomas", status: "interested" },
      { userId: "user4", username: "Julie", status: "interested" },
    ],
    trailId: "trail1"
  },
  {
    id: "session2",
    title: "Entraînement technique",
    description: "Focus sur les sauts et les virages relevés. Session parfaite pour progresser sur les modules techniques.",
    date: "2023-07-20",
    time: "10:00",
    createdBy: "user3",
    participants: [
      { userId: "user3", username: "Thomas", status: "going" },
      { userId: "user4", username: "Julie", status: "interested" },
    ],
    trailId: "trail2"
  },
  {
    id: "session3",
    title: "Ride nocturne",
    description: "Session de nuit sur les pistes de Lyon. N'oubliez pas vos lampes!",
    date: "2023-08-05",
    time: "21:30",
    createdBy: "user2",
    participants: [
      { userId: "user2", username: "Marine", status: "going" },
      { userId: "user5", username: "Lucas", status: "going" },
    ],
    trailId: "trail3"
  }
];

const Sessions: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "mine">("upcoming");
  const [filteredSessions, setFilteredSessions] = useState<Session[]>(mockSessions);
  const [searchTerm, setSearchTerm] = useState("");
  
  useEffect(() => {
    // Filter sessions based on search term and active tab
    const today = new Date();
    
    const filtered = mockSessions.filter(session => {
      // Search filter
      const matchesSearch = searchTerm === "" ||
        session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Tab filter
      const sessionDate = new Date(session.date);
      
      if (activeTab === "upcoming") {
        return matchesSearch && sessionDate >= today;
      } else if (activeTab === "past") {
        return matchesSearch && sessionDate < today;
      } else {
        // "mine" tab - in a real app, we'd filter by current user ID
        return matchesSearch && session.createdBy === "user1"; // Mock current user
      }
    });
    
    setFilteredSessions(filtered);
  }, [searchTerm, activeTab]);
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };
  
  const getTrailById = (trailId: string): Trail | undefined => {
    return trails.find(trail => trail.id === trailId);
  };

  const handleFilterChange = (filters: any) => {
    // In a real app, we'd apply these filters to the sessions list
    console.log("Applying filters:", filters);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container pt-20 pb-10 max-w-6xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-forest-dark">Sessions</h1>
            <p className="text-gray-600 mt-1">
              Retrouvez toutes les sessions programmées par la communauté
            </p>
          </div>
          
          <Button className="bg-forest hover:bg-forest-dark">
            Créer une session
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="upcoming">À venir</TabsTrigger>
                  <TabsTrigger value="past">Passées</TabsTrigger>
                  <TabsTrigger value="mine">Mes sessions</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <FilterBar 
              onSearch={setSearchTerm}
              onFilterChange={handleFilterChange}
              mode="sessions"
            />
          </div>
          
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm divide-y">
              {filteredSessions.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500 mb-4">Aucune session ne correspond à vos critères</p>
                  <Button>Créer une nouvelle session</Button>
                </div>
              ) : (
                filteredSessions.map(session => {
                  const trail = getTrailById(session.trailId);
                  return (
                    <div key={session.id} className="p-6">
                      <div className="flex justify-between">
                        <h3 className="text-xl font-bold">{session.title}</h3>
                        <Button variant="ghost" size="sm">
                          Rejoindre
                        </Button>
                      </div>
                      
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar size={16} />
                          <span>{formatDate(session.date)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock size={16} />
                          <span>{session.time}</span>
                        </div>
                        
                        {trail && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin size={16} />
                            <Link to={`/spots/${trail.id}`} className="text-blue-600 hover:underline">
                              {trail.name}, {trail.location}
                            </Link>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-gray-600">
                          <User size={16} />
                          <span>Organisé par {mockSessions.find(s => s.id === session.id)?.participants.find(p => p.userId === session.createdBy)?.username}</span>
                        </div>
                      </div>
                      
                      <p className="mt-3 text-gray-700">{session.description}</p>
                      
                      <div className="mt-4 flex items-center gap-3">
                        <Users size={16} className="text-gray-500" />
                        <div className="flex -space-x-2">
                          {session.participants.map((p, idx) => (
                            <div 
                              key={p.userId}
                              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium border-2 border-white"
                            >
                              {p.username.charAt(0)}
                            </div>
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">
                          {session.participants.filter(p => p.status === "going").length} participant{session.participants.filter(p => p.status === "going").length > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sessions;
