
// Trail types
export type DifficultyLevel = 'Débutant' | 'Intermédiaire' | 'Avancé' | 'Expert' | 'Tous';
export type TrailType = 'Descente' | 'Cross-country' | 'Enduro' | 'Terrain de bosses' | 'Bosses à tricks' | 'Tous';
export type BikeType = 'BMX' | 'Semi-rigide' | 'Tout-suspendu' | 'Enduro' | 'DH' | 'Tous';
export type ObstacleType = 'Rock garden' | 'Drop' | 'Gap' | 'Northshore' | 'Saut' | 'Bosse' | 'Virage serré' | 'Passerelle';

export interface Obstacle {
  type: ObstacleType;
  description: string;
}

export interface Trail {
  id: string;
  name: string;
  location: string;
  coordinates: [number, number];
  description: string;
  imageUrl: string;
  distance: number;
  elevation: number;
  difficulty: DifficultyLevel;
  trailType: TrailType;
  recommendedBikes: BikeType[];
  obstacles: Obstacle[];
  rating: number;
  reviews: number;
  region?: string;
  distance?: number; // For display when sorting by distance
}

// Event types
export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  imageUrl: string;
  category: string;
  trailId: string;
  coordinates?: [number, number];
  region?: string;
  distance?: number; // For display when sorting by distance
}

// Session types
export interface SessionParticipant {
  userId: string;
  username: string;
  status: 'going' | 'interested' | 'maybe';
}

export interface Session {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  createdBy: string;
  participants: SessionParticipant[];
  trailId: string;
  distance?: number; // For display when sorting by distance
}

// User types
export interface User {
  id: string;
  username: string;
  email: string;
  profilePicture: string;
  bio: string;
  level: string;
  preferredBikes: BikeType[];
  favoriteTrails: string[];
  location: string;
}

// Region summary
export interface RegionSummary {
  name: string;
  coordinates: [number, number];
  spotCount: number;
  eventCount: number;
  sessionCount: number;
}

// For routes that check authentication
export type ProtectedRouteProps = {
  children: React.ReactNode;
};
