import { untappdApiCall } from '$/lib/untappd';
import {
	fileExists,
	hashWithTextEncoder,
	parseJson,
	readFileSync,
	saveJsonFile,
} from '$/lib/utils';

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
