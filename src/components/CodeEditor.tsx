import Editor from "@monaco-editor/react";
import { useRef } from "react";

interface CodeEditorProps {
  code: string;
  language?: string;
  onChange?: (value: string | undefined) => void;
  readOnly?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  language = "python",
  onChange,
  readOnly = false,
}) => {
  const editorRef = useRef(null);

  return (
    <Editor
      height="400px"
      defaultLanguage={language}
      value={code}
      onChange={onChange}
      options={{
        minimap: { enabled: false },
        readOnly,
        scrollBeyondLastLine: false,
        fontSize: 14,
        tabSize: 4,
        automaticLayout: true,
      }}
      theme="vs-dark"
    />
  );
};
