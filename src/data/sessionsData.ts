
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
  }
];
