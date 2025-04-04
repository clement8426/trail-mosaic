
import { User } from '@/types';

export const users: User[] = [
  {
    id: "user1",
    username: "Sophie Martin",
    email: "sophie.martin@example.com",
    profilePicture: "https://randomuser.me/api/portraits/women/44.jpg",
    photoURL: "https://randomuser.me/api/portraits/women/44.jpg",
    bio: "Passionnée de VTT depuis 5 ans. J'adore les sentiers techniques et les descentes rapides.",
    level: "Intermédiaire",
    preferredBikes: ["Tout-suspendu", "Enduro"],
    favorites: ["trail1", "trail3", "trail5"],
    location: "Lyon",
    createdAt: "2022-03-15"
  },
  {
    id: "user2",
    username: "Thomas Bernard",
    email: "thomas.bernard@example.com",
    profilePicture: "https://randomuser.me/api/portraits/men/32.jpg",
    photoURL: "https://randomuser.me/api/portraits/men/32.jpg",
    bio: "Rider depuis plus de 10 ans, je préfère les parcours d'enduro et de descente.",
    level: "Expert",
    preferredBikes: ["Enduro", "DH"],
    favorites: ["trail2", "trail4", "trail6"],
    location: "Chamonix",
    createdAt: "2021-05-22"
  },
  {
    id: "user3",
    username: "Julie Petit",
    email: "julie.petit@example.com",
    profilePicture: "https://randomuser.me/api/portraits/women/68.jpg",
    photoURL: "https://randomuser.me/api/portraits/women/68.jpg",
    bio: "Débutante enthousiaste, je recherche des spots adaptés pour progresser en toute sécurité.",
    level: "Débutant",
    preferredBikes: ["Semi-rigide"],
    favorites: ["trail1", "trail7"],
    location: "Bordeaux",
    createdAt: "2023-01-08"
  },
  {
    id: "user4",
    username: "Alexandre Dupont",
    email: "alex.dupont@example.com",
    profilePicture: "https://randomuser.me/api/portraits/men/52.jpg",
    photoURL: "https://randomuser.me/api/portraits/men/52.jpg",
    bio: "Guide VTT professionnel, spécialiste des Alpes et des Pyrénées.",
    level: "Expert",
    preferredBikes: ["Tout-suspendu", "Enduro", "DH"],
    favorites: ["trail4", "trail8", "trail9"],
    location: "Annecy",
    createdAt: "2020-07-19"
  },
  {
    id: "user5",
    username: "Camille Roux",
    email: "camille.roux@example.com",
    profilePicture: "https://randomuser.me/api/portraits/women/29.jpg",
    photoURL: "https://randomuser.me/api/portraits/women/29.jpg",
    bio: "Compétitrice en XC, j'aime aussi rider en bikeparks le weekend.",
    level: "Avancé",
    preferredBikes: ["Semi-rigide", "Tout-suspendu"],
    favorites: ["trail5", "trail10"],
    location: "Marseille",
    createdAt: "2022-09-04"
  },
  {
    id: "user6",
    username: "Lucas Moreau",
    email: "lucas.moreau@example.com",
    profilePicture: "https://randomuser.me/api/portraits/men/76.jpg",
    photoURL: "https://randomuser.me/api/portraits/men/76.jpg",
    bio: "Ancien cycliste sur route reconverti au VTT. Je partage régulièrement mes aventures sur YouTube.",
    level: "Intermédiaire",
    preferredBikes: ["Tout-suspendu"],
    favorites: ["trail3", "trail7", "trail11"],
    location: "Toulouse",
    createdAt: "2021-11-27"
  }
];
