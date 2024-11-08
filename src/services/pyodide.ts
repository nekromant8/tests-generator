import { loadPyodide } from "pyodide";

let pyodide: any = null;

export const initializePyodide = async () => {
  if (!pyodide) {
    pyodide = await loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.0/full/",
    });
    await pyodide.loadPackage("pytest");
  }
  return pyodide;
};

export const executePythonTest = async (code: string): Promise<string> => {
  const py = await initializePyodide();
  try {
    return await py.runPythonAsync(code);
  } catch (error) {
    throw new Error(`Python execution failed: ${error}`);
  }
};
