import React from 'react';

export const Title = ({ children, icon }) => {
    return (
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            {icon && (
                <div className="p-3 md:p-4 bg-[var(--color-primary)]/10 rounded-2xl relative border border-[var(--color-primary)]/20 shadow-sm flex items-center justify-center">
                    {icon}
                </div>
            )}
            <div>
                <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-tertiary)] tracking-tight">
                    {children}
                </h1>
            </div>
        </div>
    );
};
