'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { asset } from '@/lib/site';

export function ModelPhoto({ name, src, en }: { name: string; src: string; en: boolean }) {
  const [open, setOpen] = useState(false);
  const previewSrc = asset('/sahara-contour.png');
  const fullSrc = asset(src || '/images/sahara-product-v2.webp');
  return <>
    <button type="button" className="model-photo" aria-label={`${en ? 'Enlarge image' : 'Збільшити зображення'} ${name}`} onClick={() => setOpen(true)}>
      <Image width={1024} height={1024} src={previewSrc} alt={`${name} — ${en ? 'technical series illustration' : 'технічна ілюстрація серії'}`} loading="lazy" />
      <span className="model-photo-hint" aria-hidden="true">↗</span>
    </button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="model-photo-viewer translate-x-0 translate-y-0" showCloseButton={false} aria-describedby={undefined} onClick={(event) => { if (event.target === event.currentTarget || (event.target instanceof HTMLElement && event.target.classList.contains('model-photo-stage'))) setOpen(false); }}>
        <DialogTitle>{name}</DialogTitle>
        <DialogClose className="model-photo-close" aria-label={en ? 'Close image' : 'Закрити зображення'}>×</DialogClose>
        <div className="model-photo-stage">
           <Image width={1024} height={1024} src={fullSrc} alt={name} />
        </div>
      </DialogContent>
    </Dialog>
  </>;
}
