'use client';
import {useState, type ComponentProps} from 'react';
import {retryable,LoadingPanel} from '@/components/retryable-content';
import {Dialog,DialogContent,DialogTitle,DialogClose} from '@/components/ui/dialog';
const Gallery=retryable<ComponentProps<typeof import('./model-explorer-content').ModelExplorer>>(()=>import('./model-explorer-content').then(m=>({default:m.ModelExplorer})),'model-explorer-content','ModelExplorer');
const Details=retryable<ComponentProps<typeof import('./model-explorer-content').ModelDetails>>(()=>import('./model-explorer-content').then(m=>({default:m.ModelDetails})),'model-explorer-content','ModelDetails');
function PendingDialog({open,onClose,en,error,retry,details=false}:{open:boolean;onClose:()=>void;en:boolean;error:boolean;retry:()=>void;details?:boolean}) {
 return <Dialog open={open} onOpenChange={value=>{if(!value)onClose();}}><DialogContent className={`arqon-dialog ${details?'model-drawer':'gallery-dialog'}`} showCloseButton={false} finalFocus={false} aria-describedby={undefined}><div className="model-dialog-header"><DialogClose className="modal-close" aria-label={en?(details?'Close details':'Close gallery'):'Закрити'}>×</DialogClose><DialogTitle>{details?(en?'Model specifications':'Характеристики моделі'):(en?'SAHARA models':'Моделі SAHARA')}</DialogTitle></div><LoadingPanel en={en} error={error} retry={retry}/></DialogContent></Dialog>;
}
export function ModelExplorer(props:ComponentProps<typeof Gallery>) {
  const [localOpen,setLocalOpen]=useState(false);
  const [loaded,setLoaded]=useState(false);
  const open=props.open??localOpen;
  if(open&&!loaded)setLoaded(true);
  const setOpen=(value:boolean)=>{setLocalOpen(value);props.onOpenChange?.(value);};
  return <><button type="button" className="button button-secondary compare-button" aria-haspopup="dialog" aria-controls="model-gallery" aria-expanded={open} onClick={event=>{event.currentTarget.focus();setLoaded(true);setOpen(true);}}>{props.en?'Model gallery':'Галерея моделей'}</button>
    {(open||loaded)&&<Gallery {...props} open={open} onOpenChange={setOpen} loadingFallback={(error,retry)=><PendingDialog open={open} onClose={()=>setOpen(false)} en={props.en} error={error} retry={retry}/>}/>}</>;
}
export function ModelDetails(props:ComponentProps<typeof Details>) {
  return props.id?<Details {...props} loadingFallback={(error,retry)=><PendingDialog details open={!!props.id} onClose={props.onClose} en={props.en} error={error} retry={retry}/>}/>:null;
}
