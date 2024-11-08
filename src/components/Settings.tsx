import React, { useState } from 'react';
import { Settings as SettingsIcon, Moon, Sun } from 'lucide-react';
import { SettingsProps, JiraConfig, LLMConfig } from '../types';

export function Settings({ 
  jiraConfig, 
  onJiraConfigSave, 
  llmConfig, 
  onLLMConfigSave,
  darkMode, 
  onDarkModeToggle 
}: SettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localJiraConfig, setLocalJiraConfig] = useState<JiraConfig>(jiraConfig);
  const [localLLMConfig, setLocalLLMConfig] = useState<LLMConfig>(llmConfig);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onJiraConfigSave(localJiraConfig);
    onLLMConfigSave(localLLMConfig);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <SettingsIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-10">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Settings</h3>
          
          <div className="mb-4 flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
            <button
              onClick={onDarkModeToggle}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">LLM Settings</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      OpenAI API Key
                    </label>
                    <input
                      type="password"
                      value={localLLMConfig.openaiKey}
                      onChange={(e) => setLocalLLMConfig({ ...localLLMConfig, openaiKey: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="sk-..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Groq API Key
                    </label>
                    <input
                      type="password"
                      value={localLLMConfig.groqKey}
                      onChange={(e) => setLocalLLMConfig({ ...localLLMConfig, groqKey: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="gsk_..."
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Jira Domain
                </label>
                <input
                  type="text"
                  value={localJiraConfig.domain}
                  onChange={(e) => setLocalJiraConfig({ ...localJiraConfig, domain: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  value={localJiraConfig.email}
                  onChange={(e) => setLocalJiraConfig({ ...localJiraConfig, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  API Token
                </label>
                <input
                  type="password"
                  value={localJiraConfig.apiToken}
                  onChange={(e) => setLocalJiraConfig({ ...localJiraConfig, apiToken: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Project Key
                </label>
                <input
                  type="text"
                  value={localJiraConfig.project}
                  onChange={(e) => setLocalJiraConfig({ ...localJiraConfig, project: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}