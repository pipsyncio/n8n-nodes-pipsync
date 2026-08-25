import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const failures = [];

function fail(message) {
	failures.push(message);
}

function filesBelow(directory) {
	const absolute = join(root, directory);
	if (!statSync(absolute).isDirectory()) return [];
	const files = [];
	for (const entry of readdirSync(absolute)) {
		const entryPath = join(absolute, entry);
		if (statSync(entryPath).isDirectory()) {
			files.push(...filesBelow(relative(root, entryPath)));
		} else {
			files.push(entryPath);
		}
	}
	return files;
}

const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
if ('dependencies' in packageJson && Object.keys(packageJson.dependencies).length > 0) {
	fail('package.json must not contain runtime dependencies');
}
if (JSON.stringify(packageJson.peerDependencies) !== JSON.stringify({ 'n8n-workflow': '*' })) {
	fail('n8n-workflow must be the only peer dependency');
}

const sourceFiles = [...filesBelow('credentials'), ...filesBelow('nodes')].filter((file) =>
	/\.(?:ts|json|svg)$/.test(file),
);
const distRoot = join(root, 'dist');
try {
	if (!statSync(distRoot).isDirectory()) fail('dist directory is missing; build before scanning');
} catch {
	fail('dist directory is missing; build before scanning');
}
const distFiles = failures.some((message) => message.startsWith('dist directory'))
	? []
	: filesBelow('dist').filter((file) => /\.(?:js|json|svg)$/.test(file));

const runtimeFiles = [...sourceFiles, ...distFiles];
const forbiddenAccess = [
	{
		label: 'filesystem import',
		pattern: /(?:from\s+|require\()['"](?:node:)?fs(?:\/promises)?['"]/,
	},
	{
		label: 'shell/process import',
		pattern: /(?:from\s+|require\()['"](?:node:)?child_process['"]/,
	},
	{ label: 'environment access', pattern: /\bprocess\s*\.\s*env\b/ },
	{ label: 'Deno access', pattern: /\bDeno\s*\./ },
	{ label: 'shell execution', pattern: /\b(?:execFile|execSync|spawnSync)\s*\(/ },
	{ label: 'write HTTP method', pattern: /\bmethod\s*:\s*['"](?:POST|PUT|PATCH|DELETE)['"]/i },
];

for (const file of runtimeFiles) {
	const contents = readFileSync(file, 'utf8');
	const displayPath = relative(root, file);
	for (const check of forbiddenAccess) {
		if (check.pattern.test(contents)) fail(`${displayPath}: ${check.label}`);
	}
	if (/\b(?:sk_live_|sk_test_|npm_[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{20,})\b/.test(contents)) {
		fail(`${displayPath}: possible hard-coded credential`);
	}
}

const credentialSource = readFileSync(join(root, 'credentials/PipSyncApi.credentials.ts'), 'utf8');
const credentialRequirements = [
	['password masking', /typeOptions:\s*\{\s*password:\s*true\s*\}/],
	['empty credential default', /name:\s*'apiKey'[\s\S]*?default:\s*''/],
	['generic bearer injection', /Authorization:\s*'=Bearer \{\{\$credentials\.apiKey\}\}'/],
	['supported-node restriction', /restrictToSupportedNodes\s*=\s*true/],
	['fixed credential-test host', /baseURL:\s*'https:\/\/app\.pipsync\.io\/api\/v1'/],
	['credential-test redirects disabled', /disableFollowRedirect:\s*true/],
];
for (const [label, pattern] of credentialRequirements) {
	if (!pattern.test(credentialSource)) fail(`credential missing ${label}`);
}

const descriptionSource = readFileSync(join(root, 'nodes/PipSync/descriptions.ts'), 'utf8');
if (/displayName:\s*['"](?:Base URL|URL|Host|Endpoint)['"]/.test(descriptionSource)) {
	fail('node UI must not expose a user-controlled network target');
}

const contractsSource = readFileSync(join(root, 'nodes/PipSync/contracts.ts'), 'utf8');
const expectedPaths = [
	'/me',
	'/account/usage',
	'/signals',
	'/trades',
	'/reports',
	'/reports/schedules',
	'/reports/trades',
];
for (const path of expectedPaths) {
	if (!contractsSource.includes(`path: '${path}'`)) fail(`route allowlist missing ${path}`);
}
if ((contractsSource.match(/method:\s*'GET'/g) ?? []).length !== expectedPaths.length) {
	fail('route allowlist must contain exactly seven GET methods');
}
if (!contractsSource.includes("PIPSYNC_API_BASE_URL = 'https://app.pipsync.io/api/v1'")) {
	fail('route allowlist must use the fixed official base URL');
}

if (failures.length > 0) {
	console.error('Credential and capability scan failed:');
	for (const failure of failures) console.error(`- ${failure}`);
	process.exitCode = 1;
} else {
	console.log(
		`Credential and capability scan passed (${sourceFiles.length} source assets, ${distFiles.length} built assets, 7 GET routes).`,
	);
}
