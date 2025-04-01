
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { trails } from "@/data/trailsData";
import Navbar from "@/components/Navbar";
import { Bike, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trail } from "@/types";
import { cn } from "@/lib/utils";

import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarTrigger,
  SidebarInset
} from "@/components/ui/sidebar";

import TrailMap from "@/components/TrailMap";

const Map: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTrailId, setSelectedTrailId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    difficulty: "Tous" as "Débutant" | "Intermédiaire" | "Avancé" | "Expert" | "Tous",
    trailType: "Tous" as "Descente" | "Terrain de bosses" | "Bosses à tricks" | "Tous"
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Filtrer les trails basé sur la recherche et les filtres
  const filteredTrails = trails.filter((trail) => {
    // Filtre de recherche
    const matchesSearch = trail.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trail.location.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtre de difficulté
    const matchesDifficulty = filters.difficulty === "Tous" || trail.difficulty === filters.difficulty;
    
    // Filtre de type
    const matchesType = filters.trailType === "Tous" || trail.trailType === filters.trailType;
    
    return matchesSearch && matchesDifficulty && matchesType;
  });

  const handleTrailClick = (trailId: string) => {
    setSelectedTrailId(trailId);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <div className="flex items-center justify-between p-2">
              <h2 className="text-xl font-bold">Spots</h2>
              <SidebarTrigger />
            </div>
            <div className="px-2 pb-2">
              <div className="relative">
                <Input
                  placeholder="Rechercher un spot..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-8"
                />
              </div>
            </div>
            <div className="px-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full flex justify-between items-center"
                onClick={() => setShowFilters(!showFilters)}
              >
                <span className="flex items-center gap-2">
                  <Filter size={16} />
                  Filtres
                </span>
                {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </Button>
              {showFilters && (
                <div className="pt-2 space-y-2 text-sm">
                  <div>
                    <label className="block mb-1 font-medium">Difficulté</label>
                    <select 
                      className="w-full rounded-md border border-gray-300 p-1.5"
                      value={filters.difficulty}
                      onChange={(e) => setFilters({...filters, difficulty: e.target.value as any})}
                    >
                      <option value="Tous">Tous</option>
                      <option value="Débutant">Débutant</option>
                      <option value="Intermédiaire">Intermédiaire</option>
                      <option value="Avancé">Avancé</option>
                      <option value="Expert">Expert</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block mb-1 font-medium">Type</label>
                    <select 
                      className="w-full rounded-md border border-gray-300 p-1.5"
                      value={filters.trailType}
                      onChange={(e) => setFilters({...filters, trailType: e.target.value as any})}
                    >
                      <option value="Tous">Tous</option>
                      <option value="Descente">Descente</option>
                      <option value="Terrain de bosses">Terrain de bosses</option>
                      <option value="Bosses à tricks">Bosses à tricks</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Résultats ({filteredTrails.length})</SidebarGroupLabel>
              <SidebarGroupContent className="space-y-2">
                {filteredTrails.length === 0 ? (
                  <div className="text-center py-6 px-2 text-muted-foreground">
                    Aucun spot ne correspond à votre recherche
                  </div>
                ) : (
                  filteredTrails.map((trail) => (
                    <TrailCard 
                      key={trail.id} 
                      trail={trail} 
                      isSelected={selectedTrailId === trail.id}
                      onClick={() => handleTrailClick(trail.id)}
                      onViewDetails={() => navigate(`/spots/${trail.id}`)}
                    />
                  ))
                )}
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="relative">
          <Navbar />
          <div className="absolute inset-0 pt-16">
            <TrailMap selectedTrail={selectedTrailId} onTrailSelect={setSelectedTrailId} />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

interface TrailCardProps {
  trail: Trail;
  isSelected: boolean;
  onClick: () => void;
  onViewDetails: () => void;
}

const TrailCard: React.FC<TrailCardProps> = ({ trail, isSelected, onClick, onViewDetails }) => {
  return (
    <div 
      className={cn(
        "rounded-lg overflow-hidden border cursor-pointer transition-all",
        isSelected ? "border-forest shadow-md" : "border-gray-200 hover:border-gray-300"
      )}
      onClick={onClick}
    >
      <div className="h-24 relative overflow-hidden">
        <img 
          src={trail.imageUrl} 
          alt={trail.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
          <div className="p-2 text-white">
            <h3 className="font-bold text-sm truncate">{trail.name}</h3>
            <p className="text-xs opacity-80 truncate">{trail.location}</p>
          </div>
        </div>
      </div>
      
      <div className="p-2 bg-white">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1">
            <Bike size={14} />
            {trail.trailType}
          </span>
          <span className={cn(
            "px-2 py-0.5 rounded-full text-white",
            trail.difficulty === "Débutant" ? "bg-green-500" :
            trail.difficulty === "Intermédiaire" ? "bg-blue-500" :
            trail.difficulty === "Avancé" ? "bg-orange-500" : "bg-red-500"
          )}>
            {trail.difficulty}
          </span>
        </div>
        
        <div className="mt-2 flex justify-end">
          <Button 
            size="sm" 
            variant="secondary"
            className="text-xs h-7 px-2"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails();
            }}
          >
            Voir détails
          </Button>
        </div>
      </div>
    </div>
  );
};

const ChevronUp = ChevronLeft;
const ChevronDown = ChevronRight;

export default Map;
