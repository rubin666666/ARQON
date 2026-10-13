import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveScenarioSource} from '../lib/scenario-source.mjs';

const parse = raw => raw?.startsWith('valid:') ? raw.slice(6) : null;
const base = {shared:null,legacy:null,saved:'valid:local',savedLegacy:'valid:old local'};
const resolve = values => resolveScenarioSource({...base,...values},parse,parse);

await test('shared current and legacy links both override local drafts',()=>{
  assert.equal(resolve({shared:'valid:shared'}).current,'shared');
  assert.equal(resolve({legacy:'valid:legacy link'}).legacy,'legacy link');
  assert.equal(resolve({shared:'valid:current',legacy:'valid:legacy'}).current,'current');
});
await test('malformed and empty links preserve the saved scenario and report the problem',()=>{
  for(const field of ['shared','legacy'])for(const value of ['bad','']) {
    const result=resolve({[field]:value});
    assert.equal(result.current,'local');assert.equal(result.invalidLink,true);
  }
});
await test('reload restores current local data before legacy data, with safe fallback',()=>{
  assert.equal(resolve({}).current,'local');
  assert.equal(resolve({saved:'bad'}).legacy,'old local');
  assert.deepEqual(resolve({saved:null,savedLegacy:null}),{current:null,legacy:null,invalidLink:false});
});
