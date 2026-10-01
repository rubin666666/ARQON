import { calculateEngineering } from '@/lib/engineering.mjs';
import type { EngineeringData, EngineeringInput } from '@/lib/engineering-types';

const names:Record<keyof EngineeringInput,[string,string]>={
 modelId:['Модель','Model'],cropId:['Культура','Crop'],volume:['Обсяг, т','Volume, t'],initialMoisture:['Початкова вологість, %','Incoming moisture, %'],finalMoisture:['Кінцева вологість, %','Final moisture, %'],fuelId:['Паливо','Fuel'],fuelPrice:['Ціна одиниці палива, грн','Fuel unit price, UAH'],electricityPrice:['Електроенергія, грн/кВт·год','Electricity, UAH/kWh'],serviceEnabled:['Послуги іншим господарствам','Drying services'],serviceVolume:['Обсяг послуг, т','Service volume, t'],serviceTariff:['Тариф послуг, грн/т вхідного зерна','Service tariff, UAH/t incoming grain'],elevatorTariff:['Тариф елеватора','Elevator tariff'],elevatorBasis:['Одиниця тарифу елеватора','Elevator billing unit'],elevatorOtherPerTonne:['Інші витрати елеватора, грн/т','Other elevator costs, UAH/t'],ownOtherPerTonne:['Інші власні витрати, грн/т','Other own costs, UAH/t'],delayedSale:['Відкладений продаж','Delayed sale'],currentGrainPrice:['Поточна ціна зерна, грн/т','Current grain price, UAH/t'],futureGrainPrice:['Майбутня ціна зерна, грн/т','Future grain price, UAH/t'],dryerPrice:['Ціна сушарки, грн','Dryer price, UAH'],installation:['Монтаж, грн','Installation, UAH'],additionalInvestment:['Додаткові інвестиції, грн','Additional investment, UAH'],elevatorDistanceKm:['Відстань до елеватора, км','Elevator distance, km'],truckPayloadTonnes:['Вантажопідйомність, т','Truck payload, t'],truckLitresPer100Km:['Витрата дизеля, л/100 км','Diesel use, L/100 km'],transportDieselPrice:['Дизель для доставки, грн/л','Transport diesel, UAH/L'],driverPerTrip:['Водій, грн/рейс','Driver, UAH/trip'],storageCostPerTonne:['Зберігання, грн/т','Storage, UAH/t'],dailyHours:['Робочих годин на добу','Operating hours per day'],availableHours:['Доступні години сезону','Available seasonal hours'],ambientTemperature:['Температура довкілля, °C','Ambient temperature, °C'],operatorPerHour:['Оператор, грн/год','Operator, UAH/h'],maintenancePerSeason:['Обслуговування за сезон, грн','Seasonal maintenance, UAH']
};
export function ScenarioComparison({en,a,b,data}:{en:boolean;a:EngineeringInput;b:EngineeringInput;data:EngineeringData}) {
 const t=(uk:string,english:string)=>en?english:uk;
 const fmt=(v:number|null|undefined)=>v==null||!Number.isFinite(v)?'—':v.toLocaleString(en?'en-GB':'uk-UA',{maximumFractionDigits:1});
 const results=[a,b].map(input=>calculateEngineering(input,data));
 const value=(input:EngineeringInput,key:keyof EngineeringInput)=>{
  const v=input[key];
  if(key==='modelId')return data.models.find(m=>m.id===v)?.name??v;
  if(key==='cropId')return data.crops.find(c=>c.id===v)?.[en?'en':'uk']??v;
  if(key==='fuelId'){const f=data.fuels.find(f=>f.id===v);return f?`${f[en?'en':'uk']} (${f.unit==='L'?t('л','L'):f.unit==='kg'?t('кг','kg'):t('м³','m³')})`:v;}
  if(key==='elevatorBasis')return v==='tonne'?t('грн/т','UAH/t'):t('грн/т-%','UAH/t-%');
  return typeof v==='boolean'?(v?t('Так','Yes'):t('Ні','No')):typeof v==='number'||v==null?fmt(v):v;
 };
 const differences=(Object.keys(names) as (keyof EngineeringInput)[]).filter(key=>a[key]!==b[key]);
 return <><div className="scenario-columns">{results.map((r,i)=><article key={i}><h4>{i===0?t('A — зафіксований','A — pinned'):t('B — поточний','B — current')}</h4><p><strong>{value(i===0?a:b,'modelId')}</strong> · {value(i===0?a:b,'cropId')} · {fmt((i===0?a:b).volume)} {t('т','t')}</p><p>{value(i===0?a:b,'fuelId')} · {fmt((i===0?a:b).fuelPrice)} {t('грн/од.','UAH/unit')}</p><p className="engineering-caption">{r.status==='ready'?t('Повний попередній розрахунок','Complete preliminary calculation'):r.status==='invalid'?t('Перевірте введені дані','Check inputs'):t('Частковий розрахунок','Partial calculation')}</p><dl>{[
 [t('Сушіння, грн/т','Drying, UAH/t'),fmt(r.own?.perTonne)],
 [t('Тривалість сушіння, год','Drying duration, h'),fmt(r.totalHours)],
 [t('Економія на власному зерні, грн/сезон','Own grain savings, UAH/season'),fmt(r.savings)],
 [t('Окупність на власному зерні, сезонів','Own grain payback, seasons'),r.paybackSeasons==null&&r.savings!=null&&r.savings<=0?t('Не досягається','Not reached'):fmt(r.paybackSeasons)]
 ].map(([label,v])=><div key={label}><dt>{label}</dt><dd>{v}</dd></div>)}</dl></article>)}</div><p className="engineering-caption">{t('Прочерк означає відсутні дані, а не нуль. Усі результати є попередньою оцінкою.','A dash means missing data, not zero. All results are preliminary estimates.')}</p><details className="engineering-details" open><summary>{t('Що відрізняється між A та B','Differences between A and B')} ({differences.length})</summary>{differences.length===0?<p>{t('Умови однакові. Змініть параметри сценарію B для порівняння.','Inputs match. Edit scenario B to compare.')}</p>:<ul className="scenario-differences">{differences.map(key=><li key={key}><strong>{names[key][en?1:0]}</strong><span>A: {value(a,key)} → B: {value(b,key)}</span></li>)}</ul>}</details></>;
}
