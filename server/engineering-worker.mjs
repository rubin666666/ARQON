/** Deploy separately from Pages; all secrets stay in worker bindings. */
import data from '../config/engineering.json' with {type:'json'};
import {calculateEngineering} from '../lib/engineering.mjs';
import {createEngineeringReport} from '../lib/engineering-report.mjs';

const inputKeys=['modelId','cropId','volume','initialMoisture','finalMoisture','fuelId','fuelPrice','electricityPrice','serviceEnabled','serviceVolume','serviceTariff','elevatorTariff','elevatorBasis','elevatorOtherPerTonne','ownOtherPerTonne','delayedSale','currentGrainPrice','futureGrainPrice','dryerPrice','installation','additionalInvestment','availableHours'];
const optionalInputKeys=['ambientTemperature','operatorPerHour','maintenancePerSeason'];
const hash=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))).map(v=>v.toString(16).padStart(2,'0')).join('');
const secureUrl=value=>typeof value==='string' && value.startsWith('https://');
const missingNames={
  CAPACITY_CURVE:['Продуктивність обраного режиму','Capacity at selected regime'],ELECTRICAL_POWER:['Робоча електрична потужність','Operating electrical power'],
  FUEL_COMPATIBILITY:['Сумісність палива','Fuel compatibility'],FUEL_HEATING_VALUE:['Теплотворність палива','Fuel heating value'],THERMAL_PARAMETERS:['Теплові параметри та ККД','Thermal parameters and efficiency'],
  OPERATING_RATES:['Оператор та обслуговування','Operator and maintenance'],ENERGY_PRICES:['Ціни енергії','Energy prices'],BURNER_POWER:['Потужність пальників','Burner power'],ELEVATOR_TARIFF:['Тариф елеватора','Elevator tariff'],
  GRAIN_PRICES:['Ціни зерна','Grain prices'],SERVICE_TARIFF:['Тариф послуги','Service tariff'],INVESTMENT:['Інвестиції','Investment']};
