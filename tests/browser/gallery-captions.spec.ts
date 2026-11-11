import {test,expect} from '@playwright/test';
for(const en of [false,true])test(`gallery captions describe the current image in ${en?'English':'Ukrainian'}`,async({page},info)=>{
 await page.setViewportSize({width:320,height:568});await page.goto(en?'en/':'./');
 await page.getByRole('button',{name:en?'Open model gallery':'Відкрити галерею моделей',exact:true}).click();
 await page.getByRole('button',{name:en?'Enlarge image S9':'Збільшити зображення S9',exact:true}).click();
 const viewer=page.locator('.model-photo-viewer');
 await expect(viewer.getByRole('heading')).toContainText(en?'Outline illustration':'Контурна ілюстрація');
 await expect(viewer.locator('.photo-series-note')).toBeVisible();
 await expect(viewer.locator('.photo-explanation')).toContainText(en?'outline illustration':'контурної ілюстрації');
 await page.getByRole('button',{name:en?'Next image':'Наступне зображення',exact:true}).click();
 await expect(viewer.getByRole('heading')).toContainText(en?'General view':'Загальний вигляд');
 await expect(viewer.locator('.photo-explanation')).toContainText(en?'housing':'корпусу');
 await expect(viewer.locator('.photo-navigation output')).toHaveText('2 / 2');
 for(const size of [{width:320,height:568},{width:844,height:390}]){
  await page.setViewportSize(size);
  const caption=await viewer.locator('.photo-explanation').boundingBox();
  const nav=await viewer.locator('.photo-navigation').boundingBox();
  const image=await viewer.locator('.model-photo-stage').boundingBox();
  expect(caption!.y).toBeGreaterThanOrEqual(image!.y+image!.height-1);
  expect(nav!.y+nav!.height).toBeLessThanOrEqual(size.height);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(size.width);
 }
 await page.screenshot({path:`work/captions-${en?'en':'uk'}-${info.project.name}.png`});
});
