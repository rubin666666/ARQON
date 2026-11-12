import {test,expect} from '@playwright/test';
for(const size of [{width:1440,height:900},{width:390,height:844},{width:320,height:568}])test(`hero capabilities and company groups at ${size.width}`,async({page},info)=>{
 await page.setViewportSize(size);await page.emulateMedia({reducedMotion:'reduce',colorScheme:'dark'});await page.goto('./');
 const cards=page.locator('.first-screen > .benefits > div');await expect(cards).toHaveCount(3);
 await expect(page.locator('.benefits')).toHaveCount(1);
 const hero=await page.locator('.hero').boundingBox(),benefits=await page.locator('.benefits').boundingBox();
 expect(benefits!.y).toBeGreaterThanOrEqual(hero!.y+hero!.height-1);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(size.width);
 await page.screenshot({path:`work/hero-order-${size.width}-${info.project.name}.png`});
 await page.locator('#about').scrollIntoViewIfNeeded();
 await expect(page.locator('.about-directions li')).toHaveCount(4);await expect(page.locator('.about-locations li')).toHaveCount(3);
 const intro=await page.locator('.about-intro').boundingBox(),groups=await page.locator('.about-overview').boundingBox();expect(groups!.y).toBeGreaterThanOrEqual(intro!.y+intro!.height);
 const clipped=await page.locator('.about-overview li,.benefits p').evaluateAll(nodes=>nodes.filter(el=>el.scrollWidth>el.clientWidth+1).map(el=>el.textContent));expect(clipped).toEqual([]);
 await page.screenshot({path:`work/about-order-${size.width}-${info.project.name}.png`});
});
