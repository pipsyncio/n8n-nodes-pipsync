import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	Icon,
	INodeProperties,
} from 'n8n-workflow';

export class PipSyncApi implements ICredentialType {
	name = 'pipSyncApi';

	displayName = 'PipSync API';

	icon: Icon = {
		light: 'file:../nodes/PipSync/pipsync.svg',
		dark: 'file:../nodes/PipSync/pipsync.dark.svg',
	};

	documentationUrl = 'https://github.com/pipsyncio/n8n-nodes-pipsync#credentials';

	restrictToSupportedNodes = true as const;

	supportedNodes = ['pipSync'];

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description: 'The API key from your PipSync account',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			allowedDomains: 'app.pipsync.io',
			baseURL: 'https://app.pipsync.io/api/v1',
			disableFollowRedirect: true,
			headers: {
				Accept: 'application/json',
			},
			method: 'GET',
			sendCredentialsOnCrossOriginRedirect: false,
			url: '/me',
		},
	};
}
