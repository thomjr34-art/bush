import LangageModel from "../models/langage.model.js";
export const getAllLangages = async (_req, res) => {
  try { res.json((await LangageModel.getAll()).rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
};
export const createLangage = async (req, res) => {
  try { res.status(201).json((await LangageModel.create(req.body)).rows[0]); }
  catch (err) { res.status(500).json({ error: err.message }); }
};
