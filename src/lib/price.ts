import { getTable } from '$/lib/cheerio';

const { DEV, PRIVATE_PRICE_URL } = import.meta.env;

export const getPriceTable = async (): string => {
	let res: string;
	if ((PRIVATE_PRICE_URL || '').length > 0) {
		const response: any = await fetch(PRIVATE_PRICE_URL);
		const remote: string = await response.text();
		res = getTable(remote);
	}
	return res;
};
