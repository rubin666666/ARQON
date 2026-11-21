import {test,expect} from '@playwright/test';
import config from '../../config/site.json' with {type:'json'};

for(const en of [false,true])test(`site clarity, original FAQ and calculator conditions ${en?'EN':'UK'}`,async({page,isMobile})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto(en?'en/':'./');
 await page.locator('.hero').screenshot({path:`work/clarity-hero-${en?'en':'uk'}-${test.info().project.name}.png`});
 await expect(page.locator('.hero-links > a')).toHaveCount(2);
 await page.locator('.hero-calculator').click();
 await expect(page.locator('.calculator-window')).toBeVisible();
 await expect(page.locator('.mobile-section-nav')).toBeHidden();
 await page.getByRole('button',{name:en?'Next':'Далі',exact:true}).click();
 await page.getByRole('button',{name:en?'Results':'Результат',exact:true}).click();
 const conditions=page.locator('.result-conditions');
 const result=page.locator('#calculator-result');
 const metrics=result.locator(':scope > .engineering-outcomes');
 const missing=result.locator('details').filter({has:page.getByText(new RegExp(en?'What is needed for a complete calculation':'Що потрібно для повного розрахунку'))});
 for(const list of await missing.all())expect((await metrics.boundingBox())!.y).toBeLessThan((await list.boundingBox())!.y);
 await page.screenshot({path:`work/clarity-result-${en?'en':'uk'}-${test.info().project.name}.png`});
 await conditions.locator('summary').click();
 await expect(conditions.locator('dd')).toHaveCount(3);
 await conditions.getByRole('button',{name:en?'Edit conditions':'Редагувати умови',exact:true}).click();
 await expect(page.locator('.calculator-progress button').first()).toHaveAttribute('aria-current','step');
 await page.getByRole('button',{name:en?'Close calculator':'Закрити калькулятор',exact:true}).click();
 await page.locator('#products').evaluate(el=>window.scrollTo(0,el.getBoundingClientRect().top+scrollY-100));
 const nav=page.locator('.mobile-section-nav');
 await expect(nav).toBeVisible();
 await page.screenshot({path:`work/clarity-nav-${en?'en':'uk'}-${test.info().project.name}.png`});
 await nav.getByRole('button').click();
 await expect(nav).toBeHidden();
 await page.getByRole('button',{name:en?'Close calculator':'Закрити калькулятор',exact:true}).click();
 await expect(nav).toBeVisible();
 await nav.getByRole('link',{name:en?'Technology':'Технологія',exact:true}).click();
 await expect(nav).toBeHidden();
 if(isMobile){
  const stages=page.locator('.technology-stage-nav button');
  await stages.last().click();
  await expect(page.locator('.flow-description li[aria-current="step"] h3')).toHaveText(en?'Cooling':'Охолодження');
  await expect(page.locator('.flow-image-stage .drying-marker[data-active="true"]')).toHaveText('3');
 }
 await page.locator('.about-mobile-links button').first().click();
 await page.locator('.about-topic-dialog .dialog-back').click();
 await expect(page.locator('.about-mobile-links button').first()).toBeFocused();
 await expect(page.locator('#faq .faq-topic')).toHaveCount(2);
 for(const faq of config.faq){
  const details=page.locator('#faq details').filter({has:page.getByText(faq.question[en?'en':'uk'],{exact:true})});
  await details.locator('summary').click();
  await expect(details.locator('p')).toHaveText(faq.answer[en?'en':'uk']);
 }
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
