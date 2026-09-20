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
  const units={'UAH/L':'грн/л','UAH':'грн','UAH/h':'грн/год','UAH/t':'грн/т','UAH/t-%':'грн/т-%','UAH/kWh':'грн/кВт·год','UAH/season':'грн/сезон','t':'т','t/h':'т/год','h':'год','days':'діб','kg':'кг','kW':'кВт','km':'км','MJ':'МДж','kWh':'кВт·год'};
  const n=(value,unit='')=>value==null?'—':`${new Intl.NumberFormat(en?'en-GB':'uk-UA',{maximumFractionDigits:2}).format(value)} ${en?unit:(units[unit] ?? unit.replace('UAH/','грн/'))}`.trim();
  const ink=rgb(.16,.15,.17),muted=rgb(.39,.36,.38),orange=rgb(.72,.25,.05);
  const {input:i,result:r}=snapshot;
  pdf.setTitle(`ARQON ${snapshot.modelName} — ${t('Результат розрахунку','Calculation result')}`);pdf.setAuthor('ARQON.UA');
  let page,y,pageNumber=0;
  const text=(value,x,yy,size=11,color=ink)=>page.drawText(String(value),{x,y:yy,size,font,color});
  function wrap(value,size,width) {
    const rows=[];let row='';
    for(const word of String(value).split(/\s+/).flatMap(word=>{const parts=[];let part='';for(const char of word){if(part && font.widthOfTextAtSize(part+char,size)>width){parts.push(part);part='';}part+=char;}if(part)parts.push(part);return parts;})) {const next=row?`${row} ${word}`:word;if(row && font.widthOfTextAtSize(next,size)>width){rows.push(row);row=word;}else row=next;}
    if(row)rows.push(row);return rows;
  }
  function start(title) {
    page=pdf.addPage([595.28,841.89]);pageNumber++;
    page.drawRectangle({x:0,y:738,width:595.28,height:104,color:rgb(.97,.94,.95)});text('A',42,786,25,rgb(.78,.06,.17));text('RQON.UA',58,786,25);text(snapshot.modelName.replace(/^S(?=\d)/,'SAHARA-'),415,790,17,orange);
    text(t('РЕЗУЛЬТАТ РОЗРАХУНКУ','CALCULATION RESULT'),42,762,10,muted);
    const disclaimer=t('ВАЖЛИВО: цей звіт має виключно ознайомчий характер і не може сприйматися як складова бізнес-плану.','IMPORTANT: This report is for information only and must not be treated as part of a business plan.');
    wrap(disclaimer,8.5,505).forEach((line,j)=>text(line,42,722-j*12,8.5,orange));
    page.drawRectangle({x:42,y:738,width:511,height:2,color:orange});
    text(title,42,673,19);y=644;
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
  start(t('Ваш сезон у цифрах','Your season at a glance'));
  text(snapshot.cropName,42,y,23,orange);y-=35;
  if(snapshot.clientName)paragraph(t('Для: ','Prepared for: ')+snapshot.clientName);
  if(snapshot.clientContact)paragraph(t('Контакт: ','Contact: ')+snapshot.clientContact);
  if(r.own){
    heading(t('Баланс власного зерна','Own grain balance'));
    text(n(r.own.rawKg/1000,t('т до сушіння','t before drying')),42,y,22);y-=38;
    const retained=r.own.finalKg/r.own.rawKg*511;
    page.drawRectangle({x:42,y:y-18,width:retained,height:18,color:orange});
    page.drawRectangle({x:42+retained,y:y-18,width:511-retained,height:18,color:rgb(.45,.61,.69)});y-=47;
    row(t('Після сушіння','After drying'),n(r.own.finalKg/1000,t('т','t')));
    row(t('Видалена вода','Water removed'),n(r.own.waterKg/1000,t('т','t')));
    row(t('Суха речовина','Dry matter'),n(r.own.dryMatterKg/1000,t('т','t')));
    paragraph(t('Помаранчевий сегмент - зерно після сушіння; блакитний - видалена вода. Суха речовина - маса зерна без води. Баланс передбачає відсутність її втрат.','Orange segment: grain after drying; blue: removed water. Dry matter is grain mass excluding water. The balance assumes none is lost.'));
  }
  heading(t('Результати для обраних умов','Results for selected conditions'));
  row(t('Продуктивність за висушеним зерном','Dried grain capacity'),n(r.capacity,t('т/год','t/h')));
  row(t('Час власного сушіння','Own drying time'),n(r.own?.hours,t('год','h')));
  row(t('Тривалість за графіком 20 год/добу','Duration at 20 operating hours/day'),n(r.own?.days,'days'));
  if(r.economicEffect===null)paragraph(t('Фінансова оцінка поки неповна. Для розрахунку витрат та окупності потрібні відсутні параметри, перелічені наприкінці звіту.','Financial assessment is incomplete. Costs and payback require the missing parameters listed at the end of this report.'));
  paragraph(t('Далі: введені параметри, технічні результати та деталізація економіки.','Next: entered parameters, technical results and detailed economics.'));
  start(t('Ваші вхідні параметри','Your input parameters'));
  paragraph(t('Попередній підсумок доступних даних. Не є комерційною пропозицією. Прочерк означає, що показник неможливо визначити з наявних параметрів.','Preliminary summary of available data. Not a commercial offer. A dash means a result cannot be determined from the available parameters.'));
  row(t('Дата','Date'),new Date(snapshot.createdAt || Date.now()).toLocaleDateString(en?'en-GB':'uk-UA'));
  if(snapshot.clientName)paragraph(t('Для: ','Prepared for: ')+snapshot.clientName);
  if(snapshot.calculationId)paragraph(t('Розрахунок: ','Calculation: ')+snapshot.calculationId);
  row(t('Культура','Crop'),snapshot.cropName);row(t('Прогнозований урожай за сезон','Forecast total seasonal harvest'),n(i.volume,'t'));
  row(t('Початкова / кінцева вологість','Initial / final moisture'),`${n(i.initialMoisture)} / ${n(i.finalMoisture)} %`);
  row(t('Температура довкілля','Ambient temperature'),n(i.ambientTemperature ?? 20,'°C'));
  row(t('Оператор','Operator'),i.operatorPerHour == null ? t('Не враховано','Excluded') : n(i.operatorPerHour,'UAH/h'));
  row(t('Обслуговування та постійні витрати (1% ціни)','Maintenance and fixed costs (1% of price)'),n(r.own?.fixedCost,'UAH/season'));
  row(t('Паливо','Fuel'),snapshot.fuelName);row(t('Ціна палива','Fuel price'),n(i.fuelPrice,`UAH/${snapshot.fuelUnit}`));
  row(t('Ціна електроенергії','Electricity price'),n(i.electricityPrice,'UAH/kWh'));
  paragraph(t('Амортизація не врахована. Зарплата оператора — окрема витрата господарства; без введеного тарифу вона не включається.','Depreciation is excluded. Operator wages are a separate farm expense and are excluded unless a rate is entered.'));
  heading(t('Економічні параметри','Economic inputs'));
  row(t('Тариф елеватора','Elevator tariff'),n(i.elevatorTariff,i.elevatorBasis==='tonne'?'UAH/t':'UAH/t-%'));
  row(t('Інші витрати елеватора / власні','Other elevator / own costs'),`${n(i.elevatorOtherPerTonne)} / ${n(i.ownOtherPerTonne)} ${t('грн/т','UAH/t')}`);
  row(t('Вартість сушарки','Dryer price'),n(r.investment,'UAH'));
  if(i.delayedSale){row(t('Поточна / очікувана ціна зерна','Current / expected grain price'),`${n(i.currentGrainPrice)} / ${n(i.futureGrainPrice)} ${t('грн/т','UAH/t')}`);}
  start(t('Як розраховані енерговитрати','How energy use is calculated'));
  row(t('Початкова / кінцева вологість; повітря','Initial / final moisture; air temperature'),`${n(r.referenceInput)} / ${n(r.referenceOutput)} % / ${n(r.referenceTemperature)} °C`);
  row(t('Час сушіння = сухе зерно / продуктивність','Drying time = dried grain / capacity'),n(r.own?.hours,'h'));
  row(t('Робоча потужність електродвигунів','Operating motor power'),n(r.own?.electricalPower,'kW'));
  row(t('Електроенергія = робоча потужність × час','Electricity = operating power × time'),n(r.own?.electricityKwh,'kWh'));
  paragraph(t('У таблиці виробника електрична потужність уже помножена на 0,8. Повторно цей коефіцієнт не застосовуємо. Тривалість у добах = робочі години / 20; простої не додаються до енергоспоживання.','Manufacturer motor power already includes the 0.8 factor; it is not applied again. Duration in days = operating hours / 20; downtime does not add energy consumption.'));
  heading(t('Тепловий баланс власного зерна','Own grain thermal balance'));
  row(t('Нагрів води','Water heating'),n(r.own?.waterHeatingMJ,'MJ'));
  row(t('Випаровування води','Water evaporation'),n(r.own?.evaporationMJ,'MJ'));
  row(t('Нагрів сухої речовини зерна','Heating grain dry matter'),n(r.own?.grainHeatingMJ,'MJ'));
  row(t('Корисна теплова потреба: сума трьох складових','Useful heat: sum of the three components'),n(r.own?.usefulMJ,'MJ'));
  row(t('Втрати / рекуперація / ККД','Losses / heat recovery / efficiency'),`${n(r.own?.lossFactor == null ? null : r.own.lossFactor*100)} / ${n(r.own?.recoveredFraction == null ? null : r.own.recoveredFraction*100)} / ${n(r.own?.efficiency == null ? null : r.own.efficiency*100)} %`);
  row(t('Енергія палива до перетворення на тепло','Fuel energy before conversion to heat'),n(r.own?.burnerMJ,'MJ'));
  row(t('Розрахункова кількість палива','Calculated fuel quantity'),n(r.own?.fuelQuantity,snapshot.fuelUnit));
  paragraph(t('Енергія палива = корисна теплова потреба × (1 + втрати) × (1 - рекуперація) / ККД. Кількість палива = енергія палива / теплотворність. Кожен коефіцієнт враховано один раз. Нагрівається суха речовина від заданої температури довкілля до 50 °C (соняшник - 45 °C). Витрата розрахункова, не паспортна.','Fuel energy = useful heat × (1 + losses) × (1 - recovery) / efficiency. Fuel quantity = fuel energy / heating value. Each factor is applied once. Dry matter is heated from the entered ambient temperature to 50 °C (sunflower: 45 °C). Consumption is calculated, not a rated specification.'));
  start(t('Витрати власного сушіння','Own drying cost breakdown'));
  row(t('Паливо','Fuel'),n(r.own?.fuelCost,'UAH'));
  row(t('Електроенергія','Electricity'),n(r.own?.electricityCost,'UAH'));
  row(t('Оплата оператора','Operator wages'),n(r.own?.operatorCost,'UAH'));
  row(t('Обслуговування і постійні витрати: 1% ціни','Maintenance and fixed costs: 1% of price'),n(r.own?.fixedCost,'UAH'));
  row(t('Разом сушіння','Total drying costs'),n(r.own?.dryingCost,'UAH'));
  row(t('На тонну вхідного зерна','Per incoming tonne'),n(r.own?.perTonne,'UAH/t'));
  row(t('Інші власні витрати','Other own-system costs'),n(i.volume*i.ownOtherPerTonne,'UAH'));
  row(t('Власна система: разом за сезон','Own system: seasonal total'),n(r.ownSystemCost,'UAH'));
  paragraph(t('1% нараховується один раз за сезон на ціну сушарки та входить у базові витрати власного сушіння. Послугам стороннім господарствам відносимо лише їхні змінні витрати. Амортизація й монтаж не включені. Усі ціни мають бути на однаковій основі щодо ПДВ.','The 1% allowance is charged once per season against dryer price, in the own-drying baseline. Services to other farms carry only their incremental variable costs. Depreciation and installation are excluded. Use a consistent VAT basis for all prices.'));
  heading(t('Порівняння з елеватором','Elevator comparison'));
  row(t('Сушіння на елеваторі','Elevator drying'),n(i.elevatorTariff == null ? null : i.volume*i.elevatorTariff*(i.elevatorBasis==='tonne-point'?i.initialMoisture-i.finalMoisture:1),'UAH'));
  row(t('Інші витрати елеватора','Other elevator costs'),n(i.volume*i.elevatorOtherPerTonne,'UAH'));
  row(t('Доставка власним транспортом','Delivery with own truck'),n(r.transportCost,'UAH'));
  row(t('Елеватор: разом за сезон','Elevator: seasonal total'),n(r.elevatorCost,'UAH'));
  paragraph(t('Для тарифу грн/т-%: вхідна маса × зняті відсоткові пункти вологості × тариф. Наприклад: 1000 т × (25 - 15) × 150 = 1 500 000 грн.','For UAH/t-% tariffs: incoming mass × moisture percentage points removed × tariff. Example: 1,000 t × (25 - 15) × 150 = 1,500,000 UAH.'));
  if((i.elevatorDistanceKm ?? 0)>0){
    start(t('Доставка та додаткові послуги','Transport and additional services'));
    row(t('Відстань до елеватора в один бік','One-way elevator distance'),n(i.elevatorDistanceKm,'km'));
    row(t('Вантажність автомобіля','Truck payload'),n(i.truckPayloadTonnes,'t'));
    row(t('Витрата дизеля / ціна','Diesel consumption / price'),`${n(i.truckLitresPer100Km)} ${t('л/100 км','L/100 km')} / ${n(i.transportDieselPrice,'UAH/L')}`);
    row(t('Оплата водія за повний рейс','Driver pay per round trip'),n(i.driverPerTrip,'UAH'));
    row(t('Разом доставка','Total delivery'),n(r.transportCost,'UAH'));
  } else if(i.serviceEnabled) start(t('Послуги іншим господарствам','Services to other farms'));
  if(i.serviceEnabled){
    heading(t('Сушіння стороннього зерна','Drying service grain'));
    row(t('Вхідний обсяг / тариф за тонну','Incoming volume / tariff per tonne'),`${n(i.serviceVolume,'t')} / ${n(i.serviceTariff,'UAH/t')}`);
    row(t('Виручка від послуг','Service revenue'),n(r.serviceRevenue,'UAH'));
    row(t('Паливо','Fuel'),n(r.service?.fuelCost,'UAH'));
    row(t('Електроенергія','Electricity'),n(r.service?.electricityCost,'UAH'));
    row(t('Оператор','Operator'),n(r.service?.operatorCost,'UAH'));
    row(t('Витрати на послуги разом','Total service costs'),n(r.service?.dryingCost,'UAH'));
    row(t('Прибуток від послуг','Service profit'),n(r.serviceProfit,'UAH'));
    paragraph(t('Та сама культура та вологість, що для власного зерна. Прибуток від послуг рахується окремо від економії власного сушіння.','Uses the same crop and moisture as own grain. Service profit is separate from savings on own drying.'));
  }
  start(t('Економія та сценарії окупності','Savings and payback scenarios'));
  row(t('A. Економія на власному сушінні','A. Own drying savings'),n(r.savings,'UAH'));
  row(t('B. Прибуток від послуг','B. Service profit'),n(r.serviceProfit,'UAH'));
  if(i.delayedSale){
    row(t('Різниця виручки при зміні ціни','Gross revenue from price change'),n(r.priceRevenue,'UAH'));
    row(t('Зберігання та супутні витрати','Storage and related costs'),n(r.storageCost,'UAH'));
    row(t('C. Потенційний ефект відкладеного продажу','C. Potential delayed-sale effect'),n(r.priceEffect,'UAH'));
    paragraph(t('Це сценарій очікуваної ціни, не гарантований прибуток. Введені витрати мають включати зберігання, вентиляцію, контроль, втрати та оборотний капітал. Цей ефект не входить до основної окупності.','Expected-price scenario, not guaranteed profit. Entered costs must include storage, ventilation, monitoring, losses and working capital. This effect is excluded from primary payback.'));
  }
  row(t('Сумарний потенціал: A + B + C','Combined potential: A + B + C'),n(r.economicEffect,'UAH'));
  row(t('Інвестиція: ціна сушарки','Investment: dryer price'),n(r.investment,'UAH'));
  heading(t('Окупність, сезонів','Payback, seasons'));
  row(t('Лише власне сушіння: інвестиція / A','Own drying only: investment / A'),n(r.paybackSeasons));
  const withoutOther = r.savings == null ? null : r.savings - i.volume*i.elevatorOtherPerTonne - (r.transportCost ?? 0);
  row(t('Без доставки та інших витрат елеватора','Excluding delivery and other elevator costs'),n(r.investment && withoutOther>0 ? r.investment/withoutOther : null));
  if(i.serviceEnabled)row(t('Власне сушіння + послуги: A + B','Own drying + services: A + B'),n(r.servicePaybackSeasons));
  if(i.delayedSale)row(t('З урахуванням цінового сценарію: A + B + C','Including price scenario: A + B + C'),n(r.combinedPaybackSeasons));
  row(t('ROI власного сушіння за сезон','Own drying ROI per season'),n(r.roiPerSeason,'%'));
  row(t('Загальна тривалість, 20 год/добу','Total duration, 20 h/day'),n(r.totalDays,'days'));
  paragraph(t('Окупність не визначається за відсутності ціни сушарки або додатної економії. Один сезон не обов’язково дорівнює одному року.','Payback cannot be determined without a dryer price and positive savings. One season is not necessarily one year.'));
  if(snapshot.missing.length){heading(t('Відсутні дані','Missing data'));paragraph(snapshot.missing.join('; ')+'.');}
  snapshot.warnings.forEach(paragraph);
  return pdf.save();
}

/** @param {import('./engineering-types').ReportSnapshot} snapshot @param {boolean} en @param {string} fontUrl */
export async function downloadEngineeringReport(snapshot,en,fontUrl) {
  const response=await fetch(fontUrl);if(!response.ok)throw new Error('Font unavailable');
  const bytes=await createEngineeringReport(snapshot,en,new Uint8Array(await response.arrayBuffer()));
  const url=URL.createObjectURL(new Blob([new Uint8Array(bytes)],{type:'application/pdf'}));
  const a=document.createElement('a');a.href=url;a.download=`ARQON-${snapshot.modelName}-calculation-result.pdf`;document.body.appendChild(a);a.click();a.remove();return {url,filename:a.download};
}
