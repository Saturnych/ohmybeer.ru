import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import pkg from './src/lib/pkg';

// https://astro.build/config
export default defineConfig({
	output: 'static',
	//outDir: './dist',
	publicDir: './static', // .public
	redirects: {
		'/beers': '/taps',
	},
	site: pkg.homepage,
	integrations: [
		sitemap(),
		/*
		sitemap({
			filter: (page) => page !== 'https://example.com/beers/',
    }),
		*/
	],
});
