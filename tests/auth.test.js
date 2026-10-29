// Exercises middleware.js directly with Web-standard Request/Response (Node 22).
process.env.AUTH_EMAIL = 'hi@abubakarshf.dev'; process.env.AUTH_PASSWORD = 'thejungle'; process.env.AUTH_SECRET = 'test-secret-123';
const { default: mw } = await import('../middleware.js');
const call = (path, init) => mw(new Request('https://x.test' + path, init));
const form = o => ({ method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(o).toString() });
let bad = 0; const t = (name, ok) => { console.log((ok ? '✅ ' : '❌ ') + name); if (!ok) bad++; };

let r = await call('/'); t('no cookie → login page (401? 200 form)', r.status === 200 && (await r.text()).includes('<form'));
r = await call('/js/lessons.js'); t('static asset also gated', (await r.text()).includes('<form'));
r = await call('/__login', form({ email: 'hi@abubakarshf.dev', password: 'nope' })); t('wrong password → 401', r.status === 401 && (await r.text()).includes('Wrong email or password'));
r = await call('/__login', form({ email: 'other@x.dev', password: 'thejungle' })); t('wrong email → 401', r.status === 401);
r = await call('/__login', form({ email: 'Hi@AbubakarShf.dev', password: 'thejungle' }));
const sc = r.headers.get('set-cookie') || ''; t('right credentials (email case-insensitive) → 303 + HttpOnly Secure cookie', r.status === 303 && /HttpOnly/.test(sc) && /Secure/.test(sc));
const cookie = sc.split(';')[0];
r = await call('/', { headers: { cookie } }); t('valid cookie → passes through', r.headers.get('x-middleware-next') === '1');
const tampered = cookie.replace(/.$/, c => (c === 'a' ? 'b' : 'a')); r = await call('/', { headers: { cookie: tampered } }); t('tampered cookie → login', r.headers.get('x-middleware-next') !== '1');
const [name, val] = cookie.split('='); const [exp, sig] = val.split('.'); r = await call('/', { headers: { cookie: `${name}=${Number(exp) + 99999}.${sig}` } }); t('forged expiry → login', r.headers.get('x-middleware-next') !== '1');
r = await call('/', { headers: { cookie: `${name}=${Math.floor(Date.now() / 1000) - 10}.${sig}` } }); t('expired cookie → login', r.headers.get('x-middleware-next') !== '1');
r = await call('/__logout'); t('logout clears cookie', r.status === 303 && /Max-Age=0/.test(r.headers.get('set-cookie')));
delete process.env.AUTH_SECRET; r = await call('/'); t('missing config fails closed (503)', r.status === 503);
console.log(bad ? `\n${bad} FAILED` : '\nall auth tests passed'); process.exit(bad ? 1 : 0);
