import React, { useEffect, useState } from 'react';
import { useUserManager } from '../../Application/useAuth.js';
import { UserForm } from '../components/UserForm.jsx';
import { Button } from '../../../CommonLayer/components/ui/Button.jsx';

const ROLE_LABELS = {
    admin: 'Administrador',
    gestor: 'Gestor',
    consultor: 'Consultor',
};

const ROLE_BADGE = {
    admin: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
    gestor: 'bg-green-500/10 text-green-300 border-green-500/20',
    consultor: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
};

export const UsersPage = () => {
    const {
        users, roles, loading, error,
        fetchUsers, fetchRoles,
        createUser, updateUser, deactivateUser,
    } = useUserManager();

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
        <div className="animate-fade-in w-full">

            {/* Page header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-white/10 pb-6 gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 md:p-4 bg-green-500/10 rounded-2xl border border-green-500/20 shadow-inner">
                        <svg className="w-8 h-8 md:w-10 md:h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-light text-white tracking-wide">
                            Gestión de <span className="font-bold text-green-400">Usuarios</span>
                        </h1>
                        <p className="text-gray-500 text-sm md:text-base mt-2">
                            Administra los accesos y roles del sistema.
                        </p>
                    </div>
                </div>
                <Button
                    onClick={handleOpenCreate}
                    variant="primary"
                    className="w-full md:w-auto text-base py-3 px-6"
                >
                    <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Nuevo Usuario
                    </span>
                </Button>
            </div>

            {/* Search */}
            <div className="mb-6 flex gap-2 w-full md:max-w-md">
                <div className="relative flex-1">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Buscar por usuario, email o rol..."
                        className="w-full bg-black/40 border border-gray-700/50 text-white rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all text-sm placeholder-gray-600"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total', value: users.length, color: 'text-white' },
                    { label: 'Activos', value: users.filter(u => u.active).length, color: 'text-green-400' },
                    { label: 'Inactivos', value: users.filter(u => !u.active).length, color: 'text-red-400' },
                    { label: 'Admins', value: users.filter(u => u.role_name === 'admin').length, color: 'text-purple-400' },
                ].map(stat => (
                    <div key={stat.label} className="bg-gray-900/60 rounded-2xl border border-white/5 p-4">
                        <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">{stat.label}</p>
                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Loading */}
            {loading && !isFormVisible && (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-400" />
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl flex items-center gap-3">
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {/* Table */}
            <div className="bg-gray-900/60 backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl overflow-hidden w-full">
                <div className="overflow-x-auto custom-scrollbar w-full">
                    <table className="w-full text-left min-w-[700px]">
                        <thead>
                            <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-medium">Usuario</th>
                                <th className="px-6 py-4 font-medium">Email</th>
                                <th className="px-6 py-4 font-medium">Rol</th>
                                <th className="px-6 py-4 font-medium">Estado</th>
                                <th className="px-6 py-4 font-medium text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {!loading && filtered.map(user => (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors duration-200">
                                    {/* Username */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500/30 to-emerald-600/30 border border-green-500/20 flex items-center justify-center shrink-0">
                                                <span className="text-green-300 font-bold text-xs uppercase">
                                                    {user.username?.[0] || '?'}
                                                </span>
                                            </div>
                                            <span className="text-gray-200 font-medium">{user.username}</span>
                                        </div>
                                    </td>
                                    {/* Email */}
                                    <td className="px-6 py-4 text-gray-400 text-xs font-mono">{user.email}</td>
                                    {/* Role */}
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${ROLE_BADGE[user.role_name] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                                            {ROLE_LABELS[user.role_name] || user.role_name || '—'}
                                        </span>
                                    </td>
                                    {/* Active */}
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${user.active
                                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                                            }`}>
                                            {user.active ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    {/* Actions */}
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleOpenEdit(user)}
                                                title="Editar usuario"
                                                className="p-2 bg-gray-800 hover:bg-gray-700 text-green-400 rounded-lg transition-colors border border-gray-700"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                            {user.active && (
                                                <button
                                                    onClick={() => handleDeactivate(user)}
                                                    title="Desactivar usuario"
                                                    className="p-2 bg-gray-800 hover:bg-gray-700 text-red-400 rounded-lg transition-colors border border-gray-700"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Empty state */}
                {!loading && filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <p className="text-lg">No se encontraron usuarios.</p>
                        {searchQuery && <p className="text-sm mt-1">Intenta con otro término de búsqueda.</p>}
                    </div>
                )}
            </div>

            {/* User Form Modal */}
            {isFormVisible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={handleCloseForm} />
                    <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar rounded-3xl animate-slide-up shadow-2xl shadow-green-500/10">
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
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setConfirmDeactivate(null)} />
                    <div className="relative z-10 w-full max-w-sm bg-gray-900/95 border border-white/10 rounded-3xl p-7 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 bg-red-500/10 rounded-xl border border-red-500/20">
                                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-white">Desactivar usuario</h3>
                        </div>
                        <p className="text-gray-400 text-sm mb-6">
                            ¿Estás seguro de desactivar a <span className="text-white font-medium">"{confirmDeactivate.username}"</span>? El usuario perderá acceso al sistema.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={confirmDeactivateAction}
                                className="flex-1 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/30 transition-all text-sm font-semibold"
                            >
                                Sí, desactivar
                            </button>
                            <button
                                onClick={() => setConfirmDeactivate(null)}
                                className="flex-1 px-4 py-2.5 border border-white/10 text-gray-400 hover:bg-white/5 hover:text-gray-200 rounded-xl transition-all text-sm font-medium"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
