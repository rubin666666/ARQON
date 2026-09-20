export type EngineeringInput = {
  modelId: string; cropId: string; volume: number; initialMoisture: number; finalMoisture: number;
  fuelId: string; fuelPrice: number | null; electricityPrice: number | null;
  serviceEnabled: boolean; serviceVolume: number; serviceTariff: number | null;
  elevatorTariff: number | null; elevatorBasis: 'tonne' | 'tonne-point';
  elevatorOtherPerTonne: number; ownOtherPerTonne: number;
  delayedSale: boolean; currentGrainPrice: number | null; futureGrainPrice: number | null;
  dryerPrice: number | null; installation: number | null; additionalInvestment: number;
  elevatorDistanceKm?: number; truckPayloadTonnes?: number | null; truckLitresPer100Km?: number | null; transportDieselPrice?: number | null; driverPerTrip?: number | null; storageCostPerTonne?: number | null;
  availableHours: number | null; ambientTemperature?: number; operatorPerHour?: number | null; maintenancePerSeason?: number | null;
};
export type EngineeringData = {
  fixedRegimes?: boolean;
  version: string; waterHeat: number; ambientTemperature?: number;
  crops: { id: string; uk: string; en: string; grainHeat: number | null; latentHeat: number | null; waterDelta: number | null; grainDelta: number | null; finalGrainTemperature?: number | null; regime?: {input:number[];output:number[];air:number[];grain:number[]} }[];
  fuels: { id: string; uk: string; en: string; unit: string; heatingValue: number | null; efficiency?: number }[];
  models: { id: string; name: string; price: number | null; installation: number | null;
    electricalPower: number | null; burnerPower: number | null; supportedFuels: string[] | null;
    thermalApproved: boolean; burnerEfficiency: number | null; lossFactor: number | null; recoveredFraction: number | null;
    operatorPerHour: number | null; maintenancePerHour: number | null; seasonalFixed: number | null;
    reference: { cropId: string; input: number; output: number; temperature: number; capacity: number; source: string; status?: string }[];
    correctionPoints: { cropId: string; input: number; output: number; capacity: number }[];
  }[];
};
export type EngineeringResult = {
  status: 'invalid' | 'partial' | 'ready'; engineVersion: string; parameterVersion: string;
  missing: string[]; warnings: string[];
  own: Flow | null; service: Flow | null; capacity: number | null; referenceCapacity: number | null;
  referenceInput: number | null; referenceOutput: number | null; referenceTemperature: number | null;
  totalDays: number | null; transportCost: number | null; storageCost: number | null; priceEffect: number | null; servicePaybackSeasons: number | null; combinedPaybackSeasons: number | null;
  totalHours: number | null; requiredPower: number | null;
  elevatorCost: number | null; ownSystemCost: number | null; savings: number | null;
  priceRevenue: number | null; serviceRevenue: number | null; serviceProfit: number | null;
  economicEffect: number | null; investment: number | null; paybackSeasons: number | null; roiPerSeason: number | null;
};
export type Flow = { days: number | null; waterHeatingMJ: number | null; evaporationMJ: number | null; grainHeatingMJ: number | null; electricalPower: number | null; efficiency: number | null; lossFactor: number | null; recoveredFraction: number | null; rawKg: number; dryMatterKg: number; finalKg: number; waterKg: number;
  usefulMJ: number | null; burnerMJ: number | null; fuelQuantity: number | null; fuelCost: number | null;
  hours: number | null; electricityKwh: number | null; electricityCost: number | null;
  operatorCost: number | null; maintenanceCost: number | null; fixedCost: number | null;
  dryingCost: number | null; perTonne: number | null };

export type ReportSnapshot = {clientName?: string; clientContact?: string; calculationId?: string; createdAt?: string; input: EngineeringInput; result: EngineeringResult; modelName: string; cropName: string; fuelName: string; fuelUnit: string; missing: string[]; warnings: string[]};
