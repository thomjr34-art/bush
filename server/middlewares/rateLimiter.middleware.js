import rateLimit from "express-rate-limit";

// Limite les tentatives de login/register : 10 par 15 minutes par IP
export const authLimiter = rateLimit({
  windowMs:         15 * 60 * 1000,
  max:              10,
  standardHeaders:  true,
  legacyHeaders:    false,
  message: { error: "Trop de tentatives. Réessaie dans 15 minutes." },
  skipSuccessfulRequests: true, // ne compte que les échecs
});

// Limite globale sur toute l'API : 200 req/min par IP
export const globalLimiter = rateLimit({
  windowMs:        60 * 1000,
  max:             200,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: "Trop de requêtes. Ralentis un peu." },
});
