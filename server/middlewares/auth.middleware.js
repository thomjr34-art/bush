import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "bush_dev_secret_change_in_prod";

export const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token manquant." });
  }
  try {
    req.user = jwt.verify(header.split(" ")[1], JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Token invalide ou expiré." });
  }
};

export const adminMiddleware = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Accès admin requis." });
  }
  next();
};
