import type { APIRoute } from 'astro';
import { getCollection, getEntry } from 'astro:content';
import { encodeHTMLEntities } from '$/lib/utils';
import pkg from '$/lib/pkg';

const getYMLFeed = async (site: string = pkg.homepage): Promise<string> => {
	const categories: Record<string, string | number>[] = [
		{ id: 101, name: 'Пиво' },
		{ id: 102, name: 'Сидр' },
	];

	const beersCollection = await getCollection('beers');
	const beers: Record<string, any>[] = beersCollection.map((item) => item.data);
	console.log(beers?.length);
	const tapsCollection = await getCollection('taps');
	const taps: Record<string, any>[] = tapsCollection.map((item) => item.data);
	console.log(taps[0]);

	const { updatedAt } = taps[0];

	const findTap = (beer_slug: string) => taps.find((tap) => tap.beer_slug === beer_slug);

	const isCider = (beer_style: string, beer_description: string): boolean => {
		return (
			beer_style.toLowerCase().includes('cider') ||
			beer_description.toLowerCase().includes('cider') ||
			beer_description.toLowerCase().includes('сидр')
		);
	};

	const offers: Record<string, string | number | boolean>[] = [];
	for (const beer of beers) {
		const breweryCollection = await getEntry(beer.brewery.collection, beer.brewery.id);
		const brewery: Record<string, any> = breweryCollection.data;
		const tap = findTap(beer.beer_slug);
		offers.push({
			id: beer.bid,
			available: !!tap,
			categoryId: isCider(beer.beer_style, beer.beer_description)
				? categories[1].id
				: categories[0].id,
			count: 500,
			measure: 'мл',
			price: 1,
			currencyId: 'RUB',
			name: `${!!tap?.brewery && brewery.brewery_name?.length > 20 ? tap.brewery : brewery.brewery_name} - ${beer.beer_name}`,
			vendor: brewery.brewery_name,
			shortDescription: `${beer.beer_style}${beer.beer_abv > 0 ? ', ABV: ' + beer.beer_abv : ''}${beer.beer_ibu > 0 ? ', IBU: ' + beer.beer_ibu : ''}, Чекинов в Untappd: ${beer.checkin_count}`,
			description: beer.beer_description,
			url: `${site}beers/${beer.beer_slug}/`,
			abv: beer.beer_abv,
			ibu: beer.beer_ibu,
			tap: tap ? tap.tap : 1000,
		});
	}
	offers.sort((a, b) => a.tap - b.tap);

	return `<?xml version="1.0" encoding="UTF-8"?>
	<yml_catalog date="${updatedAt}">
  <shop>
    <categories>
      ${categories.map((category) => `<category id="${category.id}">${category.name}</category>`).join('\n')}
    </categories>
    <offers>
      ${offers
				.map(
					(offer) => `<offer id="${offer.id}"${offer.available ? '' : ' available="unknown"'}>
				<categoryId>${offer.categoryId}</categoryId>
				<count>${offer.count}</count>
        <measure>${offer.measure}</measure>
        <price>${offer.price}</price>
        <currencyId>${offer.currencyId}</currencyId>
        <name>${encodeHTMLEntities(offer.name)}</name>
        <vendor>${encodeHTMLEntities(offer.vendor)}</vendor>
        <shortDescription>${encodeHTMLEntities(offer.shortDescription)}</shortDescription>
        <description>${encodeHTMLEntities(offer.description)}</description>
        <url>${offer.url}</url>
        ${offer.abv > 0 ? `<param name="ABV">${offer.abv}</param>` : ''}
        ${offer.ibu > 0 ? `<param name="IBU">${offer.ibu}</param>` : ''}
        <param name="Объём" unit="мл">500</param>
        <pickup>${String(offer.available)}</pickup>
        <age unit="year">18</age>
      </offer>`,
				)
				.join('\n')}
    </offers>
  </shop>
  </yml_catalog>`;
};
//

export const GET: APIRoute = async ({ site }: { site?: string }) => {
	const xml = await getYMLFeed(site);
	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml',
		},
	});
};
