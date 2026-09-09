/** All rates must be supplied and approved by ARQON before enabling results.
 * Mass uses metric tonnes; moisture uses percentage points, not fractions.
 * Elevator billing uses tonne-percentage-points, NOT tonnes of removed water.
 */
export function calculatePayback(input, rates) {
  if (!rates || rates.approved !== true) return { status: 'unconfigured' };
  const {
    volume,
    initialMoisture,
    finalMoisture,
    distance,
    elevatorTariff,
    dieselPrice,
    electricityPrice,
    delayedSale,
  } = input;
  const numbers = [
    volume,
    initialMoisture,
    finalMoisture,
    distance,
    elevatorTariff,
    dieselPrice,
    electricityPrice,
  ];
  if (
    numbers.some(
      (v) => typeof v !== 'number' || !Number.isFinite(v) || v < 0,
    ) ||
    volume <= 0 ||
    initialMoisture >= 100 ||
    initialMoisture <= finalMoisture
  )
    return { status: 'invalid' };
  const keys = [
    'capex',
    'installation',
    'dieselLitresPerTonneWater',
    'electricityKwhPerTonneRaw',
    'maintenancePerTonneRaw',
    'labourPerSeason',
    'labFeePerSeason',
    'logisticsPerTonneKm',
    'storageMarginPerTonneDry',
  ];
  if (
    keys.some(
      (k) =>
        typeof rates[k] !== 'number' ||
        !Number.isFinite(rates[k]) ||
        rates[k] < 0,
    ) ||
    rates.capex + rates.installation <= 0
  )
    return { status: 'unconfigured' };
  const removedWaterTonnes =
    (volume * (initialMoisture - finalMoisture)) / (100 - finalMoisture);
  const dryMassTonnes = volume - removedWaterTonnes;
  const fuel =
    removedWaterTonnes * rates.dieselLitresPerTonneWater * dieselPrice;
  const electricity =
    volume * rates.electricityKwhPerTonneRaw * electricityPrice;
  const operatingCost =
    fuel +
    electricity +
    volume * rates.maintenancePerTonneRaw +
    rates.labourPerSeason;
  const elevatorCost =
    volume * (initialMoisture - finalMoisture) * elevatorTariff +
    rates.labFeePerSeason +
    volume * distance * rates.logisticsPerTonneKm;
  const storageMargin = delayedSale
    ? dryMassTonnes * rates.storageMarginPerTonneDry
    : 0;
  const savings = elevatorCost - operatingCost + storageMargin;
  return {
    status: 'ready',
    removedWaterTonnes,
    dryMassTonnes,
    fuel,
    electricity,
    operatingCost,
    elevatorCost,
    storageMargin,
    savings,
    paybackSeasons:
      savings > 0 ? (rates.capex + rates.installation) / savings : null,
  };
}
