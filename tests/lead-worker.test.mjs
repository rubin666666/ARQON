import test from 'node:test';
import assert from 'node:assert/strict';
import worker, { handleLead } from '../server/lead-worker.mjs';
const env = {
  ALLOWED_ORIGINS: 'https://rubin666666.github.io',
  CRM_WEBHOOK_URL: 'https://crm.example.test/lead',
};
const valid = {
  name: 'Test User',
  phone: '+380501234567',
  email: 'test@example.test',
  message: 'Test only',
  company: '',
  subject: 'SAHARA 1',
  locale: 'uk',
  consent: true,
};
const request = (body = valid, origin = env.ALLOWED_ORIGINS) =>
  new Request('https://worker.example.test', {
    method: 'POST',
    headers: { Origin: origin, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
await test('rejects untrusted origins without calling CRM', async () => {
  const r = await handleLead(request(valid, 'https://evil.example'), env, () =>
    assert.fail('must not send'),
  );
  assert.equal(r.status, 403);
});
await test('does not pretend success when CRM is unconfigured', async () =>
  assert.equal(
    (await handleLead(request(), { ALLOWED_ORIGINS: env.ALLOWED_ORIGINS }))
      .status,
    503,
  ));
await test('validates consent, phone and honeypot', async () => {
  for (const patch of [
    { consent: false },
    { phone: 'abc' },
    { company: 'bot' },
    { name: ' ' },
    { email: 'invalid' },
  ])
    assert.equal(
      (
        await handleLead(request({ ...valid, ...patch }), env, () =>
          assert.fail('must not send'),
        )
      ).status,
      400,
    );
});
await test('CRM failure stays a failure', async () => {
  const r = await handleLead(
    request(),
    env,
    async () => new Response('', { status: 500 }),
  );
  assert.equal(r.status, 502);
  assert.equal((await r.json()).accepted, false);
});
await test('accepts only successful CRM submission and forwards expected fields', async () => {
  let sent;
  const r = await handleLead(request(), env, async (url, options) => {
    assert.equal(url, env.CRM_WEBHOOK_URL);
    sent = JSON.parse(options.body);
    return new Response('{}', { status: 201 });
  });
  assert.equal(r.status, 200);
  assert.equal((await r.json()).accepted, true);
  assert.equal(sent.email, valid.email);
  assert.equal(sent.source, 'ARQON website');
});
await test('rate limit prevents downstream calls', async () => {
  const r = await handleLead(
    request(),
    { ...env, RATE_LIMITER: { limit: async () => ({ success: false }) } },
    () => assert.fail('must not send'),
  );
  assert.equal(r.status, 429);
});
await test('worker entrypoint accepts Cloudflare ExecutionContext', async (t) => {
  t.mock.method(
    globalThis,
    'fetch',
    async () => new Response('{}', { status: 201 }),
  );
  const response = await worker.fetch(request(), env, { waitUntil() {} });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).accepted, true);
});
await test('forwards calculator scenario without inventing a financial report', async () => {
  const scenario = { model: 'sahara-2', crop: 'corn', volume: 2500, initialMoisture: 25, finalMoisture: 14, distance: 30, elevatorTariff: 150, diesel: '61.5', electricity: '8', delayedSale: false };
  let sent;
  const response = await handleLead(request({ ...valid, scenario }), env, async (_url, options) => {
    sent = JSON.parse(options.body);
    return new Response('{}', { status: 201 });
  });
  assert.equal(response.status, 200);
  assert.deepEqual(sent.scenario, scenario);
  assert.equal(sent.report, null);
});
