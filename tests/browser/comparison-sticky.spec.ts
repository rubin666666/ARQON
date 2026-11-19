import {test,expect} from '@playwright/test';
for(const size of [{width:1440,height:900},{width:320,height:568}])test(`comparison headings stay visible at ${size.width}`,async({page},info)=>{
 await page.setViewportSize(size);await page.emulateMedia({reducedMotion:'reduce'});await page.goto('./');
 await page.getByRole('button',{name:'Відкрити галерею моделей',exact:true}).click();
 for(const model of ['S9','S10','S12'])await page.getByRole('checkbox',{name:`До порівняння ${model}`,exact:true}).check();
 await page.getByRole('button',{name:'Порівняти характеристики',exact:true}).click();
 const dialog=page.locator('.model-comparison-dialog'),body=dialog.locator('.model-dialog-scroll'),scroller=dialog.locator('.spec-comparison-scroll');
 await expect(body).toHaveCSS('overflow-y','hidden');
 expect(await body.evaluate(el=>el.scrollHeight<=el.clientHeight+1)).toBe(true);
 for(const fraction of [.35,.7]){
  await scroller.evaluate((el,f)=>{el.scrollTop=(el.scrollHeight-el.clientHeight)*f;},fraction);
  const bounds=await scroller.boundingBox();
  for(const heading of await scroller.locator('thead th').all()){
   await expect.poll(async()=>(await heading.boundingBox())!.y).toBeGreaterThanOrEqual(bounds!.y-1);
   expect((await heading.boundingBox())!.y).toBeLessThanOrEqual(bounds!.y+2);
  }
 }
 await scroller.evaluate(el=>{el.scrollLeft=el.scrollWidth;});
 await expect(scroller.getByRole('columnheader',{name:'S12',exact:true})).toBeInViewport();
 await page.screenshot({path:`work/comparison-sticky-${size.width}-${info.project.name}.png`});
 await scroller.getByRole('button',{name:'Розрахувати S12',exact:true}).click();
 await expect(page.locator('#calc-model')).toHaveValue('sahara-s12');
});
