import {calculateEngineering} from './engineering.mjs';

export const divide = (value, denominator) => typeof value === 'number' && Number.isFinite(value) && Number.isFinite(denominator) && denominator > 0 ? value / denominator : null;

/** Report scenarios reuse the approved engine. They never alter the saved calculation.
 * @param {import('./engineering-types').EngineeringInput} input
 * @param {import('./engineering-types').EngineeringData} data
 */
export function reportAnalysis(input, data) {
  const run = patch => {
    const scenario = {...input, ...patch};
    const result = calculateEngineering(scenario, data);
    return {input: scenario, result};
  };
  const baseline = run({});
  const sensitivity = key => [.8, 1, 1.2].map(factor => ({factor, ...run({[key]: input[key] == null ? null : input[key] * factor})}));
  const volumes = [1000, 2000, 3000, 5000, 10000].map(volume => run({volume}));
  const moisture = input.cropId === 'corn' && input.finalMoisture === 15
    ? [20, 25].map(initialMoisture => run({initialMoisture})) : [baseline];
  // Operational break-even excludes investment recovery. Transport uses whole trips,
  // so do not pretend a linear threshold is valid when transport is enabled.
  const r = baseline.result;
  const margin = r.savings == null || r.own?.fixedCost == null ? null : (r.savings + r.own.fixedCost) / input.volume;
  const operationalBreakEven = (input.elevatorDistanceKm ?? 0) === 0 && margin > 0
    ? divide(r.own?.fixedCost, margin) : null;
  return {baseline, tariff: sensitivity('elevatorTariff'), fuel: sensitivity('fuelPrice'), volumes, moisture, operationalBreakEven};
}
