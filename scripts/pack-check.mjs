import { spawnSync } from 'node:child_process';

const result = spawnSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], {
	encoding: 'utf8',
	stdio: ['ignore', 'pipe', 'pipe'],
});

if (result.status !== 0) {
	console.error(result.stderr || result.stdout || 'npm pack dry-run failed');
	process.exitCode = 1;
} else {
	let report;
	try {
		report = JSON.parse(result.stdout)[0];
	} catch {
		console.error('npm pack returned an unreadable report');
		process.exitCode = 1;
	}

	if (report) {
		const files = report.files.map(({ path }) => path).sort();
		const required = [
			'CHANGELOG.md',
			'LICENSE',
			'NOTICE',
			'README.md',
			'dist/credentials/PipSyncApi.credentials.js',
			'dist/nodes/PipSync/PipSync.node.js',
			'dist/nodes/PipSync/PipSync.node.json',
			'dist/nodes/PipSync/pipsync.dark.svg',
			'dist/nodes/PipSync/pipsync.svg',
			'package.json',
		];
		const forbiddenPrefixes = [
			'.github/',
			'assets/',
			'contracts/',
			'credentials/',
			'dist/assets/',
			'docs/',
			'metadata/',
			'node_modules/',
			'nodes/',
			'scripts/',
			'test/',
		];
		const failures = [];
		for (const path of required) {
			if (!files.includes(path)) failures.push(`missing ${path}`);
		}
		for (const path of files) {
			if (forbiddenPrefixes.some((prefix) => path.startsWith(prefix))) {
				failures.push(`unexpected source path ${path}`);
			}
			if (
				(path.endsWith('.ts') && !path.endsWith('.d.ts')) ||
				path.endsWith('.tsbuildinfo') ||
				path.endsWith('.tgz')
			) {
				failures.push(`unexpected build/source artifact ${path}`);
			}
		}
		if (files.includes('dist/package.json')) failures.push('unexpected nested package metadata');

		if (failures.length > 0) {
			console.error('Package-content smoke check failed:');
			for (const failure of failures) console.error(`- ${failure}`);
			process.exitCode = 1;
		} else {
			console.log(
				`Package-content smoke check passed (${files.length} files, ${report.unpackedSize} unpacked bytes).`,
			);
		}
	}
}
