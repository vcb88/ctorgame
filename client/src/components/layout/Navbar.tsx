import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../*ui/button.js.js';

export function Navbar() {
    const location = useLocation();
    
    return (
        <nav className="sticky top-0 border-b backdrop-blur-md bg-black/30 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Лого/Название */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link 
                            to="/" 
                            className="text-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent
                                     hover:from-cyan-400 hover:to-blue-400 transition-all duration-300"
                        >
                            CTORGame
                        </Link>
                    </div>

                    {/* Навигационные ссылки */}
                    <div className="flex items-center space-x-4">
                        <Button
                            variant={location.pathname === '/' ? 'default' : 'ghost'}
                            className="hover:bg-cyan-500/10 transition-colors duration-300"
                            asChild
                        >
                            <Link to="/">Play Game</Link>
                        </Button>
                        
                        <Button
                            variant={location.pathname === '/history' ? 'default' : 'ghost'}
                            className="hover:bg-cyan-500/10 transition-colors duration-300"
                            asChild
                        >
                            <Link to="/history">Game History</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    );
}