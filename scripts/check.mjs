import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const backendDir = path.join(root, "backend");

function resolvePythonCommand(workingDir) {
  const localPython =
    process.platform === "win32"
      ? path.join(workingDir, ".venv", "Scripts", "python.exe")
      : path.join(workingDir, ".venv", "bin", "python");

  return existsSync(localPython) ? localPython : "python";
}

const backendPython = resolvePythonCommand(backendDir);

const commands = [
  {
    cwd: path.join(root, "frontend"),
    command: "npm",
    args: ["run", "lint:strict"],
  },
  {
    cwd: path.join(root, "frontend"),
    command: "npm",
    args: ["run", "typecheck"],
  },
  {
    cwd: path.join(root, "frontend"),
    command: "npm",
    args: ["run", "build"],
  },
  {
    cwd: backendDir,
    command: backendPython,
    args: ["-m", "pytest"],
  },
  {
    cwd: backendDir,
    command: backendPython,
    args: ["-m", "compileall", "app"],
  },
];

for (const item of commands) {
  const result = spawnSync(item.command, item.args, {
    cwd: item.cwd,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
