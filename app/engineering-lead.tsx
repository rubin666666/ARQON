'use client';
import { useRef, useState } from 'react';
import { site, localText, track } from '@/lib/site';
import type { EngineeringInput } from '@/lib/engineering-types';
function object(value: unknown): Record<string,unknown> {if(!value || typeof value!=='object' || Array.isArray(value))throw new Error('Invalid response');return value as Record<string,unknown>;}
export function EngineeringLead({input,en}:{input:EngineeringInput;en:boolean}) {
  const t=(uk:string,english:string)=>en?english:uk;
  const [channel,setChannel]=useState('email');
  const [consent,setConsent]=useState(false),[marketing,setMarketing]=useState(false);
  const [busy,setBusy]=useState(false),[message,setMessage]=useState('');
  const [saved,setSaved]=useState(false);
  const session=useRef<{id:string;token:string;key:string}|null>(null);
  const lock=useRef(false);
  const base=site.calculationEndpoint.replace(/\/$/,'');
  async function call(path:string,body:unknown,token?:string) {
    const response=await fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:JSON.stringify(body),signal:AbortSignal.timeout(60000)});
    if(!response.ok)throw new Error('Request failed');return response;
  }
  async function submit(event:React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();if(lock.current||!consent)return;
    lock.current=true;setBusy(true);setMessage('');
    const form=new FormData(event.currentTarget);
    const field=(key:string)=>{const value=form.get(key);return typeof value==='string'?value.trim():'';};
    const contact={name:field('name'),email:field('email'),phone:field('phone'),preferredChannel:channel};
    try {
      const key=JSON.stringify({input,en,contact,marketing});
      if(!session.current||session.current.key!==key) {
        const response=await call('/api/calculations',{input,locale:en?'en':'uk'}),json=object(await response.json());
        if(typeof json.calculationId!=='string'||typeof json.accessToken!=='string')throw new Error('Missing calculation');
        session.current={id:json.calculationId,token:json.accessToken,key};
      }
      const source:Record<string,string>={landing_page:location.origin+location.pathname,referrer:document.referrer.split('?')[0]};
      const params=new URLSearchParams(location.search);for(const key of ['utm_source','utm_medium','utm_campaign'])source[key]=params.get(key)||'';
      const response=await call('/api/leads',{calculationId:session.current.id,contact,reportConsent:true,marketingConsent:marketing,company:field('company'),source},session.current.token);
      const result=object(await response.json());if(result.accepted!==true)throw new Error('Not accepted');
      setSaved(true);
      setMessage(!result.crmDelivered?t('Заявку збережено. Передача менеджеру ще не підтверджена; спробуйте повторити надсилання.','Enquiry saved. Delivery to the sales team is not confirmed; retry sending.'):channel==='email'&&!result.emailDelivered?t('Заявку збережено, але надсилання email ще не підтверджено. PDF можна завантажити нижче.','Enquiry saved, but email delivery is not confirmed. You can download the PDF below.'):channel==='email'?t('Заявку збережено. PDF передано сервісу надсилання на ваш email.','Enquiry saved. The PDF has been passed to the email delivery service.'):t('Заявку збережено для зв’язку менеджера. PDF можна завантажити нижче.','Enquiry saved for the sales team to contact you. Download the PDF below.'));
      track('generate_lead',{model:input.modelId,channel});
    }catch{setMessage(t('Не вдалося підтвердити надсилання. Перевірте контакти та спробуйте ще раз.','Could not confirm submission. Check your contact details and retry.'));}finally{lock.current=false;setBusy(false);}
  }
  async function download() {
    if(!session.current||lock.current)return;lock.current=true;setBusy(true);
    try {const response=await call('/api/calculations/report',{calculationId:session.current.id},session.current.token);const blob=await response.blob();const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='ARQON-personal-report.pdf';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}catch{setMessage(t('Не вдалося завантажити PDF. Спробуйте ще раз.','Unable to download PDF. Please retry.'));}finally{lock.current=false;setBusy(false);}
  }
  return <form className="engineering-lead" onSubmit={submit}>
    <p>{t('Збережемо ваш розрахунок разом із заявкою. Достатньо одного обраного каналу зв’язку.','We will save your calculation with the enquiry. Only the selected contact channel is required.')}</p>
    <label className="field">{t('Ім’я','Name')}<input name="name" required minLength={2} maxLength={100} autoComplete="name"/></label>
    <label className="field">{t('Канал зв’язку','Contact channel')}<select value={channel} onChange={e=>setChannel(e.target.value)}><option value="email">Email</option><option value="phone">{t('Телефон — зв’язок менеджера','Phone — sales team contact')}</option></select></label>
    <label className="field">Email<input name="email" type="email" required={channel==='email'} maxLength={254} autoComplete="email"/></label>
    <label className="field">{t('Телефон','Phone')}<input name="phone" type="tel" required={channel==='phone'} maxLength={30} autoComplete="tel" placeholder="+380…"/></label>
    <label hidden aria-hidden="true">Company<input name="company" tabIndex={-1} autoComplete="off"/></label>
    <label className="engineering-toggle"><input type="checkbox" checked={consent} required onChange={e=>setConsent(e.target.checked)}/><span>{t('Погоджуюся на використання контактів для надсилання розрахунку та зв’язку щодо обладнання.','I agree to use of my contact details for report delivery and equipment enquiries.')}</span></label>
    <details className="engineering-details"><summary>{t('Політика конфіденційності','Privacy policy')}</summary><p>{localText(site.privacy,en)}</p></details>
    <label className="engineering-toggle"><input type="checkbox" checked={marketing} onChange={e=>setMarketing(e.target.checked)}/><span>{t('Хочу отримувати новини та пропозиції (необов’язково).','Send me news and offers (optional).')}</span></label>
    <button className="button" disabled={busy||!consent}>{busy?t('Надсилаємо…','Sending…'):t('Отримати персональний PDF','Get personalized PDF')}</button>
    {message&&<output>{message}</output>}
    {saved&&<button type="button" className="button button-secondary" disabled={busy} onClick={download}>{t('Завантажити персональний PDF','Download personalized PDF')}</button>}
  </form>;
}
