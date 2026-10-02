import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import {divide, reportAnalysis} from './report-analysis.mjs';

/** @param {import('./engineering-types').ReportSnapshot} snapshot
 * @param {boolean} en
 * @param {Uint8Array} fontBytes
 * @param {import('./engineering-types').EngineeringData} data
 */
export async function createEngineeringReport(snapshot, en, fontBytes, data) {
  const pdf = await PDFDocument.create(); pdf.registerFontkit(fontkit);
  const font = await pdf.embedFont(fontBytes, {subset:true});
  const t = (uk, english) => en ? english : uk;
  const {input:i, result:r} = snapshot, own = r.own;
  const analysis = reportAnalysis(i, data);
  const unit = value => en ? value : ({UAH:'грн',t:'т',h:'год',days:'діб',L:'л',kg:'кг',kWh:'кВт·год',MJ:'МДж',kW:'кВт',seasons:'сезонів'}[value] ?? value);
  const n = (value, suffix='') => value == null || !Number.isFinite(value) ? '—' : `${new Intl.NumberFormat(en?'en-GB':'uk-UA',{maximumFractionDigits:2}).format(value)} ${unit(suffix)}`.trim();
  const money = value => n(value,'UAH');
  const per = value => `${n(value)} ${t('грн/т','UAH/t')}`;
  const pay = (value, benefit) => value != null ? n(value,'seasons') : benefit != null && benefit <= 0 ? t('Не окупається','No payback') : t('Бракує даних','Missing data');
  const ink=rgb(.12,.14,.16), muted=rgb(.35,.38,.41), orange=rgb(.69,.22,.04), rule=rgb(.86,.87,.88), tint=rgb(.98,.95,.91);
  pdf.setTitle(`ARQON ${snapshot.modelName} — ${t('Звіт калькулятора','Calculator report')}`); pdf.setAuthor('ARQON');
  const pages=[];
  let blocks;
  const start=title=>{blocks=[];pages.push({title,blocks});};
  const note=value=>blocks.push({kind:'note',value});
  const heading=value=>blocks.push({kind:'heading',value});
  const table=(headers,rows,widths)=>blocks.push({kind:'table',headers,rows,widths});
  const pairs=rows=>table([],rows,[.66,.34]);
  const ownT=divide(r.ownSystemCost,i.volume), elevatorT=divide(r.elevatorCost,i.volume), savingsT=divide(r.savings,i.volume);
  const serviceEffect=r.savings == null || r.serviceProfit == null ? null : r.savings+r.serviceProfit;
  const fuelUnit=unit(snapshot.fuelUnit);
  const selectedFuel=data.fuels.find(f=>f.id===i.fuelId), selectedCrop=data.crops.find(c=>c.id===i.cropId);
  const reference=data.models.find(m=>m.id===i.modelId)?.reference.find(p=>p.cropId===i.cropId);
  const tariffUnit=i.elevatorBasis==='tonne-point'?t('грн/т-%','UAH/t-%'):t('грн/т','UAH/t');

  start(t('1  Ваш результат за сезон','1  Your seasonal result'));
  note(`${snapshot.modelName} · ${snapshot.cropName} · ${n(i.volume,'t')} · ${n(i.initialMoisture)} -> ${n(i.finalMoisture)}% · ${new Date(snapshot.createdAt || Date.now()).toLocaleDateString(en?'en-GB':'uk-UA')}`);
  if(snapshot.clientName || snapshot.clientContact)note([snapshot.clientName,snapshot.clientContact].filter(Boolean).join(' · '));
  if(snapshot.calculationId)note(t('Номер розрахунку: ','Calculation ID: ')+snapshot.calculationId);
  if(r.warnings.includes('SEASON_TOO_SHORT') || r.warnings.includes('THERMAL_POWER_INSUFFICIENT'))note(t('УВАГА: є обмеження часу сезону або потужності теплогенератора. Наведена окупність є умовною до перевірки здійсненності режиму; пояснення на сторінці 5.','CAUTION: seasonal time or burner power is insufficient. Payback is conditional on verifying feasibility; see page 5.'));
  heading(t('Базова окупність власної сушарки','Base payback of your dryer'));
  blocks.push({kind:'hero',value:pay(r.paybackSeasons,r.savings)});
  note(t('Лише економія на власному зерні порівняно з елеватором. Інвестиція наразі включає ціну сушарки; повний склад проєкту потребує кошторису.','Only savings on your own grain versus an elevator. Investment currently covers dryer price; a complete project budget is required.'));
  table([t('Результат сушіння','Drying result'),t('Значення','Value')],[
    [t('Готове зерно / видалена вода','Dried grain / removed water'),`${n(own?.finalKg/1000,'t')} / ${n(own?.waterKg/1000,'t')}`],
    [t('Час роботи / безперервно 24 год на добу','Operating time / continuously at 24 h/day'),`${n(own?.hours,'h')} / ${n(divide(own?.hours,24),'days')}`],
    [t(`Тривалість за графіком ${i.dailyHours ?? 20} год/добу`,`Duration at ${i.dailyHours ?? 20} h/day`),n(own?.days,'days')]
  ],[.64,.36]);
  table([t('Порівняння','Comparison'),t('За сезон','Per season'),t('На вхідну тонну','Per incoming tonne')],[
    [t('Елеватор разом','Elevator total'),money(r.elevatorCost),per(elevatorT)],
    [t('Власна система разом','Own system total'),money(r.ownSystemCost),per(ownT)],
    [t('Економія','Savings'),money(r.savings),per(savingsT)]
  ],[.40,.30,.30]);
  note(t('Зміна витрат відносно елеватора: ','Cost reduction versus elevator: ')+n(divide(r.savings,r.elevatorCost)==null?null:divide(r.savings,r.elevatorCost)*100)+'%. '+t('Від’ємне значення означає, що власна система дорожча.','A negative value means the own system costs more.'));
  pairs([
    [t('З комерційним завантаженням','With commercial drying'),i.serviceEnabled?pay(r.servicePaybackSeasons,serviceEffect):t('Не обрано','Not selected')],
    [t('Зі зберіганням і зміною ціни','With storage and price change'),i.delayedSale?pay(r.combinedPaybackSeasons,r.economicEffect):t('Не обрано','Not selected')]
  ]);
  note(t('Ціновий сценарій не є гарантованим прибутком і не входить до базової окупності. Сезон не обов’язково дорівнює року.','The price scenario is not guaranteed profit and is excluded from base payback. A season does not necessarily equal a year.'));

  start(t('2  Фізика процесу та вихідні дані','2  Process physics and inputs'));
  table([t('Баланс і режим','Balance and operating regime'),t('Значення','Value')],[
    [t('Вхідна маса / суха речовина','Incoming mass / dry matter'),`${n(own?.rawKg/1000,'t')} / ${n(own?.dryMatterKg/1000,'t')}`],
    [t('Зменшення фізичної маси через воду','Physical mass reduction through water'),`${n(own?.waterKg/1000,'t')} / ${n(divide(own?.waterKg,own?.rawKg)==null?null:divide(own?.waterKg,own?.rawKg)*100)}%`],
    [t('Вологість вхідна -> кінцева','Incoming -> final moisture'),`${n(i.initialMoisture)} -> ${n(i.finalMoisture)}%`],
    [t('Температура довкілля / повітря еталона','Ambient / reference drying-air temperature'),`${n(i.ambientTemperature ?? data.ambientTemperature ?? 20)} / ${n(r.referenceTemperature)} °C`],
    [t('Продуктивність за сухим зерном','Capacity by dried grain'),`${n(r.capacity)} ${t('т/год','t/h')}`],
    [t('Втрати / рекуперація / ККД','Losses / recovery / efficiency'),`${n(own?.lossFactor == null ? null : own.lossFactor*100)} / ${n(own?.recoveredFraction == null ? null : own.recoveredFraction*100)} / ${n(own?.efficiency == null ? null : own.efficiency*100)}%`],
    [t('Нагрів води / випаровування / нагрів зерна','Water heating / evaporation / grain heating'),`${n(own?.waterHeatingMJ)} / ${n(own?.evaporationMJ)} / ${n(own?.grainHeatingMJ)} MJ`],
    [t('Корисна теплота / енергія палива','Useful heat / fuel energy'),`${n(own?.usefulMJ)} / ${n(own?.burnerMJ)} MJ`],
    [snapshot.fuelName,`${n(own?.fuelQuantity)} ${fuelUnit}`],
    [t('Теплотворність / температура зерна','Heating value / grain temperature'),`${n(selectedFuel?.heatingValue)} MJ/${fuelUnit} / ${n(selectedCrop?.finalGrainTemperature)} °C`],
    [t('Паливо на тонну зерна / тонну води','Fuel per tonne of grain / water'),`${n(divide(own?.fuelQuantity,i.volume))} / ${n(divide(own?.fuelQuantity,own?.waterKg/1000))} ${fuelUnit}/${t('т','t')}`],
    [t('Потужність двигунів / електроенергія','Motor power / electricity'),`${n(own?.electricalPower,'kW')} / ${n(own?.electricityKwh,'kWh')}`]
  ],[.59,.41]);
  note(t('Баланс передбачає 0% втрат сухої речовини. Час = маса готового зерна / продуктивність; електроенергія = потужність × час. Потужність виробника вже враховує коефіцієнт 0,8.','The balance assumes 0% dry-matter loss. Time = dried mass / capacity; electricity = power × time. Manufacturer motor power already includes the 0.8 factor.'));
  note(t('Енергія палива = сума трьох теплових складових × (1 + втрати) × (1 - рекуперація) / ККД. Кількість палива = енергія / теплотворність. Коефіцієнти застосовано один раз. Зміна режиму, погоди чи якості палива змінює фактичні витрати.','Fuel energy = sum of three heat components × (1 + losses) × (1 - recovery) / efficiency. Fuel quantity = energy / heating value. Factors apply once. Operating conditions, weather and fuel quality affect actual consumption.'));
  heading(t('Походження параметрів','Parameter sources'));
  if(reference?.source)note(t('Технічне джерело: ','Technical source: ')+reference.source);
  note(t('Обсяг, модель, паливо, ціни, тариф елеватора й графік — поточні значення калькулятора, які користувач може змінювати; це не перевірені ринкові котирування. Вологість встановлена за культурою. Продуктивність, потужність і теплові коефіцієнти — дані ARQON. Обслуговування — припущення 1% ціни сушарки за сезон. Історія ручного введення кожного поля не фіксується.','Volume, model, fuel, prices, elevator tariff and schedule are current editable calculator values, not verified market quotes. Moisture is set by crop. Capacity, power and thermal coefficients come from ARQON. Maintenance assumes 1% of dryer price per season. Per-field manual entry history is not recorded.'));

  start(t('3  Власна сушка та елеватор','3  Own drying versus elevator'));
  table([t('Власні витрати','Own costs'),t('За сезон, грн','Season, UAH'),t('грн/вхідну т','UAH/incoming t')],[
    [snapshot.fuelName,n(own?.fuelCost),n(divide(own?.fuelCost,i.volume))],
    [t('Електроенергія','Electricity'),n(own?.electricityCost),n(divide(own?.electricityCost,i.volume))],
    [t('Оператор','Operator'),n(own?.operatorCost),n(divide(own?.operatorCost,i.volume))],
    [t('Обслуговування 1% за сезон','Maintenance 1% per season'),n(own?.fixedCost),n(divide(own?.fixedCost,i.volume))],
    [t('Інші власні витрати','Other own costs'),n(i.volume*i.ownOtherPerTonne),n(i.ownOtherPerTonne)],
    [t('Разом власна система','Own system total'),n(r.ownSystemCost),n(ownT)],
    [t('Елеватор разом із доставкою','Elevator including transport'),n(r.elevatorCost),n(elevatorT)],
    [t('Економія','Savings'),n(r.savings),n(savingsT)]
  ],[.46,.27,.27]);
  pairs([
    [t('Сушіння на тонну готового зерна','Drying per tonne of finished grain'),per(divide(own?.dryingCost,own?.finalKg/1000))],
    [t('Сушіння на тонну видаленої води','Drying per tonne of removed water'),per(divide(own?.dryingCost,own?.waterKg/1000))],
    [t('Паливо / електроенергія — ціни','Fuel / electricity prices'),`${n(i.fuelPrice)} ${t('грн','UAH')}/${fuelUnit}; ${n(i.electricityPrice)} ${t('грн','UAH')}/${unit('kWh')}`],
    [t('Тариф елеватора','Elevator tariff'),`${n(i.elevatorTariff)} ${tariffUnit}`],
    [t('Доставка / інші витрати елеватора','Transport / other elevator costs'),`${money(r.transportCost)} / ${money(i.volume*i.elevatorOtherPerTonne)}`],
    [t('Тариф оператора','Operator rate'),i.operatorPerHour==null?t('Не введено; не враховано','Not entered; excluded'):`${n(i.operatorPerHour)} ${t('грн/год','UAH/h')}`]
  ]);
  if((i.elevatorDistanceKm ?? 0)>0) {
    pairs([
      [t('Доставка: відстань в один бік / вантажність','Transport: one-way distance / payload'),`${n(i.elevatorDistanceKm)} ${t('км','km')} / ${n(i.truckPayloadTonnes,'t')}`],
      [t('Дизель на 100 км / ціна / водій за рейс','Diesel per 100 km / price / driver per trip'),`${n(i.truckLitresPer100Km)} ${t('л','L')} / ${n(i.transportDieselPrice)} ${t('грн/л','UAH/L')} / ${money(i.driverPerTrip)}`]
    ]);
    note(t('Доставка = кількість повних рейсів із округленням угору × (2 × відстань × витрата палива / 100 × ціна + оплата водія).','Transport = trips rounded up × (2 × distance × fuel use / 100 × price + driver pay).'));
  }
  note(t('Тариф грн/т-% множиться на вхідну масу і зняті відсоткові пункти вологості. Тариф грн/т — лише на вхідну масу. Місцевий тариф можна змінити на кроці цін калькулятора; він залежить від регіону та умов елеватора.','A UAH/t-% tariff is multiplied by incoming mass and moisture percentage points removed. A UAH/t tariff uses incoming mass only. Change the local tariff in the calculator price step; it depends on location and elevator terms.'));
  note(t('Показники на тонну готового зерна й води включають лише витрати сушіння. Порівняння систем включає також введені інші витрати. Використовуйте єдину основу цін щодо ПДВ.','Finished-grain and removed-water unit costs include drying costs only. System comparison also includes entered other costs. Use a consistent VAT basis.'));

  start(t('4  Інвестиційне рішення','4  Investment decision'));
  table([t('Показник','Metric'),t('Елеватор','Elevator'),t('Власна сушка','Own drying'),t('Власна + послуги','Own + services')],[
    [t('Інвестиція, грн','Investment, UAH'),'0',n(r.investment),i.serviceEnabled?n(r.investment):'—'],
    [t('Витрати сезону, грн','Season cost, UAH'),n(r.elevatorCost),n(r.ownSystemCost),i.serviceEnabled?n(r.ownSystemCost==null||r.service?.dryingCost==null?null:r.ownSystemCost+r.service.dryingCost):'—'],
    [t('Економія + прибуток, грн','Savings + profit, UAH'),'0',n(r.savings),i.serviceEnabled?n(serviceEffect):'—'],
    [t('Окупність, сезонів','Payback, seasons'),'—',pay(r.paybackSeasons,r.savings),i.serviceEnabled?pay(r.servicePaybackSeasons,serviceEffect):'—']
  ],[.28,.22,.25,.25]);
  note(t('Інвестиція — лише ціна сушарки. Монтаж, теплогенератор, паливна система, електрика, транспортери, автоматика й підготовка майданчика потребують кошторису та підтвердження комплектації. Включені позиції не можна рахувати повторно.','Investment includes dryer price only. Installation, burner, fuel system, electrics, conveyors, controls and site preparation need a quotation and scope confirmation. Included items must not be counted twice.'));
  heading(t('Комерційне завантаження','Commercial drying'));
  pairs([
    [t('Вхідний обсяг / тариф','Incoming volume / tariff'),i.serviceEnabled?`${n(i.serviceVolume,'t')} / ${per(i.serviceTariff)}`:t('Не обрано','Not selected')],
    [t('Виручка / змінні витрати / прибуток, грн','Revenue / variable costs / profit, UAH'),i.serviceEnabled?`${n(r.serviceRevenue)} / ${n(r.service?.dryingCost)} / ${n(r.serviceProfit)}`:'—'],
    [t('Разом години / дні роботи','Total operating hours / days'),`${n(r.totalHours,'h')} / ${n(r.totalDays,'days')}`],
    [t('Доступний час за сезон','Available seasonal time'),n(i.availableHours,'h')]
  ]);
  note(t('Послуги використовують ту саму культуру й вологість. Їхні витрати — паливо, електроенергія й оператор; сезонний 1% уже віднесено власному зерну. Обсяг сторонніх замовлень не гарантований.','Services use the same crop and moisture. Costs include fuel, electricity and operator; the seasonal 1% is already allocated to own grain. External orders are not guaranteed.'));
  heading(t('Зберігання та очікувана ціна','Storage and expected price'));
  pairs([
    [t('Поточна -> очікувана ціна, грн/т','Current -> expected price, UAH/t'),i.delayedSale?`${n(i.currentGrainPrice)} -> ${n(i.futureGrainPrice)}`:t('Не обрано','Not selected')],
    [t('Потенційний ефект зміни ціни реалізації','Potential selling-price effect'),i.delayedSale?money(r.priceRevenue):'—'],
    [t('Зберігання / чистий ціновий ефект','Storage / net price effect'),i.delayedSale?`${money(r.storageCost)} / ${money(r.priceEffect)}`:'—'],
    [t('Розширена окупність','Extended payback'),i.delayedSale?pay(r.combinedPaybackSeasons,r.economicEffect):'—']
  ]);
  note(t('Це не гарантований прибуток від сушарки. Витрати зберігання мають охоплювати весь обраний строк, вентиляцію, електрику, контроль, втрати й вартість капіталу. Кредит, податки, амортизація та дисконтування не враховані. Фінансування й поганий/хороший сезон — наступний етап після погодження умов.','This is not guaranteed dryer profit. Storage costs must cover the chosen duration, ventilation, electricity, monitoring, losses and cost of capital. Credit, taxes, depreciation and discounting are excluded. Financing and bad/good seasons await agreed assumptions.'));

  start(t('5  Чутливість та обмеження','5  Sensitivity and limitations'));
  note(t('Кожний рядок змінює один параметр; решта залишаються як у вашому розрахунку. ±20% — тест чутливості, а не ринковий прогноз. Економія та окупність нижче стосуються лише власного зерна.','Each row changes one parameter; others remain unchanged. ±20% is a sensitivity test, not a market forecast. Savings and payback below concern own grain only.'));
  const scenarioRow=(label,{result:s})=>[label,n(s.savings),pay(s.paybackSeasons,s.savings)+(s.warnings.includes('SEASON_TOO_SHORT')?' [1]':'')+(s.warnings.includes('THERMAL_POWER_INSUFFICIENT')?' [2]':'')];
  table([t('Змінений параметр','Changed parameter'),t('Економія, грн/сезон','Savings, UAH/season'),t('Окупність','Payback')],[
    ...analysis.tariff.map(s=>scenarioRow(`${t('Елеватор','Elevator')} ${n(s.input.elevatorTariff)} ${tariffUnit}`,s)),
    ...analysis.fuel.map(s=>scenarioRow(`${t('Паливо','Fuel')} ${n(s.input.fuelPrice)} ${t('грн','UAH')}/${fuelUnit}`,s)),
    ...analysis.volumes.map(s=>scenarioRow(`${t('Обсяг','Volume')} ${n(s.input.volume,'t')}`,s)),
    ...analysis.moisture.map(s=>scenarioRow(`${t('Вологість','Moisture')} ${n(s.input.initialMoisture)} -> ${n(i.finalMoisture)}%`,s))
  ],[.43,.28,.29]);
  note(t('[1] Обсяг перевищує доступний час сезону. [2] Потрібна перевірка потужності теплогенератора. Позначені строки є математичними оцінками; виконання такого режиму не підтверджене.','[1] Volume exceeds available seasonal hours. [2] Burner capacity needs verification. Marked paybacks are mathematical estimates; feasibility is not confirmed.'));
  note(t('Операційний поріг власного обсягу без доставки: ','Own-volume operating threshold without delivery: ')+n(analysis.operationalBreakEven,'t')+'. '+t('Це покриття сезонних витрат, а не повернення інвестиції. Для мінімального обсягу під окупність потрібно задати цільову кількість сезонів. За наявності доставки поріг тут не визначається через ціле число рейсів.','This covers seasonal costs, not investment recovery. A target number of seasons is needed for an investment volume threshold. With delivery, a threshold is not shown because trips are rounded up.'));
  note(t('Для непідтверджених режимів вологості не екстраполюємо продуктивність. «Бракує даних» не означає нульових витрат. Вологість у головному калькуляторі залишається за погодженими межами культур. Графік перевіряється за заданими доступними годинами з урахуванням обраних сторонніх замовлень.','Capacity is not extrapolated for unconfirmed moisture regimes. Missing data does not mean zero cost. Main-calculator moisture remains at agreed crop limits. Schedule checks require available hours and include selected external orders.'));
  if(snapshot.missing.length)note(t('Бракує даних поточного розрахунку: ','Missing from the current calculation: ')+snapshot.missing.join('; '));
  if(snapshot.warnings.length)note(t('Застереження поточного розрахунку: ','Current calculation warnings: ')+snapshot.warnings.join('; '));
  note(t('Розрахунок попередній. Потрібна практична перевірка витрати палива та продуктивності. Ринкові діапазони з прикладів 2025 року не використані як підтверджені тарифи.','This is a preliminary estimate. Fuel use and capacity require field validation. Market ranges from 2025 examples are not used as verified tariffs.'));

  function wrap(value,size,width) {
    const lines=[];let line='';
    for(const word of String(value).split(/\s+/)) {
      for(const part of splitWord(word,size,width)) {
        const next=line?`${line} ${part}`:part;
        if(line && font.widthOfTextAtSize(next,size)>width){lines.push(line);line=part;}else line=next;
      }
    }
    if(line)lines.push(line);return lines;
  }
  function splitWord(word,size,width){const parts=[];let part='';for(const c of word){if(part && font.widthOfTextAtSize(part+c,size)>width){parts.push(part);part='';}part+=c;}if(part)parts.push(part);return parts;}
  function measure(block,size) {
    if(block.kind==='table') {
      const rows=[...(block.headers.length?[block.headers]:[]),...block.rows];
      const cells=rows.map(row=>row.map((v,j)=>wrap(v,size,511*block.widths[j]-14)));
      const heights=cells.map(row=>Math.max(...row.map(c=>c.length))*size*1.35+10);
      return {cells,heights,height:heights.reduce((a,b)=>a+b,0)+9};
    }
    const s=block.kind==='hero'?25:block.kind==='heading'?12:size;
    const lines=wrap(block.value,s,511);
    return {lines,size:s,height:lines.length*s*1.4+(block.kind==='hero'?12:9)};
  }
  for(const [index,section] of pages.entries()) {
    let size=9.5;
    while(size>7.5 && section.blocks.reduce((sum,b)=>sum+measure(b,size).height,0)>650)size-=.25;
    const height=section.blocks.reduce((sum,b)=>sum+measure(b,size).height,0);
    if(height>650)throw new Error('Report content exceeds page capacity');
    const page=pdf.addPage([595.28,841.89]);let y=742;
    const text=(v,x,yy,s=size,color=ink)=>page.drawText(String(v),{x,y:yy,size:s,font,color});
    page.drawRectangle({x:0,y:769,width:595.28,height:73,color:tint});
    text('ARQON',42,805,20,orange);text(snapshot.modelName,440,806,14);
    text(section.title,42,779,14);
    for(const b of section.blocks) {
      const m=measure(b,size);
      if(b.kind==='table') {
        m.cells.forEach((row,k)=>{const h=m.heights[k];if(b.headers.length&&k===0)page.drawRectangle({x:42,y:y-h+4,width:511,height:h,color:tint});let x=42;row.forEach((cell,j)=>{cell.forEach((line,l)=>text(line,x+7,y-8-l*size*1.35,size,b.headers.length&&k===0?ink:muted));x+=511*b.widths[j];});y-=h;page.drawLine({start:{x:42,y:y+4},end:{x:553,y:y+4},thickness:.4,color:rule});});y-=9;
      } else {m.lines.forEach((line,j)=>text(line,42,y-j*m.size*1.4,m.size,b.kind==='hero'||b.kind==='heading'?orange:muted));y-=m.height;}
    }
    page.drawLine({start:{x:42,y:70},end:{x:553,y:70},thickness:.6,color:rule});
    const disclaimer=t('ВАЖЛИВО: цей звіт має виключно ознайомчий характер і не може сприйматися як складова бізнес-плану.','IMPORTANT: This report is for information only and must not be treated as part of a business plan.');
    wrap(disclaimer,7.5,511).forEach((line,j)=>text(line,42,57-j*10,7.5,muted));text(`${r.engineVersion} / ${r.parameterVersion}`,42,36,7.5,muted);text(`${index+1} / 5`,523,36,8,muted);
  }
  return pdf.save();
}

/** @param {import('./engineering-types').ReportSnapshot} snapshot @param {boolean} en @param {string} fontUrl @param {import('./engineering-types').EngineeringData} data */
export async function downloadEngineeringReport(snapshot,en,fontUrl,data) {
  const response=await fetch(fontUrl);if(!response.ok)throw new Error('Font unavailable');
  const bytes=await createEngineeringReport(snapshot,en,new Uint8Array(await response.arrayBuffer()),data);
  const url=URL.createObjectURL(new Blob([new Uint8Array(bytes)],{type:'application/pdf'}));
  const a=document.createElement('a');a.href=url;a.download=`ARQON-${snapshot.modelName}-calculation-result.pdf`;document.body.appendChild(a);a.click();a.remove();return {url,filename:a.download};
}
