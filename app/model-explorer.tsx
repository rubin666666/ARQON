'use client';
import {useState, type ComponentProps} from 'react';
import {ModelExplorer as Gallery,ModelDetails as Details} from './model-explorer-content';
export function ModelExplorer(props:ComponentProps<typeof Gallery>) {
  const [localOpen,setLocalOpen]=useState(false);
  const [loaded,setLoaded]=useState(false);
  const open=props.open??localOpen;
  if(open&&!loaded)setLoaded(true);
  const setOpen=(value:boolean)=>{setLocalOpen(value);props.onOpenChange?.(value);};
  return <><button type="button" className="button button-secondary compare-button" aria-haspopup="dialog" aria-controls="model-gallery" aria-expanded={open} onClick={event=>{event.currentTarget.focus();setLoaded(true);setOpen(true);}}>{props.en?'Model gallery':'Галерея моделей'}</button>
    {(open||loaded)&&<Gallery {...props} open={open} onOpenChange={setOpen}/>}</>;
}
export function ModelDetails(props:ComponentProps<typeof Details>) {
  return props.id?<Details {...props}/>:null;
}
