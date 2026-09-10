'use client';
import { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  SlidersHorizontal,
  Info,
  Wheat,
  Fuel,
  Truck,
} from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { EnquiryForm } from './enquiry-form';
import config from '@/config/calculator.json';
import { site, track, canSubmit } from '@/lib/site';
import { calculatePayback } from '@/lib/calculator.mjs';
import type { ReportData } from '@/lib/report';
export function Calculator({ en, model, onModelChange: setModel }: { en: boolean; model: string; onModelChange: (model: string) => void }) {
  const t = (a: string, b: string) => (en ? b : a);
  const [crop, setCrop] = useState('corn'),
    [volume, setVolume] = useState(1000),
    [initialMoisture, setInitial] = useState(25),
    [finalMoisture, setFinal] = useState(14),
    [distance, setDistance] = useState(30),
    [elevatorTariff, setTariff] = useState(150),
    [diesel, setDiesel] = useState(''),
    [electricity, setElectricity] = useState(''),
    [delayedSale, setDelayed] = useState(false),
    [open, setOpen] = useState(false);
  const input = useMemo(
    () => ({
      volume,
      initialMoisture,
      finalMoisture,
      distance,
      elevatorTariff,
      dieselPrice: diesel === '' ? NaN : Number(diesel),
      electricityPrice: electricity === '' ? NaN : Number(electricity),
      delayedSale,
    }),
    [
      volume,
      initialMoisture,
      finalMoisture,
      distance,
      elevatorTariff,
      diesel,
      electricity,
      delayedSale,
    ],
  );
  const rates = (config.rates as Record<string, Record<string, unknown>>)[
    model
  ]?.[crop];
  const result = calculatePayback(input, config.approved ? rates : null);
  const moistureError = initialMoisture <= finalMoisture;
  const [priceTouched, setPriceTouched] = useState({diesel: false, electricity: false});
  const invalidPrice = (value: string) => value === '' || !Number.isFinite(Number(value)) || Number(value) < 0 || Number(value) > 1000000;
  const dieselError = priceTouched.diesel && invalidPrice(diesel);
  const electricityError = priceTouched.electricity && invalidPrice(electricity);
  const priceError = (diesel !== '' && invalidPrice(diesel)) || (electricity !== '' && invalidPrice(electricity));
  const ready = result.status === 'ready' && !moistureError && !invalidPrice(diesel) && !invalidPrice(electricity);
  const format = (v: number) =>
    v.toLocaleString(en ? 'en-GB' : 'uk-UA', { maximumFractionDigits: 1 });
  const report: ReportData | undefined = ready
    ? {
        model: site.models.find((m) => m.id === model)!.name,
        revision: config.revision,
        input: {
          ...input,
          crop: config.crops.find((c) => c.id === crop)![en ? 'en' : 'uk'],
        },
        result: Object.fromEntries(
          Object.entries(result).filter(([k]) => k !== 'status'),
        ) as Record<string, number | null>,
      }
    : undefined;
  const select = (
    id: string,
    label: string,
    value: string,
    options: { value: string; label: string }[],
    set: (v: string) => void,
  ) => (
    <div className="field" key={id}>
      <label htmlFor={id}>{label}</label>
      <Select modal={false} value={value} onValueChange={(v) => v !== null && set(v)}>
        <SelectTrigger id={id} aria-label={label} aria-invalid={id.startsWith("calc-") && ["calc-initial", "calc-final"].includes(id) && moistureError} aria-describedby={["calc-initial", "calc-final"].includes(id) && moistureError ? "moisture-error" : undefined}>
          <SelectValue>
            {options.find((o) => o.value === value)?.label}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
  const numeric = (
    id: string,
    label: string,
    value: number,
    options: number[],
    set: (v: number) => void,
  ) =>
    select(
      id,
      label,
      String(value),
      options.map((v) => ({ value: String(v), label: format(v) })),
      (v) => set(Number(v)),
    );
  return (
    <section id="calculator" className="section">
      <div className="section-heading">
        <div>
          <div className="eyebrow">
            04 / {t('КАЛЬКУЛЯТОР ОКУПНОСТІ', 'PAYBACK CALCULATOR')}
          </div>
          <h2>
            {t('Порахуємо', 'Let’s calculate')}
            <br />
            <em>{t('вашу незалежність.', 'your independence.')}</em>
          </h2>
        </div>
        <p>
          {t(
            'Порівняйте власне сушіння з елеватором. Вкажіть параметри сезону та актуальні ціни енергоносіїв.',
            'Compare on-site drying with an elevator. Choose your seasonal inputs and enter current energy prices.',
          )}
        </p>
      </div>
      <div className="calculator">
        <div className="calc-fields" id="calculator-inputs">
          <button className="button button-secondary mobile-result-link" type="button" onClick={() => {
            const target = document.getElementById('calculator-result');
            target?.scrollIntoView({block: 'start'});
            target?.focus({preventScroll: true});
          }}>{t('До результату', 'View results')} <ArrowUpRight size={18} /></button>
          <div className="calc-label">
            01 — {t('Параметри господарства', 'Farm parameters')}
            <SlidersHorizontal size={19} />
          </div>
          <fieldset className="calc-group">
            <legend>
              <Wheat size={18} />
              {t('Зерно', 'Grain')}
            </legend>
            <div className="fields">
              {select(
                'calc-model',
                t('Модель сушарки', 'Dryer model'),
                model,
                site.models.map((m) => ({ value: m.id, label: m.name })),
                setModel,
              )}
              {select(
                'calc-crop',
                t('Культура', 'Crop'),
                crop,
                config.crops.map((c) => ({
                  value: c.id,
                  label: c[en ? 'en' : 'uk'],
                })),
                setCrop,
              )}
              {numeric(
                'calc-volume',
                t('Обсяг за сезон, т', 'Seasonal volume, t'),
                volume,
                config.volumes,
                setVolume,
              )}
              {numeric(
                'calc-initial',
                t('Початкова вологість, %', 'Initial moisture, %'),
                initialMoisture,
                config.initialMoistures,
                setInitial,
              )}
              {numeric(
                'calc-final',
                t('Кінцева вологість, %', 'Final moisture, %'),
                finalMoisture,
                config.finalMoistures,
                setFinal,
              )}
            </div>
            {moistureError && <p className="error" id="moisture-error" role="alert">{t('Початкова вологість має бути вищою за кінцеву.', 'Initial moisture must exceed final moisture.')}</p>}
          </fieldset>
          <fieldset className="calc-group">
            <legend>
              <Fuel size={18} />
              {t('Енергоносії', 'Energy')}
            </legend>
            <div className="fields">
              <label className="field" htmlFor="diesel">
                {t('Дизель, грн/л', 'Diesel, UAH/l')}
                <input
                  id="diesel"
                  aria-invalid={dieselError}
                  aria-describedby={dieselError ? "diesel-error" : undefined}
                  onBlur={() => setPriceTouched(v => ({...v, diesel: true}))}
                  type="number"
                  min="0"
                  max="1000000"
                  step="0.01"
                  inputMode="decimal"
                  value={diesel}
                  onChange={(e) => setDiesel(e.target.value)}
                  placeholder={t('Вкажіть ціну', 'Enter price')}
                />
                {dieselError && <span className="error" id="diesel-error" role="alert">{t('Вкажіть ціну від 0 до 1 000 000.', 'Enter a price between 0 and 1,000,000.')}</span>}
              </label>
              <label className="field" htmlFor="electricity">
                {t('Електроенергія, грн/кВт·год', 'Electricity, UAH/kWh')}
                <input
                  id="electricity"
                  aria-invalid={electricityError}
                  aria-describedby={electricityError ? "electricity-error" : undefined}
                  onBlur={() => setPriceTouched(v => ({...v, electricity: true}))}
                  type="number"
                  min="0"
                  max="1000000"
                  step="0.01"
                  inputMode="decimal"
                  value={electricity}
                  onChange={(e) => setElectricity(e.target.value)}
                  placeholder={t('Вкажіть ціну', 'Enter price')}
                />
                {electricityError && <span className="error" id="electricity-error" role="alert">{t('Вкажіть ціну від 0 до 1 000 000.', 'Enter a price between 0 and 1,000,000.')}</span>}
              </label>
            </div>
          </fieldset>
          <fieldset className="calc-group">
            <legend>
              <Truck size={18} />
              {t('Елеватор', 'Elevator')}
            </legend>
            <div className="fields">
              {numeric(
                'calc-distance',
                t('Відстань до елеватора, км', 'Elevator distance, km'),
                distance,
                config.distances,
                setDistance,
              )}
              {numeric(
                'calc-tariff',
                t('Тариф елеватора, грн/т-%', 'Elevator tariff, UAH/t-%'),
                elevatorTariff,
                config.tariffs,
                setTariff,
              )}
              <div className="field field-explainer">
                <Info size={17} />
                <span>
                  {t(
                    '1 т-% — сушіння однієї тонни на один відсотковий пункт вологості.',
                    '1 t-% means reducing moisture in one tonne by one percentage point.',
                  )}
                </span>
              </div>
            </div>
          </fieldset>
          <div className="toggle">
            <label htmlFor="delayed-sale">
              {t('Врахувати відкладений продаж', 'Include delayed sale')}
              <small>
                {t(
                  'Додаткова маржа від зберігання зерна',
                  'Additional margin from grain storage',
                )}
              </small>
            </label>
            <Switch
              id="delayed-sale"
              checked={delayedSale}
              onCheckedChange={setDelayed}
            />
          </div>
        </div>
        <aside
          className="result"
          id="calculator-result"
          tabIndex={-1}
          aria-label={t('Результат розрахунку', 'Calculation results')}
        >
          <div className="calc-label">
            02 — {t('Економіка сезону', 'Season economics')}
            <ArrowUpRight size={20} />
          </div>
          <p className="result-model">{site.models.find(m => m.id === model)?.name} · {format(volume)} {t('т / сезон', 't / season')}</p>
          <div aria-live="polite" aria-atomic="true">
            <div className="result-metric result-metric-primary">
              <small>
                {t('Чиста економія за сезон', 'Net seasonal savings')}
              </small>
              <strong>
                {ready ? format(result.savings!) : '—'} <span>₴</span>
              </strong>
            </div>
            <div className="result-metric">
              <small>{t('Термін окупності', 'Payback period')}</small>
              <strong
                className={
                  ready && result.paybackSeasons === null ? 'no-payback' : ''
                }
              >
                {ready
                  ? result.paybackSeasons === null
                    ? t('Не окупається', 'No payback')
                    : format(result.paybackSeasons!)
                  : '—'}{' '}
                {(!ready || result.paybackSeasons !== null) && (
                  <span>{t('сезонів', 'seasons')}</span>
                )}
              </strong>
            </div>
          </div>
          {ready && (
            <div
              className="cost-comparison"
              aria-label={t(
                'Порівняння витрат за сезон',
                'Seasonal cost comparison',
              )}
            >
              {[
                {
                  label: t('Власне сушіння', 'Own drying'),
                  value: result.operatingCost!,
                  own: true,
                },
                {
                  label: t('Елеватор і логістика', 'Elevator and logistics'),
                  value: result.elevatorCost!,
                  own: false,
                },
              ].map(({ label, value, own }) => (
                <div className="cost-row" key={label}>
                  <div className="cost-row-label">
                    <span>{label}</span>
                    <b>{format(value)} ₴</b>
                  </div>
                  <div className="cost-track" aria-hidden="true">
                    <span
                      className={own ? 'cost-fill own' : 'cost-fill'}
                      style={{
                        width: `${(value / Math.max(result.operatingCost!, result.elevatorCost!, 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          <p
            className="notice"
            role={moistureError || priceError ? 'alert' : undefined}
          >
            {moistureError
              ? t(
                  'Початкова вологість має бути вищою за кінцеву.',
                  'Initial moisture must exceed final moisture.',
                )
              : priceError
                ? t(
                    'Ціни мають бути скінченними невід’ємними числами.',
                    'Prices must be finite, non-negative numbers.',
                  )
                : !config.approved
                  ? t(
                      'Модель розрахунку на погодженні. Результати з’являться після підтвердження коефіцієнтів виробником. Значення у списках попередні.',
                      'The calculation model is awaiting approval. Results will be available after manufacturer coefficients are confirmed. Selector values are provisional.',
                    )
                  : diesel === '' || electricity === ''
                    ? t(
                        'Вкажіть ціни дизеля та електроенергії.',
                        'Enter diesel and electricity prices.',
                      )
                    : !ready
                      ? t(
                          'Для обраної моделі та культури ще немає затверджених даних.',
                          'Approved data for this model and crop is not yet available.',
                        )
                      : t(
                          'Орієнтовна оцінка за сезонним обсягом. Не є комерційною пропозицією.',
                          'Estimate based on seasonal volume. Not a commercial offer.',
                        )}
          </p>
          {canSubmit(en) && <button
            className="button"
            onClick={() => {
              track('calculator_report_open', { model, calculated: ready });
              setOpen(true);
            }}
          >
            {ready
              ? t('Отримати повний PDF-звіт', 'Get the full PDF report')
              : t(
                  'Запитати індивідуальний розрахунок',
                  'Request an individual calculation',
                )}
            <ArrowUpRight size={19} />
          </button>}
          <button className="text-link result-edit" type="button" onClick={() => {
            document.getElementById('calculator-inputs')?.scrollIntoView({block: 'start'});
            document.getElementById('calc-model')?.focus({preventScroll: true});
          }}>{t('Змінити параметри', 'Edit inputs')}</button>
        </aside>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent showCloseButton={false} className="arqon-dialog">
          <DialogClose
            className="modal-close"
            aria-label={t('Закрити', 'Close')}
          >
            ×
          </DialogClose>
          <DialogTitle>
            {ready
              ? t('Ваш детальний розрахунок', 'Your detailed calculation')
              : t('Індивідуальний розрахунок', 'Individual calculation')}
          </DialogTitle>
          <DialogDescription>
            {ready
              ? t(
                  'Залиште контакти для комерційної пропозиції. Після надсилання заявки відкриється повний звіт і завантаження PDF.',
                  'Leave your details for a commercial proposal. The full report and PDF download open after the enquiry is sent.',
                )
              : t(
                  'Підготуємо пропозицію під потреби вашого господарства.',
                  'We will prepare a proposal for your farm’s requirements.',
                )}
          </DialogDescription>
          <EnquiryForm
            en={en}
            subject={site.models.find((m) => m.id === model)!.name}
            report={report}
          />
        </DialogContent>
      </Dialog>
    </section>
  );
}
