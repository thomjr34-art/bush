# AfricaDev Hub
 
Plateforme d'apprentissage par les projets pour les étudiants africains.
 
## Stack
- **Frontend** : React + Vite + Tailwind CSS
- **Backend**  : Node.js + Express (MVC)
- **Base de données** : PostgreSQL
 
## Lancer le projet
 
### 1. Base de données
```bash
createdb africadev_hub
psql africadev_hub < server/config/schema.sql
```
 
### 2. Backend
```bash
cd server
cp .env.example .env   # remplis tes variables
npm install
npm run dev            # http://localhost:5000
```
 
### 3. Frontend
```bash
cd client
npm install
npm run dev            # http://localhost:5173
```
 
## Architecture MVC
```
server/
├── controllers/   ← logique métier
├── models/        ← requêtes PostgreSQL
├── routes/        ← définition des endpoints
├── middlewares/   ← auth JWT, rôles
└── config/        ← connexion DB, schema SQL
 
client/
├── pages/         ← vues principales (View)
├── components/    ← composants réutilisables
├── services/      ← appels API (axios)
├── context/       ← état global (Auth)
└── hooks/         ← hooks personnalisés
```
