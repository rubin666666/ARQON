import {test,expect} from '@playwright/test';
import {PDFDocument} from 'pdf-lib';
import config from '../../config/site.json' with {type:'json'};

for(const en of [false,true])test(`specification navigation and clean print ${en?'EN':'UK'}`,async({page,browserName})=>{
 await page.goto((en?'en/':'./')+'?model=sahara-s9');
 const drawer=page.locator('.model-drawer');
 const nav=drawer.locator('.model-spec-nav');
 await expect(nav.getByRole('button')).toHaveCount(3);
 for(const index of [2,0,1]){
  await nav.getByRole('button').nth(index).click();
  const heading=drawer.locator('.model-specification-group h3').nth(index);
  await expect(heading).toBeFocused();
  await expect(heading).toBeInViewport();
  const a=await heading.boundingBox(),b=await nav.boundingBox();
  expect(a!.y).toBeGreaterThanOrEqual(b!.y+b!.height-1);
 }
 await page.evaluate(()=>{window.print=()=>document.body.setAttribute('data-print-called','true');});
 await drawer.getByRole('button',{name:en?'Print specifications':'Друкувати характеристики',exact:true}).click();
 await expect(page.locator('body')).toHaveAttribute('data-print-called','true');
 await expect(page.locator('.model-print-sheet')).toBeHidden();
 await page.emulateMedia({media:'print'});
 const sheet=page.locator('.model-print-sheet');
 await expect(sheet).toBeVisible();
 await expect(drawer).toBeHidden();
 await expect(sheet.locator('[data-print-spec]')).toHaveCount(18);
 for(const spec of config.models[0].specifications){
  const row=sheet.locator(`[data-print-spec="${spec.id}"]`);
  await expect(row.locator('th')).toHaveText(spec.label[en?'en':'uk']);
  await expect(row.locator('td')).toHaveText(spec.value[en?'en':'uk']);
 }
 await expect(sheet).toContainText(config.models[0].equipment[en?'en':'uk']);
 if(browserName==='chromium'){
  const pdf=await page.pdf({path:`work/specifications-${en?'en':'uk'}.pdf`,preferCSSPageSize:true});
  expect((await PDFDocument.load(pdf)).getPageCount()).toBeLessThanOrEqual(3);
 }
 await page.screenshot({path:`work/print-sheet-${en?'en':'uk'}-${test.info().project.name}.png`,fullPage:true});
 await page.emulateMedia({media:'screen'});
 await expect(drawer).toBeVisible();
 await drawer.getByRole('button',{name:en?'Close details':'Закрити подробиці',exact:true}).click();
 await expect(page.locator('.model-print-sheet')).toHaveCount(0);
});

for(const en of [false,true])test(`FAQ links open the exact answer ${en?'EN':'UK'}`,async({page})=>{
 await page.addInitScript(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:()=>Promise.reject(new Error('Clipboard unavailable'))}});});
 await page.goto(en?'en/':'./');
 const items=page.locator('#faq details');
 for(let index=0;index<config.faq.length;index++){
  const item=items.nth(index);
  await item.locator('summary').click();
  await item.getByRole('button',{name:en?'Copy link to question':'Скопіювати посилання на запитання',exact:true}).click();
  const url=await item.getByRole('textbox').inputValue();
  expect(new URL(url).hash).toBe('#'+await item.getAttribute('id'));
  expect(new URL(url).search).toBe('');
  await page.goto(url);
  const linked=page.locator(new URL(url).hash);
  await expect(linked).toHaveAttribute('open','');
  await expect(linked.locator('summary')).toBeInViewport();
  await expect(linked.locator('p')).toHaveText(config.faq[index].answer[en?'en':'uk']);
  await page.goto(en?'en/':'./');
 }
});
