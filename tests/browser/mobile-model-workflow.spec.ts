import {test,expect} from '@playwright/test';
import config from '../../config/site.json' with {type:'json'};

for(const count of [2,3])for(const en of [false,true])test(`mobile comparison of ${count} preserves every manufacturer value ${en?'EN':'UK'}`,async({page})=>{
 await page.setViewportSize({width:320,height:740});
 await page.goto(en?'en/':'./');
 await page.getByRole('button',{name:en?'Open model gallery':'Відкрити галерею моделей',exact:true}).click();
 await expect(page.locator('.gallery-resume')).toHaveCount(0);
 const compare=page.getByRole('button',{name:en?'Compare specifications':'Порівняти характеристики',exact:true});
 await expect(compare).toBeHidden();
 for(const name of ['S9','S10','S12'].slice(0,count)){
  const checkbox=page.getByRole('checkbox',{name:`${en?'Compare':'До порівняння'} ${name}`,exact:true});
  const label=page.locator('.model-card-compare').filter({has:checkbox});
  await expect(label).toHaveCSS('min-height','52px');
  // Firefox can report 51.99994px for a 52px box at fractional coordinates.
  expect((await label.boundingBox())!.height).toBeGreaterThanOrEqual(52 - 0.01);
  await label.click();
  await expect(checkbox).toBeChecked();
  await expect(page.locator('.gallery-card').filter({has:checkbox})).toHaveAttribute('data-selected','true');
  await expect(compare).toBeVisible();
 }
 await expect(page.locator('.model-selection-hint')).toContainText(count===2?(en?'Compare now':'Можна порівняти'):(en?'Maximum 3':'Максимум 3'));
 await page.screenshot({path:`work/mobile-selection-${en?'en':'uk'}.png`});
 await compare.click();
 const pair=page.locator('.model-pair-comparison');
 await expect(pair).toBeVisible();
 await expect(pair.locator('.pair-spec')).toHaveCount(18);
 for(const spec of config.models[0].specifications){
  const row=pair.locator(`[data-pair-spec="${spec.id}"]`);
  await expect(row.locator('h4')).toHaveText(spec.label[en?'en':'uk']);
  const values=config.models.slice(0,count).map(model=>model.specifications.find(value=>value.id===spec.id)!.value[en?'en':'uk']);
  await expect(row.locator('dd')).toHaveText(values);
  await expect(row).toHaveAttribute('data-different',String(new Set(values.map(value=>value.trim().replace(/\s+/g,' '))).size>1));
 }
 expect(await page.locator('.spec-comparison-scroll').evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);
 await page.screenshot({path:`work/mobile-pair-${count}-${en?'en':'uk'}.png`});
});

test('calculator resumes the step and gallery return is contextual',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('en/');
 await page.getByRole('link',{name:'Calculate payback',exact:true}).first().click();
 await page.getByRole('button',{name:'Next',exact:true}).click();
 await page.locator('#eng-fuelPrice').fill('72.5');
 await page.locator('#eng-fuelPrice').press('Tab');
 const body=page.locator('.calculator-window-body');
 await body.evaluate(el=>{el.scrollTop=120;});
 await expect.poll(()=>body.evaluate(el=>el.scrollTop)).toBe(120);
 await page.getByRole('button',{name:'Close calculator',exact:true}).click();
 await page.locator('#calculator-launch').click();
 await expect.poll(()=>body.evaluate(el=>el.scrollTop)).toBe(120);
 await expect(page.getByRole('button',{name:/Prices and costs/})).toHaveAttribute('aria-current','step');
 await expect(page.locator('#eng-fuelPrice')).toHaveValue('72.5');
 await page.getByRole('button',{name:'Browse models — inputs saved',exact:true}).click();
 await page.getByRole('button',{name:'Return to calculation',exact:true}).click();
 await expect(page.getByRole('button',{name:/Prices and costs/})).toHaveAttribute('aria-current','step');
 await page.getByRole('button',{name:'Close calculator',exact:true}).click();
 await page.getByRole('button',{name:'Open model gallery',exact:true}).click();
 await expect(page.locator('.gallery-resume')).toHaveCount(0);
 const card=page.locator('.gallery-card').first();
 await card.getByRole('button',{name:'Open specifications',exact:true}).click();
 await page.locator('.model-drawer').getByRole('button',{name:'Enlarge image S9',exact:true}).click();
 await page.getByRole('button',{name:'← Back to specifications',exact:true}).click();
 await expect(page.locator('.model-drawer')).toBeVisible();
 await page.getByRole('button',{name:'← Back to models',exact:true}).click();
 await expect(card.getByRole('button',{name:'Open specifications',exact:true})).toBeFocused();
});
