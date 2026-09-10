import type { Metadata } from 'next';
import { site, basePath, localeUrl } from './site';
export function metadataFor(en: boolean): Metadata {
  return {
    title: en
      ? 'ARQON — Engineering. Automation. Intelligence.'
      : 'ARQON — Engineering. Automation. Intelligence.',
    description: en
      ? 'Arqon is an engineering technology company specializing in industrial automation, intelligent machinery, and industrial software.'
      : 'Arqon — інженерно-технологічна компанія, що спеціалізується на промисловій автоматизації, інтелектуальному обладнанні та промисловому програмному забезпеченні.',
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
      title: en ? 'ARQON — Engineering. Automation. Intelligence.' : 'ARQON — Engineering. Automation. Intelligence.',
      url: localeUrl(en),
    },
  };
}
