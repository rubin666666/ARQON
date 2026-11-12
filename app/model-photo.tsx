'use client';
import { useState } from 'react';
import Image from 'next/image';
import { GalleryImage } from './gallery-image';
import { Dialog, DialogContent, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { asset } from '@/lib/site';

export function ModelPhoto({ name, src, en, onReturn }: { name: string; src: string; en: boolean; onReturn?:()=>void }) {
  const [open, setOpen] = useState(false);
  const [index,setIndex]=useState(0);
  const previewSrc = asset('/sahara-hero.webp');
  const fullSrc = asset(src || '/images/sahara-product-v2.webp');
  const images=[
    {src:previewSrc,label:en?'Outline illustration · SAHARA series':'Контурна ілюстрація · Серія SAHARA',description:en?'General exterior view of the dryer, shown as an outline illustration.':'Загальний зовнішній вигляд сушарки у вигляді контурної ілюстрації.'},
    {src:fullSrc,label:src?`${en?'General view':'Загальний вигляд'} · ${name}`:(en?'General view · SAHARA series':'Загальний вигляд · Серія SAHARA'),description:en?'Exterior view of the dryer housing and its equipment.':'Зовнішній вигляд корпусу сушарки та її обладнання.'}
  ];
  const seriesNote=en?'Shared illustration of the SAHARA series, not a separate image of the selected model.':'Спільне зображення серії SAHARA, а не окреме зображення обраної моделі.';
  const move=(direction:number)=>setIndex(i=>(i+direction+images.length)%images.length);
  return <>
    <button type="button" className="model-photo" aria-label={`${en ? 'Enlarge image' : 'Збільшити зображення'} ${name}`} onClick={event => {event.currentTarget.focus();setIndex(0);setOpen(true);}}>
      <Image width={1024} height={1024} src={previewSrc} alt={images[0].label} loading="lazy" />
      <span className="model-photo-caption">{images[0].label}</span>
      <span className="model-photo-hint" aria-hidden="true">↗</span>
    </button>
    <Dialog open={open} onOpenChange={setOpen} onOpenChangeComplete={value=>{if(!value)onReturn?.();}}>
      <DialogContent className="model-photo-viewer translate-x-0 translate-y-0" showCloseButton={false} aria-describedby={undefined} onKeyDown={event=>{if(event.altKey||event.ctrlKey||event.metaKey||event.shiftKey)return;if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();move(event.key==='ArrowRight'?1:-1);}}} onClick={(event) => { if (event.target === event.currentTarget || (event.target instanceof HTMLElement && event.target.classList.contains('model-photo-stage'))) setOpen(false); }}>
        <DialogTitle>{name} · {images[index].label}</DialogTitle>
        <DialogClose className="model-photo-close" aria-label={en ? 'Close image' : 'Закрити зображення'}>×</DialogClose>
        <div className="model-photo-stage"><GalleryImage key={images[index].src} src={images[index].src} alt={images[index].label} outline={index===0} en={en} onNavigate={move}/>
        </div><div className="photo-footer"><div className="photo-explanation"><p>{images[index].description}</p>{(index===0||!src)&&<p className="photo-series-note">{seriesNote}</p>}</div><div className="photo-navigation"><button className="button button-secondary" type="button" onClick={()=>move(-1)} aria-label={en?'Previous image':'Попереднє зображення'}>←</button><fieldset className="photo-thumbnails" aria-label={en?'Choose image':'Вибрати зображення'}>{images.map((image,i)=><button type="button" key={image.src} className="photo-thumbnail" aria-label={`${en?'Show':'Показати'}: ${image.label}`} aria-pressed={index===i} title={image.label} onClick={()=>setIndex(i)}><Image src={image.src} alt="" width={80} height={56} className={i===0?'series-outline':undefined}/><span>{i===0?(en?'Outline':'Контур'):(en?'View':'Вигляд')}</span></button>)}</fieldset><output aria-live="polite">{index+1} / {images.length}</output><button className="button button-secondary" type="button" onClick={()=>move(1)} aria-label={en?'Next image':'Наступне зображення'}>→</button></div></div>
      </DialogContent>
    </Dialog>
  </>;
}
