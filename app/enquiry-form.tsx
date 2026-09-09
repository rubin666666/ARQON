'use client';
export function EnquiryForm({
  en,
  message = false,
}: {
  en: boolean;
  message?: boolean;
}) {
  const t = (a: string, b: string) => (en ? b : a);
  return (
    <form className="enquiry-form" onSubmit={(e) => e.preventDefault()}>
      <label className="field">
        {t('Ім’я', 'Name')}
        <input name="name" autoComplete="name" required maxLength={100} />
      </label>
      <label className="field">
        {t('Телефон', 'Phone')}
        <input
          name="phone"
          type="tel"
          autoComplete="tel"
          required
          maxLength={30}
        />
      </label>
      <label className="field">
        Email
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
        />
      </label>
      {message && (
        <label className="field">
          {t('Повідомлення', 'Message')}
          <textarea name="message" rows={3} maxLength={3000} />
        </label>
      )}
      <p className="form-notice">
        {t(
          'Прийом заявок ще не відкрито. Дані з цієї форми не надсилаються.',
          'Enquiries are not open yet. No data from this form is sent.',
        )}
      </p>
      <button className="button" disabled type="submit">
        {t('Надіслати заявку', 'Send enquiry')}
      </button>
    </form>
  );
}
