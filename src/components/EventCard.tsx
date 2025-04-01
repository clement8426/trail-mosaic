
import React from 'react';
import { Event } from '../types';
import { Calendar, MapPin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface EventCardProps {
  event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const eventDate = new Date(event.date);
  const timeUntil = formatDistanceToNow(eventDate, { addSuffix: true, locale: fr });
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Compétition': return 'bg-red-500';
      case 'Rassemblement': return 'bg-blue-500';
      case 'Formation': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="relative h-40 overflow-hidden">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2">
          <Badge className={`${getCategoryColor(event.category)} text-white`}>
            {event.category}
          </Badge>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <h3 className="text-lg font-bold text-white">{event.title}</h3>
        </div>
      </div>

      <CardContent className="pt-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar size={14} />
          <span>{new Date(event.date).toLocaleDateString('fr-FR')}</span>
          <span className="text-trail ml-1 font-medium">{timeUntil}</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
          <MapPin size={14} />
          <span>{event.location}</span>
        </div>
        <p className="mt-3 text-sm text-gray-600 line-clamp-2">
          {event.description}
        </p>
      </CardContent>
    </Card>
  );
};

export default EventCard;
