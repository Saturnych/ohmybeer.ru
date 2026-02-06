import * as fs from 'fs';
import * as XLSX from 'xlsx/xlsx.mjs';
import { getTableData } from '$/lib/cheerio';
import { fileExists } from '$/lib/utils';

const { PRIVATE_PRICE_URL } = import.meta.env;

export const readExcelFile = (filename: string): Record<string, any> => {
	if (!fileExists(filename)) {
		return null;
	}
	XLSX.set_fs(fs);
	const workbook = XLSX.readFile(filename);
	return workbook?.Sheets || {};
};

export const parseExcelPrice = (data: Record<string, any>): Record<string, any>[] => {
	const result: Record<string, any>[] = [];
	for (const name in data) {
		const sheet = data[name];
		for (const cell in sheet) {
			const col = cell.substring(0, 1);
			const row = cell.substring(1);
			if (sheet[cell]?.v) {
				result.push({ col, row, name: sheet[cell].v });
			}
		}
	}
	return result;
};

export const getPriceTableData = async (): Record<string, object> => {
	let res: Record<string, object> = {
		taps: [],
		updatedAt: new Date(),
	};
	try {
		if ((PRIVATE_PRICE_URL || '').length > 0) {
			const response: any = await fetch(PRIVATE_PRICE_URL);
			const remote: string = await response.text();
			res = getTableData(remote);
		}
	} catch (err) {
		console.error(err);
	}
	return res;
};

export const saveTaps = async (): Record<string, object> => {
	const { taps, updatedAt } = await getPriceTableData();

	return { taps, updatedAt };
};
