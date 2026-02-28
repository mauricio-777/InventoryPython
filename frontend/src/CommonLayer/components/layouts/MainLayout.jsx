import React, { useState } from 'react';

export const MainLayout = ({ children, currentView, setView }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const handleNav = (id) => {
        setView(id);
        setIsMobileMenuOpen(false);
    };

    const navItems = [
        { id: 'products', name: 'Catálogo', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
        { id: 'purchases', name: 'Comprar Lote', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' },
        { id: 'pos', name: 'Punto de Venta', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
        { id: 'batches', name: 'Stock Activo', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
        { id: 'audit', name: 'Auditoría', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
    ];

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
                        {navItems.map(item => (
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
