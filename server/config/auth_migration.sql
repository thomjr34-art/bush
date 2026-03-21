-- Migration : refresh tokens + sécurité

-- Table des refresh tokens (révocables)
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  revoked    BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user   ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token  ON refresh_tokens(token);

-- Contrainte mot de passe : minimum 8 chars (côté application, pas BDD)
-- On ajoute un champ email_verified pour plus tard
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login     TIMESTAMP;

-- Auto-validation de l'admin pour éviter le blocage à la connexion
UPDATE users SET email_verified = TRUE WHERE role = 'admin';
