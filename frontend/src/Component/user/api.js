const API_BASE = "http://localhost:8000/api";

const request = async (path, options = {}) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Token ${token}` } : {}),
    },
    ...options,
  });
  if (res.status === 401 || res.status === 403) throw new Error("unauthorized");
  return res.json();
};

export const api = {
  get:   (path)       => request(path),
  post:  (path, body) => request(path, { method: "POST",  body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: "PATCH", body: JSON.stringify(body) }),
};