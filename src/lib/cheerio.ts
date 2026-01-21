// cheerio
import * as cheerio from 'cheerio';

export const getLocatorHtml = (source: string, path: string): string => {
	const $ = cheerio.load(source);
	//$('title').text(title);
	//const html = $.html(); // <Fragment set:html={html}>
	return $(path).html();
};

export const getTable = (source: string): string => {
	return getLocatorHtml(source, 'div[id=table-row]');
};
