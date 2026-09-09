import type { Metadata } from 'next';
import { site, basePath, localeUrl } from './site';
export function metadataFor(en: boolean): Metadata {
  return {
    title: en
      ? 'ARQON SAHARA — Grain dryers & payback calculator'
      : 'ARQON SAHARA — Зерносушарки та калькулятор окупності',
    description: en
      ? 'Canadian–Ukrainian ARQON grain drying technology. Explore SAHARA 1–4 and compare on-site grain drying with external elevator costs.'
      : 'Канадсько-українські технології сушіння зерна ARQON. Зерносушарки SAHARA 1–4 та порівняння власного сушіння з витратами на елеватор.',
    metadataBase: new URL(site.origin),
    alternates: {
      canonical: localeUrl(en),
      languages: {
        uk: localeUrl(false),
        en: localeUrl(true),
        'x-default': localeUrl(false),
      },
    },
    robots: { index: site.readyForIndexing, follow: site.readyForIndexing },
    icons: { icon: `${basePath}/favicon.svg` },
    openGraph: {
      type: 'website',
      locale: en ? 'en_GB' : 'uk_UA',
      siteName: 'ARQON',
      title: en ? 'ARQON — SAHARA grain dryers' : 'ARQON — Зерносушарки SAHARA',
      url: localeUrl(en),
    },
  };
}
