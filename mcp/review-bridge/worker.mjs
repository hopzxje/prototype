import { appendFile, mkdir, readdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(process.env.STAYHUB_WORKSPACE || join(currentDir, '../..'));
const runtimeRoot = join(currentDir, 'runtime');
const requestsRoot = join(runtimeRoot, 'requests');
const resultsRoot = join(runtimeRoot, 'results');
const logPath = join(runtimeRoot, 'worker.log');
const cliPath = process.env.AGY_CLI || 'D:\\Antigravity CLI\\agy\\bin\\agy.exe';
const pollMs = Number(process.env.REVIEW_WORKER_POLL_MS || 2000);
const timeoutMs = Number(process.env.REVIEW_WORKER_TIMEOUT_MS || 10 * 60 * 1000);
const once = process.argv.includes('--once');
const workerId = `antigravity-worker-${process.pid}`;

function safeId(value) {
  return String(value).replace(/[^a-zA-Z0-9_-]/g, '');
}

function requestPath(id) {
  return join(requestsRoot, `${safeId(id)}.json`);
}

function resultPath(id) {
  return join(resultsRoot, `${safeId(id)}.json`);
}

async function log(message) {
  await mkdir(runtimeRoot, { recursive: true });
  await appendFile(logPath, `[${new Date().toISOString()}] ${message}\n`, 'utf8');
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

async function writeJson(path, value) {
  const temporaryPath = `${path}.${process.pid}.tmp`;
  await mkdir(dirname(path), { recursive: true });
  await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  await rename(temporaryPath, path);
}

async function listRequests() {
  await mkdir(requestsRoot, { recursive: true });
  const files = (await readdir(requestsRoot)).filter(file => file.endsWith('.json'));
  const requests = [];
  for (const file of files) {
    try {
      requests.push(await readJson(join(requestsRoot, file)));
    } catch (error) {
      await log(`Skipped unreadable request ${file}: ${error.message}`);
    }
  }
  return requests.sort((left, right) => left.createdAt.localeCompare(right.createdAt));
}

function buildPrompt(request) {
  const scope = request.scope.map(file => `- ${file}`).join('\n');
  return `You are the read-only UI/code reviewer for the StayHub project.

Review request: ${request.id}
Workspace: ${workspaceRoot}

Read and review these files only as the primary scope:
${scope}

Review focus:
${request.focus}

Rules:
- Do not modify, create, delete, rename, or format any files.
- Do not run commands that change the workspace.
- Do not use browser, Puppeteer, external web, or any other MCP tool for this review; inspect the workspace files directly.
- Inspect the existing implementation and give concrete, prioritized feedback.
- Return ONLY valid JSON, with no Markdown fences and no extra text, using exactly this shape:
{
  "verdict": "approved" or "changes_requested" or "blocked",
  "summary": "short overall conclusion",
  "findings": ["prioritized actionable finding 1", "prioritized actionable finding 2"]
}
- Use "changes_requested" when there are meaningful issues to fix. Use "approved" only when no important issue remains. Use "blocked" only when the review cannot be completed.`;
}

function runCli(prompt) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(cliPath, [
      '-p', prompt,
      '--output-format', 'json',
      '--print-timeout', '10m'
    ], {
      cwd: workspaceRoot,
      windowsHide: true,
      shell: false
    });

    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => {
      child.kill();
      rejectPromise(new Error(`Antigravity CLI timed out after ${Math.round(timeoutMs / 1000)} seconds`));
    }, timeoutMs);

    child.stdout.on('data', chunk => { stdout += chunk.toString(); });
    child.stderr.on('data', chunk => { stderr += chunk.toString(); });
    child.on('error', error => {
      clearTimeout(timer);
      rejectPromise(error);
    });
    child.on('close', (code, signal) => {
      clearTimeout(timer);
      if (code !== 0) {
        rejectPromise(new Error(`Antigravity CLI exited with code ${code ?? 'unknown'}${signal ? ` (${signal})` : ''}: ${stderr.trim() || stdout.trim()}`));
        return;
      }
      resolvePromise({ stdout, stderr });
    });
  });
}

