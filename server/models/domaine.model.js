import pool from "../config/db.js";
const DomaineModel = {
  getAll:  ()   => pool.query("SELECT * FROM domaines ORDER BY nom"),
  getById: (id) => pool.query("SELECT * FROM domaines WHERE id = $1", [id]),
  create:  (data) => pool.query(
    "INSERT INTO domaines (nom, description, icone) VALUES ($1,$2,$3) RETURNING *",
    [data.nom, data.description, data.icone]
  ),
};
export default DomaineModel;
