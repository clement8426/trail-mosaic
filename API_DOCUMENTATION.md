
# Trail Mosaic - Documentation API

## À propos de Trail Mosaic

Trail Mosaic est une application communautaire dédiée aux passionnés de VTT et de sports de descente. La plateforme permet aux utilisateurs de découvrir, partager et organiser des sorties sur les meilleurs spots de VTT en France.

Ce document décrit les exigences techniques pour l'API backend qui alimentera l'application frontend Trail Mosaic.

## Architecture globale

L'architecture du système est composée de:
- **Frontend**: Application React avec Typescript, Tailwind CSS et shadcn/ui
- **Backend**: API RESTful avec authentification JWT
- **Base de données**: PostgreSQL avec schéma relationnel
- **Stockage**: Solution de stockage pour les images et les fichiers GPX

## Modèles de données

### Utilisateur (User)
```typescript
{
  id: string;
  username: string;
  email: string;
  password: string; // Hashé
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  location?: string;
  createdAt: string; // ISO date
  lastLogin: string; // ISO date
  role: "user" | "admin" | "moderator";
  preferences: {
    notificationsEnabled: boolean;
    emailNotifications: boolean;
    privacySettings: {
      showLocation: boolean;
      showActivity: boolean;
    }
  }
}
```

### Spot (Trail)
```typescript
{
  id: string;
  name: string;
  location: string;
  coordinates: [number, number]; // [longitude, latitude]
  description: string;
  imageUrl: string;
  distance: number; // en km
  elevation: number; // en mètres
  difficulty: "Débutant" | "Intermédiaire" | "Avancé" | "Expert";
  trailType: "Descente" | "Terrain de bosses" | "Bosses à tricks";
  recommendedBikes: Array<"BMX" | "Semi-rigide" | "Tout-suspendu">;
  obstacles: Array<{
    type: string; // "Bosse", "Virage serré", "Saut", "Gap", "Drop", "Northshore", "Rock garden"
    description: string;
  }>;
  rating: number; // Note moyenne
  reviews: number; // Nombre d'avis
  region: string; // Région administrative
  gpxTrack?: string; // URL vers le fichier GPX
  createdBy: string; // ID utilisateur
  createdAt: string; // ISO date
  updatedAt?: string; // ISO date
  contributors: Array<{
    userId: string;
    username: string;
    action: "created" | "edited" | "validated";
    timestamp: string; // ISO date
  }>;
}
```

### Événement (Event)
```typescript
{
  id: string;
  title: string;
  description: string;
  date: string; // ISO date
  time?: string;
  endDate?: string; // Pour les événements multi-jours
  location: string;
  coordinates: [number, number]; // [longitude, latitude]
  imageUrl: string;
  category: string; // "Compétition", "Formation", "Rassemblement", etc.
  trailId?: string; // ID du spot associé (optionnel)
  region: string;
  organizerId: string; // ID utilisateur
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  registrationUrl?: string;
  registrationDeadline?: string;
  maxParticipants?: number;
  price?: number;
  createdAt: string;
  updatedAt?: string;
  participants?: Array<{
    userId: string;
    username: string;
    status: "registered" | "interested" | "attending";
  }>;
}
```

### Session
```typescript
{
  id: string;
  title: string;
  description: string;
  date: string; // ISO date
  time: string;
  duration?: number; // en minutes
  trailId: string; // ID du spot
  createdBy: string; // ID utilisateur
  createdAt: string;
  updatedAt?: string;
  status: "planned" | "completed" | "cancelled";
  participants: Array<{
    userId: string;
    username: string;
    status: "going" | "interested" | "not going";
    joinedAt: string;
  }>;
  visibility: "public" | "private" | "friends";
  comments?: Array<{
    userId: string;
    username: string;
    text: string;
    timestamp: string;
  }>;
}
```

### Avis (Review)
```typescript
{
  id: string;
  trailId: string;
  userId: string;
  username: string;
  rating: number; // 1-5
  text: string;
  imageUrls?: string[];
  createdAt: string;
  updatedAt?: string;
  likes: number;
  usersWhoLiked?: string[]; // IDs utilisateurs
}
```

### Notification
```typescript
{
  id: string;
  userId: string;
  type: "session_invite" | "event_reminder" | "new_review" | "new_follower" | "trail_update";
  title: string;
  message: string;
  relatedId?: string; // ID du contenu lié (spot, événement, session)
  relatedType?: "trail" | "event" | "session" | "user";
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}
```

## Points d'API Requis

### Authentification

| Méthode | Endpoint              | Description                   | Corps de requête                            | Réponse                                 |
|---------|----------------------|-------------------------------|-------------------------------------------|----------------------------------------|
| POST    | /api/auth/register    | Inscription                   | `{username, email, password, displayName}` | `{user, token}`                         |
| POST    | /api/auth/login       | Connexion                     | `{email, password}`                        | `{user, token}`                         |
| POST    | /api/auth/logout      | Déconnexion                   | -                                         | `{success: true}`                       |
| POST    | /api/auth/reset-password | Demande de réinitialisation | `{email}`                                  | `{success: true, message}`              |
| PUT     | /api/auth/reset-password/:token | Réinitialisation du mot de passe | `{password, confirmPassword}` | `{success: true, message}`              |
| GET     | /api/auth/me          | Informations utilisateur      | -                                         | `{user}`                                |
| PUT     | /api/auth/me          | Mise à jour du profil         | `{displayName, bio, etc.}`                | `{user}`                                |

### Trails (Spots)

