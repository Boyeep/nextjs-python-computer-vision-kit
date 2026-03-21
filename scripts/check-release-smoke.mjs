import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";

const root = process.cwd();
const backendImage = process.env.BACKEND_IMAGE;
const frontendImage = process.env.FRONTEND_IMAGE;

if (!backendImage || !frontendImage) {
  console.error("Set BACKEND_IMAGE and FRONTEND_IMAGE before running the release smoke check.");
  process.exit(1);
}

const backendUrl = process.env.BACKEND_SMOKE_URL ?? "http://127.0.0.1:8000";
const frontendUrl = process.env.FRONTEND_SMOKE_URL ?? "http://127.0.0.1:3000";
const backendContainer = `cv-kit-backend-smoke-${Date.now()}`;
const frontendContainer = `cv-kit-frontend-smoke-${Date.now()}`;
const networkName = `cv-kit-smoke-${Date.now()}`;
const fixturePath = path.join(root, "backend", "tests", "fixtures", "detection-scene.png");

let cleanedUp = false;

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    shell: process.platform === "win32",
    stdio: options.capture ? "pipe" : "inherit",
  });

  if (result.error) {
    throw result.error;
  }

  if (!options.allowFailure && result.status !== 0) {
    const details = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
    throw new Error(
      details
        ? `Command failed: ${command} ${args.join(" ")}\n${details}`
        : `Command failed: ${command} ${args.join(" ")}`,
    );
  }

  return result;
}

async function waitFor(label, action, options = {}) {
  const attempts = options.attempts ?? 30;
  const intervalMs = options.intervalMs ?? 2000;
  let lastError = new Error(`${label} did not finish.`);

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await action();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt === attempts) {
        break;
      }

      console.log(`${label} not ready yet (${attempt}/${attempts}). Retrying...`);
      await delay(intervalMs);
    }
  }

  throw lastError;
}

async function expectText(url, snippet) {
  const response = await fetch(url);
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Expected ${url} to return 2xx, received ${response.status}.`);
  }

  if (!text.includes(snippet)) {
    throw new Error(`Expected ${url} to include "${snippet}".`);
  }
}

async function expectJson(url, predicate, label) {
  const response = await fetch(url);
  const body = await response.text();

  if (!response.ok) {
    throw new Error(`Expected ${url} to return 2xx, received ${response.status}.`);
  }

  const payload = JSON.parse(body);
  if (!predicate(payload)) {
    throw new Error(`Unexpected payload for ${label}.`);
  }

  return payload;
}

async function runInferenceSmoke() {
  const bytes = await readFile(fixturePath);
  const formData = new FormData();
  formData.set("file", new Blob([bytes], { type: "image/png" }), "detection-scene.png");
  formData.set("pipeline_id", "starter-detection");

  const response = await fetch(`${backendUrl}/api/v1/analyze`, {
    method: "POST",
    body: formData,
  });
  const body = await response.text();

  if (!response.ok) {
    throw new Error(`Inference smoke request failed with ${response.status}.\n${body}`);
  }

  const payload = JSON.parse(body);
  if (payload?.pipeline?.id !== "starter-detection") {
    throw new Error("Smoke inference returned the wrong pipeline id.");
  }

  if (!Array.isArray(payload?.detections) || payload.detections.length === 0) {
    throw new Error("Smoke inference returned no detections.");
  }

  if (!payload?.image?.width || !payload?.image?.height) {
    throw new Error("Smoke inference returned invalid image dimensions.");
  }
}

function cleanup() {
  if (cleanedUp) {
    return;
  }

  cleanedUp = true;

  run("docker", ["rm", "-f", frontendContainer], { allowFailure: true });
  run("docker", ["rm", "-f", backendContainer], { allowFailure: true });
  run("docker", ["network", "rm", networkName], { allowFailure: true });
}

function printContainerLogs() {
  console.log("\nBackend container logs:");
  run("docker", ["logs", backendContainer], { allowFailure: true });

  console.log("\nFrontend container logs:");
  run("docker", ["logs", frontendContainer], { allowFailure: true });
}

process.on("SIGINT", () => {
  cleanup();
  process.exit(130);
});

process.on("SIGTERM", () => {
  cleanup();
  process.exit(143);
});

try {
  run("docker", ["network", "create", networkName]);

  await waitFor(
    "Backend image pull",
    async () => {
      run("docker", ["pull", backendImage], { capture: true });
    },
    { attempts: 12, intervalMs: 10000 },
  );

  await waitFor(
    "Frontend image pull",
    async () => {
      run("docker", ["pull", frontendImage], { capture: true });
    },
    { attempts: 12, intervalMs: 10000 },
  );

  run("docker", [
    "run",
    "--detach",
    "--rm",
    "--name",
    backendContainer,
    "--network",
    networkName,
    "--publish",
    "8000:8000",
    backendImage,
  ]);

  await waitFor(
    "Backend health",
    async () =>
      expectJson(
        `${backendUrl}/health`,
        (payload) => payload?.status === "ok",
        "backend health",
      ),
  );

  await expectJson(
    `${backendUrl}/api/v1/pipelines`,
    (payload) =>
      Array.isArray(payload?.pipelines) &&
      payload.pipelines.some((item) => item?.id === "starter-detection"),
    "pipeline catalog",
  );

  await runInferenceSmoke();

  run("docker", [
    "run",
    "--detach",
    "--rm",
    "--name",
    frontendContainer,
    "--network",
    networkName,
    "--publish",
    "3000:3000",
    "--env",
    `NEXT_PUBLIC_API_BASE_URL=http://${backendContainer}:8000/api/v1`,
    frontendImage,
  ]);

  await waitFor(
    "Frontend home page",
    async () =>
      expectText(
        frontendUrl,
        "A detection-first computer vision kit with room to grow.",
      ),
  );

  await expectText(
    `${frontendUrl}/webcam`,
    "Webcam mode is an extension, not the template main story.",
  );

  console.log("Release smoke check passed.");
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  printContainerLogs();
  process.exitCode = 1;
} finally {
  cleanup();
}
