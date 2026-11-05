'use client';
import {lazy, Suspense, useState, type ComponentProps} from 'react';
const Gallery=lazy(()=>import('./model-explorer-content').then(m=>({default:m.ModelExplorer})));
const Details=lazy(()=>import('./model-explorer-content').then(m=>({default:m.ModelDetails})));
export function ModelExplorer(props:ComponentProps<typeof Gallery>) {
  const [localOpen,setLocalOpen]=useState(false);
  const [loaded,setLoaded]=useState(false);
  const open=props.open??localOpen;
  if(open&&!loaded)setLoaded(true);
  const setOpen=(value:boolean)=>{setLocalOpen(value);props.onOpenChange?.(value);};
  return <><button type="button" className="button button-secondary compare-button" aria-haspopup="dialog" aria-controls="model-gallery" aria-expanded={open} onClick={event=>{event.currentTarget.focus();setLoaded(true);setOpen(true);}}>{props.en?'Model gallery':'Галерея моделей'}</button>
    {(open||loaded)&&<Suspense fallback={<output>{props.en?'Loading…':'Завантаження…'}</output>}><Gallery {...props} open={open} onOpenChange={setOpen}/></Suspense>}</>;
}
export function ModelDetails(props:ComponentProps<typeof Details>) {
  return props.id?<Suspense fallback={<output>{props.en?'Loading…':'Завантаження…'}</output>}><Details {...props}/></Suspense>:null;
}
