# Publishing checklist

Publishing changes external state. Complete this checklist only after an authorized maintainer explicitly approves an npm release. Repository preparation and local verification are not permission to publish.

## 1. Ownership and naming

- [ ] Confirm that `https://github.com/pipsyncio/n8n-nodes-pipsync` is public and is the canonical repository.
- [ ] Confirm that `n8n-nodes-pipsync` is still available on npm or already controlled by the PipSync publisher.
- [ ] Confirm the npm author and maintainers match people or organizations visible on the GitHub repository.
- [ ] Enable two-factor authentication and protected access for npm and GitHub maintainers.
- [ ] Review repository topics, description, homepage, social preview, support links, and license.

Package-name availability was checked with `npm view n8n-nodes-pipsync` on 2026-08-25 and returned `E404`. That observation does not reserve the name.

## 2. Contract and security review

- [ ] Compare all seven routes with the current public PipSync OpenAPI document.
- [ ] Confirm every runtime request uses `GET`, the fixed official host, redirects disabled, and cross-origin credential forwarding disabled.
- [ ] Confirm there is no webhook ingress, broker operation, live order, MCP capability, arbitrary URL, runtime file/environment/shell access, analytics, or credential logging.
- [ ] Confirm `package.json` has no `dependencies` entry and integrates exactly one third-party service.
- [ ] Review `npm audit --omit=dev`; separately triage development-only advisories.
- [ ] Run an authorized smoke test with a fresh, least-privileged, non-production API key, then rotate or delete the key.

## 3. Release evidence

- [ ] Select the intended Node.js 22.22.0+ runtime.
- [ ] Run `npm ci --ignore-scripts` from a clean checkout, then run the explicit verification commands below.
- [ ] Run `npm run verify` and retain the log.
- [ ] Run `npm pack --json`, inspect the tarball, and verify that only documented package files are present.
- [ ] Confirm the version in `package.json`, `metadata/versions.json`, and `CHANGELOG.md` agrees.
- [ ] Confirm the release commit is reviewed and CI is green.
- [ ] Create a signed release tag that matches the package version only after approval.

## 4. npm trusted publishing and provenance

- [ ] Create or take ownership of the npm package under the authorized PipSync publisher.
- [ ] In npm package settings, add a GitHub Actions trusted publisher for owner `pipsyncio`, repository `n8n-nodes-pipsync`, workflow `publish.yml`, and environment `npm-publish`.
- [ ] In GitHub, create the protected `npm-publish` environment and require designated maintainer approval.
- [ ] Keep long-lived `NPM_TOKEN` secrets unset; this workflow is designed for OIDC trusted publishing only.
- [ ] Review `.github/workflows/publish.yml`, enter the exact confirmation phrase, and dispatch it from the approved release commit.
- [ ] Verify the npm package page shows a provenance attestation linked to this public repository and workflow.
- [ ] Download the published package independently and repeat the package-content and credential scans.

If npm requires the package to exist before a trusted publisher can be configured, stop and document a separately authorized bootstrap procedure. Do not silently add a broad automation token to the workflow.

## 5. n8n submission

- [ ] Install the provenance-bearing npm release on a supported clean n8n test instance.
- [ ] Test credential creation and all seven operations, including JSON, CSV, and PDF trade reports.
- [ ] Confirm every UI label, description, README section, and credential instruction is English.
- [ ] Submit the package through the n8n Creator Portal using the matching npm and GitHub identities.
- [ ] Provide the public repository, npm package, documentation, license, test evidence, and provenance link.
- [ ] Record n8n reviewer feedback and resolve it before claiming the node is verified.

No step in this repository guarantees npm ownership, npm publication, n8n review, or n8n verification.
