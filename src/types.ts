export interface TestCase {
  id: string;
  name: string;
  description: string;
  preconditions: string;
  steps: string[];
  expectedResults: string;
} 