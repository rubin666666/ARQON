import {test,expect} from '@playwright/test';

test('calculator remains usable with enlarged text and a reduced layout viewport',async({page})=>{
 await page.setViewportSize({width:720,height:450});
 await page.goto('en/');
 await page.getByRole('link',{name:'Calculate payback',exact:true}).first().click();
 // A 720x450 CSS viewport corresponds to 200% zoom on a 1440x900 window.
 // Also enlarge all current text independently to exercise text-only scaling.
 await page.evaluate(()=>{const nodes=[...document.querySelectorAll<HTMLElement>('.calculator-wizard, .calculator-wizard *')];const sizes=nodes.map(el=>parseFloat(getComputedStyle(el).fontSize)*2);nodes.forEach((el,i)=>el.style.fontSize=sizes[i]+'px');});
 const field=page.locator('#eng-volume');await field.scrollIntoViewIfNeeded();await field.fill('2345');
 await page.getByRole('button',{name:'Next',exact:true}).click();
 await page.getByRole('button',{name:'Results',exact:true}).click();
 await expect(page.locator('#calculator-result')).toBeVisible();
 await page.getByRole('button',{name:'Close calculator',exact:true}).click();
 await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('rotation and short screens keep calculator and gallery controls reachable',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('en/');
 await page.getByRole('link',{name:'Calculate payback',exact:true}).first().click();
 await page.locator('#eng-volume').click();await page.locator('#eng-volume').fill('2345');
 await page.setViewportSize({width:844,height:390});
 await page.getByRole('button',{name:'Next',exact:true}).click();
 await page.getByRole('button',{name:'Results',exact:true}).click();
 await page.getByRole('button',{name:'Edit inputs',exact:true}).click();
 await expect(page.locator('#eng-volume')).toHaveValue('2 345');
 await page.getByRole('button',{name:'Close calculator',exact:true}).click();
 await page.getByRole('button',{name:'Model gallery',exact:true}).click();
 await page.getByRole('checkbox',{name:'Compare S10',exact:true}).check();
 await page.setViewportSize({width:390,height:450});
 await page.getByRole('button',{name:'Close gallery',exact:true}).click();
 await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('rapid repeated PDF activation starts only one download and recovers',async({page})=>{
 test.setTimeout(60000);
 await page.goto('en/');await page.getByRole('link',{name:'Calculate payback',exact:true}).first().click();
 await page.getByRole('button',{name:'Next',exact:true}).click();await page.getByRole('button',{name:'Results',exact:true}).click();
 await page.getByRole('button',{name:'Download detailed PDF',exact:true}).click();
 let release!:()=>void;const gate=new Promise<void>(resolve=>{release=resolve;});
 let fontRequests=0;let downloads=0;page.on('download',()=>downloads++);
 await page.route('**/fonts/NotoSans.ttf',async route=>{fontRequests++;await gate;await route.continue();});
 try {
  const button=page.getByRole('button',{name:'Download file',exact:true});
  await button.evaluate(el=>{(el as HTMLButtonElement).click();(el as HTMLButtonElement).click();});
  await expect(page.getByRole('button',{name:'Preparing PDF…',exact:true})).toBeDisabled();
  await expect.poll(()=>fontRequests).toBe(1);
  const waiting=page.waitForEvent('download');release();await waiting;
  await expect(page.getByRole('dialog',{name:'Calculation result PDF',exact:true})).toHaveCount(0);
  expect(downloads).toBe(1);
 } finally {release();}
});
