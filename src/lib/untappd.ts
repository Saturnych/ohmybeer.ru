import {
	axiosRequest,
	fileExists,
	hashWithTextEncoder,
	parseJson,
	readFileSync,
	saveJsonFile,
} from '$/lib/utils';

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
	skipToken?: boolean,
): Record<string, any> => {
	let data: Record<string, any> = {};
	try {
		if ((PRIVATE_UNTAPPD_API_URL || '').length > 0) {
			const auth: string =
				!!PRIVATE_UNTAPPD_ACCESS_TOKEN && !skipToken
					? `access_token=${PRIVATE_UNTAPPD_ACCESS_TOKEN}`
					: `client_id=${PRIVATE_UNTAPPD_CLIENT_ID}&client_secret=${PRIVATE_UNTAPPD_CLIENT_SECRET}`;
			const apiURI: string = `${PRIVATE_UNTAPPD_API_URL}/${method_name}?${qstring ? qstring + '&' : ''}${auth}`;
			const response: any = await fetch(apiURI, {
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

export const searchBeer = async (searchstring: string): Promise<Record<string, any>> => {
	const qstring: string = encodeURI(`q=${searchstring}`);
	let result = await untappdApiCall('search/beer', qstring);
	if (result.meta.code !== 200) result = await untappdApiCall('search/beer', qstring, true);
	return Object.assign({ beers: {}, now: Date.now(), meta: result.meta }, result.response);
};

export const searchTap = async (tap: Record<string, any>): Promise<Record<string, any>> => {
	let beer: Record<string, any>, brewery: Record<string, any>;
	let searchstring: string = `${tap.brewery ? tap.brewery + ' ' : ''}${tap.beer}`;
	let searchstringHash: string = hashWithTextEncoder(searchstring);

	const beerContent = readFileSync(`./src/data/beers_hash/${searchstringHash}.json`);
	beer = !!beerContent ? parseJson(beerContent) : null;
	//console.log('beer:', beer?.id);
	if (beer?.brewery) {
		const breweryContent = readFileSync(`./src/data/breweries/${beer.brewery}.json`);
		brewery = !!breweryContent ? parseJson(breweryContent) : null;
	}

	if (!beer || !brewery) {
		let { beers, term, parsed_term, found } = await searchBeer(searchstring);

		if (!found) {
			const searched = await searchBeer(tap.beer);
			//console.log('searched:', searched);
			if (!!searched.found) {
				beers = searched.beers;
				found = searched.found;
				term = searched.term;
				parsed_term = searched.parsed_term;
			}
		}
		console.log('found:', found);

		if (found && found > 0) {
			beer = beers.items[0].beer;
			beer.checkin_count = beers.items[0].checkin_count;
			beer.id = beer.beer_slug;
			brewery = beers.items[0].brewery;
			brewery.id = brewery.brewery_slug;
			beer.brewery = brewery.id;
			beer.term = term;
			beer.parsed_term = parsed_term;
			beer.hash = searchstringHash;
			const beerHashFile = `./src/data/beers_hash/${searchstringHash}.json`;
			if (!fileExists(beerHashFile)) saveJsonFile(beer, beerHashFile);
			const beerFile = `./src/data/beers/${beer.id}.json`;
			if (!fileExists(beerFile)) saveJsonFile(beer, beerFile);
			const breweryFile = `./src/data/breweries/${brewery.id}.json`;
			if (!fileExists(breweryFile)) saveJsonFile(brewery, breweryFile);
		}
	}

	return { beer, brewery };
};

export const searchTaps = async (taps: any[]): Promise<Record<string, any[]>> => {
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
			taps[i].hash = beer.hash;
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
