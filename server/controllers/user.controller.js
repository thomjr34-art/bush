import bcrypt    from "bcryptjs";
import jwt       from "jsonwebtoken";
import UserModel from "../models/user.model.js";

const JWT_SECRET  = process.env.JWT_SECRET || "bush_dev_secret_change_in_prod";
const JWT_EXPIRES = "7d"; // 7 jours, simple

// ── POST /api/users/register ─────────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { nom, email, mot_de_passe } = req.body;
    if (!nom || !email || !mot_de_passe) {
      return res.status(400).json({ error: "Tous les champs sont obligatoires." });
    }
    if (mot_de_passe.length < 6) {
      return res.status(400).json({ error: "Mot de passe trop court (6 caractères min)." });
    }
    const existing = await UserModel.getByEmail(email);
    if (existing.rows.length) {
      return res.status(409).json({ error: "Cet email est déjà utilisé." });
    }
    const hash   = await bcrypt.hash(mot_de_passe, 10);
    const result = await UserModel.create({ nom, email, mot_de_passe: hash });
    const user   = result.rows[0];
    const token  = jwt.sign(
      { id: user.id, role: user.role, nom: user.nom },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );
    res.status(201).json({ token, user });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Erreur lors de la création du compte." });
  }
};

// ── POST /api/users/login ────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;
    if (!email || !mot_de_passe) {
      return res.status(400).json({ error: "Email et mot de passe requis." });
    }
    const result = await UserModel.getByEmail(email);
    if (!result.rows.length) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect." });
    }
    const user  = result.rows[0];
    const valid = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!valid) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect." });
    }
    const token = jwt.sign(
      { id: user.id, role: user.role, nom: user.nom },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );
    res.json({
      token,
      user: { id: user.id, nom: user.nom, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Erreur de connexion." });
  }
};

// ── GET /api/users/me ────────────────────────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    const result = await UserModel.getById(req.user.id);
    if (!result.rows.length) return res.status(404).json({ error: "Utilisateur introuvable." });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Progression ──────────────────────────────────────────────────────────────
export const updateProgression = async (req, res) => {
  try {
    const { workshop_id, statut } = req.body;
    await UserModel.updateProgression(req.user.id, workshop_id, statut);
    res.json({ message: "Progression mise à jour." });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getProgression = async (req, res) => {
  try {
    const result = await UserModel.getProgression(req.user.id);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
