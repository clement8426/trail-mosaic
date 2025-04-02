
import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Event } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

// Interface pour les props du composant
interface EventMapProps {
  events: Event[];
  userLocation: [number, number] | null;
  onLocationSelected: (coords: [number, number]) => void;
}

// Vous devez remplacer cette clé par votre propre clé Mapbox
// Cette clé est temporaire et doit être configurée dans un environnement sécurisé
const MAPBOX_TOKEN = 'VOTRE_CLE_MAPBOX_ICI';

const EventMap: React.FC<EventMapProps> = ({ events, userLocation, onLocationSelected }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const geocoderContainerRef = useRef<HTMLDivElement>(null);

  // Initialisation de la carte
  useEffect(() => {
    if (!mapContainer.current) return;

    // Configuration de l'API Mapbox
    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    // Création de la carte
    const newMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [2.3522, 48.8566], // Paris par défaut
      zoom: 5
    });
    
    // Ajout des contrôles de navigation
    newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Ajout du géocodeur pour la recherche de lieux
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      placeholder: 'Rechercher un lieu...',
      language: 'fr',
      countries: 'fr', // Limiter aux résultats en France
      marker: false // Ne pas ajouter de marqueur automatiquement
    });
    
    if (geocoderContainerRef.current) {
      geocoderContainerRef.current.appendChild(geocoder.onAdd(newMap));
    }
    
    // Écouter les résultats de la recherche
    geocoder.on('result', (e) => {
      const coords: [number, number] = [
        e.result.center[0],
        e.result.center[1]
      ];
      
      // Zoomer sur l'emplacement sélectionné
      newMap.flyTo({
        center: coords,
        zoom: 12
      });
      
      // Notifier le composant parent
      onLocationSelected(coords);
      
      // Afficher un toast
      toast({
        title: "Lieu sélectionné",
        description: `${e.result.place_name}`,
      });
    });
    
    // Gestionnaire d'événement pour le chargement de la carte
    newMap.on('load', () => {
      setIsMapLoaded(true);
      
      // Si la position de l'utilisateur est disponible, centrer la carte dessus
      if (userLocation) {
        newMap.flyTo({
          center: userLocation,
          zoom: 11
        });
        
        // Ajouter un marqueur pour la position de l'utilisateur
        new mapboxgl.Marker({
          color: '#4A78E0',
          scale: 0.8
        })
          .setLngLat(userLocation)
          .addTo(newMap)
          .setPopup(new mapboxgl.Popup().setText('Votre position'));
      }
      
      // Ajouter les marqueurs pour les événements
      addEventMarkers(newMap);
    });
    
    // Sauvegarde de la référence à la carte
    map.current = newMap;
    
    // Nettoyage lors du démontage du composant
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);
  
  // Mise à jour des marqueurs lorsque les événements ou la position utilisateur changent
  useEffect(() => {
    if (map.current && isMapLoaded) {
      // Supprimer les anciens marqueurs
      markers.current.forEach(marker => marker.remove());
      markers.current = [];
      
      // Ajouter les nouveaux marqueurs
      addEventMarkers(map.current);
      
      // Si la position de l'utilisateur est disponible, centrer et ajouter un marqueur
      if (userLocation) {
        // Vérifier si la carte est déjà centrée sur un autre point sélectionné
        map.current.flyTo({
          center: userLocation,
          zoom: 11,
          duration: 1000
        });
        
        // Ajouter un marqueur pour la position de l'utilisateur
        const userMarker = new mapboxgl.Marker({
          color: '#4A78E0',
          scale: 0.8
        })
          .setLngLat(userLocation)
          .addTo(map.current)
          .setPopup(new mapboxgl.Popup().setText('Votre position'));
        
        // Ajouter le marqueur à la liste pour le nettoyage
        markers.current.push(userMarker);
      }
    }
  }, [events, userLocation, isMapLoaded]);
  
  // Fonction pour ajouter les marqueurs des événements
  const addEventMarkers = (mapInstance: mapboxgl.Map) => {
    events.forEach(event => {
      // Pour cet exemple, nous utilisons des coordonnées fictives
      // Dans une vraie application, ces coordonnées viendraient des données d'événement
      const coordinates = getEventCoordinates(event);
      
      // Créer un élément personnalisé pour le marqueur
      const el = document.createElement('div');
      el.className = 'event-marker';
      el.innerHTML = `
        <div class="w-8 h-8 bg-trail rounded-full flex items-center justify-center shadow-md transform hover:scale-110 transition-transform cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
      `;
      
      // Créer et ajouter le marqueur
      const marker = new mapboxgl.Marker(el)
        .setLngLat(coordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div class="p-2">
                <h3 class="font-bold text-forest-dark">${event.title}</h3>
                <p class="text-sm">${event.location}</p>
                <p class="text-xs mt-1">${new Date(event.date).toLocaleDateString()}</p>
              </div>
            `)
        )
        .addTo(mapInstance);
      
      // Ajouter le marqueur à la liste pour le nettoyage
      markers.current.push(marker);
    });
  };

  // Helper pour obtenir les coordonnées d'un événement (factice pour l'exemple)
  const getEventCoordinates = (event: Event): [number, number] => {
    // Fonction fictive pour retourner des coordonnées pour un événement
    // Dans une vraie app, ces coordonnées devraient être stockées dans vos données d'événement
    const mockCoords: {[key: string]: [number, number]} = {
      "Parc National des Cévennes": [3.6, 44.2],
      "Montpellier": [3.8767, 43.6108],
      "Lyon": [4.8357, 45.7640],
      "Chamonix": [6.8696, 45.9237]
    };
    
    return mockCoords[event.location] || [2.3522, 48.8566]; // Paris par défaut si non trouvé
  };

  return (
    <div className="relative w-full h-full">
      {/* Geocoder (barre de recherche) */}
      <div 
        ref={geocoderContainerRef} 
        className="absolute top-4 left-4 z-10 w-[300px]"
      />
      
      {/* Container pour la carte */}
      <div 
        ref={mapContainer} 
        className="w-full h-full rounded-lg"
      />
      
      {/* Loader pendant le chargement */}
      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-forest" />
            <p className="mt-2 text-forest font-medium">Chargement de la carte...</p>
          </div>
        </div>
      )}
      
      {/* Message si clé Mapbox non configurée */}
      {MAPBOX_TOKEN === 'VOTRE_CLE_MAPBOX_ICI' && (
        <div className="absolute inset-0 flex items-center justify-center bg-white">
          <div className="max-w-md p-6 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-lg font-bold text-red-700 mb-2">
              Configuration requise
            </h3>
            <p className="text-red-600">
              Veuillez remplacer "VOTRE_CLE_MAPBOX_ICI" par votre clé d'API Mapbox dans le fichier EventMap.tsx.
            </p>
            <p className="text-sm mt-2 text-gray-600">
              Pour obtenir une clé, inscrivez-vous sur <a href="https://www.mapbox.com/" className="underline" target="_blank" rel="noopener noreferrer">mapbox.com</a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventMap;
