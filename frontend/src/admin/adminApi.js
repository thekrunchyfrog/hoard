// Thin API helper for admin writes. Keeps the shared-secret admin token in
// sessionStorage (cleared when the tab closes) rather than localStorage, and
// attaches it as X-Admin-Token on write requests.

const API_BASE_URL = "http://localhost:5000/api";
const TOKEN_KEY = "hoard_admin_token";

export function getAdminToken() {
  return sessionStorage.getItem(TOKEN_KEY) || "";
}

export function setAdminToken(token) {
  if (token) {
    sessionStorage.setItem(TOKEN_KEY, token);
  } else {
    sessionStorage.removeItem(TOKEN_KEY);
  }
}

async function request(path, options = {}) {
  const token = getAdminToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (token) {
    headers["X-Admin-Token"] = token;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      if (body?.error) message = body.error;
    } catch {
      // ignore body parse failures, use default message
    }
    const err = new Error(message);
    err.status = response.status;
    throw err;
  }

  if (response.status === 204) return null;
  return response.json();
}

export function fetchCollections() {
  return request("/collections");
}

export function fetchItems(collectionTable) {
  return request(`/collections/${collectionTable}/items`);
}

export function createItem(collectionTable, data) {
  return request(`/collections/${collectionTable}/items`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateItem(collectionTable, itemId, data) {
  return request(`/collections/${collectionTable}/items/${itemId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
