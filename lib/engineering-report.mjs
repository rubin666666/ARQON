import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

/** @param {import('./engineering-types').ReportSnapshot} snapshot
 * @param {boolean} en
 * @param {Uint8Array} fontBytes
 */
export async function createEngineeringReport(snapshot, en, fontBytes) {
  const pdf = await PDFDocument.create();pdf.registerFontkit(fontkit);
  const font = await pdf.embedFont(fontBytes,{subset:true});
  const t=(uk,english)=>en?english:uk;
  const n=(value,unit='')=>value==null?'—':`${new Intl.NumberFormat(en?'en-GB':'uk-UA',{maximumFractionDigits:2}).format(value)} ${unit}`.trim();
  const ink=rgb(.16,.15,.17),muted=rgb(.39,.36,.38),orange=rgb(.72,.25,.05);
  const {input:i,result:r}=snapshot;
  pdf.setTitle(`ARQON ${snapshot.modelName} — ${t('Технічний підсумок','Technical summary')}`);pdf.setAuthor('ARQON');
  let page,y,pageNumber=0;
  const text=(value,x,yy,size=11,color=ink)=>page.drawText(String(value),{x,y:yy,size,font,color});
  function wrap(value,size,width) {
    const rows=[];let row='';
    for(const word of value.split(/\s+/)) {const next=row?`${row} ${word}`:word;if(row && font.widthOfTextAtSize(next,size)>width){rows.push(row);row=word;}else row=next;}
    if(row)rows.push(row);return rows;
  }
  function start(title) {
    page=pdf.addPage([595.28,841.89]);pageNumber++;
    text('ARQON',42,786,25);text(snapshot.modelName,450,790,19,orange);
    text(t('ТЕХНІЧНИЙ ПІДСУМОК','TECHNICAL SUMMARY'),42,762,10,muted);
    page.drawRectangle({x:42,y:738,width:511,height:2,color:orange});
    text(title,42,704,20);y=675;
    text(`${r.engineVersion} / ${r.parameterVersion}`,42,32,8,muted);text(String(pageNumber),540,32,9,muted);
  }
  function paragraph(value) {for(const row of wrap(value,10,505)){if(y<78)start(t('Продовження','Continued'));text(row,42,y,10,muted);y-=15;}y-=12;}
  function heading(value){if(y<120)start(t('Продовження','Continued'));text(value,42,y,13,orange);y-=25;}
  function row(label,value) {
    const lines=wrap(label,10,290),height=Math.max(30,lines.length*15+12);
    if(y-height<70)start(t('Продовження','Continued'));
    lines.forEach((line,j)=>text(line,42,y-j*15,10,muted));
    const size=11;const width=font.widthOfTextAtSize(String(value),size);
    text(value,Math.max(345,553-width),y,size);y-=height;
    page.drawLine({start:{x:42,y:y+11},end:{x:553,y:y+11},thickness:.4,color:rgb(.87,.85,.85)});
  }
  start(t('Вхідні дані та матеріальний баланс','Inputs and material balance'));
  paragraph(t('Попередній підсумок доступних даних. Не є комерційною пропозицією. Прочерк означає, що показник неможливо визначити з наявних параметрів.','Preliminary summary of available data. Not a commercial offer. A dash means a result cannot be determined from the available parameters.'));
  row(t('Дата','Date'),new Date(snapshot.createdAt || Date.now()).toLocaleDateString(en?'en-GB':'uk-UA'));
  if(snapshot.clientName)paragraph(t('Для: ','Prepared for: ')+snapshot.clientName);
  if(snapshot.calculationId)paragraph(t('Розрахунок: ','Calculation: ')+snapshot.calculationId);
  row(t('Культура','Crop'),snapshot.cropName);row(t('Власне зерно','Own grain'),n(i.volume,'t'));
  row(t('Початкова / кінцева вологість','Initial / final moisture'),`${n(i.initialMoisture)} / ${n(i.finalMoisture)} %`);
  row(t('Паливо','Fuel'),snapshot.fuelName);row(t('Ціна палива','Fuel price'),n(i.fuelPrice,`UAH/${snapshot.fuelUnit}`));
  row(t('Ціна електроенергії','Electricity price'),n(i.electricityPrice,'UAH/kWh'));
  heading(t('Власне зерно після сушіння','Own grain after drying'));
  row(t('Суха речовина','Dry matter'),n(r.own?.dryMatterKg,'kg'));row(t('Кінцева маса','Final mass'),n(r.own?.finalKg,'kg'));row(t('Видалена вода','Water removed'),n(r.own?.waterKg,'kg'));
  paragraph(t('Баланс передбачає відсутність втрат сухої речовини.','The material balance assumes no loss of dry matter.'));
  start(t('Продуктивність, енергія та послуги','Capacity, energy and services'));
  row(t('Еталонна продуктивність із таблиці','Reference capacity from supplied table'),n(r.referenceCapacity,'t/h'));
  row(t('Еталонна вологість і температура повітря','Reference moisture and air temperature'),`${n(r.referenceInput)} / ${n(r.referenceOutput)} % / ${n(r.referenceTemperature)} °C`);
  row(t('Продуктивність обраного режиму','Capacity at selected regime'),n(r.capacity,'t/h'));
  row(t('Час власного сушіння','Own drying hours'),n(r.own?.hours,'h'));
  row(t('Енергія пальника для власного зерна','Burner energy for own grain'),n(r.own?.burnerMJ,'MJ'));
  row(t('Паливо для власного зерна','Fuel for own grain'),n(r.own?.fuelQuantity,snapshot.fuelUnit));
  row(t('Електроенергія для власного зерна','Electricity for own grain'),n(r.own?.electricityKwh,'kWh'));
  row(t('Собівартість сушіння','Drying cost'),n(r.own?.perTonne,'UAH/t'));
  if(i.serviceEnabled){heading(t('Послуги іншим господарствам','Service to other farms'));row(t('Обсяг стороннього зерна','Service grain volume'),n(i.serviceVolume,'t'));row(t('Тариф послуги','Service tariff'),n(i.serviceTariff,'UAH/t'));row(t('Виручка до витрат','Revenue before costs'),n(r.serviceRevenue,'UAH'));row(t('Витрати на послуги','Service costs'),n(r.service?.dryingCost,'UAH'));row(t('Чистий прибуток','Net profit'),n(r.serviceProfit,'UAH'));paragraph(t('Стороннє зерно: та сама культура та вологість, що для власного.','Service grain uses the same crop and moisture as own grain.'));}
  row(t('Сумарний час роботи','Total operating time'),n(r.totalHours,'h'));row(t('Доступний час сезону','Available seasonal time'),n(i.availableHours,'h'));
  start(t('Економіка та межі розрахунку','Economics and calculation limits'));
  row(t('Тариф елеватора','Elevator tariff'),n(i.elevatorTariff,i.elevatorBasis==='tonne'?'UAH/t':'UAH/t-%'));
  row(t('Інші витрати елеватора / власні','Other elevator / own costs'),`${n(i.elevatorOtherPerTonne)} / ${n(i.ownOtherPerTonne)} UAH/t`);
  row(t('Елеватор за сезон','Seasonal elevator costs'),n(r.elevatorCost,'UAH'));row(t('Власна система за сезон','Seasonal own-system costs'),n(r.ownSystemCost,'UAH'));
  row(t('Економія на власному зерні','Own grain savings'),n(r.savings,'UAH'));
  if(i.delayedSale){row(t('Поточна / очікувана ціна зерна','Current / expected grain price'),`${n(i.currentGrainPrice)} / ${n(i.futureGrainPrice)} UAH/t`);row(t('Різниця виручки від продажу','Additional sale revenue'),n(r.priceRevenue,'UAH'));}
  row(t('Загальна інвестиція','Total investment'),n(r.investment,'UAH'));row(t('Економічний ефект за сезон','Economic effect per season'),n(r.economicEffect,'UAH'));
  row(t('Окупність, сезонів','Payback, seasons'),r.economicEffect!==null && r.economicEffect<=0?t('Не досягається','Not reached'):n(r.paybackSeasons));
  row(t('ROI за сезон','ROI per season'),n(r.roiPerSeason,'%'));
  if(snapshot.missing.length){heading(t('Відсутні дані','Missing data'));paragraph(snapshot.missing.join('; ')+'.');}
  snapshot.warnings.forEach(paragraph);
  paragraph(t('Розрахунок є попередньою інженерно-економічною оцінкою. Фактичні витрати, продуктивність і результат залежать від зерна, режиму роботи, погоди та якості палива. Остаточні параметри визначаються для конкретного проєкту. Один сезон не обов’язково дорівнює одному року.','This is a preliminary engineering and economic estimate. Actual consumption, capacity and results depend on grain, operating regime, weather and fuel quality. Final parameters are determined for each project. One season is not necessarily one year.'));
  return pdf.save();
}

/** @param {import('./engineering-types').ReportSnapshot} snapshot @param {boolean} en @param {string} fontUrl */
export async function downloadEngineeringReport(snapshot,en,fontUrl) {
  const response=await fetch(fontUrl);if(!response.ok)throw new Error('Font unavailable');
  const bytes=await createEngineeringReport(snapshot,en,new Uint8Array(await response.arrayBuffer()));
  const url=URL.createObjectURL(new Blob([new Uint8Array(bytes)],{type:'application/pdf'}));
  const a=document.createElement('a');a.href=url;a.download=`ARQON-${snapshot.modelName}-technical-summary.pdf`;document.body.appendChild(a);a.click();a.remove();return {url,filename:a.download};
}
