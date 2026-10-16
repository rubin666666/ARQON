import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('en/');
  await page.getByRole('link', { name: 'Calculate payback', exact: true }).first().click();
  await expect(page.getByRole('dialog', { name: 'Efficiency calculator' })).toBeVisible();
});

test('invalid and empty input stays focused; grouped decimals survive reload', async ({ page }) => {
  const volume = page.locator('#eng-volume');
  await volume.click();
  for (const value of ['', 'abc', '-1', '0', '1,2,3']) {
    await volume.fill(value);
    await volume.press('Enter');
    await expect(volume).toBeFocused();
    await expect(volume).toHaveAttribute('aria-invalid', 'true');
  }
  await volume.fill('1\u202f234,');
  await volume.press('Tab');
  await expect(volume).toHaveValue('1 234');
  await page.reload();
  await page.getByRole('button', { name: 'Continue my calculation', exact: true }).first().click();
  await expect(volume).toHaveValue('1 234');
  await volume.click();
  await volume.fill(',5');
  await volume.press('Tab');
  await expect(volume).toHaveValue('0.5');
});

test('model and crop selection reach a partial result without invented prices', async ({ page }) => {
  await page.getByRole('combobox', { name: 'Dryer model', exact: true }).selectOption({ label: 'S10' });
  await page.getByRole('combobox', { name: 'Crop', exact: true }).selectOption('sunflower');
  await expect(page.locator('.engineering-reference')).toContainText('14% → 7%');
  await page.getByRole('combobox', { name: 'Crop', exact: true }).selectOption('rapeseed');
  await expect(page.locator('.engineering-reference')).toContainText('12% → 9%');
  await page.getByRole('combobox', { name: 'Crop', exact: true }).selectOption('corn');
  await expect(page.locator('.engineering-reference')).toContainText('25% → 15%');
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('button', { name: 'Results', exact: true }).click();
  await expect(page.locator('#calculator-result')).toBeFocused();
  await expect(page.locator('#calculator-result')).toContainText('S10');
  await expect(page.locator('#calculator-result')).toContainText('What is needed for a complete calculation');
  await page.getByRole('button', { name: 'Enter value', exact: true }).first().click();
  await expect(page.locator('#calculator-inputs input:focus')).toBeVisible();
});

test('Tab order, Enter, Escape and focus return', async ({ page }) => {
  const hours = page.locator('#eng-dailyHours');
  const volume = page.locator('#eng-volume');
  await hours.focus();
  await hours.press('Tab');
  await expect(volume).toBeFocused();
  await volume.press('Shift+Tab');
  await expect(hours).toBeFocused();
  await hours.press('Enter');
  await expect(volume).toBeFocused();
  await volume.press('Enter');
  await expect(page.locator('#calculator-step-title')).toBeFocused();
  // Tab must wrap inside the dialog, never reach the page behind it.
  await page.locator('.calculator-wizard-footer').getByRole('button', { name: 'Results', exact: true }).focus();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Close calculator', exact: true })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.locator('.calculator-wizard-footer').getByRole('button', { name: 'Results', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Calculate payback', exact: true }).first()).toBeFocused();
});

test('energy prices and model quote produce a complete result', async ({ page }) => {
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  for (const [id,value] of [['fuelPrice','70,5'],['electricityPrice','8'],['dryerPrice','2 000 000'],['elevatorTariff','150']]) {
    const field=page.locator(`#eng-${id}`);
    await field.click();
    await field.fill(value);
    await field.press('Tab');
  }
  await page.getByRole('button', { name: 'Results', exact: true }).click();
  await expect(page.locator('#calculator-result')).toBeFocused();
  await expect(page.locator('#calculator-result')).not.toContainText('What is needed for a complete calculation');
  await expect(page.getByRole('button', { name: 'Share scenario', exact: true })).toBeEnabled();
});

