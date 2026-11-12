'use client';
import { site, localText } from '@/lib/site';
import { CopyAccent } from './copy-accent';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import AboutPanels from './about-panels';
import { ArrowUpRight, Cog } from 'lucide-react';

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
        <p className="company-system-copy">
              {t(
                'Зерносушарки SAHARA — обладнання Arqon, де інженерія, автоматизація й програмне забезпечення працюють як одна система.',
                'SAHARA grain dryers from Arqon, where engineering, automation and software work as one system.',
              )}
            </p>
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
        <span className="description-entry-icon" aria-hidden="true"><Cog size={42} strokeWidth={1.4} /></span><span className="dryer-description-label"><strong>{t('Докладніше про компанію', 'More about the company')}</strong><small>{t('Компанія · Компетенції · Міжнародна мережа', 'Company · Expertise · International network')}</small></span>
        <span className="description-entry-art" aria-hidden="true"><Cog strokeWidth={0.7} /></span><span className="description-entry-action" aria-hidden="true">{t('Відкрити вікно','Open window')}<ArrowUpRight size={20}/></span>
      </DialogTrigger>
      <DialogContent className="arqon-dialog dryer-description-dialog about-dialog" showCloseButton={false}>
        <div className="dryer-dialog-heading">
          <div><DialogTitle>{t('Докладніше про компанію', 'More about the company')}</DialogTitle><DialogDescription>ARQON · Engineering &amp; Innovation</DialogDescription></div>
          <DialogClose className="modal-close" aria-label={t('Закрити опис компанії', 'Close company description')}>×</DialogClose>
        </div>
        <AboutPanels en={en}/>
      </DialogContent>
    </Dialog>
  </section>;
}
