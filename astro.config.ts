import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import pkg from './src/lib/pkg';

// https://astro.build/config
export default defineConfig({
	site: pkg.homepage,
	output: 'static',
	//outDir: './dist',
	publicDir: './static', // .public
	redirects: {
		'/beers': '/taps',
	},
	experimental: {
		incrementalBuild: true,
	},
	build: {
		concurrency: 2,
	},
	integrations: [
		sitemap({
			filter: (page) => page !== 'https://ohmybeer.ru/untappd/',
		}),
	],
});
