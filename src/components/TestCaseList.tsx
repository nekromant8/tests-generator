import React from 'react';
import { TestCase } from '../types';
import { convertToPytest, executeTest } from '../services/pytest';

interface TestCaseListProps {
  testCases: TestCase[];
  onExportToJira: (testCase: TestCase) => void;
  onGeneratePytest: (testCase: TestCase) => void;
  onExecuteTest: (testCase: TestCase) => void;
}

export function TestCaseList({
  testCases = [],
  onExportToJira,
  onGeneratePytest,
  onExecuteTest
}: TestCaseListProps) {
  const handleGeneratePytest = async (testCase: TestCase) => {
    try {
      const { code } = convertToPytest(testCase);
      // Create a dialog to show the generated code
      const dialog = document.createElement('dialog');
      dialog.className = 'p-6 rounded-lg shadow-xl max-w-2xl dark:bg-gray-800';
      
      dialog.innerHTML = `
        <div class="flex flex-col h-full">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold dark:text-white">Generated Pytest Code</h3>
            <button class="close-button text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              ×
            </button>
          </div>
          <pre class="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto mb-4 flex-grow">
            <code class="text-sm dark:text-white">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>
          </pre>
          <div class="flex justify-end gap-2">
            <button class="copy-button px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Copy Code
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(dialog);
      
      // Add event listeners
      const closeButton = dialog.querySelector('.close-button');
      closeButton?.addEventListener('click', () => {
        dialog.remove();
      });

      const copyButton = dialog.querySelector('.copy-button');
      copyButton?.addEventListener('click', () => {
        navigator.clipboard.writeText(code);
        const originalText = copyButton.textContent;
        copyButton.textContent = 'Copied!';
        setTimeout(() => {
          copyButton.textContent = originalText;
        }, 2000);
      });

      dialog.showModal();
    } catch (error) {
      console.error('Error generating pytest:', error);
      alert('Failed to generate pytest code');
    }
  };

  const handleExecuteTest = async (testCase: TestCase) => {
    try {
      const result = await executeTest(testCase);
      // Show execution result in a dialog
      const dialog = document.createElement('dialog');
      dialog.className = 'p-6 rounded-lg shadow-xl max-w-md dark:bg-gray-800';
      
      dialog.innerHTML = `
        <div class="flex flex-col">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold dark:text-white">Test Execution Result</h3>
            <button class="close-button text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              ×
            </button>
          </div>
          <div class="mb-4 dark:text-white">
            ${result.success 
              ? '<div class="text-green-500">✓ Test executed successfully</div>'
              : '<div class="text-red-500">✗ Test execution failed</div>'}
            <p class="mt-2">${result.message}</p>
          </div>
        </div>
      `;

      document.body.appendChild(dialog);
      
      // Add event listener for close button
      const closeButton = dialog.querySelector('.close-button');
      closeButton?.addEventListener('click', () => {
        dialog.remove();
      });

      dialog.showModal();
    } catch (error) {
      console.error('Error executing test:', error);
      alert('Failed to execute test');
    }
  };

  if (!testCases || testCases.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-4">
        No test cases available.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {testCases.map((testCase, index) => (
        <div key={index} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2 dark:text-white">
            {testCase.name}
          </h3>
          <div className="space-y-2 text-gray-600 dark:text-gray-300">
            <p><strong>Description:</strong> {testCase.description}</p>
            <p><strong>Preconditions:</strong> {testCase.preconditions}</p>
            <div>
              <strong>Steps:</strong>
              <ol className="list-decimal list-inside pl-4">
                {testCase.steps.map((step, stepIndex) => (
                  <li key={stepIndex}>{step}</li>
                ))}
              </ol>
            </div>
            <p><strong>Expected Results:</strong> {testCase.expectedResults}</p>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => onExportToJira(testCase)}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Export to Jira
            </button>
            <button
              onClick={() => handleGeneratePytest(testCase)}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Generate Pytest
            </button>
            <button
              onClick={() => handleExecuteTest(testCase)}
              className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Execute Test
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}