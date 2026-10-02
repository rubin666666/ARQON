import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {PDFDocument} from 'pdf-lib';
import {calculateEngineering} from '../lib/engineering.mjs';
import {reportAnalysis,divide} from '../lib/report-analysis.mjs';
import {createEngineeringReport} from '../lib/engineering-report.mjs';
const data=JSON.parse(fs.readFileSync(new URL('../config/engineering.json',import.meta.url)));
const input={modelId:'sahara-s13',cropId:'corn',volume:2000,initialMoisture:25,finalMoisture:15,fuelId:'diesel',fuelPrice:60,electricityPrice:7.5,operatorPerHour:300,serviceEnabled:true,serviceVolume:1000,serviceTariff:1200,elevatorTariff:150,elevatorBasis:'tonne-point',elevatorOtherPerTonne:100,ownOtherPerTonne:30,delayedSale:true,currentGrainPrice:6500,futureGrainPrice:8500,storageCostPerTonne:200,dryerPrice:8000000,installation:0,additionalInvestment:0,availableHours:300,dailyHours:20};
await test('report scenarios use engine and preserve inputs and seasonal fixed costs',()=>{
 const original=JSON.stringify({input,data}),a=reportAnalysis(input,data);
 assert.equal(JSON.stringify({input,data}),original);
 assert.deepEqual(a.baseline.result,calculateEngineering(input,data));
 assert.deepEqual(a.tariff.map(s=>s.input.elevatorTariff),[120,150,180]);
 for(const s of [...a.tariff,...a.fuel,...a.volumes,...a.moisture])assert.deepEqual(s.result,calculateEngineering(s.input,data));
 assert.equal(a.volumes[0].result.own.fixedCost,a.volumes[4].result.own.fixedCost);
 assert.ok(a.volumes[4].result.warnings.includes('SEASON_TOO_SHORT'));
 assert.equal(a.moisture[0].result.capacity,null);
 assert.equal(a.moisture[0].result.paybackSeasons,null);
 const atThreshold=calculateEngineering({...input,volume:a.operationalBreakEven},data);
 assert.ok(Math.abs(atThreshold.savings)<1e-6);
});
await test('report cannot invent missing prices, capacity, transport thresholds or returns',()=>{
 const a=reportAnalysis({...input,fuelPrice:null,elevatorTariff:null},data);
 assert.ok(a.fuel.every(s=>s.result.own.fuelCost===null));
 assert.ok(a.tariff.every(s=>s.result.paybackSeasons===null));
 assert.equal(a.operationalBreakEven,null);
 assert.equal(reportAnalysis({...input,elevatorDistanceKm:10},data).operationalBreakEven,null);
 assert.equal(divide(null,100),null);assert.equal(divide(100,0),null);
 const loss=reportAnalysis({...input,elevatorTariff:0,elevatorOtherPerTonne:0},data);
 assert.equal(loss.baseline.result.paybackSeasons,null);assert.equal(loss.operationalBreakEven,null);
});
await test('UA and EN reports stay five pages with full and missing data',async()=>{
 const font=fs.readFileSync(new URL('../public/fonts/NotoSans.ttf',import.meta.url));
 for(const en of [false,true])for(const patch of [{},{cropId:'sunflower',initialMoisture:14,finalMoisture:7,fuelPrice:null,dryerPrice:null,elevatorTariff:null}]) {
  const i={...input,...patch},result=calculateEngineering(i,data);
  const snapshot={input:i,result,modelName:'S13',cropName:en?'Corn':'Кукурудза',fuelName:en?'Diesel':'Дизель',fuelUnit:'L',missing:result.missing,warnings:result.warnings};
  const bytes=await createEngineeringReport(snapshot,en,font,data);
  assert.equal((await PDFDocument.load(bytes)).getPageCount(),5);
 }
});
