export const ENGINE_VERSION = '2.3.0';
const finite = (n) => typeof n === 'number' && Number.isFinite(n);
const nonnegative = (n) => finite(n) && n >= 0;
const positive = (n) => finite(n) && n > 0;
const sum = (...ns) => ns.every(finite) ? ns.reduce((a, b) => a + b, 0) : null;
const product = (...ns) => ns.every(finite) ? ns.reduce((a, b) => a * b, 1) : null;

/** Pure calculation. Missing engineering parameters remain null, never defaults.
 * @param {import('./engineering-types').EngineeringInput} input
 * @param {import('./engineering-types').EngineeringData} data
 * @returns {import('./engineering-types').EngineeringResult}
 */
export function calculateEngineering(input, data) {
  const r = { status: 'partial', engineVersion: ENGINE_VERSION, parameterVersion: data.version,
    missing: [], warnings: [], own: null, service: null, capacity: null,
    referenceCapacity: null, referenceInput: null, referenceOutput: null, referenceTemperature: null,
    totalDays: null, transportCost: null, storageCost: null, priceEffect: null, servicePaybackSeasons: null, combinedPaybackSeasons: null, totalHours: null, requiredPower: null, elevatorCost: null, ownSystemCost: null, savings: null,
    priceRevenue: null, serviceRevenue: null, serviceProfit: null, economicEffect: null,
    investment: null, paybackSeasons: null, roiPerSeason: null };
  const model = data.models.find(m => m.id === input.modelId);
  const crop = data.crops.find(c => c.id === input.cropId);
  const fuel = data.fuels.find(f => f.id === input.fuelId);
  const ambient = input.ambientTemperature ?? data.ambientTemperature ?? 20;
  const operatorRate = input.operatorPerHour ?? model?.operatorPerHour ?? 0;
  const dryerPrice = input.dryerPrice ?? model?.price;
  const distance = input.elevatorDistanceKm ?? 0;
  const transportInputs = [input.truckPayloadTonnes,input.truckLitresPer100Km,input.transportDieselPrice,input.driverPerTrip];
  const optional = [input.operatorPerHour ?? null, input.fuelPrice, input.electricityPrice, input.elevatorTariff, input.dryerPrice];
  if (!finite(ambient) || ambient < 0 || ambient > 25 || !model || !crop || !fuel || !positive(input.volume) || input.volume > 1e9 ||
      !positive(input.initialMoisture) || input.initialMoisture >= 100 || !positive(input.finalMoisture) ||
      input.initialMoisture <= input.finalMoisture || !['tonne','tonne-point'].includes(input.elevatorBasis) ||
      optional.some(n => n !== null && !nonnegative(n)) ||
      ![input.elevatorOtherPerTonne,input.ownOtherPerTonne].every(nonnegative) ||
      (input.availableHours !== null && !positive(input.availableHours)) ||
      (input.serviceEnabled && (!positive(input.serviceVolume) || input.serviceVolume > 1e9 || (input.serviceTariff !== null && !positive(input.serviceTariff)))) ||
      !nonnegative(distance) || distance % 5 !== 0 ||
      (distance > 0 && (transportInputs.some(n => n != null && !nonnegative(n)) || input.truckPayloadTonnes === 0)) ||
      (input.delayedSale && [input.currentGrainPrice,input.futureGrainPrice,input.storageCostPerTonne].some(n => n != null && !nonnegative(n)))) {
    r.status = 'invalid'; r.warnings.push('INVALID_INPUT'); return r;
  }
  const missing = (code) => { if (!r.missing.includes(code)) r.missing.push(code); };
  const reference = model.reference.find(p => p.cropId === crop.id);
  if (data.fixedRegimes && (!reference || input.initialMoisture !== reference.input || input.finalMoisture !== reference.output)) {
    r.status = 'invalid'; r.warnings.push('UNSUPPORTED_REGIME'); return r;
  }
  if (reference) {
    r.referenceCapacity = reference.capacity; r.referenceInput = reference.input;
    r.referenceOutput = reference.output; r.referenceTemperature = reference.temperature;
  }
  const point = model.correctionPoints.find(p => p.cropId === crop.id && p.input === input.initialMoisture && p.output === input.finalMoisture);
  // Only supplied points are used. No invented interpolation or water-rate extrapolation.
  const capacity = point?.capacity ?? (reference?.status !== 'pending' && reference?.input === input.initialMoisture && reference?.output === input.finalMoisture ? reference.capacity : null);
  r.capacity = positive(capacity) ? capacity : null;
  if (r.capacity === null) missing('CAPACITY_CURVE');
  if (!positive(model.electricalPower)) missing('ELECTRICAL_POWER');
  if (!model.supportedFuels?.includes(fuel.id)) missing('FUEL_COMPATIBILITY');
  if (!positive(fuel.heatingValue)) missing('FUEL_HEATING_VALUE');
  const efficiency = fuel.efficiency ?? model.burnerEfficiency;
  const grainDelta = crop.finalGrainTemperature == null ? crop.grainDelta : Math.max(0,crop.finalGrainTemperature - ambient);
  const thermal = model.thermalApproved && positive(data.waterHeat) && positive(crop.grainHeat) && positive(crop.latentHeat) &&
    nonnegative(crop.waterDelta) && nonnegative(grainDelta) && positive(efficiency) && efficiency <= 1 &&
    nonnegative(model.lossFactor) && nonnegative(model.recoveredFraction) && model.recoveredFraction < 1;
  if (!thermal) missing('THERMAL_PARAMETERS');
  if (!nonnegative(operatorRate) || !nonnegative(dryerPrice)) missing('OPERATING_RATES');
  if (input.fuelPrice === null || input.electricityPrice === null) missing('ENERGY_PRICES');
  const serviceVolume = input.serviceEnabled ? input.serviceVolume : 0;
  const flow = (volume, own = false) => {
    const rawKg = volume * 1000;
    const dryMatterKg = rawKg * (1 - input.initialMoisture / 100);
    const finalKg = dryMatterKg / (1 - input.finalMoisture / 100);
    const waterKg = rawKg - finalKg;
    // Client 2026-09-16: heat dry matter; losses and recovery are sequential and counted once.
    const waterHeatingMJ = thermal ? waterKg * data.waterHeat * crop.waterDelta : null;
    const evaporationMJ = thermal ? waterKg * crop.latentHeat : null;
    const grainHeatingMJ = thermal ? dryMatterKg * crop.grainHeat * grainDelta : null;
    const usefulMJ = sum(waterHeatingMJ,evaporationMJ,grainHeatingMJ);
    const burnerMJ = thermal ? usefulMJ * (1 + model.lossFactor) * (1 - model.recoveredFraction) / efficiency : null;
    const fuelQuantity = burnerMJ !== null && positive(fuel.heatingValue) && model.supportedFuels?.includes(fuel.id) ? burnerMJ / fuel.heatingValue : null;
    const fuelCost = product(fuelQuantity, input.fuelPrice);
    const hours = r.capacity ? (finalKg / 1000) / r.capacity : null;
    const electricityKwh = positive(model.electricalPower) ? product(hours,model.electricalPower) : null;
    const electricityCost = product(electricityKwh,input.electricityPrice);
    const operatorCost = nonnegative(operatorRate) ? product(hours,operatorRate) : null;
    const maintenanceCost = 0;
    // The annual 1% allowance belongs to the ownership baseline. Services add variable costs only.
    const fixedCost = own ? nonnegative(dryerPrice) ? dryerPrice * .01 : null : 0;
    const dryingCost = sum(fuelCost,electricityCost,operatorCost,maintenanceCost,fixedCost);
    return {days: hours === null ? null : hours / 20, waterHeatingMJ, evaporationMJ, grainHeatingMJ, electricalPower:model.electricalPower, efficiency, lossFactor:model.lossFactor, recoveredFraction:model.recoveredFraction, rawKg,dryMatterKg,finalKg,waterKg,usefulMJ,burnerMJ,fuelQuantity,fuelCost,hours,electricityKwh,electricityCost,operatorCost,maintenanceCost,fixedCost,dryingCost,perTonne: dryingCost === null ? null : dryingCost / volume};
  };
  r.own = flow(input.volume,true);
  r.service = input.serviceEnabled ? flow(serviceVolume) : null;
  r.totalHours = sum(r.own.hours,r.service?.hours ?? (input.serviceEnabled ? null : 0));
  r.totalDays = r.totalHours === null ? null : r.totalHours / 20;
  if (r.totalHours !== null && input.availableHours !== null && r.totalHours > input.availableHours) r.warnings.push('SEASON_TOO_SHORT');
  r.requiredPower = r.own.burnerMJ !== null && positive(r.own.hours) ? r.own.burnerMJ / r.own.hours / 3.6 : null;
  if (r.requiredPower !== null && positive(model.burnerPower) && r.requiredPower > model.burnerPower) r.warnings.push('THERMAL_POWER_INSUFFICIENT');
  if (!positive(model.burnerPower)) missing('BURNER_POWER');
  r.transportCost = distance === 0 ? 0 : transportInputs.every(nonnegative) && positive(input.truckPayloadTonnes)
    ? Math.ceil(input.volume / input.truckPayloadTonnes) * (2 * distance / 100 * input.truckLitresPer100Km * input.transportDieselPrice + input.driverPerTrip) : null;
  if (r.transportCost === null) missing('TRANSPORT_INPUTS');
  r.elevatorCost = input.elevatorTariff !== null ? input.volume * (input.elevatorTariff * (input.elevatorBasis === 'tonne-point' ? input.initialMoisture - input.finalMoisture : 1) + input.elevatorOtherPerTonne) : null;
  r.elevatorCost = sum(r.elevatorCost,r.transportCost);
  if (input.elevatorTariff === null) missing('ELEVATOR_TARIFF');
  r.ownSystemCost = sum(r.own.dryingCost,input.volume * input.ownOtherPerTonne);
  r.savings = r.elevatorCost !== null && r.ownSystemCost !== null ? r.elevatorCost - r.ownSystemCost : null;
  r.priceRevenue = !input.delayedSale ? 0 : input.currentGrainPrice !== null && input.futureGrainPrice !== null ? r.own.finalKg / 1000 * (input.futureGrainPrice - input.currentGrainPrice) : null;
  if (r.priceRevenue === null) missing('GRAIN_PRICES');
  r.storageCost = !input.delayedSale ? 0 : nonnegative(input.storageCostPerTonne) ? r.own.finalKg / 1000 * input.storageCostPerTonne : null;
  r.priceEffect = r.priceRevenue !== null && r.storageCost !== null ? r.priceRevenue - r.storageCost : null;
  if (r.storageCost === null) missing('STORAGE_COSTS');
  r.serviceRevenue = input.serviceEnabled ? product(serviceVolume,input.serviceTariff) : 0;
  r.serviceProfit = !input.serviceEnabled ? 0 : r.serviceRevenue !== null && r.service.dryingCost !== null ? r.serviceRevenue - r.service.dryingCost : null;
  if (input.serviceEnabled && input.serviceTariff === null) missing('SERVICE_TARIFF');
  r.economicEffect = sum(r.savings,r.priceEffect,r.serviceProfit);
  const investment = dryerPrice;
  r.investment = positive(investment) ? investment : null;
  if (r.investment === null) missing('INVESTMENT');
  if (r.savings !== null && r.savings <= 0) r.warnings.push('NO_PAYBACK');
  if (r.investment !== null) {
    r.paybackSeasons = positive(r.savings) ? r.investment / r.savings : null;
    r.roiPerSeason = r.savings === null ? null : r.savings / r.investment * 100;
    const serviceEffect = sum(r.savings,r.serviceProfit);
    r.servicePaybackSeasons = positive(serviceEffect) ? r.investment / serviceEffect : null;
    r.combinedPaybackSeasons = positive(r.economicEffect) ? r.investment / r.economicEffect : null;
  }
  // Prevent overflow or corrupt configuration from leaking into results.
  const allFinite = value => value === null || typeof value !== 'object' ? typeof value !== 'number' || Number.isFinite(value) : Object.values(value).every(allFinite);
  if (!allFinite(r)) { return {...r,status:'invalid',own:null,service:null,warnings:['INVALID_INPUT']}; }
  r.status = r.missing.length ? 'partial' : 'ready';
  return r;
}
