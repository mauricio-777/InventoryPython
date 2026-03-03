import { API_URL } from '../../CommonLayer/config/env.js';

// Helper para obtener el rol del usuario del localStorage
function getUserRole() {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('userRole') || 'consultor';
    }
    return 'consultor';
}

// Headers con el rol del usuario para autorización temporal (hasta implementar JWT - Epic 3.2)
function getAuthHeaders() {
    return { 'X-User-Role': getUserRole() };
}

const BASE = '/users';

/**
 * Wrapper de fetch con inyección de headers de rol.
 * API_URL ya incluye /api/v1, así que BASE solo necesita el segmento del recurso.
 */
async function apiFetch(method, url, body = null) {
    const opts = {
        method: method.toUpperCase(),
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(`${API_URL}${url}`, opts);
    if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
    }
    return res.json();
}

export const userApi = {
    /** Lista todos los usuarios */
    getUsers: () => apiFetch('GET', `${BASE}/`),

    /** Lista los roles disponibles */
    getRoles: () => apiFetch('GET', `${BASE}/roles`),

    /** Crea un nuevo usuario */
    createUser: (data) => apiFetch('POST', `${BASE}/`, data),

    /** Actualiza un usuario por ID */
    updateUser: (id, data) => apiFetch('PUT', `${BASE}/${id}`, data),

    /** Desactiva un usuario por ID */
    deactivateUser: (id) => apiFetch('PATCH', `${BASE}/${id}/deactivate`),
};

