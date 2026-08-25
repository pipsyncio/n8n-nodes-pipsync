# Changelog

All notable changes to this project are documented in this file. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the package follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- No changes yet.

## [0.1.0] - 2026-08-25

### Added

- Read-only resources for profile, usage, signals, trades, reports, report schedules, and trade reports.
- JSON, CSV, and PDF trade report handling.
- Fixed-host bearer credential with redirect and cross-origin credential protections.
- Pure request-contract tests, mocked execution tests, credential/capability scanning, and package-content smoke checks.
- Read-only CI and a manual, confirmation-gated npm provenance workflow prepared for future authorized publishing.
- Measurable account and integration paths for evaluators coming from GitHub.

### Security

- No write operation, webhook ingress, broker action, live order, MCP function, arbitrary URL, runtime file access, environment access, shell access, analytics, or external runtime dependency.

> Version 0.1.0 is repository-ready but has not been published to npm as of this date.

[Unreleased]: https://github.com/pipsyncio/n8n-nodes-pipsync/compare/0.1.0...HEAD
[0.1.0]: https://github.com/pipsyncio/n8n-nodes-pipsync/releases/tag/0.1.0
