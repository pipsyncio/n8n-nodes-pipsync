export const PIPSYNC_API_BASE_URL = 'https://app.pipsync.io/api/v1';
export const PIPSYNC_API_HOST = 'app.pipsync.io';

export const PIPSYNC_RESOURCES = {
	profile: {
		method: 'GET',
		operation: 'get',
		path: '/me',
	},
	usage: {
		method: 'GET',
		operation: 'get',
		path: '/account/usage',
	},
	signal: {
		method: 'GET',
		operation: 'getMany',
		path: '/signals',
	},
	trade: {
		method: 'GET',
		operation: 'getMany',
		path: '/trades',
	},
	report: {
		method: 'GET',
		operation: 'getMany',
		path: '/reports',
	},
	reportSchedule: {
		method: 'GET',
		operation: 'getMany',
		path: '/reports/schedules',
	},
	tradeReport: {
		method: 'GET',
		operation: 'get',
		path: '/reports/trades',
	},
} as const;

export type PipSyncResource = keyof typeof PIPSYNC_RESOURCES;

export function isPipSyncResource(value: string): value is PipSyncResource {
	return Object.prototype.hasOwnProperty.call(PIPSYNC_RESOURCES, value);
}
