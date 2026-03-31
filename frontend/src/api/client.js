const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    throw new Error(body?.message || "API request failed");
  }

  return body;
}

export function withAuth(token, options = {}) {
  return {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`
    }
  };
}

export const apiClient = {
  get: (path, options) => request(path, { method: "GET", ...options }),
  post: (path, data, options) =>
    request(path, {
      method: "POST",
      body: JSON.stringify(data),
      ...options
    }),
  patch: (path, data, options) =>
    request(path, {
      method: "PATCH",
      body: JSON.stringify(data),
      ...options
    }),
  put: (path, data, options) =>
    request(path, {
      method: "PUT",
      body: JSON.stringify(data),
      ...options
    }),
  delete: (path, options) => request(path, { method: "DELETE", ...options })
};
