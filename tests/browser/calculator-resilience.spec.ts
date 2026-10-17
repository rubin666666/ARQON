import {test,expect} from '@playwright/test';

test('calculator and share fallback work when storage and clipboard are blocked',async({page})=>{
  await page.addInitScript(()=>{
    Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Blocked','SecurityError');}});
    Object.defineProperty(navigator,'clipboard',{value:{writeText:()=>Promise.reject(new DOMException('Blocked','NotAllowedError'))}});
  });
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('en/');
  await page.getByRole('link',{name:'Calculate payback',exact:true}).first().click();
  await page.locator('#eng-volume').click();await page.locator('#eng-volume').fill('2345');
  await page.getByRole('button',{name:'Next',exact:true}).click();
  await page.getByRole('button',{name:'Results',exact:true}).click();
  await page.getByRole('button',{name:'Share scenario',exact:true}).click();
  const link=page.getByRole('textbox',{name:'Copy the link',exact:true});
  await expect(link).toBeVisible();
  const url=await link.inputValue();
  expect(JSON.parse(new URL(url).searchParams.get('engineering')!).draft.volume).toBe('2345');
  await page.goto(url);
  await expect(page.locator('#eng-volume')).toHaveValue('2 345');
  expect(errors).toEqual([]);
});

test('PDF network failure permits retry and keeps entered values',async({page})=>{
  test.setTimeout(60000);
  await page.goto('en/');
  await page.getByRole('link',{name:'Calculate payback',exact:true}).first().click();
  await page.locator('#eng-volume').click();await page.locator('#eng-volume').fill('2345');
  await page.getByRole('button',{name:'Next',exact:true}).click();
  await page.getByRole('button',{name:'Results',exact:true}).click();
  await page.getByRole('button',{name:'Download detailed PDF',exact:true}).click();
  await page.route('**/fonts/NotoSans.ttf',route=>route.abort());
  await page.getByRole('button',{name:'Download file',exact:true}).click();
  await expect(page.getByRole('alert')).toContainText('Could not generate the file. Please retry.');
  await expect(page.getByRole('button',{name:'Download file',exact:true})).toBeEnabled();
  await expect(page.locator('.pdf-preview-summary')).toContainText('2,345');
  await page.unroute('**/fonts/NotoSans.ttf');
  const waiting=page.waitForEvent('download');
  await page.getByRole('button',{name:'Download file',exact:true}).click();
  const download=await waiting;
  expect(await download.failure()).toBeNull();
  await expect(page.getByRole('link',{name:'Save the last generated PDF',exact:true})).toBeVisible();
  await expect(page.getByRole('dialog',{name:'Calculation result PDF',exact:true})).toHaveCount(0);
  await page.locator('.calculator-wizard-footer').getByRole('button',{name:'Edit inputs',exact:true}).click();
  await expect(page.locator('#eng-volume')).toHaveValue('2 345');
});