function extractJson(text) {
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace < 0 || lastBrace <= firstBrace) {
    throw new Error('Antigravity response did not contain a JSON object');
  }
  return JSON.parse(text.slice(firstBrace, lastBrace + 1));
}

function normalizeReview(envelope) {
  const responseText = typeof envelope.response === 'string' ? envelope.response.trim() : '';
  let parsed;
  try {
    parsed = extractJson(responseText);
  } catch {
    parsed = {
      verdict: 'changes_requested',
      summary: responseText || 'Antigravity returned an empty review.',
      findings: responseText ? [responseText] : []
    };
  }

  const verdict = ['approved', 'changes_requested', 'blocked'].includes(parsed.verdict)
    ? parsed.verdict
    : 'changes_requested';
  const summary = String(parsed.summary || 'Antigravity completed the review.');
  const findings = Array.isArray(parsed.findings)
    ? parsed.findings.map(item => String(item)).filter(Boolean)
    : [];
  return { verdict, summary, findings };
}

async function saveReview(request, review) {
  const completedAt = new Date().toISOString();
  await writeJson(resultPath(request.id), {
    id: request.id,
    verdict: review.verdict,
    summary: review.summary,
    findings: review.findings,
    reviewer: 'antigravity',
    source: 'antigravity-cli-headless',
    completedAt
  });
  request.status = review.verdict === 'blocked' ? 'blocked' : 'completed';
  request.updatedAt = completedAt;
  request.completedBy = workerId;
  await writeJson(requestPath(request.id), request);
}

async function failReview(request, error) {
  const completedAt = new Date().toISOString();
  const summary = `Không thể nhận phản hồi từ Antigravity CLI: ${error.message}`;
  await writeJson(resultPath(request.id), {
    id: request.id,
    verdict: 'blocked',
    summary,
    findings: [summary],
    reviewer: 'antigravity',
    source: 'antigravity-cli-headless',
    completedAt
  });
  request.status = 'blocked';
  request.updatedAt = completedAt;
  request.completedBy = workerId;
  await writeJson(requestPath(request.id), request);
}

async function processRequest(request) {
  request.status = 'in_review';
  request.reviewStartedAt = new Date().toISOString();
  request.reviewWorker = workerId;
  await writeJson(requestPath(request.id), request);
  await log(`Review started: ${request.id}`);

  try {
    const { stdout, stderr } = await runCli(buildPrompt(request));
    const envelope = extractJson(stdout);
    const review = normalizeReview(envelope);
    await saveReview(request, review);
    await log(`Review completed: ${request.id} (${review.verdict})`);
    if (stderr.trim()) await log(`CLI diagnostics for ${request.id}: ${stderr.trim()}`);
  } catch (error) {
    await failReview(request, error);
    await log(`Review blocked: ${request.id} (${error.message})`);
  }
}

async function processPending() {
  const requests = await listRequests();
  const pending = requests.filter(request => request.status === 'pending');
  if (pending.length === 0) return 0;
  for (const request of pending) await processRequest(request);
  return pending.length;
}

await log(`Worker started (${workerId}) using ${cliPath}`);
if (once) {
  await processPending();
  await log(`Worker finished one-shot run (${workerId})`);
  process.exit(0);
}

let busy = false;
const tick = async () => {
  if (busy) return;
  busy = true;
  try {
    await processPending();
  } catch (error) {
    await log(`Worker loop error: ${error.message}`);
  } finally {
    busy = false;
  }
};

await tick();
setInterval(tick, pollMs);
process.on('SIGINT', async () => { await log(`Worker stopped (${workerId})`); process.exit(0); });
process.on('SIGTERM', async () => { await log(`Worker stopped (${workerId})`); process.exit(0); });
