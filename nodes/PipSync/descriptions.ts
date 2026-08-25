import type { INodeProperties } from 'n8n-workflow';

export const pipSyncProperties: INodeProperties[] = [
	{
		displayName: 'Resource',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: 'Profile',
				value: 'profile',
				description: 'The authenticated user profile and subscription tier',
			},
			{
				name: 'Report',
				value: 'report',
				description: 'The available report export catalog',
			},
			{
				name: 'Report Schedule',
				value: 'reportSchedule',
				description: 'Scheduled report deliveries',
			},
			{
				name: 'Signal',
				value: 'signal',
				description: 'Recent trading signals',
			},
			{
				name: 'Trade',
				value: 'trade',
				description: 'Recent trades',
			},
			{
				name: 'Trade Report',
				value: 'tradeReport',
				description: 'A filtered trade performance report',
			},
			{
				name: 'Usage',
				value: 'usage',
				description: 'Current tier, usage counters, and limits',
			},
		],
		default: 'signal',
	},
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['profile', 'tradeReport', 'usage'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get read only data',
				description: 'Retrieve data without changing PipSync state',
			},
		],
		default: 'get',
	},
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['report', 'reportSchedule', 'signal', 'trade'],
			},
		},
		options: [
			{
				name: 'Get Many',
				value: 'getMany',
				action: 'Get many read only records',
				description: 'Retrieve records without changing PipSync state',
			},
		],
		default: 'getMany',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		displayOptions: {
			show: {
				resource: ['signal', 'trade'],
			},
		},
		default: 50,
		description: 'Max number of results to return',
	},
	{
		displayName: 'Since',
		name: 'since',
		type: 'dateTime',
		displayOptions: {
			show: {
				resource: ['signal'],
			},
		},
		default: '',
		description: 'Return signals received at or after this RFC 3339 date-time',
	},
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['trade'],
			},
		},
		options: [
			{ name: 'Any', value: '' },
			{ name: 'Cancelled', value: 'cancelled' },
			{ name: 'Closed', value: 'closed' },
			{ name: 'Open', value: 'open' },
		],
		default: '',
		description: 'Filter trades by status',
	},
	{
		displayName: 'Format',
		name: 'format',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['tradeReport'],
			},
		},
		options: [
			{
				name: 'JSON',
				value: 'json',
				description: 'Return an inspectable JSON report',
			},
			{
				name: 'CSV',
				value: 'csv',
				description: 'Return a CSV file in the data binary property',
			},
			{
				name: 'PDF',
				value: 'pdf',
				description: 'Return a PDF file in the data binary property',
			},
		],
		default: 'json',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: {
			minValue: 1,
			maxValue: 1000,
		},
		displayOptions: {
			show: {
				resource: ['tradeReport'],
			},
		},
		default: 50,
		description: 'Max number of results to return',
	},
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['tradeReport'],
			},
		},
		options: [
			{ name: 'All', value: 'all' },
			{ name: 'Closed', value: 'closed' },
			{ name: 'Open', value: 'open' },
			{ name: 'Partial', value: 'partial' },
			{ name: 'Rejected', value: 'rejected' },
		],
		default: 'all',
		description: 'Filter report rows by trade status',
	},
	{
		displayName: 'From',
		name: 'from',
		type: 'dateTime',
		displayOptions: {
			show: {
				resource: ['tradeReport'],
			},
		},
		default: '',
		description: 'Include trades at or after this RFC 3339 date-time',
	},
	{
		displayName: 'To',
		name: 'to',
		type: 'dateTime',
		displayOptions: {
			show: {
				resource: ['tradeReport'],
			},
		},
		default: '',
		description: 'Include trades at or before this RFC 3339 date-time',
	},
];
