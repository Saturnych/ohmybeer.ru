import axios from 'axios';
import axiosRetry from 'axios-retry';
import fs from 'fs';
import xlsx from 'node-xlsx';

export const axiosRetryConfig = (axiosClient: any = axios, config?: Record<string, any>): void => {
	// Pass the axios instance to the retry function and call it
	if (!config)
		config = {
			retries: 5, // Number of retries (Defaults to 3)
			//retryDelay: (...arg) => axiosRetry.exponentialDelay(...arg, 1000), // Exponential delay with backoff of 1000ms
			retryDelay: (retryCount) => retryCount * 2000, // Increase timeout by 2000ms per retry
			//retryCondition: () => true, // Retry all errors
			retryCondition(error) {
				// Conditional check the error status code
				switch (error.response.status) {
					case 503:
					case 429:
						return true; // Retry request with response status code 503 or 429
					default:
						return false; // Do not retry the others
				}
			},
		};
	axiosRetry(axiosClient, config);
};

export const axiosRequest = async (
	uri: string,
	baseURL: string,
	headers: Record<string, any> = {},
	type: 'get' | 'put' | 'post' | 'patch' | 'delete' = 'get',
	data: Buffer | string | object = null,
	params: Record<string, any> = null,
	retryConfig?: Record<string, any>,
	cb?: Function,
	eb?: Function,
): Promise<Record<string, any>> => {
	try {
		const axiosClient = axios.create({ baseURL, headers });
		axiosRetryConfig(axiosClient, retryConfig);
		if (cb) {
			return axiosClient[type](uri, data, params).then((resp) => cb(resp));
		} else {
			return axiosClient[type](uri, data, params);
		}
	} catch (error) {
		console.error('axiosRequest error:', error);
		// if (axios.isAxiosError(error)) {}
		return eb ? eb(error) : { error };
	}
};

// utils
export const dateToIntlFormat = (
	strDate: string,
	format: Record<string, string> = {
		dateStyle: 'short', // 'full'
		timeStyle: 'short', // 'long'
		timeZone: 'Europe/Moscow',
	},
	locale: string = 'ru-RU',
): string => {
	return new Intl.DateTimeFormat(locale, format).format(new Date(strDate));
};

export const fileExists = (filename: string, mode: number = fs.constants.F_OK): boolean => {
	try {
		fs.accessSync(filename, mode); // fs.constants.R_OK, fs.constants.W_OK
		return true;
	} catch (err) {
		return false;
	}
};

export const readFileSync = (filename: string): string => {
	try {
		return fs.readFileSync(filename, 'utf-8');
	} catch (err) {
		return '';
	}
};

export const saveJsonFile = (data: Record<string, any>, filename: string): boolean => {
	try {
		fs.writeFileSync(filename, Buffer.from(JSON.stringify(data, null, 2)));
		return true;
	} catch (err) {
		return false;
	}
};

export const parseExcelFile = (
	filename: string,
): Record<string, { name: string; data: any[] }>[] => {
	if (!fileExists(filename)) {
		return null;
	}
	return xlsx.parse(filename);
};

export const postForm = async (frm: Record<string, unknown>, uri: string): Record<string, any> => {
	const ret = {
		status: 400,
		error: true,
		message: '',
		data: {},
	};
	try {
		const post = await fetch(uri, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(frm),
		});
		ret.status = post.status;
		ret.error = !post.ok;
		ret.message = post.statusText;
		if (post.status === 200) {
			const { data } = await post.json();
			ret.data = data;
		}
	} catch (err) {
		console.error(err);
		ret.error = true;
		ret.message = err.message || 'Error';
		ret.data = err;
	}
	return ret;
};

export const normalize = (str: string): string => {
	return str
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.trim();
};

export const parseCookieHeader = (header: string): Record<string, string> => {
	const cookies = {};
	if (!!!header) return cookies;
	const arr = header.split(',').map((ck) => {
		const cookie = ck.trim().split(';')[0].split('=');
		cookies[cookie[0]] = cookie[1];
		return {
			[cookie[0]]: cookie[1],
		};
	});
	return cookies;
};

