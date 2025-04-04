
import { Event } from '../types';

export const events: Event[] = [
  {
    id: '1',
    title: 'Enduro des Cévennes',
    description: "Compétition d'enduro sur plusieurs spéciales chronométrées. Différentes catégories disponibles selon le niveau.",
    date: '2025-06-15',
    location: 'Parc National des Cévennes',
    imageUrl: 'https://images.unsplash.com/photo-1601917993872-16fc37c1f872?q=80&w=2070&auto=format&fit=crop',
    category: 'Compétition',
    trailId: '1',
    region: 'Occitanie',
    coordinates: [3.6895, 44.3252]
  },
  {
    id: '2',
    title: 'Jam Session Pump Track',
    description: "Journée conviviale avec contests, initiations et BBQ. Ouvert à tous les niveaux.",
    date: '2025-07-10',
    location: 'Montpellier',
    imageUrl: 'https://images.unsplash.com/photo-1629685493563-56a4a6efe00d?q=80&w=2070&auto=format&fit=crop',
    category: 'Rassemblement',
    trailId: '2',
    region: 'Occitanie',
    coordinates: [3.8767, 43.6108]
  },
  {
    id: '3',
    title: 'Masterclass Freestyle',
    description: "Stage de perfectionnement aux tricks aériens encadré par des riders professionnels.",
    date: '2025-08-05',
    location: 'Lyon',
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=2070&auto=format&fit=crop',
    category: 'Formation',
    trailId: '3',
    region: 'Auvergne-Rhône-Alpes',
    coordinates: [4.8357, 45.7640]
  },
  {
    id: '4',
    title: 'Descente Alpine Challenge',
    description: "Course de descente chronométrée sur la célèbre piste des Aigles avec des prix à gagner.",
    date: '2025-09-22',
    location: 'Chamonix',
    imageUrl: 'https://images.unsplash.com/photo-1603435521001-36f9583896cf?q=80&w=2071&auto=format&fit=crop',
    category: 'Compétition',
    trailId: '4',
    region: 'Auvergne-Rhône-Alpes',
    coordinates: [6.8698, 45.9237]
  },
  {
    id: '5',
    title: 'Week-end Découverte Enduro',
    description: "Un week-end pour découvrir l'enduro dans un cadre exceptionnel. Encadrement par des moniteurs diplômés.",
    date: '2025-07-25',
    location: 'Annecy',
    imageUrl: 'https://images.unsplash.com/photo-1570463662416-7d8e39fc6a5c?q=80&w=2070&auto=format&fit=crop',
    category: 'Formation',
    trailId: '2',
    region: 'Auvergne-Rhône-Alpes',
    coordinates: [6.1296, 45.8992]
  },
  {
    id: '6',
    title: 'Coupe Régionale PACA',
    description: "Étape de la coupe régionale PACA, ouverte aux licenciés FFC. Plusieurs catégories disponibles.",
    date: '2025-06-30',
    location: 'Nice',
    imageUrl: 'https://images.unsplash.com/photo-1667470229188-3559afe35b77?q=80&w=2070&auto=format&fit=crop',
    category: 'Compétition',
    trailId: '3',
    region: 'Provence-Alpes-Côte d\'Azur',
    coordinates: [7.2620, 43.7102]
  }
];
