import React, { useState } from 'react';
import { NAV_ITEMS } from '../../../Router/routes.js';
import { useUserRole } from '../../hooks/useUserRole.js';

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
        <div className="flex h-screen bg-transparent overflow-hidden text-gray-100 font-sans relative">

            {/* Mobile Header */}
            <div className="md:hidden absolute top-0 left-0 w-full h-16 bg-gray-900/90 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-4 z-40">
                <h2 className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                    Inventory<span className="font-light">App</span>
                </h2>
                <button onClick={toggleMenu} className="p-2 text-gray-300 hover:text-white focus:outline-none">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isMobileMenuOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>

            {/* Backdrop for mobile sidebar */}
            {isMobileMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-20 backdrop-blur-sm transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <nav className={`fixed md:relative inset-y-0 left-0 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 w-64 bg-gray-900/95 md:bg-gray-900/80 backdrop-blur-xl border-r border-white/10 flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)] z-30 transition-transform duration-300 ease-in-out h-full`}>
                <div className="p-6 border-b border-white/10 hidden md:block">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent transform hover:scale-105 transition-transform duration-300">
                        Inventory<span className="font-light">App</span>
                    </h2>
                </div>

                <div className="flex-1 py-4 md:py-6 overflow-y-auto custom-scrollbar mt-16 md:mt-0">
                    <ul className="space-y-1">
                        {filteredNavItems.map(item => (
                            <li
                                key={item.id}
                                className={`px-6 py-3 cursor-pointer transition-all duration-200 border-r-4 ${currentView === item.id
                                    ? 'bg-green-500/10 border-green-400 text-green-400'
                                    : 'border-transparent text-gray-400 hover:bg-white/5 hover:text-gray-200'
                                    }`}
                                onClick={() => handleNav(item.id)}
                            >
                                <div className="flex items-center space-x-3">
                                    <svg className={`shrink-0 w-5 h-5 ${currentView === item.id ? 'text-green-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                    </svg>
                                    <span className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">{item.name}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* User Info Section */}
                <div className="p-4 border-t border-white/10">
                    <div className="bg-white/5 rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shrink-0">
                                <span className="text-gray-900 font-bold text-sm">
                                    {userName?.[0]?.toUpperCase() || '?'}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">{userName}</p>
                                <p className="text-gray-500 text-xs uppercase tracking-wider">
                                    {userRole === 'admin' && 'Administrador'}
                                    {userRole === 'gestor' && 'Gestor'}
                                    {userRole === 'consultor' && 'Consultor'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogoutClick}
                            className="w-full px-3 py-2 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/30 transition-colors"
                        >
                            Cerrar sesión
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="flex-1 overflow-hidden relative custom-scrollbar flex flex-col">
                {/* Iluminación decorativa global */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] bg-green-500/5 rounded-full blur-[120px] pointer-events-none z-0"></div>

                <div className="relative z-10 w-full h-full p-4 pt-20 md:p-8 overflow-y-auto custom-scrollbar">
                    <div className="w-full">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};