const warningNames={SEASON_TOO_SHORT:['Недостатньо доступних годин сезону.','Insufficient available seasonal hours.'],THERMAL_POWER_INSUFFICIENT:['Недостатня теплова потужність моделі.','Insufficient model thermal power.'],NO_PAYBACK:['Окупність за цих умов не досягається.','Payback is not reached under these conditions.']};
function snapshot(record) {
  const en=record.locale==='en',m=data.models.find(x=>x.id===record.input.modelId),c=data.crops.find(x=>x.id===record.input.cropId),f=data.fuels.find(x=>x.id===record.input.fuelId);
  return {input:record.input,result:record.result,modelName:m.name,cropName:c[en?'en':'uk'],fuelName:f[en?'en':'uk'],fuelUnit:f.unit==='L'?(en?'L':'л'):f.unit==='kg'?(en?'kg':'кг'):'m³',
    missing:record.result.missing.map(k=>missingNames[k]?.[en?1:0]||k),warnings:record.result.warnings.map(k=>warningNames[k]?.[en?1:0]||k),
    clientName:record.lead?.contact.name,calculationId:record.id,createdAt:record.createdAt};
}
async function reportBytes(record,env,fetcher) {
  if(!secureUrl(env.PUBLIC_FONT_URL))throw new Error('Font unavailable');
  const response=await fetcher(env.PUBLIC_FONT_URL,{signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw new Error('Font unavailable');
  return createEngineeringReport(snapshot(record),record.locale==='en',new Uint8Array(await response.arrayBuffer()));
}
function base64(bytes){let value='';for(let i=0;i<bytes.length;i+=16384)value+=String.fromCharCode(...bytes.subarray(i,i+16384));return btoa(value);}

export async function handleEngineering(request,env,fetcher=fetch) {
  const origin=request.headers.get('Origin');
  if(!origin || !(env.ALLOWED_ORIGINS||'').split(',').map(s=>s.trim()).includes(origin))return new Response('Forbidden',{status:403});
  const headers={'Access-Control-Allow-Origin':origin,Vary:'Origin','Cache-Control':'no-store','Content-Type':'application/json'};
  const reply=(body,status=200)=>new Response(JSON.stringify(body),{status,headers});
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...headers,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Authorization'}});
  if(request.method!=='POST')return reply({error:'method_not_allowed'},405);
  if(!env.CALCULATIONS)return reply({error:'storage_not_configured'},503);
  const retention=Number(env.RETENTION_DAYS);
  if(!Number.isInteger(retention)||retention<1||retention>3650)return reply({error:'retention_not_configured'},503);
  if(!env.RATE_LIMITER)return reply({error:'rate_limiter_not_configured'},503);
  if(env.RATE_LIMITER){const rate=await env.RATE_LIMITER.limit({key:request.headers.get('CF-Connecting-IP')||origin});if(!rate.success)return reply({error:'rate_limited'},429);}
  let body;
  try {if(Number(request.headers.get('Content-Length'))>20000)return reply({error:'too_large'},413);const text=await request.text();if(text.length>20000)return reply({error:'too_large'},413);body=JSON.parse(text);}catch{return reply({error:'invalid_json'},400);}
  if(!body||typeof body!=='object'||Array.isArray(body))return reply({error:'invalid'},400);
  const route=new URL(request.url).pathname.replace(/\/$/,'');
  try {
    if(route==='/api/calculations') {
      if(!body.input||typeof body.input!=='object'||!['uk','en'].includes(body.locale)||inputKeys.some(k=>!Object.hasOwn(body.input,k)))return reply({error:'invalid'},400);
      const input=Object.fromEntries([...inputKeys,...optionalInputKeys.filter(k=>Object.hasOwn(body.input,k))].map(k=>[k,body.input[k]]));
      if(typeof input.serviceEnabled!=='boolean'||typeof input.delayedSale!=='boolean')return reply({error:'invalid'},400);
      const result=calculateEngineering(input,data);if(result.status==='invalid')return reply({error:'invalid_input'},422);
      const id=crypto.randomUUID(),token=crypto.randomUUID()+crypto.randomUUID(),createdAt=new Date().toISOString();
      const record={id,createdAt,locale:body.locale,input,result,tokenHash:await hash(token),lead:null};
      await env.CALCULATIONS.put(id,JSON.stringify(record),{expirationTtl:retention*86400});
      return reply({calculationId:id,accessToken:token,createdAt,result},201);
    }
    const id=body.calculationId;
    if(typeof id!=='string'||!/^[a-f0-9-]{36}$/.test(id))return reply({error:'invalid'},400);
    const stored=await env.CALCULATIONS.get(id);
    if(!stored)return reply({error:'not_found'},404);
    const record=JSON.parse(stored),token=request.headers.get('Authorization')?.replace(/^Bearer /,'');
    if(!token||await hash(token)!==record.tokenHash)return reply({error:'forbidden'},403);
    if(route==='/api/calculations/report') {
      if(!record.lead)return reply({error:'contact_required'},403);
      const bytes=await reportBytes(record,env,fetcher);
      return new Response(new Uint8Array(bytes),{headers:{...headers,'Content-Type':'application/pdf','Content-Disposition':`attachment; filename="ARQON-${record.id}.pdf"`}});
    }
    if(route!=='/api/leads')return reply({error:'not_found'},404);
    if(!secureUrl(env.CRM_WEBHOOK_URL))return reply({error:'crm_not_configured'},503);
    const c=body.contact;
    if(!c||typeof c.name!=='string'||c.name.trim().length<2||c.name.length>100||!['email','phone'].includes(c.preferredChannel)||body.reportConsent!==true||typeof body.marketingConsent!=='boolean'||body.company)return reply({error:'invalid_contact'},400);
    const email=typeof c.email==='string'?c.email.trim():'',phone=typeof c.phone==='string'?c.phone.replace(/[\s().-]/g,''):'';
    if((email && (email.length>254||!/^\S+@\S+\.\S+$/.test(email)))||(phone&&!/^\+?[0-9]{8,15}$/.test(phone))||(c.preferredChannel==='email'&&!email)||(c.preferredChannel==='phone'&&!phone))return reply({error:'invalid_contact'},400);
    if(c.preferredChannel==='email'&&!secureUrl(env.DELIVERY_WEBHOOK_URL))return reply({error:'email_not_configured'},503);
    const contact={name:c.name.trim(),email,phone,preferredChannel:c.preferredChannel};
    const identity=await hash(JSON.stringify(contact));
    if(record.lead && record.lead.identity!==identity)return reply({error:'contact_conflict'},409);
    const source={};for(const key of ['utm_source','utm_medium','utm_campaign','landing_page','referrer'])if(typeof body.source?.[key]==='string')source[key]=body.source[key].slice(0,500);
    if(!record.lead)record.lead={id:record.id,identity,contact,reportConsent:true,marketingConsent:body.marketingConsent,source,createdAt:new Date().toISOString(),crmDelivered:false,emailDelivered:false};
    const persist=()=>env.CALCULATIONS.put(id,JSON.stringify(record),{expirationTtl:Math.max(60,Math.ceil((new Date(record.createdAt).getTime()+retention*86400000-Date.now())/1000))});
    await persist();
    const lead=record.lead;
    if(!lead.crmDelivered) {
      const response=await fetcher(env.CRM_WEBHOOK_URL,{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':lead.id,...(env.CRM_WEBHOOK_TOKEN?{Authorization:`Bearer ${env.CRM_WEBHOOK_TOKEN}`}:{})},body:JSON.stringify({leadId:lead.id,contact:lead.contact,consent:{reportDelivery:true,marketing:lead.marketingConsent},source:lead.source,language:record.locale,calculationId:id,input:record.input,result:record.result,engineVersion:record.result.engineVersion,parameterVersion:record.result.parameterVersion,createdAt:record.createdAt}),signal:AbortSignal.timeout(15000)});
      if(response.ok){lead.crmDelivered=true;await persist();}
    }
    if(contact.preferredChannel==='email'&&!lead.emailDelivered) {
      const bytes=await reportBytes(record,env,fetcher);
      const response=await fetcher(env.DELIVERY_WEBHOOK_URL,{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':lead.id,...(env.DELIVERY_WEBHOOK_TOKEN?{Authorization:`Bearer ${env.DELIVERY_WEBHOOK_TOKEN}`}:{})},body:JSON.stringify({to:email,name:contact.name,language:record.locale,calculationId:id,filename:`ARQON-${id}.pdf`,attachmentBase64:base64(bytes),contentType:'application/pdf'}),signal:AbortSignal.timeout(20000)});
      if(response.ok){lead.emailDelivered=true;await persist();}
    }
    return reply({accepted:true,calculationId:id,leadId:lead.id,crmDelivered:lead.crmDelivered,emailDelivered:lead.emailDelivered,preferredChannel:contact.preferredChannel});
  } catch {return reply({error:'service_unavailable'},503);}
}
const worker={fetch(request,env){return handleEngineering(request,env);}};
export default worker;
