
import React, { useState } from 'react';
import { Bell, X, CheckCircle, Clock, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from "@/components/Navbar";

// Mock notification data
interface Notification {
  id: string;
  type: 'session' | 'event' | 'comment' | 'system';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  linkTo?: string;
  icon?: React.ReactNode;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'session',
    title: 'Nouvelle session ajoutée',
    description: 'Une nouvelle session "Descente tranquille" a été ajoutée au spot Les Terres Rouges ce weekend',
    timestamp: '2025-04-03T10:30:00Z',
    read: false,
    linkTo: '/spots/1',
    icon: <Calendar className="h-5 w-5 text-blue-500" />
  },
  {
    id: '2',
    type: 'event',
    title: 'Événement à venir',
    description: 'L\'événement "Enduro des Cévennes" que vous suivez a lieu dans 3 jours',
    timestamp: '2025-04-02T14:45:00Z',
    read: false,
    linkTo: '/events/1',
    icon: <Calendar className="h-5 w-5 text-amber-500" />
  },
  {
    id: '3',
    type: 'comment',
    title: 'Nouveau commentaire',
    description: 'MountainRider34 a commenté sur votre session "Ride matinal"',
    timestamp: '2025-04-01T08:20:00Z',
    read: true,
    linkTo: '/spots/2',
    icon: <Bell className="h-5 w-5 text-green-500" />
  },
  {
    id: '4',
    type: 'system',
    title: 'Bienvenue sur Trail Mosaic!',
    description: 'Merci de vous être inscrit. Explorez les spots près de chez vous et rejoignez la communauté!',
    timestamp: '2025-03-30T16:15:00Z',
    read: true,
    icon: <CheckCircle className="h-5 w-5 text-forest" />
  },
  {
    id: '5',
    type: 'session',
    title: 'Rappel de session',
    description: 'Votre session "Ride technique" commence demain à 10h00',
    timestamp: '2025-03-28T09:10:00Z',
    read: false,
    linkTo: '/spots/3',
    icon: <Clock className="h-5 w-5 text-blue-500" />
  }
];

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  
  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      read: true
    })));
  };
  
  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };
  
  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 pt-24 pb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                {unreadCount} non lues
              </span>
            )}
          </div>
          
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              className="text-sm"
              onClick={markAllAsRead}
            >
              Tout marquer comme lu
            </Button>
          )}
        </div>
        
        {notifications.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="p-6 text-center">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h2 className="text-lg font-medium mb-2">Pas de notifications</h2>
              <p className="text-gray-500">
                Vous n'avez aucune notification pour le moment.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card 
                key={notification.id}
                className={`shadow-sm ${!notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="pt-1">
                      {notification.icon || <Bell className="h-5 w-5 text-gray-400" />}
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">{notification.title}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {formatDate(notification.timestamp)}
                          </span>
                          <button
                            className="text-gray-400 hover:text-gray-600"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-1">{notification.description}</p>
                      
                      <div className="flex items-center gap-3 mt-3">
                        {notification.linkTo && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-xs"
                            asChild
                          >
                            <a href={notification.linkTo}>Voir le détail</a>
                          </Button>
                        )}
                        
                        {!notification.read && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-xs"
                            onClick={() => markAsRead(notification.id)}
                          >
                            Marquer comme lu
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      
      <footer className="bg-gray-900 text-white/70 py-6">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} Trail Mosaic. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
};

export default Notifications;
