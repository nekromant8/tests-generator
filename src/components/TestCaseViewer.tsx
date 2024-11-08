import { CodeEditor } from './CodeEditor';

interface TestCaseViewerProps {
  testCase: PytestCase;
  onExecute: () => void;
}

export const TestCaseViewer: React.FC<TestCaseViewerProps> = ({
  testCase,
  onExecute,
}) => {
  return (
    <div>
      <h3>Test: {testCase.name}</h3>
      <CodeEditor
        code={testCase.code}
        language="python"
        readOnly={true}
      />
      <button onClick={onExecute}>Execute Test</button>
    </div>
  );
}; 