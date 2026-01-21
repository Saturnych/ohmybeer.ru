// untappd
const { DEV, PRIVATE_UNTAPPD_API_URL, PRIVATE_UNTAPPD_CLIENT_ID, PRIVATE_UNTAPPD_CLIENT_SECRET } =
	import.meta.env;
if (DEV) console.log(`\nPRIVATE_UNTAPPD_CLIENT_ID.length:`, PRIVATE_UNTAPPD_CLIENT_ID?.length);

// # https://api.untappd.com/v4/method_name?client_id=CLIENTID&client_secret=CLIENTSECRET
export const untappdApiCall = async (method_name: string): Record<string, any> => {
	let data: Record<string, any> = {};
	try {
		if ((PRIVATE_UNTAPPD_API_URL || '').length > 0) {
			const apiURI: string = `${PRIVATE_UNTAPPD_API_URL}/${method_name}?client_id=${PRIVATE_UNTAPPD_CLIENT_ID}&client_secret=${PRIVATE_UNTAPPD_CLIENT_SECRET}`;
			const response: any = await fetch(apiURI);
			data = await response.json();
		}
	} catch (err) {
		console.error('untappdApiCall error:', err);
	}
	return Object.assign(data, { now: Date.now() });
};

/*
{
  "meta": {
    "code": 200,
    "response_time": {
      "time": 0,
      "measure": "seconds"
    }
  },
  "notifications": {},
  "response": {}
}

{
  "meta": {
    "code": 500,
    "error_detail": "The user has not authorized this application or the token is invalid.",
    "error_type": "invalid_auth",
    "developer_friendly": "The user has not authorized this application or the token is invalid.",
    "response_time": {
      "time": 0,
      "measure": "seconds"
    }
  }
}
*/
