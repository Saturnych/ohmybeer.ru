import { expect, test, type Page } from '@playwright/test';
import { config } from 'dotenv';
import { isValidUrl, sleep } from '../../src/lib/utils';
import pkg from '../../package.json' with { type: 'json' };

const DEBUG = process.env.NODE_ENV !== 'production';
const TIMEOUT = 3000;

if (DEBUG) config({ quiet: true });
const { PRIVATE_PRICE_URL } = process.env;
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

test.describe.configure({ mode: 'serial' });

let page: Page;

test.beforeAll(async ({ browser }) => {
	console.log('PRIVATE_PRICE_URL:', PRIVATE_PRICE_URL);
	page = await browser.newPage();
});

test.afterAll(async () => {
	if (page) await page.close();
	console.log('Done with e2e tests');
});

test('price page check', async () => {
	test.slow();
	if (!PRIVATE_PRICE_URL) return;
	await sleep(TIMEOUT);
	await page.goto(PRIVATE_PRICE_URL, { waitUntil: 'domcontentloaded' });
	const title = await page.title();
	console.log('price page title:', title);
	//await expect(title).toBe(pkg.title);
	const content = await page.content();
	console.log('price page content:', content);
	const priceTable = await page.getByRole('div', { id: 'table-row' });
	await expect(priceTable).toBeVisible();
});
