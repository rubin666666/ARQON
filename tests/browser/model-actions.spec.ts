import {test,expect} from '@playwright/test';
for(const width of [320,1440,2560])test(`model actions and necessary scrolling at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:900});await page.goto('./');
 const launch=page.getByRole('button',{name:'Відкрити галерею моделей',exact:true});
 await expect(launch).not.toHaveClass(/button-secondary/);await launch.click();
 const gallery=page.locator('.gallery-dialog');
 const details=gallery.getByRole('button',{name:'Відкрити характеристики',exact:true}).first();
 await expect(details).toHaveClass(/button-secondary/);
 await expect.poll(async()=>(await details.boundingBox())!.height).toBeGreaterThanOrEqual(48);
 await details.scrollIntoViewIfNeeded();
 await page.screenshot({path:`work/model-actions-${width}.png`});
 await details.click();const drawer=page.locator('.model-drawer');
 for(const dialog of [drawer]){
  const body=dialog.locator('.model-dialog-scroll');
  await expect(body).toHaveCSS('overflow-y','auto');
  expect(await dialog.evaluate(el=>el.scrollHeight<=el.clientHeight+1)).toBe(true);
  expect(await body.evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);
  await body.evaluate(el=>{el.scrollTop=el.scrollHeight;});
  expect(await body.evaluate(el=>Math.abs(el.scrollHeight-el.clientHeight-el.scrollTop)<2)).toBe(true);
  await expect(dialog.locator('.model-detail-actions .button')).toBeVisible();
 }
 await drawer.getByRole('button',{name:'Закрити подробиці',exact:true}).click();
 await expect(drawer).toBeHidden();
 const body=gallery.locator('.model-dialog-scroll');
 await expect(body).toHaveCSS('overflow-y','auto');
 expect(await gallery.evaluate(el=>el.scrollHeight<=el.clientHeight+1)).toBe(true);
 expect(await body.evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);
 await expect.poll(async()=>body.evaluate(el=>{el.scrollTop=el.scrollHeight;return Math.abs(el.scrollHeight-el.clientHeight-el.scrollTop);})).toBeLessThan(2);
 await expect(gallery.getByRole('button',{name:'Розрахувати S18',exact:true})).toBeInViewport();
 await expect(gallery.locator('.gallery-comparison-bar')).toBeInViewport();
});

