import {test,expect} from '@playwright/test';
for(const width of [1440,390])test(`layout survey ${width}`,async({page})=>{
 await page.setViewportSize({width,height:900});await page.emulateMedia({colorScheme:'dark',reducedMotion:'reduce'});await page.goto('./');
 for(const id of ['technology','products','calculator','about','faq']){const el=page.locator('#'+id);await el.scrollIntoViewIfNeeded();expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);await el.screenshot({path:`work/survey-${width}-${id}.png`});}
 for(const selector of ['#technology > .section-heading','#products > .section-heading','.about-intro','.calculator-launch-card'])await expect(page.locator(selector)).toHaveCSS('text-align','center');
 await page.locator('.site-footer').screenshot({path:`work/survey-${width}-footer.png`});
 for(const [open,close] of [['Докладніше про компанію','Закрити опис компанії'],['Докладніше про сушарку','Закрити опис сушарки']]){
  await page.getByRole('button',{name:new RegExp(open)}).click();
  const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();
  const bounds=await dialog.boundingBox();expect(bounds!.x).toBeGreaterThanOrEqual(0);expect(bounds!.x+bounds!.width).toBeLessThanOrEqual(width);
  await page.screenshot({path:`work/survey-${width}-${close}.png`});
  await page.getByRole('button',{name:close,exact:true}).click();
 }
});

test('FAQ is the final desktop navigation link and highlights are touch-only',async({page,isMobile})=>{
 test.skip(isMobile,'Desktop navigation and mouse pointer appearance.');
 await page.goto('./');
 const faq=page.locator('.desktop-nav a').last();await expect(faq).toHaveText('FAQ');await faq.click();await expect(page).toHaveURL(/#faq$/);
 const marker=page.locator('.flow-image-stage .stage-loading');
 await expect(marker).toHaveCSS('background-color','rgb(166, 54, 8)');
});
test('touch screens retain the active stage highlight',async({browser,browserName})=>{
 test.skip(browserName==='firefox','Firefox does not emulate mobile contexts.');
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const page=await context.newPage();
 await page.goto('http://127.0.0.1:4173/ARQON/');
 await expect(page.locator('.flow-image-stage .stage-loading')).toHaveCSS('background-color','rgb(255, 255, 255)');await context.close();
});
