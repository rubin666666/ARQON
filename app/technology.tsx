'use client';
import { site, localText, asset } from '@/lib/site';
import { MobileDisclosure } from './mobile-disclosure';
import Image from 'next/image';
import { CopyAccent } from './copy-accent';

export function CompanyExpertise({ en }: { en: boolean }) {
  const t = (a: string, b: string) => (en ? b : a);
  return (
    <section id="company-expertise" className="section technology technology-detail">
      <div className="technology-heading">
        <p className="eyebrow">{t('Про компанію · Компетенції', 'About · Expertise')}</p>
        <MobileDisclosure level={2} title={<CopyAccent text={t('Наші технології', 'Our technology')} phrase={t('технології', 'technology')} />}>
        <p><CopyAccent text={localText(site.technology.lead, en)} phrase={t('власні технології', 'proprietary technologies')} /></p>
        <p>{localText(site.technology.body, en)}</p></MobileDisclosure>
      </div>
      <div className="capabilities">
        <MobileDisclosure title={t('Чим ми займаємося', 'What we do')}>
        <p><CopyAccent text={localText(site.what.lead, en)} phrase={t('весь цикл розробки продукту', 'entire product development cycle')} /></p>
        <ul>
          {site.what.items.map((item) => (
            <li key={item.en}>{localText(item, en)}</li>
          ))}
        </ul></MobileDisclosure>
      </div>
      <p className="technology-close"><CopyAccent text={localText(site.closing, en)} phrase={t('Один технологічний партнер', 'One technology partner')} /></p>
    </section>
  );
}

export function Technology({en}:{en:boolean}){

 const t=(uk:string,english:string)=>en?english:uk;
 const flows=[['hot',t('Гаряче повітря','Hot air')],['warm',t('Тепле повітря','Warm air')],['medium',t('Повітря середньої температури','Intermediate-temperature air')],['cold',t('Холодне повітря','Cold air')],['grain',t('Рух зерна','Grain movement')]];
 const alt=t('Розріз сушарки SAHARA з кольоровими стрілками потоків повітря та руху зерна.','SAHARA dryer cutaway with colored airflow arrows and grain movement.');
 const legend=<ul className="flow-legend">{flows.map(([id,label])=><li key={id}><span className={'flow-key flow-'+id} aria-hidden="true">→</span>{label}</li>)}</ul>;
 return <section id="technology" className="section dryer-technology"><div className="section-heading"><div><p className="eyebrow">{t('Технологія сушіння','Drying technology')}</p><h2>{t('Як працює','How it works:')} <em>SAHARA</em></h2></div><p>{t('Потоки повітря та рух зерна — на одному розрізі сушарки.','Airflow and grain movement in one dryer cutaway.')}</p></div>
 <figure className="flow-figure"><div className="flow-image"><Image src={asset('/images/sahara-flow-v2.webp')} alt={alt} width={1536} height={864} loading="lazy"/></div><figcaption><h3>{t('Пояснення потоків','Flow legend')}</h3>{legend}<p className="visualization-note">{t('Схематична візуалізація за матеріалами виробника.','Conceptual visualization adapted from the manufacturer’s illustration.')}</p></figcaption></figure>
 </section>;
}
