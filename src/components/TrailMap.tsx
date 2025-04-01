
import React, { useEffect, useRef, useState } from 'react';
import { trails } from '../data/trailsData';
import { MapPin, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface TrailMapProps {
  selectedTrail?: string | null;
  onTrailSelect?: (trailId: string | null) => void;
}

const TrailMap: React.FC<TrailMapProps> = ({ selectedTrail, onTrailSelect }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  useEffect(() => {
    // Simulate map loading
    const loadingTimeout = setTimeout(() => {
      setMapLoaded(true);
    }, 500);
    
    // In a real implementation, this is where you would initialize your map
    console.log('Map would initialize here with a real mapping library');
    
    return () => clearTimeout(loadingTimeout);
  }, []);

  const handleSelectTrail = (trailId: string) => {
    if (onTrailSelect) {
      onTrailSelect(trailId);
    }
  };

  const selectedTrailData = selectedTrail ? trails.find(t => t.id === selectedTrail) : null;

  return (
    <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden">
      {!mapLoaded ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-forest"></div>
          <span className="ml-3 text-forest font-medium">Chargement de la carte...</span>
        </div>
      ) : null}
      
      <div
        ref={mapContainerRef}
        className={cn(
          "relative w-full h-full bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center",
          !mapLoaded && "opacity-0"
        )}
      >
        <div className="absolute inset-0 bg-black/10" />
        
        {/* Mock map pins */}
        {trails.map((trail) => (
          <div
            key={trail.id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all ${
              selectedTrail === trail.id ? 'scale-125 z-10' : ''
            }`}
            style={{
              left: `${(trail.coordinates[0] + 10) * 3}%`,
              top: `${(trail.coordinates[1] - 40) * -1}%`,
            }}
            onClick={() => handleSelectTrail(trail.id)}
          >
            <div className="relative group">
              <MapPin
                size={selectedTrail === trail.id ? 32 : 24}
                className={`${
                  selectedTrail === trail.id ? 'text-trail' : 'text-forest'
                } filter drop-shadow-md transition-all group-hover:text-trail`}
                fill={selectedTrail === trail.id ? '#FB9851' : 'white'}
                strokeWidth={selectedTrail === trail.id ? 3 : 2}
              />
              
              {/* Pulse animation for selected pin */}
              {selectedTrail === trail.id && (
                <span className="absolute inset-0 rounded-full animate-ping bg-trail/50" />
              )}
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 w-max opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-white p-2 rounded shadow-lg text-xs font-medium">
                  {trail.name}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Map overlay for trail info */}
        {selectedTrailData && (
          <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-72 bg-white rounded-lg shadow-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-forest-dark">{selectedTrailData.name}</h3>
                <p className="text-sm text-gray-500">{selectedTrailData.location}</p>
              </div>
              <Button 
                size="sm" 
                variant="ghost"
                className="h-7 w-7 p-0"
                onClick={() => onTrailSelect && onTrailSelect(null)}
              >
                <X size={16} />
              </Button>
            </div>
            
            <div className="flex justify-between mt-2 text-sm">
              <span>{selectedTrailData.distance} km</span>
              <span>{selectedTrailData.difficulty}</span>
              <span>{selectedTrailData.trailType}</span>
            </div>
            <Link to={`/spots/${selectedTrailData.id}`}>
              <Button 
                className="w-full bg-forest text-white py-2 rounded mt-3 text-sm font-medium hover:bg-forest-dark transition-colors"
              >
                Voir les détails
              </Button>
            </Link>
          </div>
        )}

        {/* Map controls placeholder */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2 flex flex-col gap-2">
          <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100">+</button>
          <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100">−</button>
        </div>
        
        <div className="absolute bottom-4 left-4 bg-white px-3 py-1 rounded-full text-xs shadow-lg">
          ⓘ La carte est une simulation. Dans un environnement réel, Mapbox ou Leaflet serait utilisé.
        </div>
      </div>
    </div>
  );
};

export default TrailMap;
