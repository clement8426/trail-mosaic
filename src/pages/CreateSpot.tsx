import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { v4 as uuidv4 } from "uuid";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Navbar from "@/components/Navbar";
import { Trail, BikeType, DifficultyLevel, TrailType, Obstacle } from "@/types";
import { MapPin } from "lucide-react";

// Set your Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoiY2xlbTg0MjYiLCJhIjoiY2x1bDUxcmNwMHE4ZzJrcGg3eWVnamR0NyJ9.0b5j0eigjauA52msWlo3WQ';

// Définition du schéma de validation avec Zod
const trailFormSchema = z.object({
  name: z.string().min(3, { message: "Le nom doit contenir au moins 3 caractères" }),
  location: z.string().min(3, { message: "La localisation est requise" }),
  description: z.string().min(10, { message: "La description doit contenir au moins 10 caractères" }),
  distance: z.coerce.number().positive({ message: "La distance doit être positive" }),
  elevation: z.coerce.number().nonnegative({ message: "L'élévation doit être positive ou nulle" }),
  difficulty: z.enum(["Débutant", "Intermédiaire", "Avancé", "Expert"] as const),
  trailType: z.enum(["Descente", "Terrain de bosses", "Bosses à tricks"] as const),
  recommendedBikes: z.array(z.enum(["BMX", "Semi-rigide", "Tout-suspendu"] as const)).nonempty({
    message: "Sélectionnez au moins un type de vélo recommandé",
  }),
  imageUrl: z.string().url({ message: "L'URL de l'image n'est pas valide" }),
  legalConsent: z.boolean().refine((val) => val === true, {
    message: "Vous devez accepter les conditions légales",
  }),
});

type TrailFormValues = z.infer<typeof trailFormSchema>;

