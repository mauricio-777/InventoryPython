import React, { useState, useEffect } from 'react';
import { Button } from '../../../CommonLayer/components/ui/Button.jsx';
import { CustomSelect } from '../../../CommonLayer/components/ui/CustomSelect.jsx';
import * as PhosphorIcons from '@phosphor-icons/react';

const ROLE_LABELS = {
    admin: 'Administrador',
    gestor: 'Gestor de Inventario',
    consultor: 'Consultor',
};

const ROLE_COLORS = {
    admin: 'from-purple-50 to-purple-100 border-purple-200 text-purple-700',
    gestor: 'from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-700',
    consultor: 'from-blue-50 to-blue-100 border-blue-200 text-blue-700',
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
        `w-full bg-[var(--color-quaternary)]/50 text-[var(--color-tertiary)] rounded-2xl border ${errors[field] ? 'border-red-500' : 'border-gray-200'} px-4 py-2.5 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition-all text-sm font-medium`;

    const labelClass = "block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider";

    return (
        <div className="bg-[var(--color-quinary)] rounded-3xl border border-gray-100 shadow-2xl p-6">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[var(--color-primary)]/10 rounded-2xl border border-[var(--color-primary)]/20 text-[var(--color-primary)] shadow-sm">
                        {isEditing ? <PhosphorIcons.PencilSimple size={20} weight="fill" /> : <PhosphorIcons.UserPlus size={20} weight="fill" />}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-[var(--color-tertiary)]">
                            {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
                        </h2>
                        <p className="text-gray-500 font-medium text-xs mt-0.5">
                            {isEditing ? `Modificando: ${initialData?.username}` : 'Completa los datos del nuevo usuario.'}
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onCancel}
                    className="text-gray-400 hover:text-[var(--color-tertiary)] transition-colors bg-gray-100 hover:bg-gray-200 p-2 rounded-xl shrink-0"
                >
                    <PhosphorIcons.X size={18} weight="bold" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username */}
                <div>
                    <label className={labelClass}>
                        Nombre de usuario
                    </label>
                    <input
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        placeholder="ej. jdoe"
                        className={inputClass('username')}
                    />
                    {errors.username && <p className="text-red-500 text-xs font-bold mt-1.5 flex items-center gap-1"><PhosphorIcons.WarningCircle weight="fill" />{errors.username}</p>}
                </div>

                {/* Email */}
                <div>
                    <label className={labelClass}>
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
                    {errors.email && <p className="text-red-500 text-xs font-bold mt-1.5 flex items-center gap-1"><PhosphorIcons.WarningCircle weight="fill" />{errors.email}</p>}
                </div>

                {/* Password */}
                <div>
                    <label className={labelClass}>
                        Contraseña {isEditing && <span className="text-gray-400 font-normal normal-case ml-1">(dejar vacío para no cambiar)</span>}
                    </label>
                    <input
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder={isEditing ? '••••••••' : 'Contraseña segura'}
                        className={inputClass('password')}
                    />
                    {errors.password && <p className="text-red-500 text-xs font-bold mt-1.5 flex items-center gap-1"><PhosphorIcons.WarningCircle weight="fill" />{errors.password}</p>}
                </div>

                {/* Role */}
                <div>
                    <label className={labelClass}>Rol</label>
                    <CustomSelect
                        options={roles.map(r => ({ value: String(r.id), label: ROLE_LABELS[r.name] || r.name }))}
                        value={form.role_id}
                        onChange={(e) => {
                            setForm(prev => ({ ...prev, role_id: e.target.value }));
                            setErrors(prev => ({ ...prev, role_id: undefined }));
                        }}
                        placeholder="Seleccionar rol..."
                        required={true}
                        className={errors.role_id ? 'ring-2 ring-red-400' : ''}
                    />
                    {errors.role_id && <p className="text-red-500 text-xs font-bold mt-1.5 flex items-center gap-1"><PhosphorIcons.WarningCircle weight="fill" />{errors.role_id}</p>}
                </div>

                {/* Active toggle (solo al editar) */}
                {isEditing && (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                        <div className="relative flex items-center">
                            <input
                                id="active-toggle"
                                type="checkbox"
                                name="active"
                                checked={form.active}
                                onChange={handleChange}
                                className="sr-only"
                            />
                            <div className={`block w-12 h-6 rounded-full transition-colors ${form.active ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${form.active ? 'transform translate-x-6' : ''}`}></div>
                        </div>
                        <label htmlFor="active-toggle" className="text-sm font-bold text-gray-600 cursor-pointer flex-1">
                            Usuario <span className={form.active ? 'text-emerald-600' : 'text-gray-400'}>
                                {form.active ? 'activo' : 'inactivo'}
                            </span>
                        </label>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-4 pt-4 border-t border-gray-100">
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={loading}
                        className="flex-1 py-3 justify-center shadow-sm"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <PhosphorIcons.Spinner size={20} className="animate-spin" />
                                Guardando...
                            </span>
                        ) : (isEditing ? 'Guardar cambios' : 'Crear usuario')}
                    </Button>
                    <Button
                        type="button"
                        onClick={onCancel}
                        variant="secondary"
                        className="flex-1 py-3 justify-center"
                    >
                        Cancelar
                    </Button>
                </div>
            </form>
        </div>
    );
};
