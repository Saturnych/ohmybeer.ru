import { getTableData } from '$/lib/cheerio';
import { axiosRequest } from '$/lib/utils';

const { PRIVATE_PRICE_URL } = import.meta.env;

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
