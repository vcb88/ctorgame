import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function Navbar() {
    const location = useLocation();
    
    return (
        <nav className="border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Лого/Название */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="text-xl font-bold">
                            CTORGame
                        </Link>
                    </div>

                    {/* Навигационные ссылки */}
                    <div className="flex items-center space-x-4">
                        <Link 
                            to="/"
                            className={cn(
                                "inline-flex items-center justify-center rounded-md font-medium transition-colors",
                                location.pathname === '/' 
                                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                    : "hover:bg-accent hover:text-accent-foreground"
                            )}
                        >
                            Play Game
                        </Link>
                        
                        <Link 
                            to="/history"
                            className={cn(
                                "inline-flex items-center justify-center rounded-md font-medium transition-colors",
                                location.pathname === '/history'
                                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                    : "hover:bg-accent hover:text-accent-foreground"
                            )}
                        >
                            Game History
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}