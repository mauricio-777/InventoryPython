import React, { useEffect, useState } from 'react';
import * as PhosphorIcons from '@phosphor-icons/react';
import { Title } from '../../../CommonLayer/components/ui/Title.jsx';
import { Button } from '../../../CommonLayer/components/ui/Button.jsx';
import { Table } from '../../../CommonLayer/components/ui/Table.jsx';
import { useOrderActions } from '../../Application/useOrderActions.js';
import { OrderFormPage } from './OrderFormPage.jsx';

// Status color mapping
const STATUS_STYLES = {
    'PENDING': 'bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] border-[var(--color-secondary)]/20',
    'PICKING': 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/20',
    'READY_TO_SHIP': 'bg-blue-100 text-blue-800 border-blue-200',
    'EN_ROUTE': 'bg-teal-100 text-teal-800 border-teal-200',
    'DELIVERED': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'CANCELLED': 'bg-red-100 text-red-800 border-red-200',
};

const STATUS_LABELS = {
    'PENDING': 'Pendiente',
    'PICKING': 'Recolectando',
    'READY_TO_SHIP': 'Empaquetado',
    'EN_ROUTE': 'En Camino',
    'DELIVERED': 'Entregado',
    'CANCELLED': 'Cancelado',
};

export function OrdersPage() {
    const { orders, fetchOrders, loading } = useOrderActions();
    const [isFormVisible, setIsFormVisible] = useState(false);

    useEffect(() => {
        fetchOrders();
        // Polling para simular vista en tiempo real (cada 5 segundos)
        const interval = setInterval(() => {
            fetchOrders();
        }, 5000);
        return () => clearInterval(interval);
    }, [fetchOrders]);

    const handleCreateClick = () => {
        setIsFormVisible(true);
    };

    const handleFormSuccess = () => {
        setIsFormVisible(false);
        fetchOrders();
    };

    const columns = [
        {
            label: 'ID / Fecha',
            key: 'id',
            render: (_, row) => (
                <div>
                    <div className="font-mono text-xs text-gray-500" title={row.id}>
                        {String(row.id).substring(0, 8).toUpperCase()}
                    </div>
                    <div className="text-sm">
                        {new Date(row.created_at).toLocaleDateString()}
                    </div>
                </div>
            )
        },
        {
            label: 'Cliente',
            key: 'customer_name'
        },
        {
            label: 'Cant. Items',
            key: 'items',
            render: (_, row) => (
                <div className="font-medium text-gray-900 text-center">
                    {row.items.reduce((sum, item) => sum + item.quantity_requested, 0)} uds
                </div>
            )
        },
        {
            label: 'Total',
            key: 'total',
            render: (_, row) => {
                const total = row.items.reduce((sum, item) => sum + (item.quantity_requested * item.unit_price), 0);
                return <span className="font-bold text-[var(--color-primary)]">Bs {total.toFixed(2)}</span>;
            }
        },
        {
            label: 'Estado',
            key: 'status',
            render: (_, row) => (
                <span className={`px-3 py-1 text-xs font-bold rounded-full border ${STATUS_STYLES[row.status] || STATUS_STYLES.PENDING}`}>
                    {STATUS_LABELS[row.status] || row.status}
                </span>
            )
        }
    ];

    const actions = (row) => (
        <div className="flex space-x-2">
            <button
                className="p-1.5 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-lg transition-colors"
                title="Ver Detalles"
            >
                <PhosphorIcons.Eye size={20} weight="fill" />
            </button>
        </div>
    );

    return (
        <div className="animate-fade-in w-full max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 md:p-4 bg-[var(--color-primary)]/10 rounded-2xl relative border border-[var(--color-primary)]/20 shadow-sm">
                        <PhosphorIcons.ShoppingCart size={32} weight="fill" className="text-[var(--color-primary)]" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-tertiary)] tracking-tight">
                            Gestión de Pedidos
                        </h1>
                        <p className="text-gray-500 text-sm md:text-base mt-1 font-medium">Administra nuevos pedidos de clientes y envíalos a picking.</p>
                    </div>
                </div>
                <Button variant="primary" className="w-full md:w-auto shadow-sm text-base py-3 px-6" onClick={handleCreateClick}>
                    <span className="flex items-center justify-center gap-2">
                        <PhosphorIcons.Plus size={20} weight="bold" />
                        Nuevo Pedido
                    </span>
                </Button>
            </div>

            <div className="bg-[var(--color-quinary)] rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden w-full">
                <div className="overflow-x-auto custom-scrollbar w-full">
                    {loading && orders.length === 0 ? (
                        <div className="p-16 text-center text-gray-500 flex flex-col items-center">
                            <PhosphorIcons.Spinner size={32} className="animate-spin mb-2 text-[var(--color-primary)]" />
                            <span className="font-medium text-gray-500">Cargando pedidos...</span>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="p-20 text-center text-gray-400 flex flex-col items-center">
                            <PhosphorIcons.ShoppingCart size={64} weight="duotone" className="mb-4 opacity-50 text-gray-300" />
                            <p className="text-lg font-bold text-[var(--color-tertiary)]">No hay pedidos registrados.</p>
                            <p className="text-sm mt-1 font-medium">Haz clic en "Nuevo Pedido" para comenzar.</p>
                            <Button variant="secondary" onClick={handleCreateClick} className="mt-4">
                                Crear Primer Pedido
                            </Button>
                        </div>
                    ) : (
                        <Table
                            columns={columns}
                            data={orders}
                            actions={actions}
                            keyExtractor={(item) => item.id}
                        />
                    )}
                </div>
            </div>

            {isFormVisible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:pl-[250px] animate-fade-in">
                    <div
                        className="absolute inset-0 bg-[var(--color-tertiary)]/30 backdrop-blur-sm"
                        onClick={() => setIsFormVisible(false)}
                    ></div>
                    <div className="relative z-10 w-full max-w-5xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-3xl animate-slide-up shadow-[0_20px_40px_rgba(0,0,0,0.15)] bg-[var(--color-quinary)]">
                        <OrderFormPage
                            onSuccess={handleFormSuccess}
                            onCancel={() => setIsFormVisible(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
