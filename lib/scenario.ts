import config from '@/config/calculator.json';
import { site } from './site';
export type Scenario = { model: string; crop: string; volume: number; initialMoisture: number; finalMoisture: number; distance: number; elevatorTariff: number; diesel: string; electricity: string; delayedSale: boolean };
export const defaultScenario: Scenario = {model:'sahara-1',crop:'corn',volume:1000,initialMoisture:25,finalMoisture:14,distance:30,elevatorTariff:150,diesel:'',electricity:'',delayedSale:false};
export function parseScenario(raw: string | null): Scenario | null {
  if (!raw || raw.length > 3000) return null;
  try {
    const s = JSON.parse(raw);
    if (!s || typeof s !== 'object' || !site.models.some(m=>m.id===s.model) || !config.crops.some(c=>c.id===s.crop)) return null;
    for (const [key, options] of Object.entries({volume:config.volumes,initialMoisture:config.initialMoistures,finalMoisture:config.finalMoistures,distance:config.distances,elevatorTariff:config.tariffs})) if (!options.includes(s[key])) return null;
    for (const key of ['diesel','electricity']) if (typeof s[key] !== 'string' || s[key].length > 20 || (s[key] !== '' && (!/^\d+(\.\d+)?$/.test(s[key]) || Number(s[key]) > 1000000))) return null;
    if (typeof s.delayedSale !== 'boolean') return null;
    return Object.fromEntries(Object.keys(defaultScenario).map(k=>[k,s[k]])) as Scenario;
  } catch { return null; }
}
