const API_BASE = `${import.meta.env.VITE_API_BASE || ""}/api`;
const REQUEST_CACHE = new Map();
const IN_FLIGHT_REQUESTS = new Map();
const DEFAULT_CACHE_TTL = 30_000;

function buildUrl(path) {
  return `${API_BASE}${path}`;
}

function getCacheKey(path, { method = "GET", token, body } = {}) {
  const normalizedBody = body === undefined ? "" : JSON.stringify(body);
  return `${method.toUpperCase()}|${token || ""}|${path}|${normalizedBody}`;
}

function invalidateMatchingCache(path) {
  const normalizedPath = path.split("?")[0];
  const topLevelSegment = normalizedPath.split("/").filter(Boolean)[0];

  for (const cacheKey of REQUEST_CACHE.keys()) {
    const cachedPath = cacheKey.split("|")[2].split("?")[0];
    const cachedTopLevelSegment = cachedPath.split("/").filter(Boolean)[0];

    if (
      cachedPath === normalizedPath ||
      cachedPath.startsWith(`${normalizedPath}/`) ||
      cachedTopLevelSegment === topLevelSegment
    ) {
      REQUEST_CACHE.delete(cacheKey);
    }
  }
}

async function apiFetch(path, { method = "GET", token, body } = {}) {
  const headers = {
    Accept: "application/json",
  };

  const requestKey = getCacheKey(path, { method, token, body });

  if (method === "GET") {
    const cached = REQUEST_CACHE.get(requestKey);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.value;
    }
    if (cached) REQUEST_CACHE.delete(requestKey);
  }

  if (IN_FLIGHT_REQUESTS.has(requestKey)) {
    return IN_FLIGHT_REQUESTS.get(requestKey);
  }

  if (body !== undefined && body !== null) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const requestPromise = (async () => {
    let res;
    try {
      res = await fetch(buildUrl(path), {
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

    if (method === "GET") {
      REQUEST_CACHE.set(requestKey, {
        value: data,
        expiresAt: Date.now() + DEFAULT_CACHE_TTL,
      });
    } else {
      invalidateMatchingCache(path);
    }

    return data;
  })();

  IN_FLIGHT_REQUESTS.set(requestKey, requestPromise);

  try {
    return await requestPromise;
  } finally {
    IN_FLIGHT_REQUESTS.delete(requestKey);
  }
}

export const api = {
  signup: (email, password, name) =>
    apiFetch("/auth/signup", { method: "POST", body: { email, password, name } }),
  login: (email, password) =>
    apiFetch("/auth/login", { method: "POST", body: { email, password } }),
  me: (token) => apiFetch("/auth/me", { token }),
  deleteAccount: (token) => apiFetch("/auth/me", { method: "DELETE", token }),

  spots: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.category && params.category !== "All") qs.set("category", params.category);
    if (params.q) qs.set("q", params.q);
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return apiFetch(`/spots${suffix}`);
  },
  spot: (id) => apiFetch(`/spots/${id}`),
  createReview: (spotId, rating, comment, token) =>
    apiFetch(`/spots/${spotId}/reviews`, { method: "POST", token, body: { rating, comment } }),
  deleteReview: (spotId, reviewId, token) =>
    apiFetch(`/spots/${spotId}/reviews/${reviewId}`, { method: "DELETE", token }),

  plans: (token) => apiFetch("/plans", { token }),
  plan: (id, token) => apiFetch(`/plans/${id}`, { token }),
  deletePlan: (id, token) => apiFetch(`/plans/${id}`, { method: "DELETE", token }),
  createPlan: (title, token) => apiFetch("/plans", { method: "POST", token, body: { title } }),
  updatePlanTitle: (id, title, token) =>
    apiFetch(`/plans/${id}`, { method: "PUT", token, body: { title } }),
  addSpotToPlan: (planId, spotId, token) =>
    apiFetch(`/plans/${planId}/spots`, { method: "POST", token, body: { spotId } }),
  removeSpotFromPlan: (planId, spotId, token) =>
    apiFetch(`/plans/${planId}/spots/${spotId}`, { method: "DELETE", token }),
  reorderPlan: (planId, spotIds, token) =>
    apiFetch(`/plans/${planId}/reorder`, { method: "PUT", token, body: { spotIds } }),
  sharePlan: (planId, token) => apiFetch(`/plans/${planId}/share`, { method: "POST", token }),
  unsharePlan: (planId, token) => apiFetch(`/plans/${planId}/share`, { method: "DELETE", token }),
  sharedPlan: (shareToken) => apiFetch(`/shared/${encodeURIComponent(shareToken)}`),
  clearCache: () => {
    REQUEST_CACHE.clear();
    IN_FLIGHT_REQUESTS.clear();
  },
};
