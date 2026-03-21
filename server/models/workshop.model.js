import pool from "../config/db.js";

const WorkshopModel = {

  // ── Lecture ────────────────────────────────────────────────────────────────
  getAll: ({ langage, domaine_id, niveau, publie = true } = {}) => {
    let   q = `SELECT w.*, d.nom AS domaine_nom, d.icone AS domaine_icone
               FROM workshops w
               LEFT JOIN domaines d ON w.domaine_id = d.id
               WHERE 1=1`;
    const p = [];
    if (publie !== null) { p.push(publie);    q += ` AND w.publie = $${p.length}`; }
    if (langage)         { p.push(langage);   q += ` AND $${p.length} = ANY(w.langages)`; }
    if (domaine_id)      { p.push(domaine_id);q += ` AND w.domaine_id = $${p.length}`; }
    if (niveau)          { p.push(niveau);    q += ` AND w.niveau = $${p.length}`; }
    q += " ORDER BY w.created_at DESC";
    return pool.query(q, p);
  },

  getById: (id) => pool.query(
    `SELECT w.*, d.nom AS domaine_nom FROM workshops w
     LEFT JOIN domaines d ON w.domaine_id = d.id WHERE w.id = $1`, [id]
  ),

  // ── Création ───────────────────────────────────────────────────────────────
  create: (data) => pool.query(
    `INSERT INTO workshops
       (titre, description, contenu, pdf_url, pdf_nom, langages, domaine_id, niveau, auteur_id, duree_heures, publie)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     RETURNING *`,
    [ data.titre, data.description,
      data.contenu ? JSON.stringify(data.contenu) : null,
      data.pdf_url  || null,
      data.pdf_nom  || null,
      data.langages || [],
      data.domaine_id || null,
      data.niveau   || "debutant",
      data.auteur_id,
      data.duree_heures || 1,
      data.publie   ?? false,
    ]
  ),

  // ── Mise à jour ────────────────────────────────────────────────────────────
  update: (id, data) => pool.query(
    `UPDATE workshops SET
       titre=$1, description=$2, contenu=$3,
       pdf_url=$4, pdf_nom=$5, langages=$6,
       domaine_id=$7, niveau=$8, duree_heures=$9, publie=$10
     WHERE id=$11 RETURNING *`,
    [ data.titre, data.description,
      data.contenu ? JSON.stringify(data.contenu) : null,
      data.pdf_url  || null,
      data.pdf_nom  || null,
      data.langages || [],
      data.domaine_id || null,
      data.niveau,
      data.duree_heures || 1,
      data.publie ?? false,
      id,
    ]
  ),

  togglePublie: (id, publie) => pool.query(
    "UPDATE workshops SET publie=$1 WHERE id=$2 RETURNING *", [publie, id]
  ),

  delete: (id) => pool.query("DELETE FROM workshops WHERE id=$1", [id]),

  incrementVues: (id) => pool.query(
    "UPDATE workshops SET vues = vues + 1 WHERE id=$1", [id]
  ),
};

export default WorkshopModel;
