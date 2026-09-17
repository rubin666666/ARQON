'use client';
import {useId,useState,type ReactNode} from 'react';
import {ChevronDown} from 'lucide-react';

/** Collapsible only on mobile; desktop copy remains fully visible. */
export function MobileDisclosure({title,children,level=3}:{title:ReactNode;children:ReactNode;level?:2|3}){
 const [expanded,setExpanded]=useState(false),id=useId();
 const Heading=level===2?'h2':'h3';
 return <div className="mobile-disclosure"><Heading className="mobile-disclosure-heading"><span className="disclosure-desktop-title">{title}</span><button type="button" className="disclosure-mobile-button" aria-expanded={expanded} aria-controls={id} onClick={()=>setExpanded(v=>!v)}><span>{title}</span><ChevronDown size={20}/></button></Heading><div className="mobile-disclosure-content" id={id} data-expanded={expanded}>{children}</div></div>;
}
