import {test,expect,type Page} from '@playwright/test';

async function noOverflow(page:Page) {
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  const dialogs=page.getByRole('dialog');
  for(const dialog of await dialogs.all()) {
    const box=await dialog.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(-1);
    expect(box!.x+box!.width).toBeLessThanOrEqual((page.viewportSize()?.width??0)+1);
  }
}
for(const en of [false,true]) {
  test(`${en?'EN':'UA'} navigation, menu and section targets`,async({page})=>{
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.goto(en?'en/':'./');
    const menu=page.getByRole('button',{name:en?'Menu':'Меню',exact:true});
    await menu.click();
    const links=page.locator('.menu-links > div > a');
    const targets=await links.evaluateAll(elements=>elements.map(el=>el.getAttribute('href')!));
    for(const target of targets) {
      await page.locator(`.menu-links > div > a[href="${target}"]`).click();
      await expect(page.getByRole('dialog',{name:en?'Navigation':'Навігація',exact:true})).toHaveCount(0);
      await expect(page.locator(target)).toBeVisible();
      await expect.poll(async()=>page.locator(target).evaluate(el=>el.getBoundingClientRect().top)).toBeLessThan(page.viewportSize()!.height);
      await noOverflow(page);
      await menu.click();
    }
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(menu).toBeFocused();
    const broken=await page.locator('.desktop-nav a, .footer-nav a, .footer-top').evaluateAll(links=>links.filter(el=>{const href=el.getAttribute('href');return href?.startsWith('#')&&!document.getElementById(href.slice(1));}).map(el=>el.textContent));
    expect(broken).toEqual([]);
  });
  test(`${en?'EN':'UA'} gallery, details, comparison and calculator handoff`,async({page})=>{
    await page.goto(en?'en/':'./');
    const launcher=page.getByRole('button',{name:en?'Model gallery':'Галерея моделей',exact:true});
    await launcher.click();
    await expect(page.locator('.gallery-card')).toHaveCount(6);
    const card=page.locator('.gallery-card').filter({has:page.getByRole('heading',{name:'S10',exact:true})});
    await card.getByRole('button',{name:en?'All specifications':'Усі характеристики',exact:true}).click();
    await expect(page.locator('.model-specs')).toBeVisible();
    await noOverflow(page);
    await page.getByRole('button',{name:en?'Close details':'Закрити подробиці',exact:true}).click();
    await expect(page.locator('.model-specs')).toHaveCount(0);
    for(const model of ['S9','S10','S12'])await page.getByRole('checkbox',{name:`${en?'Compare':'До порівняння'} ${model}`,exact:true}).check();
    await expect(page.getByRole('checkbox',{name:`${en?'Compare':'До порівняння'} S13`,exact:true})).toBeDisabled();
    await page.getByRole('button',{name:en?'Remove S12':'Прибрати S12',exact:true}).click();
    await expect(page.getByRole('checkbox',{name:`${en?'Compare':'До порівняння'} S13`,exact:true})).toBeEnabled();
    await page.getByRole('button',{name:en?'Compare specifications':'Порівняти характеристики',exact:true}).click();
    await noOverflow(page);
    const comparison=page.locator('.model-comparison-dialog');
    await expect(comparison.getByRole('columnheader')).toHaveText([en?'Specification':'Характеристика','S9','S10']);
    await comparison.getByRole('button',{name:en?'Calculate S10':'Розрахувати S10',exact:true}).click();
    await expect(page.locator('#calc-model')).toHaveValue('sahara-s10');
    await expect(page.locator('#model-gallery')).toHaveCount(0);
    await page.getByRole('button',{name:en?'Close calculator':'Закрити калькулятор',exact:true}).click();
    await launcher.click();
    await page.getByRole('button',{name:en?'Close gallery':'Закрити галерею',exact:true}).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(launcher).toBeFocused();
  });
}
for(const theme of ['light','dark'] as const) {
  test(`narrow mobile sections and gallery fit in ${theme} theme`,async({page},info)=>{
    await page.setViewportSize({width:320,height:740});
    await page.emulateMedia({colorScheme:theme,reducedMotion:'reduce'});
    await page.goto('./');
    for(const id of ['main','about','products','technology','calculator','faq']) {
      const section=page.locator(`#${id}`);
      await section.scrollIntoViewIfNeeded();
      await noOverflow(page);
    }
    await page.getByRole('button',{name:'Галерея моделей',exact:true}).click();
    await noOverflow(page);
    const card=page.locator('.gallery-card').first();
    await card.getByRole('button',{name:'Розрахувати S9',exact:true}).scrollIntoViewIfNeeded();
    await page.screenshot({path:info.outputPath('mobile-gallery.png')});
    await expect(card.getByRole('button',{name:'Розрахувати S9',exact:true})).toBeInViewport();
    const clipped=await card.locator('h3, dt, dd, button').evaluateAll(nodes=>nodes.filter(el=>el.scrollWidth>el.clientWidth+2).map(el=>el.textContent));
    expect(clipped).toEqual([]);
  });
}
