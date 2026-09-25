/* ============================================================
   API LAYER — talks to the Express + SQLite backend in /backend.
   Change API_BASE if it runs somewhere else.
   ============================================================ */

const API_BASE = "http://localhost:3001/api";

async function apiFetch(path, { method = "GET", token, body } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new Error(
      "Could not reach the Saan server. Is it running on http://localhost:3001? (npm start in /backend)"
    );
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  signup: (email, password, name) => apiFetch("/auth/signup", { method: "POST", body: { email, password, name } }),
  login: (email, password) => apiFetch("/auth/login", { method: "POST", body: { email, password } }),
  me: (token) => apiFetch("/auth/me", { token }),

  spots: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.category && params.category !== "All") qs.set("category", params.category);
    if (params.q) qs.set("q", params.q);
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return apiFetch(`/spots${suffix}`);
  },
  spot: (id) => apiFetch(`/spots/${id}`),

  plans: (token) => apiFetch("/plans", { token }),
  plan: (id, token) => apiFetch(`/plans/${id}`, { token }),
  createPlan: (title, token) => apiFetch("/plans", { method: "POST", token, body: { title } }),
  updatePlanTitle: (id, title, token) => apiFetch(`/plans/${id}`, { method: "PUT", token, body: { title } }),
  addSpotToPlan: (planId, spotId, token) =>
    apiFetch(`/plans/${planId}/spots`, { method: "POST", token, body: { spotId } }),
  removeSpotFromPlan: (planId, spotId, token) =>
    apiFetch(`/plans/${planId}/spots/${spotId}`, { method: "DELETE", token }),
  reorderPlan: (planId, spotIds, token) =>
    apiFetch(`/plans/${planId}/reorder`, { method: "PUT", token, body: { spotIds } }),
};
