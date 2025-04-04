
import { Session } from '../types';

export const sessions: Session[] = [
  {
    id: "session1",
    title: "Sortie groupe intermédiaire",
    description: "Session de groupe pour riders intermédiaires",
    date: "2023-07-15",
    time: "14:00",
    createdBy: "user1",
    participants: [
      { userId: "user1", username: "Alex", status: "going" },
      { userId: "user2", username: "Marine", status: "going" },
    ],
    trailId: "1"
  },
  {
    id: "session2",
    title: "Entraînement technique",
    description: "Focus sur les sauts et les virages relevés",
    date: "2023-07-20",
    time: "10:00",
    createdBy: "user3",
    participants: [
      { userId: "user3", username: "Thomas", status: "going" },
      { userId: "user4", username: "Julie", status: "interested" },
    ],
    trailId: "2"
  },
  {
    id: "session3",
    title: "Descente rapide",
    description: "Session pour travailler la vitesse en descente",
    date: "2023-08-05",
    time: "09:30",
    createdBy: "user5",
    participants: [
      { userId: "user5", username: "Simon", status: "going" },
      { userId: "user6", username: "Clara", status: "going" },
      { userId: "user1", username: "Alex", status: "interested" },
    ],
    trailId: "4"
  },
  {
    id: "session4",
    title: "Initiation au dirt",
    description: "Session pour débutants qui veulent s'essayer aux bosses à tricks",
    date: "2023-08-12",
    time: "14:30",
    createdBy: "user3",
    participants: [
      { userId: "user3", username: "Thomas", status: "going" },
      { userId: "user7", username: "Léa", status: "going" },
    ],
    trailId: "3"
  },
  {
    id: "session5",
    title: "Session enduro Pro",
    description: "Réservée aux riders confirmés pour une session enduro intense",
    date: "2023-09-01",
    time: "08:00",
    createdBy: "user5",
    participants: [
      { userId: "user5", username: "Simon", status: "going" },
      { userId: "user8", username: "Paul", status: "going" },
      { userId: "user9", username: "Emma", status: "interested" },
    ],
    trailId: "1"
  },
  {
    id: "session6",
    title: "Week-end descente",
    description: "Session complète sur 2 jours pour progresser en descente",
    date: "2023-10-15",
    time: "09:00",
    createdBy: "user3",
    participants: [
      { userId: "user3", username: "Thomas", status: "going" },
      { userId: "user5", username: "Simon", status: "interested" },
    ],
    trailId: "5"
  },
  {
    id: "session7",
    title: "Technique en forêt",
    description: "Travail sur les passages techniques en sous-bois",
    date: "2023-11-05",
    time: "10:30",
    createdBy: "user1",
    participants: [
      { userId: "user1", username: "Alex", status: "going" },
      { userId: "user2", username: "Marine", status: "going" },
      { userId: "user7", username: "Léa", status: "interested" },
    ],
    trailId: "6"
  }
];
