import React, { useState, useEffect } from 'react';
import * as PhosphorIcons from '@phosphor-icons/react';
import { Button } from '../../../CommonLayer/components/ui/Button.jsx';

export function LocationForm({ item, onClose, onSave }) {
    const [formData, setFormData] = useState({
        zone: '',
        aisle: '',
        rack: '',
        level: ''
    });

    useEffect(() => {
        if (item) {
            setFormData({
                zone: item.zone || '',
                aisle: item.aisle || '',
                rack: item.rack || '',
                level: item.level || ''
            });
        }
    }, [item]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-[var(--color-primary)]">
                    {item ? 'Editar Ubicación' : 'Nueva Ubicación'}
                </h3>
                <button
                    type="button"
                    onClick={onClose}
                    className="p-2 text-gray-500 hover:text-[var(--color-secondary)] hover:bg-gray-100 rounded-full transition-colors"
                >
                    <PhosphorIcons.X size={24} weight="bold" />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label className="block text-sm font-semibold text-[var(--color-primary)] mb-1">Zona</label>
                    <input className="w-full text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all"
                        name="zone"
                        value={formData.zone}
                        onChange={handleChange}
                        placeholder="Ej: A-SECOS"
                        required
                    />
                </div>
                <div className="col-span-1">
                    <label className="block text-sm font-semibold text-[var(--color-primary)] mb-1">Pasillo</label>
                    <input className="w-full text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all"
                        name="aisle"
                        value={formData.aisle}
                        onChange={handleChange}
                        placeholder="Ej: 01"
                        required
                    />
                </div>
                <div className="col-span-1">
                    <label className="block text-sm font-semibold text-[var(--color-primary)] mb-1">Estante</label>
                    <input className="w-full text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all"
                        name="rack"
                        value={formData.rack}
                        onChange={handleChange}
                        placeholder="Ej: A"
                        required
                    />
                </div>
                <div className="col-span-2">
                    <label className="block text-sm font-semibold text-[var(--color-primary)] mb-1">Nivel</label>
                    <input className="w-full text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all"
                        name="level"
                        value={formData.level}
                        onChange={handleChange}
                        placeholder="Ej: 01"
                        required
                    />
                </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 mt-4">
                <Button variant="secondary" onClick={onClose} type="button">
                    Cancelar
                </Button>
                <Button variant="primary" type="submit" className="flex items-center gap-2">
                    <PhosphorIcons.FloppyDisk size={20} weight="bold" />
                    Guardar
                </Button>
            </div>
        </form>
    );
}
