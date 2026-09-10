'use client';
import { useState } from 'react';
import Image from 'next/image';
import { asset } from '@/lib/site';
export function Technology({ en }: { en: boolean }) {
  const [active, setActive] = useState(0);
  const items = en
    ? [
        [
          'Grain and moisture',
          'Crop, initial moisture and target moisture are the starting parameters for a drying calculation.',
        ],
        [
          'Energy and operating costs',
          'Diesel and electricity prices help compare seasonal operating costs.',
        ],
        [
          'Volume and logistics',
          'Seasonal grain volume and distance to an elevator complete the comparison.',
        ],
      ]
    : [
        [
          'Зерно та вологість',
          'Культура, початкова й кінцева вологість — вихідні параметри для розрахунку сушіння.',
        ],
        [
          'Енергія та витрати',
          'Ціни дизеля й електроенергії допомагають порівняти операційні витрати за сезон.',
        ],
        [
          'Обсяг та логістика',
          'Сезонний обсяг зерна й відстань до елеватора доповнюють порівняння.',
        ],
      ];
  return (
    <section id="technology" className="section technology technology-detail">
      <div className="technology-heading">
        <div className="eyebrow">03 / {en ? 'TECHNOLOGY' : 'ТЕХНОЛОГІЯ'}</div>
        <h2>
          {en ? 'More control.' : 'Більше контролю.'}
          <br />
          <em>{en ? 'At every stage.' : 'На кожному етапі.'}</em>
        </h2>
      </div>
      <figure className="technology-drawing">
        <Image
          src={asset('/sahara-hero.png')}
          width={1254}
          height={1254}
          alt={
            en
              ? 'Concept illustration of the SAHARA grain dryer'
              : 'Концептуальна ілюстрація зерносушарки SAHARA'
          }
          loading="lazy"
        />
        <div
          className="technology-markers"
          aria-label={en ? 'Select a topic' : 'Оберіть тему'}
        >
          {items.map(([title], i) => (
            <button
              key={title}
              type="button"
              className={active === i ? 'active' : ''}
              aria-pressed={active === i}
              aria-controls={'technology-topic-' + i}
              aria-label={`${i + 1}. ${title}`}
              onClick={() => setActive(i)}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <figcaption>
          {en
            ? 'Concept illustration · comparison topics, not a component layout'
            : 'Концептуальна ілюстрація · теми порівняння, не схема вузлів'}
        </figcaption>
      </figure>
      <div className="technology-topics">
        {items.map(([title, description], i) => (
          <div
            key={title}
            className={'technology-topic ' + (active === i ? 'active' : '')}
            id={'technology-topic-' + i}
          >
            <button
              type="button"
              onClick={() => setActive(i)}
              aria-pressed={active === i}
            >
              <span>0{i + 1}</span>
              <h3>{title}</h3>
            </button>
            <p>{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
