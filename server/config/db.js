import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  host:     process.env.DB_HOST     || "localhost",
  port:     process.env.DB_PORT     || 5432,
  database: process.env.DB_NAME     || "africadev_hub",
  user:     process.env.DB_USER     || "postgres",
  password: process.env.DB_PASSWORD || "",
});

pool.connect()
  .then(() => console.log("✅ PostgreSQL connecté"))
  .catch((err) => console.error("❌ Erreur DB :", err.message));

export default pool;
