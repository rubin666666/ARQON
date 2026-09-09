import { renderToString } from 'react-dom/server';
import Home from '../app/home';
import { metadataFor } from '../lib/metadata';
export function renderPage(en: boolean) {
  return {
    body: renderToString(<Home initialEnglish={en} />),
    metadata: metadataFor(en),
  };
}
