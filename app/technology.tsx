'use client';
import { site, localText } from '@/lib/site';

export function Technology({ en }: { en: boolean }) {
  const t = (a: string, b: string) => (en ? b : a);
  return (
    <section id="technology" className="section technology technology-detail">
      <div className="technology-heading">
        <p className="eyebrow">{t('Технологія', 'Technology')}</p>
        <h2>{t('Наші технології', 'Our technology')}</h2>
        <p>{localText(site.technology.lead, en)}</p>
        <p>{localText(site.technology.body, en)}</p>
      </div>
      <div className="capabilities">
        <h3>{t('Чим ми займаємося', 'What we do')}</h3>
        <p>{localText(site.what.lead, en)}</p>
        <ul>
          {site.what.items.map((item) => (
            <li key={item.en}>{localText(item, en)}</li>
          ))}
        </ul>
      </div>
      <p className="technology-close">{localText(site.closing, en)}</p>
    </section>
  );
}
