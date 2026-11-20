import {test,expect} from '@playwright/test';
for(const en of [false,true])test(`compact company topic windows ${en?'en':'uk'}`,async({page},info)=>{
 await page.setViewportSize({width:390,height:844});await page.goto(en?'en/':'./');
 const section=page.locator('#about');await section.scrollIntoViewIfNeeded();
 expect((await section.boundingBox())!.height).toBeLessThan(700);
 await page.screenshot({path:`work/company-compact-${en?'en':'uk'}-${info.project.name}.png`});
 for(const [topic,heading] of en?[['More about the company','Who we are'],['Expertise','What we do'],['International network','International engineering and manufacturing network']]:[['Докладніше про компанію','Хто ми'],['Компетенції','Чим ми займаємося'],['Міжнародна мережа','Міжнародна інженерно-виробнича мережа']]){
  const launcher=section.locator('.about-mobile-links').getByRole('button',{name:topic,exact:true});
  await launcher.click();const dialog=page.locator('.about-topic-dialog');
  await expect(dialog.getByRole('heading',{name:heading,exact:true})).toBeVisible();
  await expect(dialog.getByRole('tab')).toHaveCount(0);
  await expect(dialog.getByRole('tabpanel')).toHaveCount(1);
  expect(await dialog.getByRole('tabpanel').evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);
  if(topic===(en?'Expertise':'Компетенції'))await expect(dialog.locator('.benefits > div')).toHaveCount(3);
  await dialog.getByRole('button',{name:en?'Close company description':'Закрити опис компанії',exact:true}).click();
  await expect(dialog).toBeHidden();await expect(launcher).toBeFocused();
 }
});
