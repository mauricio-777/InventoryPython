import React, { useEffect, useState } from 'react';
import { useCustomerActions } from '../../Application/useStakeholderSearch.js';
import { Button } from '../../../CommonLayer/components/ui/Button.jsx';
import { StakeholderForm } from '../components/StakeholderForm.jsx';
import { useUserRole } from '../../../CommonLayer/hooks/useUserRole.js';
import { useToast } from '../../../CommonLayer/context/ToastContext.jsx';
import * as PhosphorIcons from '@phosphor-icons/react';

export const CustomersPage = () => {
    const { customers, fetchCustomers, createCustomer, updateCustomer, deleteCustomer, loading, error } = useCustomerActions();
    const { hasRole } = useUserRole();
    const { showToast } = useToast();
    const [isFormVisible, setFormVisible] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchCustomers(searchQuery);
    };

    const handleOpenForm = (customer = null) => {
        setEditingCustomer(customer);
        setFormVisible(true);
    };

    const handleCloseForm = () => {
        setEditingCustomer(null);
        setFormVisible(false);
    };

    const handleSave = async (data) => {
        try {
            if (editingCustomer) {
                await updateCustomer(editingCustomer.id, data);
                showToast('Cliente actualizado exitosamente.', 'success');
            } else {
                await createCustomer(data);
                showToast('Cliente creado exitosamente.', 'success');
            }
            handleCloseForm();
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    const handleDeleteRequest = (id) => setDeleteConfirmId(id);

    const handleDeleteConfirm = async () => {
        if (!deleteConfirmId) return;
        try {
            await deleteCustomer(deleteConfirmId);
            showToast('Cliente eliminado.', 'success');
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setDeleteConfirmId(null);
        }
    };

    return (
        <div className="animate-fade-in w-full max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 md:p-4 bg-[var(--color-primary)]/10 rounded-2xl relative border border-[var(--color-primary)]/20 shadow-sm">
                        <PhosphorIcons.Users size={32} weight="fill" className="text-[var(--color-primary)]" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-tertiary)] tracking-tight">
                            Gestión de Clientes
                        </h1>
                        <p className="text-gray-500 text-sm md:text-base mt-1 font-medium">Administra la información de los compradores.</p>
                    </div>
                </div>
                {hasRole(['admin', 'gestor']) && (
                    <Button onClick={() => handleOpenForm(null)} variant="primary" className="w-full md:w-auto shadow-sm text-base py-3 px-6">
                        <span className="flex items-center justify-center gap-2">
                            <PhosphorIcons.UserPlus size={20} weight="bold" />
                            Nuevo Cliente
                        </span>
                    </Button>
                )}
            </div>

            <form onSubmit={handleSearch} className="flex gap-2 w-full md:max-w-md relative">
                <PhosphorIcons.MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" weight="bold" />
                <input
                    type="text"
                    placeholder="Buscar por nombre o documento..."
                    className="flex-1 bg-[var(--color-quinary)] border border-gray-200 hover:border-gray-300 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 text-[var(--color-tertiary)] rounded-2xl pl-11 pr-4 py-3 text-sm font-medium outline-none transition-all shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button type="submit" variant="secondary" className="px-6 rounded-2xl shadow-sm">Buscar</Button>
            </form>

            {loading && !isFormVisible && (
                <div className="flex justify-center flex-col items-center py-12 gap-4 h-[50vh]">
                    <PhosphorIcons.Spinner size={40} className="animate-spin text-[var(--color-primary)]" />
                    <span className="text-gray-500 font-medium">Cargando clientes...</span>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl flex items-center gap-3 shadow-sm">
                    <PhosphorIcons.WarningCircle size={24} weight="fill" className="text-red-500 shrink-0" />
                    <p className="font-medium">{error}</p>
                </div>
            )}

            <div className="bg-[var(--color-quinary)] rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden w-full">
                <div className="overflow-x-auto custom-scrollbar w-full">
                    <table className="w-full text-left min-w-[900px]">
                        <thead>
                            <tr className="bg-gray-50/50 text-gray-400 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                                <th className="px-6 py-4">Nombre / Razón Social</th>
                                <th className="px-6 py-4">Documento</th>
                                <th className="px-6 py-4">Contacto</th>
                                <th className="px-6 py-4">Pago</th>
                                <th className="px-6 py-4">Pedido</th>
                                <th className="px-6 py-4">Entrega</th>
                                {hasRole(['admin', 'gestor']) && <th className="px-6 py-4 text-right">Acciones</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm">
                            {customers.map(c => (
                                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors duration-200 group">
                                    <td className="px-6 py-4 text-[var(--color-tertiary)] font-bold">{c.nombre}</td>
                                    <td className="px-6 py-4 text-[var(--color-tertiary)] font-mono font-medium tracking-wide">
                                        <span className="text-gray-400 mr-2 font-semibold">{c.tipo_documento}</span>
                                        {c.numero_documento}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        <div className="flex flex-col gap-1.5">
                                            {c.email && (
                                                <div className="flex items-center gap-1.5 text-xs">
                                                    <PhosphorIcons.EnvelopeSimple size={14} className="text-gray-400" />
                                                    <span className="truncate max-w-[150px]">{c.email}</span>
                                                </div>
                                            )}
                                            {c.telefono && (
                                                <div className="flex items-center gap-1.5 text-xs">
                                                    <PhosphorIcons.Phone size={14} className="text-gray-400" />
                                                    <span>{c.telefono}</span>
                                                </div>
                                            )}
                                            {c.direccion && (
                                                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                                    <PhosphorIcons.MapPin size={14} />
                                                    <span className="truncate max-w-[150px]">{c.direccion}</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-bold ${c.condicion_pago === 'CONTADO' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-orange-50 text-orange-600 border border-orange-100'
                                            }`}>
                                            {c.condicion_pago}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {c.canal_pedido ? (
                                            <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 whitespace-nowrap">
                                                {c.canal_pedido === 'PRESENCIAL' && 'Presencial'}
                                                {c.canal_pedido === 'WHATSAPP' && 'WhatsApp'}
                                                {c.canal_pedido === 'TELEFONO' && 'Teléfono'}
                                                {c.canal_pedido === 'ONLINE' && 'Online'}
                                                {c.canal_pedido === 'OTRO' && 'Otro'}
                                            </span>
                                        ) : <span className="text-gray-300 text-xs">—</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                        {c.canal_entrega ? (
                                            <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-violet-50 text-violet-600 border border-violet-100 whitespace-nowrap">
                                                {c.canal_entrega === 'RECOGE_TIENDA' && 'Recoge'}
                                                {c.canal_entrega === 'DELIVERY_DOMICILIO' && 'Delivery'}
                                                {c.canal_entrega === 'COURIER' && 'Courier'}
                                                {c.canal_entrega === 'OTRO' && 'Otro'}
                                            </span>
                                        ) : <span className="text-gray-300 text-xs">—</span>}
                                    </td>
                                    {hasRole(['admin', 'gestor']) && (
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleOpenForm(c)} className="p-2 bg-[var(--color-quaternary)] hover:bg-[var(--color-primary)]/10 text-[var(--color-secondary)] hover:text-[var(--color-primary)] rounded-xl transition-colors border border-transparent hover:border-[var(--color-primary)]/20 shadow-sm">
                                                    <PhosphorIcons.PencilSimple size={16} weight="bold" />
                                                </button>
                                                <button onClick={() => handleDeleteRequest(c.id)} className="p-2 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 rounded-xl transition-colors border border-transparent hover:border-red-200 shadow-sm">
                                                    <PhosphorIcons.Trash size={16} weight="bold" />
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {customers.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <PhosphorIcons.Users size={64} weight="duotone" className="mb-4 opacity-50 text-gray-300" />
                        <p className="text-lg font-bold text-[var(--color-tertiary)]">No se encontraron clientes.</p>
                    </div>
                )}
            </div>

            {isFormVisible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:pl-56 animate-fade-in">
                    <div className="absolute inset-0 bg-[var(--color-tertiary)]/30 backdrop-blur-sm" onClick={handleCloseForm}></div>
                    <div className="relative z-10 w-full max-w-2xl animate-slide-up shadow-[0_20px_40px_rgba(0,0,0,0.1)] rounded-3xl">
                        <StakeholderForm
                            type="customer"
                            initialData={editingCustomer}
                            onSave={handleSave}
                            onCancel={handleCloseForm}
                            loading={loading}
                        />
                    </div>
                </div>
            )}

            {/* Confirm Delete Dialog */}
            {deleteConfirmId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:pl-56 animate-fade-in">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)} />
                    <div className="relative z-10 w-full max-w-sm bg-[var(--color-quinary)] border border-gray-100 rounded-2xl p-6 shadow-2xl animate-slide-up">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 bg-red-50 rounded-xl border border-red-100 text-red-500">
                                <PhosphorIcons.Trash size={20} weight="fill" />
                            </div>
                            <h3 className="text-base font-bold text-[var(--color-tertiary)]">Eliminar cliente</h3>
                        </div>
                        <p className="text-gray-500 text-sm font-medium mb-6 leading-relaxed">
                            ¿Estás seguro de eliminar este cliente? Esta acción no se puede deshacer.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="flex-1 px-4 py-2.5 text-sm font-medium bg-[var(--color-quaternary)] hover:bg-gray-100 text-[var(--color-tertiary)] rounded-xl border border-gray-200 transition-colors"
                            >Cancelar</button>
                            <button
                                onClick={handleDeleteConfirm}
                                className="flex-1 px-4 py-2.5 text-sm font-bold bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors shadow-sm"
                            >Eliminar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
