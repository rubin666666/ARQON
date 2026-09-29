'use client';
import { useRef, useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { asset } from '@/lib/site';

export function ModelPhoto({ name, src, en }: { name: string; src: string; en: boolean }) {
  const [open, setOpen] = useState(false);
  const [index,setIndex]=useState(0);
  const touchStart=useRef<{x:number;y:number}|null>(null);
  const previewSrc = asset('/sahara-hero.png');
  const fullSrc = asset(src || '/images/sahara-product-v2.webp');
  const images=[{src:previewSrc,label:en?'Technical series illustration':'Технічна ілюстрація серії'},{src:fullSrc,label:src?name:(en?'SAHARA series photo':'Фото серії SAHARA')}];
  const move=(direction:number)=>setIndex(i=>(i+direction+images.length)%images.length);
  return <>
    <button type="button" className="model-photo" aria-label={`${en ? 'Enlarge image' : 'Збільшити зображення'} ${name}`} onClick={() => {setIndex(0);setOpen(true);}}>
      <Image width={1024} height={1024} src={previewSrc} alt={`${name} — ${en ? 'technical series illustration' : 'технічна ілюстрація серії'}`} loading="lazy" />
      <span className="model-photo-hint" aria-hidden="true">↗</span>
    </button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="model-photo-viewer translate-x-0 translate-y-0" showCloseButton={false} aria-describedby={undefined} onClick={(event) => { if (event.target === event.currentTarget || (event.target instanceof HTMLElement && event.target.classList.contains('model-photo-stage'))) setOpen(false); }}>
        <DialogTitle>{name} · {images[index].label}</DialogTitle>
        <DialogClose className="model-photo-close" aria-label={en ? 'Close image' : 'Закрити зображення'}>×</DialogClose>
        <div className="model-photo-stage" onTouchStart={event=>{if(event.touches.length===1)touchStart.current={x:event.touches[0].clientX,y:event.touches[0].clientY};else touchStart.current=null;}} onTouchEnd={event=>{const start=touchStart.current;touchStart.current=null;if(!start)return;const dx=event.changedTouches[0].clientX-start.x,dy=event.changedTouches[0].clientY-start.y;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5)move(dx<0?1:-1);}} onTouchCancel={()=>{touchStart.current=null;}}>
           <Image width={1024} height={1024} src={images[index].src} alt={images[index].label} className={index===0?'series-outline':undefined} />
        </div><div className="photo-navigation"><button className="button button-secondary" type="button" onClick={()=>move(-1)} aria-label={en?'Previous image':'Попереднє зображення'}>←</button><output aria-live="polite">{index+1} / {images.length}</output><button className="button button-secondary" type="button" onClick={()=>move(1)} aria-label={en?'Next image':'Наступне зображення'}>→</button></div>
      </DialogContent>
    </Dialog>
  </>;
}
