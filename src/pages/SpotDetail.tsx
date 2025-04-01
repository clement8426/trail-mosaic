
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Star, Heart, HeartOff, MessageSquare, Calendar, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import { Trail, Comment, Session } from "@/types";
import { trails } from "@/data/trailsData";

const SpotDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [trail, setTrail] = useState<Trail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [userRating, setUserRating] = useState(0);
  const [sessionTitle, setSessionTitle] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [sessionTime, setSessionTime] = useState("");
  const [sessionDescription, setSessionDescription] = useState("");

  // Simuler le chargement des données depuis une API
  useEffect(() => {
    // Dans un projet réel, ce serait une requête à une API
    setLoading(true);
    const fetchedTrail = trails.find((t) => t.id === id);
    
    if (fetchedTrail) {
      // Ajout des propriétés manquantes pour la simulation
      const enhancedTrail: Trail = {
        ...fetchedTrail,
        comments: fetchedTrail.comments || [],
        sessions: fetchedTrail.sessions || [],
        contributors: fetchedTrail.contributors || [],
      };
      
      setTrail(enhancedTrail);
      
      // Vérifier si ce spot est dans les favoris de l'utilisateur
      if (currentUser && currentUser.favorites) {
        setIsFavorite(currentUser.favorites.includes(fetchedTrail.id));
      }
    }
    
    setLoading(false);
  }, [id, currentUser]);

  // Gérer l'ajout aux favoris
  const handleToggleFavorite = () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    // Dans un projet réel, ce serait une requête à une API
    setIsFavorite(!isFavorite);
    
    if (!isFavorite) {
      toast.success("Spot ajouté aux favoris");
    } else {
      toast.success("Spot retiré des favoris");
    }
  };

  // Gérer l'ajout d'un commentaire
  const handleAddComment = () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (!commentText.trim()) {
      toast.error("Le commentaire ne peut pas être vide");
      return;
    }

    if (!trail) return;

    // Créer un nouveau commentaire
    const newComment: Comment = {
      id: Date.now().toString(),
      userId: currentUser.id,
      username: currentUser.username,
      text: commentText,
      timestamp: new Date().toISOString(),
      rating: userRating || undefined,
    };

    // Dans un projet réel, ce serait une requête à une API
    const updatedTrail: Trail = {
      ...trail,
      comments: [...(trail.comments || []), newComment],
    };

    // Si l'utilisateur a donné une note, mettre à jour la note moyenne
    if (userRating > 0) {
      const totalRating = (trail.rating * trail.reviews) + userRating;
      const newReviews = trail.reviews + 1;
      updatedTrail.rating = totalRating / newReviews;
      updatedTrail.reviews = newReviews;
    }

    setTrail(updatedTrail);
    setCommentText("");
    setUserRating(0);
    toast.success("Commentaire ajouté");
  };

  // Gérer l'ajout d'une session
  const handleAddSession = () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (!sessionTitle.trim() || !sessionDate || !sessionTime) {
      toast.error("Titre, date et heure sont requis");
      return;
    }

    if (!trail) return;

    // Créer une nouvelle session
    const newSession: Session = {
      id: Date.now().toString(),
      title: sessionTitle,
      description: sessionDescription,
      date: sessionDate,
      time: sessionTime,
      createdBy: currentUser.id,
      participants: [
        {
          userId: currentUser.id,
          username: currentUser.username,
          status: "going",
        },
      ],
    };

    // Dans un projet réel, ce serait une requête à une API
    setTrail({
      ...trail,
      sessions: [...(trail.sessions || []), newSession],
    });

    // Réinitialiser le formulaire
    setSessionTitle("");
    setSessionDate("");
    setSessionTime("");
    setSessionDescription("");
    toast.success("Session ajoutée");
  };

  // Gérer la participation à une session
  const handleParticipateSession = (sessionId: string, status: "going" | "interested" | "not_going") => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (!trail) return;

    // Dans un projet réel, ce serait une requête à une API
    const updatedSessions = trail.sessions?.map((session) => {
      if (session.id === sessionId) {
        // Vérifier si l'utilisateur est déjà dans la liste des participants
        const existingParticipant = session.participants.find(
          (p) => p.userId === currentUser.id
        );

        if (existingParticipant) {
          // Mettre à jour le statut de l'utilisateur existant
          return {
            ...session,
            participants: session.participants.map((p) =>
              p.userId === currentUser.id ? { ...p, status } : p
            ),
          };
        } else {
          // Ajouter l'utilisateur à la liste des participants
          return {
            ...session,
            participants: [
              ...session.participants,
              {
                userId: currentUser.id,
                username: currentUser.username,
                status,
              },
            ],
          };
        }
      }
      return session;
    });

    setTrail({
      ...trail,
      sessions: updatedSessions,
    });

    toast.success(`Votre participation a été mise à jour`);
  };

  // Afficher un message de chargement pendant le chargement des données
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 pt-24 pb-12 flex items-center justify-center">
          <p>Chargement du spot...</p>
        </main>
      </div>
    );
  }

  // Afficher un message si le spot n'existe pas
  if (!trail) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 pt-24 pb-12 flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold mb-4">Spot introuvable</h2>
          <p className="mb-6">Le spot que vous recherchez n'existe pas ou a été supprimé.</p>
          <Button asChild>
            <Link to="/">Retour à l'accueil</Link>
          </Button>
        </main>
      </div>
    );
  }

  // Fonction pour obtenir la couleur de la difficulté
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Débutant': return 'bg-green-500';
      case 'Intermédiaire': return 'bg-blue-500';
      case 'Avancé': return 'bg-red-500';
      case 'Expert': return 'bg-black';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 pt-24 pb-12">
        {/* En-tête du spot */}
        <div className="relative h-64 md:h-96 rounded-lg overflow-hidden mb-6">
          <img
            src={trail.imageUrl}
            alt={trail.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 p-6 text-white">
            <h1 className="text-3xl font-bold mb-2">{trail.name}</h1>
            <div className="flex items-center gap-2">
              <MapPin size={16} />
              <span>{trail.location}</span>
            </div>
          </div>
          
          <div className="absolute top-4 right-4 flex gap-2">
            <span className={`px-3 py-1 rounded text-white font-medium ${getDifficultyColor(trail.difficulty)}`}>
              {trail.difficulty}
            </span>
            <span className="px-3 py-1 rounded bg-gray-700 text-white font-medium">
              {trail.trailType}
            </span>
          </div>
          
          <Button
            variant="outline"
            className={`absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm ${isFavorite ? 'text-red-500' : 'text-gray-600'}`}
            onClick={handleToggleFavorite}
          >
            {isFavorite ? <Heart fill="currentColor" size={18} /> : <Heart size={18} />}
            {isFavorite ? "Favori" : "Ajouter aux favoris"}
          </Button>
        </div>
        
        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-8">
            {/* Informations générales */}
            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-3">À propos de ce spot</h2>
                  <p className="text-gray-700">{trail.description}</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-b">
                  <div>
                    <p className="text-sm text-gray-500">Distance</p>
                    <p className="font-medium">{trail.distance} km</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Élévation</p>
                    <p className="font-medium">{trail.elevation} m</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Note</p>
                    <div className="flex items-center">
                      <Star size={16} className="text-amber-500 mr-1" fill="currentColor" />
                      <span className="font-medium">{trail.rating.toFixed(1)}</span>
                      <span className="text-xs text-gray-400 ml-1">({trail.reviews})</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="font-medium">{trail.trailType}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Vélos recommandés</h3>
                  <div className="flex flex-wrap gap-2">
                    {trail.recommendedBikes.map((bike) => (
                      <span
                        key={bike}
                        className="px-3 py-1 bg-forest-light/20 text-forest rounded-full text-sm"
                      >
                        {bike}
                      </span>
                    ))}
                  </div>
                </div>
                
                {trail.obstacles && trail.obstacles.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Obstacles</h3>
                    <ul className="space-y-2">
                      {trail.obstacles.map((obstacle, index) => (
                        <li key={index} className="bg-gray-50 p-3 rounded-md">
                          <span className="font-medium">{obstacle.type}</span>: {obstacle.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Sessions de ride */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Sessions de ride</h2>
                
                {currentUser ? (
                  <div className="mb-6 p-4 bg-gray-50 rounded-md">
                    <h3 className="text-lg font-medium mb-3">Proposer une session</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Titre</label>
                        <input
                          type="text"
                          value={sessionTitle}
                          onChange={(e) => setSessionTitle(e.target.value)}
                          placeholder="Ex: Session Descente tranquille"
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm font-medium mb-1">Date</label>
                          <input
                            type="date"
                            value={sessionDate}
                            onChange={(e) => setSessionDate(e.target.value)}
                            className="w-full p-2 border rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Heure</label>
                          <input
                            type="time"
                            value={sessionTime}
                            onChange={(e) => setSessionTime(e.target.value)}
                            className="w-full p-2 border rounded"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <Textarea
                        value={sessionDescription}
                        onChange={(e) => setSessionDescription(e.target.value)}
                        placeholder="Décrivez votre session (niveau, objectifs, etc.)"
                      />
                    </div>
                    <div className="text-right">
                      <Button onClick={handleAddSession}>
                        <Calendar size={16} className="mr-2" /> Proposer cette session
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 p-4 bg-gray-50 rounded-md text-center">
                    <p className="mb-2">Connectez-vous pour proposer une session de ride</p>
                    <Button asChild>
                      <Link to="/login">Se connecter</Link>
                    </Button>
                  </div>
                )}
                
                {trail.sessions && trail.sessions.length > 0 ? (
                  <div className="space-y-4">
                    {trail.sessions.map((session) => (
                      <div key={session.id} className="border rounded-md p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold">{session.title}</h3>
                            <div className="flex items-center text-gray-600 text-sm mt-1">
                              <Calendar size={14} className="mr-1" />
                              {new Date(session.date).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })} à {session.time}
                            </div>
                          </div>
                          {currentUser && (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className={
                                  session.participants.some(
                                    (p) => p.userId === currentUser.id && p.status === "going"
                                  )
                                    ? "bg-green-500 text-white hover:bg-green-600"
                                    : ""
                                }
                                onClick={() => handleParticipateSession(session.id, "going")}
                              >
                                J'y vais ({session.participants.filter((p) => p.status === "going").length})
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className={
                                  session.participants.some(
                                    (p) => p.userId === currentUser.id && p.status === "interested"
                                  )
                                    ? "bg-blue-500 text-white hover:bg-blue-600"
                                    : ""
                                }
                                onClick={() => handleParticipateSession(session.id, "interested")}
                              >
                                Intéressé ({session.participants.filter((p) => p.status === "interested").length})
                              </Button>
                            </div>
                          )}
                        </div>
                        {session.description && (
                          <p className="mt-2 text-gray-600">{session.description}</p>
                        )}
                        {session.participants.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium">Participants:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {session.participants.filter((p) => p.status === "going").map((p) => (
                                <span key={p.userId} className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                  {p.username}
                                </span>
                              ))}
                              {session.participants.filter((p) => p.status === "interested").map((p) => (
                                <span key={p.userId} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                  {p.username}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Aucune session n'a encore été proposée pour ce spot.</p>
                )}
              </CardContent>
            </Card>
            
            {/* Commentaires */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">
                  Commentaires et avis
                  {trail.comments && trail.comments.length > 0 && (
                    <span className="ml-2 text-gray-500 text-lg">({trail.comments.length})</span>
                  )}
                </h2>
                
                {currentUser ? (
                  <div className="mb-6 bg-gray-50 p-4 rounded-md">
                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-1">Votre avis</label>
                      <Textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Partagez votre expérience..."
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="mr-2">Note:</span>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setUserRating(star)}
                            className="text-2xl focus:outline-none"
                          >
                            <Star
                              size={20}
                              className={star <= userRating ? "text-amber-500" : "text-gray-300"}
                              fill={star <= userRating ? "currentColor" : "none"}
                            />
                          </button>
                        ))}
                      </div>
                      <Button onClick={handleAddComment}>
                        <MessageSquare size={16} className="mr-2" /> Commenter
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 p-4 bg-gray-50 rounded-md text-center">
                    <p className="mb-2">Connectez-vous pour laisser un commentaire</p>
                    <Button asChild>
                      <Link to="/login">Se connecter</Link>
                    </Button>
                  </div>
                )}
                
                {trail.comments && trail.comments.length > 0 ? (
                  <div className="space-y-4">
                    {trail.comments.map((comment) => (
                      <div key={comment.id} className="border-b last:border-b-0 pb-4 last:pb-0">
                        <div className="flex justify-between">
                          <p className="font-medium">{comment.username}</p>
                          <span className="text-sm text-gray-500">
                            {new Date(comment.timestamp).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        {comment.rating && (
                          <div className="flex my-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={14}
                                className={star <= comment.rating! ? "text-amber-500" : "text-gray-300"}
                                fill={star <= comment.rating! ? "currentColor" : "none"}
                              />
                            ))}
                          </div>
                        )}
                        <p className="mt-1 text-gray-700">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Aucun commentaire pour le moment. Soyez le premier à partager votre expérience!</p>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Colonne latérale */}
          <div className="space-y-6">
            {/* Carte (placeholder) */}
            <Card>
              <CardContent className="p-0 h-64">
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <p className="text-gray-400">Carte du spot</p>
                </div>
              </CardContent>
            </Card>
            
            {/* Contributeurs */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">Contributeurs</h3>
                
                {trail.contributors && trail.contributors.length > 0 ? (
                  <div className="space-y-3">
                    {trail.contributors.map((contributor, index) => (
                      <div key={index} className="text-sm">
                        <p>
                          <span className="font-medium">{contributor.username}</span> a{" "}
                          {contributor.action === "created" && "créé ce spot"}
                          {contributor.action === "edited" && "modifié ce spot"}
                          {contributor.action === "added_photo" && "ajouté une photo"}
                          {contributor.action === "reported" && "signalé un problème"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(contributor.timestamp).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Information non disponible</p>
                )}
              </CardContent>
            </Card>
            
            {/* Signaler un problème */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-2">Signaler un problème</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Ce spot contient des informations incorrectes ou inappropriées?
                </p>
                <Button variant="outline" className="w-full">
                  Signaler ce spot
                </Button>
              </CardContent>
            </Card>
            
            {/* Proposer une modification */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-2">Proposer une modification</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Aidez la communauté en améliorant les informations de ce spot.
                </p>
                <Button variant="outline" className="w-full">
                  Proposer une modification
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-900 text-white/70 py-6">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} Trail Mosaic. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
};

export default SpotDetail;
