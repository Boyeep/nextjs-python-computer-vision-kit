import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const frontendDir = path.join(root, "frontend");
const backendDir = path.join(root, "backend");
const reportDir = path.join(root, "reports", "licenses");
const npmLicenseTool = "license-checker-rseidelsohn@4.4.2";

function resolvePythonCommand(workingDir) {
  const localPython =
    process.platform === "win32"
      ? path.join(workingDir, ".venv", "Scripts", "python.exe")
      : path.join(workingDir, ".venv", "bin", "python");

  return existsSync(localPython) ? localPython : "python";
}

function runAndCapture(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    stdio: "pipe",
    shell: process.platform === "win32",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    const details = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
    throw new Error(
      details
        ? `Command failed: ${command} ${args.join(" ")}\n${details}`
        : `Command failed: ${command} ${args.join(" ")}`,
    );
  }

  return result.stdout;
}

function writeReport(filename, content) {
  const outputPath = path.join(reportDir, filename);
  const normalized = content.endsWith("\n") ? content : `${content}\n`;
  writeFileSync(outputPath, normalized, "utf8");
}

function summarizeNpmLicenses(rawJson) {
  const data = JSON.parse(rawJson);
  const counts = new Map();

  for (const item of Object.values(data)) {
    const license = item.licenses ?? "UNKNOWN";
    counts.set(license, (counts.get(license) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((left, right) => {
      if (right[1] !== left[1]) {
        return right[1] - left[1];
      }

      return left[0].localeCompare(right[0]);
    })
    .map(([license, count]) => `${count.toString().padStart(3, " ")}  ${license}`)
    .join("\n");
}

const backendPython = resolvePythonCommand(backendDir);

rmSync(reportDir, { recursive: true, force: true });
mkdirSync(reportDir, { recursive: true });

const rootNpmJson = runAndCapture(
  "npx",
  [
    "--yes",
    npmLicenseTool,
    "--json",
    "--excludePrivatePackages",
    "--relativeLicensePath",
    "--relativeModulePath",
  ],
  root,
);

writeReport("root-npm.json", rootNpmJson);
writeReport("root-npm-summary.txt", summarizeNpmLicenses(rootNpmJson));

const frontendNpmJson = runAndCapture(
  "npx",
  [
    "--yes",
    npmLicenseTool,
    "--json",
    "--excludePrivatePackages",
    "--relativeLicensePath",
    "--relativeModulePath",
  ],
  frontendDir,
);

writeReport("frontend-npm.json", frontendNpmJson);
writeReport("frontend-npm-summary.txt", summarizeNpmLicenses(frontendNpmJson));

writeReport(
  "backend-python.json",
  runAndCapture(
    backendPython,
    ["-m", "piplicenses", "--from=mixed", "--with-urls", "--format=json"],
    backendDir,
  ),
);

writeReport(
  "backend-python-summary.txt",
  runAndCapture(
    backendPython,
    ["-m", "piplicenses", "--from=mixed", "--summary", "--order=license"],
    backendDir,
  ),
);

writeReport(
  "README.md",
  [
    "# License Reports",
    "",
    `Generated from \`${path.basename(root)}\` on ${new Date().toISOString()}.`,
    "",
    "Files:",
    "",
    "- `root-npm.json`: root workspace npm dependency license inventory.",
    "- `root-npm-summary.txt`: aggregated license counts for the root workspace.",
    "- `frontend-npm.json`: frontend workspace npm dependency license inventory.",
    "- `frontend-npm-summary.txt`: aggregated license counts for the frontend workspace.",
    "- `backend-python.json`: backend Python dependency license inventory.",
    "- `backend-python-summary.txt`: aggregated license counts for the backend Python environment.",
    "",
    "These reports are generated artifacts and should not be committed.",
  ].join("\n"),
);

console.log(`Created license reports in ${path.relative(root, reportDir)}`);
