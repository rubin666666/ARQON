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

test('stage highlight follows scrolling both ways and stays selected when enlarged',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('./');
 const panel=page.locator('.flow-description');
 const marker=page.locator('.flow-image-stage .drying-marker[data-active="true"]');
 await expect(marker).toHaveText('1');
 await panel.evaluate(el=>{const items=el.querySelectorAll('.drying-process > li');el.scrollTop+=items[1].getBoundingClientRect().top-el.getBoundingClientRect().top-30;});
 await expect(marker).toHaveText('2');
 await expect(panel.locator('[aria-current="step"] h3')).toHaveText('Сушіння');
 await panel.evaluate(el=>{el.scrollTop=el.scrollHeight;});
 await expect(marker).toHaveText('3');
 await page.getByRole('button',{name:'Збільшити схему сушіння',exact:true}).click();
 await expect(page.locator('.diagram-canvas .drying-marker[data-active="true"]')).toHaveText('3');
 await page.getByRole('button',{name:'Закрити схему',exact:true}).click();
 await panel.evaluate(el=>{el.scrollTop=0;});
 await expect(marker).toHaveText('1');
});
