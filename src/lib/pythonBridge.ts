import { spawn } from 'child_process';
import path from 'path';

interface PythonScriptOptions {
    scriptPath: string;
    args?: string[];
    pythonPath?: string; // Optional: specific python executable
}

/**
 * Executes a Python script and returns the result parsed from JSON stdout.
 * The script is expected to print valid JSON to stdout as its last output.
 */
export async function runPythonScript<T>(options: PythonScriptOptions, inputData?: any): Promise<T> {
    return new Promise((resolve, reject) => {
        const { scriptPath, args = [], pythonPath = 'python' } = options;

        // Resolve absolute path to script
        const absoluteScriptPath = path.resolve(process.cwd(), scriptPath);

        const processArgs = [absoluteScriptPath, ...args];
        const pyProcess = spawn(pythonPath, processArgs);

        let stdoutData = '';
        let stderrData = '';

        // Send input data via stdin if provided
        if (inputData) {
            pyProcess.stdin.write(JSON.stringify(inputData));
            pyProcess.stdin.end();
        }

        pyProcess.stdout.on('data', (data) => {
            stdoutData += data.toString();
        });

        pyProcess.stderr.on('data', (data) => {
            stderrData += data.toString();
        });

        pyProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`Python script error (${code}):`, stderrData);
                return reject(new Error(`Python script exited with code ${code}. Error: ${stderrData}`));
            }

            try {
                // Find the last line that looks like JSON in case of debug prints
                const lines = stdoutData.trim().split('\n');
                const lastLine = lines[lines.length - 1];
                const result = JSON.parse(lastLine) as T;
                resolve(result);
            } catch (err) {
                console.error('Failed to parse Python output:', stdoutData);
                reject(new Error(`Failed to parse Python output: ${err instanceof Error ? err.message : String(err)}`));
            }
        });

        pyProcess.on('error', (err) => {
            reject(new Error(`Failed to spawn Python process: ${err.message}`));
        });
    });
}
