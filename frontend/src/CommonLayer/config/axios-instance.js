import { API_URL } from './env.js';

export const axiosInstance = {
    get: async (url) => {
        const res = await fetch(`${API_URL}${url}`);
        if (!res.ok) throw new Error(await res.text());
        return { data: await res.json() };
    },
    post: async (url, data) => {
        const res = await fetch(`${API_URL}${url}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(await res.text());
        return { data: await res.json() };
    },
    put: async (url, data) => {
        const res = await fetch(`${API_URL}${url}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(await res.text());
        return { data: await res.json() };
    },
    delete: async (url) => {
        const res = await fetch(`${API_URL}${url}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error(await res.text());
        return { data: await res.json() };
    }
};
