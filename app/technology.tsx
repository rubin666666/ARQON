'use client';
import { site, localText, asset } from '@/lib/site';
import { MobileDisclosure } from './mobile-disclosure';
import Image from 'next/image';
import description from '@/config/dryer-description.json';
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
            <li key={item.en}><span>{localText(item, en)}</span></li>
          ))}
        </ul></MobileDisclosure>
      </div>
      <p className="technology-close"><CopyAccent text={localText(site.closing, en)} phrase={t('Один технологічний партнер', 'One technology partner')} /></p>
    </section>
  );
}

export function Technology({en}:{en:boolean}){

 const t=(uk:string,english:string)=>en?english:uk;
 const copy=(value:{uk:string;en:string})=>value[en?'en':'uk'];
 const cards=(items:{title:{uk:string;en:string};paragraphs:{uk:string;en:string}[];points?:{uk:string;en:string}[];after?:{uk:string;en:string}}[],numbered=false)=><div className="dryer-description-grid">{items.map((item,index)=><div className="dryer-description-item" key={item.title.en}><h4>{numbered&&<span className="dryer-description-number">{String(index+1).padStart(2,'0')} </span>}{copy(item.title)}</h4><div className="dryer-description-body">{item.paragraphs.map(p=><p key={p.en}>{copy(p)}</p>)}{item.points&&<ul>{item.points.map(p=><li key={p.en}>{copy(p)}</li>)}</ul>}{item.after&&<p>{copy(item.after)}</p>}</div></div>)}</div>;
 const flows=[['hot',t('Гаряче повітря','Hot air')],['warm',t('Тепле повітря','Warm air')],['medium',t('Повітря середньої температури','Intermediate-temperature air')],['cold',t('Холодне повітря','Cold air')],['grain',t('Рух зерна','Grain movement')]];
 const alt=t('Розріз сушарки SAHARA з кольоровими стрілками потоків повітря та руху зерна.','SAHARA dryer cutaway with colored airflow arrows and grain movement.');
 const legend=<ul className="flow-legend">{flows.map(([id,label])=><li key={id}><span className={'flow-key flow-'+id} aria-hidden="true">→</span>{label}</li>)}</ul>;
 return <section id="technology" className="section dryer-technology"><div className="section-heading"><div><p className="eyebrow">{t('Технологія сушіння','Drying technology')}</p><h2>{t('Як працює','How it works:')} <em>SAHARA</em></h2></div><p>{copy(description.intro)}</p></div>
 <figure className="flow-figure"><div className="flow-image"><Image src={asset('/images/sahara-flow-v2.webp')} alt={alt} width={1536} height={864} loading="lazy"/></div><figcaption><h3>{t('Пояснення потоків','Flow legend')}</h3>{legend}<p className="visualization-note">{t('Схематична візуалізація за матеріалами виробника.','Conceptual visualization adapted from the manufacturer’s illustration.')}</p></figcaption></figure>
 <details className="dryer-description"><summary><span className="dryer-description-label"><strong>{t('Докладніше про сушарку','More about the dryer')}</strong><small>{t('Етапи сушіння · Керування · Модульна конструкція','Drying stages · Controls · Modular design')}</small></span><span className="dryer-description-toggle" aria-hidden="true">+</span></summary><div className="dryer-description-content">
 <div className="dryer-description-section"><h3>{copy(description.processTitle)}</h3>{cards(description.steps,true)}</div>
 <div className="dryer-description-section"><h3>{t('Керування та режими роботи','Control and operating regimes')}</h3>{cards([description.overview,...description.features])}</div>
 <div className="dryer-description-section"><h3>{copy(description.benefitsTitle)}</h3>{cards(description.benefits,true)}</div>
 <div className="dryer-description-closing"><h3>{copy(description.closingTitle)}</h3><p>{copy(description.closing)}</p></div>
 </div></details></section>;
}
