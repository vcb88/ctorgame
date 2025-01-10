import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SettingsForm } from '@/components/SettingsForm';

// Default settings
const defaultSettings = {
  soundEnabled: true,
  musicVolume: 70,
  effectsVolume: 80,
  visualEffects: true,
  showHints: true,
  boardSize: 10,
};

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(() => {
    // Load settings from localStorage or use defaults
    const savedSettings = localStorage.getItem('gameSettings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('gameSettings', JSON.stringify(newSettings));
  };

  return (
    <SettingsForm
      settings={settings}
      onSettingChange={handleSettingChange}
      onClose={() => navigate('/')}
    />
  );
};