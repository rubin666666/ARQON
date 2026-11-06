import {test,expect} from '@playwright/test';
for(const en of [false,true])test(`${en?'EN':'UA'} introduction explains the product before models and company`,async({page},testInfo)=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto(en?'en/':'./');
 await expect(page.locator('h1')).toHaveText(en?'Grain dryersSAHARA':'ЗерносушаркиSAHARA');
 await expect(page.locator('.hero-description')).toContainText(en?'moisture removal':'видалення вологи');
 const order=await page.locator('main section[id]').evaluateAll(nodes=>nodes.map(node=>node.id));
 expect(order.indexOf('technology')).toBeLessThan(order.indexOf('products'));
 expect(order.indexOf('products')).toBeLessThan(order.indexOf('about'));
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.screenshot({path:`work/introduction-${en?'en':'ua'}-${testInfo.project.name}.png`});
 await page.locator('.hero-links a[href="#technology"]').click();
 await expect(page).toHaveURL(/#technology$/);
 await page.locator('.hero-links a[href="#products"]').click();
 await expect(page).toHaveURL(/#products$/);
 await page.getByRole('link',{name:en?'Calculate payback':'Розрахувати окупність',exact:true}).click();
 await expect(page.locator('.calculator-wizard')).toBeVisible();
});
