import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {calculateEngineering} from '../lib/engineering.mjs';
const actual=JSON.parse(fs.readFileSync(new URL('../config/engineering.json',import.meta.url)));
const input={modelId:'sahara-s9',cropId:'corn',volume:1,initialMoisture:25,finalMoisture:15,fuelId:'diesel',fuelPrice:60,electricityPrice:8,serviceEnabled:false,serviceVolume:0,serviceTariff:null,elevatorTariff:200,elevatorBasis:'tonne',elevatorOtherPerTonne:0,ownOtherPerTonne:0,delayedSale:false,currentGrainPrice:null,futureGrainPrice:null,dryerPrice:100000,installation:10000,additionalInvestment:0,availableHours:null};
// Synthetic fixtures are deliberately confined to tests; not manufacturer values.
function fixture(){const d=structuredClone(actual);d.models[0].reference=d.models[0].previousReference;Object.assign(d.models[0],{thermalApproved:true,electricalPower:20,burnerPower:5000,supportedFuels:['diesel'],burnerEfficiency:.9,lossFactor:.1,recoveredFraction:.05,operatorPerHour:10,maintenancePerHour:5,seasonalFixed:100});Object.assign(d.crops[0],{grainHeat:.0015,latentHeat:2.3,waterDelta:50,grainDelta:30});d.fuels[0].heatingValue=36;return d;}
await test('manufacturer data yields mass and capacity without inventing operating rates',()=>{const r=calculateEngineering(input,actual);assert.equal(r.status,'partial');assert.ok(Math.abs(r.own.waterKg-117.647058824)<.0001);assert.equal(r.own.dryMatterKg,750);assert.equal(r.capacity,6);assert.ok(r.own.fuelQuantity>0);assert.equal(r.economicEffect,null);assert.equal(r.paybackSeasons,null);});
await test('every supplied model/crop point reproduces its capacity and working hours',()=>{for(const m of actual.models)for(const p of m.reference){const r=calculateEngineering({...input,modelId:m.id,cropId:p.cropId,initialMoisture:p.input,finalMoisture:p.output,volume:1000},actual);assert.equal(r.capacity,p.status==='pending'?null:p.capacity);assert.equal(r.own.hours,p.status==='pending'?null:r.own.finalKg/1000/p.capacity);assert.ok(Math.abs(r.own.rawKg-r.own.finalKg-r.own.waterKg)<1e-7);}});
await test('rejects arbitrary and obsolete moisture regimes',()=>{for(const change of [{initialMoisture:20},{initialMoisture:30},{finalMoisture:14}]){const r=calculateEngineering({...input,...change},actual);assert.equal(r.status,'invalid');assert.ok(r.warnings.includes('UNSUPPORTED_REGIME'));}});
await test('prices scale only their matching energy costs',()=>{const d=fixture(),i={...input,finalMoisture:15};const a=calculateEngineering(i,d),b=calculateEngineering({...i,fuelPrice:66},d),c=calculateEngineering({...i,electricityPrice:8.8},d);assert.equal(a.status,'ready');assert.ok(Math.abs(b.own.fuelCost/a.own.fuelCost-1.1)<1e-10);assert.equal(a.own.electricityCost,b.own.electricityCost);assert.ok(Math.abs(c.own.electricityCost/a.own.electricityCost-1.1)<1e-10);});
await test('service revenue is not profit and fixed cost is counted exactly once',()=>{const d=fixture(),r=calculateEngineering({...input,finalMoisture:15,volume:10,serviceEnabled:true,serviceVolume:5,serviceTariff:500},d);assert.equal(r.serviceRevenue,2500);assert.equal(r.serviceProfit,2500-r.service.dryingCost);assert.ok(Math.abs(r.own.fixedCost+r.service.fixedCost-100)<1e-10);assert.ok(Math.abs(r.totalHours-(r.own.finalKg+r.service.finalKg)/1000/r.capacity)<1e-10);assert.equal(r.own.perTonne,r.own.dryingCost/10);});
await test('service OFF ignores hidden fields and returns zero service profit',()=>{const r=calculateEngineering({...input,serviceVolume:NaN,serviceTariff:NaN},actual);assert.notEqual(r.status,'invalid');assert.equal(r.serviceRevenue,0);assert.equal(r.serviceProfit,0);});
await test('negative economic effect gives no payback; ROI may be negative',()=>{const r=calculateEngineering({...input,finalMoisture:15,elevatorTariff:0},fixture());assert.ok(r.economicEffect<0);assert.equal(r.paybackSeasons,null);assert.ok(r.roiPerSeason<0);});
await test('tariff types differ and delayed sale uses final mass',()=>{const a=calculateEngineering({...input,finalMoisture:15,elevatorBasis:'tonne-point',delayedSale:true,currentGrainPrice:100,futureGrainPrice:110},fixture());assert.equal(a.elevatorCost,2000);assert.equal(a.priceRevenue,a.own.finalKg/1000*10);});
await test('hours include services; inadequate thermal capacity is flagged',()=>{const d=fixture();d.models[0].burnerPower=1;const r=calculateEngineering({...input,finalMoisture:15,availableHours:.01},d);assert.ok(r.warnings.includes('SEASON_TOO_SHORT'));assert.ok(r.warnings.includes('THERMAL_POWER_INSUFFICIENT'));});
await test('rejects impossible inputs and unknown models',()=>{for(const change of [{initialMoisture:100},{finalMoisture:25},{volume:0},{volume:Infinity},{modelId:'unknown'},{serviceEnabled:true,serviceVolume:0},{fuelPrice:-1}])assert.equal(calculateEngineering({...input,...change},actual).status,'invalid');});
await test('source points agree with published manufacturer specifications',()=>{const site=JSON.parse(fs.readFileSync(new URL('../config/site.json',import.meta.url)));for(const m of actual.models){const source=site.models.find(s=>s.id===m.id);m.reference.forEach((p,i)=>{if(p.status==='pending')assert.equal(source.specifications[i].value.en,'Pending confirmation');else assert.equal(p.capacity,parseFloat(source.specifications[i].value.en));});}});
await test('deterministic outputs and no mutation of input or parameters',()=>{const d=fixture(),before=JSON.stringify(d),i={...input,finalMoisture:15};assert.deepEqual(calculateEngineering(i,d),calculateEngineering(i,d));assert.equal(JSON.stringify(d),before);});

