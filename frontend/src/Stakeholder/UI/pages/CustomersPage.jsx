import React, { useEffect, useState } from 'react';
import { useCustomerActions } from '../../Application/useStakeholderSearch.js';
import { Button } from '../../../CommonLayer/components/ui/Button.jsx';
import { StakeholderForm } from '../components/StakeholderForm.jsx';

export const CustomersPage = () => {
    const { customers, fetchCustomers, createCustomer, updateCustomer, deleteCustomer, loading, error } = useCustomerActions();
    const [isFormVisible, setFormVisible] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

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
            } else {
                await createCustomer(data);
            }
            handleCloseForm();
        } catch (err) {
            // Error managed by hook, could trigger local toast
            alert(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Está seguro de eliminar este cliente?')) {
            try {
                await deleteCustomer(id);
            } catch (err) {
                alert(err.message);
            }
        }
    };

    return (
        <div className="animate-fade-in w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-white/10 pb-6 gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 md:p-4 bg-blue-500/10 rounded-2xl relative border border-blue-500/20 shadow-inner">
                        <svg className="w-8 h-8 md:w-10 md:h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-light text-white tracking-wide">
                            Gestión de <span className="font-bold text-blue-400">Clientes</span>
                        </h1>
                        <p className="text-gray-500 text-sm md:text-base mt-2">Administra la información de los compradores.</p>
                    </div>
                </div>
                <Button onClick={() => handleOpenForm(null)} variant="primary" className="w-full md:w-auto shadow-blue-500/30 text-base py-3 md:py-3 px-6 bg-blue-600 hover:bg-blue-500 border-blue-500">
                    <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Nuevo Cliente
                    </span>
                </Button>
            </div>

            <form onSubmit={handleSearch} className="mb-6 flex gap-2 w-full md:max-w-md">
                <input
                    type="text"
                    placeholder="Buscar por nombre o documento..."
                    className="flex-1 bg-black/40 border border-gray-700/50 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button type="submit" variant="secondary" className="px-4">Buscar</Button>
            </form>

            {loading && !isFormVisible && (
                <div className="flex justify-center flex-col items-center py-12 gap-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-400"></div>
                </div>
            )}

            {error && (
                <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl flex items-center gap-3">
                    <p>{error}</p>
                </div>
            )}

            <div className="bg-gray-900/60 backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl overflow-hidden w-full">
                <div className="overflow-x-auto custom-scrollbar w-full">
                    <table className="w-full text-left min-w-[900px]">
                        <thead>
                            <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-medium">Nombre / Razón Social</th>
                                <th className="px-6 py-4 font-medium">Documento</th>
                                <th className="px-6 py-4 font-medium">Contacto</th>
                                <th className="px-6 py-4 font-medium">Condición Pago</th>
                                <th className="px-6 py-4 font-medium text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {customers.map(c => (
                                <tr key={c.id} className="hover:bg-white/5 transition-colors duration-200">
                                    <td className="px-6 py-4 text-gray-200 font-medium">{c.nombre}</td>
                                    <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                                        <span className="text-gray-500 mr-1">{c.tipo_documento}</span>
                                        {c.numero_documento}
                                    </td>
                                    <td className="px-6 py-4 text-gray-400">
                                        <div className="flex flex-col gap-1">
                                            {c.email && <span className="text-xs truncate max-w-[150px]">{c.email}</span>}
                                            {c.telefono && <span className="text-xs">{c.telefono}</span>}
                                            {c.direccion && <span className="text-xs text-gray-500 truncate max-w-[150px]">{c.direccion}</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${c.condicion_pago === 'CONTADO' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                                            }`}>
                                            {c.condicion_pago}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleOpenForm(c)} className="p-2 bg-gray-800 hover:bg-gray-700 text-blue-400 rounded-lg transition-colors border border-gray-700">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                            </button>
                                            <button onClick={() => handleDelete(c.id)} className="p-2 bg-gray-800 hover:bg-gray-700 text-red-400 rounded-lg transition-colors border border-gray-700">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {customers.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        <p className="text-lg">No se encontraron clientes.</p>
                    </div>
                )}
            </div>

            {isFormVisible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={handleCloseForm}></div>
                    <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-3xl animate-slide-up shadow-2xl shadow-blue-500/10">
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
        </div>
    );
};
