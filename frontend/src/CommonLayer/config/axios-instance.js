import { API_URL } from './env.js';

// Helper para obtener el rol del usuario
function getUserRole() {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('userRole') || 'consultor';
    }
    return 'consultor';
}

// Headers por defecto con autenticación
function getDefaultHeaders() {
    return {
        'Content-Type': 'application/json',
        'X-User-Role': getUserRole()
    };
}

export const axiosInstance = {
    get: async (url) => {
        const res = await fetch(`${API_URL}${url}`, {
            method: 'GET',
            headers: getDefaultHeaders()
        });
        if (!res.ok) throw new Error(await res.text());
        return { data: await res.json() };
    },
    post: async (url, data) => {
        const res = await fetch(`${API_URL}${url}`, {
            method: 'POST',
            headers: getDefaultHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(await res.text());
        return { data: await res.json() };
    },
    put: async (url, data) => {
        const res = await fetch(`${API_URL}${url}`, {
            method: 'PUT',
            headers: getDefaultHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(await res.text());
        return { data: await res.json() };
    },
    patch: async (url, data) => {
        const res = await fetch(`${API_URL}${url}`, {
            method: 'PATCH',
            headers: getDefaultHeaders(),
            body: data ? JSON.stringify(data) : undefined
        });
        if (!res.ok) throw new Error(await res.text());
        return { data: await res.json() };
    },
    delete: async (url) => {
        const res = await fetch(`${API_URL}${url}`, {
            method: 'DELETE',
            headers: getDefaultHeaders()
        });
        if (!res.ok) throw new Error(await res.text());
        return { data: await res.json() };
    }
};
