'use client';
import { site, localText } from '@/lib/site';

export function About({ en }: { en: boolean }) {
  const t = (a: string, b: string) => (en ? b : a);
  return (
    <section id="about" className="section company">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{t('Про компанію', 'About')}</p>
          <h2>
            {localText(site.tagline, en)}
          </h2>
        </div>
      </div>
      <div className="company-grid">
        <article>
          <h3>{t('Хто ми', 'Who we are')}</h3>
          <p>{localText(site.who.lead, en)}</p>
          <p>{localText(site.who.body, en)}</p>
        </article>
        <article>
          <h3>{t('Наш підхід', 'Our approach')}</h3>
          <p>{localText(site.approach.lead, en)}</p>
          <p>{localText(site.approach.body, en)}</p>
        </article>
      </div>
      <div className="network">
        <h3>{t('Міжнародна інженерно-виробнича мережа', 'International engineering network')}</h3>
        <p>{localText(site.network.lead, en)}</p>
        <div className="network-places">
          {site.network.places.map((place) => (
            <div key={place.name.en}>
              <strong>{localText(place.name, en)}</strong>
              <p>{localText(place.role, en)}</p>
            </div>
          ))}
        </div>
        <p>{localText(site.network.body, en)}</p>
      </div>
    </section>
  );
}
