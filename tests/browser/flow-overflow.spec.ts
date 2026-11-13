import {test,expect} from '@playwright/test';
test('wide screens show every drying stage without an internal scrollbar',async({page})=>{
 for(const width of [1024,1440,2560]){
  await page.setViewportSize({width,height:900});await page.goto('./');
  const panel=page.locator('.flow-description');
  await expect(panel).toHaveCSS('max-height','none');
  expect(await panel.evaluate(el=>el.scrollHeight<=el.clientHeight+1)).toBe(true);
  await expect(page.locator('.flow-scroll-hint')).toBeHidden();
  const last=panel.locator('li').last();const p=await panel.boundingBox(),l=await last.boundingBox();
  expect(l!.y+l!.height).toBeLessThanOrEqual(p!.y+p!.height);
 }
 await page.setViewportSize({width:390,height:844});
 const panel=page.locator('.flow-description');await expect(panel).toHaveCSS('overflow-y','auto');
 expect(await panel.evaluate(el=>el.scrollHeight>el.clientHeight)).toBe(true);
});
