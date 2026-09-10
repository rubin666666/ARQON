import config from '@/config/site.json';
export type Localized = { uk: string; en: string };
export type SiteConfig = Omit<
  typeof config,
  'videos' | 'partners' | 'socials' | 'photos' | 'faq'
> & {
  faq: { question: Localized; answer: Localized }[];
  videos: { id: string; provider: 'youtube' | 'vimeo'; title: Localized }[];
  partners: { name: string; logo: string; url?: string }[];
  socials: { name: string; url: string }[];
  photos: { src: string; uk: string; en: string }[];
};
export const site = config as SiteConfig;
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
export const asset = (path: string) =>
  path.startsWith('https://')
    ? path
    : `${basePath}${path.startsWith('/') ? path : '/' + path}`;
export const localeUrl = (en: boolean) => `${basePath}/${en ? 'en/' : ''}`;
export const localText = (value: Localized, en: boolean) =>
  value[en ? 'en' : 'uk'];
export const canSubmit = (en: boolean) =>
  site.leadEndpoint.startsWith('https://') &&
  !!localText(site.privacy, en).trim();
export function readPreference(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
export function writePreference(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* Keep the in-memory preference when storage is unavailable. */
  }
}
export function track(
  event: string,
  details: Record<string, string | number | boolean> = {},
) {
  if (
    typeof window === 'undefined' ||
    readPreference('arqon-analytics') !== 'accepted'
  )
    return;
  const w = window as Window & {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  };
  if (!site.gtmId && site.ga4Id && w.gtag) {
    w.gtag('event', event, details);
    return;
  }
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event, ...details });
}

export const hasContacts = (en: boolean) => !!(site.contact.phone || site.contact.email || localText(site.contact.address, en) || site.contact.telegram || site.contact.whatsapp || site.contact.viber || canSubmit(en));
