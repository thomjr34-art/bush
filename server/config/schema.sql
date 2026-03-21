-- AfricaDev Hub — Schéma PostgreSQL v2
-- Bush — Schéma PostgreSQL v2

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Domaines thématiques ────────────────────────────────────────────────────
CREATE TABLE domaines (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom         VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icone       VARCHAR(50),
  ordre       INTEGER DEFAULT 0,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- ─── Langages de programmation ──────────────────────────────────────────────
CREATE TABLE langages (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom        VARCHAR(50) NOT NULL UNIQUE,
  couleur    VARCHAR(10),
  icone      VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ─── Utilisateurs ────────────────────────────────────────────────────────────
CREATE TABLE users (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom          VARCHAR(100) NOT NULL,
  email        VARCHAR(150) NOT NULL UNIQUE,
  mot_de_passe TEXT NOT NULL,
  role         VARCHAR(20) DEFAULT 'etudiant'
                 CHECK (role IN ('etudiant', 'admin')),
  created_at   TIMESTAMP DEFAULT NOW()
);

-- ─── Projets / Workshops ─────────────────────────────────────────────────────
-- Un projet peut avoir :
--   • un PDF uploadé (pdf_url)
--   • un contenu rédigé dans l'éditeur (contenu JSON structuré)
--   • ou les deux
CREATE TABLE workshops (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titre         VARCHAR(200) NOT NULL,
  description   TEXT,

  -- Contenu éditeur riche (JSON : sections, étapes, code blocks...)
  contenu       JSONB,

  -- PDF uploadé
  pdf_url       VARCHAR(500),
  pdf_nom       VARCHAR(200),

  -- Classement
  langages      VARCHAR(50)[],          -- ex: ARRAY['Python', 'C']
  domaine_id    UUID REFERENCES domaines(id) ON DELETE SET NULL,
  niveau        VARCHAR(20) DEFAULT 'debutant'
                  CHECK (niveau IN ('debutant', 'intermediaire', 'avance')),

  -- Meta
  auteur_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  duree_heures  INTEGER DEFAULT 1,
  publie        BOOLEAN DEFAULT FALSE,  -- false = brouillon, true = visible
  vues          INTEGER DEFAULT 0,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

-- ─── Progression des étudiants ───────────────────────────────────────────────
CREATE TABLE progression (
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  workshop_id UUID REFERENCES workshops(id) ON DELETE CASCADE,
  statut      VARCHAR(20) DEFAULT 'en_cours'
                CHECK (statut IN ('en_cours', 'termine')),
  updated_at  TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, workshop_id)
);

-- ─── Index utiles ─────────────────────────────────────────────────────────────
CREATE INDEX idx_workshops_domaine  ON workshops(domaine_id);
CREATE INDEX idx_workshops_niveau   ON workshops(niveau);
CREATE INDEX idx_workshops_publie   ON workshops(publie);
CREATE INDEX idx_workshops_langages ON workshops USING GIN(langages);

-- ─── Trigger : updated_at automatique ────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_workshops_updated
  BEFORE UPDATE ON workshops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════════
-- SEEDS
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO domaines (nom, description, icone, ordre) VALUES
  ('Fondements',             'Logique, électronique, architecture CPU',      'layers',   1),
  ('Programmation',          'Procédurale, POO, paradigmes',                 'code',     2),
  ('Structures de données',  'Listes, arbres, files, tables de hachage',     'database', 3),
  ('Algorithmique',          'Tri, recherche, complexité, graphes',          'brain',    4),
  ('Systèmes',               'OS, mémoire, processus, fichiers',             'cpu',      5),
  ('Développement Web',      'HTTP, APIs, frameworks, frontend/backend',     'globe',    6),
  ('Réseaux',                'TCP/IP, sockets, protocoles applicatifs',      'network',  7),
  ('Bases de données',       'SQL, moteurs, transactions, indexation',       'server',   8),
  ('Compilation',            'Lexer, parser, AST, interpréteurs',            'terminal', 9),
  ('Sécurité',               'Crypto, exploitation, analyse de binaires',    'shield',  10);

INSERT INTO langages (nom, couleur, icone) VALUES
  ('C',           '#A8B9CC', 'c'),
  ('C++',         '#00599C', 'cpp'),
  ('Python',      '#3776AB', 'python'),
  ('JavaScript',  '#F7DF1E', 'js'),
  ('Java',        '#007396', 'java'),
  ('Go',          '#00ADD8', 'go'),
  ('Rust',        '#CE422B', 'rust'),
  ('Bash',        '#4EAA25', 'bash'),
  ('SQL',         '#336791', 'sql'),
  ('TypeScript',  '#3178C6', 'ts');

-- Admin par défaut (mot de passe: admin123) - email: admin@bush.com
INSERT INTO users (nom, email, mot_de_passe, role) VALUES
  ('Admin', 'admin@bush.com',
   '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1nERbKd',
   'admin');
