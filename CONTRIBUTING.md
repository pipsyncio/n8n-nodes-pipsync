# Contributing

Thanks for helping improve the PipSync community node.

## Non-negotiable scope

Contributions must preserve the read-only boundary. Do not add:

- write HTTP methods or mutation endpoints;
- webhook, trigger, or signal-ingress behavior;
- broker connections or order actions;
- MCP tools or live-trading controls;
- an editable base URL, proxy target, or arbitrary path;
- file, environment-variable, or shell access in runtime node code;
- analytics, telemetry, credential logging, or raw request logging; or
- another third-party service or runtime dependency.

Open a design issue before changing the API route allowlist, credential model, response model, or package boundary. A broader integration belongs in a separately reviewed project.

## Development

Use Node.js 22.22.0 or newer.

```bash
npm ci
npm run verify
```

Add or update Node built-in tests for every behavior change. Tests must be deterministic and must not call the live PipSync API. Update the public contract snapshot, version metadata, documentation, and changelog when the public API contract changes.

## Pull requests

Keep pull requests focused and explain:

- the user problem;
- the API contract evidence;
- security and credential impact;
- tests performed; and
- any compatibility or release risk.

Never include a real API key, account identifier, customer record, trading record, or production response fixture. By contributing, you agree that your contribution is licensed under the MIT License.
