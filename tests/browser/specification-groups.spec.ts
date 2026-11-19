import {test,expect} from '@playwright/test';
import config from '../../config/site.json' with {type:'json'};
for(const en of [false,true])test(`grouped specifications preserve all client data (${en?'en':'uk'})`,async({page},info)=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(en?'en/':'./');
 await page.getByRole('button',{name:en?'Open model gallery':'Відкрити галерею моделей',exact:true}).click();
 for(const model of config.models){
  const card=page.locator('.gallery-card').filter({has:page.getByRole('heading',{name:model.name,exact:true})});
  await card.getByRole('button',{name:en?'Open specifications':'Відкрити характеристики',exact:true}).click();
  const drawer=page.locator('.model-drawer');
  await expect(drawer.locator('.model-specification-group')).toHaveCount(3);
  await expect(drawer.locator('[data-spec-id]')).toHaveCount(model.specifications.length);
  for(const spec of model.specifications){
   const row=drawer.locator(`[data-spec-id="${spec.id}"]`);
   await expect(row.locator('dt')).toHaveText(spec.label[en?'en':'uk']);
   await expect(row.locator('dd')).toHaveText(spec.value[en?'en':'uk']);
  }
  expect(await drawer.locator('.model-dialog-scroll').evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);
  if(model===config.models[0]){
   await drawer.locator('.model-specification-group').first().scrollIntoViewIfNeeded();
   await page.screenshot({path:`work/spec-groups-${en?'en':'uk'}-${info.project.name}.png`});
  }
  await drawer.getByRole('button',{name:en?'Close details':'Закрити подробиці',exact:true}).click();
  await expect(drawer).toBeHidden();
 }
});

