'use client';
import { ModelExplorer, ModelDetails } from './model-explorer';
import { ModelPhoto } from './model-photo';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { EnquiryForm } from './enquiry-form';
import { Calculator } from './engineering-calculator';
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
  Cog,
  SlidersHorizontal,
  Cpu,
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
    [selectedModel, setSelectedModel] = useState(site.models[0].id),
    [calculatorOpen, setCalculatorOpen] = useState(false),
    [detailModel, setDetailModel] = useState<string|null>(null),
    [allModels, setAllModels] = useState(false),
    [activeSection, setActiveSection] = useState('');
  useEffect(() => {
    document.documentElement.lang = initialEnglish ? 'en' : 'uk';
  }, [initialEnglish]);
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
  useEffect(()=>{
    const revealModel=()=>{
      const id=location.hash.slice(1);
      if(site.models.findIndex(m=>m.id===id)>=3){
        setAllModels(true);
        requestAnimationFrame(()=>document.getElementById(id)?.scrollIntoView({block:'start'}));
      }
    };
    revealModel();window.addEventListener('hashchange',revealModel);
    return ()=>window.removeEventListener('hashchange',revealModel);
  },[]);
  function calculateModel(id:string) {
    setSelectedModel(id);
    setCalculatorOpen(true);
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
            <a className="button menu-calculator" href="#calculator" onClick={()=>{M(false);setCalculatorOpen(true);}}>{t('Розрахувати окупність','Calculate payback')} <ArrowUpRight size={18}/></a>
            <nav className="menu-links">
              {nav.map(([id, label]) => (
                <div key={id}>
                  <a href={'#' + id} aria-current={activeSection===id?'location':undefined} onClick={() => M(false)}>
                    {label}
                    <ArrowUpRight size={17} />
                  </a>
                  {id === 'products' && (
                    <div className="menu-models">
                      {site.models.map((m) => (
                        <a
                          key={m.id}
                          href={'#' + m.id}
                          onClick={() => M(false)}
                        >
                          {m.name}
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
            <figure className="hero-mobile-art"><Image width={1024} height={1024} src={asset('/sahara-contour.png')} alt={t('Технічна ілюстрація зерносушарки SAHARA','SAHARA grain dryer technical illustration')} fetchPriority="high"/></figure>
            <p>
              {t(
                'Зерносушарки SAHARA — обладнання Arqon, де інженерія, автоматизація й програмне забезпечення працюють як одна система.',
                'SAHARA grain dryers from Arqon, where engineering, automation and software work as one system.',
              )}
            </p>
            <div className="hero-links">
              <a className="button" href="#calculator" onClick={()=>setCalculatorOpen(true)}>
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
              src={asset('/sahara-contour.png')}
              alt={t(
                'Технічна ілюстрація зерносушарки SAHARA',
                'SAHARA grain dryer technical illustration',
              )}
              fetchPriority="high"
            />
          </figure>
        </section>
        <div className="benefits">
          {[Cog, SlidersHorizontal, Cpu].map((Icon, i) => (
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
          {allModels && <ModelExplorer en={en} onCalculate={calculateModel} />}
          {!allModels && <div className="product-previews">{site.models.slice(0,3).map(m=><button key={m.id} type="button" className="product-preview" aria-label={t('Відкрити галерею продуктів: ','Open product gallery: ')+m.name} aria-expanded={false} aria-controls="product-models" onClick={()=>setAllModels(true)}><Image src={asset(m.image || '/images/sahara-product-v2.webp')} width={240} height={240} alt={m.name} loading="lazy"/><span>{m.name}</span><ArrowUpRight size={18}/></button>)}</div>}
          {allModels && <figure className="product-context"><Image src={asset('/images/sahara-context-v2.webp')} alt={t('Візуалізація сушарки SAHARA поруч із зерновим комплексом','Visualization of a SAHARA dryer alongside a grain facility')} width={1536} height={864} loading="lazy"/><figcaption><span className="eyebrow">{t('Серія SAHARA','SAHARA series')}</span><h3>{t('Технологія для вашого врожаю','Technology for your harvest')}</h3><p>{t('Концептуальна візуалізація застосування','Conceptual application visualization')}</p></figcaption></figure>}
          <div className="products" id="product-models">
            {(allModels ? site.models : []).map((m) => (
              <article key={m.id} id={m.id}>
                <div className="model-top">
                  <span>{t('СЕРІЯ SAHARA', 'SAHARA SERIES')}</span>
                  <ArrowUpRight size={18} />
                </div>
                <ModelPhoto name={m.name} src={m.image} en={en} />
                <div className="model-copy">
                  <h3>
                    <span className="model-number">{m.name}</span>
                  </h3>
                  <dl className="model-specs model-card-specs">{m.specifications.slice(0, 3).map(spec => {
                    const label = localText(spec.label, en);
                    const separator = label.indexOf(':');
                    const [amount, ...unit] = localText(spec.value, en).split(' ');
                    return <div key={spec.id}>
                      <dt>{separator < 0 ? label : <><span className="spec-crop">{label.slice(0, separator)}</span><span className="spec-conditions">{label.slice(separator + 1).trim()}</span></>}</dt>
                      <dd><span className="spec-amount">{amount}</span>{unit.length > 0 && <> <span className="spec-unit">{unit.join(' ')}</span></>}</dd>
                    </div>;
                  })}</dl>
                  <button type="button" className="text-link model-detail-link" onClick={()=>setDetailModel(m.id)}>{t('Детальніше','View details')}</button>
                  <button
                    className="button button-secondary model-action"
                    aria-label={`${t('Розрахувати для', 'Calculate for')} ${m.name}`}
                    onClick={() => {
                      setSelectedModel(m.id);
                      history.replaceState(null, '', '#calculator');
                      setCalculatorOpen(true);
                      track('product_calculator', { model: m.id });
                    }}
                  >
                    {t('Розрахувати', 'Calculate')}
                    <ArrowUpRight size={19} />
                  </button>
                </div>
              </article>
            ))}
          </div>
          <button type="button" className="button button-secondary compare-button" aria-expanded={allModels} aria-controls="product-models" onClick={()=>{setAllModels(value=>!value);if(allModels)document.getElementById('products')?.scrollIntoView({block:'start'});}}>{allModels?t('Згорнути моделі','Show fewer models'):t('Галерея продуктів','Product gallery')+' ('+site.models.length+')'}<ArrowUpRight size={18}/></button>
        </section>
        <ModelDetails en={en} id={detailModel} onClose={()=>setDetailModel(null)} onCalculate={calculateModel} />
        <Technology en={en} />
        <Calculator en={en} model={selectedModel} onModelChange={setSelectedModel} open={calculatorOpen} onOpenChange={setCalculatorOpen} />
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

