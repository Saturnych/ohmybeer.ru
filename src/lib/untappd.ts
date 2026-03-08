const {
	PUBLIC_UNTAPPD_REDIRECT_URL = 'http://localhost:3300',
	PUBLIC_UNTAPPD_API_URL = 'https://api.untappd.com/v4',
	PUBLIC_UNTAPPD_OAUTH_URL = 'https://untappd.com/oauth/authenticate',
	PRIVATE_UNTAPPD_AUTH_URL = 'https://untappd.com/oauth/authorize',
	PUBLIC_UNTAPPD_CLIENT_ID,
	PRIVATE_UNTAPPD_CLIENT_ID,
	PRIVATE_UNTAPPD_CLIENT_SECRET,
	PRIVATE_UNTAPPD_ACCESS_TOKEN,
} = import.meta.env;

// https://api.untappd.com/v4/method_name?client_id=CLIENTID&client_secret=CLIENTSECRET
// https://api.untappd.com/v4/method_name?access_token=ACESSTOKENHERE
// https://api.untappd.com/v4/search/beer?q=Pliny
// https://untappd.com/oauth/authenticate/?client_id=CLIENTID&response_type=code&redirect_url=http://localhost:3300
// https://untappd.com/oauth/authorize/?client_id=CLIENTID&client_secret=CLIENTSECRET&response_type=code&redirect_url=http://localhost:3300&code=CODE

export const untappdOauthUri = (): string => {
	return `${PUBLIC_UNTAPPD_OAUTH_URL}/?client_id=${PUBLIC_UNTAPPD_CLIENT_ID}&response_type=code&redirect_url=${PUBLIC_UNTAPPD_REDIRECT_URL}`;
};

export const untappdAuthGetToken = async (code: string): Promise<string> => {
	let access_token: string;
	try {
		if ((PRIVATE_UNTAPPD_AUTH_URL || '').length > 0) {
			const authURI: string = `${PRIVATE_UNTAPPD_AUTH_URL}/?client_id=${PRIVATE_UNTAPPD_CLIENT_ID}&client_secret=${PRIVATE_UNTAPPD_CLIENT_SECRET}&response_type=code&redirect_url=${PUBLIC_UNTAPPD_REDIRECT_URL}&code=${code}`;
			const response: Response = await fetch(authURI, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			});
			const data = await response.json();
			access_token =
				data?.meta?.http_code === 200 && !!data.response?.access_token
					? data.response?.access_token
					: '';
		}
	} catch (err) {
		console.error('untappdAuthGetToken error:', err);
	}
	return access_token;
};

export const untappdApiCall = async (
	method_name: string,
	qstring?: string,
	skipToken?: boolean,
): Promise<Record<string, string | number | undefined>> => {
	let data: Record<string, string | number | undefined> = {};
	try {
		if ((PUBLIC_UNTAPPD_API_URL || '').length > 0) {
			const auth: string =
				!!PRIVATE_UNTAPPD_ACCESS_TOKEN && !skipToken
					? `access_token=${PRIVATE_UNTAPPD_ACCESS_TOKEN}`
					: `client_id=${PRIVATE_UNTAPPD_CLIENT_ID}&client_secret=${PRIVATE_UNTAPPD_CLIENT_SECRET}`;
			const apiURI: string = `${PUBLIC_UNTAPPD_API_URL}/${method_name}?${qstring ? qstring + '&' : ''}${auth}`;
			const response: Response = await fetch(apiURI, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			});
			data = await response.json();
		}
	} catch (err) {
		console.error('untappdApiCall error:', err);
	}
	return data;
};

/*
untappdAuthGetToken data: {
  meta: { http_code: 200 },
  response: { access_token: '111111111111' }
}

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
