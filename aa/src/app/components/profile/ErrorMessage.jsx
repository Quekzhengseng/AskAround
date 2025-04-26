// app/profile/components/ErrorMessage.jsx
import React from "react";

export default function ErrorMessage({ message }) {
  return (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
      <p>Error loading data: {message}</p>
    </div>
  );
}
