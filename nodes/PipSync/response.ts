import type { IDataObject } from 'n8n-workflow';

export function asJsonObject(value: unknown): IDataObject {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) {
		throw new TypeError('PipSync returned an unexpected response shape');
	}
	return value as IDataObject;
}

export function asBuffer(value: unknown): Buffer {
	if (Buffer.isBuffer(value)) return value;
	if (value instanceof ArrayBuffer) return Buffer.from(value);
	if (ArrayBuffer.isView(value)) {
		return Buffer.from(value.buffer, value.byteOffset, value.byteLength);
	}
	if (typeof value === 'string') return Buffer.from(value, 'utf8');
	throw new TypeError('PipSync returned an unexpected file response');
}
