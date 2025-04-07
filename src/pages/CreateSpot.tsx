import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Trail, DifficultyLevel, TrailType, BikeType } from "@/types";
import { trails } from "@/data/trailsData";

const CreateSpot: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    coordinates: [0, 0] as [number, number],
    description: "",
    imageUrl: "",
    distance: 0,
    elevation: 0,
    difficulty: "Intermédiaire" as DifficultyLevel,
    trailType: "Cross-country" as TrailType,
    recommendedBikes: [] as BikeType[],
    legalConsent: false,
  });
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    if (name === 'legalConsent') {
      setFormData(prevData => ({
        ...prevData,
        [name]: checked,
      }));
    } else {
      const bikeType = name as BikeType;
      if (checked) {
        setFormData(prevData => ({
          ...prevData,
          recommendedBikes: [...prevData.recommendedBikes, bikeType],
        }));
      } else {
        setFormData(prevData => ({
          ...prevData,
          recommendedBikes: prevData.recommendedBikes.filter(type => type !== bikeType),
        }));
      }
    }
  };

  const handleSliderChange = (value: number[]) => {
    setFormData(prevData => ({
      ...prevData,
      distance: value[0],
    }));
  };

  // Submit form function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.location || !formData.description || 
        !formData.difficulty || !formData.trailType || !formData.imageUrl || 
        !formData.legalConsent) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    
    if (formData.recommendedBikes && formData.recommendedBikes.length === 0) {
      setError("Veuillez sélectionner au moins un type de vélo recommandé.");
      return;
    }
    
    try {
      // In a real application, we would send this data to a backend
      console.log("Submitted trail data:", formData);
      
      // Create a new mock trail object
      const newTrail: Trail = {
        id: String(trails.length + 1),
        name: formData.name || "",
        location: formData.location || "",
        coordinates: [0, 0], // This would typically come from a map selection
        description: formData.description || "",
        imageUrl: formData.imageUrl || "",
        distance: Number(formData.distance) || 0,
        elevation: Number(formData.elevation) || 0,
        difficulty: formData.difficulty || "Intermédiaire",
        trailType: formData.trailType || "Cross-country",
        recommendedBikes: formData.recommendedBikes || ["Tout-suspendu"],
        obstacles: [],
        rating: 0,
        reviews: 0,
        region: "Nouvelle région" // Would come from location data
      };
      
      toast({
        title: "Spot créé avec succès!",
        description: "Votre spot a été ajouté à la carte.",
      });
      
      // Redirect to the map page after successful submission
      navigate("/map");
    } catch (err) {
      console.error("Error creating trail:", err);
      setError("Une erreur est survenue lors de la création du spot.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Créer un nouveau spot</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Nom du spot</Label>
          <Input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="location">Lieu</Label>
          <Input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="imageUrl">URL de l'image</Label>
          <Input
            type="url"
            id="imageUrl"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="distance">Distance (km)</Label>
          <Slider
            defaultValue={[0]}
            max={20}
            step={1}
            onValueChange={(value) => handleSliderChange(value)}
          />
          <p className="text-sm text-gray-500">Valeur sélectionnée: {formData.distance} km</p>
        </div>
        <div>
          <Label htmlFor="elevation">Elevation (m)</Label>
          <Input
            type="number"
            id="elevation"
            name="elevation"
            value={formData.elevation}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="difficulty">Difficulté</Label>
          <Select onValueChange={(value) => handleSelectChange("difficulty", value)}>
            <SelectTrigger className="w-full">
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
          <Label htmlFor="trailType">Type de spot</Label>
          <Select onValueChange={(value) => handleSelectChange("trailType", value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionner le type de spot" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Descente">Descente</SelectItem>
              <SelectItem value="Cross-country">Cross-country</SelectItem>
              <SelectItem value="Enduro">Enduro</SelectItem>
              <SelectItem value="Terrain de bosses">Terrain de bosses</SelectItem>
              <SelectItem value="Bosses à tricks">Bosses à tricks</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Types de vélos recommandés</Label>
          <div className="flex flex-wrap gap-2">
            <div>
              <Checkbox
                id="bmx"
                name="BMX"
                checked={formData.recommendedBikes.includes("BMX")}
                onCheckedChange={(checked) => handleCheckboxChange({ target: { name: "BMX", checked } } as any)}
              />
              <Label htmlFor="bmx" className="ml-2">BMX</Label>
            </div>
            <div>
              <Checkbox
                id="semiRigide"
                name="Semi-rigide"
                checked={formData.recommendedBikes.includes("Semi-rigide")}
                onCheckedChange={(checked) => handleCheckboxChange({ target: { name: "Semi-rigide", checked } } as any)}
              />
              <Label htmlFor="semiRigide" className="ml-2">Semi-rigide</Label>
            </div>
            <div>
              <Checkbox
                id="toutSuspendu"
                name="Tout-suspendu"
                checked={formData.recommendedBikes.includes("Tout-suspendu")}
                onCheckedChange={(checked) => handleCheckboxChange({ target: { name: "Tout-suspendu", checked } } as any)}
              />
              <Label htmlFor="toutSuspendu" className="ml-2">Tout-suspendu</Label>
            </div>
            <div>
              <Checkbox
                id="enduro"
                name="Enduro"
                checked={formData.recommendedBikes.includes("Enduro")}
                onCheckedChange={(checked) => handleCheckboxChange({ target: { name: "Enduro", checked } } as any)}
              />
              <Label htmlFor="enduro" className="ml-2">Enduro</Label>
            </div>
            <div>
              <Checkbox
                id="dh"
                name="DH"
                checked={formData.recommendedBikes.includes("DH")}
                onCheckedChange={(checked) => handleCheckboxChange({ target: { name: "DH", checked } } as any)}
              />
              <Label htmlFor="dh" className="ml-2">DH</Label>
            </div>
          </div>
        </div>
        <div>
          <Checkbox
            id="legalConsent"
            name="legalConsent"
            checked={formData.legalConsent}
            onCheckedChange={handleCheckboxChange}
            required
          />
          <Label htmlFor="legalConsent" className="ml-2">
            J'accepte les conditions d'utilisation et la politique de confidentialité
          </Label>
        </div>
        <Button type="submit">Créer le spot</Button>
      </form>
    </div>
  );
};

export default CreateSpot;
