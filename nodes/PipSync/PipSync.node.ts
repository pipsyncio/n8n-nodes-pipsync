import type {
	IExecuteFunctions,
	IHttpRequestOptions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import { PIPSYNC_API_HOST } from './contracts';
import { pipSyncProperties } from './descriptions';
import { buildPipSyncRequest, PipSyncInputError, type PipSyncRequestInput } from './request';
import { asBuffer, asJsonObject } from './response';

function requestInputFor(
	execution: IExecuteFunctions,
	resource: string,
	itemIndex: number,
): PipSyncRequestInput {
	if (resource === 'signal') {
		return {
			limit: execution.getNodeParameter('limit', itemIndex),
			since: execution.getNodeParameter('since', itemIndex, ''),
		};
	}

	if (resource === 'trade') {
		return {
			limit: execution.getNodeParameter('limit', itemIndex),
			status: execution.getNodeParameter('status', itemIndex, ''),
		};
	}

	if (resource === 'tradeReport') {
		return {
			format: execution.getNodeParameter('format', itemIndex),
			from: execution.getNodeParameter('from', itemIndex, ''),
			limit: execution.getNodeParameter('limit', itemIndex),
			status: execution.getNodeParameter('status', itemIndex),
			to: execution.getNodeParameter('to', itemIndex, ''),
		};
	}

	return {};
}

function nestedStatusCode(value: unknown): number | undefined {
	let current = value;
	for (let depth = 0; depth < 4; depth++) {
		if (typeof current !== 'object' || current === null) return undefined;
		const record = current as Record<string, unknown>;
		for (const key of ['statusCode', 'status']) {
			if (typeof record[key] === 'number') return record[key];
		}
		if (record.response === current) return undefined;
		current = record.response;
	}
	return undefined;
}

export function safePipSyncErrorMessage(error: unknown): string {
	if (error instanceof PipSyncInputError) return error.message;
	const statusCode = nestedStatusCode(error);
	if (statusCode === 400) return 'PipSync rejected one or more query parameters';
	if (statusCode === 401) return 'PipSync authentication failed; check or rotate the API key';
	if (statusCode === 403) return 'This PipSync API key cannot access the requested resource';
	if (statusCode === 429) return 'PipSync rate limit reached; retry the workflow later';
	if (statusCode !== undefined && statusCode >= 500) {
		return 'PipSync is temporarily unavailable; retry the workflow later';
	}
	return 'PipSync request failed; verify the node parameters and credential';
}

export class PipSync implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'PipSync',
		name: 'pipSync',
		icon: { light: 'file:pipsync.svg', dark: 'file:pipsync.dark.svg' },
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Read profiles, usage, signals, trades, and reports from PipSync',
		defaults: {
			name: 'PipSync',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'pipSyncApi',
				required: true,
			},
		],
		properties: pipSyncProperties,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const inputItems = this.getInputData();
		const outputItems: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < inputItems.length; itemIndex++) {
			try {
				const resource = this.getNodeParameter('resource', itemIndex) as string;
				const operation = this.getNodeParameter('operation', itemIndex) as string;
				const request = buildPipSyncRequest(
					resource,
					operation,
					requestInputFor(this, resource, itemIndex),
				);

				const options: IHttpRequestOptions = {
					allowedDomains: PIPSYNC_API_HOST,
					baseURL: request.baseURL,
					disableFollowRedirect: true,
					encoding: request.output === 'binary' ? 'arraybuffer' : 'json',
					headers: {
						Accept: request.accept,
					},
					json: request.output === 'json',
					method: request.method,
					qs: request.query,
					sendCredentialsOnCrossOriginRedirect: false,
					timeout: 30_000,
					url: request.path,
				};

				const response: unknown = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'pipSyncApi',
					options,
				);

				if (request.output === 'binary') {
					const binaryData = await this.helpers.prepareBinaryData(
						asBuffer(response),
						request.fileName,
						request.mimeType,
					);
					outputItems.push({
						binary: { data: binaryData },
						json: {
							fileName: request.fileName,
							format: request.query.format,
							mimeType: request.mimeType,
						},
						pairedItem: { item: itemIndex },
					});
				} else {
					outputItems.push({
						json: asJsonObject(response),
						pairedItem: { item: itemIndex },
					});
				}
			} catch (error) {
				const message = safePipSyncErrorMessage(error);
				if (this.continueOnFail()) {
					outputItems.push({
						json: { error: message },
						pairedItem: { item: itemIndex },
					});
					continue;
				}
				throw new NodeOperationError(this.getNode(), message, { itemIndex });
			}
		}

		return [outputItems];
	}
}
