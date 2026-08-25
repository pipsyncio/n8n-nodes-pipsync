# n8n verification readiness

Research checked on 2026-08-25 against official n8n documentation and the official n8n starter repository. This document records preparation evidence; it is not an n8n verification claim.

## Current official requirements considered

| Requirement                                                            | Repository evidence                                                                                                     | Remaining external step                                                                                           |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| GitHub Actions provenance required for community nodes from 2026-05-01 | Manual OIDC workflow in `.github/workflows/publish.yml` with `id-token: write` and the official `n8n-node release` path | Create protected environment, configure npm trusted publisher, publish an authorized release, inspect attestation |
| Use the official `n8n-node` tool for verified nodes                    | `@n8n/node-cli` 0.45.4; build, dev, lint, and prerelease scripts use it                                                 | Recheck the supported current version before release                                                              |
| Integrate one third-party service                                      | Only the public PipSync API is integrated                                                                               | n8n reviewer confirmation                                                                                         |
| No external runtime dependencies                                       | No `dependencies`; only the n8n-provided `n8n-workflow` peer                                                            | Inspect the final npm tarball and dependency metadata                                                             |
| No environment or filesystem access in node runtime code               | Custom source and packed-output scan; no such imports or APIs                                                           | Reviewer confirmation and repeat scan on release artifact                                                         |
| TypeScript, validation, error handling, and n8n linting                | Strict TypeScript, pure input validation, sanitized errors, official lint command, Node built-in tests                  | CI run in the canonical public repository                                                                         |
| English UI and documentation                                           | Node descriptions and repository documentation are English                                                              | Reviewer confirmation                                                                                             |
| MIT license                                                            | `LICENSE` and package metadata                                                                                          | Confirm npm renders the license correctly                                                                         |
| Public repository and matching npm metadata                            | Package metadata targets `pipsyncio/n8n-nodes-pipsync`                                                                  | Create/publicize canonical repo; make npm owner/maintainer identities match                                       |
| Working documentation                                                  | README covers operations, credentials, limits, security boundary, development, and support                              | Validate links after remote repository creation                                                                   |

## Official sources

- [Verification guidelines](https://github.com/n8n-io/n8n-docs/blob/main/docs/connect/create-nodes/build-your-node/reference/verification-guidelines.md)
- [Using the n8n-node tool](https://github.com/n8n-io/n8n-docs/blob/main/docs/connect/create-nodes/build-your-node/using-the-n8n-node-tool.md)
- [Set up the development environment](https://github.com/n8n-io/n8n-docs/blob/main/docs/connect/create-nodes/build-your-node/set-up-your-development-environment.md)
- [Node linter](https://github.com/n8n-io/n8n-docs/blob/main/docs/connect/create-nodes/test-your-node/node-linter.md)
- [Credential files](https://github.com/n8n-io/n8n-docs/blob/main/docs/connect/create-nodes/build-your-node/reference/credentials-files.md)
- [Code standards](https://github.com/n8n-io/n8n-docs/blob/main/docs/connect/create-nodes/build-your-node/reference/code-standards.md)
- [Choose a node building style](https://github.com/n8n-io/n8n-docs/blob/main/docs/connect/create-nodes/plan-your-node/choose-a-node-building-style.md)
- [Node UI design](https://github.com/n8n-io/n8n-docs/blob/main/docs/connect/create-nodes/plan-your-node/node-ui-design.md)
- [Official starter package](https://github.com/n8n-io/n8n-nodes-starter/blob/master/package.json)
- [Official starter publishing workflow](https://github.com/n8n-io/n8n-nodes-starter/blob/master/.github/workflows/publish.yml)

## Current development-toolchain notes

- A clean `npm ci --ignore-scripts` and the full verification suite pass on Node.js 22.22.0 with npm 11.8.0.
- `npm audit --omit=dev --audit-level=high` reports zero runtime vulnerabilities.
- A full development-tree audit currently reports six moderate findings through the official `@n8n/node-cli` 0.45.4 AI-development dependency chain. npm's suggested automatic fix is a downgrade to `@n8n/node-cli` 0.20.0, which is below n8n's provenance-capable requirement and was deliberately not applied.
- The same toolchain currently resolves a development-only `isolated-vm` package that declares Node.js 24 or newer. It is not loaded by this package's successful Node.js 22 build, lint, tests, scans, or pack checks. Install lifecycle scripts are disabled so that unrelated native development hooks do not expand the build boundary.
- These upstream development-only findings must be rechecked before an authorized release. They do not appear in the packed community node, which has no external runtime dependency.

## Explicit non-claims

This repository has not been pushed to the canonical GitHub organization, published to npm, installed from npm, submitted through the n8n Creator Portal, or reviewed by n8n. Local success is evidence about the working tree only.
