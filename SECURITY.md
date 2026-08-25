# Security policy

## Supported versions

No version has been published to npm yet. Before publication, security fixes apply to the default branch only. After publication, this table will be updated with supported release lines.

## Report a vulnerability privately

Do not open a public issue for exposed API keys, credential-handling flaws, SSRF, authentication bypasses, dependency compromise, or other sensitive findings.

Email [support@pipsync.io](mailto:support@pipsync.io) with:

- the affected version or commit;
- a concise impact statement;
- minimal reproduction steps;
- whether any real credential or customer data may have been involved; and
- a safe contact method for follow-up.

Remove credentials, personal data, trade records, and account identifiers from screenshots and logs. We will acknowledge receipt as capacity allows; this file does not promise a response or remediation deadline.

## If a key may be exposed

1. Revoke or rotate it in PipSync immediately.
2. Remove it from the affected n8n credential and execution data.
3. Review workflow sharing, execution retention, and instance access.
4. Contact PipSync Support if account access may have been affected.

Deleting a secret from a later Git commit does not remove it from repository history.

## Security design boundary

The node intentionally:

- sends authenticated requests only to `https://app.pipsync.io/api/v1`;
- disables redirects and cross-origin credential forwarding;
- uses only seven allowlisted `GET` paths;
- delegates bearer-header injection to n8n's credential system;
- masks the credential field and restricts the credential to this node type;
- returns sanitized error messages; and
- avoids runtime file, environment, and shell access.

These controls reduce scope but do not make the host n8n instance, PipSync account, downstream nodes, or network automatically secure. Operators remain responsible for instance hardening, credential access, execution retention, backups, and updates.
