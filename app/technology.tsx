'use client';
import { site, localText, asset } from '@/lib/site';
import { MobileDisclosure } from './mobile-disclosure';
import Image from 'next/image';
import {useState,useRef,useEffect,type ReactNode} from 'react';
import {Maximize2,Plus,Minus} from 'lucide-react';
import {Dialog,DialogContent,DialogTitle,DialogClose} from '@/components/ui/dialog';
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
 const [open,setOpen]=useState(false);
 const t=(uk:string,english:string)=>en?english:uk;
 const flows=[['hot',t('Гаряче повітря','Hot air')],['warm',t('Тепле повітря','Warm air')],['medium',t('Повітря середньої температури','Intermediate-temperature air')],['cold',t('Холодне повітря','Cold air')],['grain',t('Рух зерна','Grain movement')]];
 const alt=t('Розріз сушарки SAHARA з кольоровими стрілками потоків повітря та руху зерна.','SAHARA dryer cutaway with colored airflow arrows and grain movement.');
 const legend=<ul className="flow-legend">{flows.map(([id,label])=><li key={id}><span className={'flow-key flow-'+id} aria-hidden="true">→</span>{label}</li>)}</ul>;
 return <section id="technology" className="section dryer-technology"><div className="section-heading"><div><p className="eyebrow">{t('Технологія сушіння','Drying technology')}</p><h2>{t('Як працює','How it works:')} <em>SAHARA</em></h2></div><p>{t('Потоки повітря та рух зерна — на одному розрізі сушарки.','Airflow and grain movement in one dryer cutaway.')}</p></div>
 <figure className="flow-figure"><button type="button" className="flow-image-button" onClick={()=>setOpen(true)} aria-label={t('Збільшити схему потоків','Enlarge flow diagram')}><Image src={asset('/images/sahara-flow-v2.webp')} alt={alt} width={1536} height={864} loading="lazy"/><span className="flow-zoom"><Maximize2 size={18}/>{t('Збільшити','Enlarge')}</span></button><figcaption><h3>{t('Пояснення потоків','Flow legend')}</h3>{legend}<p className="visualization-note">{t('Схематична візуалізація за матеріалами виробника.','Conceptual visualization adapted from the manufacturer’s illustration.')}</p></figcaption></figure>
 <Dialog open={open} onOpenChange={setOpen}><DialogContent className="flow-viewer" showCloseButton={false} aria-describedby={undefined}><FlowViewer en={en} alt={alt} legend={legend}/></DialogContent></Dialog>
 </section>;
}

function FlowViewer({en,alt,legend}:{en:boolean;alt:string;legend:ReactNode}) {
 const t=(uk:string,english:string)=>en?english:uk;
 const stage=useRef<HTMLDivElement>(null);
 const drag=useRef<{x:number;y:number;left:number;top:number}|null>(null);
 const [zoom,setZoom]=useState(1.25);
 const [fit,setFit]=useState({width:0,height:0});
 useEffect(()=>{
  const el=stage.current;
  if(!el)return;
  const observer=new ResizeObserver(()=>{
   const width=Math.min(el.clientWidth,el.clientHeight*16/9);
   setFit({width,height:width*9/16});
  });
  observer.observe(el);
  return ()=>observer.disconnect();
 },[]);
 useEffect(()=>{
  const el=stage.current;
  if(el){el.scrollLeft=(el.scrollWidth-el.clientWidth)/2;el.scrollTop=(el.scrollHeight-el.clientHeight)/2;}
 },[zoom,fit]);
 return <>
  <div className="flow-viewer-bar">
   <DialogTitle>{t('SAHARA · Схема потоків','SAHARA · Flow diagram')}</DialogTitle>
   <div className="flow-viewer-controls">
    <button type="button" disabled={zoom<=1} onClick={()=>setZoom(z=>Math.max(1,z-.25))} aria-label={t('Зменшити','Zoom out')}><Minus size={20}/></button>
    <output aria-live="polite">{Math.round(zoom*100)}%</output>
    <button type="button" disabled={zoom>=4} onClick={()=>setZoom(z=>Math.min(4,z+.25))} aria-label={t('Збільшити','Zoom in')}><Plus size={20}/></button>
    <button type="button" className="flow-fit" onClick={()=>setZoom(1)}><Maximize2 size={18}/><span>{t('Вмістити в екран','Fit to screen')}</span></button>
   </div>
   <DialogClose className="modal-close" aria-label={t('Закрити схему','Close diagram')}/>
  </div>
  <div ref={stage} className="flow-viewer-stage" tabIndex={0} role="region" aria-label={t('Схема: перетягніть для перегляду деталей','Diagram: drag to explore details')}
   onPointerDown={e=>{if(e.button!==0||e.pointerType==='touch')return;const el=e.currentTarget;drag.current={x:e.clientX,y:e.clientY,left:el.scrollLeft,top:el.scrollTop};el.setPointerCapture(e.pointerId);}}
   onPointerMove={e=>{const d=drag.current;if(d){e.currentTarget.scrollLeft=d.left+d.x-e.clientX;e.currentTarget.scrollTop=d.top+d.y-e.clientY;}}}
   onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}} onLostPointerCapture={()=>{drag.current=null;}}>
   <div className="flow-viewer-canvas"><Image src={asset('/images/sahara-flow-v2.webp')} alt={alt} width={1536} height={864} draggable={false} style={{width:fit.width?fit.width*zoom:undefined,height:fit.height?fit.height*zoom:undefined,maxWidth:'none'}}/></div>
  </div>
  <details className="flow-viewer-legend"><summary>{t('Пояснення потоків','Flow legend')}<span>{t('Збільшуйте кнопками + / − · Перетягуйте зображення','Zoom with + / − · Drag to explore')}</span></summary>{legend}</details>
 </>;
}
