import { API_URL } from './env.js';

// Helper para obtener el rol del usuario
function getUserRole() {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('userRole') || 'consultor';
    }
    return 'consultor';
}

function getDefaultHeaders() {
    return {
        'Content-Type': 'application/json',
        'X-User-Role': getUserRole(),
        'X-User-Id': typeof window !== 'undefined' ? localStorage.getItem('userName') || 'system' : 'system'
    };
}

/**
 * Extrae el mensaje de error de una respuesta HTTP fallida.
 * Si el body es JSON con propiedad 'message', lo usa. Si no, usa el texto crudo.
 */
async function extractErrorMessage(response) {
    const text = await response.text();
    try {
        const json = JSON.parse(text);
        return json.message || text;
    } catch {
        return text;
    }
}

export const axiosInstance = {
    get: async (url) => {
        const res = await fetch(`${API_URL}${url}`, {
            method: 'GET',
            headers: getDefaultHeaders()
        });
        if (!res.ok) throw new Error(await extractErrorMessage(res));
        return { data: await res.json() };
    },
    post: async (url, data) => {
        const res = await fetch(`${API_URL}${url}`, {
            method: 'POST',
            headers: getDefaultHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(await extractErrorMessage(res));
        return { data: await res.json() };
    },
    put: async (url, data) => {
        const res = await fetch(`${API_URL}${url}`, {
            method: 'PUT',
            headers: getDefaultHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(await extractErrorMessage(res));
        return { data: await res.json() };
    },
    patch: async (url, data) => {
        const res = await fetch(`${API_URL}${url}`, {
            method: 'PATCH',
            headers: getDefaultHeaders(),
            body: data ? JSON.stringify(data) : undefined
        });
        if (!res.ok) throw new Error(await extractErrorMessage(res));
        return { data: await res.json() };
    },
    delete: async (url) => {
        const res = await fetch(`${API_URL}${url}`, {
            method: 'DELETE',
            headers: getDefaultHeaders()
        });
        if (!res.ok) throw new Error(await extractErrorMessage(res));
        return { data: await res.json() };
    }
};
