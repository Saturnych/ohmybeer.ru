import { getTable } from '$/lib/cheerio';

const { DEV, PRIVATE_PRICE_URL } = import.meta.env;
if (DEV) console.log(`\nPRIVATE_PRICE_URL.length:`, PRIVATE_PRICE_URL?.length);

export const getPriceTable = async (): string => {
	let res: string;
	if ((PRIVATE_PRICE_URL || '').length > 0) {
		const fetched: any = await fetch(PRIVATE_PRICE_URL);
		const remote: string = await fetched.text();
		res = getTable(remote);
	}
	return res;
};
