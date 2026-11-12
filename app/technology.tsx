'use client';
/* oxlint-disable jsx-a11y/no-noninteractive-tabindex -- The stage description must support keyboard scrolling. */
import { useRef, useState } from 'react';
import { site, localText, asset } from '@/lib/site';
import { DiagramViewer } from './diagram-viewer';
import { DryingMarkers, DryingProcess } from './drying-process';
import { MobileDisclosure } from './mobile-disclosure';
import Image from 'next/image';
import description from '@/config/dryer-description.json';
import { CopyAccent } from './copy-accent';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import DryerPanels from './dryer-panels';
import { ArrowUpRight, ArrowRight, Factory } from 'lucide-react';

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
 const [activeStage,setActiveStage]=useState(1);
 const descriptionPanel=useRef<HTMLElement>(null);
 const selectedScroll=useRef<number|null>(null);
 function selectStage(stage:number){
  const panel=descriptionPanel.current;
  const item=panel?.querySelectorAll('.drying-process > li')[stage-1];
  if(!panel||!item)return;
  const next=stage===1?0:panel.scrollTop+item.getBoundingClientRect().top-panel.getBoundingClientRect().top-18;
  panel.scrollTop=Math.max(0,Math.min(next,panel.scrollHeight-panel.clientHeight));
  selectedScroll.current=panel.scrollTop;
  setActiveStage(stage);
 }

 function trackStage(panel:HTMLElement){
  if(selectedScroll.current!==null){
   const selected=selectedScroll.current;selectedScroll.current=null;
   if(Math.abs(panel.scrollTop-selected)<2)return;
  }
  const items=Array.from(panel.querySelectorAll('.drying-process > li'));
  const top=panel.getBoundingClientRect().top;
  const readingLine=top+Math.min(100,panel.clientHeight*.35);
  let current=1;
  items.forEach((item,index)=>{if(item.getBoundingClientRect().top<=readingLine)current=index+1;});
  if(panel.scrollTop>0&&panel.scrollTop+panel.clientHeight>=panel.scrollHeight-2)current=items.length;
  setActiveStage(current);
 }


 const t=(uk:string,english:string)=>en?english:uk;
 const copy=(value:{uk:string;en:string})=>value[en?'en':'uk'];
 const flows=[['hot',t('Гаряче повітря','Hot air')],['warm',t('Тепле повітря','Warm air')],['medium',t('Повітря середньої температури','Intermediate-temperature air')],['cold',t('Холодне повітря','Cold air')],['grain',t('Рух зерна','Grain movement')]];
 const alt=t('Розріз сушарки SAHARA з кольоровими стрілками потоків повітря та руху зерна.','SAHARA dryer cutaway with colored airflow arrows and grain movement.');
 const legend=<ul className="flow-legend">{flows.map(([id,label])=><li key={id}><span className={'flow-key flow-'+id} aria-hidden="true">→</span>{label}</li>)}</ul>;
 return <section id="technology" className="section dryer-technology"><div className="section-heading"><div><p className="eyebrow">{t('Технологія сушіння','Drying technology')}</p><h2>{t('Як працює','How it works')} <em>SAHARA</em></h2></div></div>
 <figure className="flow-figure"><div className="flow-visual"><Dialog><div className="flow-image-button"><span className="flow-image-stage"><Image src={asset('/images/sahara-flow-v2.webp')} alt={alt} width={1536} height={864} loading="lazy"/><DryingMarkers activeStage={activeStage} en={en} onSelect={selectStage}/></span><DialogTrigger className="flow-enlarge-button" aria-label={t('Збільшити схему сушіння','Enlarge drying diagram')}><span className="flow-zoom">{t('Збільшити схему','Enlarge diagram')}<ArrowUpRight size={18}/></span></DialogTrigger></div><DialogContent className="arqon-dialog flow-dialog" showCloseButton={false} aria-describedby={undefined}><DialogTitle>{t('Як працює SAHARA','How SAHARA works')}</DialogTitle><DialogClose className="modal-close" aria-label={t('Закрити схему','Close diagram')}>×</DialogClose><DryingProcess en={en} compact activeStage={activeStage}/><DiagramViewer annotations={<DryingMarkers activeStage={activeStage}/>} src={asset('/images/sahara-flow-v2.webp')} alt={alt} en={en}/>{legend}</DialogContent></Dialog><div className="flow-caption"><h3>{t('Пояснення потоків','Flow legend')}</h3>{legend}<p className="visualization-note">{t('Схематична візуалізація за матеріалами виробника.','Conceptual visualization adapted from the manufacturer’s illustration.')}</p></div></div><section id="drying-stage-description" ref={descriptionPanel} className="flow-description" onScroll={event=>trackStage(event.currentTarget)} tabIndex={0} aria-label={t('Опис етапів сушіння — прокручуйте','Drying stages — scroll to read')}><p className="flow-scroll-hint">{t('Натисніть 1–3 на схемі або гортайте опис ↓','Tap 1–3 on the diagram or scroll the description ↓')}</p><DryingProcess en={en} activeStage={activeStage}/></section></figure>

 <Dialog>
   <DialogTrigger className="dryer-description-launch">
     <span className="description-entry-icon" aria-hidden="true"><Factory size={42} strokeWidth={1.4} /></span><span className="dryer-description-label"><strong>{t('Докладніше про сушарку','More about the dryer')}</strong><small>{t('Етапи сушіння · Керування · Модульна конструкція','Drying stages · Controls · Modular design')}</small></span>
     <span className="description-entry-art" aria-hidden="true"><Factory strokeWidth={0.7} /></span><span className="description-entry-action" aria-hidden="true">{t('Відкрити вікно','Open window')}<ArrowUpRight size={20}/></span>
   </DialogTrigger>
   <DialogContent className="arqon-dialog dryer-description-dialog" showCloseButton={false}>
     <div className="dryer-dialog-heading">
       <div><DialogTitle>{t('Докладніше про сушарку','More about the dryer')}</DialogTitle><DialogDescription>SAHARA · ARQON</DialogDescription></div>
       <DialogClose className="modal-close" aria-label={t('Закрити опис сушарки','Close dryer description')}>×</DialogClose>
     </div>
     <DryerPanels en={en}/>
   </DialogContent>
 </Dialog>
 <div className="dryer-description-closing"><h3>{copy(description.closingTitle)}</h3><p>{copy(description.closing)}</p></div><div className="technology-next"><p>{t('Далі — порівняйте продуктивність моделей і відкрийте розрахунок для свого обсягу зерна.','Next, compare model capacities and open a calculation for your grain volume.')}</p><a className="button button-secondary" href="#products">{t('Переглянути моделі','View models')}<ArrowRight size={18}/></a></div></section>;
}
