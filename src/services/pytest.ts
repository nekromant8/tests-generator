import { TestCase, PytestCase, TestExecutionResult } from '../types';
import { editor } from 'monaco-editor';

export const convertToPytest = (testCase: TestCase): PytestCase => {
  if (!testCase || typeof testCase !== 'object') {
    console.error('Invalid test case:', testCase);
    return { code: '# Error: Invalid test case' };
  }

  // Create a safe function name from the test case name
  const functionName = testCase.name
    ? `test_${testCase.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
    : `test_case_${testCase.id.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

  const code = `
import pytest

def ${functionName}():
    """
    ${testCase.description || 'No description provided'}
    
    Preconditions:
    ${testCase.preconditions || 'None'}
    
    Steps:
    ${testCase.steps ? testCase.steps.map((step, index) => `${index + 1}. ${step}`).join('\n    ') : 'No steps provided'}
    
    Expected Results:
    ${testCase.expectedResults || 'No expected results provided'}
    """
    # TODO: Implement test steps
    ${testCase.steps ? testCase.steps.map(step => `# ${step}`).join('\n    ') : '# No steps to implement'}
    
    # Add assertions here
    assert True  # Placeholder assertion
`;

  return {
    name: functionName,
    code,
    filePath: `tests/test_${functionName}.py`
  };
};

export const executeTest = async (testCase: TestCase) => {
  // This is a mock implementation. Replace with actual test execution logic.
  return new Promise<{ success: boolean; message: string }>((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: `Test "${testCase.name}" executed successfully. This is a mock implementation.`
      });
    }, 1000);
  });
};

export const exportAllTests = async (testCases: TestCase[], fileName: string = 'test_cases.py'): Promise<void> => {
  try {
    if (!testCases || !Array.isArray(testCases)) {
      throw new Error('Invalid test cases array');
    }

    const combinedCode = testCases
      .map(testCase => {
        try {
          return convertToPytest(testCase).code;
        } catch (error) {
          console.error(`Error converting test case to pytest:`, error);
          return `# Error converting test case: ${testCase.name || 'Unknown test case'}`;
        }
      })
      .join('\n\n');

    const blob = new Blob([combinedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export tests:', error);
    throw error;
  }
};
