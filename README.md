# ARQON / SAHARA

Initial review implementation. Not ready for public production use.

## Run

Node >=22.13.0. `npm ci`, then `npm run dev`. Build with `npm run build`; check types with `npx tsc --noEmit`; run calculation checks with `node --test tests/*.test.mjs`.

## Included

Responsive UA/EN landing page, system-aware persisted light/dark themes, anchor navigation, four product cards, provisional calculator selectors, enlarged photo dialog, contact enquiry layout. The supplied logo and shared dryer concept image are in public/. The image includes the original AI-generated watermark. No invented specifications or financial claims.

## Required before release

- Approved company and technology copy, model specifications and prices, additional equipment details, UA/EN translations.
- Final selector options and crop/model-specific coefficients with units, CAPEX, installation, maintenance and labour rates.
- CRM provider, API documentation and server-side credentials; contact phone/email/address/messenger and social links.
- Actual gallery assets, video URLs and partner logos; map location.
- Approved privacy/terms copy; GA4/GTM IDs and tracking/consent requirements.
- Implement and verify live enquiry delivery and PDF generation with approved calculations. Current enquiry submission is disabled and no contact data is transmitted.
- Confirm both language metadata and remove noindex after approval. Current language switch preserves the anchor and updates document language/title; separate crawlable language routes are not yet implemented.

## Formula questions for the client

The supplied brief omits the actual water-removal and payback equations. It also multiplies removed water mass by a tariff in UAH/t-%: those are different dimensions. `lib/calculator.mjs` contains a proposed, unconnected calculation module, tested only with synthetic fixtures. Manufacturer approval is required before enabling it:

- Removed water = raw tonnes * (initial moisture - final moisture) / (100 - final moisture).
- Elevator fee = raw tonnes * moisture percentage-point difference * tariff, plus seasonal lab fee. Confirm billing basis.
- Logistics = raw tonnes * distance * rate. Confirm whether the rate includes the return journey.
- Delayed sale margin uses saleable dry mass, rather than raw mass. Confirm storage costs and whether both scenarios can benefit from delayed sale.
- Payback is in seasons. Do not label as years without confirming seasons per year. Non-positive savings do not produce a payback period.

## Status

The preview deliberately displays no financial results until approved constants arrive. Media, contacts and partner sections disclose missing content. The provided user GitHub repository remains the origin remote.
