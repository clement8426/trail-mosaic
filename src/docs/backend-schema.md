
# Schéma de Base de Données pour Trail Mosaic

Ce document décrit la structure de base de données recommandée pour l'API FastAPI du projet Trail Mosaic.

## Tables Principales

### 1. Users (Utilisateurs)
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    photo_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);
```

### 2. Trails (Spots/Parcours)
```sql
CREATE TABLE trails (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    longitude FLOAT NOT NULL,
    latitude FLOAT NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(255),
    distance FLOAT, -- en kilomètres
    elevation FLOAT, -- en mètres
    difficulty VARCHAR(50) CHECK (difficulty IN ('Débutant', 'Intermédiaire', 'Avancé', 'Expert')),
    trail_type VARCHAR(50) CHECK (trail_type IN ('Descente', 'Terrain de bosses', 'Bosses à tricks')),
    rating FLOAT CHECK (rating BETWEEN 0 AND 5),
    reviews_count INTEGER DEFAULT 0,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Trail Images (Images de Spots)
```sql
CREATE TABLE trail_images (
    id SERIAL PRIMARY KEY,
    trail_id INTEGER REFERENCES trails(id) ON DELETE CASCADE,
    url VARCHAR(255) NOT NULL,
    uploaded_by INTEGER REFERENCES users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 4. RecommendedBikes (Vélos Recommandés)
```sql
CREATE TABLE recommended_bikes (
    trail_id INTEGER REFERENCES trails(id) ON DELETE CASCADE,
    bike_type VARCHAR(50) CHECK (bike_type IN ('BMX', 'Semi-rigide', 'Tout-suspendu')),
    PRIMARY KEY (trail_id, bike_type)
);
```

### 5. Obstacles
```sql
CREATE TABLE obstacles (
    id SERIAL PRIMARY KEY,
    trail_id INTEGER REFERENCES trails(id) ON DELETE CASCADE,
    type VARCHAR(50) CHECK (type IN ('Bosse', 'Virage serré', 'Saut', 'Gap', 'Drop', 'Northshore', 'Rock garden')),
    description TEXT NOT NULL
);
```

### 6. Comments (Commentaires)
```sql
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    trail_id INTEGER REFERENCES trails(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    text TEXT NOT NULL,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 7. Events (Événements)
```sql
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    location VARCHAR(255) NOT NULL,
    longitude FLOAT NOT NULL,
    latitude FLOAT NOT NULL,
    image_url VARCHAR(255),
    category VARCHAR(50) CHECK (category IN ('Compétition', 'Rassemblement', 'Formation')),
    trail_id INTEGER REFERENCES trails(id) ON DELETE SET NULL,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 8. Sessions (Sessions de Ride)
```sql
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    trail_id INTEGER REFERENCES trails(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 9. SessionParticipants (Participants aux Sessions)
```sql
CREATE TABLE session_participants (
    session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    status VARCHAR(50) CHECK (status IN ('going', 'interested', 'not_going')),
    PRIMARY KEY (session_id, user_id)
);
```

### 10. Favorites (Favoris)
```sql
CREATE TABLE favorites (
    user_id INTEGER REFERENCES users(id),
    trail_id INTEGER REFERENCES trails(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, trail_id)
);
```

### 11. TrailModifications (Modifications de Spots)
```sql
CREATE TABLE trail_modifications (
    id SERIAL PRIMARY KEY,
    trail_id INTEGER REFERENCES trails(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    field_name VARCHAR(100) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    status VARCHAR(50) CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);
```

### 12. ModificationVotes (Votes pour les Modifications)
```sql
CREATE TABLE modification_votes (
    modification_id INTEGER REFERENCES trail_modifications(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    vote VARCHAR(10) CHECK (vote IN ('up', 'down')),
    voted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (modification_id, user_id)
);
```

### 13. Contributors (Contributeurs)
```sql
CREATE TABLE contributors (
    id SERIAL PRIMARY KEY,
    trail_id INTEGER REFERENCES trails(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(50) CHECK (action IN ('created', 'edited', 'added_photo', 'reported')),
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 14. Notifications
```sql
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) CHECK (type IN ('session', 'contribution', 'comment', 'favorite')),
    message TEXT NOT NULL,
    trail_id INTEGER REFERENCES trails(id) ON DELETE CASCADE,
    session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Points Clés pour l'API FastAPI

1. **Authentification et Sécurité**
   - Utiliser OAuth2 avec JWT pour l'authentification
   - Implémenter des contrôles d'accès basés sur les rôles (RBAC)
   - Sécuriser toutes les routes sensibles
   - Hachage des mots de passe (avec bcrypt)

2. **Endpoints API**
   - Routes RESTful pour toutes les tables (CRUD)
   - Endpoints spéciaux pour:
     - Recherche géographique (trouver des spots par proximité)
     - Filtrage avancé des spots (par difficulté, type, etc.)
     - Système de vote et de modération des modifications
     - Gestion des sessions et des participants
     - Système de notification en temps réel

3. **Géocodage et Recherche Spatiale**
   - Utiliser PostGIS pour les requêtes spatiales
   - Intégrer l'API Mapbox pour le géocodage inverse
   - Calcul de distances et de proximité

4. **Stockage de Fichiers**
   - Système de stockage pour les images de spots et d'événements
   - Validation des types de fichiers et redimensionnement des images

5. **Validation des Données**
   - Valider toutes les entrées utilisateur (Pydantic)
   - Définir des schémas de validation pour toutes les routes

6. **Traitement Asynchrone**
   - File de traitement pour les notifications
   - Background jobs pour les tâches périodiques

## Exemple de Structure de l'API

```
/api
  /auth
    POST /login           # Connexion utilisateur
    POST /register        # Inscription utilisateur
    POST /refresh-token   # Rafraîchir le token JWT
  /users
    GET /me               # Profil de l'utilisateur connecté
    GET /{id}             # Profil utilisateur public
    PUT /me               # Mettre à jour son profil
  /trails
    GET /                 # Liste des spots (avec filtres)
    POST /                # Créer un nouveau spot
    GET /nearby           # Spots à proximité (géolocalisation)
    GET /{id}             # Détails d'un spot
    PUT /{id}             # Mettre à jour un spot
    POST /{id}/images     # Ajouter des images à un spot
  /modifications
    GET /trail/{id}       # Modifications proposées pour un spot
    POST /trail/{id}      # Proposer une modification
    POST /{id}/vote       # Voter pour une modification
  /events
    GET /                 # Liste des événements
    POST /                # Créer un événement
    GET /nearby           # Événements à proximité
  /sessions
    GET /trail/{id}       # Sessions pour un spot
    POST /trail/{id}      # Proposer une session
    PUT /{id}/participate # Participer à une session
  /favorites
    GET /                 # Liste des favoris de l'utilisateur
    POST /{id}            # Ajouter un spot aux favoris
    DELETE /{id}          # Retirer un spot des favoris
  /notifications
    GET /                 # Liste des notifications
    PUT /{id}/read        # Marquer comme lu
```

## Recommandations Techniques

1. **Framework FastAPI**
   - Utiliser les dépendances FastAPI pour l'injection
   - Tirer parti d'SQLAlchemy pour l'ORM
   - Utiliser Alembic pour les migrations de base de données

2. **Performance**
   - Pagination pour toutes les listes
   - Mise en cache avec Redis pour les données fréquemment accédées
   - Indexation appropriée des champs de recherche courants

3. **Tests**
   - Tests unitaires pour la logique métier
   - Tests d'intégration pour les endpoints API
   - Tests automatisés avec GitHub Actions

4. **Déploiement**
   - Conteneurisation avec Docker
   - Configuration CI/CD
   - Surveillance et journalisation
