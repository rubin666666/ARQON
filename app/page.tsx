'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { EnquiryForm } from './enquiry-form';
import {
  ArrowUpRight,
  ArrowRight,
  Menu,
  X,
  Sun,
  Moon,
  Flame,
  SlidersHorizontal,
  ShieldCheck,
  Plus,
} from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
export default function Home() {
  const [en, E] = useState(false),
    [dark, D] = useState(false),
    [menu, M] = useState(false),
    [modal, O] = useState(''),
    [zoom, Z] = useState(false),
    [storage, S] = useState(false);
  const [values, V] = useState(['1000', 'corn', '25', '14', '30', '150']);
  const t = (a: string, b: string) => (en ? b : a);
  // Browser preferences are read after hydration to preserve matching server markup.
  /* oxlint-disable react(react-compiler) */
  useEffect(() => {
    D(
      localStorage.getItem('arqon-theme') === 'dark' ||
        (!localStorage.getItem('arqon-theme') &&
          matchMedia('(prefers-color-scheme: dark)').matches),
    );
    E(new URLSearchParams(location.search).get('lang') === 'en');
  }, []);
  /* oxlint-enable react(react-compiler) */
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);
  useEffect(() => {
    document.documentElement.lang = en ? 'en' : 'uk';
    document.title = en
      ? 'ARQON — SAHARA grain dryers'
      : 'ARQON — Зерносушарки SAHARA';
  }, [en]);
  const nav = [
    ['about', t('Про компанію', 'About')],
    ['products', t('Продукти', 'Products')],
    ['technology', t('Технологія', 'Technology')],
    ['calculator', t('Калькулятор окупності', 'Payback calculator')],
    ['equipment', t('Обладнання', 'Equipment')],
    ['photo', t('Фото', 'Photos')],
    ['video', t('Відео', 'Videos')],
    ['contacts', t('Контакти', 'Contacts')],
    ['partners', t('Партнери', 'Partners')],
  ];
  const fields = [
    {
      label: t('Обсяг за сезон, т', 'Seasonal volume, t'),
      options: ['100', '500', '1000', '2500', '5000', '10000'],
    },
    {
      label: t('Культура', 'Crop'),
      options: ['corn', 'wheat', 'sunflower'],
      labels: [
        t('Кукурудза', 'Corn'),
        t('Пшениця', 'Wheat'),
        t('Соняшник', 'Sunflower'),
      ],
    },
    {
      label: t('Початкова вологість, %', 'Initial moisture, %'),
      options: ['15', '18', '20', '25', '30', '35'],
    },
    {
      label: t('Кінцева вологість, %', 'Final moisture, %'),
      options: ['8', '10', '12', '14', '15'],
    },
    {
      label: t('Відстань до елеватора, км', 'Elevator distance, km'),
      options: ['10', '20', '30', '50', '75', '100'],
    },
    {
      label: t('Тариф елеватора, грн/т-%', 'Elevator tariff, UAH/t-%'),
      options: ['50', '100', '150', '200', '250'],
    },
  ];
  return (
    <>
      <a className="skip" href="#main">
        {t('До вмісту', 'Skip to content')}
      </a>
      <header>
        <a href="#main" className="brand">
          <Image
            width={1024}
            height={559}
            src="/arqon.jpg"
            alt="ARQON Engineering & Innovation"
          />
        </a>
        <nav className="desktop-nav">
          {nav
            .filter((_, i) => [0, 1, 2, 7].includes(i))
            .map(([id, label]) => (
              <a key={id} href={'#' + id}>
                {label}
              </a>
            ))}
        </nav>
        <div className="header-actions">
          <button
            onClick={() => {
              const v = !en;
              E(v);
              history.replaceState(
                null,
                '',
                `?lang=${v ? 'en' : 'uk'}${location.hash}`,
              );
            }}
            aria-label={en ? 'Українська' : 'English'}
          >
            {en ? 'EN' : 'UA'} ⌄
          </button>
          <button
            className="icon"
            aria-label={t('Перемкнути тему', 'Toggle theme')}
            onClick={() => {
              localStorage.setItem('arqon-theme', !dark ? 'dark' : 'light');
              D(!dark);
            }}
          >
            {dark ? <Sun size={19} /> : <Moon size={19} />}
          </button>
          <button
            className="icon"
            aria-label={t('Меню', 'Menu')}
            aria-expanded={menu}
            onClick={() => M(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
        {menu && (
          <nav className="menu">
            {nav.map(([id, label]) => (
              <a key={id} href={'#' + id} onClick={() => M(false)}>
                {label}
                <ArrowUpRight size={17} />
              </a>
            ))}
            {[1, 2, 3, 4].map((n) => (
              <a key={n} href={'#sahara-' + n} onClick={() => M(false)}>
                SAHARA {n}
              </a>
            ))}
          </nav>
        )}
      </header>
      <main id="main">
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <i />
              {t(
                'КАНАДСЬКО-УКРАЇНСЬКА ІНЖЕНЕРІЯ',
                'CANADIAN–UKRAINIAN ENGINEERING',
              )}
            </div>
            <h1>
              {t('Ваш урожай.', 'Your harvest.')}
              <br />
              {t('Наша технологія.', 'Our technology.')}
              <br />
              <em>SAHARA.</em>
            </h1>
            <p>
              {t(
                'Зерносушарки ARQON для господарств, які обирають власний шлях від зібраного зерна до готового продукту.',
                'ARQON grain dryers for farms taking control of the journey from harvested grain to a finished product.',
              )}
            </p>
            <div className="hero-links">
              <a className="button" href="#calculator">
                {t('Розрахувати окупність', 'Calculate payback')}
                <ArrowUpRight size={20} />
              </a>
              <a className="text-link" href="#products">
                {t('Усі моделі', 'All models')}
                <ArrowRight size={18} />
              </a>
            </div>
            <div className="hero-note">
              <span>01 — 04</span>
              {t('Чотири моделі. Ваш масштаб.', 'Four models. Your scale.')}
            </div>
          </div>
          <div className="hero-art">
            <div className="art-top">
              <span>ARQON / ENGINEERING</span>
              <span>SAHARA SERIES</span>
            </div>
            <Image
              width={1024}
              height={1024}
              src="/sahara.jpg"
              alt={t(
                'Технічна ілюстрація зерносушарки SAHARA',
                'SAHARA grain dryer technical illustration',
              )}
              fetchPriority="high"
            />
            <div className="art-bottom">
              <span>
                {t('ІНЖЕНЕРІЯ В КОЖНІЙ ДЕТАЛІ', 'ENGINEERING IN EVERY DETAIL')}
              </span>
              <ArrowUpRight />
            </div>
          </div>
        </section>
        <div className="benefits">
          {[Flame, SlidersHorizontal, ShieldCheck].map((Icon, i) => (
            <div key={i}>
              <Icon size={29} />
              <div>
                <h3>
                  {
                    [
                      t('Технологія сушіння', 'Drying technology'),
                      t('Ваші параметри', 'Your requirements'),
                      t('Обґрунтований вибір', 'An informed choice'),
                    ][i]
                  }
                </h3>
                <p>
                  {
                    [
                      t(
                        'Контроль на кожному етапі процесу.',
                        'Control at every stage of the process.',
                      ),
                      t(
                        'Рішення під культуру та обсяг зерна.',
                        'A solution for your crop and volume.',
                      ),
                      t(
                        'Порівняйте власне сушіння з елеватором.',
                        'Compare on-site drying with outsourcing.',
                      ),
                    ][i]
                  }
                </p>
              </div>
              <small>0{i + 1}</small>
            </div>
          ))}
        </div>
        <section id="about" className="section about">
          <div className="eyebrow">01 / {t('ПРО ARQON', 'ABOUT ARQON')}</div>
          <div>
            <h2>
              {t('Інженерія, що працює', 'Engineering that works')}
              <br />
              <em>{t('на ваш урожай.', 'for your harvest.')}</em>
            </h2>
            <p>
              {t(
                'ARQON — канадсько-український бренд зерносушильного обладнання. Лінійка SAHARA об’єднує чотири моделі для агропідприємств, фермерських господарств та агрохолдингів України й країн ЄС.',
                'ARQON is a Canadian–Ukrainian grain drying equipment brand. The SAHARA range includes four models for farms and agricultural businesses in Ukraine and the EU.',
              )}
            </p>
          </div>
        </section>
        <section id="products" className="section">
          <div className="section-heading">
            <div>
              <div className="eyebrow">
                02 / {t('ПРОДУКТОВА ЛІНІЙКА', 'PRODUCT RANGE')}
              </div>
              <h2>
                {t('Знайдіть свою', 'Find your')} <em>SAHARA.</em>
              </h2>
            </div>
            <p>
              {t(
                'Від потреб господарства — до конфігурації обладнання.',
                'From your farm’s needs to the right configuration.',
              )}
            </p>
          </div>
          <div className="products">
            {[1, 2, 3, 4].map((n) => (
              <article key={n} id={'sahara-' + n}>
                <div className="model-top">
                  <span>SAHARA / 0{n}</span>
                  <ArrowUpRight size={18} />
                </div>
                <Image
                  width={1024}
                  height={1024}
                  src="/sahara.jpg"
                  alt={
                    'SAHARA ' +
                    n +
                    ' — ' +
                    t('спільна ілюстрація серії', 'shared series illustration')
                  }
                  loading="lazy"
                />
                <div className="model-copy">
                  <h3>SAHARA {n}</h3>
                  <p>
                    {t(
                      'Продуктивність, комплектація та вартість — за індивідуальним розрахунком.',
                      'Capacity, configuration and pricing are available on request.',
                    )}
                  </p>
                  <button onClick={() => O('SAHARA ' + n)}>
                    {t('Замовити розрахунок', 'Request a quote')}
                    <Plus size={19} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section id="technology" className="section technology">
          <div>
            <div className="eyebrow">03 / {t('ТЕХНОЛОГІЯ', 'TECHNOLOGY')}</div>
            <h2>
              {t('Більше контролю.', 'More control.')}
              <br />
              <em>{t('На кожному етапі.', 'At every stage.')}</em>
            </h2>
          </div>
          <div>
            {[
              t('Культура та вологість зерна', 'Crop and grain moisture'),
              t('Енергоносії та витрати', 'Energy and operating costs'),
              t('Сезонний обсяг та логістика', 'Seasonal volume and logistics'),
            ].map((s, i) => (
              <div className="tech-row" key={s}>
                <span>0{i + 1}</span>
                <h3>{s}</h3>
                <ArrowUpRight />
              </div>
            ))}
          </div>
        </section>
        <section id="calculator" className="section">
          <div className="section-heading">
            <div>
              <div className="eyebrow">
                04 / {t('ЕКОНОМІКА ГОСПОДАРСТВА', 'YOUR FARM’S ECONOMICS')}
              </div>
              <h2>
                {t('Порахуємо', 'Let’s calculate')}
                <br />
                <em>{t('вашу незалежність.', 'your independence.')}</em>
              </h2>
            </div>
            <p>
              {t(
                'Порівняйте сушіння на власному обладнанні з послугами стороннього елеватора.',
                'Compare drying with your own equipment against an external grain elevator.',
              )}
            </p>
          </div>
          <div className="calculator">
            <div className="calc-fields">
              <div className="calc-label">
                01 — {t('Вхідні дані', 'Your inputs')}
                <SlidersHorizontal size={19} />
              </div>
              <div className="fields">
                {fields.map((f, i) => (
                  <label className="field" key={i}>
                    {f.label}
                    <Select
                      value={values[i]}
                      onValueChange={(v) => {
                        if (v) V(values.map((x, j) => (j === i ? v : x)));
                      }}
                    >
                      <SelectTrigger aria-label={f.label}>
                        <SelectValue>
                          {f.labels?.[f.options.indexOf(values[i])] ||
                            values[i]}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {f.options.map((o, j) => (
                          <SelectItem value={o} key={o}>
                            {f.labels?.[j] || o}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </label>
                ))}
                {[
                  t('Дизель, грн/л', 'Diesel, UAH/l'),
                  t('Електроенергія, грн/кВт·год', 'Electricity, UAH/kWh'),
                ].map((s) => (
                  <label className="field" key={s}>
                    {s}
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder={t('Вкажіть ціну', 'Enter price')}
                    />
                  </label>
                ))}
              </div>
              <div className="toggle">
                <div>
                  {t('Врахувати відкладений продаж', 'Include delayed sale')}
                  <small>
                    {t(
                      'Додаткова маржа від зберігання зерна',
                      'Additional margin from grain storage',
                    )}
                  </small>
                </div>
                <Switch
                  checked={storage}
                  onCheckedChange={S}
                  aria-label={t(
                    'Врахувати відкладений продаж',
                    'Include delayed sale',
                  )}
                />
              </div>
            </div>
            <aside className="result">
              <div className="calc-label">
                02 — {t('Ваш результат', 'Your result')}
                <ArrowUpRight size={20} />
              </div>
              <div className="result-metric">
                <small>{t('Економія за сезон', 'Seasonal savings')}</small>
                <strong>
                  — <span>₴</span>
                </strong>
              </div>
              <div className="result-metric">
                <small>{t('Термін окупності', 'Payback period')}</small>
                <strong>
                  — <span>{t('сезонів', 'seasons')}</span>
                </strong>
              </div>
              <p className="notice">
                {Number(values[2]) <= Number(values[3])
                  ? t(
                      'Початкова вологість має бути вищою за кінцеву.',
                      'Initial moisture must exceed final moisture.',
                    )
                  : t(
                      'Розрахунок стане доступним після підтвердження цін і коефіцієнтів виробником. Варіанти в полях попередні.',
                      'Calculations will be available once prices and coefficients are confirmed by the manufacturer. Input options are provisional.',
                    )}
              </p>
              <button
                className="button"
                onClick={() =>
                  O(t('Детальний розрахунок', 'Detailed calculation'))
                }
              >
                {t('Отримати консультацію', 'Request a consultation')}
                <ArrowUpRight size={19} />
              </button>
            </aside>
          </div>
        </section>
        <section id="equipment" className="section">
          <div className="eyebrow">
            05 / {t('ДОДАТКОВЕ ОБЛАДНАННЯ', 'OPTIONAL EQUIPMENT')}
          </div>
          <h2>
            {t('Єдина система.', 'One system.')}{' '}
            <em>{t('Більше можливостей.', 'More possibilities.')}</em>
          </h2>
          <div className="equipment">
            {[
              t('Транспортери', 'Conveyors'),
              t('Сепаратори', 'Separators'),
              t('Системи автоматизації', 'Automation systems'),
            ].map((s, i) => (
              <button key={s} onClick={() => O(s)}>
                <span>0{i + 1}</span>
                <h3>{s}</h3>
                <ArrowUpRight />
              </button>
            ))}
          </div>
        </section>
        <section className="section media-grid">
          <div id="photo">
            <div className="eyebrow">06 / {t('ФОТО', 'PHOTOS')}</div>
            <h2>{t('SAHARA в деталях.', 'SAHARA in detail.')}</h2>
            <button
              className="gallery"
              onClick={() => Z(true)}
              aria-label={t('Збільшити зображення', 'Enlarge image')}
            >
              <Image
                width={1024}
                height={1024}
                src="/sahara.jpg"
                alt="SAHARA"
                loading="lazy"
              />
              <span>
                {t('Концептуальна ілюстрація', 'Concept illustration')}
                <Plus />
              </span>
            </button>
          </div>
          <div id="video">
            <div className="eyebrow">07 / {t('ВІДЕО', 'VIDEO')}</div>
            <h2>{t('Технологія в русі.', 'Technology in motion.')}</h2>
            <div className="video-placeholder">
              <span>SAHARA / FILM</span>
              <p>
                {t(
                  'Відео роботи обладнання готується до публікації.',
                  'Equipment videos are being prepared for publication.',
                )}
              </p>
            </div>
          </div>
        </section>
        <section id="contacts" className="section contacts">
          <div>
            <div className="eyebrow">08 / {t('КОНТАКТИ', 'CONTACTS')}</div>
            <h2>
              {t('Ваш наступний сезон', 'Your next season')}
              <br />
              <em>{t('починається тут.', 'starts here.')}</em>
            </h2>
            <p>{t('Україна · ARQON', 'Ukraine · ARQON')}</p>
            <p className="muted">
              {t(
                'Контактні дані українського представництва будуть опубліковані незабаром.',
                'Contact details for our Ukrainian office will be published soon.',
              )}
            </p>
          </div>
          <div className="contact-panel">
            <h3>
              {t('Обговоримо ваше господарство', 'Let’s discuss your farm')}
            </h3>
            <p>
              {t(
                'Оберіть модель або підготуйте параметри сушіння для індивідуальної консультації.',
                'Choose a model or prepare your drying requirements for a consultation.',
              )}
            </p>
            <EnquiryForm en={en} message />
          </div>
        </section>
        <section id="partners" className="partners">
          <span className="eyebrow">09 / {t('ПАРТНЕРИ', 'PARTNERS')}</span>
          <p>
            {t(
              'Інформація про технологічних партнерів буде додана після підтвердження.',
              'Technology partners will be listed following confirmation.',
            )}
          </p>
        </section>
      </main>
      <footer>
        <a className="footer-brand" href="#main">
          ARQON<span>ENGINEERING & INNOVATION</span>
        </a>
        <span>© 2026 ARQON</span>
        <div>
          <button
            onClick={() => O(t('Політика конфіденційності', 'Privacy policy'))}
          >
            {t('Конфіденційність', 'Privacy')}
          </button>
          <button onClick={() => O(t('Умови використання', 'Terms of use'))}>
            {t('Умови використання', 'Terms of use')}
          </button>
        </div>
        <a href="#main">↑</a>
      </footer>
      <Dialog open={!!modal} onOpenChange={(v) => !v && O('')}>
        <DialogContent className="arqon-dialog">
          <DialogTitle>{modal}</DialogTitle>
          <DialogDescription>
            {t(
              'Сайт готується до запуску. Надсилання заявок і PDF-звіти будуть доступні після підключення контактів, CRM та затвердження розрахунків. Персональні дані наразі не збираються.',
              'This site is being prepared for launch. Enquiries and PDF reports will become available after contact details, CRM and calculations are approved. No personal information is currently collected.',
            )}
          </DialogDescription>
          {![
            'Політика конфіденційності',
            'Privacy policy',
            'Умови використання',
            'Terms of use',
          ].includes(modal) && <EnquiryForm en={en} />}
          <button className="text-link" onClick={() => O('')}>
            {t('Зрозуміло', 'Got it')}
          </button>
        </DialogContent>
      </Dialog>
      <Dialog open={zoom} onOpenChange={Z}>
        <DialogContent className="image-dialog">
          <DialogTitle>SAHARA</DialogTitle>
          <DialogDescription>
            {t('Концептуальна ілюстрація серії', 'Series concept illustration')}
          </DialogDescription>
          <Image width={1024} height={1024} src="/sahara.jpg" alt="SAHARA" />
        </DialogContent>
      </Dialog>
    </>
  );
}
