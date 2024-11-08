import React, { useState } from 'react';
import { Code2, Loader2, TestTube2, Upload } from 'lucide-react';
import { TestCaseFormProps, LLMProvider } from '../types';
import { TestCustomizationPanel } from './TestCustomizationPanel';

export function TestCaseForm({ 
  onSubmit, 
  loading, 
  error, 
  template, 
  onTemplateChange,
  customization,
  onCustomizationChange
}: TestCaseFormProps) {
  const [requirement, setRequirement] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(requirement);
  };

  const handleTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onTemplateChange(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="mb-6">
      </div>
      <TestCustomizationPanel
        customization={customization}
        onChange={onCustomizationChange}
      />
      <div className="mb-6">
        <div className="flex gap-2 mb-2 items-center">
          <Code2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <label htmlFor="requirement" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Software Requirement
          </label>
        </div>
        <textarea
          id="requirement"
          value={requirement}
          onChange={(e) => setRequirement(e.target.value)}
          className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="Enter your software requirement here..."
        />
      </div>

      <div className="mb-6">
        <div className="flex gap-2 mb-2 items-center">
          <Upload className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <label htmlFor="template" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Template (Optional)
          </label>
        </div>
        <input
          type="file"
          id="template"
          accept=".txt,.md"
          onChange={handleTemplateUpload}
          className="block w-full text-sm text-gray-500 dark:text-gray-400
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-indigo-50 file:text-indigo-700
            hover:file:bg-indigo-100
            dark:file:bg-indigo-900 dark:file:text-indigo-300"
        />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-500 dark:hover:bg-indigo-600"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <TestTube2 className="w-5 h-5" />
        )}
        {loading ? 'Generating...' : 'Generate Test Cases'}
      </button>
    </form>
  );
}