import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePayback } from '../lib/calculator.mjs';
const input = {
  volume: 1000,
  initialMoisture: 25,
  finalMoisture: 14,
  distance: 30,
  elevatorTariff: 150,
  dieselPrice: 60,
  electricityPrice: 8,
  delayedSale: false,
};
// Synthetic test fixtures, not manufacturer values.
const rates = {
  approved: true,
  capex: 2000000,
  installation: 100000,
  dieselLitresPerTonneWater: 10,
  electricityKwhPerTonneRaw: 2,
  maintenancePerTonneRaw: 10,
  labourPerSeason: 20000,
  labFeePerSeason: 2000,
  logisticsPerTonneKm: 2,
  storageMarginPerTonneDry: 100,
};
test('does not fabricate results before approval', () => {
  assert.equal(calculatePayback(input, null).status, 'unconfigured');
  assert.equal(
    calculatePayback(input, { ...rates, approved: false }).status,
    'unconfigured',
  );
});
test('mass conservation and correct elevator tariff units', () => {
  const r = calculatePayback(input, rates);
  assert.ok(Math.abs(r.dryMassTonnes * 0.86 - 750) < 1e-8);
  assert.equal(r.dryMassTonnes + r.removedWaterTonnes, 1000);
  assert.equal(r.elevatorCost, 1712000);
  assert.ok(r.paybackSeasons > 0);
});
test('rejects impossible moisture and invalid inputs', () => {
  for (const update of [
    { initialMoisture: 14 },
    { initialMoisture: 100 },
    { volume: 0 },
    { dieselPrice: -1 },
    { volume: NaN },
  ])
    assert.equal(
      calculatePayback({ ...input, ...update }, rates).status,
      'invalid',
    );
});
test('non-positive savings have no payback period', () => {
  const r = calculatePayback(
    { ...input, elevatorTariff: 0, distance: 0 },
    rates,
  );
  assert.equal(r.paybackSeasons, null);
});
test('delayed sale is based on saleable dry mass', () => {
  const r = calculatePayback({ ...input, delayedSale: true }, rates);
  assert.equal(r.storageMargin, r.dryMassTonnes * 100);
});
