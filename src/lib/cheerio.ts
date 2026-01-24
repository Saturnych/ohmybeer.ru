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

export const getTableData = (source: string): string => {
	const $ = cheerio.load(source);
	const [updateDate]: [string] = $('p[id=update-date]').html().split(': ').reverse();
	const updated: string[] = updateDate
		.split(' ')
		.map((m) => m.trim())
		.filter((f) => !!f);
	const updatedAt: string = `${updated[0]
		.split('.')
		.map((m) => m.trim())
		.reverse()
		.join('-')}T${updated[1]}`;
	const taps: object[] = [];
	const table = $('div[id=table-row]').find('.table').find('tbody').children('tr');
	table.each((index, el) => {
		const tap: number = Number($(el).find('.tap-num').text());
		const name: string = $(el).find('.tap-name').text();
		const parsed: string[] = name
			.split('-')
			.map((m) => m.trim())
			.filter((f) => !!f);
		const [brewery, data]: [string, string[]] =
			parsed?.length > 1
				? [
						parsed[0],
						parsed[1]
							.split(',')
							.map((m) => m.trim())
							.filter((f) => !!f),
					]
				: [
						undefined,
						parsed[0]
							.split(',')
							.map((m) => m.trim())
							.filter((f) => !!f),
					];
		const [beer, style]: string[] = data[0]
			.split('(')
			.map((m) => m.replaceAll(')', '').trim())
			.filter((f) => !!f);
		const format: string = data[1];
		const country: string = data[2];
		taps.push({
			index,
			tap,
			brewery,
			beer,
			style,
			format,
			country,
			updatedAt: new Date(updatedAt),
		});
	});
	return { taps, updatedAt };
};
