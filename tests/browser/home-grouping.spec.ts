import {test,expect} from '@playwright/test';
for(const size of [{width:1440,height:900},{width:1000,height:900},{width:1001,height:900},{width:390,height:844},{width:320,height:568}])test(`hero capabilities and company groups at ${size.width}`,async({page},info)=>{
 await page.setViewportSize(size);await page.emulateMedia({reducedMotion:'reduce',colorScheme:'dark'});await page.goto('./');
 const compact=size.width<=1000;
 if(compact){
  await expect(page.locator('.benefits:visible')).toHaveCount(0);
  await expect(page.locator('.about-mobile-links > button')).toHaveCount(3);
  await expect(page.locator('.about-overview')).toBeHidden();
 }else{
  const active=page.locator('.first-screen > .benefits');
  await expect(active.locator(':scope > div')).toHaveCount(3);
  await expect(active).toBeVisible();
  const hero=await page.locator('.hero').boundingBox(),benefits=await active.boundingBox();
  expect(benefits!.y).toBeGreaterThanOrEqual(hero!.y+hero!.height-1);
 }
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(size.width);
 await page.screenshot({path:`work/hero-order-${size.width}-${info.project.name}.png`});
 await page.locator('#about').scrollIntoViewIfNeeded();
 await expect(page.locator('.about-directions li')).toHaveCount(4);await expect(page.locator('.about-locations li')).toHaveCount(3);
 if(!compact){const intro=await page.locator('.about-intro').boundingBox(),groups=await page.locator('.about-overview').boundingBox();expect(groups!.y).toBeGreaterThanOrEqual(intro!.y+intro!.height);}
 const clipped=await page.locator('.about-overview li,.benefits:visible p').evaluateAll(nodes=>nodes.filter(el=>el.scrollWidth>el.clientWidth+1).map(el=>el.textContent));expect(clipped).toEqual([]);
 await page.screenshot({path:`work/about-order-${size.width}-${info.project.name}.png`});
});
