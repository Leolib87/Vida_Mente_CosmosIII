import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://leolib87.github.io',
  base: '/Vida_Mente_CosmosIII',
  output: 'static',
  trailingSlash: 'never',
  build: {
    format: 'file',
  },
});
