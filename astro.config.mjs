// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

import cloudflare from '@astrojs/cloudflare';
import starlightSidebarTopicsPlugin from 'starlight-sidebar-topics';

// https://astro.build/config
export default defineConfig({
  integrations: [
      starlight({
          title: 'UDN',
          social: {
              github: 'https://github.com/ekwoka/unreal-developer-network',
          },
          lastUpdated: true,
          editLink: {
            baseUrl: 'https://github.com/ekwoka/unreal-developer-network/edit/main',
          },
          plugins: [
            starlightSidebarTopicsPlugin([
              {
                  label: 'Guides',
                  link: '/guides/getting-started',
                  icon: 'open-book',
                  items: [
                    {
                      label: 'Mover',
                      badge: {
                        text: 'Experimental',
                        variant: 'caution'
                      },
                      autogenerate: { directory: 'mover' },
                  }
                ]
              },
              {
                label: 'Unreal Docs',
                icon: 'seti:html',
                link: 'https://docs.unrealengine.com/',
              },
          ])],
      }),
	],

  adapter: cloudflare(),
});
