import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  //outDir: './dist',
  publicDir: './static', // .public
});
