const BASE =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? "http://localhost:5000/api"
    : "https://entrepreneur-desk-backend.onrender.com/api");

// Clerk token getter
let tokenGetter = null;

export function setTokenGetter(fn) {
  tokenGetter = fn;
}

async function authHeaders() {
  const token = tokenGetter ? await tokenGetter() : null;

  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
}

// API Error
export class ApiError extends Error {
  constructor(status, body) {
    super(`Request failed with ${status}`);

    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

// Handle API response
async function handle(res) {
  if (!res.ok) {
    const errBody = await res.json().catch(() => null);

    throw new ApiError(res.status, errBody);
  }

  if (res.status === 204) {
    return undefined;
  }

  return await res.json();
}

// Main request function
async function request(method, path, body) {
  const headers = {
    ...(await authHeaders()),
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  return handle(res);
}

// GET
export const apiGet = (path) =>
  request("GET", path);

// POST
export const apiPost = (path, body) =>
  request("POST", path, body);

// PUT
export const apiPut = (path, body) =>
  request("PUT", path, body);

// PATCH
export const apiPatch = (path, body) =>
  request("PATCH", path, body);

// DELETE
export const apiDelete = (path) =>
  request("DELETE", path);

// Upload file
export async function apiUpload(path, file) {
  const fd = new FormData();

  fd.append("file", file);

  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: await authHeaders(),
    body: fd,
  });

  return handle(res);
}

// Download file
export async function apiDownload(path, filename) {
  const res = await fetch(`${BASE}${path}`, {
    headers: await authHeaders(),
  });

  if (!res.ok) {
    throw new ApiError(res.status, null);
  }

  const url = URL.createObjectURL(await res.blob());

  const a = document.createElement("a");

  a.href = url;
  a.download = filename;

  a.click();

  URL.revokeObjectURL(url);
}

// Error message
export function errorMessage(
  err,
  fallback = "Something went wrong"
) {
  if (err instanceof ApiError) {
    const d = err.body?.detail;

    if (typeof d === "string") {
      return d;
    }

    if (
      Array.isArray(d) &&
      d[0] &&
      typeof d[0] === "object" &&
      "msg" in d[0]
    ) {
      const first = d[0];

      const field = Array.isArray(first.loc)
        ? String(first.loc[first.loc.length - 1])
        : "";

      return field
        ? `${field}: ${first.msg}`
        : first.msg;
    }
  }

  return fallback;
}