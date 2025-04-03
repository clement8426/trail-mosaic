
import { User } from '../types';

export const users: User[] = [
  {
    id: "user1",
    username: "Alex",
    email: "alex@example.com",
    profilePicture: "https://i.pravatar.cc/150?img=1",
    bio: "Passionné de VTT depuis 10 ans, j'aime les descentes techniques",
    level: "avancé",
    preferredBikes: ["Tout-suspendu"],
    favoriteTrails: ["1", "4"],
    location: "Lyon"
  },
  {
    id: "user2",
    username: "Marine",
    email: "marine@example.com",
    profilePicture: "https://i.pravatar.cc/150?img=5",
    bio: "Débutante mais motivée, je cherche à progresser sur tous types de terrains",
    level: "débutant",
    preferredBikes: ["Semi-rigide"],
    favoriteTrails: ["5"],
    location: "Paris"
  },
  {
    id: "user3",
    username: "Thomas",
    email: "thomas@example.com",
    profilePicture: "https://i.pravatar.cc/150?img=8",
    bio: "Compétiteur enduro, j'aime partager mes connaissances",
    level: "expert",
    preferredBikes: ["Tout-suspendu"],
    favoriteTrails: ["1", "3", "4"],
    location: "Grenoble"
  },
  {
    id: "user4",
    username: "Julie",
    email: "julie@example.com",
    profilePicture: "https://i.pravatar.cc/150?img=9",
    bio: "Je découvre le VTT et cherche des spots tranquilles",
    level: "débutant",
    preferredBikes: ["Semi-rigide"],
    favoriteTrails: ["2", "5"],
    location: "Bordeaux"
  },
  {
    id: "user5",
    username: "Simon",
    email: "simon@example.com",
    profilePicture: "https://i.pravatar.cc/150?img=11",
    bio: "Ancien coureur DH, maintenant je roule pour le plaisir",
    level: "expert",
    preferredBikes: ["Tout-suspendu"],
    favoriteTrails: ["4", "6"],
    location: "Chamonix"
  },
  {
    id: "user6",
    username: "Clara",
    email: "clara@example.com",
    profilePicture: "https://i.pravatar.cc/150?img=10",
    bio: "J'aime les longues sorties en montagne et les beaux paysages",
    level: "intermédiaire",
    preferredBikes: ["Tout-suspendu", "Semi-rigide"],
    favoriteTrails: ["3", "6"],
    location: "Annecy"
  }
];
