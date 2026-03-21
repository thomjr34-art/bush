import pool from "../config/db.js";

const UserModel = {
  getById:    (id)    => pool.query(
    "SELECT id, nom, email, role, created_at FROM users WHERE id = $1", [id]
  ),
  getByEmail: (email) => pool.query(
    "SELECT * FROM users WHERE email = $1", [email]
  ),
  create: (data) => pool.query(
    `INSERT INTO users (nom, email, mot_de_passe, role)
     VALUES ($1, $2, $3, $4) RETURNING id, nom, email, role, created_at`,
    [data.nom, data.email, data.mot_de_passe, data.role || "etudiant"]
  ),
  updateLastLogin: (id) => pool.query(
    "UPDATE users SET last_login = NOW() WHERE id = $1", [id]
  ),

  // ── Progression ─────────────────────────────────────────────────────────
  updateProgression: (user_id, workshop_id, statut) => pool.query(
    `INSERT INTO progression (user_id, workshop_id, statut)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, workshop_id) DO UPDATE SET statut = $3, updated_at = NOW()`,
    [user_id, workshop_id, statut]
  ),
  getProgression: (user_id) => pool.query(
    "SELECT * FROM progression WHERE user_id = $1", [user_id]
  ),
};

export default UserModel;
