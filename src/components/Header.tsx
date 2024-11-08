import React from 'react';
import { TestTube2 } from 'lucide-react';

export function Header() {
  return (
    <div className="mb-8 text-center">
      <div className="flex items-center justify-center gap-2 mb-4">
        <TestTube2 className="w-8 h-8 text-indigo-600" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Test Case Generator</h1>
      </div>
      <p className="text-gray-600">
        Enter your software requirement and get AI-generated test cases instantly
      </p>
    </div>
  );
}