
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BikeType, DifficultyLevel, TrailType } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { regionsData } from '@/data/regionsData';

// Set your Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoiY2xlbTg0MjYiLCJhIjoiY2x1bDUxcmNwMHE4ZzJrcGg3eWVnamR0NyJ9.0b5j0eigjauA52msWlo3WQ';

// Define the form schema
const formSchema = z.object({
  name: z.string().min(3, { message: "Le nom doit contenir au moins 3 caractères" }),
  description: z.string().min(20, { message: "La description doit contenir au moins 20 caractères" }),
  location: z.string().min(1, { message: "La localisation est requise" }),
  region: z.string().min(1, { message: "La région est requise" }),
  difficulty: z.enum(["Débutant", "Intermédiaire", "Avancé", "Expert"] as const),
  trailType: z.enum(["Descente", "Enduro", "Cross-country", "Pumptrack", "Dirt"] as const),
  distance: z.coerce.number().min(0.1, { message: "La distance doit être supérieure à 0" }),
  elevation: z.coerce.number().min(0, { message: "Le dénivelé doit être positif" }),
  recommendedBikes: z.array(z.enum(["Enduro", "VTT", "Gravel", "DH", "Dirt"] as const)).min(1, { message: "Sélectionnez au moins un type de vélo" }),
  imageUrls: z.array(z.string()).min(1, { message: "Ajouter au moins une image" }),
  coordinates: z.tuple([z.number(), z.number()]),
});

type FormValues = z.infer<typeof formSchema>;

