
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Map, Bike, Mountain, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import TrailCard from '@/components/TrailCard';
import EventCard from '@/components/EventCard';
import { trails } from '@/data/trailsData';
import { events } from '@/data/eventsData';
import { BikeType, TrailType, DifficultyLevel } from '@/types';
import TrailFilters from '@/components/TrailFilters';
import TrailMap from '@/components/TrailMap';

const Index = () => {
  const [selectedBikeType, setSelectedBikeType] = useState<BikeType>('Tous');
  const [selectedTrailType, setSelectedTrailType] = useState<TrailType | 'Tous'>('Tous');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'Tous'>('Tous');
  const [distanceRange, setDistanceRange] = useState<[number, number]>([0, 10]);
  
  // We'll show the first 3 trails for the featured section
  const featuredTrails = trails.slice(0, 3);
  const upcomingEvents = events.slice(0, 2);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-20 md:pt-32 pb-16 md:pb-24 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1587858138260-e65ef3121350?q=80&w=2070&auto=format&fit=crop" 
            alt="Mountain biker on trail" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-2xl text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Découvrez les meilleurs spots de VTT
            </h1>
            <p className="text-xl mb-8 text-white/90">
              Explorez une collection de pistes de descente, terrains de bosses et spots à tricks. 
              Pour tous les niveaux, du débutant au rider professionnel.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                asChild
                size="lg" 
                className="bg-trail hover:bg-trail-dark text-white font-medium"
              >
                <Link to="/map">
                  Voir la carte
                  <Map className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                asChild
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/20"
              >
                <Link to="/trails">
                  Toutes les pistes
                  <Bike className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Map Preview Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="w-full md:w-2/3">
              <h2 className="text-2xl font-bold mb-2 text-forest-dark flex items-center gap-2">
                <Map className="h-6 w-6 text-trail" />
                Carte Interactive
              </h2>
              <p className="text-gray-600 mb-6">
                Explorez notre carte interactive pour découvrir les meilleurs spots de VTT près de chez vous.
              </p>
              <div className="h-[400px] rounded-lg overflow-hidden shadow-lg">
                <TrailMap />
              </div>
            </div>
            <div className="w-full md:w-1/3 mt-8 md:mt-0">
              <h3 className="text-xl font-bold mb-4 text-forest-dark">Filtres</h3>
              <TrailFilters
                selectedBikeType={selectedBikeType}
                setSelectedBikeType={setSelectedBikeType}
                selectedTrailType={selectedTrailType}
                setSelectedTrailType={setSelectedTrailType}
                selectedDifficulty={selectedDifficulty}
                setSelectedDifficulty={setSelectedDifficulty}
                distanceRange={distanceRange}
                setDistanceRange={setDistanceRange}
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Trails */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-forest-dark flex items-center gap-2">
              <Mountain className="h-6 w-6 text-trail" />
              Pistes à découvrir
            </h2>
            <Button 
              asChild
              variant="ghost" 
              className="text-forest hover:text-white hover:bg-forest"
            >
              <Link to="/trails" className="flex items-center gap-1">
                Voir tout <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTrails.map((trail) => (
              <TrailCard key={trail.id} trail={trail} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Categories */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-forest-dark text-center">
            Explorez par catégorie
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CategoryCard 
              title="Descente"
              description="Adrénaline et vitesse sur des parcours techniques"
              imageUrl="https://images.unsplash.com/photo-1529260830199-42c24126f198?q=80&w=2076&auto=format&fit=crop"
              category="Descente"
            />
            <CategoryCard 
              title="Terrain de bosses"
              description="Enchaînez les bosses et les virages relevés"
              imageUrl="https://images.unsplash.com/photo-1601706992394-1419fd29e3de?q=80&w=2070&auto=format&fit=crop"
              category="Terrain de bosses"
            />
            <CategoryCard 
              title="Bosses à tricks"
              description="Exprimez votre créativité en l'air"
              imageUrl="https://images.unsplash.com/photo-1488507335838-46b4e9e6e2b2?q=80&w=2070&auto=format&fit=crop"
              category="Bosses à tricks"
            />
          </div>
        </div>
      </section>
      
      {/* Upcoming Events */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-forest-dark flex items-center gap-2">
              <Calendar className="h-6 w-6 text-trail" />
              Événements à venir
            </h2>
            <Button 
              asChild
              variant="ghost" 
              className="text-forest hover:text-white hover:bg-forest"
            >
              <Link to="/events" className="flex items-center gap-1">
                Tous les événements <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Call to action */}
      <section className="py-16 bg-forest text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Rejoignez la communauté de riders</h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-8">
            Créez un compte pour partager vos spots favoris, noter les pistes et participer aux événements.
          </p>
          <Button size="lg" className="bg-trail hover:bg-trail-dark text-white">
            S'inscrire maintenant
          </Button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-white/70">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-bold mb-4">Trail Mosaic</h3>
              <p className="text-sm">
                Votre guide ultime pour découvrir les meilleurs spots de VTT, dirt et descente.
              </p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Navigation</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="hover:text-white">Accueil</Link></li>
                <li><Link to="/map" className="hover:text-white">Carte</Link></li>
                <li><Link to="/trails" className="hover:text-white">Pistes</Link></li>
                <li><Link to="/events" className="hover:text-white">Événements</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Catégories</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Descente</a></li>
                <li><a href="#" className="hover:text-white">Terrain de bosses</a></li>
                <li><a href="#" className="hover:text-white">Bosses à tricks</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">À propos</a></li>
                <li><a href="#" className="hover:text-white">Conditions d'utilisation</a></li>
                <li><a href="#" className="hover:text-white">Confidentialité</a></li>
                <li><a href="#" className="hover:text-white">Support</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-6 text-center text-sm">
            &copy; {new Date().getFullYear()} Trail Mosaic. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
};

interface CategoryCardProps {
  title: string;
  description: string;
  imageUrl: string;
  category: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ title, description, imageUrl, category }) => {
  return (
    <Card className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow h-64">
      <div className="relative h-full">
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 group-hover:from-black/70 transition-all">
          <CardContent className="flex flex-col justify-end h-full text-white p-6">
            <h3 className="text-xl font-bold mb-2 group-hover:text-trail transition-colors">{title}</h3>
            <p className="text-white/80 text-sm mb-4">{description}</p>
            <Button 
              variant="outline" 
              className="border-white text-white hover:bg-white/20 w-full"
              onClick={() => console.log(`View category: ${category}`)}
            >
              Explorer
            </Button>
          </CardContent>
        </div>
      </div>
    </Card>
  );
};

export default Index;
