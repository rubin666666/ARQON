'use client';
import { site, localText } from '@/lib/site';
import { CopyAccent } from './copy-accent';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Tabs } from '@base-ui/react/tabs';
import { ArrowUpRight } from 'lucide-react';

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
    <div className="about-intro">
      <p className="eyebrow">{t('Про ARQON', 'About ARQON')}</p>
      <h2><CopyAccent text={localText(site.tagline, en)} phrase={t('Інтелект.', 'Intelligence.')} /></h2>
      <p>{t('ARQON розробляє промислове обладнання, автоматизацію та власне програмне забезпечення — від концепції до запуску єдиної системи.', 'ARQON develops industrial equipment, automation and proprietary software — from concept to the launch of a unified system.')}</p>
    </div>
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
    <Dialog>
      <DialogTrigger className="dryer-description-launch about-dialog-launch">
        <span className="dryer-description-label"><strong>{t('Докладніше про компанію', 'More about the company')}</strong><small>{t('Компанія · Компетенції · Міжнародна мережа', 'Company · Expertise · International network')}</small></span>
        <span className="dryer-description-toggle" aria-hidden="true"><ArrowUpRight size={24}/></span>
      </DialogTrigger>
      <DialogContent className="arqon-dialog dryer-description-dialog about-dialog" showCloseButton={false}>
        <div className="dryer-dialog-heading">
          <div><DialogTitle>{t('Докладніше про компанію', 'More about the company')}</DialogTitle><DialogDescription>ARQON · Engineering &amp; Innovation</DialogDescription></div>
          <DialogClose className="modal-close" aria-label={t('Закрити опис компанії', 'Close company description')}>×</DialogClose>
        </div>
        <Tabs.Root defaultValue="company" className="dryer-dialog-tabs">
          <Tabs.List className="dryer-dialog-tablist" aria-label={t('Розділи опису компанії', 'Company description sections')}>
            <Tabs.Tab value="company">{t('Компанія', 'Company')}</Tabs.Tab>
            <Tabs.Tab value="expertise">{t('Компетенції', 'Expertise')}</Tabs.Tab>
            <Tabs.Tab value="network">{t('Міжнародна мережа', 'International network')}</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel keepMounted value="company" className="dryer-dialog-panel">
            <div className="about-modal-columns">
              <article><h3>{t('Хто ми', 'Who we are')}</h3><p>{localText(site.who.lead, en)}</p><p>{localText(site.who.body, en)}</p></article>
              <article><h3>{t('Наш підхід', 'Our approach')}</h3><p>{localText(site.approach.lead, en)}</p><p>{localText(site.approach.body, en)}</p></article>
            </div>
            <p className="about-modal-closing">{localText(site.closing, en)}</p>
          </Tabs.Panel>
          <Tabs.Panel keepMounted value="expertise" className="dryer-dialog-panel">
            <article><h3>{t('Наші технології', 'Our technology')}</h3><p>{localText(site.technology.lead, en)}</p><p>{localText(site.technology.body, en)}</p></article>
            <article className="about-modal-expertise"><h3>{t('Чим ми займаємося', 'What we do')}</h3><p>{localText(site.what.lead, en)}</p><ol>{site.what.items.map((item,i) => <li key={item.en}><span aria-hidden="true">{String(i+1).padStart(2,'0')}</span>{localText(item, en)}</li>)}</ol></article>
          </Tabs.Panel>
          <Tabs.Panel keepMounted value="network" className="dryer-dialog-panel">
            <article><h3>{t('Міжнародна інженерно-виробнича мережа', 'International engineering and manufacturing network')}</h3><p>{localText(site.network.lead, en)}</p>
              <dl className="about-modal-network">{site.network.places.map(place => <div key={place.name.en}><dt>{localText(place.name, en)}</dt><dd>{localText(place.role, en)}</dd></div>)}</dl>
              <p className="about-modal-closing">{localText(site.network.body, en)}</p>
            </article>
          </Tabs.Panel>
        </Tabs.Root>
      </DialogContent>
    </Dialog>
  </section>;
}
