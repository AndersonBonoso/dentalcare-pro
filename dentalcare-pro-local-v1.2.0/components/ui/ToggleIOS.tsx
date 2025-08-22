// components/ui/ToggleIOS.tsx
'use client';

import React from 'react';

type Props = {
  checked: boolean;
  onChange: (v: boolean) => void;
  labelLeft?: string;
  labelRight?: string;
  disabled?: boolean;
  className?: string;
};

export default function ToggleIOS({
  checked,
  onChange,
  labelLeft,
  labelRight,
  disabled,
  className,
}: Props) {
  return (
    <div className={`flex items-center gap-3 ${className ?? ''}`}>
      {labelLeft && (
        <span className={`text-sm ${checked ? 'text-gray-500' : 'text-gray-900 font-medium'}`}>
          {labelLeft}
        </span>
      )}

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={[
          'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
          checked ? 'bg-blue-600' : 'bg-gray-300',
          disabled ? 'opacity-60 cursor-not-allowed' : '',
        ].join(' ')}
      >
        <span
          aria-hidden="true"
          className={[
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
            checked ? 'translate-x-5' : 'translate-x-0',
          ].join(' ')}
        />
      </button>

      {labelRight && (
        <span className={`text-sm ${checked ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
          {labelRight}
        </span>
      )}
    </div>
  );
}
