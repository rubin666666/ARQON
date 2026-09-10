'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { site, asset, localText } from '@/lib/site';
const keys = ['capacity','fuel','efficiency','power','dimensions'] as const;
export function ModelExplorer({en,onCalculate}:{en:boolean;onCalculate:(id:string)=>void}) {
  const [open,setOpen]=useState(false);
  const t=(uk:string,english:string)=>en?english:uk;
  const labels = en ? ['Capacity','Fuel','Energy efficiency','Power','Dimensions'] : ['Продуктивність','Паливо','Енергоефективність','Потужність','Габарити'];
  const available = keys.filter(k=>site.models.some(m=>localText(m[k],en)));
  return <><button className="button button-secondary compare-button" onClick={()=>setOpen(true)}>{t('Порівняти моделі','Compare models')}</button>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="arqon-dialog comparison-dialog" showCloseButton={false}>
      <DialogClose className="modal-close" aria-label={t('Закрити порівняння','Close comparison')}>×</DialogClose>
      <DialogTitle>{t('Порівняння SAHARA','Compare SAHARA')}</DialogTitle>
      <DialogDescription>{available.length ? t('Порівняйте опубліковані характеристики та оберіть модель для розрахунку.','Compare published specifications and choose a model for your calculation.') : t('Характеристики моделей очікують підтвердження ARQON. Поки можна обрати модель для свого сценарію.','Model specifications await ARQON confirmation. You can select a model for your scenario.')}</DialogDescription>
      <div className="comparison-scroll" aria-label={t('Таблиця моделей','Model comparison table')}><table><thead><tr><th scope="col">{t('Параметр','Specification')}</th>{site.models.map(m=><th key={m.id} scope="col">{m.name}</th>)}</tr></thead><tbody>
      {available.map(k=><tr key={k}><th scope="row">{labels[keys.indexOf(k)]}</th>{site.models.map(m=><td key={m.id}>{localText(m[k],en)||'—'}</td>)}</tr>)}
      <tr><th scope="row">{t('Розрахунок','Calculation')}</th>{site.models.map(m=><td key={m.id}><button className="button button-secondary" onClick={()=>{setOpen(false);onCalculate(m.id);}}>{t('Обрати','Select')} {m.name}</button></td>)}</tr></tbody></table></div>
    </DialogContent></Dialog></>;
}
export function ModelDetails({en,id,onClose,onCalculate}:{en:boolean;id:string|null;onClose:()=>void;onCalculate:(id:string)=>void}) {
  const m=site.models.find(m=>m.id===id);
  const t=(uk:string,english:string)=>en?english:uk;
  const labels=en?['Capacity','Fuel','Energy efficiency','Power','Dimensions']:['Продуктивність','Паливо','Енергоефективність','Потужність','Габарити'];
  return <Dialog open={!!m} onOpenChange={v=>{if(!v)onClose();}}><DialogContent className="arqon-dialog model-drawer" showCloseButton={false}>
    <DialogClose className="modal-close" aria-label={t('Закрити подробиці','Close details')}>×</DialogClose>
    <DialogTitle>{m?.name}</DialogTitle><DialogDescription>{m ? localText(m.description,en)||t('Модель лінійки зерносушарок ARQON.','A model in the ARQON grain dryer range.') : ''}</DialogDescription>
    {m && <><Image width={1024} height={1024} src={asset(m.image||'/sahara.jpg')} alt={m.image?m.name:t('Спільна концептуальна ілюстрація серії','Shared series concept illustration')} />
    {keys.some(k=>localText(m[k],en)) ? <dl className="model-specs">{keys.filter(k=>localText(m[k],en)).map(k=><div key={k}><dt>{labels[keys.indexOf(k)]}</dt><dd>{localText(m[k],en)}</dd></div>)}</dl> : <p>{t('Технічні характеристики та комплектацію буде опубліковано після підтвердження виробником.','Technical specifications and equipment will be published after manufacturer confirmation.')}</p>}
    {localText(m.equipment,en)&&<p>{localText(m.equipment,en)}</p>}
    {m.datasheet && <a className="button button-secondary" href={asset(m.datasheet)} target="_blank" rel="noreferrer">{t('Технічний PDF','Technical PDF')}</a>}
    <button className="button" onClick={()=>{onClose();onCalculate(m.id);}}>{t('Розрахувати для','Calculate for')} {m.name}</button></>}
  </DialogContent></Dialog>;
}
