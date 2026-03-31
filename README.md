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
7. [Compilateur & Terminal interactif](#compilateur--terminal-interactif)
8. [Flux d'une requête de bout en bout](#flux)
9. [Débogage — où chercher quand ça plante](#débogage)
10. [Installation et lancement](#installation)
11. [Commandes utiles](#commandes)

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
| Exécution de code | child_process (Node.js natif) | Exécution locale des programmes |
| Terminal interactif | WebSocket (`ws`) | Communication bidirectionnelle temps réel |

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
  Express (index.js · :5001)
        │
        ├── CORS
        ├── express.json()
        ├── /uploads (fichiers PDF statiques)
        ├── WebSocket Server (ws://localhost:5001/ws/run)  ← NOUVEAU
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
            ↑ JSON → Controller → Express → React → Affichage
```

### Schéma des composants React

```
App.jsx
├── StudentLayout
│   ├── Navbar.jsx                    ← lien Playground ajouté
│   └── Pages
│       ├── Home.jsx
│       ├── Workshops.jsx
│       │   └── WorkshopCard.jsx
│       ├── WorkshopDetail.jsx        ← Terminal intégré si activé
│       │   └── Terminal.jsx          ← NOUVEAU — éditeur + terminal interactif
│       ├── Playground.jsx            ← NOUVEAU — page dédiée /playground
│       │   └── Terminal.jsx
│       ├── Parcours.jsx
│       └── CreateProject.jsx         ← option compilateur ajoutée (étape 1)
│
└── AdminLayout (route /admin)
    ├── AdminDashboard.jsx
    ├── AdminWorkshops.jsx
    └── AdminWorkshopForm.jsx
```

---

## Structure des fichiers

```
bush/
│
├── client/                              # Frontend React
│   ├── src/
│   │   ├── App.jsx                      # Routes principales (+ /playground)
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   └── Navbar.jsx           # + lien Playground
│   │   │   └── workshop/
│   │   │       ├── CodeBlock.jsx        # Bloc code + highlight.js
│   │   │       ├── MarkdownText.jsx     # Rendu markdown inline (+ `code`)
│   │   │       ├── WorkshopContent.jsx  # Rendu sections/blocs
│   │   │       ├── Terminal.jsx         # NOUVEAU — terminal interactif WebSocket
│   │   │       └── InlineCompiler.jsx   # (remplacé par Terminal)
│   │   └── pages/
│   │       ├── Playground.jsx           # NOUVEAU — page /playground
│   │       ├── WorkshopDetail.jsx       # + Terminal si compilateur activé
│   │       └── CreateProject.jsx        # + toggle compilateur + choix langages
│
└── server/                              # Backend Express
    ├── index.js                         # + WebSocket Server sur /ws/run
    └── routes/
        └── run.routes.js                # NOUVEAU — POST /api/run (exécution one-shot)
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
  contenu      JSONB,      -- contenu structuré en sections/blocs + config compilateur
  pdf_url,
  pdf_nom,
  langages     VARCHAR[],
  domaine_id,
  niveau,                  -- debutant | intermediaire | avance
  duree_heures,
  publie       BOOLEAN,
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
        { "type": "texte",        "contenu": "Dans ce projet..." },
        { "type": "etape",        "titre": "Étape 1", "contenu": "..." },
        { "type": "code",         "langage": "python", "contenu": "print('hello')" },
        { "type": "conseil",      "contenu": "Utilise des types explicites" },
        { "type": "avertissement","contenu": "Ne pas oublier les cas limites" }
      ]
    }
  ],
  "compilateur": {
    "actif": true,
    "langages": ["python", "javascript"]
  }
}
```

> Le champ `compilateur` est **optionnel**. S'il est absent ou `actif: false`, aucun terminal n'est affiché sur le projet. Pas de migration de base de données nécessaire — il est stocké dans le champ JSONB `contenu` existant.

### Types de blocs disponibles

| Type | Description | Rendu |
|------|-------------|-------|
| `texte` | Paragraphe explicatif | Texte gris simple |
| `etape` | Étape guidée numérotée | Bordure verte gauche + titre |
| `code` | Bloc de code avec coloration | Fond noir, highlight.js, bouton Copier |
| `conseil` | Astuce ou bonne pratique | Fond bleu + icône 💡 |
| `avertissement` | Point d'attention | Fond amber + icône ⚠️ |

---

## API

### Workshops

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/workshops` | Tous les workshops publiés |
| GET | `/api/workshops?domaine_id=xxx` | Filtrer par domaine |
| GET | `/api/workshops?langage=Python` | Filtrer par langage |
| GET | `/api/workshops?niveau=avance` | Filtrer par niveau |
| GET | `/api/workshops/:id` | Détail d'un workshop |
| POST | `/api/workshops` | Créer (multipart/form-data) |
| PUT | `/api/workshops/:id` | Modifier |
| PATCH | `/api/workshops/:id/publier` | Publier / dépublier |
| DELETE | `/api/workshops/:id` | Supprimer |

### Exécution de code

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/run` | Exécution one-shot (sans stdin) |
| WS | `ws://localhost:5001/ws/run` | Terminal interactif (avec stdin) |

---

## Compilateur & Terminal interactif

### Vue d'ensemble

La plateforme permet d'exécuter du code directement dans le navigateur, **sans aucun service cloud**. Tout tourne localement sur la machine via les outils installés (Python, Node.js, GCC, Go...).

Il y a deux modes d'utilisation :

| Mode | Où | Utilisation |
|------|----|-------------|
| **Playground** | `/playground` (navbar) | Tester n'importe quel code librement |
| **Terminal intégré** | Page d'un projet | Tester le code du projet en contexte |

---

### Pourquoi WebSocket et pas HTTP classique ?

Un programme interactif comme une calculatrice attend des entrées **pendant son exécution** :

```
Programme :  "Entrer le premier nombre : "   ← il attend
Utilisateur: 42                               ← on envoie
Programme :  "Entrer le deuxième nombre : "  ← il attend encore
Utilisateur: 8                               ← on envoie
Programme :  "Résultat : 50"                 ← il affiche
```

Avec HTTP, une requête = une réponse. On ne peut pas envoyer plusieurs inputs après coup. Le WebSocket ouvre un **canal persistant bidirectionnel** : le serveur peut envoyer des données au navigateur à tout moment, et le navigateur peut envoyer des données au serveur à tout moment.

---

### Comment fonctionne le terminal — étape par étape

#### 1. L'utilisateur clique "Exécuter"

Le composant `Terminal.jsx` ouvre une connexion WebSocket vers le serveur :

```js
const ws = new WebSocket("ws://localhost:5001/ws/run");
```

#### 2. Une fois connecté, il envoie le code

```json
{ "type": "run", "language": "python", "code": "n = int(input('Nombre: '))\nprint(n * 2)" }
```

#### 3. Le serveur reçoit ce message (index.js)

Il écrit le code dans un fichier temporaire (`/tmp/run_abc123.py`) et lance le programme avec `spawn` de Node.js :

```js
const srcFile = path.join(os.tmpdir(), `run_${id}.py`);
fs.writeFileSync(srcFile, code, "utf8");

const proc = spawn("python3", ["-u", srcFile]);
```

> `-u` force Python en mode **unbuffered** — sans ça, les `print()` seraient mis en buffer et n'arriveraient pas au navigateur en temps réel.

#### 4. Le serveur relaie stdout/stderr en temps réel

```js
proc.stdout.on("data", (d) => {
  ws.send(JSON.stringify({ type: "stdout", data: d.toString() }));
});
```

Chaque fois que le programme écrit quelque chose (ex: `"Nombre: "`), le serveur l'envoie immédiatement au navigateur via WebSocket.

#### 5. Le programme attend une entrée (`input()`, `scanf`...)

Le programme est **bloqué** en attente sur `stdin`. Le serveur ne reçoit plus rien de stdout. Côté navigateur, le terminal affiche un champ de saisie jaune.

#### 6. L'utilisateur tape et appuie sur Entrée

Le navigateur envoie au serveur :

```json
{ "type": "stdin", "data": "42\n" }
```

Le serveur écrit ça sur `proc.stdin` :

```js
if (msg.type === "stdin" && proc) {
  proc.stdin.write(msg.data);
}
```

Le programme Python reçoit `"42\n"` comme si l'utilisateur l'avait tapé dans un vrai terminal.

#### 7. Le programme se termine

```js
proc.on("close", (code) => {
  ws.send(JSON.stringify({ type: "exit", code }));
  // nettoyage des fichiers temporaires
});
```

Le serveur envoie `exit 0` (succès) ou `exit 1` (erreur), le terminal affiche `─── Terminé (exit 0) ───` et ferme le channel.

---

### Langages supportés

| Langage | Commande utilisée | Prérequis |
|---------|-------------------|-----------|
| Python | `python3 -u fichier.py` | Python 3 installé |
| JavaScript | `node fichier.js` | Node.js installé |
| C | `gcc -o out fichier.c && ./out` | GCC installé |
| C++ | `g++ -o out fichier.cpp && ./out` | GCC installé |
| Bash | `bash fichier.sh` | Bash (natif macOS/Linux) |
| Go | `go run fichier.go` | Go installé |

---

### Option compilateur dans la création de projet

Lors de la création d'un projet (étape 1), le créateur peut activer un **toggle "Compilateur intégré"** et choisir les langages disponibles pour ce projet.

Cette config est sauvegardée dans le champ JSONB `contenu` :

```json
"compilateur": { "actif": true, "langages": ["python", "c"] }
```

Sur la page du projet, si `compilateur.actif === true`, le terminal est affiché en bas du contenu. Un projet de compilateur C n'en aura pas besoin — un projet de calculatrice Python oui.

---

### Formatage inline dans le texte des projets (`MarkdownText.jsx`)

Le composant `MarkdownText` gère le formatage dans les blocs de type `texte`, `etape`, `conseil`, etc. :

| Syntaxe | Rendu |
|---------|-------|
| `**texte**` | **gras** |
| `*texte*` | *italique* |
| `==texte==` | surligné jaune |
| `` `code` `` | `code inline` (fond gris, texte rose) |
| `\| col1 \| col2 \|` | tableau |

---

## Flux

Voici ce qui se passe quand un étudiant exécute du code sur un projet :

```
1. L'étudiant clique "Exécuter" dans Terminal.jsx
2. Terminal.jsx ouvre ws://localhost:5001/ws/run
3. Il envoie { type: "run", language: "python", code: "..." }
4. index.js reçoit le message via WebSocketServer
5. Il écrit le code dans /tmp/run_abc123.py
6. Il lance python3 -u /tmp/run_abc123.py via spawn()
7. Python imprime "Entrer un nombre : " → stdout
8. index.js reçoit l'event stdout → ws.send({ type: "stdout", data: "Entrer..." })
9. Terminal.jsx reçoit → affiche dans le terminal, montre le champ de saisie
10. L'utilisateur tape "42" + Entrée
11. Terminal.jsx envoie { type: "stdin", data: "42\n" }
12. index.js écrit "42\n" sur proc.stdin
13. Python reçoit l'entrée, calcule, affiche le résultat
14. index.js relaie stdout → Terminal.jsx affiche le résultat
15. Python se termine → index.js envoie { type: "exit", code: 0 }
16. Terminal.jsx affiche "─── Terminé (exit 0) ───"
17. Le fichier temporaire est supprimé
```

---

## Débogage

### Checklist quand la page est blanche

```
1. Console navigateur (F12 → Console)
   → Erreur rouge = composant React cassé

2. Network tab (F12 → Network)
   → Requête en rouge = API qui répond mal
   → 404 = route inexistante
   → 500 = erreur serveur (voir logs terminal)

3. Terminal du serveur
   → Erreur au démarrage = problème de config

4. Tester l'API directement
   curl http://localhost:5001/api/workshops
   curl -X POST http://localhost:5001/api/run \
     -H "Content-Type: application/json" \
     -d '{"language":"python","code":"print(42)"}'

5. Tester la BDD directement
   psql africadev_hub -c "SELECT * FROM workshops;"
```

### Erreurs fréquentes et solutions

| Erreur | Cause | Solution |
|--------|-------|----------|
| `EADDRINUSE :5001` | Port déjà utilisé | `kill $(lsof -t -i:5001)` |
| `role "postgres" does not exist` | Mauvais user DB | Mettre son username Mac dans `.env` |
| Terminal : "Impossible de se connecter" | Serveur non redémarré | Redémarrer le backend après modif de `index.js` |
| Pas d'input dans le terminal | Programme non interactif | Vérifier que le programme utilise `input()` / `scanf` |
| Code C ne compile pas | GCC manquant | `brew install gcc` |
| Code Go ne s'exécute pas | Go manquant | `brew install go` |

---

## Installation

### Prérequis

- Node.js v18+
- PostgreSQL installé et démarré
- npm
- Compilateurs selon les langages souhaités : `python3`, `gcc`, `go`

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

Créer `server/.env` :

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
# Tester l'API
curl http://localhost:5001/api/workshops
curl http://localhost:5001/api/domaines

# Tester l'exécution de code
curl -X POST http://localhost:5001/api/run \
  -H "Content-Type: application/json" \
  -d '{"language":"python","code":"print(\"hello\")"}'

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

---

*Bush — Faire du Cameroun la plaque tournante de l'informatique en Afrique.*
