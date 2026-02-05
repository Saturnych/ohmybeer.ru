import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { encodeHTMLEntities } from '$/lib/utils';
import pkg from '$/lib/pkg';

const getYMLFeed = async (site: string = pkg.homepage): Promise<string> => {
	const categories = [
		{ id: 101, name: 'Пиво', find: [] },
		{ id: 102, name: 'Сидр', find: ['сидр', 'cider'] },
	];

	const beersCollection = await getCollection('beers');
	const beers: Record<string, any>[] = beersCollection.map((item) => item.data);
	console.log(beers?.length);
	const tapsCollection = await getCollection('taps');
	const taps: Record<string, any>[] = tapsCollection.map((item) => item.data);
	console.log(taps?.length);

	const { updatedAt } = taps[0];

	// <vendorCode>VNDR-0005A, VNDR-0005B</vendorCode>
	const offers: Record<string, any>[] = [
		{
			id: 3318394,
			available: !!taps.find((tap) => tap.beer_slug === 'white-stone-shvatka'),
			categoryId: 101,
			count: 500,
			measure: 'mlit',
			price: 1,
			currencyId: 'RUB',
			name: 'White Stone - Схватка',
			vendor: 'White Stone',
			shortDescription: 'Pale Ale - American, ABV: 5.4, IBU: 50, Чекинов в UNTAPPD: 836',
			description:
				'Этот Pale Ale для кого-то резкий и колючий, как третья линия, для кого-то слишком мощный и далёкий, как великаны второй, а для кого-то - уютный и добродушный, как могучие игроки первой. Пиво сварено в честь Регбийного Клуба "Спартак Москва", и если ты держишь эту банку в руках, то ты либо лучший из лучших, либо сказочный везунчик!',
			url: `${site}beers/white-stone-shvatka/`,
			abv: '5.4',
			ibu: '50',
		},
		{
			id: 3069407,
			available: !!taps.find((tap) => tap.beer_slug === 'midnight-project-zhigulikkeller'),
			categoryId: 101,
			count: 500,
			measure: 'mlit',
			price: 1,
			currencyId: 'RUB',
			name: 'Midnight Project - Zhigulikkeller',
			vendor: 'Midnight Project',
			shortDescription:
				'Lager - IPL (India Pale Lager), ABV: 4.5, IBU: 37, Чекинов в UNTAPPD: 6642',
			description:
				'Collaboration w/ Mikkeller and Selfmade brewery. According to GOST but GOES beyond. DDH Citra & Simcoe hops',
			url: `${site}beers/midnight-project-zhigulikkeller/`,
			abv: '4.5',
			ibu: '37',
		},
		{
			id: 1963594,
			available: !!taps.find((tap) => tap.beer_slug === 'zapovednik-abanamat'),
			categoryId: categories.find((category) => category.name === 'Сидр')?.id || categories[0].id,
			count: 500,
			measure: 'mlit',
			price: 1,
			currencyId: 'RUB',
			name: 'Заповедник - АБАНАМАТ',
			vendor: 'Заповедник',
			shortDescription: 'Cider - Dry, ABV: 5, Чекинов в UNTAPPD: 7647',
			description:
				'Сухой сидр, яблоки для которого собраны непосредственно на территории и в окрестностях Мемориального музея-заповедника А. С. Пушкина «Михайловское». Часть яблок собрана в саду дома, в котором жил Валерий Карпов, он же Марков из "Заповедника" Сергея Довлатова. Для АБАНАМАТА мы давили сок из Антоновки, Мельбы, Китайки и Лешуги (так в наших местах называют дикую яблоню).',
			url: `${site}beers/zapovednik-abanamat/`,
			abv: '5',
		},
	];

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
        ${offer.abv ? `<param name="ABV">${offer.abv}</param>` : ''}
        ${offer.ibu ? `<param name="IBU">${offer.ibu}</param>` : ''}
        <age unit="year">18</age>
        <pickup>true</pickup>
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
