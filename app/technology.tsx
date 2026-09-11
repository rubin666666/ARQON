'use client';
import { site, localText } from '@/lib/site';
import { CopyAccent } from './copy-accent';

export function Technology({ en }: { en: boolean }) {
  const t = (a: string, b: string) => (en ? b : a);
  return (
    <section id="technology" className="section technology technology-detail">
      <div className="technology-heading">
        <p className="eyebrow">{t('Технологія', 'Technology')}</p>
        <h2><CopyAccent text={t('Наші технології', 'Our technology')} phrase={t('технології', 'technology')} /></h2>
        <p><CopyAccent text={localText(site.technology.lead, en)} phrase={t('власні технології', 'proprietary technologies')} /></p>
        <p>{localText(site.technology.body, en)}</p>
      </div>
      <div className="capabilities">
        <h3>{t('Чим ми займаємося', 'What we do')}</h3>
        <p><CopyAccent text={localText(site.what.lead, en)} phrase={t('весь цикл розробки продукту', 'entire product development cycle')} /></p>
        <ul>
          {site.what.items.map((item) => (
            <li key={item.en}>{localText(item, en)}</li>
          ))}
        </ul>
      </div>
      <p className="technology-close"><CopyAccent text={localText(site.closing, en)} phrase={t('Один технологічний партнер', 'One technology partner')} /></p>
    </section>
  );
}
