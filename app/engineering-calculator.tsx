'use client';
import { useEffect, useState } from 'react';
import { Wheat, Fuel, Calculator as CalculatorIcon, ArrowUpRight, Download, RotateCcw } from 'lucide-react';
import rawData from '@/config/engineering.json';
import { parseScenario } from '@/lib/scenario';
import { calculateEngineering } from '@/lib/engineering.mjs';
import type { EngineeringData, EngineeringInput, EngineeringResult } from '@/lib/engineering-types';
import { EngineeringLead } from './engineering-lead';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { site, localText, asset, track, readPreference, writePreference } from '@/lib/site';

const data = rawData as EngineeringData;
const initial = { cropId:'corn', volume:'1000', initialMoisture:'25', finalMoisture:'15', fuelId:'diesel', fuelPrice:'', electricityPrice:'',
  serviceEnabled:false, serviceVolume:'', serviceTariff:'', elevatorTariff:'', elevatorBasis:'tonne' as 'tonne' | 'tonne-point',
  elevatorOtherPerTonne:'0', ownOtherPerTonne:'0', delayedSale:false, currentGrainPrice:'', futureGrainPrice:'',
  dryerPrice:'', installation:'', additionalInvestment:'0', availableHours:'' };
type Draft = typeof initial;
type NumericKey = { [K in keyof Draft]: Draft[K] extends string ? K : never }[keyof Draft];
const numericKeys = ['volume','initialMoisture','finalMoisture','fuelPrice','electricityPrice','serviceVolume','serviceTariff','elevatorTariff','elevatorOtherPerTonne','ownOtherPerTonne','currentGrainPrice','futureGrainPrice','dryerPrice','installation','additionalInvestment','availableHours'];
function restore(raw: string | null): {draft: Draft; modelId: string} | null {
  if (!raw || raw.length > 6000) return null;
  try {
    const value = JSON.parse(raw), d = value.draft;
    if (value.version !== 2 || !d || !data.models.some(m => m.id === value.modelId) || !data.crops.some(c => c.id === d.cropId) || !data.fuels.some(f => f.id === d.fuelId)) return null;
    if (!['tonne','tonne-point'].includes(d.elevatorBasis) || typeof d.serviceEnabled !== 'boolean' || typeof d.delayedSale !== 'boolean') return null;
    if (numericKeys.some(k => typeof d[k] !== 'string' || d[k].length > 18 || (d[k] !== '' && !/^\d+(?:[.,]\d+)?$/.test(d[k])))) return null;
    return {modelId:value.modelId,draft:Object.fromEntries(Object.keys(initial).map(k => [k,d[k]])) as Draft};
  } catch { return null; }
}
const number = (v: string) => v.trim() === '' ? null : Number(v.replace(',','.'));
export function Calculator({ en, model, onModelChange, open, onOpenChange }: {en: boolean; model: string; onModelChange: (model: string) => void; open:boolean; onOpenChange:(open:boolean)=>void}) {
  const [leadInput,setLeadInput]=useState<EngineeringInput|null>(null);
  const t = (uk: string, english: string) => en ? english : uk;
  const [draft, setDraft] = useState<Draft>(initial);
  const [loaded, setLoaded] = useState(false);
  const [notice, setNotice] = useState('');
  const [link, setLink] = useState('');
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfFile,setPdfFile]=useState<{url:string;filename:string}|null>(null);
  useEffect(()=>()=>{if(pdfFile)URL.revokeObjectURL(pdfFile.url);},[pdfFile]);
  const [showComparison, setShowComparison] = useState(false);
  /* oxlint-disable react/react-compiler */
  useEffect(() => {
    const shared = new URLSearchParams(location.search).get('engineering');
    if(shared || new URLSearchParams(location.search).has('scenario'))onOpenChange(true);
    const saved = restore(shared ?? readPreference('arqon-engineering-v2'));
    if (saved) { setDraft(saved.draft); onModelChange(saved.modelId); }
    if (shared && !saved) setNotice('invalid-link');
    if (!shared && !saved) {
      const legacyRaw = new URLSearchParams(location.search).get('scenario') ?? readPreference('arqon-scenario-v1');
      const legacy = parseScenario(legacyRaw);
      if (legacy && data.crops.some(c=>c.id===legacy.crop)) {
        setDraft({...initial,cropId:legacy.crop,volume:String(legacy.volume),initialMoisture:String(legacy.initialMoisture),finalMoisture:String(legacy.finalMoisture),fuelPrice:legacy.diesel,electricityPrice:legacy.electricity,elevatorTariff:String(legacy.elevatorTariff),elevatorBasis:'tonne-point',delayedSale:legacy.delayedSale});
        onModelChange(legacy.model);setNotice('legacy');
      } else if (legacyRaw) setNotice('invalid-link');
    }
    setLoaded(true);
  }, [onModelChange,onOpenChange]);
  /* oxlint-enable react/react-compiler */
  useEffect(() => {
    if (!loaded) return;
    const serialized = JSON.stringify({version:2,modelId:model,draft});
    if (restore(serialized)) {
      writePreference('arqon-engineering-v2',serialized);
      const url = new URL(location.href);
      if (url.searchParams.has('engineering')) { url.searchParams.set('engineering',serialized); history.replaceState(null,'',url); }
    }
  },[draft,model,loaded]);
  function set<K extends keyof Draft>(key: K, value: Draft[K]) { setDraft(d => ({...d,[key]:value})); setNotice(''); setLink(''); }
  const input: EngineeringInput = {
    modelId:model,cropId:draft.cropId,volume:number(draft.volume) ?? NaN,initialMoisture:number(draft.initialMoisture) ?? NaN,finalMoisture:number(draft.finalMoisture) ?? NaN,
    fuelId:draft.fuelId,fuelPrice:number(draft.fuelPrice),electricityPrice:number(draft.electricityPrice),serviceEnabled:draft.serviceEnabled,
    serviceVolume:number(draft.serviceVolume) ?? 0,serviceTariff:number(draft.serviceTariff),elevatorTariff:number(draft.elevatorTariff),elevatorBasis:draft.elevatorBasis,
    elevatorOtherPerTonne:number(draft.elevatorOtherPerTonne) ?? NaN,ownOtherPerTonne:number(draft.ownOtherPerTonne) ?? NaN,delayedSale:draft.delayedSale,
    currentGrainPrice:number(draft.currentGrainPrice),futureGrainPrice:number(draft.futureGrainPrice),dryerPrice:number(draft.dryerPrice),installation:number(draft.installation),
    additionalInvestment:number(draft.additionalInvestment) ?? NaN,availableHours:number(draft.availableHours),
  };
  const result = calculateEngineering(input,data);
  const selected = data.models.find(m => m.id === model);
  const reference = selected?.reference.find(p => p.cropId === draft.cropId);
  const fuel = data.fuels.find(f => f.id === draft.fuelId)!;
  const fuelUnit = fuel.unit === 'L' ? t('л','L') : t('м³','m³');
  const format = (value: number | null | undefined, digits=1) => value == null || !Number.isFinite(value) ? '—' : value.toLocaleString(en?'en-GB':'uk-UA',{maximumFractionDigits:digits});
  const labels: Record<string,string> = {
    CAPACITY_CURVE:t('Продуктивність для вибраної вологості','Capacity for the selected moisture'),
    ELECTRICAL_POWER:t('Сумарна робоча електрична потужність','Total operating electrical power'),
    FUEL_COMPATIBILITY:t('Сумісність моделі з паливом','Model / fuel compatibility'),
    FUEL_HEATING_VALUE:t('Теплотворність палива','Fuel heating value'),
    THERMAL_PARAMETERS:t('Погоджені теплові параметри та ККД','Approved thermal parameters and efficiency'),
    OPERATING_RATES:t('Вартість оператора й обслуговування','Operator and maintenance rates'),
    ENERGY_PRICES:t('Ціни палива та електроенергії','Fuel and electricity prices'),
    BURNER_POWER:t('Сумарна теплова потужність','Total thermal power'),
    ELEVATOR_TARIFF:t('Тариф елеватора','Elevator tariff'),
    GRAIN_PRICES:t('Ціни зерна до й після зберігання','Grain prices before and after storage'),
    SERVICE_TARIFF:t('Тариф послуги сушіння','Drying service tariff'),
    INVESTMENT:t('Вартість обладнання та монтажу','Equipment and installation costs'),
  };
  const warnings: Record<string,string> = {
    INVALID_INPUT:t('Перевірте поля: обсяг має бути додатним, початкова вологість — вищою за кінцеву (обидві між 0 та 100%). Для ввімкненої послуги потрібен додатний обсяг і, якщо задано, додатний тариф. Ціни й витрати не можуть бути від’ємними.','Check the fields: volume must be positive, and initial moisture must exceed final moisture (both between 0 and 100%). An enabled service needs positive volume and a positive tariff if entered. Prices and costs cannot be negative.'),
    SEASON_TOO_SHORT:t('Потрібний час перевищує доступні години сезону.','Required operating time exceeds available seasonal hours.'),
    THERMAL_POWER_INSUFFICIENT:t('Розрахункова теплова потреба перевищує потужність моделі.','Required thermal power exceeds model capacity.'),
    NO_PAYBACK:t('За цих умов загальний економічний ефект не додатний — окупність не досягається.','The total economic effect is not positive under these conditions; payback is not reached.'),
  };
  const hints: Partial<Record<NumericKey,string>> = {
    volume:t('Маса власного зерна до сушіння за весь сезон.','Your incoming grain mass for the whole season.'),
    initialMoisture:t('Вологість зерна перед сушінням.','Grain moisture before drying.'),
    finalMoisture:t('Бажана вологість після сушіння; має бути нижчою за початкову.','Target moisture after drying; must be below initial moisture.'),
    elevatorTariff:draft.elevatorBasis==='tonne-point'?t('За одну тонну вхідного зерна та один відсотковий пункт знятої вологості. Наприклад, з 25% до 15% — це 10 пунктів.','Per tonne of incoming grain per moisture percentage point removed. From 25% to 15% means 10 points.'):t('Повна ціна сушіння однієї тонни вхідного зерна.','The total drying price for one tonne of incoming grain.'),
    serviceTariff:t('Виручка за тонну стороннього зерна. Чистий прибуток визначається після віднімання витрат на сушіння.','Revenue per tonne of service grain. Net profit subtracts drying costs.'),
    dryerPrice:t('Вартість обраної моделі без монтажу та інших інвестицій.','Selected model cost excluding installation and other investments.'),
    availableHours:t('Фактичні робочі години за сезон, за вирахуванням простоїв.','Available operating hours for the season, excluding downtime.'),
  };
  function fieldError(key:NumericKey,required=false) {
    const value=number(draft[key]);
    if(value===null)return required || ['elevatorOtherPerTonne','ownOtherPerTonne','additionalInvestment'].includes(key)?t('Вкажіть значення.','Enter a value.'):'';
    if(!Number.isFinite(value))return t('Введіть коректне число.','Enter a valid number.');
    if(value<0)return t('Значення не може бути від’ємним.','Value cannot be negative.');
    if(['volume','serviceVolume','availableHours','serviceTariff'].includes(key)&&value===0)return t('Значення має бути більшим за нуль.','Value must be greater than zero.');
    if(['volume','serviceVolume'].includes(key)&&value>1e9)return t('Максимум — 1 000 000 000 т.','Maximum: 1,000,000,000 t.');
    if(['initialMoisture','finalMoisture'].includes(key)&&(value<=0||value>=100))return t('Вологість має бути більшою за 0% і меншою за 100%.','Moisture must be greater than 0% and below 100%.');
    if(key==='finalMoisture'&&number(draft.initialMoisture)!==null&&value>=Number(draft.initialMoisture))return t('Кінцева вологість має бути нижчою за початкову.','Final moisture must be below initial moisture.');
    return '';
  }
  function numeric(key: NumericKey, label: string, required=false) {
    const error=fieldError(key,required),hint=hints[key],id=`eng-${key}`;
    return <div className="field"><label htmlFor={id}>{label}</label><input id={id} type="number" inputMode="decimal" min="0" step="any" required={required} value={draft[key]} aria-invalid={Boolean(error)} aria-describedby={[error?id+'-error':'',hint?id+'-hint':''].filter(Boolean).join(' ')||undefined} placeholder={required ? undefined : t('Не задано','Not provided')} onChange={e => set(key,e.target.value as Draft[typeof key])}/>{error&&<p id={id+'-error'} className="engineering-field-error" aria-live="polite">{error}</p>}{hint&&<details className="engineering-hint"><summary>{t('Пояснення','Help')}</summary><p id={id+'-hint'}>{hint}</p></details>}</div>;
  }
  function viewResults() {
    if(result.status==='invalid') {
      const field=document.querySelector<HTMLInputElement>('#calculator-inputs input[aria-invalid="true"]');
      if(field){let parent=field.parentElement;while(parent){if(parent instanceof HTMLDetailsElement)parent.open=true;parent=parent.parentElement;}field.focus();field.scrollIntoView({block:'center'});return;}
    }
    document.getElementById('calculator-result')?.scrollIntoView({block:'start'});document.getElementById('calculator-result')?.focus({preventScroll:true});track('calculation_completed',{model,status:result.status});
  }
  function select(id: string, label: string, value: string, options: {value:string;label:string}[], change:(s:string)=>void) {
    return <label className="field" htmlFor={id}><span>{label}</span><select id={id} value={value} onChange={e=>change(e.target.value)}>{options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></label>;
  }
  function checkbox(key: 'serviceEnabled' | 'delayedSale', label: string) {
    return <label className="engineering-toggle"><input type="checkbox" checked={draft[key]} onChange={e=>set(key,e.target.checked)}/><span>{label}</span></label>;
  }
  const metric = (label: string, value: number | null | undefined, unit: string) => <div><dt>{label}</dt><dd>{format(value)} <small>{unit}</small></dd></div>;
  const financialMetric=(label:string,value:number|null|undefined,unit:string)=>value==null?null:metric(label,value,unit);
  function compareCard(m:EngineeringData['models'][number]) {
    const r:EngineeringResult=calculateEngineering({...input,modelId:m.id,dryerPrice:null,installation:null},data);
    return <article key={m.id} className="engineering-model-card" aria-label={m.name} data-selected={m.id===model}><div className="engineering-card-heading"><h4>{m.name}</h4>{m.id===model&&<span>{t('Обрана','Selected')}</span>}</div><dl className="engineering-metrics">{metric(t('Продуктивність','Capacity'),r.capacity,t('т/год','t/h'))}{metric(t('Час за сезон','Seasonal time'),r.totalHours,t('год','h'))}{financialMetric(t('Сушіння','Drying'),r.own?.perTonne,t('грн/т','UAH/t'))}{financialMetric(t('Окупність','Payback'),r.paybackSeasons,t('сезонів','seasons'))}</dl>{r.capacity===null&&<p className="engineering-caption">{t('Для цієї вологості немає підтвердженої продуктивності.','No confirmed capacity for this moisture.')}</p>}<button className="button button-secondary" type="button" onClick={()=>onModelChange(m.id)} aria-pressed={m.id===model}>{t('Обрати','Select')} {m.name}<ArrowUpRight size={16}/></button></article>;
  }
  function applyReference(cropId=draft.cropId) {
    const p = selected?.reference.find(p=>p.cropId===cropId);
    setDraft(d=>({...d,cropId,...(p ? {initialMoisture:String(p.input),finalMoisture:String(p.output)} : {})}));
  }
  async function share() {
    if (result.status==='invalid') return;
    const url = new URL(location.href);url.searchParams.delete('scenario');url.searchParams.set('engineering',JSON.stringify({version:2,modelId:model,draft}));url.hash='calculator';
    try { await navigator.clipboard.writeText(url.href);setNotice('copied'); } catch {setLink(url.href);}
  }
  async function download() {
    if (result.status==='invalid') return;
    setPdfBusy(true);
    try {
      const {downloadEngineeringReport} = await import('@/lib/engineering-report.mjs');
      const file=await downloadEngineeringReport({input,result,modelName:selected?.name || model,cropName:data.crops.find(c=>c.id===draft.cropId)![en?'en':'uk'],fuelName:fuel[en?'en':'uk'],fuelUnit,missing:result.missing.map(k=>labels[k]),warnings:result.warnings.map(k=>warnings[k])},en,asset('/fonts/NotoSans.ttf'));
      setPdfFile(file);
      track('technical_summary_download',{model});
    } catch {setNotice('pdf-error');} finally {setPdfBusy(false);}
  }
  function compareRow(m: EngineeringData['models'][number]) {
    const r: EngineeringResult = calculateEngineering({...input,modelId:m.id,dryerPrice:null,installation:null},data);
    return <tr key={m.id} aria-current={m.id===model ? 'true':undefined}><th scope="row">{m.name}{m.id===model && <small>{t('Обрана','Selected')}</small>}</th><td>{format(r.capacity)}</td><td>{format(r.totalHours)}</td><td>{format(r.own?.perTonne)}</td><td>{format(r.paybackSeasons)}</td><td><button type="button" className="text-link" onClick={()=>onModelChange(m.id)}>{t('Обрати','Select')} {m.name}</button></td></tr>;
  }
  return <section id="calculator" className="section calculator-launcher">
    <div className="calculator-launch-card"><div><p className="eyebrow">{t('Калькулятор ефективності','Efficiency calculator')}</p><h2>{t('Порахуйте свій сезон','Calculate your season')}</h2><p>{t('Оберіть модель, порівняйте умови сушіння та збережіть результат у PDF.','Choose a model, compare drying scenarios and save your results as a PDF.')}</p></div><button type="button" id="calculator-launch" className="button" onClick={()=>onOpenChange(true)} aria-haspopup="dialog"><CalculatorIcon size={20}/>{t('Відкрити калькулятор','Open calculator')}<ArrowUpRight size={18}/></button></div>
    <Dialog open={open} onOpenChange={value=>{if(!value)setLeadInput(null);onOpenChange(value);}}><DialogContent className="engineering-calculator calculator-window" showCloseButton={false}>
      <div className="calculator-window-heading"><div><DialogTitle>{t('Калькулятор ефективності','Efficiency calculator')}</DialogTitle><DialogDescription>{t('Заповніть параметри — доступні результати оновлюються одразу.','Enter your parameters — available results update immediately.')}</DialogDescription></div><DialogClose className="modal-close" aria-label={t('Закрити калькулятор','Close calculator')}/></div>
      <div className="calculator-window-body">
    <div className="calculator">
      <div className="calc-fields" id="calculator-inputs">
        <fieldset className="calc-group"><legend><Wheat size={18}/>{t('01 — Зерно та модель','01 — Grain and model')}</legend><div className="fields">
          {select('calc-model',t('Модель сушарки','Dryer model'),model,data.models.map(m=>({value:m.id,label:m.name})),onModelChange)}
          {select('calc-crop',t('Культура','Crop'),draft.cropId,data.crops.map(c=>({value:c.id,label:c[en?'en':'uk']})),applyReference)}
          {numeric('volume',t('Власне зерно за сезон, т','Own grain per season, t'),true)}
          {numeric('initialMoisture',t('Початкова вологість, %','Initial moisture, %'),true)}
          {numeric('finalMoisture',t('Кінцева вологість, %','Final moisture, %'),true)}
        </div>{reference && <div className="engineering-reference"><p>{t('Еталон із таблиці виробника','Manufacturer reference')}: <b>{reference.input} → {reference.output}% · {reference.temperature} °C · {reference.capacity} {t('т/год','t/h')}</b></p><button type="button" className="text-link" onClick={()=>applyReference()}>{t('Застосувати еталонну вологість','Use reference moisture')}</button></div>}</fieldset>
        <fieldset className="calc-group"><legend><Fuel size={18}/>{t('02 — Енергоносії','02 — Energy')}</legend><div className="fields">
          {select('eng-fuel',t('Паливо для розрахунку','Scenario fuel'),draft.fuelId,data.fuels.map(f=>({value:f.id,label:f[en?'en':'uk']})),value=>{setDraft(d=>({...d,fuelId:value,fuelPrice:''}));})}
          {numeric('fuelPrice',`${t('Ціна палива','Fuel price')}, ${t('грн','UAH')}/${fuelUnit}`)}
          {numeric('electricityPrice',t('Електроенергія, грн/кВт·год','Electricity, UAH/kWh'))}
        </div><p className="engineering-caption">{t('Вибір палива задає сценарій; сумісність обладнання потребує підтвердження.','Fuel selection defines the scenario; equipment compatibility requires confirmation.')}</p>
        </fieldset>
        <fieldset className="calc-group"><legend><CalculatorIcon size={18}/>{t('03 — Порівняння з елеватором','03 — Elevator comparison')}</legend><div className="fields">
          {select('eng-tariff-basis',t('Одиниця тарифу елеватора','Elevator billing unit'),draft.elevatorBasis,[{value:'tonne',label:t('грн/т вхідного зерна','UAH/t of incoming grain')},{value:'tonne-point',label:t('грн/т-% знятої вологості','UAH/t per moisture percentage point')}],value=>set('elevatorBasis',value as Draft['elevatorBasis']))}
          {numeric('elevatorTariff',t('Тариф сушіння на елеваторі','Elevator drying tariff'))}

        </div></fieldset>
        <details className="engineering-details"><summary>{t('Інвестиції та окупність','Investment and payback')}{(draft.dryerPrice!=='' || draft.installation!=='' || Number(draft.additionalInvestment)!==0) && t(' · Заповнено',' · Entered')}</summary><div className="fields">
          {numeric('dryerPrice',t('Вартість сушарки, грн','Dryer price, UAH'))}
          {numeric('installation',t('Монтаж, грн','Installation, UAH'))}
          {numeric('additionalInvestment',t('Інші інвестиції, грн','Additional investment, UAH'))}
</div><p className="engineering-caption">{t('Вкажіть отримані ціни або залиште порожніми. Всі суми порівнюйте на однаковій основі щодо ПДВ.','Enter quoted prices or leave blank. Use the same VAT basis for all amounts.')}</p></details>
        <details className="engineering-details"><summary>{t('Послуги іншим господарствам','Services for other farms')}{draft.serviceEnabled && t(' · Увімкнено',' · Enabled')}</summary>
          {checkbox('serviceEnabled',t('Сушити зерно для інших господарств','Dry grain for other farms'))}
          {draft.serviceEnabled && <><div className="fields">{numeric('serviceVolume',t('Стороннє зерно за сезон, т','Service grain per season, t'),true)}{numeric('serviceTariff',t('Тариф послуги, грн/т вхідного зерна','Service tariff, UAH/t of incoming grain'))}</div><p className="engineering-caption">{t('Для послуги застосовується та сама культура й вологість. Виручка та прибуток рахуються окремо від власного зерна.','Service uses the same crop and moisture. Revenue and profit are separate from your own grain.')}</p></>}
        </details>
        <details className="engineering-details"><summary>{t('Витрати, сезон і продаж зерна','Costs, season and grain sales')}</summary><div className="fields">
          {numeric('elevatorOtherPerTonne',t('Елеватор: доставка, зберігання та інше, грн/т','Elevator: delivery, storage and other, UAH/t'))}
          {numeric('ownOtherPerTonne',t('Власна система: зберігання та інше, грн/т','Own system: storage and other, UAH/t'))}
          {numeric('availableHours',t('Доступний час сезону, год (необов’язково)','Available seasonal hours (optional)'))}
        </div><p className="engineering-caption">{t('Додаткові витрати за весь сезон на тонну вхідного власного зерна; за замовчуванням не враховані (0).','Additional full-season costs per tonne of your incoming grain; excluded by default (0).')}</p>
        {checkbox('delayedSale',t('Порівняти продаж зараз і після зберігання','Compare immediate and delayed sale'))}
        {draft.delayedSale && <><div className="fields">{numeric('currentGrainPrice',t('Ціна продажу зараз, грн/т','Immediate sale price, UAH/t'))}{numeric('futureGrainPrice',t('Очікувана ціна після зберігання, грн/т','Expected later price, UAH/t'))}</div><p className="engineering-caption">{t('Різниця цін застосовується до маси після сушіння. Це припущення сценарію: продаж через елеватор зараз, власного зерна — пізніше. Витрати зберігання додайте вище.','Price difference applies to dried mass. Scenario assumption: immediate sale via elevator versus later sale of own grain. Include storage costs above.')}</p></>}
        </details>
        <button type="button" className="button" onClick={viewResults}>{t('Переглянути результат','View results')}<ArrowUpRight size={18}/></button>
      </div>
      <aside className="result engineering-result" id="calculator-result" tabIndex={-1} aria-label={t('Результати','Results')}>
        <p className="result-label">{t('Ваш сезон','Your season')}</p><h3>{selected?.name} <span>· {data.crops.find(c=>c.id===draft.cropId)?.[en?'en':'uk']}</span></h3>
        <p className="engineering-status">{result.status==='ready' ? t('Попередня оцінка','Preliminary estimate') : t('Доступний частковий розрахунок','Partial calculation available')}</p>
        {result.status==='invalid' ? <p className="error" role="alert">{warnings.INVALID_INPUT}</p> : <>
          {result.own&&<figure className="engineering-balance"><figcaption>{t('Баланс власного зерна','Own grain balance')}<strong>{format(result.own.rawKg/1000)} {t('т до сушіння','t before drying')}</strong></figcaption><div className="engineering-balance-bar" aria-hidden="true"><span style={{width:(result.own.finalKg/result.own.rawKg*100)+'%'}}/><span style={{width:(result.own.waterKg/result.own.rawKg*100)+'%'}}/></div><div className="engineering-balance-key"><p><i/>{t('Після сушіння','After drying')}<b>{format(result.own.finalKg/1000)} {t('т','t')}</b></p><p><i/>{t('Видалена вода','Water removed')}<b>{format(result.own.waterKg/1000)} {t('т','t')}</b></p></div></figure>}
          <dl className="engineering-metrics" aria-live="polite">
            {metric(t('Продуктивність у цьому режимі','Capacity at this regime'),result.capacity,t('т/год','t/h'))}
            {metric(t('Власне зерно: час роботи','Own grain: operating time'),result.own?.hours,t('год','h'))}
          </dl>
          <dl className="engineering-metrics engineering-financial">
            {financialMetric(t('Собівартість сушіння','Drying cost'),result.own?.perTonne,t('грн/т','UAH/t'))}
            {financialMetric(t('Економія на власному зерні','Own grain savings'),result.savings,t('грн/сезон','UAH/season'))}
            {draft.serviceEnabled && financialMetric(t('Виручка від послуг (до витрат)','Service revenue (before costs)'),result.serviceRevenue,t('грн','UAH'))}
            {draft.serviceEnabled && financialMetric(t('Чистий прибуток від послуг','Net service profit'),result.serviceProfit,t('грн','UAH'))}
            {draft.delayedSale && financialMetric(t('Різниця виручки від продажу','Additional sale revenue'),result.priceRevenue,t('грн','UAH'))}
            {financialMetric(t('Загальний економічний ефект','Total economic effect'),result.economicEffect,t('грн/сезон','UAH/season'))}
            {financialMetric(t('Окупність','Payback'),result.paybackSeasons,t('сезонів','seasons'))}
          </dl>{[result.own?.perTonne,result.savings,result.economicEffect,result.paybackSeasons].some(v=>v==null)&&<p className="engineering-pending">{t('Для повної оцінки витрат та окупності ще потрібні параметри виробника або введені ціни. Доступні показники наведено вище.','A complete cost and payback estimate needs manufacturer parameters or entered prices. Available figures are shown above.')}</p>}
          {result.warnings.map(code=><p key={code} className="notice">{warnings[code]}</p>)}
          {result.missing.length>0 && <details className="engineering-details"><summary>{t('Що потрібно для повного розрахунку','What is needed for a complete calculation')} ({result.missing.length})</summary><ul>{result.missing.map(code=><li key={code}>{labels[code]}</li>)}</ul></details>}
          <p className="engineering-caption">{t('Маса розрахована без втрат сухої речовини. Продуктивність доступна лише для наданих виробником режимів. Прочерк означає відсутні дані, а не нульові витрати.','Mass assumes no dry-matter loss. Capacity is available only for manufacturer-supplied regimes. A dash means missing data, not zero costs.')}</p>
          <details className="engineering-details"><summary>{t('Матеріальний баланс та енергія','Material balance and energy')}</summary><dl className="engineering-metrics">
            {metric(t('Суха речовина','Dry matter'),result.own?.dryMatterKg,t('кг','kg'))}{metric(t('Потрібна енергія пальника','Required burner energy'),result.own?.burnerMJ,'MJ')}
            {metric(t('Паливо для власного зерна','Fuel for own grain'),result.own?.fuelQuantity,fuelUnit)}{metric(t('Електроенергія для власного зерна','Electricity for own grain'),result.own?.electricityKwh,t('кВт·год','kWh'))}
            {metric(t('Загальний час із послугами','Total time including service'),result.totalHours,t('год','h'))}{metric(t('Інвестиції','Investment'),result.investment,t('грн','UAH'))}
            {metric(t('ROI за сезон','ROI per season'),result.roiPerSeason,'%')}
          </dl></details>
        </>}
        <div className="engineering-actions">{site.calculationEndpoint.startsWith('https://') && localText(site.privacy,en) && <button type="button" className="button" disabled={result.status==='invalid'} onClick={()=>setLeadInput({...input})}>{t('Отримати персональний звіт','Get personalized report')}</button>}<button type="button" className="button button-secondary" onClick={()=>setShowComparison(v=>!v)} aria-expanded={showComparison} aria-controls="engineering-comparison">{t('Порівняти моделі','Compare models')}<ArrowUpRight size={18}/></button>
        <button type="button" className="button button-secondary" disabled={pdfBusy || result.status==='invalid'} onClick={download}>{pdfBusy?t('Готуємо PDF…','Preparing PDF…'):t('Завантажити технічний підсумок','Download technical summary')}<Download size={18}/></button></div>
        {pdfFile&&<a className="text-link" href={pdfFile.url} download={pdfFile.filename}>{t('Зберегти останній сформований PDF','Save the last generated PDF')}</a>}
        <p className="engineering-caption">{t('Це підсумок доступних даних. Персональний комерційний PDF та надсилання на email будуть доступні після налаштування даних і сервісу доставки.','This summarizes available data. Personalized commercial PDF and email delivery require completed parameters and a configured delivery service.')}</p>
      </aside>
    </div>
    <div className="scenario-tools"><button type="button" className="button button-secondary" onClick={share} disabled={result.status==='invalid'}>{t('Поділитися сценарієм','Share scenario')}</button><button type="button" className="text-link" onClick={()=>{setDraft(initial);onModelChange(data.models[0].id);setNotice('reset');setLink('');const u=new URL(location.href);u.searchParams.delete('engineering');u.searchParams.delete('scenario');history.replaceState(null,'',u);}}><RotateCcw size={16}/>{t('Скинути','Reset')}</button></div>
    {notice && <output>{notice==='copied'?t('Посилання скопійовано.','Link copied.'):notice==='reset'?t('Параметри скинуто.','Parameters reset.'):notice==='legacy'?t('Відновлено основні параметри старого сценарію. Логістику, ціни продажу та нові поля перевірте окремо.','Restored core values from your previous scenario. Review logistics, sale prices and new fields separately.'):notice==='pdf-error'?t('Не вдалося сформувати PDF. Спробуйте ще раз.','Could not generate PDF. Please retry.'):t('Не вдалося відновити сценарій із посилання.','Unable to restore the linked scenario.')}</output>}
    {link && <label className="field">{t('Скопіюйте посилання','Copy the link')}<input readOnly value={link} onFocus={e=>e.currentTarget.select()}/></label>}
    {showComparison && <div id="engineering-comparison" className="engineering-comparison"><h3>{t('Моделі для ваших умов','Models for your scenario')}</h3><p className="engineering-caption">{t('Ті самі обсяги, культура й вологість. Ціни порівнюються лише з довідника моделей; введена вручну ціна обраної сушарки не переноситься на інші. Автопідбір ще не активний.','Same volumes, crop and moisture. Comparison uses model-specific catalogue prices only; your manually entered price is not applied to other models. Automatic recommendation is not active.')}</p><div className="engineering-model-cards">{data.models.map(compareCard)}</div><section className="comparison-scroll engineering-comparison-table" aria-label={t('Порівняння моделей, прокрутіть горизонтально','Model comparison, scroll horizontally')}><table><thead><tr><th>{t('Модель','Model')}</th><th>{t('т/год','t/h')}</th><th>{t('Годин за сезон','Hours / season')}</th><th>{t('Сушіння, грн/т','Drying, UAH/t')}</th><th>{t('Окупність, сезонів','Payback, seasons')}</th><th>{t('Дія','Action')}</th></tr></thead><tbody>{data.models.map(compareRow)}</tbody></table></section></div>}
    <Dialog open={leadInput!==null} onOpenChange={open=>{if(!open)setLeadInput(null);}}><DialogContent className="engineering-lead-dialog"><DialogTitle>{t('Ваш персональний звіт','Your personalized report')}</DialogTitle><DialogDescription>{t('Розрахунок для обраних умов сезону.','Calculation for your seasonal conditions.')}</DialogDescription>{leadInput&&<EngineeringLead input={leadInput} en={en}/>}</DialogContent></Dialog>
      </div></DialogContent></Dialog>
  </section>;
}
