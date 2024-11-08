import React, { useState, useEffect } from 'react';
import { TestCase, JiraConfig, LLMProvider, LLMConfig, TestCustomization } from '../types';
import { generateTestCases, createJiraTestCase } from '../services/api';
import { Header } from './Header';
import { TestCaseForm } from './TestCaseForm';
import { TestCaseList } from './TestCaseList';
import { Settings } from './Settings';
import { useDarkMode } from '../hooks/useDarkMode';
import { useAPIKeys } from '../hooks/useAPIKeys';
import { convertToPytest, executeTest } from '../services/pytest';
import { CodeEditor } from './CodeEditor';
import { exportAllTests } from '../services/pytest';
import { Dialog } from './Dialog';

const getInitialModelConfig = () => {
  const savedConfig = localStorage.getItem('modelConfig');
  if (savedConfig) {
    try {
      return JSON.parse(savedConfig);
    } catch (e) {
      console.error('Error parsing saved model config:', e);
    }
  }
  
  // Default configuration if nothing is saved or parsing fails
  return {
    openai: {
      model: 'gpt-4-turbo-preview',
      customModels: []
    },
    ollama: {
      model: 'llama2',
      baseUrl: 'http://localhost:11434',
      customModels: []
    },
    groq: {
      model: 'mixtral-8x7b-32768',
      customModels: []
    }
  };
};

