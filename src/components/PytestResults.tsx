import React from 'react';
import { PytestCase, TestExecutionResult } from '../types';
import { Code, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface PytestResultsProps {
  pytestCase: PytestCase;
  result?: TestExecutionResult;
}

export function PytestResults({ pytestCase, result }: PytestResultsProps) {
  return (
    <div className="mt-4 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
          <Code className="w-5 h-5" />
          Generated Pytest Code
        </h3>
        {result && (
          <div className="flex items-center gap-2">
            {result.status === 'passed' && (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            )}
            {result.status === 'failed' && (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            {result.status === 'error' && (
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            )}
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {result.duration}ms
            </span>
          </div>
        )}
      </div>

      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
        <code>{pytestCase.code}</code>
      </pre>
    </div>
  );
}