| Méthode | Endpoint              | Description                     | Corps de requête      | Réponse             |
|---------|----------------------|--------------------------------|---------------------|-------------------|
| GET     | /api/trails           | Liste des spots                 | (filtres en query params) | `{trails: Trail[]}` |
| GET     | /api/trails/:id       | Détail d'un spot                | -                   | `{trail: Trail}`    |
| POST    | /api/trails           | Créer un spot                   | `Trail`             | `{trail: Trail}`    |
| PUT     | /api/trails/:id       | Modifier un spot                | `Partial<Trail>`    | `{trail: Trail}`    |
| DELETE  | /api/trails/:id       | Supprimer un spot               | -                   | `{success: true}`   |
| POST    | /api/trails/:id/reviews | Ajouter un avis                | `Review`            | `{review: Review}`  |
| GET     | /api/trails/:id/reviews | Avis d'un spot                 | -                   | `{reviews: Review[]}` |
| GET     | /api/trails/regions   | Liste des régions avec count    | -                   | `{regions: {name: string, count: number}[]}` |

### Événements

| Méthode | Endpoint              | Description                     | Corps de requête      | Réponse             |
|---------|----------------------|--------------------------------|---------------------|-------------------|
| GET     | /api/events           | Liste des événements            | (filtres en query params) | `{events: Event[]}` |
| GET     | /api/events/:id       | Détail d'un événement           | -                   | `{event: Event}`    |
| POST    | /api/events           | Créer un événement              | `Event`             | `{event: Event}`    |
| PUT     | /api/events/:id       | Modifier un événement           | `Partial<Event>`    | `{event: Event}`    |
| DELETE  | /api/events/:id       | Supprimer un événement          | -                   | `{success: true}`   |
| POST    | /api/events/:id/participants | Participer à un événement      | `{status}`          | `{success: true}`   |

### Sessions

| Méthode | Endpoint              | Description                     | Corps de requête      | Réponse             |
|---------|----------------------|--------------------------------|---------------------|-------------------|
| GET     | /api/sessions         | Liste des sessions              | (filtres en query params) | `{sessions: Session[]}` |
| GET     | /api/sessions/:id     | Détail d'une session            | -                   | `{session: Session}` |
| POST    | /api/sessions         | Créer une session               | `Session`           | `{session: Session}` |
| PUT     | /api/sessions/:id     | Modifier une session            | `Partial<Session>`  | `{session: Session}` |
| DELETE  | /api/sessions/:id     | Supprimer une session           | -                   | `{success: true}`   |
| POST    | /api/sessions/:id/participants | Rejoindre une session        | `{status}`          | `{success: true}`   |
| POST    | /api/sessions/:id/comments | Ajouter un commentaire        | `{text}`            | `{comment}`         |

### Notifications

| Méthode | Endpoint              | Description                     | Corps de requête      | Réponse             |
|---------|----------------------|--------------------------------|---------------------|-------------------|
| GET     | /api/notifications    | Notifications de l'utilisateur  | -                   | `{notifications: Notification[]}` |
| PUT     | /api/notifications/:id | Marquer comme lue               | -                   | `{success: true}`   |
| PUT     | /api/notifications/read-all | Tout marquer comme lu           | -                   | `{success: true}`   |
| DELETE  | /api/notifications/:id | Supprimer une notification      | -                   | `{success: true}`   |

### Upload de fichiers

| Méthode | Endpoint              | Description                     | Corps de requête      | Réponse             |
|---------|----------------------|--------------------------------|---------------------|-------------------|
| POST    | /api/upload/image     | Upload d'image                  | `FormData` avec image | `{url: string}`     |
| POST    | /api/upload/gpx       | Upload de fichier GPX           | `FormData` avec fichier | `{url: string}`     |

## Exigences techniques

### Authentification et Sécurité
- Authentification JWT (JSON Web Token)
- Validation des données côté serveur
- Protection CSRF
- Rate limiting pour les endpoints sensibles
- Validation des permissions (seuls les créateurs ou administrateurs peuvent modifier/supprimer)

### Fonctionnalités avancées
- Recherche par proximité géographique (utiliser PostGIS)
- Filtrage avancé des spots (difficulté, type, région, etc.)
- Support pour les fichiers GPX (parcours)
- Système de notifications en temps réel (WebSockets)
- Système d'évaluation et d'avis
- Support multi-langue (français par défaut)

### Considérations techniques
- API RESTful ou GraphQL
- CORS configuré pour le domaine frontend
- Documentation OpenAPI/Swagger
- Tests unitaires et d'intégration
- Monitoring et logging
- Cache pour les requêtes fréquentes
- Support pour la pagination et le lazy loading

## Mise en production
- CI/CD pour déploiement automatisé
- Environnements de développement, staging et production
- Surveillance des performances
- Sauvegarde régulière des données
- Plan de reprise après sinistre

## Étapes de développement recommandées

1. Mise en place de l'infrastructure et de la base de données
2. Développement du système d'authentification
3. Implémentation des CRUD pour les spots (trails)
4. Développement des fonctionnalités d'événements et de sessions
5. Implémentation du système de notifications
6. Intégration des fonctionnalités géospatiales
7. Optimisation des performances et mise en cache
8. Tests et déploiement

## Notes importantes

Ce document sera régulièrement mis à jour pour refléter les évolutions du frontend et les nouvelles exigences fonctionnelles. L'équipe de développement backend doit se référer à la dernière version de ce document.

Pour toute question ou clarification nécessaire, veuillez contacter le responsable du projet.

---

**Version du document:** 1.0  
**Dernière mise à jour:** 04/04/2025
