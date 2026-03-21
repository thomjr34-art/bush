import pool from "../config/db.js";
const LangageModel = {
  getAll:  ()   => pool.query("SELECT * FROM langages ORDER BY nom"),
  getById: (id) => pool.query("SELECT * FROM langages WHERE id = $1", [id]),
  create:  (data) => pool.query(
    "INSERT INTO langages (nom, couleur, icone) VALUES ($1,$2,$3) RETURNING *",
    [data.nom, data.couleur, data.icone]
  ),
};
export default LangageModel;
