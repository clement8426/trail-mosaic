
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { CheckIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { regions } from '@/data/regionsData';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

// Set your Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoiY2xlbTg0MjYiLCJhIjoiY2x1bDUxcmNwMHE4ZzJrcGg3eWVnamR0NyJ9.0b5j0eigjauA52msWlo3WQ';

interface FormData {
  name: string;
  description: string;
  location: string;
  region: string;
  difficulty: string;
  distance: number;
  elevation: number;
  trailType: string;
  features: string[];
  mapPosition: [number, number];
  images: string[];
}

const CreateSpot: React.FC = () => {
  const navigate = useNavigate();
  const mapContainer = React.useRef<HTMLDivElement>(null);
  const map = React.useRef<mapboxgl.Map | null>(null);
  const [mapMarker, setMapMarker] = useState<mapboxgl.Marker | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    location: '',
    region: '',
    difficulty: 'Modéré',
    distance: 5,
    elevation: 200,
    trailType: 'Montagne',
    features: [],
    mapPosition: [2.3522, 48.8566], // Default to Paris
    images: []
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  
  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: formData.mapPosition,
      zoom: 12,
      projection: {name: 'mercator'} as mapboxgl.Projection,
      renderWorldCopies: false // Prevent multiple world copies which can cause marker issues
    });
    
    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
    
    // Add geocoder for location search
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      placeholder: 'Rechercher un lieu',
      language: 'fr',
      countries: 'fr'
    });
    
    map.current.addControl(geocoder, 'top-left');
    
    // Add a marker at the initial position
    addMapMarker(formData.mapPosition);
    
    // Listen for clicks on the map to update position
    map.current.on('click', (e) => {
      const coords: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      updateMapPosition(coords);
    });
    
    // Listen for geocoder result to update position
    geocoder.on('result', (e) => {
      if (e.result && e.result.center) {
        const coords: [number, number] = [e.result.center[0], e.result.center[1]];
        updateMapPosition(coords);
        
        // Try to extract location and region information
        if (e.result.place_name) {
          const locationParts = e.result.place_name.split(',');
          if (locationParts.length > 0) {
            setFormData(prev => ({ ...prev, location: locationParts[0].trim() }));
          }
        }
      }
    });
    
    return () => {
      map.current?.remove();
    };
  }, []);
  
  const addMapMarker = (coords: [number, number]) => {
    if (!map.current) return;
    
    // Remove existing marker if there is one
    if (mapMarker) {
      mapMarker.remove();
    }
    
    // Create marker element
    const el = document.createElement('div');
    el.className = 'spot-marker';
    el.style.width = '30px';
    el.style.height = '30px';
    el.style.borderRadius = '50%';
    el.style.backgroundColor = '#16a34a';
    el.style.border = '3px solid white';
    el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
    
    // Create and add the new marker
    const newMarker = new mapboxgl.Marker({ 
      element: el,
      anchor: 'center', // Ensures the marker is centered on its coordinates
      offset: [0, 0], // Explicit offset to ensure consistency
      pitchAlignment: 'map', // Keep markers aligned with the map projection
      rotationAlignment: 'map', // Keep markers aligned with the map rotation
      draggable: true // Allow the marker to be dragged
    })
      .setLngLat(coords)
      .addTo(map.current);
    
    // Update coordinates when marker is dragged
    newMarker.on('dragend', () => {
      const lngLat = newMarker.getLngLat();
      const newCoords: [number, number] = [lngLat.lng, lngLat.lat];
      setFormData(prev => ({ ...prev, mapPosition: newCoords }));
    });
    
    setMapMarker(newMarker);
  };
  
  const updateMapPosition = (coords: [number, number]) => {
    setFormData(prev => ({ ...prev, mapPosition: coords }));
    addMapMarker(coords);
    
    if (map.current) {
      map.current.flyTo({
        center: coords,
        zoom: 12,
        essential: true
      });
    }
  };
  
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Nom requis';
    if (!formData.description.trim()) newErrors.description = 'Description requise';
    if (!formData.location.trim()) newErrors.location = 'Localisation requise';
    if (!formData.region) newErrors.region = 'Région requise';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Normally would submit to backend
      console.log('Form data submitted:', formData);
      
      toast({
        title: 'Spot créé avec succès!',
        description: 'Votre spot a été ajouté et sera examiné par nos modérateurs.',
      });
      
      // Redirect to spots page
      navigate('/spots');
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field if it exists
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field if it exists
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  const toggleFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };
  
  const handleSliderChange = (name: string, value: number[]) => {
    setFormData(prev => ({ ...prev, [name]: value[0] }));
  };
  
  const difficulty = ['Facile', 'Modéré', 'Difficile', 'Très difficile', 'Extrême'];
  const trailTypes = ['Montagne', 'Forêt', 'Sentier', 'Single-track', 'Parc', 'Urbain'];
  const features = [
    'Drops', 'Jumps', 'Berms', 'Rock Gardens', 'Wooden Features',
    'North Shore', 'Ladder Bridges', 'Pump Track', 'Table Tops', 'Gap Jumps'
  ];
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container pt-20 pb-16 max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-forest-dark mb-6">Ajouter un spot</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Form fields column */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du spot</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Les Sentiers du Mont Ventoux"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Décrivez le spot, ses caractéristiques, etc."
                    className={`min-h-24 ${errors.description ? 'border-red-500' : ''}`}
                  />
                  {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Localisation</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g. Bédoin, Mont Ventoux"
                    className={errors.location ? 'border-red-500' : ''}
                  />
                  {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="region">Région</Label>
                  <Select
                    value={formData.region}
                    onValueChange={(value) => handleSelectChange('region', value)}
                  >
                    <SelectTrigger className={errors.region ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Sélectionnez une région" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem key={region.name} value={region.name}>
                          {region.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.region && <p className="text-red-500 text-sm">{errors.region}</p>}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulté</Label>
                    <Select
                      value={formData.difficulty}
                      onValueChange={(value) => handleSelectChange('difficulty', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {difficulty.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="trailType">Type de sentier</Label>
                    <Select
                      value={formData.trailType}
                      onValueChange={(value) => handleSelectChange('trailType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {trailTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="distance">Distance (km): {formData.distance}</Label>
                    <Slider
                      id="distance"
                      min={1}
                      max={50}
                      step={1}
                      value={[formData.distance]}
                      onValueChange={(value) => handleSliderChange('distance', value)}
                      className="my-2"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="elevation">Dénivelé (m): {formData.elevation}</Label>
                    <Slider
                      id="elevation"
                      min={0}
                      max={2000}
                      step={50}
                      value={[formData.elevation]}
                      onValueChange={(value) => handleSliderChange('elevation', value)}
                      className="my-2"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Caractéristiques</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {features.map((feature) => (
                      <div key={feature} className="flex items-center space-x-2">
                        <Checkbox
                          id={`feature-${feature}`}
                          checked={formData.features.includes(feature)}
                          onCheckedChange={() => toggleFeature(feature)}
                        />
                        <label
                          htmlFor={`feature-${feature}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {feature}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button type="submit" className="w-full bg-forest hover:bg-forest-dark">
                    <CheckIcon className="mr-2 h-4 w-4" /> Créer le spot
                  </Button>
                </div>
              </div>
              
              {/* Map column */}
              <div className="space-y-4">
                <div>
                  <Label>Position sur la carte</Label>
                  <p className="text-sm text-gray-500 mb-2">
                    Cliquez sur la carte pour placer le marqueur à l'emplacement exact du spot.
                  </p>
                  
                  <div ref={mapContainer} className="h-[400px] rounded-lg border border-gray-300" />
                  
                  <div className="mt-2 text-sm text-gray-500">
                    Coordonnées: {formData.mapPosition[0].toFixed(4)}, {formData.mapPosition[1].toFixed(4)}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Images (optionnel)</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      id="image-upload"
                    />
                    <label 
                      htmlFor="image-upload" 
                      className="cursor-pointer flex flex-col items-center justify-center"
                    >
                      <div className="w-12 h-12 rounded-full bg-forest-light/20 flex items-center justify-center mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-forest"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"></path><path d="m18 2 4 4-10 10H8v-4L18 2z"></path></svg>
                      </div>
                      <span className="text-sm font-medium text-forest">
                        Déposer des photos ou cliquer pour les ajouter
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        JPG, PNG ou GIF - Max 5MB par image
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateSpot;
