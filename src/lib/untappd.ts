// untappd
const { DEV, PRIVATE_UNTAPPD_API_URL, PRIVATE_UNTAPPD_CLIENT_ID, PRIVATE_UNTAPPD_CLIENT_SECRET } =
	import.meta.env;
if (DEV) console.log(`\nPRIVATE_UNTAPPD_CLIENT_ID.length:`, PRIVATE_UNTAPPD_CLIENT_ID?.length);

// # https://api.untappd.com/v4/method_name?client_id=CLIENTID&client_secret=CLIENTSECRET
export const untappdApiCall = async (method_name: string): string => {
	let res: string;
	if ((PRIVATE_UNTAPPD_API_URL || '').length > 0) {
		const apiURI: string = `${PRIVATE_UNTAPPD_API_URL}/${method_name}?client_id=${PRIVATE_UNTAPPD_CLIENT_ID}&client_secret=${PRIVATE_UNTAPPD_CLIENT_SECRET}`;
		const fetched: any = await fetch(apiURI);
	}
	return res;
};
