import React from "react";

export function Textarea({ value, onChange, placeholder, className = "", ...props }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      rows="4"
      {...props}
    />
  );
}
