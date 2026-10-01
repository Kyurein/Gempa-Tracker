const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const TOKEN_KEY = "gempa_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY));

async function request(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `The API returned ${res.status}`);
  return data;
}

export const getEarthquakes = ({ minMag = 0 } = {}) =>
  request(`/api/earthquakes?minMag=${minMag}&limit=500`);

export const register = (email, password) =>
  request("/api/auth/register", { method: "POST", body: { email, password } });
export const login = (email, password) =>
  request("/api/auth/login", { method: "POST", body: { email, password } });
export const getMe = () => request("/api/auth/me");

export const getPlaces = () => request("/api/me/locations");
export const addPlace = (place) => request("/api/me/locations", { method: "POST", body: place });
export const deletePlace = (id) => request(`/api/me/locations/${id}`, { method: "DELETE" });
export const getNearby = (days = 30) => request(`/api/me/nearby?days=${days}`);
