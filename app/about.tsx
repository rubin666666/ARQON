'use client';
import { site, localText } from '@/lib/site';
import { CopyAccent } from './copy-accent';

export function About({ en }: { en: boolean }) {
  const t = (a: string, b: string) => (en ? b : a);
  return (
    <>
    <section id="about" className="section company">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{t('Про компанію', 'About')}</p>
          <h2>
            <CopyAccent text={localText(site.tagline, en)} phrase={t('Інтелект.', 'Intelligence.')} />
          </h2>
        </div>
      </div>
      <div className="company-grid">
        <article>
          <h3>{t('Хто ми', 'Who we are')}</h3>
          <p><CopyAccent text={localText(site.who.lead, en)} phrase={t('промисловій автоматизації', 'industrial automation')} /></p>
          <p>{localText(site.who.body, en)}</p>
        </article>
        <article>
          <h3>{t('Наш підхід', 'Our approach')}</h3>
          <p><CopyAccent text={localText(site.approach.lead, en)} phrase={t('єдине технологічне рішення', 'single technological solution')} /></p>
          <p>{localText(site.approach.body, en)}</p>
        </article>
      </div>
    </section>
    <section id="network" className="section network">
      <div className="network-intro">
        <h3>{t('Міжнародна інженерно-виробнича мережа', 'International engineering network')}</h3>
        <p>{localText(site.network.lead, en)}{' '}{localText(site.network.body, en)}</p>
      </div>
      <div className="network-places">
        {site.network.places.map((place) => (
          <div key={place.name.en}>
            <strong>{localText(place.name, en)}</strong>
            <p>{localText(place.role, en)}</p>
          </div>
        ))}
      </div>
    </section>
    </>
  );
}
