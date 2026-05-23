import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://caseyshiray.com',
  integrations: [mdx()],
  output: 'static',
  build: {
    format: 'directory',
  },
  trailingSlash: 'never',
  vite: {
    resolve: {
      alias: {
        '~': '/src',
      },
    },
  },
});
