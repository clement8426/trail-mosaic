
import { Event } from '../types';

export const events: Event[] = [
  {
    id: '1',
    title: 'Enduro des Cévennes',
    description: "Compétition d'enduro sur plusieurs spéciales chronométrées. Différentes catégories disponibles selon le niveau.",
    date: '2023-07-15',
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
    date: '2023-06-10',
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
    date: '2023-08-05',
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
    date: '2023-09-22',
    location: 'Chamonix',
    imageUrl: 'https://images.unsplash.com/photo-1603435521001-36f9583896cf?q=80&w=2071&auto=format&fit=crop',
    category: 'Compétition',
    trailId: '4',
    region: 'Auvergne-Rhône-Alpes',
    coordinates: [6.8698, 45.9237]
  }
];
