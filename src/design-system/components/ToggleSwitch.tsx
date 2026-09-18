import React from 'react';

export interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  id?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  id,
}) => {
  const switchId = id || (label ? `toggle-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);

  return (
    <label
      htmlFor={switchId}
      className={`flex items-center justify-between gap-4 cursor-pointer select-none ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug">
              {label}
            </span>
          )}
          {description && (
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
              {description}
            </span>
          )}
        </div>
      )}
      <div className="relative inline-flex items-center shrink-0">
        <input
          id={switchId}
          type="checkbox"
          checked={checked}
          onChange={(e) => !disabled && onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm peer-checked:bg-gradient-to-r peer-checked:from-indigo-600 peer-checked:to-blue-600 dark:peer-checked:from-indigo-500 dark:peer-checked:to-blue-500"></div>
      </div>
    </label>
  );
};
