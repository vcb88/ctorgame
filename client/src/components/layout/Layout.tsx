import React, { useRef, useEffect } from 'react';
import { Navbar } from './Navbar.js';

interface LayoutProps {
    children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
    const contentRef = useRef<HTMLDivElement>(null);

    // Эффект для установки минимальной высоты контента
    useEffect(() => {
        const updateHeight = () => {
            if (contentRef.current) {
                const windowHeight = window.innerHeight;
                contentRef.current.style.minHeight = `${windowHeight}px`;
            }
        };

        updateHeight();
        window.addEventListener('resize', updateHeight);
        return () => window.removeEventListener('resize', updateHeight);
    }, []);

    return (
        <div className="relative w-full" ref={contentRef}>
            {/* Background container - всегда внизу */}
            <div className="fixed inset-0 z-0 overflow-hidden">
                {/* Здесь будут рендериться фоновые компоненты из дочерних элементов */}
            </div>

            {/* Main content container - всегда поверх фона */}
            <div className="relative z-10 flex flex-col min-h-full">
                {/* Navbar всегда сверху */}
                <Navbar />
                
                {/* Main content */}
                <main className="flex-grow">
                    {children}
                </main>
            </div>
        </div>
    );
}