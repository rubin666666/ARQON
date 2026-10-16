import test from 'node:test';
import assert from 'node:assert/strict';
import {parseNumericText,formatNumericText,normalizeNumericText,commitNumericText} from '../lib/calculator-number.mjs';
await test('numeric inputs accept grouped amounts and either decimal separator',()=>{
 for(const text of ['4 500 000,25','4\u00a0500\u202f000.25'])assert.equal(parseNumericText(text),4500000.25);
 assert.equal(formatNumericText('4500000.25'),'4 500 000,25');
 assert.equal(formatNumericText('4500000.25',true),'4 500 000.25');
 assert.equal(normalizeNumericText('1 200,50'),'1200.50');
 assert.equal(parseNumericText(''),null);assert.equal(parseNumericText('0'),0);
 assert.equal(parseNumericText('-2,5'),-2.5);
 for(const text of ['abc','1,2,3','1.2.3'])assert.ok(Number.isNaN(parseNumericText(text)));
});

await test('committing decimal notation preserves the amount',()=>{
 for(const [raw,expected] of [['1 200,','1200'],[',5','0.5'],['.5','0.5'],['0','0'],['  ',''],['-0,5','-0.5'],['12,34','12.34']])assert.equal(commitNumericText(raw),expected);
 assert.equal(parseNumericText(',5'),0.5);
 for(const raw of ['1,2,3','12abc','--1']){assert.equal(commitNumericText(raw),normalizeNumericText(raw));assert.ok(Number.isNaN(parseNumericText(raw)));}
});
