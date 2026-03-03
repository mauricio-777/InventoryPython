import React, { useState, useEffect } from 'react';
import { Button } from '../../../CommonLayer/components/ui/Button.jsx';

const ROLE_LABELS = {
    admin: 'Administrador',
    gestor: 'Gestor de Inventario',
    consultor: 'Consultor',
};

const ROLE_COLORS = {
    admin: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-300',
    gestor: 'from-green-500/20 to-green-600/10 border-green-500/30 text-green-300',
    consultor: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-300',
};

/**
 * UserForm — Formulario para crear o editar usuarios.
 * Se muestra como un overlay modal, siguiendo el patrón del proyecto.
 */
export const UserForm = ({ initialData = null, roles = [], onSave, onCancel, loading = false }) => {
    const isEditing = Boolean(initialData);

    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
        role_id: '',
        active: true,
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (initialData) {
            setForm({
                username: initialData.username || '',
                email: initialData.email || '',
                password: '',
                role_id: String(initialData.role_id || ''),
                active: initialData.active ?? true,
            });
        }
    }, [initialData]);

    const validate = () => {
        const errs = {};
        if (!form.username.trim()) errs.username = 'El nombre de usuario es requerido.';
        if (!form.email.trim()) errs.email = 'El email es requerido.';
        else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Email inválido.';
        if (!isEditing && !form.password.trim()) errs.password = 'La contraseña es requerida.';
        if (!form.role_id) errs.role_id = 'Selecciona un rol.';
        return errs;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        setErrors(prev => ({ ...prev, [name]: undefined }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        const payload = { ...form, role_id: parseInt(form.role_id, 10) };
        if (isEditing && !payload.password) delete payload.password;
        onSave(payload);
    };

    const inputClass = (field) =>
        `w-full bg-black/40 border ${errors[field] ? 'border-red-500/70' : 'border-gray-700/50'} text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all placeholder-gray-600 text-sm`;

    return (
        <div className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-green-500/5">
            {/* Header */}
            <div className="flex items-center gap-4 mb-7">
                <div className="p-3 bg-green-500/10 rounded-2xl border border-green-500/20">
                    <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d={isEditing
                                ? "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                : "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                            } />
                    </svg>
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-white">
                        {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
                    </h2>
                    <p className="text-gray-500 text-sm mt-0.5">
                        {isEditing ? `Modificando: ${initialData?.username}` : 'Completa los datos del nuevo usuario.'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Username */}
                <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wider">
                        Nombre de usuario
                    </label>
                    <input
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        placeholder="ej. jdoe"
                        className={inputClass('username')}
                    />
                    {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username}</p>}
                </div>

                {/* Email */}
                <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wider">
                        Correo electrónico
                    </label>
                    <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="ej. j.doe@empresa.com"
                        className={inputClass('email')}
                    />
                    {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                </div>

                {/* Password */}
                <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wider">
                        Contraseña {isEditing && <span className="text-gray-600">(dejar vacío para no cambiar)</span>}
                    </label>
                    <input
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder={isEditing ? '••••••••' : 'Contraseña segura'}
                        className={inputClass('password')}
                    />
                    {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                </div>

                {/* Role */}
                <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wider">Rol</label>
                    <select
                        name="role_id"
                        value={form.role_id}
                        onChange={handleChange}
                        className={`${inputClass('role_id')} cursor-pointer`}
                    >
                        <option value="" className="bg-gray-900">Seleccionar rol...</option>
                        {roles.map(r => (
                            <option key={r.id} value={r.id} className="bg-gray-900">
                                {ROLE_LABELS[r.name] || r.name}
                            </option>
                        ))}
                    </select>
                    {errors.role_id && <p className="text-red-400 text-xs mt-1">{errors.role_id}</p>}
                </div>

                {/* Active toggle (solo al editar) */}
                {isEditing && (
                    <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                        <input
                            id="active-toggle"
                            type="checkbox"
                            name="active"
                            checked={form.active}
                            onChange={handleChange}
                            className="w-4 h-4 rounded accent-green-500 cursor-pointer"
                        />
                        <label htmlFor="active-toggle" className="text-sm text-gray-300 cursor-pointer">
                            Usuario <span className={form.active ? 'text-green-400' : 'text-red-400'}>
                                {form.active ? 'activo' : 'inactivo'}
                            </span>
                        </label>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={loading}
                        className="flex-1"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                Guardando...
                            </span>
                        ) : (isEditing ? 'Guardar cambios' : 'Crear usuario')}
                    </Button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5 hover:text-gray-200 transition-all text-sm font-medium"
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
};
