import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

async function fill(page: Page, id: string, value: string) {
  const field=page.locator(`#eng-${id}`);
  await field.click(); await field.fill(value); await field.press('Tab');
}
async function open(page: Page, en=false) {
  await page.goto(en?'en/':'./');
  await page.getByRole('link',{name:en?'Calculate payback':'Розрахувати окупність',exact:true}).first().click();
  await expect(page.locator('.calculator-wizard')).toBeVisible();
}
for(const theme of ['light','dark'] as const) {
  test(`Ukrainian input, errors and results are readable in ${theme} theme`,async({page})=>{
    await page.emulateMedia({colorScheme:theme,reducedMotion:'reduce'});
    await open(page);
    await expect(page.locator('html')).toHaveAttribute('lang','uk');
    await expect(page.locator('html')).toHaveClass(theme==='dark'?/dark/:/^(?!.*\bdark\b)/);
    await fill(page,'volume','');
    await page.getByRole('button',{name:'Далі',exact:true}).click();
    await expect(page.locator('#eng-volume')).toBeFocused();
    await expect(page.locator('#eng-volume-error')).toHaveText('Вкажіть значення.');
    const audit=async()=>{
      const result=await new AxeBuilder({page}).include('.calculator-wizard').withRules(['color-contrast']).analyze();
      expect(result.violations).toEqual([]);
    };
    await audit();
    await fill(page,'volume','1 234,5');
    await expect(page.locator('#eng-volume')).toHaveValue('1 234,5');
    await page.getByRole('button',{name:'Далі',exact:true}).click();
    await audit();
    await page.getByRole('button',{name:'Результат',exact:true}).click();
    await expect(page.locator('#calculator-result')).toContainText('Що потрібно для повного розрахунку');
    await audit();
  });
}

for(const en of [false,true]) {
  test(`downloaded ${en?'EN':'UA'} PDF contains the current scenario`,async({page},testInfo)=>{
    test.setTimeout(60000);
    await open(page,en);
    await page.locator('#calc-model').selectOption('sahara-s10');
    await fill(page,'volume','2345');
    await page.getByRole('button',{name:en?'Next':'Далі',exact:true}).click();
    await fill(page,'dryerPrice','3456789');
    await fill(page,'fuelPrice','71,25');
    await fill(page,'electricityPrice','8');
    await fill(page,'elevatorTariff','150');
    await page.getByRole('button',{name:en?'Results':'Результат',exact:true}).click();
    await page.getByRole('button',{name:en?'Download detailed PDF':'Завантажити розширений PDF',exact:true}).click();
    await expect(page.locator('.pdf-preview-summary')).toContainText('S10');
    const waiting=page.waitForEvent('download');
    await page.getByRole('button',{name:en?'Download file':'Завантажити файл',exact:true}).click();
    const download=await waiting;
    expect(download.suggestedFilename()).toContain('S10');
    const path=testInfo.outputPath('report.pdf');
    await download.saveAs(path);
    const loading=getDocument({data:new Uint8Array(await readFile(path)),useSystemFonts:true});
    const pdf=await loading.promise;
    try {
      expect(pdf.numPages).toBe(5);
      let text='';
      for(let n=1;n<=pdf.numPages;n++) {
        const content=await (await pdf.getPage(n)).getTextContent();
        text+=content.items.map(item=>'str' in item?item.str:'').join(' ')+'\n';
      }
      const compact=text.replace(/[\s,]/g,'');
      expect(text).toContain('S10');
      expect(compact).toContain('2345');
      expect(compact).toContain('3456789');
      expect(text).toContain(en?'71.25':'71,25');
      expect(text).toContain(en?'Corn':'Кукурудза');
    } finally {await loading.destroy();}
    await expect(page.getByRole('link',{name:en?'Save the last generated PDF':'Зберегти останній сформований PDF',exact:true})).toBeVisible();
  });
}

test('shared scenario opens in a fresh browser context and retains language and model prices',async({page,browser,browserName})=>{
  if(browserName==='chromium')await page.context().grantPermissions(['clipboard-read','clipboard-write']);
  else await page.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:()=>Promise.reject(new Error('Clipboard unavailable'))}}));
  await open(page);
  await fill(page,'volume','2345');
  await page.getByRole('button',{name:'Далі',exact:true}).click();
  await fill(page,'dryerPrice','1111111');
  await page.getByRole('button',{name:/Зерно та модель/}).click();
  await page.locator('#calc-model').selectOption('sahara-s10');
  await page.getByRole('button',{name:'Далі',exact:true}).click();
  await fill(page,'dryerPrice','2222222');
  await page.getByRole('button',{name:'Результат',exact:true}).click();
  await page.getByRole('button',{name:'Поділитися сценарієм',exact:true}).click();
  const url=browserName==='chromium'?await page.evaluate(()=>navigator.clipboard.readText()):await page.getByRole('textbox',{name:'Скопіюйте посилання',exact:true}).inputValue();
  expect(new URL(url).searchParams.has('engineering')).toBe(true);
  const context=await browser.newContext();
  try {
    const recipient=await context.newPage(); await recipient.goto(url);
    await expect(recipient.locator('#calc-model')).toHaveValue('sahara-s10');
    await expect(recipient.locator('#eng-volume')).toHaveValue('2 345');
    await recipient.getByRole('button',{name:'Закрити калькулятор',exact:true}).click();
    await recipient.getByRole('button',{name:'English',exact:true}).click();
    await expect(recipient.locator('html')).toHaveAttribute('lang','en');
    await recipient.getByRole('button',{name:'Continue my calculation',exact:true}).click();
    await recipient.getByRole('button',{name:'Next',exact:true}).click();
    await expect(recipient.locator('#eng-dryerPrice')).toHaveValue('2 222 222');
    await recipient.getByRole('button',{name:/Grain and model/}).click();
    await recipient.locator('#calc-model').selectOption('sahara-s9');
    await recipient.getByRole('button',{name:'Next',exact:true}).click();
    await expect(recipient.locator('#eng-dryerPrice')).toHaveValue('1 111 111');
    await recipient.reload();
    await expect(recipient.locator('#calc-model')).toHaveValue('sahara-s9');
    await expect(recipient.locator('#eng-volume')).toHaveValue('2 345');
    await recipient.getByRole('button',{name:'Next',exact:true}).click();
    await expect(recipient.locator('#eng-dryerPrice')).toHaveValue('1 111 111');
  } finally {await context.close();}
});

