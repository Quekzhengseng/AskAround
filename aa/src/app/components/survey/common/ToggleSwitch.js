// src/app/components/common/ToggleSwitch.js
import React from "react";

const ToggleSwitch = ({ id, label, checked, onChange, disabled = false }) => {
  // Define colors directly here (or pass as props if needed elsewhere)
  const activeColor = '#7c3aed'; // Example Purple
  const focusRingColor = 'rgba(124, 58, 237, 0.5)'; // Example Purple focus ring

  return (
    <label
      htmlFor={id}
      className={`flex items-center justify-between cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span className="text-sm text-[#4b5563] mr-3">{label}</span> {/* text-secondary */}
      <div className="relative inline-block">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only peer"
        />
        {/* Background Track - uses arbitrary color */}
        <div
          className={`w-11 h-6 rounded-full transition-colors duration-200 ease-in-out
                     peer-checked:bg-[${activeColor}] bg-gray-200 peer-disabled:bg-gray-200
                     peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-offset-1 peer-focus:ring-[${focusRingColor}]`}
        ></div>
        {/* Switch Handle */}
        <div
          className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 ease-in-out
                     peer-checked:translate-x-5 translate-x-0`}
        ></div>
      </div>
    </label>
  );
};

export default ToggleSwitch;