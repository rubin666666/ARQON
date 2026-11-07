import {test,expect} from '@playwright/test';

for(const blocked of [false,true])test(`basic parameters copy stays current with clipboard ${blocked?'blocked':'available'}`,async({page})=>{
  await page.addInitScript((deny)=>{
    Object.defineProperty(navigator,'clipboard',{value:{writeText:async(text:string)=>{
      if(deny)throw new DOMException('Blocked','NotAllowedError');
      document.documentElement.dataset.copiedBrief=text;
    }}});
  },blocked);
  await page.goto('en/');
  await page.getByRole('link',{name:'Calculate payback',exact:true}).first().click();
  await page.locator('#eng-volume').click();await page.locator('#eng-volume').fill('2345');
  await page.getByRole('button',{name:'Next',exact:true}).click();
  await page.getByRole('button',{name:'Results',exact:true}).click();
  await page.getByRole('button',{name:'Copy basic parameters',exact:true}).click();
  const brief=page.getByRole('textbox',{name:'Basic parameters to share',exact:true});
  await expect(brief).toBeVisible();
  expect(await brief.inputValue()).toContain('Incoming grain per season: 2,345 t');
  expect(await brief.inputValue()).toContain('Selected dryer price: Not provided');
  await expect(page.locator('.calculation-brief output')).toContainText(blocked?'Automatic copying is unavailable':'Basic parameters copied');
  if(!blocked)expect(await page.locator('html').getAttribute('data-copied-brief')).toBe(await brief.inputValue());
  await page.locator('.calculator-wizard-footer').getByRole('button',{name:'Edit inputs',exact:true}).click();
  await page.locator('#eng-volume').click();await page.locator('#eng-volume').fill('3456');
  await page.getByRole('button',{name:'Next',exact:true}).click();
  await page.getByRole('button',{name:'Results',exact:true}).click();
  await expect(brief).toHaveCount(0);
  await page.getByRole('button',{name:'Copy basic parameters',exact:true}).click();
  expect(await brief.inputValue()).toContain('Incoming grain per season: 3,456 t');
  const box=await brief.boundingBox();
  expect(box!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
});

test('model preparation guide opens beside specifications and preserves the selected model',async({page})=>{
  await page.goto('en/');
  await page.getByRole('button',{name:'Open product gallery: S10',exact:true}).click();
  const card=page.locator('.gallery-card').filter({has:page.getByRole('heading',{name:'S10',exact:true})});
  await card.getByRole('button',{name:'Open specifications',exact:true}).click();
  await page.getByText('What should I prepare for dryer selection?',{exact:true}).click();
  await expect(page.locator('.model-preparation')).toContainText('Leave unknown prices blank');
  await expect(page.locator('.model-preparation ul')).toBeVisible();
  await page.getByRole('button',{name:'Calculate for S10',exact:true}).click();
  await expect(page.locator('#calc-model')).toHaveValue('sahara-s10');
});

test('Ukrainian basic parameters remain readable on a narrow light screen',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({colorScheme:'light'});
  await page.goto('./');
  await page.getByRole('link',{name:'Розрахувати окупність',exact:true}).first().click();
  await page.getByRole('button',{name:'Далі',exact:true}).click();
  await page.getByRole('button',{name:'Результат',exact:true}).click();
  await page.getByRole('button',{name:'Скопіювати основні параметри',exact:true}).click();
  const brief=page.getByRole('textbox',{name:'Основні параметри для передачі',exact:true});
  await expect(brief).toBeVisible();
  expect(await brief.inputValue()).toContain('Ціна обраної сушарки: Не задано');
  await brief.scrollIntoViewIfNeeded();
  await page.screenshot({path:`work/brief-${test.info().project.name}.png`});
});
