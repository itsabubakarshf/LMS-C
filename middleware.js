// Vercel Routing Middleware — a login gate in front of the whole site. No database: the credentials live in
// environment variables (AUTH_EMAIL, AUTH_PASSWORD) and a signed, HttpOnly cookie (AUTH_SECRET) keeps you signed in.
// It only runs on Vercel; opening index.html from disk does not use it.
export const config = { matcher: '/:path*' };

const enc = new TextEncoder();
const COOKIE = 'cq_auth';
const WEEK = 7 * 24 * 3600;

async function hmac(secret, msg) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(msg)));
  return Array.from(sig, b => b.toString(16).padStart(2, '0')).join('');
}
// constant-time string comparison (compares SHA-256 digests so lengths never leak)
async function same(a, b) {
  const [x, y] = await Promise.all([crypto.subtle.digest('SHA-256', enc.encode(a)), crypto.subtle.digest('SHA-256', enc.encode(b))]);
  const A = new Uint8Array(x), B = new Uint8Array(y); let d = 0;
  for (let i = 0; i < A.length; i++) d |= A[i] ^ B[i];
  return d === 0;
}
function getCookie(req, name) {
  const m = (req.headers.get('cookie') || '').split(/;\s*/).find(c => c.startsWith(name + '='));
  return m ? decodeURIComponent(m.slice(name.length + 1)) : '';
}
async function isSignedIn(req, secret) {
  const [exp, sig] = getCookie(req, COOKIE).split('.');
  if (!exp || !sig || !(+exp > Date.now() / 1000)) return false;
  return same(sig, await hmac(secret, 'cq|' + exp));
}
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function page(error, email) {
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sign in · C Quest</title>
<style>:root{color-scheme:light dark;--bg:#f4f6f8;--panel:#fff;--ink:#15181e;--muted:#5d6675;--line:#dde2ea;--accent:#0a7f78;--bad:#c62828}
@media (prefers-color-scheme:dark){:root{--bg:#0e1117;--panel:#161b24;--ink:#e7eaf0;--muted:#97a1b3;--line:#2a3140;--accent:#38d2c2;--bad:#ff7b7b}}
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:var(--bg);color:var(--ink);font:16px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;padding:16px}
form{width:100%;max-width:380px;background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:28px;box-shadow:0 4px 24px rgba(0,0,0,.08)}
.logo{display:grid;place-items:center;width:44px;height:44px;border-radius:12px;background:var(--accent);color:#fff;font:800 24px ui-monospace,Consolas,monospace;margin-bottom:12px}
h1{font-size:1.4rem;margin:0 0 4px}p{margin:0 0 18px;color:var(--muted);font-size:14px}label{display:block;font-size:13px;font-weight:600;margin:12px 0 4px}
input{width:100%;padding:10px 12px;border-radius:10px;border:1px solid var(--line);background:transparent;color:var(--ink);font:inherit}input:focus{outline:2px solid var(--accent);outline-offset:1px}
button{width:100%;margin-top:18px;padding:11px;border:0;border-radius:10px;background:var(--accent);color:#fff;font:600 16px inherit;cursor:pointer}.err{color:var(--bad);font-size:14px;margin-top:12px}</style></head>
<body><form method="post" action="/__login"><div class="logo">C</div><h1>C Quest</h1><p>Sign in to open the course.</p>
<label for="e">Email</label><input id="e" name="email" type="email" autocomplete="username" required value="${esc(email || '')}" autofocus>
<label for="p">Password</label><input id="p" name="password" type="password" autocomplete="current-password" required>
${error ? '<div class="err" role="alert">' + esc(error) + '</div>' : ''}<button type="submit">Sign in</button></form></body></html>`,
  { status: error ? 401 : 200, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
}

export default async function middleware(request) {
  const { AUTH_EMAIL, AUTH_PASSWORD, AUTH_SECRET } = process.env;
  if (!AUTH_EMAIL || !AUTH_PASSWORD || !AUTH_SECRET) return new Response('Authentication is not configured.', { status: 503 });  // fail closed
  const url = new URL(request.url);

  if (url.pathname === '/__logout') {
    return new Response(null, { status: 303, headers: { location: '/', 'set-cookie': `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`, 'cache-control': 'no-store' } });
  }
  if (url.pathname === '/__login' && request.method === 'POST') {
    let email = '', password = '';
    try { const f = await request.formData(); email = String(f.get('email') || '').trim(); password = String(f.get('password') || ''); } catch (_) {}
    const ok = (await same(email.toLowerCase(), AUTH_EMAIL.toLowerCase())) & (await same(password, AUTH_PASSWORD));
    if (!ok) { await new Promise(r => setTimeout(r, 700)); return page('Wrong email or password.', email); }
    const exp = Math.floor(Date.now() / 1000) + WEEK;
    return new Response(null, { status: 303, headers: { location: '/', 'cache-control': 'no-store',
      'set-cookie': `${COOKIE}=${exp}.${await hmac(AUTH_SECRET, 'cq|' + exp)}; Path=/; Max-Age=${WEEK}; HttpOnly; Secure; SameSite=Lax` } });
  }
  if (await isSignedIn(request, AUTH_SECRET)) return new Response(null, { headers: { 'x-middleware-next': '1' } });   // let the request through
  return page();
}
