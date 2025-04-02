
import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { BikeType, TrailType, DifficultyLevel } from '@/types';
import { Badge } from '@/components/ui/badge';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import mapboxgl from 'mapbox-gl';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

// Set Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoiY2xlbTg0MjYiLCJhIjoiY2x1bDUxcmNwMHE4ZzJrcGg3eWVnamR0NyJ9.0b5j0eigjauA52msWlo3WQ';

interface FilterBarProps {
  onSearch: (term: string) => void;
  onFilterChange: (filters: {
    difficulty: DifficultyLevel | 'Tous';
    trailType: TrailType | 'Tous';
    bikeType: BikeType;
    distanceRange: [number, number];
    location?: [number, number];
    locationName?: string;
  }) => void;
  mode?: 'trails' | 'events' | 'sessions';
}

const FilterBar: React.FC<FilterBarProps> = ({ 
  onSearch, 
  onFilterChange, 
  mode = 'trails'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [geocoderContainer, setGeocoderContainer] = useState<HTMLDivElement | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  
  const [filters, setFilters] = useState({
    difficulty: 'Tous' as DifficultyLevel | 'Tous',
    trailType: 'Tous' as TrailType | 'Tous',
    bikeType: 'Tous' as BikeType,
    distanceRange: [0, 10] as [number, number],
    location: undefined as [number, number] | undefined,
    locationName: undefined as string | undefined,
  });
  
  // Initialize Mapbox geocoder
  useEffect(() => {
    if (!geocoderContainer) return;
    
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      types: 'place,locality,neighborhood',
      placeholder: 'Rechercher par lieu',
      language: 'fr',
      countries: 'fr'
    });
    
    geocoder.addTo(geocoderContainer);
    
    // Listen for results
    geocoder.on('result', (e) => {
      if (e.result && e.result.center) {
        const coords: [number, number] = [e.result.center[0], e.result.center[1]];
        const placeName = e.result.place_name;
        
        setFilters(prev => ({
          ...prev,
          location: coords,
          locationName: placeName
        }));
        
        setLocationName(placeName);
        
        onFilterChange({
          ...filters,
          location: coords,
          locationName: placeName
        });
      }
    });
    
    geocoder.on('clear', () => {
      setFilters(prev => ({
        ...prev,
        location: undefined,
        locationName: undefined
      }));
      
      setLocationName('');
      
      onFilterChange({
        ...filters,
        location: undefined,
        locationName: undefined
      });
    });
    
    return () => {
      geocoder.onRemove();
    };
  }, [geocoderContainer]);
  
  // Update filters when any filter changes
  useEffect(() => {
    onFilterChange(filters);
  }, [filters]);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };
  
  // Handle reset filters
  const handleResetFilters = () => {
    setFilters({
      difficulty: 'Tous',
      trailType: 'Tous',
      bikeType: 'Tous',
      distanceRange: [0, 10],
      location: undefined,
      locationName: undefined
    });
    
    setLocationName('');
  };
  
  return (
    <div className="space-y-3 bg-white p-3 rounded-lg shadow-sm">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder={`Rechercher ${mode === 'trails' ? 'un spot' : mode === 'events' ? 'un événement' : 'une session'}`}
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          className="h-10 w-10 flex-shrink-0"
        >
          <Filter size={18} />
        </Button>
      </div>

      {showFilters && (
        <div className="space-y-4 border-t pt-3 mt-2">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Lieu</label>
            <div 
              ref={setGeocoderContainer} 
              className="mapboxgl-geocoder-container"
            ></div>
            
            {locationName && (
              <div className="mt-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  {locationName}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-4 w-4 p-0 ml-1" 
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        location: undefined,
                        locationName: undefined
                      }));
                      setLocationName('');
                    }}
                  >
                    <ChevronUp size={14} />
                  </Button>
                </Badge>
              </div>
            )}
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1.5 block">Distance (km)</label>
            <div className="px-2">
              <Slider 
                value={filters.distanceRange}
                min={0} 
                max={50} 
                step={1}
                onValueChange={(value) => setFilters({...filters, distanceRange: [value[0], value[1]]})}
                className="mt-6"
              />
              <div className="flex justify-between mt-2 text-sm text-gray-500">
                <span>{filters.distanceRange[0]} km</span>
                <span>{filters.distanceRange[1]} km</span>
              </div>
            </div>
          </div>
          
          {mode === 'trails' && (
            <>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Difficulté</label>
                <Select 
                  value={filters.difficulty} 
                  onValueChange={(value) => setFilters({...filters, difficulty: value as DifficultyLevel | 'Tous'})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une difficulté" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tous">Tous</SelectItem>
                    <SelectItem value="Débutant">Débutant</SelectItem>
                    <SelectItem value="Intermédiaire">Intermédiaire</SelectItem>
                    <SelectItem value="Avancé">Avancé</SelectItem>
                    <SelectItem value="Expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1.5 block">Type de piste</label>
                <Select 
                  value={filters.trailType} 
                  onValueChange={(value) => setFilters({...filters, trailType: value as TrailType | 'Tous'})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tous">Tous</SelectItem>
                    <SelectItem value="Descente">Descente</SelectItem>
                    <SelectItem value="Terrain de bosses">Terrain de bosses</SelectItem>
                    <SelectItem value="Bosses à tricks">Bosses à tricks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1.5 block">Type de vélo</label>
                <Select 
                  value={filters.bikeType} 
                  onValueChange={(value) => setFilters({...filters, bikeType: value as BikeType})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un vélo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tous">Tous</SelectItem>
                    <SelectItem value="BMX">BMX</SelectItem>
                    <SelectItem value="Semi-rigide">Semi-rigide</SelectItem>
                    <SelectItem value="Tout-suspendu">Tout-suspendu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleResetFilters}
          >
            Réinitialiser les filtres
          </Button>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
