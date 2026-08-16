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

// Delete all images stored for an item (admin only). Same auth/error
// handling shape as request(), but kept separate since there's no JSON
// body to send on a DELETE here.
export async function deleteItemImages(collectionTable, itemId) {
  const token = getAdminToken();
  const headers = {};
  if (token) {
    headers["X-Admin-Token"] = token;
  }

  const response = await fetch(
    `${API_BASE_URL}/collections/${collectionTable}/items/${itemId}/images`,
    {
      method: "DELETE",
      headers,
    }
  );

  if (!response.ok) {
    let message = `Delete failed (${response.status})`;
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

// Upload one or more image files for an item. Unlike the JSON `request()`
// helper above, this sends multipart/form-data so we don't set a
// Content-Type header ourselves - the browser sets the multipart boundary.
export async function uploadItemImages(collectionTable, itemId, files) {
  const token = getAdminToken();
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));

  const headers = {};
  if (token) {
    headers["X-Admin-Token"] = token;
  }

  const response = await fetch(
    `${API_BASE_URL}/collections/${collectionTable}/items/${itemId}/images`,
    {
      method: "POST",
      headers,
      body: formData,
    }
  );

  if (!response.ok) {
    let message = `Upload failed (${response.status})`;
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

  return response.json();
}
