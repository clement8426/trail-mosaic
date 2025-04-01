
import React from 'react';
import { Link } from 'react-router-dom';
import { Trail } from '../types';
import { MapPin, Mountain, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

interface TrailCardProps {
  trail: Trail;
}

const TrailCard: React.FC<TrailCardProps> = ({ trail }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Débutant': return 'bg-green-500';
      case 'Intermédiaire': return 'bg-blue-500';
      case 'Avancé': return 'bg-red-500';
      case 'Expert': return 'bg-black';
      default: return 'bg-gray-500';
    }
  };

  const getTrailTypeIcon = (type: string) => {
    switch (type) {
      case 'Descente': return <Mountain size={16} />;
      case 'Terrain de bosses': return <BarChart3 size={16} />;
      case 'Bosses à tricks': return <BarChart3 size={16} className="rotate-45" />;
      default: return null;
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="relative h-48 overflow-hidden">
        <img
          src={trail.imageUrl}
          alt={trail.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 left-2 flex gap-2">
          <Badge className={`${getDifficultyColor(trail.difficulty)} text-white`}>
            {trail.difficulty}
          </Badge>
          <Badge variant="outline" className="bg-white/80 backdrop-blur-sm">
            {trail.trailType}
          </Badge>
        </div>
      </div>

      <CardContent className="pt-4">
        <h3 className="text-lg font-bold text-forest-dark">{trail.name}</h3>
        <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
          <MapPin size={14} />
          <span>{trail.location}</span>
        </div>
        <p className="mt-2 text-sm line-clamp-2 text-gray-600">
          {trail.description}
        </p>
      </CardContent>

      <CardFooter className="pt-0 flex justify-between items-center">
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <span>{trail.distance} km</span>
          <span className="text-gray-300 mx-1">•</span>
          <span>↑ {trail.elevation}m</span>
        </div>
        <div className="flex items-center">
          <div className="flex items-center gap-1">
            <span className="text-amber-500">★</span>
            <span className="font-medium">{trail.rating}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TrailCard;
