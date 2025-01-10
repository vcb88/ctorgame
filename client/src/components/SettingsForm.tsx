import React from 'react';
import { cn } from '@/lib/utils';

interface SettingsFormProps {
  settings: {
    soundEnabled: boolean;
    musicVolume: number;
    effectsVolume: number;
    visualEffects: boolean;
    showHints: boolean;
    boardSize: number;
  };
  onSettingChange: (key: string, value: any) => void;
  onClose: () => void;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({
  settings,
  onSettingChange,
  onClose
}) => {
  // Geometric pattern as a visualization of current settings
  const GeometricVisualizer = () => (
    <div className={cn(
      "relative w-full aspect-square max-w-[200px]",
      "mb-8",
      "transition-all duration-700"
    )}>
      {/* Center square - represents board size */}
      <div
        className={cn(
          "absolute inset-0 m-auto",
          "bg-zima-blue",
          "transition-all duration-700",
          "animate-pulse-slow"
        )}
        style={{
          width: `${(settings.boardSize / 12) * 100}%`,
          height: `${(settings.boardSize / 12) * 100}%`,
          opacity: settings.visualEffects ? 0.8 : 0.4
        }}
      />

      {/* Outer circle - represents volume */}
      <div
        className={cn(
          "absolute inset-0",
          "border-2 border-zima-blue/30",
          "rounded-full",
          "transition-all duration-700"
        )}
        style={{
          transform: `scale(${0.5 + (settings.musicVolume / 200)})`
        }}
      />

      {/* Inner circle - represents effects volume */}
      <div
        className={cn(
          "absolute inset-0 m-auto",
          "border-2 border-zima-blue/50",
          "rounded-full",
          "transition-all duration-700"
        )}
        style={{
          width: '60%',
          height: '60%',
          transform: `scale(${0.5 + (settings.effectsVolume / 200)})`
        }}
      />

      {/* Hints indicators */}
      {settings.showHints && (
        <>
          {[0, 90, 180, 270].map((angle) => (
            <div
              key={angle}
              className={cn(
                "absolute w-1 h-1",
                "bg-zima-blue/60",
                "transition-all duration-700"
              )}
              style={{
                top: '50%',
                left: '50%',
                transform: `rotate(${angle}deg) translateX(${settings.boardSize * 4}px)`
              }}
            />
          ))}
        </>
      )}
    </div>
  );

  return (
    <div className={cn(
      "fixed inset-0 z-50",
      "bg-slate-950/95",
      "flex items-center justify-center",
      "p-4",
      "animate-fade-in"
    )}>
      <div className={cn(
        "w-full max-w-lg",
        "bg-slate-900",
        "p-8",
        "rounded-lg",
        "border border-zima-blue/20",
        "shadow-xl shadow-zima-blue/10",
        "animate-content-appear"
      )}>
        <h2 className={cn(
          "text-3xl font-light text-center mb-6",
          "text-zima-blue",
          "border-b border-zima-blue/20",
          "pb-4"
        )}>
          Settings
        </h2>

        <GeometricVisualizer />

        <div className="space-y-6">
          {/* Sound Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-zima-blue/80">Sound</label>
              <button
                onClick={() => onSettingChange('soundEnabled', !settings.soundEnabled)}
                className={cn(
                  "w-12 h-6 rounded-full",
                  "transition-colors duration-300",
                  "relative",
                  settings.soundEnabled ? "bg-zima-blue" : "bg-slate-700"
                )}
              >
                <div
                  className={cn(
                    "absolute top-1 w-4 h-4",
                    "rounded-full bg-white",
                    "transition-all duration-300",
                    "transform",
                    settings.soundEnabled ? "left-7" : "left-1"
                  )}
                />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-zima-blue/80 block">Music Volume</label>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.musicVolume}
                onChange={(e) => onSettingChange('musicVolume', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-zima-blue/80 block">Effects Volume</label>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.effectsVolume}
                onChange={(e) => onSettingChange('effectsVolume', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* Visual Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-zima-blue/80">Visual Effects</label>
              <button
                onClick={() => onSettingChange('visualEffects', !settings.visualEffects)}
                className={cn(
                  "w-12 h-6 rounded-full",
                  "transition-colors duration-300",
                  "relative",
                  settings.visualEffects ? "bg-zima-blue" : "bg-slate-700"
                )}
              >
                <div
                  className={cn(
                    "absolute top-1 w-4 h-4",
                    "rounded-full bg-white",
                    "transition-all duration-300",
                    "transform",
                    settings.visualEffects ? "left-7" : "left-1"
                  )}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-zima-blue/80">Show Hints</label>
              <button
                onClick={() => onSettingChange('showHints', !settings.showHints)}
                className={cn(
                  "w-12 h-6 rounded-full",
                  "transition-colors duration-300",
                  "relative",
                  settings.showHints ? "bg-zima-blue" : "bg-slate-700"
                )}
              >
                <div
                  className={cn(
                    "absolute top-1 w-4 h-4",
                    "rounded-full bg-white",
                    "transition-all duration-300",
                    "transform",
                    settings.showHints ? "left-7" : "left-1"
                  )}
                />
              </button>
            </div>
          </div>

          {/* Game Settings */}
          <div className="space-y-2">
            <label className="text-zima-blue/80 block">Board Size</label>
            <div className="flex gap-4">
              {[8, 10, 12].map((size) => (
                <button
                  key={size}
                  onClick={() => onSettingChange('boardSize', size)}
                  className={cn(
                    "flex-1 py-2 rounded",
                    "transition-all duration-300",
                    "border",
                    settings.boardSize === size
                      ? "bg-zima-blue text-white border-transparent"
                      : "border-zima-blue/30 text-zima-blue/70 hover:bg-zima-blue/10"
                  )}
                >
                  {size}x{size}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className={cn(
              "px-6 py-2 rounded",
              "text-white",
              "bg-zima-blue",
              "transition-all duration-300",
              "hover:bg-zima-blue/80",
              "focus:outline-none focus:ring-2 focus:ring-zima-blue/50"
            )}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};