// Shared API helper
const rawEnv = import.meta.env.VITE_API_BASE_URL;
const envUrl = rawEnv || 'http://localhost:5000';
export const BASE_URL = envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/$/, '')}/api`;

console.log('--- API CONFIG DIAGNOSTICS ---');
console.log('Final BASE_URL:', BASE_URL);

function getToken() { return localStorage.getItem('token'); }

async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const isFormData = options.isFormData || (options.body && typeof options.body.append === 'function');
  const headers = { 
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }), 
    ...(token ? { Authorization: `Bearer ${token}` } : {}), 
    ...options.headers 
  };
  if (options.hasOwnProperty('isFormData')) delete options.isFormData;

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
    
    // Check if the response is actually JSON
    const contentType = res.headers.get("content-type");
    let data;
    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    } else {
      const text = await res.text();
      data = { message: text || 'Internal Server Error' };
    }

    if (res.status === 401 && !endpoint.includes('/auth/login')) {
      clearAuth();
      window.dispatchEvent(new Event('auth-expired'));
      throw new Error('Session expired. Please log in again.');
    }
    
    if (!res.ok) throw new Error(data.message || `Request failed with status ${res.status}`);
    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Server unreachable. Please ensure the backend is running.');
    }
    throw err;
  }
}

function checkFD(body) { return body && typeof body.append === 'function'; }

export const api = {
  post: (url, body, options = {}) => apiFetch(url, { method: 'POST', body: checkFD(body) ? body : JSON.stringify(body), isFormData: checkFD(body), ...options }),
  get: (url, options = {}) => apiFetch(url, { method: 'GET', ...options }),
  delete: (url, options = {}) => apiFetch(url, { method: 'DELETE', ...options }),
  put: (url, body, options = {}) => apiFetch(url, { method: 'PUT', body: checkFD(body) ? body : JSON.stringify(body), isFormData: checkFD(body), ...options }),
  patch: (url, body, options = {}) => apiFetch(url, { method: 'PATCH', body: checkFD(body) ? body : JSON.stringify(body), isFormData: checkFD(body), ...options }),
};

export function saveAuth(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}
export function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}
export function updateLocalUser(userData) {
  const current = getUser();
  const updated = { ...current, ...userData };
  localStorage.setItem('user', JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('user-updated', { detail: updated }));
  return updated;
}

export function getUser() {
  try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
}
