
import React from 'react';
import { BikeType, TrailType, DifficultyLevel } from '../types';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Bike, Mountain, BarChart3 } from 'lucide-react';

interface TrailFiltersProps {
  selectedBikeType: BikeType;
  setSelectedBikeType: (type: BikeType) => void;
  selectedTrailType: TrailType | 'Tous';
  setSelectedTrailType: (type: TrailType | 'Tous') => void;
  selectedDifficulty: DifficultyLevel | 'Tous';
  setSelectedDifficulty: (level: DifficultyLevel | 'Tous') => void;
  distanceRange: [number, number];
  setDistanceRange: (range: [number, number]) => void;
}

const TrailFilters: React.FC<TrailFiltersProps> = ({
  selectedBikeType,
  setSelectedBikeType,
  selectedTrailType,
  setSelectedTrailType,
  selectedDifficulty,
  setSelectedDifficulty,
  distanceRange,
  setDistanceRange,
}) => {
  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow">
      <div>
        <h3 className="font-medium mb-3 flex items-center gap-2">
          <Bike size={18} className="text-forest" />
          Type de vélo
        </h3>
        <Tabs 
          defaultValue={selectedBikeType} 
          className="w-full"
          onValueChange={(value) => setSelectedBikeType(value as BikeType)}
        >
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="Tous">Tous</TabsTrigger>
            <TabsTrigger value="BMX">BMX</TabsTrigger>
            <TabsTrigger value="Semi-rigide">Semi-rigide</TabsTrigger>
            <TabsTrigger value="Tout-suspendu">Tout suspendu</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div>
        <h3 className="font-medium mb-3 flex items-center gap-2">
          <Mountain size={18} className="text-forest" />
          Type de piste
        </h3>
        <div className="flex flex-wrap gap-2">
          <TypeBadge 
            label="Tous"
            isSelected={selectedTrailType === 'Tous'}
            onClick={() => setSelectedTrailType('Tous')}
          />
          <TypeBadge 
            label="Descente"
            icon={<Mountain size={14} />}
            isSelected={selectedTrailType === 'Descente'}
            onClick={() => setSelectedTrailType('Descente')}
          />
          <TypeBadge 
            label="Terrain de bosses"
            icon={<BarChart3 size={14} />}
            isSelected={selectedTrailType === 'Terrain de bosses'}
            onClick={() => setSelectedTrailType('Terrain de bosses')}
          />
          <TypeBadge 
            label="Bosses à tricks"
            icon={<BarChart3 size={14} className="rotate-45" />}
            isSelected={selectedTrailType === 'Bosses à tricks'}
            onClick={() => setSelectedTrailType('Bosses à tricks')}
          />
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-3">Difficulté</h3>
        <div className="flex flex-wrap gap-2">
          <DifficultyBadge 
            label="Tous"
            isSelected={selectedDifficulty === 'Tous'}
            onClick={() => setSelectedDifficulty('Tous')}
          />
          <DifficultyBadge 
            label="Débutant"
            color="green"
            isSelected={selectedDifficulty === 'Débutant'}
            onClick={() => setSelectedDifficulty('Débutant')}
          />
          <DifficultyBadge 
            label="Intermédiaire"
            color="blue"
            isSelected={selectedDifficulty === 'Intermédiaire'}
            onClick={() => setSelectedDifficulty('Intermédiaire')}
          />
          <DifficultyBadge 
            label="Avancé"
            color="red"
            isSelected={selectedDifficulty === 'Avancé'}
            onClick={() => setSelectedDifficulty('Avancé')}
          />
          <DifficultyBadge 
            label="Expert"
            color="black"
            isSelected={selectedDifficulty === 'Expert'}
            onClick={() => setSelectedDifficulty('Expert')}
          />
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-3">Distance (km)</h3>
        <div className="px-2">
          <Slider 
            defaultValue={[0, 10]}
            min={0} 
            max={10} 
            step={0.5}
            value={[distanceRange[0], distanceRange[1]]}
            onValueChange={(value) => setDistanceRange([value[0], value[1]])}
            className="mt-6"
          />
          <div className="flex justify-between mt-2 text-sm text-gray-500">
            <span>{distanceRange[0]} km</span>
            <span>{distanceRange[1]} km</span>
          </div>
        </div>
      </div>

      <Button 
        variant="outline" 
        className="w-full border-forest text-forest hover:bg-forest hover:text-white"
      >
        Réinitialiser les filtres
      </Button>
    </div>
  );
};

interface TypeBadgeProps {
  label: string;
  icon?: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
}

const TypeBadge: React.FC<TypeBadgeProps> = ({ label, icon, isSelected, onClick }) => {
  return (
    <Badge
      variant={isSelected ? "default" : "outline"}
      className={`cursor-pointer ${isSelected ? 'bg-forest hover:bg-forest-dark' : 'hover:bg-gray-100'}`}
      onClick={onClick}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {label}
    </Badge>
  );
};

interface DifficultyBadgeProps {
  label: string;
  color?: string;
  isSelected: boolean;
  onClick: () => void;
}

const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({ 
  label, 
  color = 'gray', 
  isSelected, 
  onClick 
}) => {
  const getColorClass = () => {
    if (!isSelected) return 'border-gray-300 hover:bg-gray-100';
    
    switch (color) {
      case 'green': return 'bg-green-500 hover:bg-green-600 border-green-500';
      case 'blue': return 'bg-blue-500 hover:bg-blue-600 border-blue-500';
      case 'red': return 'bg-red-500 hover:bg-red-600 border-red-500';
      case 'black': return 'bg-black hover:bg-gray-900 border-black';
      default: return 'bg-gray-500 hover:bg-gray-600 border-gray-500';
    }
  };

  return (
    <Badge
      variant={isSelected ? "default" : "outline"}
      className={`cursor-pointer ${getColorClass()} ${isSelected ? 'text-white' : ''}`}
      onClick={onClick}
    >
      {label}
    </Badge>
  );
};

export default TrailFilters;
