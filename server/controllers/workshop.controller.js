import WorkshopModel from "../models/workshop.model.js";
import fs            from "fs";
import path          from "path";

// ── GET /api/workshops ────────────────────────────────────────────────────
export const getAllWorkshops = async (req, res) => {
  try {
    const { langage, domaine_id, niveau } = req.query;
    // Admin voit tout, étudiant ne voit que les publiés
    const publie = req.user?.role === "admin" ? null : true;
    const result = await WorkshopModel.getAll({ langage, domaine_id, niveau, publie });
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── GET /api/workshops/:id ────────────────────────────────────────────────
export const getWorkshopById = async (req, res) => {
  try {
    const result = await WorkshopModel.getById(req.params.id);
    if (!result.rows.length) return res.status(404).json({ error: "Workshop introuvable" });
    await WorkshopModel.incrementVues(req.params.id);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── POST /api/workshops ───────────────────────────────────────────────────
// Accepte : champs JSON + éventuellement un fichier PDF (multipart)
export const createWorkshop = async (req, res) => {
  try {
    const data = { ...req.body};

    // Si un PDF a été uploadé
    if (req.file) {
      data.pdf_url = `/uploads/pdf/${req.file.filename}`;
      data.pdf_nom = req.file.originalname;
    }

    // langages peut arriver comme string JSON depuis FormData
    if (typeof data.langages === "string") {
      try { data.langages = JSON.parse(data.langages); }
      catch { data.langages = [data.langages]; }
    }

    // contenu peut arriver comme string JSON
    if (typeof data.contenu === "string" && data.contenu) {
      try { data.contenu = JSON.parse(data.contenu); }
      catch { data.contenu = null; }
    }

    data.publie = data.publie === "true" || data.publie === true;

    const result = await WorkshopModel.create(data);
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── PUT /api/workshops/:id ────────────────────────────────────────────────
export const updateWorkshop = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      // Supprimer l'ancien PDF si il existe
      const old = await WorkshopModel.getById(req.params.id);
      if (old.rows[0]?.pdf_url) {
        const oldPath = path.join(".", old.rows[0].pdf_url);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      data.pdf_url = `/uploads/pdf/${req.file.filename}`;
      data.pdf_nom = req.file.originalname;
    }
    if (typeof data.langages === "string") {
      try { data.langages = JSON.parse(data.langages); }
      catch { data.langages = [data.langages]; }
    }
    if (typeof data.contenu === "string" && data.contenu) {
      try { data.contenu = JSON.parse(data.contenu); }
      catch { data.contenu = null; }
    }
    data.publie = data.publie === "true" || data.publie === true;
    const result = await WorkshopModel.update(req.params.id, data);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── PATCH /api/workshops/:id/publier ─────────────────────────────────────
export const togglePublier = async (req, res) => {
  try {
    const result = await WorkshopModel.togglePublie(req.params.id, req.body.publie);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── DELETE /api/workshops/:id ─────────────────────────────────────────────
export const deleteWorkshop = async (req, res) => {
  try {
    const old = await WorkshopModel.getById(req.params.id);
    if (old.rows[0]?.pdf_url) {
      const oldPath = path.join(".", old.rows[0].pdf_url);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    await WorkshopModel.delete(req.params.id);
    res.json({ message: "Workshop supprimé" });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
