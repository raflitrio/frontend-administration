import React from "react";

export function Dialog({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 relative w-full max-w-md">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-black"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}

export function DialogContent({ children }) {
  return (
    <div className="mt-4">
      {children}
    </div>
  );
}

export function DialogTrigger({ children }) {
  return (
    <>
      {children}
    </>
  );
}
