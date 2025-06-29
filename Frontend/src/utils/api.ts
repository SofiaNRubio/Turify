const API_URL = import.meta.env.PUBLIC_BACKEND_URL;

export async function apiFetch(endpoint: string, options?: RequestInit) {
  // Si el endpoint ya empieza con http, no anteponer el API_URL
  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
  return fetch(url, options);
} 