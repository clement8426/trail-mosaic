import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { CheckIcon, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { BikeType, DifficultyLevel, TrailType } from '@/types';
import { regions } from '@/data/regionsData';

// Set your Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoiY2xlbTg0MjYiLCJhIjoiY2x1bDUxcmNwMHE4ZzJrcGg3eWVnamR0NyJ9.0b5j0eigjauA52msWlo3WQ';

const CreateSpot: React.FC = () => {
  const navigate = useNavigate();
  const mapContainer = React.useRef<HTMLDivElement | null>(null);
  const map = React.useRef<mapboxgl.Map | null>(null);
  const geocoder = React.useRef<any | null>(null);
  const marker = React.useRef<mapboxgl.Marker | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    region: '',
    location: '',
    coordinates: [2.3522, 48.8566] as [number, number], // Default to Paris
    description: '',
    distance: 0,
    duration: 0,
    elevation: 0,
    difficulty: 'Débutant' as DifficultyLevel,
    trailType: 'Single-track' as TrailType,
    photos: [] as string[],
    recommendedBikes: [] as BikeType[],
    tags: [] as string[],
    gpxFile: null as File | null,
    mapPosition: [2.3522, 48.8566] as [number, number],
  });
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentTag, setCurrentTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  useEffect(() => {
    if (!mapContainer.current) return;
    
    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: formData.mapPosition,
      zoom: 12,
      projection: {name: 'mercator'} as mapboxgl.Projection
    });
    
    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Add geocoder
    geocoder.current = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      marker: false,
      placeholder: 'Rechercher un lieu',
    });
    
    map.current.addControl(geocoder.current);
    
    // Add marker
    marker.current = new mapboxgl.Marker({
      draggable: true,
      color: '#16a34a'
    })
      .setLngLat(formData.mapPosition)
      .addTo(map.current);
    
    // Listen for marker drag end
    marker.current.on('dragend', () => {
      if (marker.current) {
        const lngLat = marker.current.getLngLat();
        updateCoordinates([lngLat.lng, lngLat.lat]);
      }
    });
    
    // Listen for geocoder result
    geocoder.current.on('result', (e: any) => {
      if (marker.current && e.result && e.result.center) {
        // Get the coordinates from the geocoder result
        const [lng, lat] = e.result.center;
        
        // Update the marker position
        marker.current.setLngLat([lng, lat]);
        
        // Update the form data
        updateCoordinates([lng, lat]);
        
        // Extract region from the result if available
        if (e.result.context) {
          const regionFeature = e.result.context.find((ctx: any) => 
            ctx.id.startsWith('region')
          );
          
          if (regionFeature) {
            setFormData(prev => ({
              ...prev,
              region: regionFeature.text
            }));
          }
        }
        
        // Update location name
        setFormData(prev => ({
          ...prev,
          location: e.result.place_name
        }));
      }
    });
    
    // Listen for map load
    map.current.on('load', () => {
      setMapLoaded(true);
    });
    
    // Cleanup
    return () => {
      if (map.current) map.current.remove();
    };
  }, []);
  
  const updateCoordinates = (coords: [number, number]) => {
    setFormData(prev => ({
      ...prev,
      coordinates: coords,
      mapPosition: coords
    }));
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };
  
  const handleBikeTypeChange = (checked: boolean, bikeType: BikeType) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        recommendedBikes: [...prev.recommendedBikes, bikeType]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        recommendedBikes: prev.recommendedBikes.filter(type => type !== bikeType)
      }));
    }
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // In a real app, you would upload to a storage service and get a URL
    // For now, we'll just use a local URL
    const imageUrl = URL.createObjectURL(file);
    setImagePreview(imageUrl);
    
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, imageUrl]
    }));
    
    // Reset the input
    e.target.value = '';
  };
  
  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };
  
  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };
  
  const handleGpxUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFormData(prev => ({
      ...prev,
      gpxFile: file
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // In a real app, you would send the data to your backend
      console.log('Submitting spot data:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Spot créé avec succès!');
      navigate('/spots');
    } catch (error) {
      console.error('Error creating spot:', error);
      toast.error('Erreur lors de la création du spot');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto pt-20 pb-10 px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-forest-dark mb-6">Créer un nouveau spot</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nom du spot</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    placeholder="Nom du spot" 
                    required 
                  />
                </div>
                
                <div>
                  <Label htmlFor="region">Région</Label>
                  <Select 
                    value={formData.region} 
                    onValueChange={(value) => handleSelectChange('region', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une région" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map(region => (
                        <SelectItem key={region.id} value={region.name}>
                          {region.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="location">Localisation</Label>
                  <Input 
                    id="location" 
                    name="location" 
                    value={formData.location} 
                    onChange={handleInputChange} 
                    placeholder="Adresse ou lieu" 
                    required 
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    value={formData.description} 
                    onChange={handleInputChange} 
                    placeholder="Description du spot" 
                    rows={4} 
                    required 
                  />
                </div>
              </div>
              
              <div>
                <Label>Position sur la carte</Label>
                <div 
                  ref={mapContainer} 
                  className="w-full h-64 bg-gray-100 rounded-md mb-4"
                />
                <div className="text-sm text-gray-500">
                  Déplacez le marqueur pour définir la position exacte du spot
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Coordonnées: {formData.coordinates[0].toFixed(4)}, {formData.coordinates[1].toFixed(4)}
                </div>
              </div>
            </div>
            
            {/* Trail Details */}
            <div>
              <h2 className="text-lg font-semibold text-forest-dark mb-3">Détails du parcours</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="distance">Distance (km)</Label>
                  <Input 
                    id="distance" 
                    name="distance" 
                    type="number" 
                    min="0" 
                    step="0.1" 
                    value={formData.distance} 
                    onChange={handleNumberChange} 
                    required 
                  />
                </div>
                
                <div>
                  <Label htmlFor="duration">Durée (min)</Label>
                  <Input 
                    id="duration" 
                    name="duration" 
                    type="number" 
                    min="0" 
                    value={formData.duration} 
                    onChange={handleNumberChange} 
                    required 
                  />
                </div>
                
                <div>
                  <Label htmlFor="elevation">Dénivelé (m)</Label>
                  <Input 
                    id="elevation" 
                    name="elevation" 
                    type="number" 
                    min="0" 
                    value={formData.elevation} 
                    onChange={handleNumberChange} 
                    required 
                  />
                </div>
              </div>
            </div>
            
            {/* Classification */}
            <div>
              <h2 className="text-lg font-semibold text-forest-dark mb-3">Classification</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="difficulty">Difficulté</Label>
                  <Select 
                    value={formData.difficulty} 
                    onValueChange={(value) => handleSelectChange('difficulty', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner la difficulté" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Débutant">Débutant</SelectItem>
                      <SelectItem value="Intermédiaire">Intermédiaire</SelectItem>
                      <SelectItem value="Avancé">Avancé</SelectItem>
                      <SelectItem value="Expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="trailType">Type de sentier</Label>
                  <Select 
                    value={formData.trailType} 
                    onValueChange={(value) => handleSelectChange('trailType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Single-track">Single-track</SelectItem>
                      <SelectItem value="Double-track">Double-track</SelectItem>
                      <SelectItem value="Fire-road">Fire-road</SelectItem>
                      <SelectItem value="Park">Bike Park</SelectItem>
                      <SelectItem value="Urbain">Urbain</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {/* Recommended Bikes */}
            <div>
              <h2 className="text-lg font-semibold text-forest-dark mb-3">Vélos recommandés</h2>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="VTT"
                    checked={formData.recommendedBikes.includes('VTT' as BikeType)}
                    onCheckedChange={(checked) => handleBikeTypeChange(checked as boolean, 'VTT' as BikeType)}
                  />
                  <Label htmlFor="VTT">VTT</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="Gravel"
                    checked={formData.recommendedBikes.includes('Gravel' as BikeType)}
                    onCheckedChange={(checked) => handleBikeTypeChange(checked as boolean, 'Gravel' as BikeType)}
                  />
                  <Label htmlFor="Gravel">Gravel</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="Dirt"
                    checked={formData.recommendedBikes.includes('Dirt' as BikeType)}
                    onCheckedChange={(checked) => handleBikeTypeChange(checked as boolean, 'Dirt' as BikeType)}
                  />
                  <Label htmlFor="Dirt">Dirt</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="Enduro"
                    checked={formData.recommendedBikes.includes('Enduro')}
                    onCheckedChange={(checked) => handleBikeTypeChange(checked as boolean, 'Enduro')}
                  />
                  <Label htmlFor="Enduro">Enduro</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="DH"
                    checked={formData.recommendedBikes.includes('DH')}
                    onCheckedChange={(checked) => handleBikeTypeChange(checked as boolean, 'DH')}
                  />
                  <Label htmlFor="DH">DH (Descente)</Label>
                </div>
              </div>
            </div>
            
            {/* Photos */}
            <div>
              <h2 className="text-lg font-semibold text-forest-dark mb-3">Photos</h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="photos">Ajouter des photos</Label>
                  <Input 
                    id="photos" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                  />
                </div>
                
                {formData.photos.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.photos.map((photo, index) => (
                      <div key={index} className="relative w-24 h-24">
                        <img 
                          src={photo} 
                          alt={`Spot ${index + 1}`} 
                          className="w-full h-full object-cover rounded-md" 
                        />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            photos: prev.photos.filter((_, i) => i !== index)
                          }))}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Tags */}
            <div>
              <h2 className="text-lg font-semibold text-forest-dark mb-3">Tags</h2>
              <div className="flex flex-wrap gap-2 items-center">
                <Input 
                  placeholder="Ajouter un tag" 
                  value={currentTag} 
                  onChange={(e) => setCurrentTag(e.target.value)} 
                  className="w-auto flex-grow max-w-xs"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleAddTag}
                >
                  Ajouter
                </Button>
                
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 w-full">
                    {formData.tags.map(tag => (
                      <div 
                        key={tag} 
                        className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-gray-500 hover:text-red-500"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* GPX File */}
            <div>
              <h2 className="text-lg font-semibold text-forest-dark mb-3">Fichier GPX (Optionnel)</h2>
              <div>
                <Label htmlFor="gpxFile">Télécharger un fichier GPX</Label>
                <Input 
                  id="gpxFile" 
                  type="file" 
                  accept=".gpx" 
                  onChange={handleGpxUpload} 
                />
                {formData.gpxFile && (
                  <div className="mt-2 text-sm text-green-600 flex items-center gap-1">
                    <CheckIcon size={16} />
                    Fichier GPX ajouté: {formData.gpxFile.name}
                  </div>
                )}
              </div>
            </div>
            
            {/* Submit */}
            <div className="flex justify-end gap-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                className="bg-forest text-white hover:bg-forest-dark"
                disabled={loading}
              >
                {loading ? 'Création en cours...' : 'Créer le spot'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateSpot;
