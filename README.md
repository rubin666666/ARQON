# ARQON / SAHARA

Двомовний сайт ARQON із калькулятором окупності. Підготовлений для GitHub Pages; серверна збірка Sites збережена окремо.

## Розробка та перевірка

Node.js 22.13+; встановлення: `npm ci`.

- `npm run dev` — розробка через Vinext.
- `npm run build:pages` — статична збірка для `/ARQON/` та `/ARQON/en/`.
- `node scripts/preview-pages.mjs` — перегляд на `http://localhost:4173/ARQON/`.
- `npm run typecheck`, `npm run lint:app`, `npm test` — перевірки авторського коду.
- `node scripts/check-static.mjs` — перевірка HTML, метаданих і локальних ресурсів.
- `node scripts/check-pdf.mjs` — двомовні звіти на синтетичних даних у `work/`.
- `npm run build` — серверна збірка, не призначена для GitHub Pages.

## GitHub Pages

Settings → Pages → Source: GitHub Actions. Workflow `.github/workflows/pages.yml` перевіряє, збирає та публікує сайт після оновлення `main`. `PAGES_BASE_PATH` надходить із configure-pages; локально типовий шлях `/ARQON`.

`scripts/build-pages.mjs` збирає ті самі React-компоненти через Vite та створює готові UA/EN HTML через ReactDOMServer. У Pages немає серверного маршрутизатора або RSC-запитів. Звичайна Vinext-збірка збережена для серверного хостингу. Файли node_modules не змінюються.

## Контент

`config/site.json`: українські контакти, карта, месенджери, характеристики моделей, фото, відео YouTube/Vimeo, партнери, соцмережі, політики, адреса обробника заявок, GA4/GTM.

Відсутні дані залишені порожніми. Ілюстрація сушарки спільна для серії. Відео й карта завантажуються після натискання. Аналітика працює лише після згоди та надання ID; якщо використовується GTM, GA4 налаштовується в контейнері, щоб не дублювати події. Пошукова індексація вимкнена до погодження (`readyForIndexing`). Для UA/EN є окремі HTML та метадані.

## Калькулятор

`config/calculator.json` містить варіанти списків, культури та `rates[modelId][cropId]`. Числа вручну вводяться лише для вартості енергоносіїв. Після погодження клієнтом встановити загальний `approved: true` та `approved: true` у кожному затвердженому наборі коефіцієнтів. Поля набору:

`capex`, `installation`, `dieselLitresPerTonneWater`, `electricityKwhPerTonneRaw`, `maintenancePerTonneRaw`, `labourPerSeason`, `labFeePerSeason`, `logisticsPerTonneKm`, `storageMarginPerTonneDry`.

До погодження результати не показуються. Перевіряються вологість, ціни, переповнення чисел та відсутність окупності при нульовій/від’ємній економії. Тестові коефіцієнти є тільки у тестах.

Потрібне підтвердження клієнта:

1. Вода = сира маса × (початкова − кінцева вологість) / (100 − кінцева вологість).
2. Тариф грн/т-% множиться на сиру масу та різницю вологості, а не на масу видаленої води — у ТЗ розбіжність одиниць.
3. Чи включає логістичний тариф повернення транспорту.
4. База маржі відкладеного продажу — сухе зерно; уточнити витрати зберігання та альтернативу елеватора.
5. Окупність у сезонах. Для років потрібна кількість сезонів на рік.

## Заявки й PDF

Pages не запускає серверні обробники. `server/lead-worker.mjs` — окремий адаптер CRM webhook: CORS, валідація, honeypot, обмеження розміру, тайм-аут і rate limiter. `server/wrangler.example.jsonc` — приклад розгортання. Задати ALLOWED_ORIGINS і секрети CRM_WEBHOOK_URL/CRM_WEBHOOK_TOKEN через хостинг, не через frontend або Git.

Контракт адаптера потрібно звірити з реальною CRM: зараз 2xx webhook означає успіх. Справжні заявки під час перевірок не надсилалися. У frontend задати HTTPS `leadEndpoint` і погоджену політику. До цього надсилання вимкнено. Успіх і PDF відкриваються лише після `{accepted:true}`. Звіт створюється у браузері, не через сторонній PDF-сервіс. Персональні дані не зберігаються в localStorage.

Шрифт PDF: Noto Sans Regular з https://github.com/notofonts/noto-fonts/blob/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf. SIL OFL: `public/fonts/OFL.txt`. Перевірені кирилиця, витяг тексту та візуальний рендер.

## Перед запуском

Див. `CLIENT-CHECKLIST.md`. Реальні CRM, контакти, відео, карта та аналітика потребують матеріалів/доступів клієнта. React оновлений до 19.2.8, Vite до 8.0.16. У транзитивних інструментах залишаються audit-попередження; статичний Pages не запускає серверний runtime. `lint:app` перевіряє авторський код; загальний lint також включає незмінені компоненти шаблону з попередніми зауваженнями.

## Model and media content

`config/site.json` supports per-model `image`, `datasheet`, localized `description`, `equipment`, `power`, and `dimensions`, alongside existing specifications. Only approved values should be entered. Comparison omits unavailable specification rows; drawers omit unavailable PDFs. `faq` accepts localized question/answer pairs. Photos and videos share one media section; video controls appear when videos exist, and playback is click-to-load.

Calculator scenarios are validated against configured selector options, saved locally, and shared through the `scenario` URL parameter. They contain inputs only, never enquiry contact details. The form sends `scenario` even if approved financial results are not yet available. Live CRM delivery still requires the endpoint, server CRM configuration and approved privacy text. PDF reporting remains gated on accepted submission and approved calculation data.

Outstanding client materials: real model/production photos, videos, model specifications and technical PDFs, service/warranty FAQ answers, calculator coefficients and CRM/contact settings. Existing illustrations remain explicitly conceptual.
