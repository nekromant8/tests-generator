export interface TestCase {
  id: string;
  title: string;
  description: string;
  steps: string[];
  expectedResult: string;
}

export type LLMProvider = 'ollama' | 'openai' | 'groq';

export interface TestCaseFormProps {
  onSubmit: (requirement: string) => Promise<void>;
  loading: boolean;
  error: string;
  template: string;
  onTemplateChange: (template: string) => void;
  llmProvider: LLMProvider;
  onLLMProviderChange: (provider: LLMProvider) => void;
  customization: TestCustomization;
  onCustomizationChange: (customization: TestCustomization) => void;
  onGeneratePytest: (testCase: TestCase) => Promise<PytestCase>;
  onExecuteTest: (pytestCase: PytestCase) => Promise<TestExecutionResult>;
}

export interface TestCaseListProps {
  testCases: TestCase[];
  onExportToJira: (testCase: TestCase) => Promise<void>;
  onGeneratePytest: (testCase: TestCase) => Promise<PytestCase>;
  onExecuteTest: (pytestCase: PytestCase) => Promise<TestExecutionResult>;
}

export interface JiraConfig {
  domain: string;
  email: string;
  apiToken: string;
  project: string;
}

export interface LLMConfig {
  openaiKey: string;
  groqKey: string;
}

export interface SettingsProps {
  jiraConfig: JiraConfig;
  onJiraConfigSave: (config: JiraConfig) => void;
  llmConfig: LLMConfig;
  onLLMConfigSave: (config: LLMConfig) => void;
  darkMode: boolean;
  onDarkModeToggle: () => void;
}

export interface Template {
  id: string;
  name: string;
  content: string;
}

export interface TestCustomization {
  coverage: number;  // percentage of requirement coverage
  environment: 'development' | 'staging' | 'production';
  priority: 'edge-cases' | 'permissions' | 'performance' | 'security';
  complexity: 'simple' | 'moderate' | 'complex';
}

export interface PytestCase {
  name: string;
  code: string;
  filePath: string;
}

export interface TestExecutionResult {
  status: 'passed' | 'failed' | 'error';
  message: string;
  duration: number;
}