import {test,expect,type Page} from '@playwright/test';
async function fill(page:Page,id:string,value:string){const field=page.locator(`#eng-${id}`);await field.click();await field.fill(value);await field.press('Tab');}

test('gallery round trip keeps crop, quantities and separate model quotes',async({page})=>{
 await page.goto('en/');
 await page.getByRole('link',{name:'Calculate payback',exact:true}).first().click();
 await fill(page,'volume','2345');await fill(page,'dailyHours','16');
 await page.locator('#calc-crop').selectOption('sunflower');
 await page.getByRole('button',{name:'Next',exact:true}).click();
 await fill(page,'dryerPrice','1111111');await fill(page,'fuelPrice','72.5');
 await page.getByRole('button',{name:'Browse models — inputs saved',exact:true}).click();
 await page.locator('#model-gallery').getByRole('button',{name:'Calculate S10',exact:true}).click();
 await page.getByRole('button',{name:/Grain and model/}).click();
 await expect(page.locator('#calc-model')).toHaveValue('sahara-s10');
 await expect(page.locator('#calc-crop')).toHaveValue('sunflower');
 await expect(page.locator('#eng-volume')).toHaveValue('2 345');
 await expect(page.locator('#eng-dailyHours')).toHaveValue('16');
 await page.getByRole('button',{name:'Next',exact:true}).click();
 await expect(page.locator('#eng-fuelPrice')).toHaveValue('72.5');
 await expect(page.locator('#eng-dryerPrice')).toHaveValue('');
 await fill(page,'dryerPrice','2222222');
 await page.getByRole('button',{name:'Browse models — inputs saved',exact:true}).click();
 await page.locator('#model-gallery').getByRole('button',{name:'Calculate S9',exact:true}).click();
 await page.getByRole('button',{name:/Prices and costs/}).click();
 await expect(page.locator('#eng-dryerPrice')).toHaveValue('1 111 111');
});

test('browser Back and Forward follow model links without leaving a stale gallery',async({page})=>{
 await page.goto('en/#products');
 await page.getByRole('button',{name:'Menu',exact:true}).click();
 await page.locator('.menu-models').getByRole('link',{name:'S10',exact:true}).click();
 await expect(page.locator('#model-gallery')).toBeVisible();
 await expect(page).toHaveURL(/#sahara-s10$/);
 await page.goBack();
 await expect(page).toHaveURL(/#products$/);
 await expect(page.locator('#model-gallery')).toHaveCount(0);
 await page.goForward();
 await expect(page.locator('#model-gallery')).toBeVisible();
 await page.reload();
 await expect(page.locator('#model-gallery')).toBeVisible();
 await page.getByRole('button',{name:'Close gallery',exact:true}).click();
 await page.goto('en/?model=sahara-s12');
 await expect(page.locator('.model-specs')).toBeVisible();
 await expect(page.getByRole('dialog')).toContainText('S12');
});

test('PDF cancel, language and theme changes preserve the scenario after reload',async({page})=>{
 await page.goto('en/');
 await page.getByRole('link',{name:'Calculate payback',exact:true}).first().click();
 await fill(page,'volume','2345.5');
 await page.getByRole('button',{name:'Next',exact:true}).click();
 await fill(page,'fuelPrice','72.5');
 await page.getByRole('button',{name:'Results',exact:true}).click();
 await page.getByRole('button',{name:'Download detailed PDF',exact:true}).click();
 await page.getByRole('button',{name:'Close report',exact:true}).click();
 await expect(page.locator('#calculator-result')).toBeVisible();
 await page.getByRole('button',{name:'Close calculator',exact:true}).click();
 await page.getByRole('button',{name:'Українська',exact:true}).click();
 const before=await page.locator('html').getAttribute('class');
 await page.getByRole('button',{name:'Перемкнути тему',exact:true}).click();
 await expect(page.locator('html')).not.toHaveAttribute('class',before??'');
 await page.getByRole('button',{name:'Продовжити мій розрахунок',exact:true}).click();
 await expect(page.locator('#eng-volume')).toHaveValue('2 345,5');
 await page.getByRole('button',{name:'Далі',exact:true}).click();
 await expect(page.locator('#eng-fuelPrice')).toHaveValue('72,5');
 await page.reload();
 await expect(page.locator('html')).toHaveAttribute('lang','uk');
 await page.getByRole('button',{name:'Продовжити мій розрахунок',exact:true}).click();
 await expect(page.locator('#eng-volume')).toHaveValue('2 345,5');
});
