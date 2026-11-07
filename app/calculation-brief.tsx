'use client';
import {useState} from 'react';
import type {EngineeringInput} from '@/lib/engineering-types';

export function CalculationBrief({input,en,modelName,cropName,fuelName,fuelUnit,disabled}:{input:EngineeringInput;en:boolean;modelName:string;cropName:string;fuelName:string;fuelUnit:string;disabled:boolean}) {
 const t=(uk:string,english:string)=>en?english:uk;
 const number=(value:number|null|undefined,unit:string)=>value==null||!Number.isFinite(value)?t('Не задано','Not provided'):`${value.toLocaleString(en?'en-GB':'uk-UA',{maximumFractionDigits:20})} ${unit}`;
 const text=[
  t('SAHARA — основні параметри для підбору сушарки','SAHARA — basic dryer selection parameters'),
  `${t('Модель','Model')}: ${modelName}`,
  `${t('Культура','Crop')}: ${cropName}`,
  `${t('Вхідне зерно за сезон','Incoming grain per season')}: ${number(input.volume,t('т','t'))}`,
  `${t('Вологість до → після сушіння','Moisture before → after drying')}: ${number(input.initialMoisture,'%')} → ${number(input.finalMoisture,'%')}`,
  `${t('Робочий графік','Operating schedule')}: ${number(input.dailyHours,t('год/добу','h/day'))}`,
  `${t('Доступний час сезону','Available seasonal time')}: ${number(input.availableHours,t('год','h'))}`,
  `${t('Паливо для розрахунку','Scenario fuel')}: ${fuelName}`,
  `${t('Ціна палива','Fuel price')}: ${number(input.fuelPrice,`${t('грн','UAH')}/${fuelUnit}`)}`,
  `${t('Ціна електроенергії','Electricity price')}: ${number(input.electricityPrice,t('грн/кВт·год','UAH/kWh'))}`,
  `${t('Ціна обраної сушарки','Selected dryer price')}: ${number(input.dryerPrice,t('грн','UAH'))}`,
  `${t('Тариф елеватора','Elevator tariff')}: ${number(input.elevatorTariff,input.elevatorBasis==='tonne-point'?t('грн/т-%','UAH/t-%'):t('грн/т','UAH/t'))}`,
  '',t('Повний розрахунок і додаткові умови можна зберегти у PDF або передати посиланням на сценарій.','Save the full calculation and additional conditions as a PDF or share the scenario link.'),
 ].join('\n');
 const [copy,setCopy]=useState<{text:string;copied:boolean}|null>(null);
 async function copyBrief(){
  let copied=false;
  try{await navigator.clipboard.writeText(text);copied=true;}catch{/* The selectable text remains available. */}
  setCopy({text,copied});
 }
 return <><button type="button" className="button button-secondary" disabled={disabled} onClick={()=>{void copyBrief();}}>{t('Скопіювати основні параметри','Copy basic parameters')}</button>{copy?.text===text&&!disabled&&<div className="calculation-brief"><output aria-live="polite">{copy.copied?t('Основні параметри скопійовано.','Basic parameters copied.'):t('Автоматичне копіювання недоступне. Виділіть і скопіюйте текст нижче.','Automatic copying is unavailable. Select and copy the text below.')}</output><label className="field">{t('Основні параметри для передачі','Basic parameters to share')}<textarea readOnly rows={10} value={text} onFocus={event=>event.currentTarget.select()}/></label></div>}</>;
}
