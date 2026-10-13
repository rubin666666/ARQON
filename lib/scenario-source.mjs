/**
 * Explicit links take precedence over local drafts. Invalid links must not
 * replace a valid local draft with defaults.
 * @template T,U
 * @param {{shared:string|null,legacy:string|null,saved:string|null,savedLegacy:string|null}} raw
 * @param {(raw:string|null)=>T|null} parseCurrent
 * @param {(raw:string|null)=>U|null} parseLegacy
 */
export function resolveScenarioSource(raw, parseCurrent, parseLegacy) {
  let invalidLink = false;
  if (raw.shared !== null) {
    const current = parseCurrent(raw.shared);
    if (current) return {current, legacy:null, invalidLink};
    invalidLink = true;
  } else if (raw.legacy !== null) {
    const legacy = parseLegacy(raw.legacy);
    if (legacy) return {current:null, legacy, invalidLink};
    invalidLink = true;
  }
  const current = parseCurrent(raw.saved);
  return {current, legacy:current ? null : parseLegacy(raw.savedLegacy), invalidLink};
}
