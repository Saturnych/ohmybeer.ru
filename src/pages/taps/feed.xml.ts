import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { encodeHTMLEntities } from '$/lib/utils';
import pkg from '$/lib/pkg';

const getYMLFeed = async (site: string = pkg.homepage): Promise<string> => {
	const offers: Record<string, any>[] = [];
	const beersCollection = await getCollection('beers');
	const beers: Record<string, any>[] = beersCollection.map((item) => item.data);
	console.log(beers?.length);
	const tapsCollection = await getCollection('taps');
	const taps: Record<string, any>[] = tapsCollection.map((item) => item.data);
	console.log(taps?.length);

	const found = taps.find((tap) => tap.beer_slug === 'midnight-project-zhigulikkeller');
	console.log(found);

	return `<yml_catalog>
  <shop>
    <categories>
      <category id="101">Пиво</category>
      <category id="102">Сидр</category>
    </categories>
    <offers>
      <offer id="3318394">
        <name>White Stone - Схватка</name>
        <vendor>White Stone</vendor>
        <categoryId>101</categoryId>
        <description>Этот Pale Ale для кого-то резкий и колючий, как третья линия, для кого-то слишком мощный и далёкий, как великаны второй, а для кого-то - уютный и добродушный, как могучие игроки первой. Пиво сварено в честь Регбийного Клуба "Спартак Москва", и если ты держишь эту банку в руках, то ты либо лучший из лучших, либо сказочный везунчик!</description>
        <shortDescription>Pale Ale - American, ABV: 5.4, IBU: 50, Чекинов в UNTAPPD: 836</shortDescription>
        <url>${site}/beers/white-stone-shvatka/</url>
      </offer>
      <offer id="3069407"${found ? '' : ' available="unknown"'}>
        <name>Midnight Project - Zhigulikkeller</name>
        <vendor>Midnight Project</vendor>
        <categoryId>101</categoryId>
        <description>${encodeHTMLEntities('Collaboration w/ Mikkeller and Selfmade brewery. According to GOST but GOES beyond. DDH Citra & Simcoe hops')}</description>
        <shortDescription>Lager - IPL (India Pale Lager), ABV: 4.5, IBU: 37, Чекинов в UNTAPPD: 6642</shortDescription>
        <url>${site}/beers/midnight-project-zhigulikkeller/</url>
      </offer>
      <offer id="1963594">
        <name>Заповедник - АБАНАМАТ</name>
        <vendor>Заповедник</vendor>
        <categoryId>102</categoryId>
        <description>Сухой сидр, яблоки для которого собраны непосредственно на территории и в окрестностях Мемориального музея-заповедника А. С. Пушкина «Михайловское». Часть яблок собрана в саду дома, в котором жил Валерий Карпов, он же Марков из "Заповедника" Сергея Довлатова. Для АБАНАМАТА мы давили сок из Антоновки, Мельбы, Китайки и Лешуги (так в наших местах называют дикую яблоню).</description>
        <shortDescription>Cider - Dry, ABV: 5, Чекинов в UNTAPPD: 7647</shortDescription>
        <url>${site}/beers/zapovednik-abanamat/</url>
      </offer>
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
