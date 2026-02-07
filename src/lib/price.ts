import xlsx from 'node-xlsx';
import { getTableData } from '$/lib/cheerio';
import { axiosRequest, fileExists } from '$/lib/utils';

const { PRIVATE_PRICE_URL } = import.meta.env;

export const parseExcelFile = (
	filename: string,
): Record<string, { name: string; data: any[] }>[] => {
	if (!fileExists(filename)) {
		return null;
	}
	return xlsx.parse(filename);
};

export const getPriceTableData = async (): Record<string, object> => {
	let res: Record<string, object> = {
		taps: [],
		updatedAt: new Date(),
	};
	try {
		if ((PRIVATE_PRICE_URL || '').length > 0) {
			const url: URL = new URL(PRIVATE_PRICE_URL);
			const response: any = await axiosRequest(url.pathname, url.origin);
			const remote: string = response?.data || '';
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
