'use client';
import { ModelExplorer, ModelDetails } from './model-explorer';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { EnquiryForm } from './enquiry-form';
import { Calculator } from './calculator';
import { About } from './about';
import { Technology } from './technology';
import { ContentSections } from './content-sections';
import { Analytics } from './analytics';
import {
  site,
  hasContacts,
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
    [modal, O] = useState(''),
    [selectedModel, setSelectedModel] = useState('sahara-1'),
    [detailModel, setDetailModel] = useState<string|null>(null),
    [activeSection, setActiveSection] = useState('');
  useEffect(()=>{
    let frame = 0;
    const update = ()=>{
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(()=>{
        const sections = [...document.querySelectorAll('main section[id], main div#photo, main div#video')].filter(el=>!el.hasAttribute('hidden'));
        let current = '';
        for (const el of sections) if(el.getBoundingClientRect().top <= 180) current = el.id;
        setActiveSection(current);
      });
    };
    update(); window.addEventListener('scroll',update,{passive:true}); window.addEventListener('resize',update);
    return ()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',update);window.removeEventListener('resize',update);};
  },[]);
  function calculateModel(id:string) {
    setSelectedModel(id);
    requestAnimationFrame(()=>{document.getElementById('calculator')?.scrollIntoView({block:'start'});document.getElementById('calc-model')?.focus({preventScroll:true});});
  }
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
      ? 'ARQON — Engineering. Automation. Intelligence.'
      : 'ARQON — Engineering. Automation. Intelligence.';
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        'content',
        en
          ? 'Arqon is an engineering technology company specializing in industrial automation, intelligent machinery, and industrial software. SAHARA grain dryers and a payback calculator.'
          : 'Arqon — інженерно-технологічна компанія: промислова автоматизація, інтелектуальне обладнання та промислове ПЗ. Зерносушарки SAHARA та калькулятор окупності.',
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
  ].filter(([id]) => id !== 'photo' || site.photos.length).filter(([id]) => id !== 'video' || site.videos.length).filter(([id]) => id !== 'partners' || site.partners.length).filter(([id]) => id !== 'contacts' || hasContacts(en)).filter(([id]) => id !== 'equipment' || site.equipmentPublished);
  return (
    <>
      <a className="skip" href="#main">
        {t('До вмісту', 'Skip to content')}
      </a>
      <header>
        <a href="#main" className="brand">
          <Image
            width={1952}
            height={816}
            src={asset('/arqon-logo.png')}
            alt="ARQON Engineering & Innovation"
          />
          <Image className="brand-light-letters" src={asset('/arqon-logo.png')} width={1952} height={816} alt="" aria-hidden="true" />
        </a>
        <nav className="desktop-nav">
          {nav
            .filter(([id]) => ['about', 'products', 'technology', 'calculator', 'contacts'].includes(id))
            .map(([id, label]) => (
              <a key={id} href={'#' + id} aria-current={activeSection===id?'location':undefined}>
                {label}
              </a>
            ))}
        </nav>
        <div className="header-actions">
          <button
            onClick={() => {
              const v = !en;
              E(v);
              history.replaceState(null, '', `${localeUrl(v)}${location.search}${location.hash}`);
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
            <a className="button menu-calculator" href="#calculator" onClick={()=>M(false)}>{t('Розрахувати окупність','Calculate payback')} <ArrowUpRight size={18}/></a>
            <nav className="menu-links">
              {nav.map(([id, label]) => (
                <div key={id}>
                  <a href={'#' + id} aria-current={activeSection===id?'location':undefined} onClick={() => M(false)}>
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
            <p className="eyebrow">{localText(site.tagline, en)}</p>
            <h1>
              {t('Ваш урожай.', 'Your harvest.')}
              <br />
              {t('Наша технологія.', 'Our technology.')}
              <br />
              <em>SAHARA.</em>
            </h1>
            <p>
              {t(
                'Зерносушарки SAHARA — обладнання Arqon, де інженерія, автоматизація й програмне забезпечення працюють як одна система.',
                'SAHARA grain dryers from Arqon, where engineering, automation and software work as one system.',
              )}
            </p>
            <div className="hero-links">
              <a className="button" href="#calculator">
                {t('Розрахувати окупність', 'Calculate payback')}
                <ArrowUpRight size={18} />
              </a>
              <a className="text-link" href="#products">
                {t('Дивитися моделі', 'See the models')}
                <ArrowRight size={16} />
              </a>
            </div>
          </div>
          <figure className="hero-art">
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
          </figure>
        </section>
        <div className="benefits">
          {[Flame, SlidersHorizontal, ShieldCheck].map((Icon, i) => (
            <div key={i}>
              <Icon size={20} strokeWidth={1.5} />
              <div>
                <h3>
                  {
                    [
                      t('Інженерія', 'Engineering'),
                      t('Автоматизація', 'Automation'),
                      t('Інтелект', 'Intelligence'),
                    ][i]
                  }
                </h3>
                <p>
                  {
                    [
                      t(
                        'Машинобудування, механічне проєктування й обладнання.',
                        'Mechanical engineering, machinery and equipment design.',
                      ),
                      t(
                        'Системи керування, PLC та HMI як частина продукту.',
                        'Control systems, PLC and HMI as part of the product.',
                      ),
                      t(
                        'Власне ПЗ, дані та дистанційний моніторинг.',
                        'Proprietary software, data and remote monitoring.',
                      ),
                    ][i]
                  }
                </p>
              </div>
            </div>
          ))}
        </div>
        <About en={en} />
        <section id="products" className="section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{t('Продукти', 'Products')}</p>
              <h2>
                {t('Знайдіть свою', 'Find your')} <em>SAHARA.</em>
              </h2>
            </div>
            <p>{localText(site.productIntro, en)}</p>
          </div>
          <ModelExplorer en={en} onCalculate={calculateModel} />
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
                  src={asset(site.models[n - 1].image || '/sahara.jpg')}
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
                  {(['capacity', 'fuel', 'efficiency'] as const).some(key => localText(site.models[n - 1][key], en)) && <details className="model-details"><summary>{t('Характеристики', 'Specifications')}</summary><dl className="model-specs">
                    {(['capacity', 'fuel', 'efficiency'] as const).filter(key => localText(site.models[n - 1][key], en)).map(
                      (key) => (
                        <div key={key}>
                          <dt>
                            {
                              [
                                t('Продуктивність', 'Capacity'),
                                t('Тип палива', 'Fuel type'),
                                t('Енергоефективність', 'Energy efficiency'),
                              ][['capacity', 'fuel', 'efficiency'].indexOf(key)]
                            }
                          </dt>
                          <dd>
                            {localText(site.models[n - 1][key], en) ||
                              t('Уточнюється', 'To be confirmed')}
                          </dd>
                        </div>
                      ),
                    )}
                  </dl></details>}
                  <button type="button" className="text-link model-detail-link" onClick={()=>setDetailModel('sahara-'+n)}>{t('Детальніше','View details')}</button>
                  <button
                    className="button button-secondary model-action"
                    aria-label={`${t('Розрахувати для', 'Calculate for')} SAHARA ${n}`}
                    onClick={() => {
                      setSelectedModel('sahara-' + n);
                      history.replaceState(null, '', '#calculator');
                      requestAnimationFrame(() => { document.getElementById('calculator')?.scrollIntoView({block: 'start'}); document.getElementById('calc-model')?.focus({preventScroll: true}); });
                      track('product_calculator', { model: n });
                    }}
                  >
                    {t('Розрахувати', 'Calculate')}
                    <ArrowUpRight size={19} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
        <ModelDetails en={en} id={detailModel} onClose={()=>setDetailModel(null)} onCalculate={calculateModel} />
        <Technology en={en} />
        <Calculator en={en} model={selectedModel} onModelChange={setSelectedModel} />
        {site.equipmentPublished && <section id="equipment" className="section">
          <p className="eyebrow">{t('Додаткове обладнання', 'Optional equipment')}</p>
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
        </section>}
        <ContentSections en={en} />
      </main>
      <footer className="site-footer">
        <div className="footer-identity">
          <a className="brand footer-logo" href="#main">
            <Image src={asset('/arqon-logo.png')} width={1952} height={816} alt="ARQON Engineering & Innovation" />
            <Image className="brand-light-letters" src={asset('/arqon-logo.png')} width={1952} height={816} alt="" aria-hidden="true" />
          </a>
        </div>
        <nav className="footer-nav" aria-label={t('Навігація у підвалі','Footer navigation')}>
          <span className="footer-caption">{t('Розділи', 'Explore')}</span>
          {nav.filter(([id])=>['about','products','technology','calculator','contacts'].includes(id)).map(([id,label])=><a key={id} href={'#'+id}>{label}<ArrowUpRight size={15}/></a>)}
        </nav>
        <span>
          © 2026 ARQON. {t('Всі права захищені.', 'All rights reserved.')}
        </span>
        <div>
          {!!localText(site.privacy, en) && <a
            href="#privacy"
            onClick={() => {
              document.querySelector<HTMLDetailsElement>('#privacy')!.open =
                true;
            }}
          >
            {t('Конфіденційність', 'Privacy')}
          </a>}
          {!!localText(site.terms, en) && <a
            href="#terms"
            onClick={() => {
              document.querySelector<HTMLDetailsElement>('#terms')!.open = true;
            }}
          >
            {t('Умови використання', 'Terms of use')}
          </a>}
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
        <a className="footer-top" href="#main" aria-label={t('На початок', 'Back to top')}>
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

