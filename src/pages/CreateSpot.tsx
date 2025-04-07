
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { BikeType, DifficultyLevel, TrailType } from '@/types';
import { MapPinIcon, UploadIcon } from 'lucide-react';
import Navbar from '@/components/Navbar';

// Define the form schema
const formSchema = z.object({
  name: z.string().min(3, 'Le nom doit contenir au moins 3 caractères.'),
  location: z.string().min(3, 'L\'emplacement doit contenir au moins 3 caractères.'),
  region: z.string().min(1, 'Veuillez sélectionner une région.'),
  coordinates: z.tuple([z.number(), z.number()]),
  distance: z.number().min(0.1, 'La distance doit être supérieure à 0.1 km.'),
  difficulty: z.enum(['Débutant', 'Intermédiaire', 'Avancé', 'Expert'] as const),
  trailType: z.enum(['Cross-country (XC)', 'All-mountain', 'Enduro', 'Downhill (DH)', 'Dirt Jump', 'Pumptrack'] as const),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères.'),
  recommendedBikes: z.array(z.enum(['VTT', 'Gravel', 'Enduro', 'DH', 'Dirt'] as const)),
  hasParking: z.boolean().optional(),
  hasFacilities: z.boolean().optional(),
  hasWater: z.boolean().optional(),
  elevation: z.number(),
  techRating: z.number(),
  sceneryRating: z.number(),
});

type FormValues = z.infer<typeof formSchema>;

