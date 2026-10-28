const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000/api`;
let unauthorizedHandler = () => {};

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

export async function api(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      credentials: 'include',
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error('Could not reach StockFlow. Check that the backend is running.');
  }

  if (response.status === 401 && !['/auth/login', '/auth/signup'].includes(path)) {
    unauthorizedHandler();
  }
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      if (typeof body.message === 'string') message = body.message;
    } catch {
      if (response.statusText) message = response.statusText;
    }
    throw Object.assign(new Error(message), { status: response.status });
  }
  if (response.status === 204) return null;
  return response.json();
}

export function errMsg(error) {
  return error instanceof Error ? error.message : 'Something went wrong.';
}
