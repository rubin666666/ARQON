'use client';
import {site,localText} from '@/lib/site';
import {Tabs} from '@base-ui/react/tabs';
export default function AboutPanels({en}:{en:boolean}) {
const t=(uk:string,english:string)=>en?english:uk;
  const directions = [
    t('Проєктування й обладнання', 'Engineering and equipment'),
    t('Автоматизація та PLC/HMI', 'Automation and PLC/HMI'),
    t('Промислове програмне забезпечення', 'Industrial software'),
    t('Моніторинг та інтеграція', 'Monitoring and integration'),
  ];
return (        <Tabs.Root defaultValue="company" className="dryer-dialog-tabs">
          <Tabs.List className="dryer-dialog-tablist" aria-label={t('Розділи опису компанії', 'Company description sections')}>
            <Tabs.Tab value="company">{t('Компанія', 'Company')}</Tabs.Tab>
            <Tabs.Tab value="expertise">{t('Компетенції', 'Expertise')}</Tabs.Tab>
            <Tabs.Tab value="network">{t('Міжнародна мережа', 'International network')}</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel keepMounted value="company" className="dryer-dialog-panel">
            <div className="about-modal-columns">
              <article className="about-modal-card"><span className="about-card-index" aria-hidden="true">01</span><h3>{t('Хто ми', 'Who we are')}</h3><p>{localText(site.who.lead, en)}</p><p>{localText(site.who.body, en)}</p></article>
              <article className="about-modal-card"><span className="about-card-index" aria-hidden="true">02</span><h3>{t('Наш підхід', 'Our approach')}</h3><p>{localText(site.approach.lead, en)}</p><p>{localText(site.approach.body, en)}</p></article>
            </div>
            <p className="about-modal-closing">{localText(site.closing, en)}</p>
          </Tabs.Panel>
          <Tabs.Panel keepMounted value="expertise" className="dryer-dialog-panel">
            <div className="about-expertise-intro"><h3>{t('Чим ми займаємося', 'What we do')}</h3><p>{localText(site.what.lead, en)}</p></div>
            <div className="about-expertise-layout">
              <article className="about-modal-card about-technology-card"><span className="about-card-index">ARQON</span><h3>{t('Наші технології', 'Our technology')}</h3><p>{localText(site.technology.lead, en)}</p><p>{localText(site.technology.body, en)}</p></article>
              <div className="about-modal-expertise about-expertise-groups">{directions.map((direction,i) => <section className="about-modal-card" key={direction}><h4><span className="about-card-index" aria-hidden="true">0{i+1}</span>{direction}</h4><ul>{site.what.items.slice(i*2,i*2+2).map(item => <li key={item.en}>{localText(item,en)}</li>)}</ul></section>)}</div>
            </div>
          </Tabs.Panel>
          <Tabs.Panel keepMounted value="network" className="dryer-dialog-panel">
            <article><h3>{t('Міжнародна інженерно-виробнича мережа', 'International engineering and manufacturing network')}</h3><p>{localText(site.network.lead, en)}</p>
              <dl className="about-modal-network">{site.network.places.map((place,i) => <div className="about-modal-card" key={place.name.en}><dt><span className="about-card-index" aria-hidden="true">0{i+1}</span>{localText(place.name, en)}</dt><dd>{localText(place.role, en)}</dd></div>)}</dl>
              <p className="about-modal-closing">{localText(site.network.body, en)}</p>
            </article>
          </Tabs.Panel>
        </Tabs.Root>);
}
