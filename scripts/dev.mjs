import { copyFileSync, existsSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const frontendDir = path.join(root, "frontend");
const backendDir = path.join(root, "backend");
const children = [];

function resolvePythonCommand(workingDir) {
  const localPython =
    process.platform === "win32"
      ? path.join(workingDir, ".venv", "Scripts", "python.exe")
      : path.join(workingDir, ".venv", "bin", "python");

  return existsSync(localPython) ? localPython : "python";
}

function ensureFile(targetPath, examplePath) {
  if (!existsSync(targetPath) && existsSync(examplePath)) {
    copyFileSync(examplePath, targetPath);
    console.log(`Created ${path.relative(root, targetPath)} from example`);
  }
}

function run(command, args, options = {}) {
  const child = spawn(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    ...options,
  });

  child.on("error", (error) => {
    console.error(`Unable to start ${command}:`, error.message);
  });

  child.on("exit", (code) => {
    if (code && code !== 0) {
      console.error(`${command} exited with code ${code}`);
    }
  });

  children.push(child);
  return child;
}

function shutdown() {
  for (const child of children) {
    if (child.killed) {
      continue;
    }

    child.kill("SIGINT");
  }
}

ensureFile(
  path.join(frontendDir, ".env.local"),
  path.join(frontendDir, ".env.example"),
);
ensureFile(path.join(backendDir, ".env"), path.join(backendDir, ".env.example"));

console.log("Starting frontend and computer vision API...");

run("npm", ["run", "dev"], { cwd: frontendDir });
run(
  resolvePythonCommand(backendDir),
  ["-m", "uvicorn", "app.main:app", "--reload", "--host", "127.0.0.1", "--port", "8000"],
  {
    cwd: backendDir,
  },
);

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
