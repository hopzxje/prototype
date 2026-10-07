# StayHub Review Bridge

This folder is the local MCP bridge between the coding agent and a read-only UI reviewer.

The bridge stores review requests and results under `runtime/` and never edits project files. The reviewer can inspect the workspace and submit findings; the coding agent remains responsible for applying changes.

## Install

```powershell
Set-Location D:\ky9\capstone\prototype\mcp\review-bridge
npm install
```

## Run

```powershell
npm start
```

Register `mcp-config.example.json` in Antigravity or another MCP host. Use an absolute path for the server entry when registering it.

## Automatic headless reviewer

The worker watches `runtime/requests/` and sends pending read-only reviews to the Antigravity Agent CLI. It writes the response back to `runtime/results/`, so Codex can read it through `get_review_request` without a manual prompt in Antigravity.

```powershell
Set-Location D:\ky9\capstone\prototype\mcp\review-bridge
npm run worker
```

The worker expects the CLI at `D:\Antigravity CLI\agy\bin\agy.exe`. Override it with `AGY_CLI` when needed. Use `npm run worker:once` for a single queue pass.

## Review flow

1. Create a review request with `create_review_request`.
2. Antigravity reads the requested scope and reviews the workspace without editing files.
3. Antigravity submits findings with `submit_review_result`.
4. The coding agent reads the result with `get_review_request`.
5. The coding agent acquires the workspace lock before changing files and releases it afterward.
