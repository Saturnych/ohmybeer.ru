// untappd
const { DEV, PRIVATE_UNTAPPD_API_URL, PRIVATE_UNTAPPD_CLIENT_ID, PRIVATE_UNTAPPD_CLIENT_SECRET } =
	import.meta.env;

// https://api.untappd.com/v4/method_name?client_id=CLIENTID&client_secret=CLIENTSECRET
// https://api.untappd.com/v4/search/beer?q=Pliny

export const untappdApiCall = async (
	method_name: string,
	qstring?: string
): Record<string, any> => {
	let data: Record<string, any> = {};
	try {
		if ((PRIVATE_UNTAPPD_API_URL || '').length > 0) {
			const apiURI: string = `${PRIVATE_UNTAPPD_API_URL}/${method_name}?${qstring ? qstring + '&' : ''}client_id=${PRIVATE_UNTAPPD_CLIENT_ID}&client_secret=${PRIVATE_UNTAPPD_CLIENT_SECRET}`;
			const response: any = await fetch(apiURI, {
				method: 'GET',
				headers: {
					//'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json'
				}
			});
			data = await response.json();
		}
	} catch (err) {
		console.error('untappdApiCall error:', err);
	}
	return data;
};

export const searchBeer = async (brewery: string, name: string): Promise<Record<string, any>> => {
	const qstring: string = encodeURI(`q=${brewery} ${name}`);
	const result = await untappdApiCall('search/beer', qstring);
	console.log('searchBeer result:', result);
	return Object.assign({ beers: {}, now: Date.now() }, result.response);
};

export const searchTaps = async (taps: any[]): Promise<Record<string, any>> => {
	const { brewery, name } = taps[1].data;
	console.log('brewery:', brewery);
	console.log('name:', name);
	return await searchBeer(brewery, name);
};

/*
method: 'GET',
    headers: {
        'Authorization': `Basic ${credentials}` // The Authorization header
    }
*/

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
