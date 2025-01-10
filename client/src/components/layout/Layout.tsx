import React from 'react';

interface LayoutProps {
    children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
    return (
        <div className="min-h-screen bg-slate-900">
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 pt-20">
                {children}
            </main>
        </div>
    );
}