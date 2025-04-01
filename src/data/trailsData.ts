
import { Trail } from '../types';

export const trails: Trail[] = [
  {
    id: '1',
    name: 'La Rocheuse',
    location: 'Parc National des Cévennes',
    coordinates: [3.6895, 44.3252],
    description: "Une descente technique avec plusieurs sections rocheuses et des virages serrés. Parfaite pour les riders avancés cherchant à perfectionner leur technique.",
    imageUrl: "https://images.unsplash.com/photo-1544191093-c2dcfa8a04af?q=80&w=2070&auto=format&fit=crop",
    distance: 3.5,
    elevation: 450,
    difficulty: "Avancé",
    trailType: "Descente",
    recommendedBikes: ["Tout-suspendu"],
    obstacles: [
      { type: "Rock garden", description: "Section rocheuse de 50m nécessitant une bonne lecture de ligne" },
      { type: "Drop", description: "Drop de 1.5m avec réception douce" },
      { type: "Virage serré", description: "Série de 5 virages en épingle" }
    ],
    rating: 4.8,
    reviews: 32
  },
  {
    id: '2',
    name: 'Pump Track des Pins',
    location: 'Montpellier',
    coordinates: [3.8767, 43.6108],
    description: "Un pump track fluide avec des bosses régulières et des virages relevés. Idéal pour travailler son pump et sa technique de virage.",
    imageUrl: "https://images.unsplash.com/photo-1601706992394-1419fd29e3de?q=80&w=2070&auto=format&fit=crop",
    distance: 0.5,
    elevation: 0,
    difficulty: "Intermédiaire",
    trailType: "Terrain de bosses",
    recommendedBikes: ["BMX", "Semi-rigide", "Tout-suspendu"],
    obstacles: [
      { type: "Bosse", description: "Suite de bosses rythmiques" },
      { type: "Virage serré", description: "Virages relevés permettant de conserver la vitesse" }
    ],
    rating: 4.5,
    reviews: 47
  },
  {
    id: '3',
    name: 'Dirt Park La Rampe',
    location: 'Lyon',
    coordinates: [4.8357, 45.7640],
    description: "Un bike park avec plusieurs lignes de sauts, du petit au gros. Tables, doubles et hip jumps sont au rendez-vous pour progresser en freestyle.",
    imageUrl: "https://images.unsplash.com/photo-1546058256-eb1c1ca09b77?q=80&w=2071&auto=format&fit=crop",
    distance: 1.0,
    elevation: 50,
    difficulty: "Intermédiaire",
    trailType: "Bosses à tricks",
    recommendedBikes: ["BMX", "Semi-rigide"],
    obstacles: [
      { type: "Saut", description: "Ligne de tables progressives de 1m à 5m" },
      { type: "Gap", description: "Double gap avec possibilité de contournement" }
    ],
    rating: 4.7,
    reviews: 65
  },
  {
    id: '4',
    name: 'Sentier des Aigles',
    location: 'Chamonix',
    coordinates: [6.8698, 45.9237],
    description: "Une descente alpine vertigineuse offrant des vues spectaculaires et des sections techniques variées. Pour riders expérimentés.",
    imageUrl: "https://images.unsplash.com/photo-1519119012096-c145def61801?q=80&w=2070&auto=format&fit=crop",
    distance: 8.5,
    elevation: 1200,
    difficulty: "Expert",
    trailType: "Descente",
    recommendedBikes: ["Tout-suspendu"],
    obstacles: [
      { type: "Drop", description: "Plusieurs drops naturels entre 1m et 2.5m" },
      { type: "Rock garden", description: "Sections techniques sur pierriers" },
      { type: "Northshore", description: "Passerelle en bois sur section exposée" }
    ],
    rating: 4.9,
    reviews: 28
  },
  {
    id: '5',
    name: 'Le Petit Bois',
    location: 'Bordeaux',
    coordinates: [-0.5795, 44.8378],
    description: "Parcours en forêt idéal pour les débutants avec quelques petites difficultés techniques pour progresser en douceur.",
    imageUrl: "https://images.unsplash.com/photo-1509794618755-253296c147e9?q=80&w=2073&auto=format&fit=crop",
    distance: 4.2,
    elevation: 120,
    difficulty: "Débutant",
    trailType: "Descente",
    recommendedBikes: ["Semi-rigide", "Tout-suspendu"],
    obstacles: [
      { type: "Bosse", description: "Petites bosses faciles à absorber" },
      { type: "Virage serré", description: "Virages larges et bien dessinés" }
    ],
    rating: 4.2,
    reviews: 51
  },
  {
    id: '6',
    name: 'Bike Park La Bresse',
    location: 'Vosges',
    coordinates: [6.8787, 48.0032],
    description: "Un bike park complet avec des pistes pour tous les niveaux et styles : flow, technique, north shore et zones d'apprentissage.",
    imageUrl: "https://images.unsplash.com/photo-1582196729331-8e671b0599a0?q=80&w=2070&auto=format&fit=crop",
    distance: 5.0,
    elevation: 500,
    difficulty: "Intermédiaire",
    trailType: "Descente",
    recommendedBikes: ["Tout-suspendu"],
    obstacles: [
      { type: "Saut", description: "Modules de saut variés et progressifs" },
      { type: "Northshore", description: "Passerelles et wall rides" },
      { type: "Virage serré", description: "Berms sculptés" }
    ],
    rating: 4.6,
    reviews: 89
  }
];
