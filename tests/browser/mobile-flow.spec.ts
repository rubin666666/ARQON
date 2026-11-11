import {test,expect} from '@playwright/test';
for(const size of [{width:320,height:568},{width:390,height:844},{width:844,height:390}])test(`diagram and legend stay visible while reading at ${size.width}x${size.height}`,async({page},info)=>{
 await page.setViewportSize(size);await page.emulateMedia({reducedMotion:'reduce'});await page.goto('./');
 const figure=page.locator('.flow-figure');
 await figure.evaluate(el=>window.scrollTo(0,el.getBoundingClientRect().top+window.scrollY-80));
 const visual=page.locator('.flow-visual');const panel=page.locator('.flow-description');
 const box=await figure.boundingBox();expect(box!.height).toBeLessThanOrEqual(size.height-80);
 const before=await visual.boundingBox();
 await panel.evaluate(el=>{el.scrollTop=el.scrollHeight;});
 expect(await panel.evaluate(el=>el.scrollTop)).toBeGreaterThan(0);
 expect((await visual.boundingBox())!.y).toBeCloseTo(before!.y,0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(size.width);
 await page.screenshot({path:`work/mobile-flow-${size.width}-${info.project.name}.png`});
});
