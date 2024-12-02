import React from 'react';
import '@/index-basic.css';

interface ToggleProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const Toggle: React.FC<ToggleProps> = ({
  id,
  label,
  checked,
  onChange
}) => {
  return (
    <div className="toggle-container">
      <label className="switch">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="switch-slider"></span>
      </label>
      <span className="toggle-label">{label}</span>
    </div>
  );
};