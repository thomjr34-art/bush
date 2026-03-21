# Bush — Plateforme d'apprentissage par les projets

> **Bush** (expression camerounaise) — apprendre, se former, acquérir des compétences dans les rues.

Bush est une plateforme éducative de projets guidés pas-à-pas pour les étudiants africains en informatique. L'objectif : former des développeurs capables de **construire** des outils, pas seulement de les utiliser.

---

## Table des matières

1. [Vision du projet](#vision)
2. [Stack technique](#stack)
3. [Architecture complète](#architecture)
4. [Structure des fichiers](#structure)
5. [Base de données](#base-de-données)
6. [API — Routes disponibles](#api)
7. [Flux d'une requête de bout en bout](#flux)
8. [Débogage — où chercher quand ça plante](#débogage)
9. [Installation et lancement](#installation)
10. [Commandes utiles](#commandes)

---

## Vision

Les universités africaines forment des étudiants qui **utilisent** des frameworks, mais peu qui comprennent comment ils sont construits. Bush comble ce fossé en proposant des projets concrets — écrire un compilateur, un shell, un interpréteur, une API from scratch — avec des guides détaillés pas-à-pas.

**Contraintes du contexte africain :**
- Offline-first — fonctionne sans connexion stable
- Pas de VM ni d'exécution distante — l'étudiant travaille en local
- PDF téléchargeables — accessibles sur tout appareil
- Gratuit pour les universités partenaires

---

## Stack

| Couche | Technologie | Rôle |
|--------|-------------|------|
| Frontend | React + Vite | Interface utilisateur |
| Style | Tailwind CSS | Design system |
| Recherche | Fuse.js | Recherche offline côté client |
| Backend | Node.js + Express | API REST |
| Base de données | PostgreSQL | Stockage des données |
| Upload | Multer | Gestion des PDF uploadés |
| Coloration code | highlight.js | Rendu des blocs de code |

---

## Architecture

```
Navigateur (React · :5173)
        │
        │  requête utilisateur (clic, navigation)
        ▼
  Services (axios · api.js)
        │
        │  GET /api/workshops?domaine_id=xxx
        ▼
  Vite proxy (vite.config.js)
        │
        │  redirige /api → localhost:5001
        ▼
  Express (index.js · :5001)
        │
        ├── CORS
        ├── express.json()
        ├── /uploads (fichiers PDF statiques)
        │
        ▼
  Router (workshop.routes.js)
        │
        ▼
  Controller (workshop.controller.js)
        │  logique métier, parsing des params
        ▼
  Model (workshop.model.js)
        │  requête SQL via pg Pool
        ▼
  PostgreSQL (africadev_hub)
        │
        └── retourne les données
            ↑ réponse remonte dans l'ordre inverse
            ↑ JSON → Controller → Express → Vite → React → Affichage
```

### Schéma des composants React

```
App.jsx
├── StudentLayout
│   ├── Navbar.jsx
│   └── Pages
│       ├── Home.jsx
│       ├── Workshops.jsx          ← sidebar + grille filtrée
│       │   └── Sidebar.jsx        ← filtres domaine / langage / niveau
│       │   └── WorkshopCard.jsx   ← carte projet
│       ├── WorkshopDetail.jsx     ← lecture du projet (contenu + PDF)
│       │   └── WorkshopContent.jsx ← rendu sections + blocs
│       │       └── CodeBlock.jsx  ← coloration syntaxique + copier
│       ├── Parcours.jsx
│       └── CreateProject.jsx      ← éditeur en 3 étapes
│
└── AdminLayout (route /admin)
    ├── AdminDashboard.jsx
    ├── AdminWorkshops.jsx         ← liste + publier/dépublier
    └── AdminWorkshopForm.jsx      ← créer/éditer un workshop
```

---

## Structure des fichiers

```
Africadev-hub/
│
├── client/                        # Frontend React
│   ├── src/
│   │   ├── App.jsx                # Routes principales
│   │   ├── main.jsx               # Point d'entrée React
│   │   ├── index.css              # Styles globaux + polices
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx     # Barre de navigation
│   │   │   │   └── Sidebar.jsx    # Filtres latéraux
│   │   │   └── workshop/
│   │   │       ├── CodeBlock.jsx      # Bloc code avec highlight.js
│   │   │       ├── WorkshopCard.jsx   # Carte projet
│   │   │       └── WorkshopContent.jsx # Rendu du contenu JSON
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Workshops.jsx
│   │   │   ├── WorkshopDetail.jsx
│   │   │   ├── Parcours.jsx
│   │   │   ├── CreateProject.jsx
│   │   │   └── admin/
│   │   │       ├── AdminLayout.jsx
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── AdminWorkshops.jsx
│   │   │       └── AdminWorkshopForm.jsx
│   │   └── services/
│   │       └── api.js             # Toutes les fonctions axios
│   ├── vite.config.js             # Config Vite + proxy
│   └── tailwind.config.js         # Couleurs personnalisées
│
└── server/                        # Backend Express
    ├── index.js                   # Point d'entrée serveur
    ├── config/
    │   ├── db.js                  # Connexion PostgreSQL
    │   ├── upload.js              # Config Multer (PDF)
    │   └── schema.sql             # Schéma BDD + seeds
    ├── controllers/
    │   ├── workshop.controller.js
    │   ├── domaine.controller.js
    │   └── langage.controller.js
    ├── models/
    │   ├── workshop.model.js      # Requêtes SQL workshops
    │   ├── domaine.model.js
    │   └── langage.model.js
    ├── routes/
    │   ├── workshop.routes.js
    │   ├── domaine.routes.js
    │   └── langage.routes.js
    └── uploads/
        └── pdf/                   # PDF uploadés (ignoré par git)
```

---

## Base de données

### Tables principales

```sql
-- Domaines thématiques (Algorithmique, Compilation, Réseaux...)
domaines (id, nom, description, icone, ordre, created_at)

-- Langages de programmation (C, Python, Go...)
langages (id, nom, couleur, icone, created_at)

-- Projets / Workshops
workshops (
  id, titre, description,
  contenu      JSONB,      -- contenu éditeur structuré en sections/blocs
  pdf_url,                 -- chemin vers le PDF uploadé
  pdf_nom,
  langages     VARCHAR[],  -- ex: ARRAY['C', 'Python']
  domaine_id,
  niveau,                  -- debutant | intermediaire | avance
  duree_heures,
  publie       BOOLEAN,    -- false = brouillon, true = visible
  vues,
  created_at, updated_at
)
```

### Structure du contenu JSON (champ `contenu`)

```json
{
  "sections": [
    {
      "titre": "Introduction",
      "blocs": [
        { "type": "texte", "contenu": "Dans ce projet..." },
        { "type": "etape", "titre": "Étape 1 — Lexer", "contenu": "..." },
        { "type": "code", "langage": "python", "contenu": "class Token:\n    ..." },
        { "type": "conseil", "contenu": "Utilise OCaml pour le pattern matching" },
        { "type": "avertissement", "contenu": "Ne pas oublier les cas limites" }
      ]
    }
  ]
}
```

### Types de blocs disponibles

| Type | Description | Rendu |
|------|-------------|-------|
| `texte` | Paragraphe explicatif | Texte gris simple |
| `etape` | Étape guidée numérotée | Bordure verte gauche + titre |
| `code` | Bloc de code avec coloration | Fond noir, code coloré, bouton Copier |
| `conseil` | Astuce ou bonne pratique | Fond bleu + icône 💡 |
| `avertissement` | Point d'attention | Fond amber + icône ⚠️ |

---

## API

### Workshops

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/workshops` | Tous les workshops publiés |
| GET | `/api/workshops?admin=true` | Tous (publiés + brouillons) |
| GET | `/api/workshops?domaine_id=xxx` | Filtrer par domaine |
| GET | `/api/workshops?langage=Python` | Filtrer par langage |
| GET | `/api/workshops?niveau=avance` | Filtrer par niveau |
| GET | `/api/workshops/:id` | Détail d'un workshop |
| POST | `/api/workshops` | Créer (multipart/form-data) |
| PUT | `/api/workshops/:id` | Modifier |
| PATCH | `/api/workshops/:id/publier` | Publier / dépublier |
| DELETE | `/api/workshops/:id` | Supprimer |

### Domaines & Langages

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/domaines` | Liste des domaines |
| POST | `/api/domaines` | Créer un domaine |
| GET | `/api/langages` | Liste des langages |
| POST | `/api/langages` | Créer un langage |

### Format de création d'un workshop (FormData)

```
titre          : string (obligatoire)
description    : string
domaine_id     : UUID
niveau         : debutant | intermediaire | avance
langages       : JSON string → ["C", "Python"]
duree_heures   : number
publie         : boolean string → "true" | "false"
contenu        : JSON string → { sections: [...] }
pdf            : File (application/pdf, max 50Mo)
```

---

## Flux

Voici ce qui se passe exactement quand un étudiant ouvre la page `/workshops` :

```
1. React monte le composant Workshops.jsx
2. useEffect appelle workshopService.getAll(filters)
3. axios envoie GET http://localhost:5173/api/workshops
4. Vite intercepte /api et redirige vers http://localhost:5001/api/workshops
5. Express reçoit la requête sur le router workshop.routes.js
6. Le router appelle getAllWorkshops() dans workshop.controller.js
7. Le controller appelle WorkshopModel.getAll() dans workshop.model.js
8. Le model exécute pool.query("SELECT * FROM workshops WHERE publie = true")
9. PostgreSQL retourne les lignes
10. Le model retourne result.rows au controller
11. Le controller fait res.json(result.rows)
12. La réponse JSON remonte jusqu'à React
13. setWorkshops(data) met à jour l'état
14. React re-rend la grille de WorkshopCard
```

---

## Débogage

### Checklist quand la page est blanche

```
1. Console navigateur (F12 → Console)
   → Erreur rouge = composant React cassé
   → "Cannot find module" = import manquant

2. Network tab (F12 → Network)
   → Requête en rouge = API qui répond mal
   → 404 = route inexistante
   → 500 = erreur serveur (voir logs terminal)

3. Terminal du serveur
   → Erreur au démarrage = problème de config
   → Erreur sur une requête = voir le stack trace

4. Tester l'API directement
   curl http://localhost:5001/api/workshops
   curl http://localhost:5001/api/domaines

5. Tester la BDD directement
   psql africadev_hub -c "SELECT * FROM workshops;"
   psql africadev_hub -c "SELECT * FROM domaines;"
```

### Erreurs fréquentes et solutions

| Erreur | Cause | Solution |
|--------|-------|----------|
| `EADDRINUSE :5001` | Port déjà utilisé | `kill $(lsof -t -i:5001)` |
| `role "postgres" does not exist` | Mauvais user DB | Mettre son username Mac dans `.env` |
| `Cannot access 'pg' before initialization` | Node v25 + pg | `npm install pg@8.11.3` |
| Page blanche + données chargées | Erreur JS React | Vérifier console F12 |
| `Cannot find module './AuthContext'` | Import supprimé | Nettoyer les imports |
| CORS error | URL mal configurée | Vérifier `CLIENT_URL` dans `.env` et proxy dans `vite.config.js` |

### Ajouter des logs de débogage temporaires

```js
// Dans un controller
export const getAllWorkshops = async (req, res) => {
  console.log("Query params reçus :", req.query);   // ← ajouter
  const result = await WorkshopModel.getAll(req.query);
  console.log("Nombre de résultats :", result.rows.length); // ← ajouter
  res.json(result.rows);
};

// Dans un model
getAll: (filters) => {
  console.log("Filtres SQL :", filters);  // ← ajouter
  return pool.query(q, p);
}
```

---

## Installation

### Prérequis

- Node.js v18+ (v25 fonctionne avec `pg@8.11.3`)
- PostgreSQL installé et démarré
- npm ou yarn

### 1. Démarrer PostgreSQL

```bash
brew services start postgresql@18
```

### 2. Créer la base de données

```bash
createdb africadev_hub
psql africadev_hub < server/config/schema.sql
```

### 3. Configurer l'environnement

Copier et remplir `server/.env` :

```env
PORT=5001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=africadev_hub
DB_USER=ton_username_mac
DB_PASSWORD=
```

### 4. Lancer le backend

```bash
cd server
npm install
npm run dev
# → ✅ Bush server running on http://localhost:5001
# → ✅ PostgreSQL connecté
```

### 5. Lancer le frontend

```bash
cd client
npm install
npm run dev
# → Local: http://localhost:5173
```

---

## Commandes utiles

```bash
# Voir tous les workshops en BDD
psql africadev_hub -c "SELECT id, titre, publie, niveau FROM workshops;"

# Voir les domaines
psql africadev_hub -c "SELECT * FROM domaines ORDER BY ordre;"

# Tester l'API
curl http://localhost:5001/
curl http://localhost:5001/api/workshops
curl http://localhost:5001/api/domaines

# Libérer le port 5001
kill $(lsof -t -i:5001)

# Redémarrer PostgreSQL
brew services restart postgresql@18

# Réinitialiser la BDD (attention : supprime tout)
psql postgres -c "DROP DATABASE africadev_hub;"
createdb africadev_hub
psql africadev_hub < server/config/schema.sql

# Build du frontend pour production
cd client && npm run build
```

---

## Accès admin

L'interface admin est accessible directement sans authentification à `/admin`.

Pour les futurs déploiements en production, l'authentification sera ajoutée.

---

*Bush — Faire du Cameroun la plaque tournante de l'informatique en Afrique.*
