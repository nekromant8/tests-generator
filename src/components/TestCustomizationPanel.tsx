import React from 'react';
import { Settings2 } from 'lucide-react';
import { TestCustomization } from '../types';

interface TestCustomizationPanelProps {
  customization: TestCustomization;
  onChange: (customization: TestCustomization) => void;
}

export function TestCustomizationPanel({ customization, onChange }: TestCustomizationPanelProps) {
  return (
    <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <Settings2 className="w-5 h-5 text-indigo-600" />
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Test Customization</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Coverage Target ({customization.coverage}%)
          </label>
          <input
            type="range"
            min="50"
            max="100"
            value={customization.coverage}
            onChange={(e) => onChange({ ...customization, coverage: Number(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Environment
          </label>
          <select
            value={customization.environment}
            onChange={(e) => onChange({ ...customization, environment: e.target.value as any })}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="development">Development</option>
            <option value="staging">Staging</option>
            <option value="production">Production</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Priority Focus
          </label>
          <select
            value={customization.priority}
            onChange={(e) => onChange({ ...customization, priority: e.target.value as any })}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="edge-cases">Edge Cases</option>
            <option value="permissions">User Permissions</option>
            <option value="performance">Performance</option>
            <option value="security">Security</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Test Complexity
          </label>
          <select
            value={customization.complexity}
            onChange={(e) => onChange({ ...customization, complexity: e.target.value as any })}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="simple">Simple</option>
            <option value="moderate">Moderate</option>
            <option value="complex">Complex</option>
          </select>
        </div>
      </div>
    </div>
  );
}