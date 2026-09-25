'use client';
import { site, localText } from '@/lib/site';
import { MobileDisclosure } from './mobile-disclosure';
import { CompanyExpertise } from './technology';
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
          <MobileDisclosure title={t('Хто ми', 'Who we are')}>
          <p><CopyAccent text={localText(site.who.lead, en)} phrase={t('промисловій автоматизації', 'industrial automation')} /></p>
          <p>{localText(site.who.body, en)}</p></MobileDisclosure>
        </article>
        <article>
          <MobileDisclosure title={t('Наш підхід', 'Our approach')}>
          <p><CopyAccent text={localText(site.approach.lead, en)} phrase={t('єдине технологічне рішення', 'single technological solution')} /></p>
          <p>{localText(site.approach.body, en)}</p></MobileDisclosure>
        </article>
      </div>
      <div id="network" className="network company-network-panel">
        <MobileDisclosure title={t('Міжнародна інженерно-виробнича мережа', 'International engineering and manufacturing network')}>
          <p className="network-lead">{localText(site.network.lead, en)}</p>
          <div className="network-places">
            {site.network.places.map(place=><div key={place.name.en}><strong>{localText(place.name,en)}</strong><p>{localText(place.role,en)}</p></div>)}
          </div>
          <p className="network-summary">{localText(site.network.body,en)}</p>
        </MobileDisclosure>
      </div>
    </section>
    <CompanyExpertise en={en} />
    </>
  );
}
