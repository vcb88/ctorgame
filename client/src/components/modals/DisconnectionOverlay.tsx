import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.js';
import { logger } from '@/utils/logger.js';

interface DisconnectionOverlayProps {
  onReconnect?: () => void;
}

export const DisconnectionOverlay: React.FC<DisconnectionOverlayProps> = ({
  onReconnect
}) => {
  const navigate = useNavigate();

  const handleLeave = () => {
    logger.userAction('leaveDisconnectedGame');
    navigate('/');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="flex flex-col items-center gap-4">
          <h3 className="text-xl font-semibold">Connection Lost</h3>
          
          <div className="animate-pulse flex items-center gap-2 text-gray-600">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <span>Attempting to reconnect...</span>
          </div>

          <div className="text-center text-gray-600 mb-4">
            Your opponent has disconnected.
            <br />
            Waiting for them to rejoin...
          </div>

          <Button
            variant="outline"
            onClick={handleLeave}
          >
            Leave Game
          </Button>
        </div>
      </div>
    </div>
  );
};