const CreateSpot: React.FC = () => {
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      location: '',
      region: '',
      coordinates: [0, 0],
      distance: 1,
      difficulty: 'Intermédiaire',
      trailType: 'Cross-country (XC)',
      description: '',
      recommendedBikes: [],
      hasParking: false,
      hasFacilities: false,
      hasWater: false,
      elevation: 100,
      techRating: 3,
      sceneryRating: 3,
    },
  });

  // Function to handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImagePreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: FormValues) => {
    console.log('Form submitted with data:', data);
    console.log('Image file:', imageFile);
    
    // Here you would normally upload the image and save the spot data
    // For now, we'll just simulate success and navigate back
    
    // Simulating API call delay
    setTimeout(() => {
      navigate('/spots');
    }, 1000);
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          form.setValue('coordinates', [position.coords.longitude, position.coords.latitude]);
          console.log('Location set:', [position.coords.longitude, position.coords.latitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };

  // This is the bike type options for the checkboxes
  const bikeTypeOptions: { value: BikeType; label: string }[] = [
    { value: 'VTT', label: 'VTT' },
    { value: 'Gravel', label: 'Gravel' },
    { value: 'Enduro', label: 'Enduro' },
    { value: 'DH', label: 'Downhill (DH)' },
    { value: 'Dirt', label: 'Dirt' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto py-8 mt-16">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-forest">Ajouter un nouveau spot</h1>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom du spot</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Sentier des cimes" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emplacement</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <Input 
                            placeholder="Ex: Forêt de Fontainebleau" 
                            {...field} 
                            className="rounded-r-none flex-1"
                          />
                          <Button 
                            type="button" 
                            onClick={handleGetLocation}
                            className="rounded-l-none"
                          >
                            <MapPinIcon className="h-4 w-4 mr-2" />
                            Localiser
                          </Button>
                        </div>
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
                            <SelectValue placeholder="Sélectionner une région" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Auvergne-Rhône-Alpes">Auvergne-Rhône-Alpes</SelectItem>
                          <SelectItem value="Bourgogne-Franche-Comté">Bourgogne-Franche-Comté</SelectItem>
                          <SelectItem value="Bretagne">Bretagne</SelectItem>
                          <SelectItem value="Centre-Val de Loire">Centre-Val de Loire</SelectItem>
                          <SelectItem value="Corse">Corse</SelectItem>
                          <SelectItem value="Grand Est">Grand Est</SelectItem>
                          <SelectItem value="Hauts-de-France">Hauts-de-France</SelectItem>
                          <SelectItem value="Île-de-France">Île-de-France</SelectItem>
                          <SelectItem value="Normandie">Normandie</SelectItem>
                          <SelectItem value="Nouvelle-Aquitaine">Nouvelle-Aquitaine</SelectItem>
                          <SelectItem value="Occitanie">Occitanie</SelectItem>
                          <SelectItem value="Pays de la Loire">Pays de la Loire</SelectItem>
                          <SelectItem value="Provence-Alpes-Côte d'Azur">Provence-Alpes-Côte d'Azur</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="distance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Distance (km)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1"
                          min="0.1"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Trail Characteristics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Niveau de difficulté</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner la difficulté" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Débutant">Débutant</SelectItem>
                          <SelectItem value="Intermédiaire">Intermédiaire</SelectItem>
                          <SelectItem value="Avancé">Avancé</SelectItem>
                          <SelectItem value="Expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="trailType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type de sentier</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner le type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Cross-country (XC)">Cross-country (XC)</SelectItem>
                          <SelectItem value="All-mountain">All-mountain</SelectItem>
                          <SelectItem value="Enduro">Enduro</SelectItem>
                          <SelectItem value="Downhill (DH)">Downhill (DH)</SelectItem>
                          <SelectItem value="Dirt Jump">Dirt Jump</SelectItem>
                          <SelectItem value="Pumptrack">Pumptrack</SelectItem>
                        </SelectContent>
                      </Select>
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
                        <Input 
                          type="number"
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Recommended Bikes */}
              <FormField
                control={form.control}
                name="recommendedBikes"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Vélos recommandés</FormLabel>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {bikeTypeOptions.map((option) => (
                        <FormField
                          key={option.value}
                          control={form.control}
                          name="recommendedBikes"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={option.value}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(option.value)}
                                    onCheckedChange={(checked) => {
                                      const updatedValue = [...field.value]
                                      if (checked) {
                                        updatedValue.push(option.value)
                                      } else {
                                        const index = updatedValue.indexOf(option.value)
                                        if (index !== -1) {
                                          updatedValue.splice(index, 1)
                                        }
                                      }
                                      field.onChange(updatedValue)
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {option.label}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Décrivez ce spot, ses caractéristiques et ce qui le rend unique..."
                        className="h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Amenities */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Équipements et services</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="hasParking"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          Parking disponible
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="hasFacilities"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          Toilettes/Vestiaires
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="hasWater"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          Point d'eau
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Ratings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Évaluations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="techRating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Difficulté technique (1-5)</FormLabel>
                        <FormControl>
                          <div className="pt-6 pb-2">
                            <Slider
                              min={1}
                              max={5}
                              step={1}
                              defaultValue={[field.value]}
                              onValueChange={(values) => field.onChange(values[0])}
                            />
                            <div className="flex justify-between mt-2 text-xs text-gray-500">
                              <span>Facile</span>
                              <span>Moyen</span>
                              <span>Difficile</span>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sceneryRating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Beauté du paysage (1-5)</FormLabel>
                        <FormControl>
                          <div className="pt-6 pb-2">
                            <Slider
                              min={1}
                              max={5}
                              step={1}
                              defaultValue={[field.value]}
                              onValueChange={(values) => field.onChange(values[0])}
                            />
                            <div className="flex justify-between mt-2 text-xs text-gray-500">
                              <span>Basique</span>
                              <span>Agréable</span>
                              <span>Exceptionnel</span>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Photos</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center justify-center w-full">
                    <label 
                      htmlFor="image-upload" 
                      className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                    >
                      {imagePreview ? (
                        <div className="w-full h-full relative">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                            <p className="text-white text-center">
                              Cliquez pour changer l'image
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <UploadIcon className="w-10 h-10 mb-3 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Cliquez pour télécharger</span> ou glissez-déposez
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG (MAX. 5 Mo)
                          </p>
                        </div>
                      )}
                      <input 
                        id="image-upload" 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => navigate('/spots')}>
                  Annuler
                </Button>
                <Button type="submit" className="bg-forest hover:bg-forest-dark">
                  Ajouter le spot
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default CreateSpot;