const CreateSpot = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [mapCoordinates, setMapCoordinates] = useState<[number, number]>([2.349014, 48.864716]); // Paris par défaut
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [obstacleType, setObstacleType] = useState<Obstacle["type"]>("Bosse");
  const [obstacleDescription, setObstacleDescription] = useState("");
  const [address, setAddress] = useState("");
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);

  const form = useForm<TrailFormValues>({
    resolver: zodResolver(trailFormSchema),
    defaultValues: {
      name: "",
      location: "",
      description: "",
      distance: 0,
      elevation: 0,
      difficulty: "Intermédiaire",
      trailType: "Descente",
      recommendedBikes: [],
      imageUrl: "",
      legalConsent: false,
    },
  });

  // Initialize map when component mounts
  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: mapCoordinates,
      zoom: 12
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
    
    // Add geocoder (search) control
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      placeholder: 'Rechercher une adresse',
      language: 'fr',
      countries: 'fr',
      marker: false
    });

    map.current.addControl(geocoder, 'top-left');
    
    // Add marker at the initial location
    marker.current = new mapboxgl.Marker({ draggable: true, color: '#16a34a' })
      .setLngLat(mapCoordinates)
      .addTo(map.current);

    // Function to update form location and coordinates when marker is moved
    const updateLocationFromMarker = () => {
      if (!marker.current) return;
      
      const lngLat = marker.current.getLngLat();
      setMapCoordinates([lngLat.lng, lngLat.lat]);
      
      // Reverse geocode to get address
      fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lngLat.lng},${lngLat.lat}.json?access_token=${mapboxgl.accessToken}&language=fr`)
        .then(response => response.json())
        .then(data => {
          if (data.features && data.features.length > 0) {
            const locationName = data.features[0].place_name;
            form.setValue('location', locationName);
            setAddress(locationName);
          }
        })
        .catch(error => {
          console.error('Error during reverse geocoding:', error);
        });
    };

    // Update location when marker drag ends
    marker.current.on('dragend', updateLocationFromMarker);

    // Listen for clicks on the map to move the marker
    map.current.on('click', (e) => {
      if (!marker.current || !map.current) return;
      
      marker.current.setLngLat([e.lngLat.lng, e.lngLat.lat]);
      updateLocationFromMarker();
    });

    // Listen for selection in the geocoder
    geocoder.on('result', (e) => {
      if (!marker.current || !map.current) return;
      
      const coords = e.result.center;
      marker.current.setLngLat(coords);
      setMapCoordinates([coords[0], coords[1]]);
      
      const locationName = e.result.place_name;
      form.setValue('location', locationName);
      setAddress(locationName);
      
      map.current.flyTo({
        center: coords,
        zoom: 14,
        essential: true
      });
    });

    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
  if (!currentUser) {
    navigate("/login");
    return null;
  }

  // Gérer l'ajout d'un obstacle
  const handleAddObstacle = () => {
    if (obstacleDescription.trim() === "") {
      toast.error("La description de l'obstacle est requise");
      return;
    }
    
    setObstacles([
      ...obstacles,
      {
        type: obstacleType,
        description: obstacleDescription,
      },
    ]);
    
    setObstacleDescription("");
    toast.success("Obstacle ajouté");
  };

  // Gérer la suppression d'un obstacle
  const handleRemoveObstacle = (index: number) => {
    setObstacles(obstacles.filter((_, i) => i !== index));
  };

  // Géolocaliser l'utilisateur
  const getUserLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userCoords: [number, number] = [position.coords.longitude, position.coords.latitude];
        setMapCoordinates(userCoords);
        
        if (map.current && marker.current) {
          marker.current.setLngLat(userCoords);
          map.current.flyTo({
            center: userCoords,
            zoom: 14,
            essential: true
          });
          
          // Reverse geocode to get address
          fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${userCoords[0]},${userCoords[1]}.json?access_token=${mapboxgl.accessToken}&language=fr`)
            .then(response => response.json())
            .then(data => {
              if (data.features && data.features.length > 0) {
                const locationName = data.features[0].place_name;
                form.setValue('location', locationName);
                setAddress(locationName);
              }
            })
            .catch(error => {
              console.error('Error during reverse geocoding:', error);
            });
        }
        
        toast.success("Position actuelle utilisée");
      },
      () => toast.error("Impossible d'obtenir votre position"),
      { enableHighAccuracy: true }
    );
  };

  // Simuler l'ajout d'un spot (dans un projet réel, ce serait une requête à une API)
  const onSubmit = (data: TrailFormValues) => {
    // Créer un nouvel objet trail
    const newTrail: Trail = {
      id: uuidv4(), // Générer un ID unique
      name: data.name,
      location: data.location,
      coordinates: mapCoordinates,
      description: data.description,
      imageUrl: data.imageUrl,
      distance: data.distance,
      elevation: data.elevation,
      difficulty: data.difficulty as DifficultyLevel,
      trailType: data.trailType as TrailType,
      recommendedBikes: data.recommendedBikes as BikeType[],
      obstacles: obstacles,
      rating: 0,
      reviews: 0,
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
      contributors: [
        {
          username: currentUser.username,
          action: 'created',
          timestamp: new Date().toISOString()
        },
      ],
      region: "Déterminer automatiquement à partir des coordonnées", // Déterminer la région à partir des coordonnées
    };

    // Dans un projet réel, on enverrait cette donnée à une API
    console.log("Nouveau spot créé:", newTrail);

    toast.success("Spot créé avec succès!");
    navigate("/");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-forest-dark">Créer un nouveau spot</h1>
            <p className="text-gray-500">Partagez un nouveau spot avec la communauté</p>
          </div>
          
          <div className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Nom du spot */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom du spot</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: La Rocheuse" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Localisation */}
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Localisation</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input 
                            placeholder="Ex: Parc National des Cévennes" 
                            {...field} 
                            className="flex-1"
                            value={address || field.value}
                            onChange={(e) => {
                              field.onChange(e);
                              setAddress(e.target.value);
                            }}
                          />
                          <Button 
                            type="button" 
                            variant="outline"
                            className="flex gap-2"
                            onClick={getUserLocation}
                          >
                            <MapPin size={16} />
                            Ma position
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Carte Mapbox */}
                <div className="rounded-lg overflow-hidden bg-gray-100 h-64">
                  <div ref={mapContainer} className="w-full h-full" />
                </div>
                <div className="text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <MapPin size={14} className="text-forest" />
                    <span>Coordonnées: {mapCoordinates[0].toFixed(6)}, {mapCoordinates[1].toFixed(6)}</span>
                  </div>
                  <p className="mt-1">Cliquez sur la carte ou utilisez la barre de recherche pour choisir l'emplacement exact du spot.</p>
                </div>
                
                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Décrivez le spot, le terrain, les obstacles, etc."
                          className="min-h-[120px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Caractéristiques du spot */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Distance */}
                  <FormField
                    control={form.control}
                    name="distance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Distance (km)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Élévation */}
                  <FormField
                    control={form.control}
                    name="elevation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Élévation (m)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Difficulté */}
                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Niveau de difficulté</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          {...field}
                        >
                          <option value="Débutant">Débutant</option>
                          <option value="Intermédiaire">Intermédiaire</option>
                          <option value="Avancé">Avancé</option>
                          <option value="Expert">Expert</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Type de parcours */}
                <FormField
                  control={form.control}
                  name="trailType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type de parcours</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          {...field}
                        >
                          <option value="Descente">Descente</option>
                          <option value="Terrain de bosses">Terrain de bosses</option>
                          <option value="Bosses à tricks">Bosses à tricks</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Types de vélos recommandés */}
                <FormField
                  control={form.control}
                  name="recommendedBikes"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>Types de vélos recommandés</FormLabel>
                      </div>
                      <div className="flex flex-col space-y-3">
                        <FormField
                          control={form.control}
                          name="recommendedBikes"
                          render={({ field }) => {
                            return (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes("BMX")}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, "BMX"])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== "BMX"
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">BMX</FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                        <FormField
                          control={form.control}
                          name="recommendedBikes"
                          render={({ field }) => {
                            return (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes("Semi-rigide")}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, "Semi-rigide"])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== "Semi-rigide"
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">Semi-rigide</FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                        <FormField
                          control={form.control}
                          name="recommendedBikes"
                          render={({ field }) => {
                            return (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes("Tout-suspendu")}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, "Tout-suspendu"])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== "Tout-suspendu"
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">Tout-suspendu</FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Obstacles */}
                <div className="space-y-4">
                  <FormLabel>Obstacles</FormLabel>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select
                      className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={obstacleType}
                      onChange={(e) => setObstacleType(e.target.value as Obstacle["type"])}
                    >
                      <option value="Bosse">Bosse</option>
                      <option value="Virage serré">Virage serré</option>
                      <option value="Saut">Saut</option>
                      <option value="Gap">Gap</option>
                      <option value="Drop">Drop</option>
                      <option value="Northshore">Northshore</option>
                      <option value="Rock garden">Rock garden</option>
                    </select>
                    <Input
                      placeholder="Description de l'obstacle"
                      value={obstacleDescription}
                      onChange={(e) => setObstacleDescription(e.target.value)}
                    />
                    <Button type="button" onClick={handleAddObstacle}>Ajouter</Button>
                  </div>
                  {obstacles.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-sm mb-2">Obstacles ajoutés :</h4>
                      <ul className="space-y-2 max-h-40 overflow-y-auto">
                        {obstacles.map((obstacle, index) => (
                          <li key={index} className="flex justify-between bg-gray-50 p-2 rounded text-sm">
                            <span>
                              <strong>{obstacle.type}:</strong> {obstacle.description}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-auto p-1 text-red-500"
                              onClick={() => handleRemoveObstacle(index)}
                            >
                              Retirer
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                {/* Image URL */}
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL de l'image</FormLabel>
                      <FormControl>
                        <Input placeholder="https://exemple.com/image.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Consentement légal */}
                <FormField
                  control={form.control}
                  name="legalConsent"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          J'accepte que ce spot soit visible par tous les membres de la communauté et qu'il soit sous licence ouverte.
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                
                {/* Boutons de soumission */}
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => navigate("/")}>
                    Annuler
                  </Button>
                  <Button type="submit">Créer le spot</Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-900 text-white/70 py-6">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} Trail Mosaic. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
};

export default CreateSpot;
