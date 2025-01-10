import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface NeonBillboardProps {
  gameCode: string;
  onCopy?: () => void;
}

export const NeonBillboard: React.FC<NeonBillboardProps> = ({
  gameCode,
  onCopy
}) => {
  const [isGlitching, setIsGlitching] = useState(false);

  const handleCopy = () => {
    setIsGlitching(true);
    navigator.clipboard.writeText(gameCode);
    onCopy?.();
    setTimeout(() => setIsGlitching(false), 500);
  };

  return (
    <motion.div
      className="relative group"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      {/* Background frame */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 rounded-lg blur-xl group-hover:blur-2xl transition-all" />
      
      {/* Main container */}
      <div className="relative bg-black/50 backdrop-blur-sm border border-white/10 rounded-lg p-6 cursor-pointer"
           onClick={handleCopy}>
        {/* Glitch effect */}
        {isGlitching && (
          <>
            <div className="absolute inset-0 bg-cyan-500/30 animate-glitch-1" />
            <div className="absolute inset-0 bg-pink-500/30 animate-glitch-2" />
          </>
        )}
        
        {/* Content */}
        <div className="space-y-2">
          <div className="text-xs text-white/50 font-mono tracking-wider">
            GAME CODE:
          </div>
          
          <div className="relative font-['Major_Mono_Display'] text-4xl tracking-[0.2em] text-center">
            {/* Shadow layers for neon effect */}
            <div className="absolute inset-0 text-cyan-500 blur-[2px] animate-pulse">
              {gameCode}
            </div>
            <div className="absolute inset-0 text-pink-500 blur-md mix-blend-screen animate-pulse">
              {gameCode}
            </div>
            
            {/* Main text */}
            <div className="relative text-white">
              {gameCode}
            </div>
          </div>
          
          <div className="text-xs text-white/30 text-center font-mono mt-4">
            CLICK TO COPY
          </div>
        </div>
        
        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-2 h-2 border-l-2 border-t-2 border-cyan-500" />
        <div className="absolute top-0 right-0 w-2 h-2 border-r-2 border-t-2 border-pink-500" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-l-2 border-b-2 border-pink-500" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-r-2 border-b-2 border-cyan-500" />
      </div>
    </motion.div>
  );
};