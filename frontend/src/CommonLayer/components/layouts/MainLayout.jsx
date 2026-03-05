import React, { useState } from 'react';
import { NAV_ITEMS } from '../../../Router/routes.js';
import { useUserRole } from '../../hooks/useUserRole.js';
import * as PhosphorIcons from '@phosphor-icons/react';

export const MainLayout = ({ children, currentView, setView, onLogout }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { userRole, userName, clearUserData } = useUserRole();

    const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    /** Cierra sesión y llama al callback del App */
    const handleLogoutClick = () => {
        clearUserData();
        if (onLogout) onLogout();
    };

    const handleNav = (id) => {
        setView(id);
        setIsMobileMenuOpen(false);
    };

    // Filtrar items de navegación según el rol del usuario
    const filteredNavItems = NAV_ITEMS.filter(item => {
        if (!item.roles || item.roles.length === 0) return true;
        return item.roles.includes(userRole);
    });

    return (
        <div className="flex h-screen bg-[var(--color-quaternary)] overflow-hidden text-[var(--color-tertiary)] font-sans relative">

            {/* Mobile Header */}
            <div className="md:hidden absolute top-0 left-0 w-full h-16 bg-[var(--color-quinary)]/90 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-4 z-40 shadow-sm">
                <h2 className="text-xl font-bold text-[var(--color-tertiary)]">
                    Inventory<span className="font-light text-[var(--color-primary)]">App</span>
                </h2>
                <button onClick={toggleMenu} className="p-2 text-gray-500 hover:text-[var(--color-primary)] focus:outline-none">
                    <PhosphorIcons.List size={24} weight="bold" />
                </button>
            </div>

            {/* Backdrop for mobile sidebar */}
            {isMobileMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-[var(--color-tertiary)]/20 z-20 backdrop-blur-sm transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <nav className={`fixed md:relative inset-y-0 left-0 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 w-72 bg-[var(--color-quinary)] md:bg-[var(--color-quinary)]/95 backdrop-blur-xl flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-30 transition-transform duration-300 ease-in-out h-full`}>
                <div className="p-8 pb-4 hidden md:block">
                    <h2 className="text-2xl font-bold text-[var(--color-tertiary)] tracking-tight">
                        Inventory<span className="font-light text-[var(--color-primary)]">App</span>
                    </h2>
                </div>

                <div className="flex-1 px-4 py-4 md:py-6 overflow-y-auto custom-scrollbar mt-16 md:mt-0">
                    <ul className="space-y-2">
                        {filteredNavItems.map(item => {
                            const IconComponent = PhosphorIcons[item.icon] || PhosphorIcons.Circle;
                            const isActive = currentView === item.id;

                            return (
                                <li
                                    key={item.id}
                                    className={`px-4 py-3 cursor-pointer transition-all duration-300 rounded-2xl flex items-center space-x-3 group ${isActive
                                            ? 'bg-[var(--color-primary)] text-[var(--color-quinary)] shadow-md shadow-[var(--color-primary)]/20'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-[var(--color-primary)]'
                                        }`}
                                    onClick={() => handleNav(item.id)}
                                >
                                    <IconComponent
                                        size={22}
                                        weight={isActive ? "fill" : "regular"}
                                        className={`shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}
                                    />
                                    <span className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">{item.name}</span>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* User Info Section */}
                <div className="p-6 pt-4">
                    <div className="bg-[var(--color-quaternary)]/50 rounded-3xl p-4 space-y-4 border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center shrink-0 shadow-sm text-[var(--color-quinary)] font-bold text-sm">
                                {userName?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[var(--color-tertiary)] text-sm font-bold truncate">{userName}</p>
                                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">
                                    {userRole === 'admin' && 'Administrador'}
                                    {userRole === 'gestor' && 'Gestor'}
                                    {userRole === 'consultor' && 'Consultor'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogoutClick}
                            className="w-full px-4 py-2.5 text-sm font-medium bg-white hover:bg-gray-50 text-[var(--color-tertiary)] rounded-2xl border border-gray-200 transition-colors shadow-sm flex items-center justify-center gap-2 group"
                        >
                            <PhosphorIcons.SignOut size={18} weight="bold" className="text-gray-400 group-hover:text-red-500 transition-colors" />
                            Cerrar sesión
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="flex-1 overflow-hidden relative custom-scrollbar flex flex-col">
                <div className="relative z-10 w-full h-full p-4 pt-20 md:p-8 overflow-y-auto custom-scrollbar">
                    <div className="w-full max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};
