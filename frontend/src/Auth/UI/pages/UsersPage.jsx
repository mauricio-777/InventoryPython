import React, { useEffect, useState } from 'react';
import { useUserManager, useLoginConfig } from '../../Application/useAuth.js';
import { UserForm } from '../components/UserForm.jsx';
import { Button } from '../../../CommonLayer/components/ui/Button.jsx';
import { useUserRole } from '../../../CommonLayer/hooks/useUserRole.js';
import { useToast } from '../../../CommonLayer/context/ToastContext.jsx';
import * as PhosphorIcons from '@phosphor-icons/react';

const ROLE_LABELS = {
    admin: 'Administrador',
    gestor: 'Gestor',
    consultor: 'Consultor',
    picker: 'Almacenero',
    driver: 'Repartidor',
};

const ROLE_BADGE = {
    admin: 'bg-purple-50 text-purple-600 border-purple-100',
    gestor: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    consultor: 'bg-blue-50 text-blue-600 border-blue-100',
    picker: 'bg-orange-50 text-orange-600 border-orange-100',
    driver: 'bg-cyan-50 text-cyan-600 border-cyan-100',
};

export const UsersPage = () => {
    const {
        users, roles, loading, error,
        fetchUsers, fetchRoles,
        createUser, updateUser, deactivateUser, unlockUser,
    } = useUserManager();

    const { hasRole } = useUserRole();
    const isAdmin = hasRole('admin');

    const {
        limits, loading: configLoading, fetchLimits, saveLimits,
    } = useLoginConfig();

    const [isFormVisible, setFormVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [confirmDeactivate, setConfirmDeactivate] = useState(null);
    const [confirmUnlock, setConfirmUnlock] = useState(null);

    // Login limits config local state
    const [configNonAdmin, setConfigNonAdmin] = useState('');
    const [savingConfig, setSavingConfig] = useState(false);

    const { showToast } = useToast();

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, [fetchUsers, fetchRoles]);

    useEffect(() => {
        if (isAdmin) fetchLimits();
    }, [isAdmin, fetchLimits]);

    // Sync local inputs with fetched limits
    useEffect(() => {
        setConfigNonAdmin(String(limits.non_admin ?? 5));
    }, [limits]);

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
                showToast('Usuario actualizado exitosamente.', 'success');
            } else {
                await createUser(data);
                showToast('Usuario creado exitosamente.', 'success');
            }
            handleCloseForm();
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    const handleDeactivate = async (user) => {
        setConfirmDeactivate(user);
    };

    const confirmDeactivateAction = async () => {
        if (!confirmDeactivate) return;
        try {
            await deactivateUser(confirmDeactivate.id);
            showToast(`Usuario "${confirmDeactivate.username}" desactivado.`, 'info');
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setConfirmDeactivate(null);
        }
    };

    const handleUnlockAction = async () => {
        if (!confirmUnlock) return;
        try {
            await unlockUser(confirmUnlock.id);
            showToast(`Usuario "${confirmUnlock.username}" desbloqueado.`, 'success');
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setConfirmUnlock(null);
        }
    };

    const handleSaveLimits = async () => {
        const non_admin = parseInt(configNonAdmin, 10);
        if (isNaN(non_admin) || non_admin < 1) {
            showToast('El límite debe ser un número entero positivo.', 'error');
            return;
        }
        setSavingConfig(true);
        try {
            await saveLimits({ non_admin });
            showToast('Límites de intentos actualizados correctamente.', 'success');
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setSavingConfig(false);
        }
    };

    const getStatusBadge = (user) => {
        if (user.is_locked) {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border shadow-sm w-max mx-auto bg-amber-50 text-amber-700 border-amber-200">
                    <PhosphorIcons.Lock weight="bold" />
                    Bloqueado
                </span>
            );
        }
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border shadow-sm w-max mx-auto ${user.active
                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                : 'bg-red-50 text-red-600 border-red-100'
                }`}>
                {user.active ? <PhosphorIcons.CheckCircle weight="bold" /> : <PhosphorIcons.MinusCircle weight="bold" />}
                {user.active ? 'Activo' : 'Inactivo'}
            </span>
        );
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
                        { label: 'Activos', value: users.filter(u => u.active && !u.is_locked).length, icon: PhosphorIcons.CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                        { label: 'Inactivos', value: users.filter(u => !u.active).length, icon: PhosphorIcons.XCircle, color: 'text-red-600', bg: 'bg-red-50' },
                        { label: 'Bloqueados', value: users.filter(u => u.is_locked).length, icon: PhosphorIcons.Lock, color: 'text-amber-600', bg: 'bg-amber-50' },
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
                                    <tr key={user.id} className={`hover:bg-gray-50/50 transition-colors duration-200 ${user.is_locked ? 'bg-amber-50/30' : ''}`}>
                                        {/* Username */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full border flex items-center justify-center shrink-0 ${user.is_locked ? 'bg-amber-100 border-amber-200' : 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/20'}`}>
                                                    {user.is_locked
                                                        ? <PhosphorIcons.Lock size={18} weight="bold" className="text-amber-600" />
                                                        : <span className="text-[var(--color-primary)] font-bold text-sm uppercase">{user.username?.[0] || '?'}</span>
                                                    }
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
                                        {/* Status */}
                                        <td className="px-6 py-4 text-center">
                                            {getStatusBadge(user)}
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
                                                    {user.is_locked ? (
                                                        <button
                                                            onClick={() => setConfirmUnlock(user)}
                                                            title="Desbloquear usuario"
                                                            className="p-2 bg-white hover:bg-amber-50 text-amber-600 rounded-xl transition-colors border border-gray-200 hover:border-amber-200 shadow-sm"
                                                        >
                                                            <PhosphorIcons.LockOpen size={18} weight="bold" />
                                                        </button>
                                                    ) : (
                                                        user.active && (
                                                            <button
                                                                onClick={() => handleDeactivate(user)}
                                                                title="Desactivar usuario"
                                                                className="p-2 bg-white hover:bg-red-50 text-red-500 rounded-xl transition-colors border border-gray-200 hover:border-red-200 shadow-sm"
                                                            >
                                                                <PhosphorIcons.UserMinus size={18} weight="bold" />
                                                            </button>
                                                        )
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

            {/* ── Login Limits Config Panel (admin only) ─────────────────────── */}
            {isAdmin && (
                <div className="bg-[var(--color-quinary)] rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 animate-slide-up">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-100">
                            <PhosphorIcons.ShieldWarning size={22} weight="fill" className="text-amber-600" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-[var(--color-tertiary)]">Configuración de límites de intentos</h2>
                            <p className="text-xs text-gray-500 font-medium mt-0.5">Define cuántos intentos fallidos pueden tener los usuarios regulares antes de ser bloqueados.</p>
                        </div>
                    </div>

                    <div className="mb-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                Máx. intentos para <span className="text-[var(--color-primary)]">Usuarios (No Administradores)</span>
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="20"
                                value={configNonAdmin}
                                onChange={e => setConfigNonAdmin(e.target.value)}
                                disabled={configLoading}
                                className="w-full bg-gray-50 text-[var(--color-tertiary)] border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all font-bold text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button
                            onClick={handleSaveLimits}
                            variant="primary"
                            disabled={savingConfig || configLoading}
                            className="px-6 py-2.5 flex items-center gap-2"
                        >
                            {savingConfig
                                ? <PhosphorIcons.Spinner size={16} className="animate-spin" />
                                : <PhosphorIcons.FloppyDisk size={16} weight="bold" />
                            }
                            Guardar configuración
                        </Button>
                    </div>
                </div>
            )}

            {/* User Form Modal */}
            {isFormVisible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:pl-56 animate-fade-in">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleCloseForm} />
                    <div className="relative z-10 w-full max-w-lg animate-slide-up shadow-2xl rounded-3xl">
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:pl-56 animate-fade-in">
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

            {/* Unlock Confirm Dialog */}
            {confirmUnlock && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:pl-56 animate-fade-in">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmUnlock(null)} />
                    <div className="relative z-10 w-full max-w-sm bg-[var(--color-quinary)] border border-gray-100 rounded-3xl p-7 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 text-amber-600">
                                <PhosphorIcons.LockOpen size={24} weight="fill" />
                            </div>
                            <h3 className="text-lg font-bold text-[var(--color-tertiary)]">Desbloquear usuario</h3>
                        </div>
                        <p className="text-gray-600 text-sm font-medium mb-8 leading-relaxed">
                            ¿Deseas desbloquear a <span className="font-bold text-[var(--color-tertiary)]">"{confirmUnlock.username}"</span>? Podrá volver a iniciar sesión y sus intentos fallidos serán reiniciados.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={handleUnlockAction}
                                className="flex-1 px-4 py-3 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl border border-amber-200 transition-all font-bold shadow-sm"
                            >
                                Sí, desbloquear
                            </button>
                            <Button
                                onClick={() => setConfirmUnlock(null)}
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
