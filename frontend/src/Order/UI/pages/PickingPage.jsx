import React, { useEffect, useState, useCallback } from 'react';
import * as PhosphorIcons from '@phosphor-icons/react';
import { Title } from '../../../CommonLayer/components/ui/Title.jsx';
import { Button } from '../../../CommonLayer/components/ui/Button.jsx';
import { useOrderActions } from '../../Application/useOrderActions.js';
import { axiosInstance } from '../../../CommonLayer/config/axios-instance.js';
import { useToast } from '../../../CommonLayer/context/ToastContext.jsx';

// Status color mapping
const STATUS_STYLES = {
    'PENDING': 'bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] border-[var(--color-secondary)]/20',
    'PICKING': 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/20',
};

const STATUS_LABELS = {
    'PENDING': 'Pendiente',
    'PICKING': 'Recolectando',
};

export function PickingPage() {
    const userId = localStorage.getItem('userName') || 'system';
    const { showToast } = useToast();
    const { orders, fetchOrders, updateOrderStatus, assignOrder, pickItem, loading } = useOrderActions();

    const [activeOrder, setActiveOrder] = useState(null);
    // Map de product_id -> lote disponible (para mostrar ubicación cuando batch_id es null)
    const [productBatches, setProductBatches] = useState({});

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(() => {
            fetchOrders();
        }, 5000);
        return () => clearInterval(interval);
    }, [fetchOrders]);

    // Cuando se abre una tarea, cargar los lotes disponibles de cada producto
    const loadBatchesForOrder = useCallback(async (order) => {
        const productIds = [...new Set(order.items.filter(i => !i.batch_id).map(i => i.product_id))];
        const batchMap = {};
        await Promise.all(productIds.map(async (pid) => {
            try {
                const res = await axiosInstance.get(`/batches/product/${pid}?active_only=true`);
                const batches = res.data;
                if (batches && batches.length > 0) {
                    // Ordenar por fecha de compra más antigua primero (FIFO)
                    batches.sort((a, b) => new Date(a.purchase_date) - new Date(b.purchase_date));
                    batchMap[pid] = batches[0]; // Tomar el primero disponible
                }
            } catch (_) { /* silent — no mostrar error si no hay lotes */ }
        }));
        setProductBatches(batchMap);
    }, []);

    // Filter to only show PENDING or PICKING orders
    const pickingTasks = orders.filter(o => o.status === 'PENDING' || o.status === 'PICKING');

    const handleAssignToMe = async (orderId) => {
        const result = await assignOrder(orderId, { picker_id: userId });
        if (result.success) {
            await updateOrderStatus(orderId, 'PICKING');
            showToast('Pedido asignado correctamente. Iniciando recolección.', 'success');
            fetchOrders();
        } else {
            showToast(result.error, 'error');
        }
    };

    const handleOpenTask = (order) => {
        setActiveOrder(order);
        loadBatchesForOrder(order);
    };

    const handleCloseTask = () => {
        setActiveOrder(null);
        setProductBatches({});
        fetchOrders();
    };

    const handlePickItemClick = async (itemId, batchId, quantity, productId) => {
        // Si no hay batch asignado en el item, enviar el productId para auto-asignación
        const effectiveBatchId = batchId || 'DUMMY_BATCH_PARA_UI';
        const result = await pickItem(itemId, effectiveBatchId, quantity);
        if (result.success) {
            showToast('Item recolectado correctamente', 'success');
            const updatedOrder = await fetchOrders();
            if (updatedOrder.success) {
                const refreshedOrder = updatedOrder.data.find(o => o.id === activeOrder.id);
                if (refreshedOrder) {
                    setActiveOrder(refreshedOrder);
                    loadBatchesForOrder(refreshedOrder);
                }
            }
        } else {
            showToast(result.error || 'Error al recolectar item', 'error');
        }
    };

    const handleFinishPicking = async () => {
        // Validate all items are picked (in MVP, we just switch status)
        const allPicked = activeOrder.items.every(i => i.quantity_picked >= i.quantity_requested);
        if (!allPicked && !window.confirm("Hay items sin recolectar completamente. ¿Desea finalizar de todos modos?")) {
            return;
        }

        const result = await updateOrderStatus(activeOrder.id, 'READY_TO_SHIP');
        if (result.success) {
            showToast('Recolección finalizada. Pedido enviado a despacho.', 'success');
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
                            <PhosphorIcons.ArrowLeft size={16} weight="bold" /> Volver a Tareas
                        </button>
                        <Title icon={<PhosphorIcons.MagnifyingGlass size={28} weight="fill" className="text-[var(--color-primary)]" />}>
                            Recolección: Pedido {String(activeOrder.id).substring(0, 8).toUpperCase()}
                        </Title>
                    </div>
                    <Button variant="primary" onClick={handleFinishPicking} className="h-12 px-6">
                        Finalizar Picking
                    </Button>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg text-[var(--color-primary)] font-bold mb-4 border-b border-gray-100 pb-2">
                        Lista de Artículos a Extraer
                    </h3>

                    <div className="space-y-4">
                        {activeOrder.items.map(item => {
                            const isFullyPicked = item.quantity_picked >= item.quantity_requested;
                            return (
                                <div key={item.id} className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border ${isFullyPicked ? 'bg-[var(--color-primary)]/5 border-[var(--color-primary)]/20' : 'bg-gray-50 border-gray-200'} transition-all`}>
                                    <div>
                                        <div className="font-bold text-lg text-gray-900">{item.product_name}</div>
                                        <div className="text-sm font-semibold text-gray-500 mt-1 flex flex-wrap items-center gap-4">
                                            <span className="flex items-center gap-1">
                                                <PhosphorIcons.MapPinLine size={16} />
                                                Ubicación:
                                                {(() => {
                                                    const loc = item.location_code && item.location_code !== 'N/A'
                                                        ? item.location_code
                                                        : productBatches[item.product_id]?.location_code || null;
                                                    return loc
                                                        ? <span className="text-[var(--color-primary)] border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/10 px-2 py-0.5 rounded-md min-w-[70px] text-center inline-block ml-1">{loc}</span>
                                                        : <span className="text-gray-400 border border-gray-200 bg-gray-50 px-2 py-0.5 rounded-md inline-block ml-1">Lote sin ubicación</span>;
                                                })()}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <PhosphorIcons.Package size={16} />
                                                Lote:
                                                {item.batch_id
                                                    ? <span className="text-[var(--color-secondary)] border border-[var(--color-secondary)]/20 bg-[var(--color-secondary)]/10 px-2 py-0.5 rounded-md font-mono text-xs inline-block ml-1">{String(item.batch_id).substring(0, 8).toUpperCase()}</span>
                                                    : productBatches[item.product_id]
                                                        ? <span className="text-emerald-600 border border-emerald-200 bg-emerald-50 px-2 py-0.5 rounded-md font-mono text-xs inline-block ml-1">{String(productBatches[item.product_id].id).substring(0, 8).toUpperCase()} ✓</span>
                                                        : <span className="text-red-500 border border-red-200 bg-red-50 px-2 py-0.5 rounded-md inline-block ml-1">Sin stock</span>
                                                }
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-4 md:mt-0 flex items-center gap-6">
                                        <div className="text-center">
                                            <div className="text-xs uppercase font-bold text-gray-500">Progreso</div>
                                            <div className="text-xl font-black text-[var(--color-primary)]">
                                                {item.quantity_picked} / {item.quantity_requested}
                                            </div>
                                        </div>

                                        {!isFullyPicked ? (
                                            productBatches[item.product_id] || item.batch_id
                                                ? (
                                                    <Button
                                                        variant="secondary"
                                                        onClick={() => handlePickItemClick(item.id, item.batch_id, item.quantity_requested - item.quantity_picked, item.product_id)}
                                                        className="bg-white border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white"
                                                    >
                                                        <PhosphorIcons.HandGrabbing size={16} weight="bold" className="inline mr-1" />
                                                        Recolectar {item.quantity_requested - item.quantity_picked}
                                                    </Button>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-xl text-xs font-bold">
                                                        <PhosphorIcons.Warning size={16} weight="fill" />
                                                        Sin stock
                                                    </div>
                                                )
                                        ) : (
                                            <div className="bg-[var(--color-primary)] text-white p-2 rounded-full shadow-sm">
                                                <PhosphorIcons.Check size={24} weight="bold" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="animate-fade-in w-full max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 md:p-4 bg-[var(--color-primary)]/10 rounded-2xl relative border border-[var(--color-primary)]/20 shadow-sm">
                        <PhosphorIcons.HandGrabbing size={32} weight="fill" className="text-[var(--color-primary)]" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-tertiary)] tracking-tight">
                            Panel de Recolección
                        </h1>
                        <p className="text-gray-500 text-sm md:text-base mt-1 font-medium">Extrae los productos del almacén para preparar los pedidos.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading && pickingTasks.length === 0 ? (
                    <div className="col-span-full p-16 text-center text-gray-500 flex flex-col items-center bg-white rounded-2xl shadow-sm border border-gray-100">
                        <PhosphorIcons.Spinner size={32} className="animate-spin mb-2" />
                        Buscando tareas de recolección...
                    </div>
                ) : pickingTasks.length === 0 ? (
                    <div className="col-span-full p-16 text-center text-gray-500 flex flex-col items-center bg-white rounded-2xl shadow-sm border border-gray-100">
                        <PhosphorIcons.CheckCircle size={56} weight="light" className="mb-4 text-[var(--color-primary)]" />
                        <p className="text-xl font-bold text-gray-700">¡Almacén al día!</p>
                        <p className="text-sm mt-1">No hay pedidos pendientes de recolección en este momento.</p>
                    </div>
                ) : (
                    pickingTasks.map(order => (
                        <div key={order.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow relative overflow-hidden group">
                            {/* Accent line top */}
                            <div className={`absolute top-0 left-0 right-0 h-1.5 ${order.status === 'PICKING' ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-secondary)]'}`}></div>

                            <div className="flex justify-between items-start mb-4 mt-2">
                                <span className={`px-3 py-1 text-xs font-bold rounded-full border ${STATUS_STYLES[order.status]}`}>
                                    {STATUS_LABELS[order.status]}
                                </span>
                                <span className="text-gray-400 text-xs font-mono">{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>

                            <h3 className="font-bold text-lg text-gray-800 mb-1">
                                Pedido #{String(order.id).substring(0, 6).toUpperCase()}
                            </h3>
                            <p className="text-sm text-gray-500 mb-4 line-clamp-1">{order.customer_name}</p>

                            <div className="bg-gray-50 rounded-xl p-3 mb-6 flex justify-between items-center border border-gray-100">
                                <div className="text-center">
                                    <span className="block text-xl font-black text-[var(--color-primary)]">{order.items.length}</span>
                                    <span className="text-[10px] uppercase font-bold text-gray-500">Items</span>
                                </div>
                                <div className="w-[1px] h-8 bg-gray-200"></div>
                                <div className="text-center">
                                    <span className="block text-xl font-black text-gray-700">
                                        {order.items.reduce((sum, item) => sum + item.quantity_requested, 0)}
                                    </span>
                                    <span className="text-[10px] uppercase font-bold text-gray-500">Uds Totales</span>
                                </div>
                            </div>

                            {order.status === 'PENDING' && (
                                <Button variant="secondary" onClick={() => handleAssignToMe(order.id)} className="w-full justify-center bg-white border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white group-hover:shadow-md">
                                    Tomar Tarea
                                </Button>
                            )}

                            {order.status === 'PICKING' && order.assigned_picker_id === userId && (
                                <Button variant="primary" onClick={() => handleOpenTask(order)} className="w-full justify-center">
                                    <PhosphorIcons.Play size={18} weight="fill" className="mr-2" />
                                    Continuar Recolección
                                </Button>
                            )}

                            {order.status === 'PICKING' && order.assigned_picker_id !== userId && (
                                <div className="text-center text-xs font-bold text-gray-400 p-2 bg-gray-50 rounded-lg">
                                    Asignado a otro operario
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
