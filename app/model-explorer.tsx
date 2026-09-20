'use client';
import { useState } from 'react';
import { ModelPhoto } from './model-photo';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { site, asset, localText } from '@/lib/site';

export function ModelExplorer({en,onCalculate,open: controlledOpen,onOpenChange}: {en:boolean;onCalculate:(id:string)=>void;open?:boolean;onOpenChange?: (open:boolean)=>void}) {
  const [detailId,setDetailId]=useState<string|null>(null);
  const [localOpen,setLocalOpen]=useState(false);
  const open=controlledOpen ?? localOpen;
  const setOpen=(value:boolean)=>{setLocalOpen(value);onOpenChange?.(value);};
  const t=(uk:string,english:string)=>en?english:uk;
  return <><button type="button" className="button button-secondary compare-button" onClick={()=>setOpen(true)}>{t('Галерея моделей','Model gallery')}</button>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent id="model-gallery" className="arqon-dialog gallery-dialog" showCloseButton={false}>
      <DialogClose className="modal-close" aria-label={t('Закрити галерею','Close gallery')}>×</DialogClose>
      <DialogTitle>{t('Моделі SAHARA','SAHARA models')}</DialogTitle>
      <DialogDescription>{t('Оберіть модель, перегляньте доступні характеристики та відкрийте розрахунок.','Choose a model, review available specifications, and open the calculator.')}</DialogDescription>
      <div className="gallery-grid">
        {site.models.map(m=><article className="gallery-card" key={m.id}>
          <ModelPhoto name={m.name} src={m.image} en={en} />
          <div className="gallery-card-copy"><h3>{m.name}</h3><dl>{m.specifications.slice(0,3).map(spec=><div key={spec.id}><dt>{localText(spec.label,en)}</dt><dd>{localText(spec.value,en)}</dd></div>)}</dl><button type="button" className="text-link" onClick={()=>setDetailId(m.id)}>{t("Усі характеристики","All specifications")}</button><button type="button" className="button" onClick={()=>{setOpen(false);onCalculate(m.id);}}>{t('Розрахувати','Calculate')} {m.name}</button></div>
        </article>)}
      </div>
    <ModelDetails en={en} id={detailId} onClose={()=>setDetailId(null)} onCalculate={id=>{setDetailId(null);setOpen(false);onCalculate(id);}}/></DialogContent></Dialog></>;
}
export function ModelDetails({en,id,onClose,onCalculate}:{en:boolean;id:string|null;onClose:()=>void;onCalculate:(id:string)=>void}) {
  const m=site.models.find(m=>m.id===id);
  const t=(uk:string,english:string)=>en?english:uk;
  return <Dialog open={!!m} onOpenChange={v=>{if(!v)onClose();}}><DialogContent className="arqon-dialog model-drawer" showCloseButton={false}>
    <DialogClose className="modal-close" aria-label={t('Закрити подробиці','Close details')}>×</DialogClose>
    <DialogTitle>{m?.name}</DialogTitle><DialogDescription>{m ? localText(m.description,en)||t('Модель лінійки зерносушарок ARQON.','A model in the ARQON grain dryer range.') : ''}</DialogDescription>
    {m && <><ModelPhoto name={m.name} src={m.image} en={en} />
    <dl className="model-specs">{m.specifications.map(spec=><div key={spec.id}><dt>{localText(spec.label,en)}</dt><dd>{localText(spec.value,en)}</dd></div>)}</dl>
    {localText(m.equipment,en)&&<p>{localText(m.equipment,en)}</p>}
    {m.datasheet && <a className="button button-secondary" href={asset(m.datasheet)} target="_blank" rel="noreferrer">{t('Технічний PDF','Technical PDF')}</a>}
    <button className="button" onClick={()=>{onClose();onCalculate(m.id);}}>{t('Розрахувати для','Calculate for')} {m.name}</button></>}
  </DialogContent></Dialog>;
}
