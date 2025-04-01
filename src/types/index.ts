
export type BikeType = 'BMX' | 'Semi-rigide' | 'Tout-suspendu' | 'Tous';

export type TrailType = 'Descente' | 'Terrain de bosses' | 'Bosses à tricks';

export type DifficultyLevel = 'Débutant' | 'Intermédiaire' | 'Avancé' | 'Expert';

export interface Obstacle {
  type: 'Bosse' | 'Virage serré' | 'Saut' | 'Gap' | 'Drop' | 'Northshore' | 'Rock garden';
  description: string;
}

export interface Trail {
  id: string;
  name: string;
  location: string;
  coordinates: [number, number]; // [longitude, latitude]
  description: string;
  imageUrl: string;
  distance: number; // in kilometers
  elevation: number; // in meters
  difficulty: DifficultyLevel;
  trailType: TrailType;
  recommendedBikes: BikeType[];
  obstacles: Obstacle[];
  rating: number; // out of 5
  reviews: number; // number of reviews
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  imageUrl: string;
  category: 'Compétition' | 'Rassemblement' | 'Formation';
  trailId?: string; // Optional reference to a trail
}
