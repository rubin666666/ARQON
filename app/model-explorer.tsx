'use client';
import { useState } from 'react';
import { ModelPhoto } from './model-photo';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { site, asset, localText } from '@/lib/site';

export function ModelExplorer({en,onCalculate}:{en:boolean;onCalculate:(id:string)=>void}) {
  const [open,setOpen]=useState(false);
  const t=(uk:string,english:string)=>en?english:uk;
  const available = site.models[0].specifications;
  return <><button className="button button-secondary compare-button" onClick={()=>setOpen(true)}>{t('Порівняти моделі','Compare models')}</button>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="arqon-dialog comparison-dialog" showCloseButton={false}>
      <DialogClose className="modal-close" aria-label={t('Закрити порівняння','Close comparison')}>×</DialogClose>
      <DialogTitle>{t('Порівняння SAHARA','Compare SAHARA')}</DialogTitle>
      <DialogDescription>{available.length ? t('Порівняйте опубліковані характеристики та оберіть модель для розрахунку.','Compare published specifications and choose a model for your calculation.') : t('Характеристики моделей очікують підтвердження ARQON. Поки можна обрати модель для свого сценарію.','Model specifications await ARQON confirmation. You can select a model for your scenario.')}</DialogDescription>
      <div className="comparison-scroll" aria-label={t('Таблиця моделей','Model comparison table')}><table><thead><tr><th scope="col">{t('Параметр','Specification')}</th>{site.models.map(m=><th key={m.id} scope="col">{m.name}</th>)}</tr></thead><tbody>
      {available.map(spec=><tr key={spec.id}><th scope="row">{localText(spec.label,en)}</th>{site.models.map(m=><td key={m.id}>{localText(m.specifications.find(s=>s.id===spec.id)!.value,en)}</td>)}</tr>)}
      <tr><th scope="row">{t('Розрахунок','Calculation')}</th>{site.models.map(m=><td key={m.id}><button className="button button-secondary" onClick={()=>{setOpen(false);onCalculate(m.id);}}>{t('Обрати','Select')} {m.name}</button></td>)}</tr></tbody></table></div>
    </DialogContent></Dialog></>;
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
