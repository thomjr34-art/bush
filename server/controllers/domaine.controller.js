import DomaineModel from "../models/domaine.model.js";
export const getAllDomaines = async (_req, res) => {
  try { res.json((await DomaineModel.getAll()).rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
};
export const createDomaine = async (req, res) => {
  try { res.status(201).json((await DomaineModel.create(req.body)).rows[0]); }
  catch (err) { res.status(500).json({ error: err.message }); }
};
