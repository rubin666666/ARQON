'use client';
import { useRef, useState } from 'react';
import { ModelPhoto } from './model-photo';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { site, asset, localText } from '@/lib/site';

export function ModelExplorer({en,onCalculate,open: controlledOpen,onOpenChange,initialModelId}: {en:boolean;onCalculate:(id:string)=>void;open?:boolean;onOpenChange?: (open:boolean)=>void;initialModelId?:string|null}) {
  const scrollBody=useRef<HTMLDivElement|null>(null);
  const scrollPosition=useRef(0);
  const previousTarget=useRef<string|null|undefined>(undefined);
  const rememberPosition=()=>{if(scrollBody.current)scrollPosition.current=scrollBody.current.scrollTop;};
  const restorePosition=()=>{requestAnimationFrame(()=>{if(scrollBody.current)scrollBody.current.scrollTop=scrollPosition.current;});};
  const selectedCard=useRef<HTMLElement|null>(null);
  const [compareIds,setCompareIds]=useState<string[]>([]);
  const [comparisonOpen,setComparisonOpen]=useState(false);
  const compared=site.models.filter(m=>compareIds.includes(m.id));
  const [detailId,setDetailId]=useState<string|null>(null);
  const [localOpen,setLocalOpen]=useState(false);
  const open=controlledOpen ?? localOpen;
  const setOpen=(value:boolean)=>{if(!value)rememberPosition();setLocalOpen(value);onOpenChange?.(value);};
  const t=(uk:string,english:string)=>en?english:uk;
  return <><button type="button" className="button button-secondary compare-button" onClick={()=>setOpen(true)}>{t('Галерея моделей','Model gallery')}</button>
    <Dialog open={open} onOpenChange={setOpen} onOpenChangeComplete={value=>{if(value){if(initialModelId&&initialModelId!==previousTarget.current){selectedCard.current?.scrollIntoView({block:'start',behavior:'instant'});previousTarget.current=initialModelId;}else restorePosition();}}}><DialogContent id="model-gallery" className="arqon-dialog gallery-dialog" showCloseButton={false}>
      <div className="model-dialog-header"><DialogClose className="modal-close" aria-label={t('Закрити галерею','Close gallery')}>×</DialogClose>
      <DialogTitle>{t('Моделі SAHARA','SAHARA models')}</DialogTitle>
      <DialogDescription>{t('Оберіть модель, перегляньте доступні характеристики та відкрийте розрахунок.','Choose a model, review available specifications, and open the calculator.')}</DialogDescription>
      </div><div className="model-dialog-scroll" ref={scrollBody} onClickCapture={rememberPosition}><fieldset className="model-comparison-picker"><legend>{t('Оберіть 2–3 моделі для порівняння','Select 2–3 models to compare')}</legend><div>{site.models.map(m=><label key={m.id}><input type="checkbox" checked={compareIds.includes(m.id)} disabled={compareIds.length===3&&!compareIds.includes(m.id)} onChange={event=>setCompareIds(ids=>event.target.checked?[...ids,m.id]:ids.filter(id=>id!==m.id))}/>{m.name}</label>)}</div><button type="button" className="button button-secondary" disabled={compareIds.length<2} onClick={()=>setComparisonOpen(true)}>{t('Порівняти характеристики','Compare specifications')} ({compareIds.length}/3)</button></fieldset>
      <div className="gallery-grid">
        {site.models.map(m=><article className="gallery-card" key={m.id} ref={m.id===initialModelId?selectedCard:undefined}>
          <ModelPhoto name={m.name} src={m.image} en={en} onReturn={restorePosition} />
          <div className="gallery-card-copy"><h3>{m.name}</h3><dl>{m.specifications.slice(0,3).map(spec=><div key={spec.id}><dt>{localText(spec.label,en)}</dt><dd>{localText(spec.value,en)}</dd></div>)}</dl><button type="button" className="text-link" onClick={()=>setDetailId(m.id)}>{t("Усі характеристики","All specifications")}</button><button type="button" className="button" onClick={()=>{setOpen(false);onCalculate(m.id);}}>{t('Розрахувати','Calculate')} {m.name}</button></div>
        </article>)}
      </div>
      </div><Dialog open={comparisonOpen} onOpenChange={setComparisonOpen} onOpenChangeComplete={value=>{if(!value)restorePosition();}}><DialogContent className="arqon-dialog model-comparison-dialog" showCloseButton={false}><div className="model-dialog-header"><DialogClose className="modal-close" aria-label={t('Закрити порівняння','Close comparison')}>×</DialogClose><DialogTitle>{t('Порівняння моделей','Model comparison')}</DialogTitle><DialogDescription>{t('Характеристики виробника для зазначених режимів сушіння. На телефоні таблицю можна гортати горизонтально.','Manufacturer specifications for the stated drying regimes. Swipe the table horizontally on mobile.')}</DialogDescription></div><div className="model-dialog-scroll"><section className="spec-comparison-scroll" aria-label={t('Таблиця характеристик','Specifications table')}><table><thead><tr><th>{t('Характеристика','Specification')}</th>{compared.map(m=><th key={m.id}>{m.name}</th>)}</tr></thead><tbody>{Array.from(new Map(compared.flatMap(m=>m.specifications.map(spec=>[spec.id,spec] as const))).values()).map(spec=><tr key={spec.id}><th scope="row">{localText(spec.label,en)}</th>{compared.map(m=><td key={m.id}>{localText(m.specifications.find(s=>s.id===spec.id)?.value??{uk:'—',en:'—'},en)}</td>)}</tr>)}<tr><th>{t('Розрахунок сезону','Season calculation')}</th>{compared.map(m=><td key={m.id}><button className="button" type="button" onClick={()=>{setComparisonOpen(false);setOpen(false);onCalculate(m.id);}}>{t('Розрахувати','Calculate')} {m.name}</button></td>)}</tr></tbody></table></section><details className="calculator-help"><summary>{t('Як читати продуктивність?','How to read capacity?')}</summary><p>{t('т/год сухого зерна — маса зерна після сушіння за одну годину. Порівнюйте моделі для однакової культури, початкової та кінцевої вологості й температури повітря, зазначених у рядку.','t/h dried grain is the mass after drying per hour. Compare models at the same crop, incoming and final moisture, and air temperature stated in the row.')}</p></details></div></DialogContent></Dialog>
    <ModelDetails en={en} onReturn={restorePosition} id={detailId} onClose={()=>setDetailId(null)} onCalculate={id=>{setDetailId(null);setOpen(false);onCalculate(id);}}/></DialogContent></Dialog></>;
}
export function ModelDetails({en,id,onClose,onCalculate,onReturn}:{en:boolean;id:string|null;onClose:()=>void;onCalculate:(id:string)=>void;onReturn?:()=>void}) {
  const m=site.models.find(m=>m.id===id);
  const t=(uk:string,english:string)=>en?english:uk;
  return <Dialog open={!!m} onOpenChangeComplete={value=>{if(!value)onReturn?.();}} onOpenChange={v=>{if(!v)onClose();}}><DialogContent className="arqon-dialog model-drawer" showCloseButton={false}>
    <div className="model-dialog-header"><DialogClose className="modal-close" aria-label={t('Закрити подробиці','Close details')}>×</DialogClose>
    <DialogTitle>{m?.name}</DialogTitle><DialogDescription>{m ? localText(m.description,en)||t('Модель лінійки зерносушарок ARQON.','A model in the ARQON grain dryer range.') : ''}</DialogDescription>
    </div><div className="model-dialog-scroll">{m && <><ModelPhoto name={m.name} src={m.image} en={en} />
    <dl className="model-specs">{m.specifications.map(spec=><div key={spec.id}><dt>{localText(spec.label,en)}</dt><dd>{localText(spec.value,en)}</dd></div>)}</dl>
    {localText(m.equipment,en)&&<p>{localText(m.equipment,en)}</p>}
    {m.datasheet && <a className="button button-secondary" href={asset(m.datasheet)} target="_blank" rel="noreferrer">{t('Технічний PDF','Technical PDF')}</a>}
    <button className="button" onClick={()=>{onClose();onCalculate(m.id);}}>{t('Розрахувати для','Calculate for')} {m.name}</button></>}
  </div></DialogContent></Dialog>;
}
