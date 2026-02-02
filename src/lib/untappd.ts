import { hashCode, saveJsonFile } from '$/lib/utils';

const {
	DEV,
	PRIVATE_UNTAPPD_API_URL,
	PRIVATE_UNTAPPD_CLIENT_ID,
	PRIVATE_UNTAPPD_CLIENT_SECRET,
	PRIVATE_UNTAPPD_ACCESS_TOKEN,
} = import.meta.env;

// https://api.untappd.com/v4/method_name?client_id=CLIENTID&client_secret=CLIENTSECRET
// https://api.untappd.com/v4/method_name?access_token=ACESSTOKENHERE
// https://api.untappd.com/v4/search/beer?q=Pliny

export const untappdApiCall = async (
	method_name: string,
	qstring?: string,
): Record<string, any> => {
	let data: Record<string, any> = {};
	try {
		if ((PRIVATE_UNTAPPD_API_URL || '').length > 0) {
			const auth: string = !!PRIVATE_UNTAPPD_ACCESS_TOKEN
				? `access_token=${PRIVATE_UNTAPPD_ACCESS_TOKEN}`
				: `client_id=${PRIVATE_UNTAPPD_CLIENT_ID}&client_secret=${PRIVATE_UNTAPPD_CLIENT_SECRET}`;
			const apiURI: string = `${PRIVATE_UNTAPPD_API_URL}/${method_name}?${qstring ? qstring + '&' : ''}${auth}`;
			const response: any = await fetch(apiURI, {
				method: 'GET',
				headers: {
					//'Authorization': `Bearer ${token}`,
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

export const searchBeer = async (brewery: string, beer: string): Promise<Record<string, any>> => {
	const qstring: string = encodeURI(`q=${brewery}${beer}`);
	const result = await untappdApiCall('search/beer', qstring);
	return Object.assign({ beers: {}, now: Date.now() }, result.response);
};

export const searchTap = async (tap: Record<string, any>): Promise<Record<string, any>> => {
	let { beers, found, term, parsed_term } = await searchBeer(
		tap.brewery ? tap.brewery + ' ' : '',
		tap.beer,
	);

	if (!found && tap.brewery?.length > 1 && tap.brewery.startsWith('White Stone')) {
		const searched = await searchBeer('WS Brew ', tap.beer);
		if (!!searched.found) {
			beers = searched.beers;
			found = searched.found;
			term = searched.term;
			parsed_term = searched.parsed_term;
		}
	}
	if (DEV) console.log('found:', found);

	let beer: Record<string, any>, brewery: Record<string, any>;
	if (!!found > 0) {
		beer = beers.items[0].beer;
		beer.checkin_count = beers.items[0].checkin_count;
		beer.id = beer.beer_slug;
		brewery = beers.items[0].brewery;
		brewery.id = brewery.brewery_slug;
		beer.brewery = brewery.id;
		beer.term = term;
		beer.parsed_term = parsed_term;
		beer.hash = hashCode(term);
		if (DEV) {
			saveJsonFile(beer, `./src/data/beers/${beer.id}.json`);
			saveJsonFile(brewery, `./src/data/breweries/${brewery.id}.json`);
		}
	}
	return { beer, brewery };
};

export const searchTaps = async (taps: any[]): Promise<Record<string, any>[]> => {
	const results: any[] = [];
	for (let i: number = 0; i < taps.length; i++) {
		const { beer, brewery } = await searchTap(taps[i]);
		if (!!beer && !!brewery) {
			results.push({ beer, brewery });
			taps[i].brewery_name = brewery.brewery_name.trim();
			taps[i].brewery_slug = brewery.brewery_slug;
			taps[i].brewery_type = brewery.brewery_type.trim();
			taps[i].beer_name = beer.beer_name.trim();
			taps[i].beer_slug = beer.beer_slug;
			taps[i].beer_abv = beer.beer_abv;
			taps[i].beer_ibu = beer.beer_ibu;
			taps[i].beer_style = beer.beer_style.trim();
			taps[i].term = beer.term.trim();
		}
	}
	return { results, taps };
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
