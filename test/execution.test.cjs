'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const { PipSync, safePipSyncErrorMessage } = require('../dist/nodes/PipSync/PipSync.node.js');

function executionContext(parameters, response, options = {}) {
	const requests = [];
	const binaryInputs = [];
	const context = {
		continueOnFail: () => options.continueOnFail ?? false,
		getInputData: () => [{ json: { incoming: true } }],
		getNode: () => ({
			name: 'PipSync',
			parameters,
			position: [0, 0],
			type: 'n8n-nodes-pipsync.pipSync',
			typeVersion: 1,
		}),
		getNodeParameter: (name, _itemIndex, fallback) =>
			Object.prototype.hasOwnProperty.call(parameters, name) ? parameters[name] : fallback,
		helpers: {
			httpRequestWithAuthentication: async (credentialType, requestOptions) => {
				requests.push({ credentialType, requestOptions });
				if (response instanceof Error || options.throwValue !== undefined) {
					throw options.throwValue ?? response;
				}
				return response;
			},
			prepareBinaryData: async (buffer, fileName, mimeType) => {
				binaryInputs.push({ buffer, fileName, mimeType });
				return { data: buffer.toString('base64'), fileName, mimeType };
			},
		},
	};
	return { binaryInputs, context, requests };
}

test('executes a JSON request only against the fixed host with redirect protection', async () => {
	const { context, requests } = executionContext(
		{ resource: 'signal', operation: 'getMany', limit: 50, since: '' },
		{ data: [], meta: { count: 0, limit: 50 } },
	);
	const result = await new PipSync().execute.call(context);

	assert.equal(requests.length, 1);
	assert.equal(requests[0].credentialType, 'pipSyncApi');
	assert.deepEqual(requests[0].requestOptions, {
		allowedDomains: 'app.pipsync.io',
		baseURL: 'https://app.pipsync.io/api/v1',
		disableFollowRedirect: true,
		encoding: 'json',
		headers: { Accept: 'application/json' },
		json: true,
		method: 'GET',
		qs: { limit: 50 },
		sendCredentialsOnCrossOriginRedirect: false,
		timeout: 30000,
		url: '/signals',
	});
	assert.deepEqual(result[0][0].json, { data: [], meta: { count: 0, limit: 50 } });
	assert.deepEqual(result[0][0].pairedItem, { item: 0 });
});

test('returns PDF reports as deterministic binary output', async () => {
	const { binaryInputs, context, requests } = executionContext(
		{
			resource: 'tradeReport',
			operation: 'get',
			format: 'pdf',
			limit: 25,
			status: 'closed',
			from: '',
			to: '',
		},
		Buffer.from('%PDF-synthetic-test'),
	);
	const result = await new PipSync().execute.call(context);

	assert.equal(requests[0].requestOptions.encoding, 'arraybuffer');
	assert.equal(requests[0].requestOptions.headers.Accept, 'application/pdf');
	assert.equal(binaryInputs.length, 1);
	assert.equal(binaryInputs[0].fileName, 'pipsync-trade-report.pdf');
	assert.equal(binaryInputs[0].mimeType, 'application/pdf');
	assert.equal(result[0][0].binary.data.fileName, 'pipsync-trade-report.pdf');
	assert.equal(result[0][0].json.format, 'pdf');
});

test('sanitizes authentication failures and never returns raw request secrets', async () => {
	const secret = 'synthetic-secret-that-must-not-escape';
	const failure = {
		config: { headers: { Authorization: `Bearer ${secret}` } },
		response: { status: 401 },
	};
	const { context } = executionContext(
		{ resource: 'profile', operation: 'get' },
		{},
		{ continueOnFail: true, throwValue: failure },
	);
	const result = await new PipSync().execute.call(context);
	const serialized = JSON.stringify(result);

	assert.equal(
		result[0][0].json.error,
		'PipSync authentication failed; check or rotate the API key',
	);
	assert.equal(serialized.includes(secret), false);
	assert.equal(serialized.includes('Authorization'), false);
	assert.equal(safePipSyncErrorMessage({ response: { status: 429 } }).includes('rate limit'), true);
	assert.equal(
		safePipSyncErrorMessage({ response: { status: 503 } }).includes('unavailable'),
		true,
	);
});

test('returns safe, actionable validation errors without making a request', async () => {
	const { context, requests } = executionContext(
		{ resource: 'signal', operation: 'getMany', limit: 101, since: '' },
		{},
		{ continueOnFail: true },
	);
	const result = await new PipSync().execute.call(context);

	assert.equal(requests.length, 0);
	assert.equal(result[0][0].json.error, 'Limit must be between 1 and 100');
});
