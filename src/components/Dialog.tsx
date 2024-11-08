import React, { useState } from 'react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title: string;
  placeholder?: string;
  initialValue?: string;
  confirmText?: string;
  inputLabel?: string;
}

export function Dialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  placeholder = '',
  initialValue = '',
  confirmText = 'Add',
  inputLabel = ''
}: DialogProps) {
  const [value, setValue] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onConfirm(value.trim());
      setValue('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 shadow-xl">
        <h2 className="text-lg font-semibold mb-4 dark:text-white">{title}</h2>
        <form onSubmit={handleSubmit}>
          {inputLabel && (
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">
              {inputLabel}
            </label>
          )}
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="w-full p-2 border rounded mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {confirmText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