const control={...input,modelId:'sahara-s13',volume:1000,electricityPrice:7,operatorPerHour:300,maintenancePerSeason:0,ambientTemperature:20};
await test('client control scenario uses dry matter, sequential recovery and per-incoming-tonne units',()=>{
 const r=calculateEngineering(control,actual);
 const dried=750000/.85, water=1000000-dried;
 assert.ok(Math.abs(r.own.waterKg-water)<1e-8);
 assert.ok(Math.abs(r.own.usefulMJ-(water*2.26+36000))<1e-8);
 assert.ok(Math.abs(r.own.hours-dried/1000/15)<1e-8);
 assert.ok(Math.abs(r.own.electricityKwh-(dried/1000/15)*70.4)<1e-8);
 assert.equal(r.capacity,15);
 assert.equal(r.own.perTonne,r.own.dryingCost/1000);
});
await test('gas and wood chips use fuel-specific efficiency with no duplicate heat-exchanger loss',()=>{
 const gas=calculateEngineering({...control,fuelId:'natural_gas'},actual),wood=calculateEngineering({...control,fuelId:'wood_chips'},actual);
 assert.ok(Math.abs(gas.own.fuelQuantity-gas.own.usefulMJ*1.05*.8/.9/34)<1e-8);
 assert.ok(Math.abs(wood.own.fuelQuantity-wood.own.usefulMJ*1.05*.8/.65/12)<1e-8);
});
await test('ambient temperature, crop limits and maintenance allocation',()=>{
 const cold=calculateEngineering({...control,ambientTemperature:-10},actual),warm=calculateEngineering(control,actual);
 assert.ok(cold.own.fuelQuantity>warm.own.fuelQuantity);
 const flower=calculateEngineering({...control,cropId:'sunflower',initialMoisture:22,finalMoisture:7},actual);
 assert.ok(flower.own.fuelQuantity>0);assert.ok(!flower.missing.includes('THERMAL_PARAMETERS'));assert.equal(actual.crops.find(c=>c.id==='sunflower').finalGrainTemperature,45);
 const services=calculateEngineering({...control,maintenancePerSeason:90000,serviceEnabled:true,serviceVolume:1000,serviceTariff:1000},actual);
 assert.equal(services.own.fixedCost+services.service.fixedCost,90000);
 for(const update of [{ambientTemperature:Infinity},{ambientTemperature:61},{operatorPerHour:-1},{maintenancePerSeason:-1}])assert.equal(calculateEngineering({...control,...update},actual).status,'invalid');
});
await test('control payback is a scenario, not a catalogue price',()=>{
 const r=calculateEngineering({...control,volume:2000,elevatorTariff:1500,dryerPrice:4500000,installation:0,maintenancePerSeason:90000},actual);
 assert.equal(r.paybackSeasons,4500000/r.economicEffect);assert.ok(r.paybackSeasons>0);
 assert.equal(actual.models.find(m=>m.id==='sahara-s13').price,null);
});

await test('workbook power values are consumed without a second 0.8 multiplier',()=>{
 const power=[19.76,38.96,45.2,70.4,92.48,136.16],burners=[800,1600,1600,2000,3400,6000];
 actual.models.forEach((m,i)=>{const r=calculateEngineering({...input,modelId:m.id},actual);assert.equal(m.electricalPower,power[i]);assert.equal(m.burnerPower,burners[i]);assert.equal(r.own.electricityKwh,r.own.hours*power[i]);});
});

await test('operator wages are optional farm costs and never part of investment',()=>{
 const base={...input,maintenancePerSeason:0};
 const excluded=calculateEngineering(base,actual), included=calculateEngineering({...base,operatorPerHour:300},actual);
 assert.equal(excluded.own.operatorCost,0);
 assert.equal(included.own.operatorCost,included.own.hours*300);
 assert.ok(Math.abs(included.own.dryingCost-excluded.own.dryingCost-included.own.operatorCost)<1e-8);
 assert.equal(excluded.investment,included.investment);
 assert.equal(excluded.status,'ready');
});
