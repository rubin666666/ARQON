'use client';
import {useState,useSyncExternalStore,type ReactNode} from 'react';
const query='(max-width: 760px)';
const subscribe=(notify:()=>void)=>{const media=window.matchMedia(query);media.addEventListener('change',notify);return()=>media.removeEventListener('change',notify);};
const snapshot=()=>window.matchMedia(query).matches;
export function CompactDisclosure({label,className,children}:{label:string;className:string;children:ReactNode}){
 const compact=useSyncExternalStore(subscribe,snapshot,()=>false);
 const [expanded,setExpanded]=useState(false);
 return <details className={`compact-disclosure ${className}`} open={!compact||expanded} onToggle={event=>{if(compact)setExpanded(event.currentTarget.open);}}><summary>{label}</summary><div>{children}</div></details>;
}
