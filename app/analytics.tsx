'use client';
import { useEffect, useState } from 'react';
import { site } from '@/lib/site';
export function Analytics({ en }: { en: boolean }) {
  const [choice, setChoice] = useState<string | null>(null);
  const configured =
    /^GTM-[A-Z0-9]+$/.test(site.gtmId) || /^G-[A-Z0-9]+$/.test(site.ga4Id);
  useEffect(() => {
    const read = () => {
      try {
        setChoice(localStorage.getItem('arqon-analytics'));
      } catch {
        setChoice('declined');
      }
    };
    read();
  }, []);
  useEffect(() => {
    if (
      !configured ||
      choice !== 'accepted' ||
      document.getElementById('arqon-analytics-script')
    )
      return;
    const w = window as Window & {
      dataLayer?: unknown[];
      gtag?: (...args: unknown[]) => void;
    };
    w.dataLayer = w.dataLayer || [];
    const script = document.createElement('script');
    script.id = 'arqon-analytics-script';
    script.async = true;
    if (site.gtmId) {
      w.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
      script.src = `https://www.googletagmanager.com/gtm.js?id=${site.gtmId}`;
    } else {
      w.gtag = function (...args: unknown[]) {
        w.dataLayer!.push(args);
      };
      w.gtag('js', new Date());
      w.gtag('config', site.ga4Id);
      script.src = `https://www.googletagmanager.com/gtag/js?id=${site.ga4Id}`;
    }
    document.head.appendChild(script);
  }, [choice, configured]);
  function choose(value: string) {
    localStorage.setItem('arqon-analytics', value);
    setChoice(value);
  }
  if (!configured || choice) return null;
  return (
    <div
      className="analytics-banner"
      aria-label={en ? 'Analytics preferences' : 'Налаштування аналітики'}
    >
      <p>
        {en
          ? 'Allow anonymous usage analytics to help improve the website?'
          : 'Дозволити аналітику використання для покращення сайту?'}{' '}
        <a href="#privacy">{en ? 'Privacy' : 'Конфіденційність'}</a>
      </p>
      <button onClick={() => choose('declined')}>
        {en ? 'Decline' : 'Відхилити'}
      </button>
      <button className="button" onClick={() => choose('accepted')}>
        {en ? 'Allow' : 'Дозволити'}
      </button>
    </div>
  );
}
