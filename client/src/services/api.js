import axios from "axios";

const api = axios.create({
  baseURL:         "http://localhost:5001/api",
  withCredentials: true,
});

export const workshopService = {
  getAll:        (f)      => api.get("/workshops", { params: f }),
  getById:       (id)     => api.get(`/workshops/${id}`),
  create:        (fd)     => api.post("/workshops", fd, { headers: { "Content-Type": "multipart/form-data" } }),
  update:        (id, fd) => api.put(`/workshops/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } }),
  togglePublier: (id, p)  => api.patch(`/workshops/${id}/publier`, { publie: p }),
  delete:        (id)     => api.delete(`/workshops/${id}`),
};

export const authService = {
  login:    (d) => api.post("/users/login",    d),
  register: (d) => api.post("/users/register", d),
};

export const domaineService     = { getAll: () => api.get("/domaines") };
export const langageService     = { getAll: () => api.get("/langages") };
export const progressionService = {
  get:    ()  => api.get("/users/progression"),
  update: (d) => api.post("/users/progression", d),
};

export default api;
