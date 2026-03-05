import React, { useEffect, useState } from 'react';
import { useUserManager } from '../../Application/useAuth.js';
import { UserForm } from '../components/UserForm.jsx';
import { Button } from '../../../CommonLayer/components/ui/Button.jsx';
import { useUserRole } from '../../../CommonLayer/hooks/useUserRole.js';
import * as PhosphorIcons from '@phosphor-icons/react';

const ROLE_LABELS = {
    admin: 'Administrador',
    gestor: 'Gestor',
    consultor: 'Consultor',
};

const ROLE_BADGE = {
    admin: 'bg-purple-50 text-purple-600 border-purple-100',
    gestor: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    consultor: 'bg-blue-50 text-blue-600 border-blue-100',
};

export const UsersPage = () => {
    const {
        users, roles, loading, error,
        fetchUsers, fetchRoles,
        createUser, updateUser, deactivateUser,
    } = useUserManager();

    const { hasRole } = useUserRole();
    const isAdmin = hasRole('admin');

    const [isFormVisible, setFormVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [confirmDeactivate, setConfirmDeactivate] = useState(null);

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, [fetchUsers, fetchRoles]);

    const filtered = users.filter(u =>
        u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.role_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleOpenCreate = () => { setEditingUser(null); setFormVisible(true); };
    const handleOpenEdit = (user) => { setEditingUser(user); setFormVisible(true); };
    const handleCloseForm = () => { setEditingUser(null); setFormVisible(false); };

    const handleSave = async (data) => {
        try {
            if (editingUser) {
                await updateUser(editingUser.id, data);
            } else {
                await createUser(data);
            }
            handleCloseForm();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeactivate = async (user) => {
        setConfirmDeactivate(user);
    };

    const confirmDeactivateAction = async () => {
        if (!confirmDeactivate) return;
        try {
            await deactivateUser(confirmDeactivate.id);
        } catch (err) {
            alert(err.message);
        } finally {
            setConfirmDeactivate(null);
        }
    };

    return (
        <div className="animate-fade-in w-full max-w-7xl mx-auto space-y-8">

            {/* Page header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 md:p-4 bg-[var(--color-primary)]/10 rounded-2xl relative border border-[var(--color-primary)]/20 shadow-sm">
                        <PhosphorIcons.UsersThree size={32} weight="fill" className="text-[var(--color-primary)]" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-tertiary)] tracking-tight">
                            Gestión de <span className="text-[var(--color-primary)]">Usuarios</span>
                        </h1>
                        <p className="text-gray-500 mt-1 font-medium text-sm md:text-base">
                            Administra los accesos y roles del sistema.
                        </p>
                    </div>
                </div>
                {isAdmin && (
                    <Button
                        onClick={handleOpenCreate}
                        variant="primary"
                        className="w-full md:w-auto text-base py-3 px-6 shadow-sm flex items-center justify-center gap-2"
                    >
                        <PhosphorIcons.UserPlus size={20} weight="bold" />
                        <span>Nuevo Usuario</span>
                    </Button>
                )}
            </div>

            {/* Search and Summaries */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Search */}
                <div className="w-full lg:w-1/3 bg-[var(--color-quinary)] rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6">
                    <h2 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                        <PhosphorIcons.MagnifyingGlass size={16} />
                        Búsqueda
                    </h2>
                    <div className="relative">
                        <PhosphorIcons.MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por usuario, email o rol..."
                            className="w-full bg-gray-50 text-[var(--color-tertiary)] border border-gray-200 rounded-2xl pl-11 pr-4 py-3 focus:outline-none focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 transition-all font-medium text-sm placeholder-gray-400"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Summary cards */}
                <div className="w-full lg:w-2/3 grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Total', value: users.length, icon: PhosphorIcons.UsersThree, color: 'text-[var(--color-primary)]', bg: 'bg-[var(--color-primary)]/10' },
                        { label: 'Activos', value: users.filter(u => u.active).length, icon: PhosphorIcons.CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                        { label: 'Inactivos', value: users.filter(u => !u.active).length, icon: PhosphorIcons.XCircle, color: 'text-red-600', bg: 'bg-red-50' },
                        { label: 'Admins', value: users.filter(u => u.role_name === 'admin').length, icon: PhosphorIcons.ShieldStar, color: 'text-purple-600', bg: 'bg-purple-50' },
                    ].map(stat => (
                        <div key={stat.label} className="bg-[var(--color-quinary)] rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5 flex flex-col justify-between relative overflow-hidden group">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
                                    <stat.icon size={20} weight="fill" />
                                </div>
                                <h3 className={`text-2xl font-black tracking-tight ${stat.color}`}>{stat.value}</h3>
                            </div>
                            <p className="text-gray-500 font-bold text-xs uppercase tracking-wider">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl shadow-sm flex items-center gap-3 font-medium">
                    <PhosphorIcons.WarningCircle size={24} weight="fill" className="shrink-0 text-red-500" />
                    <p>{error}</p>
                </div>
            )}

            {/* Loading */}
            {loading && !isFormVisible && (
                <div className="flex justify-center flex-col items-center py-12 gap-4">
                    <PhosphorIcons.Spinner size={40} className="animate-spin text-[var(--color-primary)]" />
                    <span className="text-gray-500 font-medium">Cargando usuarios...</span>
                </div>
            )}

            {/* Table */}
            {!loading && filtered.length > 0 && (
                <div className="bg-[var(--color-quinary)] rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden w-full animate-slide-up">
                    <div className="overflow-x-auto custom-scrollbar w-full">
                        <table className="w-full text-left min-w-[700px]">
                            <thead>
                                <tr className="bg-[var(--color-quaternary)]/50 text-gray-400 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                                    <th className="px-6 py-4">Usuario</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4 text-center">Rol</th>
                                    <th className="px-6 py-4 text-center">Estado</th>
                                    {isAdmin && <th className="px-6 py-4 text-right">Acciones</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-sm">
                                {filtered.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors duration-200">
                                        {/* Username */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 flex items-center justify-center shrink-0">
                                                    <span className="text-[var(--color-primary)] font-bold text-sm uppercase">
                                                        {user.username?.[0] || '?'}
                                                    </span>
                                                </div>
                                                <span className="text-[var(--color-tertiary)] font-bold">{user.username}</span>
                                            </div>
                                        </td>
                                        {/* Email */}
                                        <td className="px-6 py-4 text-gray-500 font-medium">{user.email}</td>
                                        {/* Role */}
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-xl text-[11px] font-bold border shadow-sm w-max mx-auto ${ROLE_BADGE[user.role_name] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                                {ROLE_LABELS[user.role_name] || user.role_name || '—'}
                                            </span>
                                        </td>
                                        {/* Active */}
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border shadow-sm w-max mx-auto ${user.active
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                : 'bg-red-50 text-red-600 border-red-100'
                                                }`}>
                                                {user.active ? <PhosphorIcons.CheckCircle weight="bold" /> : <PhosphorIcons.MinusCircle weight="bold" />}
                                                {user.active ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        {/* Actions */}
                                        {isAdmin && (
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        onClick={() => handleOpenEdit(user)}
                                                        variant="secondary"
                                                        title="Editar usuario"
                                                        className="p-2 aspect-square"
                                                    >
                                                        <PhosphorIcons.PencilSimple size={18} weight="bold" />
                                                    </Button>
                                                    {user.active && (
                                                        <button
                                                            onClick={() => handleDeactivate(user)}
                                                            title="Desactivar usuario"
                                                            className="p-2 bg-white hover:bg-red-50 text-red-500 rounded-xl transition-colors border border-gray-200 hover:border-red-200 shadow-sm"
                                                        >
                                                            <PhosphorIcons.UserMinus size={18} weight="bold" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Empty state */}
            {!loading && filtered.length === 0 && (
                <div className="bg-[var(--color-quinary)] rounded-3xl border border-dashed border-gray-200 p-16 text-center flex flex-col items-center justify-center w-full animate-slide-up">
                    <div className="bg-gray-50 p-6 rounded-full border border-gray-100 mb-6 shadow-sm">
                        <PhosphorIcons.UsersThree size={64} weight="light" className="text-gray-400" />
                    </div>
                    <p className="text-xl font-bold text-gray-600 mb-2">No se encontraron usuarios</p>
                    <p className="text-gray-500 font-medium">Intenta con otro término de búsqueda.</p>
                </div>
            )}

            {/* User Form Modal */}
            {isFormVisible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleCloseForm} />
                    <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar rounded-3xl animate-slide-up shadow-2xl">
                        <UserForm
                            initialData={editingUser}
                            roles={roles}
                            onSave={handleSave}
                            onCancel={handleCloseForm}
                            loading={loading}
                        />
                    </div>
                </div>
            )}

            {/* Deactivate Confirm Dialog */}
            {confirmDeactivate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmDeactivate(null)} />
                    <div className="relative z-10 w-full max-w-sm bg-[var(--color-quinary)] border border-gray-100 rounded-3xl p-7 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-red-50 rounded-2xl border border-red-100 text-red-500">
                                <PhosphorIcons.Warning size={24} weight="fill" />
                            </div>
                            <h3 className="text-lg font-bold text-[var(--color-tertiary)]">Desactivar usuario</h3>
                        </div>
                        <p className="text-gray-600 text-sm font-medium mb-8 leading-relaxed">
                            ¿Estás seguro de desactivar a <span className="font-bold text-[var(--color-tertiary)]">"{confirmDeactivate.username}"</span>? El usuario perderá acceso al sistema de forma inmediata.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={confirmDeactivateAction}
                                className="flex-1 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl border border-red-200 transition-all font-bold shadow-sm"
                            >
                                Sí, desactivar
                            </button>
                            <Button
                                onClick={() => setConfirmDeactivate(null)}
                                variant="secondary"
                                className="flex-1 px-4"
                            >
                                Cancelar
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
