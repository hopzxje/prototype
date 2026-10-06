import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { McpServer } from '@modelcontextprotocol/server';
import { StdioServerTransport } from '@modelcontextprotocol/server/stdio';
import * as z from 'zod/v4';

const currentDir = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(process.env.STAYHUB_WORKSPACE || join(currentDir, '../..'));
const runtimeRoot = join(currentDir, 'runtime');
const requestsRoot = join(runtimeRoot, 'requests');
const resultsRoot = join(runtimeRoot, 'results');
const lockPath = join(runtimeRoot, 'workspace.lock.json');

function resultText(text, isError = false) {
  return { content: [{ type: 'text', text }], isError };
}

function safeId(value) {
  return String(value).replace(/[^a-zA-Z0-9_-]/g, '');
}

function requestPath(id) {
  return join(requestsRoot, `${safeId(id)}.json`);
}

function resultPath(id) {
  return join(resultsRoot, `${safeId(id)}.json`);
}

async function ensureRuntime() {
  await mkdir(requestsRoot, { recursive: true });
  await mkdir(resultsRoot, { recursive: true });
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

async function writeJson(path, value) {
  const temporaryPath = `${path}.${randomUUID()}.tmp`;
  await mkdir(dirname(path), { recursive: true });
  await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  await rename(temporaryPath, path);
}

async function readRequest(id) {
  try {
    return await readJson(requestPath(id));
  } catch {
    return null;
  }
}

async function getLock() {
  try {
    return await readJson(lockPath);
  } catch {
    return null;
  }
}

const server = new McpServer({
  name: 'stayhub-review-bridge',
  version: '0.1.0'
});

server.registerTool(
  'create_review_request',
  {
    description: 'Create a read-only UI or code review request for Antigravity.',
    inputSchema: z.object({
      scope: z.array(z.string()).min(1),
      focus: z.string().min(1),
      requester: z.string().default('codex')
    })
  },
  async ({ scope, focus, requester }) => {
    await ensureRuntime();
    const id = `review-${Date.now()}-${randomUUID().slice(0, 8)}`;
    const request = {
      id,
      status: 'pending',
      requester,
      scope,
      focus,
      workspaceRoot,
      createdAt: new Date().toISOString()
    };
    await writeJson(requestPath(id), request);
    return resultText(JSON.stringify(request, null, 2));
  }
);

server.registerTool(
  'list_review_requests',
  {
    description: 'List review requests waiting for or receiving review.',
    inputSchema: z.object({
      status: z.enum(['pending', 'in_review', 'completed', 'blocked']).optional()
    })
  },
  async ({ status }) => {
    await ensureRuntime();
    const { readdir } = await import('node:fs/promises');
    const files = (await readdir(requestsRoot)).filter(file => file.endsWith('.json'));
    const requests = [];
    for (const file of files) {
      const request = await readJson(join(requestsRoot, file));
      if (!status || request.status === status) requests.push(request);
    }
    requests.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
    return resultText(JSON.stringify(requests, null, 2));
  }
);

server.registerTool(
  'get_review_request',
  {
    description: 'Read one review request and its result if available.',
    inputSchema: z.object({ id: z.string().min(1) })
  },
  async ({ id }) => {
    const request = await readRequest(id);
    if (!request) return resultText(`Review request not found: ${id}`, true);
    let review = null;
    try {
      review = await readJson(resultPath(id));
    } catch {
      review = null;
    }
    return resultText(JSON.stringify({ request, review }, null, 2));
  }
);

server.registerTool(
  'submit_review_result',
  {
    description: 'Submit an Antigravity review result without modifying workspace files.',
    inputSchema: z.object({
      id: z.string().min(1),
      verdict: z.enum(['approved', 'changes_requested', 'blocked']),
      summary: z.string().min(1),
      findings: z.array(z.string()).default([])
    })
  },
  async ({ id, verdict, summary, findings }) => {
    const request = await readRequest(id);
    if (!request) return resultText(`Review request not found: ${id}`, true);
    const review = {
      id,
      verdict,
      summary,
      findings,
      reviewer: 'antigravity',
      completedAt: new Date().toISOString()
    };
    await writeJson(resultPath(id), review);
    request.status = verdict === 'blocked' ? 'blocked' : 'completed';
    request.updatedAt = review.completedAt;
    await writeJson(requestPath(id), request);
    return resultText(JSON.stringify(review, null, 2));
  }
);

server.registerTool(
  'acquire_workspace_lock',
  {
    description: 'Reserve the workspace for one agent before a write operation.',
    inputSchema: z.object({
      owner: z.string().min(1),
      ttlSeconds: z.number().int().min(30).max(3600).default(600)
    })
  },
  async ({ owner, ttlSeconds }) => {
    await ensureRuntime();
    const existing = await getLock();
    const now = Date.now();
    if (existing && existing.expiresAt > now && existing.owner !== owner) {
      return resultText(JSON.stringify({ locked: false, lock: existing }, null, 2), true);
    }
    const lock = {
      owner,
      workspaceRoot,
      acquiredAt: new Date(now).toISOString(),
      expiresAt: now + ttlSeconds * 1000
    };
    await writeJson(lockPath, lock);
    return resultText(JSON.stringify({ locked: true, lock }, null, 2));
  }
);

server.registerTool(
  'release_workspace_lock',
  {
    description: 'Release the workspace reservation after a write operation.',
    inputSchema: z.object({ owner: z.string().min(1) })
  },
  async ({ owner }) => {
    const existing = await getLock();
    if (!existing) return resultText('Workspace is already unlocked.');
    if (existing.owner !== owner) return resultText(`Workspace is locked by ${existing.owner}.`, true);
    await rm(lockPath, { force: true });
    return resultText('Workspace lock released.');
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error(`StayHub review bridge ready for ${workspaceRoot}`);
