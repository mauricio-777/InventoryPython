import { useState, useCallback } from 'react';
import { axiosInstance } from '../../CommonLayer/config/axios-instance.js';

export function useLocationActions() {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchLocations = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axiosInstance.get('/locations/');
            setLocations(response.data);
        } catch (err) {
            console.error('Error fetching locations:', err);
            setError(err.message || 'Error al cargar ubicaciones');
        } finally {
            setLoading(false);
        }
    }, []);

    const createLocation = async (locationData) => {
        try {
            const response = await axiosInstance.post('/locations/', locationData);
            setLocations(prev => [...prev, response.data]);
            return { success: true, data: response.data };
        } catch (err) {
            console.error('Error creating location:', err);
            return { success: false, error: err.message || 'Error al crear ubicación' };
        }
    };

    const updateLocation = async (id, locationData) => {
        try {
            const response = await axiosInstance.put(`/locations/${id}`, locationData);
            setLocations(prev => prev.map(l => l.id === id ? response.data : l));
            return { success: true, data: response.data };
        } catch (err) {
            console.error('Error updating location:', err);
            return { success: false, error: err.message || 'Error al actualizar ubicación' };
        }
    };

    const deleteLocation = async (id) => {
        try {
            await axiosInstance.delete(`/locations/${id}`);
            setLocations(prev => prev.filter(l => l.id !== id));
            return { success: true };
        } catch (err) {
            console.error('Error deleting location:', err);
            return { success: false, error: err.message || 'Error al eliminar ubicación' };
        }
    };

    return {
        locations,
        loading,
        error,
        fetchLocations,
        createLocation,
        updateLocation,
        deleteLocation
    };
}
