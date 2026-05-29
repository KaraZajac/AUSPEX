import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import pagefind from 'astro-pagefind';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://auspex.blackflagintel.com',
  server: {
    host: '127.0.0.1',
    port: 4321,
  },
  devToolbar: {
    enabled: false,
  },
  integrations: [mdx(), sitemap(), pagefind()],
});
