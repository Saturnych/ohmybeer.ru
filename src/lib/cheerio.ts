import * as cheerio from 'cheerio';

export const getTable = (source: string): string => {
	const $ = cheerio.load(source);
	//$('title').text(title);
	//const html = $.html(); // <Fragment set:html={html}>
	return $('div[id=table-row]').html();
};