const CreateSpot: React.FC = () => {
  const [images, setImages] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Create form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      location: "",
      region: "",
      difficulty: "Intermédiaire",
      trailType: "Enduro",
      distance: 1,
      elevation: 0,
      recommendedBikes: [],
      imageUrls: [],
      coordinates: [0, 0],
    }
  });

  // Initialize the map
  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [2.3522, 46.8566], // Default to center of France
      zoom: 5,
      projection: { name: 'mercator' } // Using a Mercator projection (flat world map)
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
    
    // Add geocoder (search) control
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      placeholder: 'Rechercher un lieu',
      language: 'fr',
      countries: 'fr'
    });

    map.current.addControl(geocoder, 'top-left');
    
    // Listen for selection in the geocoder
    geocoder.on('result', (e) => {
      if (e.result.center) {
        const coords: [number, number] = [e.result.center[0], e.result.center[1]];
        setSelectedLocation(coords);
        form.setValue('coordinates', coords);
        form.setValue('location', e.result.place_name || e.result.text);
        
        // Try to extract and set region
        const france_admin = e.result.context?.find((ctx: any) => ctx.id.startsWith('region'));
        if (france_admin) {
          const regionName = france_admin.text;
          const matchedRegion = regionsData.find(r => r.name === regionName);
          if (matchedRegion) {
            form.setValue('region', matchedRegion.name);
          }
        }
        
        // Update or add marker
        if (marker.current) {
          marker.current.setLngLat(coords);
        } else {
          marker.current = new mapboxgl.Marker({ color: '#3b82f6', draggable: true })
            .setLngLat(coords)
            .addTo(map.current!);
          
          // Update coordinates when marker is dragged
          marker.current.on('dragend', () => {
            const lngLat = marker.current!.getLngLat();
            const newCoords: [number, number] = [lngLat.lng, lngLat.lat];
            setSelectedLocation(newCoords);
            form.setValue('coordinates', newCoords);
          });
        }
      }
    });

    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [form]);

  // Handler for form submission
  const onSubmit = (data: FormValues) => {
    console.log("Form submitted:", data);
    
    // In a real app, you would send this data to your API
    toast({
      title: "Spot créé avec succès!",
      description: "Votre nouveau spot a été ajouté.",
    });
    
    setTimeout(() => {
      navigate('/spots');
    }, 1500);
  };

  // Mock image upload handler - in a real app this would upload to a storage service
  const handleImageUpload = () => {
    setImageUploading(true);
    
    // Simulate image upload delay
    setTimeout(() => {
      const imageUrl = `https://source.unsplash.com/random/800x600?mtb&sig=${Date.now()}`;
      setImages([...images, imageUrl]);
      form.setValue('imageUrls', [...images, imageUrl]);
      setImageUploading(false);
      
      toast({
        title: "Image ajoutée",
        description: "L'image a été téléchargée avec succès.",
      });
    }, 1500);
  };

  // Handler for removing images
  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    form.setValue('imageUrls', newImages);
  };

  // Define bike options with proper type
  const bikeOptions: {value: BikeType, label: string}[] = [
    { value: "Enduro", label: "Enduro" },
    { value: "VTT", label: "VTT" },
    { value: "Gravel", label: "Gravel" },
    { value: "DH", label: "DH" },
    { value: "Dirt", label: "Dirt" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto pt-20 pb-10 px-4">
        <h1 className="text-3xl font-bold text-forest mb-6">Créer un nouveau spot</h1>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Basic Information */}
              <div className="space-y-6">
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold mb-4">Informations générales</h2>
                    
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="mb-4">
                          <FormLabel>Nom du spot</FormLabel>
                          <FormControl>
                            <Input placeholder="Nom du spot" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="mb-4">
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Décrivez le spot, le terrain, les points d'intérêt..." 
                              className="min-h-32" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="distance"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Distance (km)</FormLabel>
                            <FormControl>
                              <Input type="number" min="0.1" step="0.1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="elevation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dénivelé (m)</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold mb-4">Emplacement</h2>
                    
                    <div className="h-64 bg-gray-100 rounded-lg mb-4" ref={mapContainer} />
                    
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem className="mb-4">
                          <FormLabel>Adresse</FormLabel>
                          <FormControl>
                            <Input placeholder="L'adresse sera définie en sélectionnant un point sur la carte" readOnly {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="region"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Région</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez une région" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {regionsData.map((region) => (
                                <SelectItem key={region.id} value={region.name}>
                                  {region.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>
              
              {/* Right Column - Trail Characteristics and Images */}
              <div className="space-y-6">
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold mb-4">Caractéristiques</h2>
                    
                    <FormField
                      control={form.control}
                      name="difficulty"
                      render={({ field }) => (
                        <FormItem className="mb-4">
                          <FormLabel>Difficulté</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-wrap gap-4"
                            >
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="Débutant" />
                                </FormControl>
                                <FormLabel className="font-normal text-green-600">Débutant</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="Intermédiaire" />
                                </FormControl>
                                <FormLabel className="font-normal text-blue-600">Intermédiaire</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="Avancé" />
                                </FormControl>
                                <FormLabel className="font-normal text-orange-600">Avancé</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="Expert" />
                                </FormControl>
                                <FormLabel className="font-normal text-red-600">Expert</FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="trailType"
                      render={({ field }) => (
                        <FormItem className="mb-4">
                          <FormLabel>Type de sentier</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Descente">Descente</SelectItem>
                              <SelectItem value="Enduro">Enduro</SelectItem>
                              <SelectItem value="Cross-country">Cross-country</SelectItem>
                              <SelectItem value="Pumptrack">Pumptrack</SelectItem>
                              <SelectItem value="Dirt">Dirt</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="recommendedBikes"
                      render={() => (
                        <FormItem>
                          <div className="mb-2">
                            <FormLabel>Vélos recommandés</FormLabel>
                          </div>
                          <div className="flex flex-wrap gap-4">
                            {bikeOptions.map((option) => (
                              <FormField
                                key={option.value}
                                control={form.control}
                                name="recommendedBikes"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={option.value}
                                      className="flex items-center space-x-2 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(option.value)}
                                          onCheckedChange={(checked) => {
                                            const currentValues = field.value || [];
                                            if (checked) {
                                              field.onChange([...currentValues, option.value]);
                                            } else {
                                              field.onChange(
                                                currentValues.filter(
                                                  (value) => value !== option.value
                                                )
                                              );
                                            }
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        {option.label}
                                      </FormLabel>
                                    </FormItem>
                                  );
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold mb-4">Images</h2>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      {images.map((img, index) => (
                        <div key={index} className="relative aspect-video rounded-md overflow-hidden group">
                          <img src={img} alt={`Spot ${index}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="imageUrls"
                      render={({ field }) => (
                        <FormItem>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={handleImageUpload}
                            disabled={imageUploading}
                            className="w-full"
                          >
                            {imageUploading ? "Téléchargement..." : "Ajouter une image"}
                          </Button>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => navigate('/spots')}>
                Annuler
              </Button>
              <Button type="submit" className="bg-forest hover:bg-forest-dark">
                Créer le spot
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateSpot;
