import React from 'react';
import { useLocation } from 'react-router-dom';
import { logger } from '@/utils/logger';
import { cn } from '@/lib/utils';
import { CyberButton } from '@/components/ui/cyber-button';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const hideOnPaths = ['/game', '/waiting'];
  const shouldShow = !hideOnPaths.some(path => location.pathname.startsWith(path));

  if (!shouldShow) return null;

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50",
      "bg-black/20 backdrop-blur-lg",
      "border-b border-cyan-500/20",
      "transition-all duration-300",
      "animate-fade-in"
    )}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Home */}
          <Link
            to="/"
            className={cn(
              "text-lg font-bold",
              "text-cyan-400 hover:text-cyan-300",
              "transition-colors duration-300"
            )}
          >
            CTOR Game
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <NavLink to="/rules">Rules</NavLink>
            <NavLink to="/history">History</NavLink>
            <NavLink to="/settings">Settings</NavLink>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            <ActionButton to="/join" variant="secondary">Join Game</ActionButton>
            <ActionButton to="/create" variant="primary">Create Game</ActionButton>
          </div>
        </div>
      </div>
    </nav>
  );
};

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <CyberButton
      variant="ghost"
      size="sm"
      withTags={isActive}
      className={cn({
        "text-cyan-400": isActive,
        "text-gray-400": !isActive
      })}
      onClick={() => {
        logger.userAction(`navLink_${to.replace('/', '')}`);
        window.location.href = to;
      }}
    >
      {children}
    </CyberButton>
  );
};

interface ActionButtonProps {
  to: string;
  variant: 'primary' | 'secondary';
  children: React.ReactNode;
}

const ActionButton: React.FC<ActionButtonProps> = ({ to, variant, children }) => {
  const NavigateAndLog: React.MouseEventHandler = (e) => {
    e.preventDefault();
    logger.userAction(`${variant}ActionButton_${to.replace('/', '')}`);
    window.location.href = to;
  };

  return (
    <CyberButton
      variant={variant === 'primary' ? 'primary' : 'secondary'}
      size="sm"
      onClick={NavigateAndLog}
    >
      {children}
    </CyberButton>
  );
};