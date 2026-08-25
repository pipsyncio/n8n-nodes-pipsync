import {
	PIPSYNC_API_BASE_URL,
	PIPSYNC_RESOURCES,
	isPipSyncResource,
	type PipSyncResource,
} from './contracts';

const RFC3339_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+-]\d{2}:\d{2})$/;

const TRADE_STATUSES = new Set(['open', 'closed', 'cancelled']);
const REPORT_STATUSES = new Set(['open', 'closed', 'partial', 'rejected', 'all']);
const REPORT_FORMATS = new Set(['json', 'csv', 'pdf']);

export class PipSyncInputError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'PipSyncInputError';
	}
}

export interface PipSyncRequestInput {
	format?: unknown;
	from?: unknown;
	limit?: unknown;
	since?: unknown;
	status?: unknown;
	to?: unknown;
}

export interface PipSyncRequestSpec {
	accept: 'application/json' | 'application/pdf' | 'text/csv';
	baseURL: typeof PIPSYNC_API_BASE_URL;
	fileName?: string;
	method: 'GET';
	mimeType?: 'application/pdf' | 'text/csv';
	output: 'binary' | 'json';
	path: string;
	query: Record<string, number | string>;
}

function parseInteger(value: unknown, name: string, minimum: number, maximum: number): number {
	if (typeof value !== 'number' || !Number.isInteger(value)) {
		throw new PipSyncInputError(`${name} must be a whole number`);
	}
	if (value < minimum || value > maximum) {
		throw new PipSyncInputError(`${name} must be between ${minimum} and ${maximum}`);
	}
	return value;
}

function parseOptionalRfc3339(value: unknown, name: string): string | undefined {
	if (value === undefined || value === '') return undefined;
	if (
		typeof value !== 'string' ||
		!RFC3339_PATTERN.test(value) ||
		Number.isNaN(Date.parse(value))
	) {
		throw new PipSyncInputError(`${name} must be an RFC 3339 date-time with a timezone`);
	}
	return value;
}

function parseOptionalEnum(
	value: unknown,
	name: string,
	allowed: ReadonlySet<string>,
): string | undefined {
	if (value === undefined || value === '') return undefined;
	if (typeof value !== 'string' || !allowed.has(value)) {
		throw new PipSyncInputError(`${name} is not supported`);
	}
	return value;
}

function assertOperation(resource: PipSyncResource, operation: string): void {
	if (operation !== PIPSYNC_RESOURCES[resource].operation) {
		throw new PipSyncInputError(`Operation is not supported for ${resource}`);
	}
}

export function buildPipSyncRequest(
	resourceValue: string,
	operation: string,
	input: PipSyncRequestInput = {},
): PipSyncRequestSpec {
	if (!isPipSyncResource(resourceValue)) {
		throw new PipSyncInputError('Resource is not supported');
	}

	const resource = resourceValue;
	const contract = PIPSYNC_RESOURCES[resource];
	assertOperation(resource, operation);

	const request: PipSyncRequestSpec = {
		accept: 'application/json',
		baseURL: PIPSYNC_API_BASE_URL,
		method: contract.method,
		output: 'json',
		path: contract.path,
		query: {},
	};

	if (resource === 'signal') {
		request.query.limit = parseInteger(input.limit, 'Limit', 1, 100);
		const since = parseOptionalRfc3339(input.since, 'Since');
		if (since !== undefined) request.query.since = since;
	}

	if (resource === 'trade') {
		request.query.limit = parseInteger(input.limit, 'Limit', 1, 100);
		const status = parseOptionalEnum(input.status, 'Status', TRADE_STATUSES);
		if (status !== undefined) request.query.status = status;
	}

	if (resource === 'tradeReport') {
		const format = parseOptionalEnum(input.format ?? 'json', 'Format', REPORT_FORMATS) ?? 'json';
		request.query.format = format;
		request.query.limit = parseInteger(input.limit, 'Limit', 1, 1000);
		const status = parseOptionalEnum(input.status, 'Status', REPORT_STATUSES);
		if (status !== undefined) request.query.status = status;

		const from = parseOptionalRfc3339(input.from, 'From');
		const to = parseOptionalRfc3339(input.to, 'To');
		if (from !== undefined && to !== undefined && Date.parse(from) > Date.parse(to)) {
			throw new PipSyncInputError('From must not be later than To');
		}
		if (from !== undefined) request.query.from = from;
		if (to !== undefined) request.query.to = to;

		if (format === 'csv') {
			request.accept = 'text/csv';
			request.fileName = 'pipsync-trade-report.csv';
			request.mimeType = 'text/csv';
			request.output = 'binary';
		}
		if (format === 'pdf') {
			request.accept = 'application/pdf';
			request.fileName = 'pipsync-trade-report.pdf';
			request.mimeType = 'application/pdf';
			request.output = 'binary';
		}
	}

	return request;
}
