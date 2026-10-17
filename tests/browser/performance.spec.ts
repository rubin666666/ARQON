import {test,expect} from '@playwright/test';

test('slow mobile first screen stays stable and defers PDF resources',async({page,browserName},info)=>{
  test.skip(browserName!=='chromium','Network throttling uses Chromium CDP');
  test.setTimeout(60000);
  await page.setViewportSize({width:390,height:844});
  const session=await page.context().newCDPSession(page);
  await session.send('Network.enable');
  await session.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:200000,uploadThroughput:100000});
  await session.send('Emulation.setCPUThrottlingRate',{rate:4});
  await page.addInitScript(()=>{
    const metrics={lcp:0,cls:0};
    Object.assign(window,{loadMetrics:metrics});
    new PerformanceObserver(list=>{for(const entry of list.getEntries())metrics.lcp=entry.startTime;}).observe({type:'largest-contentful-paint',buffered:true});
    new PerformanceObserver(list=>{for(const entry of list.getEntries()){const shift=entry as PerformanceEntry&{hadRecentInput:boolean;value:number};if(!shift.hadRecentInput)metrics.cls+=shift.value;}}).observe({type:'layout-shift',buffered:true});
  });
  const requests:string[]=[];page.on('request',r=>requests.push(r.url()));
  await page.goto('./');
  await expect(page.locator('.hero h1')).toBeVisible();
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.querySelectorAll<HTMLImageElement>('.hero img')].map(img=>img.decode()));});
  await page.screenshot({path:info.outputPath('slow-first-screen.png')});
  await page.getByRole('button',{name:'Меню',exact:true}).click();
  await expect(page.getByRole('dialog',{name:'Навігація',exact:true})).toBeVisible();
  const metrics=await page.evaluate(()=>({...(window as unknown as {loadMetrics:{lcp:number;cls:number}}).loadMetrics,resources:performance.getEntriesByType('resource').map(e=>({name:e.name,bytes:(e as PerformanceResourceTiming).encodedBodySize}))}));
  expect(metrics.resources.find(r=>r.name.endsWith('/fonts/NotoSans.woff2'))?.bytes).toBeLessThan(100000);
  await info.attach('slow-network-metrics',{body:JSON.stringify(metrics,null,2),contentType:'application/json'});
  expect(requests.filter(url=>/fontkit|engineering-report|NotoSans\.ttf|sahara-product-v2/.test(url))).toEqual([]);
  expect(metrics.cls).toBeLessThan(0.1);
  expect(metrics.lcp).toBeGreaterThan(0);
  expect(metrics.lcp).toBeLessThan(15000);
});

