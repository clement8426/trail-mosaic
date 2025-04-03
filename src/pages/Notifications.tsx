
import React from "react";
import Navbar from "@/components/Navbar";
import { Bell, MapPin, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock notification data
const mockNotifications = [
  {
    id: "1",
    type: "spot",
    title: "Nouveau spot ajouté près de chez vous",
    message: "Un nouveau spot 'Descente du Mont Ventoux' a été ajouté à 15km de votre position.",
    date: "2023-07-12T10:30:00Z",
    read: false,
    relatedId: "trail5"
  },
  {
    id: "2",
    type: "event",
    title: "Événement à venir",
    message: "Le championnat régional VTT aura lieu ce weekend à Lyon.",
    date: "2023-07-10T08:45:00Z",
    read: true,
    relatedId: "event2"
  },
  {
    id: "3",
    type: "session",
    title: "Nouvelle session disponible",
    message: "Thomas a créé une nouvelle session 'Entraînement technique' le 20 juillet.",
    date: "2023-07-08T16:20:00Z",
    read: false,
    relatedId: "session2"
  },
  {
    id: "4",
    type: "like",
    title: "Nouveau like sur votre spot",
    message: "Julie a aimé votre spot 'Sentier des Crêtes'.",
    date: "2023-07-05T14:15:00Z",
    read: true,
    relatedId: "trail3"
  }
];

const Notifications: React.FC = () => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "spot":
        return <MapPin className="text-forest" />;
      case "event":
        return <Calendar className="text-amber-500" />;
      case "session":
        return <Users className="text-blue-500" />;
      case "like":
        return <div className="w-5 h-5 flex items-center justify-center text-red-500">❤️</div>;
      default:
        return <Bell className="text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto pt-24 px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <Button variant="outline" size="sm">
            Tout marquer comme lu
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow">
          {mockNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Pas de notifications</h3>
              <p className="mt-1 text-gray-500">Vous n'avez aucune notification pour le moment.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {mockNotifications.map((notification) => (
                <li 
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.read ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900">{notification.title}</p>
                        <span className="text-xs text-gray-500">
                          {formatDate(notification.date)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                    </div>
                    {!notification.read && (
                      <span className="inline-flex items-center rounded-full bg-blue-500 px-1.5 py-0.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
