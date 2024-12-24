import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';

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
                        <Button
                            variant={location.pathname === '/' ? 'default' : 'ghost'}
                            asChild={true}
                        >
                            <Link to="/">Play Game</Link>
                        </Button>
                        
                        <Button
                            variant={location.pathname === '/history' ? 'default' : 'ghost'}
                            asChild={true}
                        >
                            <Link to="/history">Game History</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    );
}