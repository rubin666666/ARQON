'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { EnquiryForm } from './enquiry-form';
import { Calculator } from './calculator';
import { Technology } from './technology';
import { ContentSections } from './content-sections';
import { Analytics } from './analytics';
import {
  site,
  asset,
  localeUrl,
  localText,
  track,
  readPreference,
  writePreference,
} from '@/lib/site';
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
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';

export default function Home({
  initialEnglish = false,
}: {
  initialEnglish?: boolean;
}) {
  const [en, E] = useState(initialEnglish),
    [dark, D] = useState(false),
    [themeReady, setThemeReady] = useState(false),
    [menu, M] = useState(false),
    [modal, O] = useState('');
  const t = (a: string, b: string) => (en ? b : a);
  // Browser preferences are read after hydration to preserve matching server markup.
  /* oxlint-disable react/react-compiler */
  useEffect(() => {
    D(
      readPreference('arqon-theme') === 'dark' ||
        (!readPreference('arqon-theme') &&
          matchMedia('(prefers-color-scheme: dark)').matches),
    );
    setThemeReady(true);
    if (new URLSearchParams(location.search).get('lang') === 'en') E(true);
    const syncLocale = () =>
      E(location.pathname.replace(/\/$/, '').endsWith('/en'));
    window.addEventListener('popstate', syncLocale);
    return () => window.removeEventListener('popstate', syncLocale);
  }, []);
  /* oxlint-enable react/react-compiler */
  useEffect(() => {
    if (themeReady) document.documentElement.classList.toggle('dark', dark);
  }, [dark, themeReady]);
  useEffect(() => {
    document.documentElement.lang = en ? 'en' : 'uk';
    document.title = en
      ? 'ARQON SAHARA — Grain dryers & payback calculator'
      : 'ARQON SAHARA — Зерносушарки та калькулятор окупності';
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        'content',
        en
          ? 'Canadian–Ukrainian ARQON grain drying technology. Explore SAHARA 1–4 and compare on-site grain drying with external elevator costs.'
          : 'Канадсько-українські технології сушіння зерна ARQON. Зерносушарки SAHARA 1–4 та порівняння власного сушіння з витратами на елеватор.',
      );
    document
      .querySelector('link[rel="canonical"]')
      ?.setAttribute('href', site.origin + localeUrl(en));
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
            src={asset('/arqon.jpg')}
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
              history.replaceState(null, '', `${localeUrl(v)}${location.hash}`);
              if (location.hash)
                requestAnimationFrame(() =>
                  document
                    .getElementById(decodeURIComponent(location.hash.slice(1)))
                    ?.scrollIntoView({ block: 'start' }),
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
              writePreference('arqon-theme', !dark ? 'dark' : 'light');
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
        <Dialog open={menu} onOpenChange={M}>
          <DialogContent className="menu-dialog" showCloseButton={false}>
            <DialogTitle>{t('Навігація', 'Navigation')}</DialogTitle>
            <DialogDescription className="sr-only">
              {t('Розділи сайту ARQON', 'ARQON website sections')}
            </DialogDescription>
            <DialogClose
              className="modal-close"
              aria-label={t('Закрити меню', 'Close menu')}
            >
              ×
            </DialogClose>
            <nav className="menu-links">
              {nav.map(([id, label]) => (
                <div key={id}>
                  <a href={'#' + id} onClick={() => M(false)}>
                    {label}
                    <ArrowUpRight size={17} />
                  </a>
                  {id === 'products' && (
                    <div className="menu-models">
                      {[1, 2, 3, 4].map((n) => (
                        <a
                          key={n}
                          href={'#sahara-' + n}
                          onClick={() => M(false)}
                        >
                          SAHARA {n}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </DialogContent>
        </Dialog>
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
              src={asset('/sahara-hero.png')}
              alt={t(
                'Технічна ілюстрація зерносушарки SAHARA',
                'SAHARA grain dryer technical illustration',
              )}
              fetchPriority="high"
            />
            <div className="art-bottom">
              <span>
                {t('КОНЦЕПТ / ЗЕРНОСУШАРКА', 'CONCEPT / GRAIN DRYER')}
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
                  <span>{t('СЕРІЯ SAHARA', 'SAHARA SERIES')}</span>
                  <ArrowUpRight size={18} />
                </div>
                <Image
                  width={1024}
                  height={1024}
                  src={asset('/sahara.jpg')}
                  alt={
                    'SAHARA ' +
                    n +
                    ' — ' +
                    t('спільна ілюстрація серії', 'shared series illustration')
                  }
                  loading="lazy"
                />
                <div className="model-copy">
                  <h3>
                    SAHARA <span className="model-number">{n}</span>
                  </h3>
                  <dl className="model-specs">
                    {(['capacity', 'fuel', 'efficiency'] as const).map(
                      (key, i) => (
                        <div key={key}>
                          <dt>
                            {
                              [
                                t('Продуктивність', 'Capacity'),
                                t('Тип палива', 'Fuel type'),
                                t('Енергоефективність', 'Energy efficiency'),
                              ][i]
                            }
                          </dt>
                          <dd>
                            {localText(site.models[n - 1][key], en) ||
                              t('Уточнюється', 'To be confirmed')}
                          </dd>
                        </div>
                      ),
                    )}
                  </dl>
                  <button
                    onClick={() => {
                      O('SAHARA ' + n);
                      track('product_enquiry', { model: n });
                    }}
                  >
                    {t('Замовити розрахунок', 'Request a quote')}
                    <Plus size={19} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
        <Technology en={en} />
        <Calculator en={en} />
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
        <ContentSections en={en} />
      </main>
      <footer>
        <a className="footer-brand" href="#main">
          ARQON<span>ENGINEERING & INNOVATION</span>
        </a>
        <span>
          © 2026 ARQON. {t('Всі права захищені.', 'All rights reserved.')}
        </span>
        <div>
          <a
            href="#privacy"
            onClick={() => {
              document.querySelector<HTMLDetailsElement>('#privacy')!.open =
                true;
            }}
          >
            {t('Конфіденційність', 'Privacy')}
          </a>
          <a
            href="#terms"
            onClick={() => {
              document.querySelector<HTMLDetailsElement>('#terms')!.open = true;
            }}
          >
            {t('Умови використання', 'Terms of use')}
          </a>
        </div>
        <div className="footer-socials">
          {site.socials.map((s) => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {s.name}
            </a>
          ))}
        </div>
        <a href="#main" aria-label={t('На початок', 'Back to top')}>
          ↑
        </a>
      </footer>
      <Dialog open={!!modal} onOpenChange={(v) => !v && O('')}>
        <DialogContent className="arqon-dialog" showCloseButton={false}>
          <DialogClose
            className="modal-close"
            aria-label={t('Закрити', 'Close')}
          >
            ×
          </DialogClose>
          <DialogTitle>{modal}</DialogTitle>
          <DialogDescription>
            {t(
              'Залиште контакти для підбору обладнання та індивідуальної пропозиції.',
              'Leave your details for equipment selection and an individual proposal.',
            )}
          </DialogDescription>
          <EnquiryForm key={modal} en={en} subject={modal} />
          <button className="text-link" onClick={() => O('')}>
            {t('Зрозуміло', 'Got it')}
          </button>
        </DialogContent>
      </Dialog>
      <Analytics en={en} />
    </>
  );
}
