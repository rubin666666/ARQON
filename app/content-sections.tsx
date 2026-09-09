'use client';
import { useState } from 'react';
import Image from 'next/image';
import {
  ArrowUpRight,
  Plus,
  Play,
  MapPin,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { site, asset, localText } from '@/lib/site';
import { EnquiryForm } from './enquiry-form';
export function ContentSections({ en }: { en: boolean }) {
  const t = (a: string, b: string) => (en ? b : a);
  const [photo, setPhoto] = useState<number | null>(null),
    [playing, setPlaying] = useState<string | null>(null),
    [showMap, setShowMap] = useState(false);
  const contacts = site.contact;
  const nextPhoto = (delta: number) =>
    setPhoto((v) =>
      v === null ? null : (v + delta + site.photos.length) % site.photos.length,
    );
  return (
    <>
      <section className="section media-grid">
        <div id="photo">
          <div className="eyebrow">
            06 / {t('ФОТОГАЛЕРЕЯ', 'PHOTO GALLERY')}
          </div>
          <h2>{t('SAHARA в деталях.', 'SAHARA in detail.')}</h2>
          <div className="photo-grid">
            {site.photos.map((p, i) => (
              <button
                key={p.src}
                className="gallery"
                onClick={() => setPhoto(i)}
                aria-label={t('Збільшити: ', 'Enlarge: ') + p[en ? 'en' : 'uk']}
              >
                <Image
                  width={1024}
                  height={1024}
                  src={asset(p.src)}
                  alt={p[en ? 'en' : 'uk']}
                  loading="lazy"
                />
                <span>
                  {p[en ? 'en' : 'uk']}
                  <Plus size={18} />
                </span>
              </button>
            ))}
          </div>
        </div>
        <div id="video">
          <div className="eyebrow">07 / {t('ВІДЕО', 'VIDEO')}</div>
          <h2>{t('Технологія в русі.', 'Technology in motion.')}</h2>
          {site.videos.length ? (
            site.videos.map((v) => (
              <div key={v.id} className="video-frame">
                {playing === v.id ? (
                  <iframe
                    title={localText(v.title, en)}
                    src={
                      v.provider === 'youtube'
                        ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.id)}`
                        : `https://player.vimeo.com/video/${encodeURIComponent(v.id)}`
                    }
                    allow="fullscreen; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                ) : (
                  <button onClick={() => setPlaying(v.id)}>
                    <Play />
                    <span>{localText(v.title, en)}</span>
                    <small>
                      {t('Завантажити відео з ', 'Load video from ')}
                      {v.provider === 'youtube' ? 'YouTube' : 'Vimeo'}
                    </small>
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="video-placeholder">
              <span>SAHARA / FILM</span>
              <Play size={40} strokeWidth={1} />
              <p>
                {t(
                  'Відео роботи обладнання буде додано після отримання матеріалів.',
                  'Equipment videos will be added when the footage is available.',
                )}
              </p>
            </div>
          )}
        </div>
      </section>
      <section id="contacts" className="section contacts">
        <div>
          <div className="eyebrow">
            08 / {t('КОНТАКТИ В УКРАЇНІ', 'CONTACTS IN UKRAINE')}
          </div>
          <h2>
            {t('Ваш наступний сезон', 'Your next season')}
            <br />
            <em>{t('починається тут.', 'starts here.')}</em>
          </h2>
          <div className="contact-links">
            {contacts.phone && (
              <a href={'tel:' + contacts.phone.replace(/[^+\d]/g, '')}>
                <Phone size={20} />
                {contacts.phone}
              </a>
            )}
            {contacts.email && (
              <a href={'mailto:' + contacts.email}>
                <Mail size={20} />
                {contacts.email}
              </a>
            )}
            {localText(contacts.address, en) && (
              <p>
                <MapPin size={20} />
                {localText(contacts.address, en)}
              </p>
            )}
          </div>
          {!contacts.phone && !contacts.email && (
            <p className="muted">
              {t(
                'Контактні дані українського представництва готуються до публікації.',
                'Contact details for the Ukrainian office are being prepared for publication.',
              )}
            </p>
          )}
          <div className="messengers">
            {(['telegram', 'whatsapp', 'viber'] as const)
              .filter((key) => contacts[key])
              .map((key) => (
                <a
                  key={key}
                  href={contacts[key]}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {key[0].toUpperCase() + key.slice(1)}
                  <ArrowUpRight size={15} />
                </a>
              ))}
          </div>
          {contacts.mapEmbedUrl && (
            <div className="map-frame">
              {showMap ? (
                <iframe
                  title={t('ARQON на карті', 'ARQON on the map')}
                  src={contacts.mapEmbedUrl}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <button className="button" onClick={() => setShowMap(true)}>
                  <MapPin size={18} />
                  {t('Відкрити Google Maps', 'Open Google Maps')}
                </button>
              )}
            </div>
          )}
        </div>
        <div className="contact-panel">
          <h3>
            {t('Обговоримо ваше господарство', 'Let’s discuss your farm')}
          </h3>
          <p>
            {t(
              'Залиште контакти та коротко опишіть потреби.',
              'Leave your details and briefly describe your requirements.',
            )}
          </p>
          <EnquiryForm en={en} message subject="Contact enquiry" />
        </div>
      </section>
      <section id="partners" className="partners">
        <span className="eyebrow">09 / {t('ПАРТНЕРИ', 'PARTNERS')}</span>
        {site.partners.length ? (
          <div className="partner-grid">
            {site.partners.map((p) => (
              <div key={p.name}>
                {p.url ? (
                  <a href={p.url} target="_blank" rel="noopener noreferrer">
                    <Image
                      src={asset(p.logo)}
                      width={160}
                      height={70}
                      alt={p.name}
                    />
                  </a>
                ) : (
                  <Image
                    src={asset(p.logo)}
                    width={160}
                    height={70}
                    alt={p.name}
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>
            {t(
              'Інформація про технологічних партнерів буде додана після підтвердження.',
              'Technology partners will be listed following confirmation.',
            )}
          </p>
        )}
      </section>
      <section className="legal-section">
        <details id="privacy">
          <summary>{t('Політика конфіденційності', 'Privacy policy')}</summary>
          <p>
            {localText(site.privacy, en) ||
              t(
                'Текст політики очікує погодження ARQON. До його публікації надсилання заявок вимкнено. Налаштування теми й аналітики зберігаються лише у вашому браузері.',
                'The privacy policy is awaiting ARQON approval. Enquiry submission is disabled until it is published. Theme and analytics preferences are stored only in your browser.',
              )}
          </p>
        </details>
        <details id="terms">
          <summary>{t('Умови використання', 'Terms of use')}</summary>
          <p>
            {localText(site.terms, en) ||
              t(
                'Це попередня версія сайту для погодження. Характеристики та розрахунки потребують підтвердження виробником. Комерційні умови надаються окремо.',
                'This is a preliminary website for review. Specifications and calculations require manufacturer confirmation. Commercial terms are provided separately.',
              )}
          </p>
        </details>
      </section>
      <Dialog open={photo !== null} onOpenChange={(v) => !v && setPhoto(null)}>
        <DialogContent className="image-dialog" showCloseButton={false}>
          <DialogClose
            className="modal-close"
            aria-label={t('Закрити', 'Close')}
          >
            ×
          </DialogClose>
          <DialogTitle>{t('Фотогалерея', 'Photo gallery')}</DialogTitle>
          <DialogDescription>
            {photo !== null ? site.photos[photo]?.[en ? 'en' : 'uk'] : ''}
          </DialogDescription>
          {photo !== null && (
            <Image
              width={1024}
              height={1024}
              src={asset(site.photos[photo].src)}
              alt={site.photos[photo][en ? 'en' : 'uk']}
            />
          )}{' '}
          {site.photos.length > 1 && (
            <div className="gallery-controls">
              <button
                className="icon"
                aria-label={t('Попереднє фото', 'Previous photo')}
                onClick={() => nextPhoto(-1)}
              >
                <ChevronLeft />
              </button>
              <span>
                {(photo ?? 0) + 1} / {site.photos.length}
              </span>
              <button
                className="icon"
                aria-label={t('Наступне фото', 'Next photo')}
                onClick={() => nextPhoto(1)}
              >
                <ChevronRight />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
