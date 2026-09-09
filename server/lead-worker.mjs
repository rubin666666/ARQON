/** Deploy separately from GitHub Pages. Never put CRM credentials in the frontend. */
export async function handleLead(request, env, fetcher = fetch) {
  const origin = request.headers.get('Origin');
  const allowed = (env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (!origin || !allowed.includes(origin))
    return new Response('Forbidden', { status: 403 });
  const headers = {
    'Access-Control-Allow-Origin': origin,
    Vary: 'Origin',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  };
  const reply = (value, status) =>
    new Response(JSON.stringify(value), { status, headers });
  if (request.method === 'OPTIONS')
    return new Response(null, {
      status: 204,
      headers: {
        ...headers,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  if (request.method !== 'POST') return reply({ accepted: false }, 405);
  if (!env.CRM_WEBHOOK_URL || !env.CRM_WEBHOOK_URL.startsWith('https://'))
    return reply({ accepted: false, error: 'not_configured' }, 503);
  if (Number(request.headers.get('Content-Length')) > 20000)
    return reply({ accepted: false }, 413);
  let body;
  try {
    const text = await request.text();
    if (text.length > 20000) return reply({ accepted: false }, 413);
    body = JSON.parse(text);
  } catch {
    return reply({ accepted: false }, 400);
  }
  if (
    !body ||
    typeof body !== 'object' ||
    typeof body.name !== 'string' ||
    body.name.trim().length < 2 ||
    body.name.length > 100 ||
    typeof body.phone !== 'string' ||
    !/^\+?[0-9]{8,15}$/.test(body.phone) ||
    typeof body.email !== 'string' ||
    body.email.length > 254 ||
    !/^\S+@\S+\.\S+$/.test(body.email) ||
    body.consent !== true ||
    !['uk', 'en'].includes(body.locale)
  )
    return reply({ accepted: false, error: 'invalid' }, 400);
  if (body.company) return reply({ accepted: false }, 400);
  if (
    typeof body.message !== 'string' ||
    body.message.length > 3000 ||
    typeof body.subject !== 'string' ||
    body.subject.length > 200
  )
    return reply({ accepted: false }, 400);
  // Configure a rate-limiting binding in the hosting account before production.
  if (env.RATE_LIMITER) {
    const result = await env.RATE_LIMITER.limit({
      key: request.headers.get('CF-Connecting-IP') || origin,
    });
    if (!result.success)
      return reply({ accepted: false, error: 'rate_limited' }, 429);
  }
  try {
    const response = await fetcher(env.CRM_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(env.CRM_WEBHOOK_TOKEN
          ? { Authorization: `Bearer ${env.CRM_WEBHOOK_TOKEN}` }
          : {}),
      },
      body: JSON.stringify({
        name: body.name.trim(),
        phone: body.phone,
        email: body.email.trim(),
        message: body.message,
        subject: body.subject,
        locale: body.locale,
        consent: true,
        receivedAt: new Date().toISOString(),
        report: body.report || null,
        source: 'ARQON website',
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return reply({ accepted: false, error: 'upstream' }, 502);
    return reply({ accepted: true }, 200);
  } catch {
    return reply({ accepted: false, error: 'upstream' }, 502);
  }
}
// Cloudflare passes ExecutionContext as its third argument, not a fetch function.
const worker = {
  fetch(request, env) {
    return handleLead(request, env);
  },
};
export default worker;
