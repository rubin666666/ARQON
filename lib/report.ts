import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { asset } from './site';
export type ReportData = {
  model: string;
  revision: string;
  input: Record<string, string | number | boolean>;
  result: Record<string, number | null>;
};
export async function createReport(
  data: ReportData,
  en: boolean,
  fontBytes?: ArrayBuffer,
) {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  if (!fontBytes) {
    const response = await fetch(asset('/fonts/NotoSans.ttf'));
    if (!response.ok) throw new Error('Font unavailable');
    fontBytes = await response.arrayBuffer();
  }
  const font = await pdf.embedFont(fontBytes, { subset: true });
  pdf.setTitle(
    `ARQON ${data.model} — ${en ? 'Payback report' : 'Звіт окупності'}`,
  );
  pdf.setAuthor('ARQON');
  let page = pdf.addPage([595.28, 841.89]),
    y = 788;
  const line = (text: string, size = 11) => {
    if (y < 60) {
      page = pdf.addPage([595.28, 841.89]);
      y = 788;
    }
    const words = text.split(/\s+/);
    let row = '';
    for (const word of words) {
      if (font.widthOfTextAtSize(`${row} ${word}`, size) > 480 && row) {
        page.drawText(row, {
          x: 48,
          y,
          size,
          font,
          color: rgb(0.13, 0.16, 0.14),
        });
        y -= size + 8;
        row = word;
      } else row = row ? `${row} ${word}` : word;
    }
    page.drawText(row, { x: 48, y, size, font, color: rgb(0.13, 0.16, 0.14) });
    y -= size + 10;
  };
  line('ARQON / SAHARA', 24);
  line(en ? 'Equipment payback report' : 'Звіт окупності обладнання', 17);
  line(data.model, 16);
  line(
    `${en ? 'Date' : 'Дата'}: ${new Date().toLocaleDateString(en ? 'en-GB' : 'uk-UA')}`,
  );
  line(`${en ? 'Calculation version' : 'Версія розрахунку'}: ${data.revision}`);
  const names: Record<string, [string, string]> = {
    volume: ['Обсяг за сезон, т', 'Seasonal volume, t'],
    crop: ['Культура', 'Crop'],
    initialMoisture: ['Початкова вологість, %', 'Initial moisture, %'],
    finalMoisture: ['Кінцева вологість, %', 'Final moisture, %'],
    distance: ['Відстань, км', 'Distance, km'],
    elevatorTariff: ['Тариф елеватора, грн/т-%', 'Elevator tariff, UAH/t-%'],
    dieselPrice: ['Дизель, грн/л', 'Diesel, UAH/l'],
    electricityPrice: ['Електроенергія, грн/кВт·год', 'Electricity, UAH/kWh'],
    delayedSale: ['Відкладений продаж', 'Delayed sale'],
    removedWaterTonnes: ['Видалена вода, т', 'Removed water, t'],
    dryMassTonnes: ['Маса після сушіння, т', 'Dry grain mass, t'],
    fuel: ['Витрати на паливо, грн', 'Fuel cost, UAH'],
    electricity: ['Електроенергія, грн', 'Electricity cost, UAH'],
    operatingCost: ['Власне сушіння, грн', 'Own drying cost, UAH'],
    elevatorCost: ['Елеватор і логістика, грн', 'Elevator and logistics, UAH'],
    storageMargin: ['Маржа від зберігання, грн', 'Storage margin, UAH'],
    savings: ['Економія за сезон, грн', 'Seasonal savings, UAH'],
    paybackSeasons: ['Окупність, сезонів', 'Payback, seasons'],
  };
  const format = (v: string | number | boolean | null) =>
    v === null
      ? en
        ? 'No payback under these conditions'
        : 'За цих умов не окупається'
      : typeof v === 'number'
        ? new Intl.NumberFormat(en ? 'en-GB' : 'uk-UA', {
            maximumFractionDigits: 2,
          }).format(v)
        : typeof v === 'boolean'
          ? v
            ? en
              ? 'Yes'
              : 'Так'
            : en
              ? 'No'
              : 'Ні'
          : String(v);
  line(en ? 'INPUTS' : 'ВХІДНІ ДАНІ', 15);
  Object.entries(data.input).forEach(([k, v]) =>
    line(`${names[k]?.[en ? 1 : 0] || k}: ${format(v)}`),
  );
  line(en ? 'RESULTS' : 'РЕЗУЛЬТАТИ', 15);
  Object.entries(data.result).forEach(([k, v]) =>
    line(`${names[k]?.[en ? 1 : 0] || k}: ${format(v)}`),
  );
  line(
    en
      ? 'Estimate based on the entered seasonal volume and approved coefficients. This report is not a commercial offer. One season is not necessarily one year.'
      : 'Оцінка на основі введеного сезонного обсягу та затверджених коефіцієнтів. Звіт не є комерційною пропозицією. Один сезон не обов’язково дорівнює одному року.',
    10,
  );
  return pdf.save();
}
export async function downloadReport(data: ReportData, en: boolean) {
  const bytes = await createReport(data, en);
  const url = URL.createObjectURL(
    new Blob([new Uint8Array(bytes)], { type: 'application/pdf' }),
  );
  const a = document.createElement('a');
  a.href = url;
  a.download = `ARQON-${data.model.replace(/[^a-z0-9]/gi, '-')}-report.pdf`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
