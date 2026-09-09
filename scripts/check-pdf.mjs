import { build } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import { PDFDocument } from 'pdf-lib';
await build({
  configFile: false,
  resolve: { alias: { '@': path.resolve('.') } },
  build: {
    ssr: 'lib/report.ts',
    outDir: 'work/pdf-test',
    emptyOutDir: false,
    rolldownOptions: { output: { entryFileNames: 'report.mjs' } },
  },
});
const { createReport } = await import(
  pathToFileURL(path.resolve('work/pdf-test/report.mjs')).href
);
const font = fs.readFileSync('public/fonts/NotoSans.ttf');
const fontBuffer = font.buffer.slice(
  font.byteOffset,
  font.byteOffset + font.byteLength,
);
for (const en of [false, true]) {
  const data = {
    model: 'SAHARA 1',
    revision: 'SYNTHETIC-TEST-ONLY',
    input: {
      volume: 1000,
      crop: en ? 'Corn' : 'Кукурудза',
      initialMoisture: 25,
      finalMoisture: 14,
      distance: 30,
      elevatorTariff: 150,
      dieselPrice: 60,
      electricityPrice: 8,
      delayedSale: false,
    },
    result: {
      removedWaterTonnes: 127.91,
      dryMassTonnes: 872.09,
      fuel: 76746,
      electricity: 16000,
      operatingCost: 122746,
      elevatorCost: 1712000,
      storageMargin: 0,
      savings: 1589254,
      paybackSeasons: 1.32,
    },
  };
  const bytes = await createReport(data, en, fontBuffer);
  const pdf = await PDFDocument.load(bytes);
  assert.ok(pdf.getPageCount() >= 1 && pdf.getPageCount() <= 3);
  assert.equal(new TextDecoder().decode(bytes.slice(0, 5)), '%PDF-');
  fs.writeFileSync(`work/report-${en ? 'en' : 'uk'}.pdf`, bytes);
  console.log(
    `PDF ${en ? 'en' : 'uk'}: ${pdf.getPageCount()} pages, ${bytes.length} bytes`,
  );
}
