'use client';
import {useEffect,useRef,useState} from 'react';
import {localText,localeUrl,type Localized} from '@/lib/site';

export function FaqItem({question,answer,en}:{question:Localized;answer:Localized;en:boolean}){
 const id='faq-'+question.en.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/-$/,'');
 const details=useRef<HTMLDetailsElement>(null);
 const [shared,setShared]=useState<{url:string;copied:boolean}|null>(null);
 useEffect(()=>{
  let frame=0;
  const reveal=()=>{if(location.hash!=='#'+id)return;cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{if(details.current){details.current.open=true;details.current.scrollIntoView({block:'start',behavior:'instant'});details.current.querySelector('summary')?.focus({preventScroll:true});}});};
  reveal();window.addEventListener('hashchange',reveal);
  return ()=>{cancelAnimationFrame(frame);window.removeEventListener('hashchange',reveal);};
 },[id]);
 async function share(){
  const url=new URL(localeUrl(en),location.origin);url.hash=id;
  let copied=false;try{await navigator.clipboard.writeText(url.href);copied=true;}catch{/* Keep the URL available for manual copying. */}
  setShared({url:url.href,copied});
 }
 return <details id={id} ref={details}><summary>{localText(question,en)}</summary><p>{localText(answer,en)}</p><div className="faq-share"><button type="button" className="text-link" onClick={()=>{void share();}}>{en?'Copy link to question':'Скопіювати посилання на запитання'}</button>{shared&&<><output>{shared.copied?(en?'Link copied':'Посилання скопійовано'):(en?'Copy this link':'Скопіюйте посилання')}</output>{!shared.copied&&<input readOnly aria-label={en?'Question link':'Посилання на запитання'} value={shared.url} onFocus={event=>event.currentTarget.select()}/>}</>}</div></details>;
}
