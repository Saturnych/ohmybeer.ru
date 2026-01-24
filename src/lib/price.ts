import { getTableData } from '$/lib/cheerio';

const { PRIVATE_PRICE_URL } = import.meta.env;

export const getPriceTableData = async (): Record<string, object> => {
	let res: Record<string, object>;
	if ((PRIVATE_PRICE_URL || '').length > 0) {
		const response: any = await fetch(PRIVATE_PRICE_URL);
		const remote: string = await response.text();
		res = getTableData(remote);
	}
	return res;
};

export const saveTaps = async (): Record<string, object> => {
	const { taps, updatedAt } = await getPriceTableData();

	return { taps, updatedAt };
};
