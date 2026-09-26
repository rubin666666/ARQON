'use client';
import { site, localText } from '@/lib/site';
import { CopyAccent } from './copy-accent';

export function About({ en }: { en: boolean }) {
  const t = (uk: string, english: string) => en ? english : uk;
  const directions = [
    t('Проєктування й обладнання', 'Engineering and equipment'),
    t('Автоматизація та PLC/HMI', 'Automation and PLC/HMI'),
    t('Промислове програмне забезпечення', 'Industrial software'),
    t('Моніторинг та інтеграція', 'Monitoring and integration'),
  ];
  const roles = [
    t('Інженерія та розвиток продуктів', 'Engineering and product development'),
    t('Програмне забезпечення й автоматизація', 'Software and automation'),
    t('Виробництво через партнерів', 'Manufacturing through partners'),
  ];
  return <section id="about" className="section about-compact">
    <header className="about-intro">
      <p className="eyebrow">{t('Про ARQON', 'About ARQON')}</p>
      <h2><CopyAccent text={localText(site.tagline, en)} phrase={t('Інтелект.', 'Intelligence.')} /></h2>
      <p>{t('ARQON розробляє промислове обладнання, автоматизацію та власне програмне забезпечення — від концепції до запуску єдиної системи.', 'ARQON develops industrial equipment, automation and proprietary software — from concept to the launch of a unified system.')}</p>
    </header>
    <div className="about-overview">
      <div id="company-expertise">
        <h3>{t('Компетенції', 'Expertise')}</h3>
        <ul className="about-directions">{directions.map((text, i) => <li key={text}><span aria-hidden="true">0{i + 1}</span>{text}</li>)}</ul>
      </div>
      <div id="network">
        <h3>{t('Міжнародна мережа', 'International network')}</h3>
        <ul className="about-locations">{site.network.places.map((place, i) => <li key={place.name.en}><strong>{localText(place.name, en)}</strong><span>{roles[i]}</span></li>)}</ul>
      </div>
    </div>
    <details className="about-details">
      <summary>{t('Докладніше про компанію', 'More about the company')}<span aria-hidden="true">+</span></summary>
      <div className="about-full-copy">
        <article><h3>{t('Хто ми', 'Who we are')}</h3><p>{localText(site.who.lead, en)}</p><p>{localText(site.who.body, en)}</p></article>
        <article><h3>{t('Наш підхід', 'Our approach')}</h3><p>{localText(site.approach.lead, en)}</p><p>{localText(site.approach.body, en)}</p></article>
        <article><h3>{t('Наші технології', 'Our technology')}</h3><p>{localText(site.technology.lead, en)}</p><p>{localText(site.technology.body, en)}</p></article>
        <article><h3>{t('Чим ми займаємося', 'What we do')}</h3><p>{localText(site.what.lead, en)}</p><ol>{site.what.items.map(item => <li key={item.en}>{localText(item, en)}</li>)}</ol></article>
        <article className="about-full-network"><h3>{t('Міжнародна інженерно-виробнича мережа', 'International engineering and manufacturing network')}</h3><p>{localText(site.network.lead, en)}</p><dl>{site.network.places.map(place => <div key={place.name.en}><dt>{localText(place.name, en)}</dt><dd>{localText(place.role, en)}</dd></div>)}</dl><p>{localText(site.network.body, en)}</p></article>
        <p className="about-full-closing">{localText(site.closing, en)}</p>
      </div>
    </details>
  </section>;
}
