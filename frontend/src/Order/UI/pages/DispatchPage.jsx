import React, { useEffect, useState } from 'react';
import * as PhosphorIcons from '@phosphor-icons/react';
import { Title } from '../../../CommonLayer/components/ui/Title.jsx';
import { Button } from '../../../CommonLayer/components/ui/Button.jsx';
import { useOrderActions } from '../../Application/useOrderActions.js';

import { useToast } from '../../../CommonLayer/context/ToastContext.jsx';

// Status color mapping
const STATUS_STYLES = {
    'READY_TO_SHIP': 'bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] border-[var(--color-secondary)]/20',
    'EN_ROUTE': 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/20',
};

const STATUS_LABELS = {
    'READY_TO_SHIP': 'Listo para Despacho',
    'EN_ROUTE': 'En Ruta de Entrega',
};

export function DispatchPage() {
    const userId = localStorage.getItem('userName') || 'system';
    const { showToast } = useToast();
    const { orders, fetchOrders, updateOrderStatus, assignOrder, loading } = useOrderActions();

    const [activeOrder, setActiveOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(() => {
            fetchOrders();
        }, 5000);
        return () => clearInterval(interval);
    }, [fetchOrders]);

    // Omit canceled, delivered, pending, picking. Only show READY_TO_SHIP or EN_ROUTE
    const dispatchTasks = orders.filter(o => o.status === 'READY_TO_SHIP' || o.status === 'EN_ROUTE');

    const handleAssignToMe = async (orderId) => {
        const result = await assignOrder(orderId, { driver_id: userId });
        if (result.success) {
            await updateOrderStatus(orderId, 'EN_ROUTE');
            showToast('Pedido asignado correctamente. En Ruta.', 'success');
            fetchOrders();
        } else {
            showToast(result.error, 'error');
        }
    };

    const handleOpenTask = (order) => {
        setActiveOrder(order);
    };

    const handleCloseTask = () => {
        setActiveOrder(null);
        fetchOrders();
    };

    const handleDeliverOrder = async () => {
        // En un MVP avanzado, aquí subiríamos la firma o foto (Proof of Delivery / POD)
        const result = await updateOrderStatus(activeOrder.id, 'DELIVERED');
        if (result.success) {
            showToast('¡Entrega confirmada! El pedido ha sido marcado como Entregado.', 'success');
            handleCloseTask();
        } else {
            showToast(result.error, 'error');
        }
    };

    if (activeOrder) {
        return (
            <div className="space-y-6 animate-fade-in w-full pb-8">
                <div className="flex bg-white p-6 rounded-2xl shadow-sm border border-gray-100 justify-between items-center">
                    <div>
                        <button onClick={handleCloseTask} className="text-gray-500 hover:text-gray-800 mb-2 flex items-center gap-1 font-bold text-sm">
                            <PhosphorIcons.ArrowLeft size={16} weight="bold" /> Volver a Entregas
                        </button>
                        <Title icon={<PhosphorIcons.Truck size={28} weight="fill" className="text-[var(--color-primary)]" />}>
                            Ruta: Pedido {String(activeOrder.id).substring(0, 8).toUpperCase()}
                        </Title>
                    </div>
                    <Button variant="primary" onClick={handleDeliverOrder} className="h-12 px-6">
                        Confirmar Entrega (Sin Firma/MVP)
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Información del Cliente */}
                    <div className="col-span-1 lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg text-[var(--color-primary)] font-bold mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
                            <PhosphorIcons.MapPinLine size={24} />
                            Información de Entrega
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Cliente</p>
                                <p className="text-lg font-bold text-gray-900">{activeOrder.customer_name}</p>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Dirección de Envío</p>
                                <p className="text-base text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    {activeOrder.shipping_address || 'Dirección no especificada'}
                                </p>
                            </div>
                            {activeOrder.notes && (
                                <div>
                                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Notas del Pedido</p>
                                    <p className="text-sm text-gray-600 italic bg-amber-50 rounded-xl p-3 border border-amber-100">
                                        "{activeOrder.notes}"
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Acciones Adicionales (MVP) */}
                    <div className="col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-start">
                        <h3 className="text-lg text-[var(--color-primary)] font-bold mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
                            <PhosphorIcons.FilePdf size={24} />
                            Documentación
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Entregue los productos al cliente. La recopilación de firmas o fotos probatorias se registrará de manera simplificada en esta versión del sistema.
                        </p>
                    </div>

                    {/* Resumen del Paquete */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg text-[var(--color-primary)] font-bold mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
                            <PhosphorIcons.Package size={24} />
                            Paquetes
                        </h3>
                        <div className="space-y-3">
                            {activeOrder.items.map(item => (
                                <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-900">{item.product_name}</span>
                                        <span className="text-xs text-gray-500 mt-1">Lote: {item.batch_id ? String(item.batch_id).substring(0, 8) : 'N/A'}</span>
                                    </div>
                                    <div className="font-black text-[var(--color-primary)] text-lg">
                                        x{item.quantity_requested}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in w-full max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 md:p-4 bg-[var(--color-primary)]/10 rounded-2xl relative border border-[var(--color-primary)]/20 shadow-sm">
                        <PhosphorIcons.Truck size={32} weight="fill" className="text-[var(--color-primary)]" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-tertiary)] tracking-tight">
                            Panel del Repartidor
                        </h1>
                        <p className="text-gray-500 text-sm md:text-base mt-1 font-medium">Asigna rutas y confirma las entregas a los clientes.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading && dispatchTasks.length === 0 ? (
                    <div className="col-span-full p-16 text-center text-gray-500 flex flex-col items-center bg-white rounded-2xl shadow-sm border border-gray-100">
                        <PhosphorIcons.Spinner size={32} className="animate-spin mb-2" />
                        Buscando rutas de entrega...
                    </div>
                ) : dispatchTasks.length === 0 ? (
                    <div className="col-span-full p-16 text-center text-gray-500 flex flex-col items-center bg-white rounded-2xl shadow-sm border border-gray-100">
                        <PhosphorIcons.Smiley size={56} weight="light" className="mb-4 text-[var(--color-primary)]" />
                        <p className="text-xl font-bold text-gray-700">Sin entregas pendientes</p>
                        <p className="text-sm mt-1">Todos los pedidos han sido enviados exitosamente.</p>
                    </div>
                ) : (
                    dispatchTasks.map(order => (
                        <div key={order.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow relative overflow-hidden group">
                            {/* Accent line top */}
                            <div className={`absolute top-0 left-0 right-0 h-1.5 ${order.status === 'EN_ROUTE' ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-secondary)]'}`}></div>

                            <div className="flex justify-between items-start mb-4 mt-2">
                                <span className={`px-3 py-1 text-xs font-bold rounded-full border ${STATUS_STYLES[order.status]}`}>
                                    {STATUS_LABELS[order.status]}
                                </span>
                                <span className="text-gray-400 text-xs font-mono">{new Date(order.created_at).toLocaleDateString()}</span>
                            </div>

                            <h3 className="font-bold text-lg text-gray-800 mb-1">
                                Cliente: {order.customer_name}
                            </h3>
                            <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                                {order.shipping_address || 'Dirección de cliente (Predeterminada)'}
                            </p>

                            <div className="flex mb-6 gap-2">
                                <div className="bg-gray-50 rounded-xl p-3 flex-1 text-center border border-gray-100">
                                    <span className="block text-lg font-black text-[var(--color-primary)]">{order.items.length}</span>
                                    <span className="text-[10px] uppercase font-bold text-gray-500">Cajas/Bultos</span>
                                </div>
                            </div>

                            {order.status === 'READY_TO_SHIP' && (
                                <Button variant="secondary" onClick={() => handleAssignToMe(order.id)} className="w-full justify-center bg-white border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white group-hover:shadow-md">
                                    Iniciar Ruta
                                </Button>
                            )}

                            {order.status === 'EN_ROUTE' && order.assigned_driver_id === userId && (
                                <Button variant="primary" onClick={() => handleOpenTask(order)} className="w-full justify-center">
                                    <PhosphorIcons.MapPin size={18} weight="fill" className="mr-2" />
                                    Ver Detalles de Entrega
                                </Button>
                            )}

                            {order.status === 'EN_ROUTE' && order.assigned_driver_id !== userId && (
                                <div className="text-center text-xs font-bold text-gray-400 p-2 bg-gray-50 rounded-lg">
                                    En ruta por otro conductor
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
