'use strict';

const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');

const { PIPSYNC_API_BASE_URL, PIPSYNC_RESOURCES } = require('../dist/nodes/PipSync/contracts.js');
const { buildPipSyncRequest } = require('../dist/nodes/PipSync/request.js');

test('route allowlist matches the vendored public snapshot', () => {
	const snapshot = JSON.parse(
		readFileSync(join(__dirname, '../contracts/pipsync-public-readonly.snapshot.json'), 'utf8'),
	);
	const actual = Object.entries(PIPSYNC_RESOURCES).map(([resource, contract]) => ({
		resource,
		method: contract.method,
		path: contract.path,
	}));
	const expected = snapshot.operations.map(({ resource, method, path }) => ({
		resource,
		method,
		path,
	}));

	assert.equal(PIPSYNC_API_BASE_URL, snapshot.baseUrl);
	assert.deepEqual(actual, expected);
	assert.equal(actual.length, 7);
	assert.ok(actual.every(({ method }) => method === 'GET'));
});

test('builds bounded signal requests and omits an empty since value', () => {
	assert.deepEqual(buildPipSyncRequest('signal', 'getMany', { limit: 50, since: '' }), {
		accept: 'application/json',
		baseURL: 'https://app.pipsync.io/api/v1',
		method: 'GET',
		output: 'json',
		path: '/signals',
		query: { limit: 50 },
	});
	assert.equal(
		buildPipSyncRequest('signal', 'getMany', {
			limit: 1,
			since: '2026-08-25T12:30:45+02:00',
		}).query.since,
		'2026-08-25T12:30:45+02:00',
	);
	assert.equal(buildPipSyncRequest('signal', 'getMany', { limit: 100 }).query.limit, 100);
});

test('rejects invalid resources, operations, limits, statuses, and date-times', () => {
	assert.throws(() => buildPipSyncRequest('unknown', 'get', {}), /Resource is not supported/);
	assert.throws(() => buildPipSyncRequest('profile', 'getMany', {}), /Operation is not supported/);
	assert.throws(() => buildPipSyncRequest('signal', 'getMany', { limit: 0 }), /between 1 and 100/);
	assert.throws(() => buildPipSyncRequest('trade', 'getMany', { limit: 101 }), /between 1 and 100/);
	assert.throws(
		() => buildPipSyncRequest('trade', 'getMany', { limit: 50, status: 'pending' }),
		/Status is not supported/,
	);
	assert.throws(
		() => buildPipSyncRequest('signal', 'getMany', { limit: 50, since: '2026-08-25' }),
		/RFC 3339/,
	);
});

test('builds JSON, CSV, and PDF trade reports with a conservative time range', () => {
	const json = buildPipSyncRequest('tradeReport', 'get', {
		format: 'json',
		from: '2026-08-01T00:00:00Z',
		limit: 500,
		status: 'closed',
		to: '2026-08-25T23:59:59Z',
	});
	assert.equal(json.output, 'json');
	assert.deepEqual(json.query, {
		format: 'json',
		limit: 500,
		status: 'closed',
		from: '2026-08-01T00:00:00Z',
		to: '2026-08-25T23:59:59Z',
	});

	const csv = buildPipSyncRequest('tradeReport', 'get', {
		format: 'csv',
		limit: 1,
		status: 'all',
	});
	assert.equal(csv.output, 'binary');
	assert.equal(csv.accept, 'text/csv');
	assert.equal(csv.fileName, 'pipsync-trade-report.csv');

	const pdf = buildPipSyncRequest('tradeReport', 'get', {
		format: 'pdf',
		limit: 1000,
		status: 'all',
	});
	assert.equal(pdf.output, 'binary');
	assert.equal(pdf.accept, 'application/pdf');
	assert.equal(pdf.fileName, 'pipsync-trade-report.pdf');

	assert.throws(
		() =>
			buildPipSyncRequest('tradeReport', 'get', {
				format: 'json',
				from: '2026-08-26T00:00:00Z',
				limit: 500,
				status: 'all',
				to: '2026-08-25T00:00:00Z',
			}),
		/From must not be later than To/,
	);
});
