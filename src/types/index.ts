
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
  createdBy?: string; // ID of the user who created the trail
  createdAt?: string; // Date of creation
  contributors?: Contributor[]; // List of users who contributed to this trail
  comments?: Comment[]; // List of comments
  sessions?: Session[]; // List of ride sessions
}

export interface Contributor {
  userId: string;
  username: string;
  action: 'created' | 'edited' | 'added_photo' | 'reported';
  timestamp: string;
  details?: string;
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: string;
  rating?: number; // Optional rating between 1-5
}

export interface Session {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  createdBy: string;
  participants: {
    userId: string;
    username: string;
    status: 'going' | 'interested' | 'not_going';
  }[];
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
  coordinates?: [number, number]; // [longitude, latitude]
}

export interface User {
  id: string;
  email: string;
  username: string;
  photoURL?: string;
  createdAt: string;
  favorites: string[]; // Trail IDs
  contributions?: Contributor[]; // Contributions made by user
  notifications?: Notification[]; // Notifications for user
}

export interface Notification {
  id: string;
  type: 'session' | 'contribution' | 'comment' | 'favorite';
  message: string;
  timestamp: string;
  read: boolean;
  trailId?: string;
  sessionId?: string;
}

export interface TrailModification {
  id: string;
  trailId: string;
  userId: string;
  username: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  votes: {
    userId: string;
    vote: 'up' | 'down';
  }[];
}