export function TestCaseGenerator() {
  const [loading, setLoading] = useState(false);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [error, setError] = useState('');
  const [template, setTemplate] = useState('');
  const [darkMode, setDarkMode] = useDarkMode();
  const [jiraConfig, setJiraConfig] = useState<JiraConfig>({
    domain: '',
    email: '',
    apiToken: '',
    project: '',
  });
  const [llmConfig, setLLMConfig] = useAPIKeys();
  const [customization, setCustomization] = useState<TestCustomization>({
    coverage: 80,
    environment: 'development',
    priority: 'edge-cases',
    complexity: 'moderate'
  });
  const [aiProvider, setAiProvider] = useState<'openai' | 'ollama' | 'groq'>('openai');
  const [modelConfig, setModelConfig] = useState(getInitialModelConfig());
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    type: '' as 'addModel' | 'exportTests',
    provider: '' as 'openai' | 'ollama' | 'groq'
  });

  useEffect(() => {
    localStorage.setItem('modelConfig', JSON.stringify(modelConfig));
  }, [modelConfig]);

  const handleAddCustomModel = (provider: 'openai' | 'ollama' | 'groq') => {
    setDialogState({
      isOpen: true,
      type: 'addModel',
      provider
    });
  };

  const handleExportClick = () => {
    setDialogState({
      isOpen: true,
      type: 'exportTests',
      provider: '' // Not needed for export
    });
  };

  const handleDialogConfirm = (value: string) => {
    if (dialogState.type === 'addModel') {
      // Handle adding custom model
      const provider = dialogState.provider;
      if (modelConfig[provider].customModels.includes(value)) {
        alert('This model is already in your list');
        return;
      }

      setModelConfig(prev => ({
        ...prev,
        [provider]: {
          ...prev[provider],
          customModels: [...prev[provider].customModels, value]
        }
      }));
    } else if (dialogState.type === 'exportTests') {
      // Handle exporting tests
      exportAllTests(testCases, value);
    }
  };

  const handleSubmit = async (requirement: string) => {
    if (!requirement.trim()) {
      setError('Please enter a requirement');
      return;
    }

    setLoading(true);
    setError('');
    setTestCases([]); // Clear existing test cases

    try {
      const config = {
        provider: aiProvider,
        model: modelConfig[aiProvider].model,
        baseUrl: aiProvider === 'ollama' ? modelConfig.ollama.baseUrl : undefined,
        apiKey: aiProvider === 'openai' ? llmConfig.openaiKey : 
                aiProvider === 'groq' ? llmConfig.groqKey : 
                undefined
      };
      
      console.log('Generating test cases with config:', {
        ...config,
        apiKey: '***' // Hide API key in logs
      });

      const cases = await generateTestCases(
        requirement,
        template,
        config,
        customization
      );
      
      console.log('Generated test cases:', cases);
      
      if (!cases || !Array.isArray(cases)) {
        throw new Error('Invalid response format from API');
      }

      // Transform the response if needed
      const formattedCases = cases.map((testCase, index) => ({
        id: `TC${index + 1}`,
        name: testCase.name || `Test Case ${index + 1}`,
        description: testCase.description || '',
        preconditions: testCase.preconditions || '',
        steps: Array.isArray(testCase.steps) ? testCase.steps : [],
        expectedResults: testCase.expectedResults || '',
      }));

      setTestCases(formattedCases);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate test cases';
      setError(errorMessage);
      console.error('Error generating test cases:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportToJira = async (testCase: TestCase) => {
    try {
      await createJiraTestCase(testCase, jiraConfig);
    } catch (err) {
      console.error('Failed to export to Jira:', err);
      setError('Failed to export to Jira. Please check your settings.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex flex-col">
      <header className="border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <img 
            src="/favicon/favicon-96x96.png" 
            alt="QA Test Case Generator" 
            className="w-8 h-8"
          />
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            QA Test Case Generator
          </h1>
        </div>
      </header>

      <div className="flex-grow max-w-4xl mx-auto p-6 w-full">
        <div className="flex justify-end mb-4">
          <Settings
            jiraConfig={jiraConfig}
            onJiraConfigSave={setJiraConfig}
            llmConfig={llmConfig}
            onLLMConfigSave={setLLMConfig}
            darkMode={darkMode}
            onDarkModeToggle={() => setDarkMode(!darkMode)}
          />
        </div>
        <Header />
        <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-white">AI Provider</label>
              <select
                value={aiProvider}
                onChange={(e) => setAiProvider(e.target.value as typeof aiProvider)}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="openai">OpenAI</option>
                <option value="ollama">Ollama</option>
                <option value="groq">Groq</option>
              </select>
            </div>

            {aiProvider === 'openai' && (
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-white">OpenAI Model</label>
                <div className="flex gap-2">
                  <select
                    value={modelConfig.openai.model}
                    onChange={(e) => setModelConfig(prev => ({
                      ...prev,
                      openai: { ...prev.openai, model: e.target.value }
                    }))}
                    className="flex-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="gpt-4-turbo-preview">GPT-4 Turbo</option>
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    {modelConfig.openai.customModels.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleAddCustomModel('openai')}
                    className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    + Add Model
                  </button>
                </div>
              </div>
            )}

            {aiProvider === 'ollama' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-white">Ollama Model</label>
                  <div className="flex gap-2">
                    <select
                      value={modelConfig.ollama.model}
                      onChange={(e) => setModelConfig(prev => ({
                        ...prev,
                        ollama: { ...prev.ollama, model: e.target.value }
                      }))}
                      className="flex-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="llama3.1">Llama 3.1 8B</option>
                      <option value="llama2">Llama 2</option>
                      <option value="mistral">Mistral</option>
                      <option value="codellama">Code Llama</option>
                      {modelConfig.ollama.customModels.map(model => (
                        <option key={model} value={model}>{model}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleAddCustomModel('ollama')}
                      className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      + Add Model
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-white">Ollama Base URL</label>
                  <input
                    type="text"
                    value={modelConfig.ollama.baseUrl}
                    onChange={(e) => setModelConfig(prev => ({
                      ...prev,
                      ollama: { ...prev.ollama, baseUrl: e.target.value }
                    }))}
                    placeholder="http://localhost:11434"
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </>
            )}

            {aiProvider === 'groq' && (
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-white">Groq Model</label>
                <div className="flex gap-2">
                  <select
                    value={modelConfig.groq.model}
                    onChange={(e) => setModelConfig(prev => ({
                      ...prev,
                      groq: { ...prev.groq, model: e.target.value }
                    }))}
                    className="flex-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="llama-3.2-90b-text-preview">Llama 3.2 90B</option>
                    <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
                    <option value="llama2-70b-4096">LLaMA2 70B</option>
                    {modelConfig.groq.customModels.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleAddCustomModel('groq')}
                    className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    + Add Model
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <TestCaseForm 
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
          template={template}
          onTemplateChange={setTemplate}
          customization={customization}
          onCustomizationChange={setCustomization}
        />
        {loading && <div className="mt-4 text-center">Generating test cases...</div>}
        {error && <div className="mt-4 text-red-500">{error}</div>}
        {testCases && testCases.length > 0 && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Generated Test Cases</h2>
            <TestCaseList 
              testCases={testCases}
              onExportToJira={handleExportToJira}
              onGeneratePytest={convertToPytest}
              onExecuteTest={executeTest}
            />
          </div>
        )}
        {testCases && testCases.length > 0 && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Generated Pytest Code</h2>
            <CodeEditor
              code={testCases.map(testCase => convertToPytest(testCase).code).join('\n\n')}
              language="python"
              readOnly={true}
            />
            <button
              onClick={handleExportClick}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Export All Tests to .py File
            </button>
          </div>
        )}
        <Dialog
          isOpen={dialogState.isOpen}
          onClose={() => setDialogState({ ...dialogState, isOpen: false })}
          onConfirm={handleDialogConfirm}
          title={dialogState.type === 'addModel' 
            ? `Add Custom ${dialogState.provider?.charAt(0).toUpperCase()}${dialogState.provider?.slice(1)} Model`
            : 'Export Test Cases'}
          placeholder={dialogState.type === 'addModel' 
            ? "Enter model name"
            : "Enter file name (e.g., test_cases.py)"}
          initialValue={dialogState.type === 'exportTests' ? 'test_cases.py' : ''}
          confirmText={dialogState.type === 'addModel' ? 'Add' : 'Export'}
          inputLabel={dialogState.type === 'exportTests' ? 'File Name' : ''}
        />
      </div>
      
      <footer className="py-4 px-6 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto">
          Developed by{' '}
          <a 
            href="https://github.com/nekromant8" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
          >
            @Siarhei Stankevich
          </a>
          {' '}v0.1-beta
        </div>
      </footer>
    </div>
  );
}