export const delay = (cb, ms: number = 0) => setTimeout(() => cb(), ms);

export const sleep = async (ms: number = 0) => new Promise((resolve) => setTimeout(resolve, ms));

export const timeout = async (ms: number, result?: unknown) =>
	new Promise((resolve) => setTimeout(() => resolve(result), ms));

export const promiseState = async (p: Promise): Promise<string> => {
	const t = {};
	return Promise.race([p, t]).then(
		(v) => (v === t ? 'pending' : 'fulfilled'),
		() => 'rejected',
	);
};

export const isNumeric = (n: string): boolean => !isNaN(parseFloat(n)) && isFinite(Number(n));

export const isDate = (d: unknown): boolean => d instanceof Date && !Number.isNaN(d.getTime());

export const isValidUrl = (str: string, checkHttp: boolean = false): boolean => {
	try {
		const url = new URL(str);
		return checkHttp ? url.protocol.startsWith('http') : true;
	} catch (err) {
		return false;
	}
};

export const validateEmail = (email: string): boolean =>
	!!String(email)
		.toLowerCase()
		.match(
			/^(([^<>()[\]\\.,;:\s@']+(\.[^<>()[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/g,
		);

export const getRandomString = (num: number = 8): string =>
	Math.random()
		.toString(36)
		.slice(-1 * (num > 36 ? 36 : num));

export const hashCode = (text: string): string => {
	let hash = 0,
		chr;
	if (text?.length > 0) {
		for (let i = 0; i < text.length; i++) {
			chr = text.charCodeAt(i);
			hash = (hash << 5) - hash + chr;
			hash |= 0; // Convert to 32bit integer
		}
	}
	return hash;
};

export const hashWithTextEncoder = (text: string, sep: string = ''): string => {
	return [...new TextEncoder().encode(text)].map((b) => b.toString(16).padStart(2, '0')).join(sep);
};

export const stringToBase64 = (str) => {
	// first we use encodeURIComponent to get percent-encoded UTF-8,
	// then we convert the percent encodings into raw bytes which
	// can be fed into btoa.
	return btoa(
		encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function toSolidBytes(match, p1) {
			return String.fromCharCode('0x' + p1);
		}),
	);
};

export const base64ToString = (str) => {
	// Going backwards: from bytestream, to percent-encoding, to original string.
	return decodeURIComponent(
		atob(str)
			.split('')
			.map(function (c) {
				return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
			})
			.join(''),
	);
};

export const base64ToArrayBuffer = (base64: string): ArrayBuffer | Uint8Array => {
	const binaryString = atob(base64);
	const bytes = new Uint8Array(binaryString.length);
	for (var i = 0; i < binaryString.length; i++) {
		bytes[i] = binaryString.charCodeAt(i);
	}
	return bytes.buffer;
};

export const arrayBufferToBase64 = (buffer: ArrayBuffer | Uint8Array) => {
	let binary = '';
	const bytes = new Uint8Array(buffer);
	for (let i = 0; i < bytes.byteLength; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return btoa(binary);
};

export const parseFingerprint2 = (
	comps: unknown[] = [],
): { components: unknown[]; hash: string } => {
	const components: unknown[] = {};
	let sum = 0;
	if (Array.isArray(comps) && comps?.length > 0) {
		comps.forEach((comp) => {
			components[comp.key] = comp.value;
			sum += Number(hashCode(JSON.stringify(comp.value)));
		});
	}
	return { components, hash: String(sum) };
};

export const parseJson = (data: string, obj?: object[] | object | undefined) => {
	try {
		obj = JSON.parse(data);
	} catch (e) {
		//console.error(e);
	}
	return obj;
};

export const encodeHTMLEntities = (str: string): string => {
	return String(str)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
};
