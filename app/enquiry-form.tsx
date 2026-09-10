'use client';
import { useId, useRef, useState } from 'react';
import { CheckCircle2, LoaderCircle } from 'lucide-react';
import { site, canSubmit, track, localText } from '@/lib/site';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import type { Scenario } from '@/lib/scenario';
import type { ReportData } from '@/lib/report';
import { Checkbox } from '@/components/ui/checkbox';
export function EnquiryForm({
  en,
  message = false,
  subject = '',
  report,
  scenario,
}: {
  en: boolean;
  message?: boolean;
  subject?: string;
  report?: ReportData;
  scenario?: Scenario;
}) {
  const t = (a: string, b: string) => (en ? b : a);
  const id = useId();
  const lock = useRef(false);
  const [consent, setConsent] = useState(false),
    [state, setState] = useState<'idle' | 'sending' | 'success' | 'error'>(
      'idle',
    ),
    [error, setError] = useState(''),
    [pdfBusy, setPdfBusy] = useState(false),
    [policyOpen, setPolicyOpen] = useState(false);
  const enabled = canSubmit(en);
  async function download() {
    if (!report) return;
    setPdfBusy(true);
    try {
      const { downloadReport } = await import('@/lib/report');
      await downloadReport(report, en);
      track('report_download', { model: report.model });
    } catch {
      setError(
        t(
          'Не вдалося створити PDF. Спробуйте ще раз.',
          'Unable to create the PDF. Please try again.',
        ),
      );
    } finally {
      setPdfBusy(false);
    }
  }
  async function submit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!enabled || !consent || lock.current) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const field = (key: string) => {
      const value = data.get(key);
      return typeof value === 'string' ? value : '';
    };
    const phone = field('phone').replace(/[\s().-]/g, '');
    if (!/^\+?[0-9]{8,15}$/.test(phone)) {
      setError(
        t(
          'Вкажіть коректний номер телефону (8–15 цифр).',
          'Enter a valid phone number (8–15 digits).',
        ),
      );
      setState('error');
      return;
    }
    lock.current = true;
    setState('sending');
    setError('');
    try {
      const response = await fetch(site.leadEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: field('name').trim(),
          phone,
          email: field('email').trim(),
          message: field('message').trim(),
          company: field('company'),
          subject,
          locale: en ? 'en' : 'uk',
          consent: true,
          report,
          scenario,
        }),
        signal: AbortSignal.timeout(15000),
      });
      const result = await response.json();
      if (
        !response.ok ||
        !result ||
        typeof result !== 'object' ||
        !('accepted' in result) ||
        result.accepted !== true
      )
        throw new Error('Rejected');
      setState('success');
      form.reset();
      track('generate_lead', { subject, has_report: !!report });
    } catch {
      setState('error');
      setError(
        t(
          'Заявку не надіслано. Перевірте з’єднання та спробуйте ще раз.',
          'Your enquiry was not sent. Check your connection and try again.',
        ),
      );
    } finally {
      lock.current = false;
    }
  }
  if (state === 'success')
    return (
      <div className="form-success" aria-live="polite">
        <CheckCircle2 />
        <h3>{t('Заявку надіслано', 'Enquiry sent')}</h3>
        <p>
          {t(
            'Дякуємо. Команда ARQON зв’яжеться з вами за вказаними контактами.',
            'Thank you. The ARQON team will contact you using the details provided.',
          )}
        </p>
        {report && (
          <>
            <details open>
              <summary>{t('Детальний звіт', 'Detailed report')}</summary>
              <dl className="report-summary">
                {Object.entries(report.result)
                  .filter(([key]) =>
                    [
                      'operatingCost',
                      'elevatorCost',
                      'savings',
                      'paybackSeasons',
                    ].includes(key),
                  )
                  .map(([key, value]) => (
                    <div key={key}>
                      <dt>
                        {
                          (
                            {
                              operatingCost: t(
                                'Власне сушіння, грн',
                                'Own drying, UAH',
                              ),
                              elevatorCost: t('Елеватор, грн', 'Elevator, UAH'),
                              savings: t('Економія, грн', 'Savings, UAH'),
                              paybackSeasons: t(
                                'Окупність, сезонів',
                                'Payback, seasons',
                              ),
                            } as Record<string, string>
                          )[key]
                        }
                      </dt>
                      <dd>
                        {value === null
                          ? t('Не окупається', 'No payback')
                          : value.toLocaleString(en ? 'en-GB' : 'uk-UA', {
                              maximumFractionDigits: 2,
                            })}
                      </dd>
                    </div>
                  ))}
              </dl>
            </details>
            <button className="button" disabled={pdfBusy} onClick={download}>
              {pdfBusy ? <LoaderCircle className="spin" /> : null}
              {t('Завантажити PDF', 'Download PDF')}
            </button>
          </>
        )}
        {error && <p role="alert">{error}</p>}
      </div>
    );
  return (
    <form className="enquiry-form" onSubmit={submit}>
      <label className="field" htmlFor={id + 'name'}>
        {t('Ім’я', 'Name')}
        <input
          id={id + 'name'}
          name="name"
          autoComplete="name"
          required
          minLength={2}
          maxLength={100}
        />
      </label>
      <label className="field" htmlFor={id + 'phone'}>
        {t('Телефон', 'Phone')}
        <input
          id={id + 'phone'}
          name="phone"
          type="tel"
          autoComplete="tel"
          required
          maxLength={30}
          placeholder="+380"
        />
      </label>
      <label className="field" htmlFor={id + 'email'}>
        Email
        <input
          id={id + 'email'}
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
        />
      </label>
      {message && (
        <label className="field" htmlFor={id + 'message'}>
          {t('Повідомлення', 'Message')}
          <textarea
            id={id + 'message'}
            name="message"
            rows={3}
            maxLength={3000}
          />
        </label>
      )}
      <div className="honeypot" aria-hidden="true">
        <label>
          Company
          <input name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="consent">
        <Checkbox
          id={id + 'consent'}
          checked={consent}
          onCheckedChange={setConsent}
          required
        />
        <label htmlFor={id + 'consent'}>
          {t(
            'Погоджуюся з обробкою даних для відповіді на мою заявку.',
            'I agree to my data being processed to respond to my enquiry.',
          )}{' '}
          <button
            type="button"
            className="inline-link"
            onClick={() => setPolicyOpen(true)}
          >
            {t('Політика конфіденційності', 'Privacy policy')}
          </button>
        </label>
      </div>
      {!enabled && (
        <p className="form-notice">
          {t(
            'Прийом заявок готується до запуску. Дані зараз не надсилаються.',
            'Enquiries are being prepared for launch. No data is currently sent.',
          )}
        </p>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <button
        className="button"
        disabled={!enabled || !consent || state === 'sending'}
        type="submit"
      >
        {state === 'sending' ? (
          <LoaderCircle className="spin" size={18} />
        ) : null}
        {state === 'sending'
          ? t('Надсилаємо…', 'Sending…')
          : report
            ? t('Отримати звіт і пропозицію', 'Get report and proposal')
            : t('Надіслати заявку', 'Send enquiry')}
      </button>
      <Dialog open={policyOpen} onOpenChange={setPolicyOpen}>
        <DialogContent className="arqon-dialog" showCloseButton={false}>
          <DialogClose
            className="modal-close"
            aria-label={t('Закрити', 'Close')}
          >
            ×
          </DialogClose>
          <DialogTitle>
            {t('Політика конфіденційності', 'Privacy policy')}
          </DialogTitle>
          <DialogDescription className="legal-copy">
            {localText(site.privacy, en) ||
              t(
                'Політика очікує погодження ARQON. До її публікації прийом заявок вимкнено.',
                'The policy is awaiting ARQON approval. Enquiry submission is disabled until it is published.',
              )}
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </form>
  );
}
