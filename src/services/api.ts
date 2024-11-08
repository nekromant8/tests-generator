import axios from 'axios';
import { TestCase, JiraConfig, LLMProvider, TestCustomization } from '../types';


const generatePrompt = (requirement: string, template: string, customization: TestCustomization) => {
  const basePrompt = template
    ? `${template}\n\nRequirement: ${requirement}`
    : `Generate comprehensive test cases for the following software requirement. Format the response as JSON array with objects containing: id, title, description, steps (array), and expectedResult.`;

  return `${basePrompt}
Consider the following testing parameters:
- Test Coverage: ${customization.coverage}%
- Testing Environment: ${customization.environment}
- Priority Focus: ${customization.priority}
- Test Complexity: ${customization.complexity}

Generate test cases that specifically address these parameters while testing the requirement: ${requirement}

Only respond with the JSON array, no other text.`;
};

interface ModelConfig {
  openai: {
    model: string;
  };
  ollama: {
    model: string;
    baseUrl: string;
  };
  groq: {
    model: string;
  };
}

interface GenerateConfig {
  provider: 'openai' | 'ollama' | 'groq';
  model: string;
  baseUrl?: string;
  apiKey?: string;
}

export const generateTestCases = async (
  requirement: string,
  template: string,
  config: GenerateConfig,
  customization: TestCustomization
): Promise<TestCase[]> => {
  let endpoint;
  let headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  let body: Record<string, any>;
  
  // Create a more structured prompt
  const basePrompt = `
Generate test cases for the following requirement:
${requirement}

Please format each test case as follows:
Test Case 1:
Description: [description]
Preconditions: [preconditions]
Steps:
1. [step 1]
2. [step 2]
Expected Results: [expected results]

Please generate at least 3 test cases following this exact format.
`;

  try {
    let response;
    let responseData;
    let parsedTestCases: TestCase[];

    switch (config.provider) {
      case 'groq':
        endpoint = 'https://api.groq.com/openai/v1/chat/completions';
        headers['Authorization'] = `Bearer ${config.apiKey}`;
        body = {
          model: config.model,
          messages: [
            {
              role: "system",
              content: "You are a QA engineer who writes clear, detailed test cases."
            },
            {
              role: "user",
              content: basePrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        };
        
        console.log('Groq request:', {
          ...body,
          messages: body.messages
        });

        response = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(body)
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error('Groq API error:', errorData);
          throw new Error(`API request failed: ${response.statusText}. ${errorData}`);
        }

        responseData = await response.json();
        console.log('Groq response:', responseData);

        parsedTestCases = parseTestCasesText(responseData.choices[0].message.content);
        break;

      case 'ollama':
        endpoint = `${config.baseUrl}/api/generate`;
        body = {
          model: config.model,
          prompt: basePrompt,
          stream: false
        };
        response = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(body)
        });
        responseData = await response.json();
        
        console.log('Ollama response:', responseData);
        parsedTestCases = parseTestCasesText(responseData.response);
        break;

      case 'openai':
        endpoint = '/api/openai';
        headers['Authorization'] = `Bearer ${config.apiKey}`;
        body = {
          model: config.model,
          messages: [
            {
              role: "system",
              content: "You are a QA engineer who writes clear, detailed test cases."
            },
            {
              role: "user",
              content: basePrompt
            }
          ],
          temperature: 0.7
        };
        response = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(body)
        });
        responseData = await response.json();
        parsedTestCases = parseTestCasesText(responseData.choices[0].message.content);
        break;

      default:
        throw new Error(`Invalid AI provider: ${config.provider}`);
    }

    return parsedTestCases;
  } catch (error) {
    console.error('Generate test cases error:', error);
    throw error;
  }
};

function parseTestCasesText(text: string): TestCase[] {
  try {
    // Split the text into individual test cases
    const testCaseBlocks = text.split(/Test Case \d+:/).filter(Boolean);
    
    return testCaseBlocks.map((block, index) => {
      // Extract different parts using regex
      const descriptionMatch = block.match(/Description:(.*?)(?=Preconditions:|$)/s);
      const preconditionsMatch = block.match(/Preconditions:(.*?)(?=Steps:|$)/s);
      const stepsMatch = block.match(/Steps:(.*?)(?=Expected Results:|$)/s);
      const expectedResultsMatch = block.match(/Expected Results:(.*?)(?=(?:Test Case \d+:|$))/s);

      // Extract and clean up steps
      const stepsText = stepsMatch ? stepsMatch[1].trim() : '';
      const steps = stepsText
        .split(/\d+\./)
        .filter(Boolean)
        .map(step => step.trim());

      return {
        id: `TC${index + 1}`,
        name: `Test Case ${index + 1}`,
        description: descriptionMatch ? descriptionMatch[1].trim() : '',
        preconditions: preconditionsMatch ? preconditionsMatch[1].trim() : '',
        steps: steps,
        expectedResults: expectedResultsMatch ? expectedResultsMatch[1].trim() : ''
      };
    });
  } catch (error) {
    console.error('Error parsing test cases text:', error);
    // Return a single test case with the raw text if parsing fails
    return [{
      id: 'TC1',
      name: 'Test Case 1',
      description: 'Parsing error - Raw response:',
      preconditions: '',
      steps: [text],
      expectedResults: ''
    }];
  }
}

export const createJiraTestCase = async (testCase: TestCase, config: JiraConfig) => {
  const jiraApiEndpoint = `https://${config.domain}/rest/api/3/issue`;
  
  try {
    const response = await axios.post(
      jiraApiEndpoint,
      {
        fields: {
          project: { key: config.project },
          summary: testCase.title,
          description: {
            type: 'doc',
            version: 1,
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: testCase.description }]
              },
              {
                type: 'heading',
                attrs: { level: 3 },
                content: [{ type: 'text', text: 'Test Steps:' }]
              },
              {
                type: 'bulletList',
                content: testCase.steps.map(step => ({
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: step }]
                    }
                  ]
                }))
              },
              {
                type: 'heading',
                attrs: { level: 3 },
                content: [{ type: 'text', text: 'Expected Result:' }]
              },
              {
                type: 'paragraph',
                content: [{ type: 'text', text: testCase.expectedResult }]
              }
            ]
          },
          issuetype: { name: 'Test' }
        }
      },
      {
        auth: {
          username: config.email,
          password: config.apiToken
        },
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error creating Jira issue:', error);
    throw new Error('Failed to create Jira issue');
  }
};

export const executePythonCode = async (code: string): Promise<string> => {
  const response = await fetch('/api/execute-python', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    throw new Error('Failed to execute Python code');
  }

  const result = await response.json();
  return result.output;
};