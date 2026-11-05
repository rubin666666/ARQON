import {test,expect} from '@playwright/test';

test('a stalled PDF font request times out and unlocks retry',async({page})=>{
  test.setTimeout(40000);
  await page.goto('en/');
  await page.getByRole('link',{name:'Calculate payback',exact:true}).click();
  await page.getByRole('button',{name:'Next',exact:true}).click();
  await page.getByRole('button',{name:'Results',exact:true}).click();
  await page.getByRole('button',{name:'Download detailed PDF',exact:true}).click();
  await page.route('**/fonts/NotoSans.ttf',()=>{});
  await page.getByRole('button',{name:'Download file',exact:true}).click();
  await expect(page.getByRole('alert')).toContainText('Could not generate the file. Please retry.',{timeout:25000});
  await expect(page.getByRole('button',{name:'Download file',exact:true})).toBeEnabled();
});

test('closing a pending PDF cancels it and permits a fresh download',async({page})=>{
  test.setTimeout(60000);
  await page.goto('en/');
  await page.getByRole('link',{name:'Calculate payback',exact:true}).click();
  await page.getByRole('button',{name:'Next',exact:true}).click();
  await page.getByRole('button',{name:'Results',exact:true}).click();
  await page.getByRole('button',{name:'Download detailed PDF',exact:true}).click();
  let release!:()=>void;
  const hold=new Promise<void>(resolve=>{release=resolve;});
  await page.route('**/fonts/NotoSans.ttf',async route=>{await hold;await route.continue().catch(()=>{});});
  const request=page.waitForRequest('**/fonts/NotoSans.ttf');
  let downloads=0;page.on('download',()=>downloads++);
  await page.getByRole('button',{name:'Download file',exact:true}).click();
  await request;
  await page.getByRole('button',{name:'Close report',exact:true}).click();
  await expect(page.getByRole('button',{name:'Download detailed PDF',exact:true})).toBeEnabled();
  release();await page.unroute('**/fonts/NotoSans.ttf');
  await page.getByRole('button',{name:'Download detailed PDF',exact:true}).click();
  const download=page.waitForEvent('download');
  await page.getByRole('button',{name:'Download file',exact:true}).click();
  expect(await (await download).failure()).toBeNull();
  await expect(page.getByRole('dialog',{name:'Calculation result PDF',exact:true})).toHaveCount(0);
  expect(downloads).toBe(1);
});

test('mobile hero and window content load only the required resources',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  const requests:string[]=[];page.on('request',r=>requests.push(r.url()));
  await page.goto('en/');
  await page.evaluate(()=>document.fonts.ready);
  expect(requests.some(url=>url.endsWith('/sahara-hero-mobile.webp'))).toBe(true);
  expect(requests.some(url=>url.endsWith('/sahara-hero.webp'))).toBe(false);
  expect(requests.filter(url=>/model-explorer-content|about-panels|dryer-panels/.test(url))).toEqual([]);
  await page.getByRole('button',{name:/More about the company/}).click();
  await expect(page.getByRole('tab',{name:'Company',exact:true})).toBeVisible();
  expect(requests.some(url=>url.includes('about-panels'))).toBe(true);
  await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'Model gallery',exact:true}).click();
  await expect(page.locator('.gallery-card')).toHaveCount(6);
  expect(requests.some(url=>url.includes('model-explorer-content'))).toBe(true);
});
