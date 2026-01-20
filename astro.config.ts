import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  outDir: './build', // ./distr
  publicDir: './static', // .public
});
