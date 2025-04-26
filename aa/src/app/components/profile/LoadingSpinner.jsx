// app/profile/components/LoadingSpinner.jsx
import React from "react";

export default function LoadingSpinner() {
  return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-4 border-indigo-400 rounded-full border-t-transparent animate-spin"></div>
    </div>
  );
}
