import {test,expect} from '@playwright/test';

test('model previews reopen the chosen card and images support keyboard navigation',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('en/');
  const preview=page.getByRole('button',{name:'Open product gallery: S10',exact:true});
  await preview.click();
  const card=page.locator('.gallery-card').filter({has:page.getByRole('heading',{name:'S10',exact:true})});
  const image=card.getByRole('button',{name:'Enlarge image S10',exact:true});
  await image.click();
  await expect(page.getByRole('button',{name:'Close image',exact:true})).toBeFocused();
  await expect(page.locator('.photo-navigation output')).toHaveText('1 / 2');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.photo-navigation output')).toHaveText('2 / 2');
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('.photo-navigation output')).toHaveText('1 / 2');
  await page.keyboard.press('Escape');
  await expect(image).toBeFocused();
  await card.getByRole('button',{name:'All specifications',exact:true}).click();
  await page.getByRole('button',{name:'Close details',exact:true}).click();
  await expect(card.getByRole('button',{name:'All specifications',exact:true})).toBeFocused();
  await page.locator('.gallery-card').last().scrollIntoViewIfNeeded();
  await page.getByRole('button',{name:'Close gallery',exact:true}).click();
  await expect(preview).toBeFocused();
  await preview.click();
  await expect(card.getByRole('heading',{name:'S10',exact:true})).toBeInViewport();
});

test('comparison can be scrolled with the keyboard on a narrow screen',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('en/');
  await page.getByRole('button',{name:'Model gallery',exact:true}).click();
  for(const model of ['S9','S10','S12'])await page.getByRole('checkbox',{name:`Compare ${model}`,exact:true}).check();
  await page.getByRole('button',{name:'Compare specifications',exact:true}).click();
  const table=page.getByRole('region',{name:'Specifications table',exact:true});
  await table.focus();
  await table.press('ArrowRight');
  await expect.poll(()=>table.evaluate(el=>el.scrollLeft)).toBeGreaterThan(0);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog',{name:'SAHARA models',exact:true})).toBeVisible();
});

test('company and dryer tabs and FAQ remain usable on a narrow screen',async({page})=>{
  await page.setViewportSize({width:320,height:740});
  await page.goto('en/');
  for(const [name,close] of [['More about the company','Close company description'],['More about the dryer','Close dryer description']]) {
    const launcher=page.getByRole('button',{name:new RegExp(name)});
    await launcher.click();
    const dialog=page.getByRole('dialog',{name,exact:true});
    for(const tab of await dialog.getByRole('tab').all()) {
      await tab.click();
      await expect(tab).toHaveAttribute('aria-selected','true');
      await expect(dialog.getByRole('tabpanel')).toHaveCount(1);
      const panel=dialog.getByRole('tabpanel');
      expect(await panel.evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);
      await expect(dialog.getByRole('button',{name:close,exact:true})).toBeInViewport();
    }
    await page.keyboard.press('Escape');
    await expect(launcher).toBeFocused();
  }
  const questions=page.locator('#faq details');
  expect(await questions.count()).toBeGreaterThan(0);
  for(const question of await questions.all()) {
    await question.locator('summary').click();
    await expect(question).toHaveAttribute('open','');
    await expect(question.locator('p')).toBeVisible();
    await question.locator('summary').press('Enter');
    await expect(question).not.toHaveAttribute('open','');
  }
});
