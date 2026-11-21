import {test,expect} from '@playwright/test';

test('selected models survive reload with separate navigation and removal',async({page})=>{
 await page.setViewportSize({width:320,height:740});
 await page.goto('en/');
 const launch=page.getByRole('button',{name:'Open model gallery',exact:true});
 await launch.click();
 for(const name of ['S9','S12','S18'])await page.getByRole('checkbox',{name:'Compare '+name,exact:true}).check();
 await page.getByRole('button',{name:'Compare specifications',exact:true}).click();
 await page.getByRole('button',{name:'← Change models',exact:true}).click();
 await expect(page.getByRole('checkbox',{name:'Compare S18',exact:true})).toBeChecked();
 await page.getByRole('button',{name:'Go to S9',exact:true}).click();
 await expect(page.locator('#gallery-sahara-s9 h3')).toBeFocused();
 await expect(page.locator('#gallery-sahara-s9 h3')).toBeInViewport();
 await expect(page.getByRole('checkbox',{name:'Compare S9',exact:true})).toBeChecked();
 await page.reload();
 await launch.click();
 for(const name of ['S9','S12','S18'])await expect(page.getByRole('checkbox',{name:'Compare '+name,exact:true})).toBeChecked();
 await expect(page.getByRole('checkbox',{name:'Compare S10',exact:true})).toBeDisabled();
 await page.getByRole('button',{name:'Remove S12',exact:true}).click();
 await expect(page.getByRole('checkbox',{name:'Compare S12',exact:true})).not.toBeChecked();
 await page.reload();
 await launch.click();
 await expect(page.getByRole('checkbox',{name:'Compare S12',exact:true})).not.toBeChecked();
 await expect(page.getByRole('checkbox',{name:'Compare S9',exact:true})).toBeChecked();
});

test('invalid saved selections are filtered and unavailable storage does not block selection',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('arqon-model-comparison',JSON.stringify(['missing','sahara-s9','sahara-s9',3,'sahara-s10','sahara-s12','sahara-s18'])));
 await page.goto('en/');
 await page.getByRole('button',{name:'Open model gallery',exact:true}).click();
 await expect(page.locator('.gallery-card input:checked')).toHaveCount(3);
 await expect(page.getByRole('checkbox',{name:'Compare S18',exact:true})).not.toBeChecked();
 await page.evaluate(()=>{Storage.prototype.setItem=()=>{throw new Error('Storage unavailable');};});
 await page.getByRole('button',{name:'Remove S9',exact:true}).click();
 await expect(page.getByRole('checkbox',{name:'Compare S9',exact:true})).not.toBeChecked();
 await page.getByRole('checkbox',{name:'Compare S18',exact:true}).check();
 await expect(page.getByRole('checkbox',{name:'Compare S18',exact:true})).toBeChecked();
});
