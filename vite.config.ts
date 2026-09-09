import { sites } from '@openai/sites-vite-plugin';
import tailwindcss from '@tailwindcss/postcss';
import vinext from 'vinext';
import { defineConfig } from 'vite';
export default defineConfig(async()=>({
 css:{postcss:{plugins:[tailwindcss()]}},
 plugins:process.env.STATIC_EXPORT==='1'?[vinext()]:[vinext(),sites(),(await import('@cloudflare/vite-plugin')).cloudflare({viteEnvironment:{name:'rsc',childEnvironments:['ssr']},config:{main:'vinext/server/fetch-handler',compatibility_flags:['nodejs_compat']}})],
}));
