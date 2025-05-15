"use client";

import React from 'react';

const BooleanToggle = ({ id, label, checked, onChange, disabled = false }) => {
  const handleToggle = () => {
    if (!disabled && onChange) {
      onChange({ target: { type: 'checkbox', id, checked: !checked, name: id } });
    }
  };

  return (
    <div className="flex items-center justify-between py-2">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700 flex-grow pr-4">
          {label}
        </label>
      )}
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={handleToggle}
        disabled={disabled}
        className={`${
          checked ? 'bg-purple-600' : 'bg-gray-200'
        } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <span className="sr-only">Use setting</span>
        <span
          aria-hidden="true"
          className={`${
            checked ? 'translate-x-5' : 'translate-x-0'
          } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
        />
      </button>
    </div>
  );
};

export default BooleanToggle;