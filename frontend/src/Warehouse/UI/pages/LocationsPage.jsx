import React, { useEffect, useState } from 'react';
import * as PhosphorIcons from '@phosphor-icons/react';
import { Title } from '../../../CommonLayer/components/ui/Title.jsx';
import { Button } from '../../../CommonLayer/components/ui/Button.jsx';
import { Table } from '../../../CommonLayer/components/ui/Table.jsx';
import { useLocationActions } from '../../Application/useLocationActions.js';
import { useToast } from '../../../CommonLayer/context/ToastContext.jsx';
import { LocationForm } from '../components/LocationForm.jsx';

export function LocationsPage() {
    const { locations, fetchLocations, createLocation, updateLocation, deleteLocation, loading } = useLocationActions();
    const { showToast } = useToast();

    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    useEffect(() => {
        fetchLocations();
    }, [fetchLocations]);

    const handleCreate = () => {
        setEditingItem(null);
        setIsFormVisible(true);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setIsFormVisible(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("¿Está seguro de que desea eliminar esta ubicación?")) {
            const result = await deleteLocation(id);
            if (result.success) {
                showToast("Ubicación eliminada", "success");
            } else {
                showToast(result.error || "Error al eliminar", "error");
            }
        }
    };

    const handleSave = async (formData) => {
        let result;
        if (editingItem) {
            result = await updateLocation(editingItem.id, formData);
        } else {
            result = await createLocation(formData);
        }

        if (result.success) {
            showToast(`Ubicación ${editingItem ? 'actualizada' : 'creada'} correctamente`, "success");
            setIsFormVisible(false);
            setEditingItem(null);
        } else {
            showToast(result.error || "Error al guardar ubicación", "error");
        }
    };

    const columns = [
        { label: 'Código Único', key: 'composite_code' },
        { label: 'Zona', key: 'zone' },
        { label: 'Pasillo', key: 'aisle' },
        { label: 'Estante', key: 'rack' },
        { label: 'Nivel', key: 'level' }
    ];

    const actions = (row) => (
        <div className="flex space-x-2">
            <button
                onClick={() => handleEdit(row)}
                className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                title="Editar"
            >
                <PhosphorIcons.PencilSimple size={20} weight="fill" />
            </button>
            <button
                onClick={() => handleDelete(row.id)}
                className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                title="Eliminar"
            >
                <PhosphorIcons.Trash size={20} weight="fill" />
            </button>
        </div>
    );

    return (
        <div className="animate-fade-in w-full max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 md:p-4 bg-[var(--color-primary)]/10 rounded-2xl relative border border-[var(--color-primary)]/20 shadow-sm">
                        <PhosphorIcons.MapPinLine size={32} weight="fill" className="text-[var(--color-primary)]" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-tertiary)] tracking-tight">
                            Ubicaciones del Almacén
                        </h1>
                        <p className="text-gray-500 text-sm md:text-base mt-1 font-medium">Administra y registra las ubicaciones físicas del almacén.</p>
                    </div>
                </div>
                <Button variant="primary" className="w-full md:w-auto shadow-sm text-base py-3 px-6" onClick={handleCreate}>
                    <span className="flex items-center justify-center gap-2">
                        <PhosphorIcons.Plus size={20} weight="bold" />
                        Nueva Ubicación
                    </span>
                </Button>
            </div>

            <div className="bg-[var(--color-quinary)] rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden w-full">
                <div className="overflow-x-auto custom-scrollbar w-full">
                    {loading && locations.length === 0 ? (
                        <div className="p-16 text-center text-gray-500 flex flex-col items-center">
                            <PhosphorIcons.Spinner size={32} className="animate-spin mb-2 text-[var(--color-primary)]" />
                            <span className="font-medium text-gray-500">Cargando ubicaciones...</span>
                        </div>
                    ) : locations.length === 0 ? (
                        <div className="p-20 text-center text-gray-400 flex flex-col items-center">
                            <PhosphorIcons.MapPinLine size={64} weight="duotone" className="mb-4 opacity-50 text-gray-300" />
                            <p className="text-lg font-bold text-[var(--color-tertiary)]">No hay ubicaciones registradas.</p>
                            <p className="text-sm mt-1 font-medium">Haga clic en "Nueva Ubicación" para comenzar.</p>
                        </div>
                    ) : (
                        <Table
                            columns={columns}
                            data={locations}
                            actions={actions}
                            keyExtractor={(item) => item.id}
                        />
                    )}
                </div>
            </div>

            {isFormVisible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:pl-[250px] animate-fade-in">
                    <div
                        className="absolute inset-0 bg-[var(--color-tertiary)]/30 backdrop-blur-sm"
                        onClick={() => setIsFormVisible(false)}
                    ></div>
                    <div className="relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto custom-scrollbar rounded-3xl animate-slide-up shadow-[0_20px_40px_rgba(0,0,0,0.1)] bg-white p-8">
                        <LocationForm
                            item={editingItem}
                            onClose={() => setIsFormVisible(false)}
                            onSave={handleSave}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
