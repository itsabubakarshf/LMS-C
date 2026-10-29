/* app.js — navigation, lesson rendering, progress tracking */
(function () {
'use strict';
const { LESSONS, CHEAT, TEMPLATES } = COURSE;
const { el, highlight, esc, store } = Lab;
const $ = s => document.querySelector(s);
const main = $('#main'), nav = $('#nav');
const TOTAL_MIN = LESSONS.reduce((a, l) => a + l.min, 0);
const isDone = id => store.get('lesson.' + id) === '1';

/* ---------------------------------------------------------------- theme + tutor */
function setTheme(t) { document.documentElement.dataset.theme = t; store.set('theme', t); }
setTheme(store.get('theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
$('#themeBtn').onclick = () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
const ft = $('#fastToggle'); ft.checked = store.get('fast') !== '0'; document.body.classList.toggle('fast', ft.checked); ft.onchange = () => { document.body.classList.toggle('fast', ft.checked); store.set('fast', ft.checked ? '1' : '0'); };
const tt = $('#tutorToggle');
tt.checked = store.get('tutor') === '1'; document.body.classList.toggle('tutor', tt.checked);
tt.onchange = () => { document.body.classList.toggle('tutor', tt.checked); store.set('tutor', tt.checked ? '1' : '0'); };
if (/^https?:$/.test(location.protocol) && !/localhost|127\.0\.0\.1/.test(location.hostname)) { const so = el('a', 'icon-btn', '⎋'); so.href = '/__logout'; so.title = 'Sign out'; so.setAttribute('aria-label', 'Sign out'); so.style.cssText = 'display:grid;place-items:center;text-decoration:none'; $('#themeBtn').after(so); }
$('#menuBtn').onclick = () => document.body.classList.toggle('navopen');
$('#scrim').onclick = () => document.body.classList.remove('navopen');

function toast(msg) { const t = el('div', 'toast', msg); document.body.appendChild(t); setTimeout(() => t.remove(), 2600); }
Lab.create.onDone = () => toast('🎉 Task complete! Nice work.');

/* ---------------------------------------------------------------- nav + progress */
const TRACKS = [
  ['⚡ Quick tour', 'you already know most of this', ['how', 'hello', 'types', 'ops', 'if', 'loops', 'func']],
  ['🔥 The important C stuff', 'where C really differs', ['headers', 'arrays', 'addr', 'ptr', 'structs', 'struct', 'dptr', 'list']],
  ['🪟 Windows', '', ['win']],
  ['🏁 Wrap-up', '', ['done']],
];
const SKIM = ['ops', 'if', 'loops'];
function renderNav(route) {
  const doneCount = LESSONS.filter(l => isDone(l.id)).length;
  const doneMin = LESSONS.filter(l => isDone(l.id)).reduce((a, l) => a + l.min, 0);
  $('#progBar').style.width = (doneCount / LESSONS.length * 100) + '%';
  $('#progTxt').textContent = doneCount + ' / ' + LESSONS.length + ' lessons';
  const A = (href, on, num, label, extra) => '<a href="' + href + '" class="' + on + '"><span class="num">' + num + '</span>' + label + (extra || '') + '</a>';
  let h = A('#/start', route === 'start' ? 'on' : '', '★', 'Start here') + A('#/gd2c', route === 'gd2c' ? 'on' : '', '⇄', 'GDScript → C cheat sheet');
  TRACKS.forEach(([name, sub, ids]) => {
    h += '<h6>' + name + (sub ? ' <span class="subh">· ' + sub + '</span>' : '') + '</h6>';
    ids.forEach(id => { const i = LESSONS.findIndex(l => l.id === id); if (i < 0) return; const l = LESSONS[i];
      h += A('#/lesson/' + l.id, (route === 'lesson/' + l.id ? 'on ' : '') + (isDone(l.id) ? 'done' : ''), isDone(l.id) ? '✓' : i + 1, esc(l.title), '<span class="min">' + (SKIM.includes(l.id) ? '⚡ ' : '') + l.min + '′</span>'); });
  });
  h += '<h6>Tools</h6>' + A('#/play', route === 'play' ? 'on' : '', '⌨', 'Playground') + A('#/cheat', route === 'cheat' ? 'on' : '', '📋', 'C cheat sheet') + A('#/glossary', route === 'glossary' ? 'on' : '', '📖', 'Glossary') + A('#/exam', route === 'exam' ? 'on' : '', '🎓', 'Final exam' + (store.get('exam.best') ? ' · ' + store.get('exam.best') + '%' : '')) + A('#/session', route === 'session' ? 'on' : '', '⏱', '1-hour session plan');
  h += '<h6>Course</h6><a href="#" id="resetAll" style="color:var(--muted)"><span class="num">↺</span>Reset my progress</a>';
  nav.innerHTML = h;
  const r = $('#resetAll'); if (r) r.onclick = e => { e.preventDefault(); if (confirm('Erase all progress, quiz answers and saved code on this browser?')) { try { Object.keys(localStorage).filter(k => k.startsWith('cq.')).forEach(k => localStorage.removeItem(k)); } catch (_) {} location.hash = '#/start'; location.reload(); } };
}

/* ---------------------------------------------------------------- blocks */
function callout(cls, ico, title, h) { return el('div', 'callout ' + cls, '<div class="ico">' + ico + '</div><div><h4>' + title + '</h4><div>' + h + '</div></div>'); }

function quizBlock(lesson, qs, qid, title) {
  const wrap = el('div', 'quiz'); wrap.appendChild(el('h2', '', title || '🧠 Quick check'));
  const score = el('p', 'muted small');
  const upd = () => { let a = 0, c = 0; qs.forEach((q, i) => { const v = store.get('quiz.' + lesson.id + '.' + qid + '.' + i); if (v !== null) { a++; if (+v === q.a) c++; } }); score.textContent = a ? 'Score: ' + c + ' / ' + qs.length + (a < qs.length ? ' (answered ' + a + ')' : (c === qs.length ? ' — perfect! 🌟' : '')) : ''; };
  qs.forEach((q, qi) => {
    const key = 'quiz.' + lesson.id + '.' + qid + '.' + qi;
    const box = el('div', 'q'); box.appendChild(el('div', 'qt', (qi + 1) + '. ' + esc(q.q)));
    if (q.code) { const pre = el('pre', 'mono small qcode', highlight(q.code)); pre.style.cssText = 'margin:6px 0 10px;padding:10px 14px;border-radius:10px;background:var(--code-bg);border:1px solid var(--line);overflow:auto'; box.appendChild(pre); }
    const btns = q.o.map((o, oi) => { const b = el('button', 'opt', esc(o)); b.onclick = () => choose(oi, true); box.appendChild(b); return b; });
    const why = el('div', 'why', '💡 ' + q.why); box.appendChild(why);
    if (q.code && q.run !== false) { const rb = el('button', 'btn sm', '▶ Run it and see'); rb.style.marginTop = '8px'; const outp = el('pre', 'console', ''); outp.style.cssText = 'margin:8px 0 0;max-height:140px;font-size:12.5px'; rb.onclick = () => { const r = CInterp.run(q.code, { trace: false }); outp.textContent = r.phase === 'compile' ? 'error: ' + r.errors[0].msg : r.stdout + (r.ok === false ? '\n💥 ' + r.error : ''); }; box.appendChild(rb); box.appendChild(outp); }
    function choose(oi, save) {
      btns.forEach((b, i) => { b.disabled = true; if (i === q.a) b.classList.add('right'); else if (i === oi) b.classList.add('wrong'); });
      box.classList.add('answered'); if (save) store.set(key, String(oi)); upd();
    }
    const saved = store.get(key); if (saved !== null) choose(+saved, false);
    wrap.appendChild(box);
  });
  wrap.appendChild(score); upd(); return wrap;
}

function defsBlock(defs, title) {
  const d = el('div', 'defs'); d.appendChild(el('h2', '', title || '📖 Key terms'));
  const g = el('div', 'dgrid');
  defs.forEach(x => g.appendChild(el('div', 'dcard', '<b>' + x[0] + '</b><p>' + x[1] + '</p>')));
  d.appendChild(g); return d;
}

function exampleBlock(b) {
  const wrap = el('div', 'example');
  wrap.appendChild(el('h2', '', '🌍 Real-life example: ' + esc(b.title)));
  if (b.why) wrap.appendChild(el('p', '', b.why));
  wrap.appendChild(Lab.create({ id: b.id, title: b.title, icon: '🌍', code: b.code, stdin: b.stdin, noBadge: true, hint: b.hint, maxRows: 26 }));
  if (b.after) wrap.appendChild(el('p', 'muted small', '💬 ' + b.after));
  return wrap;
}

function fold(summary, node, open) {
  const d = el('details', 'fold'); if (open) d.open = true;
  d.appendChild(el('summary', '', summary)); const body = el('div', 'foldbody'); body.appendChild(node); d.appendChild(body); return d;
}

function renderBlock(lesson, b, idx) {
  switch (b.t) {
    case 'html': return el('div', 'html', b.h);
    case 'real': return callout('real', '🍳', 'Real-life picture', b.h);
    case 'gd': return callout('gd', '🎮', 'Coming from GDScript', b.h);
    case 'warn': return callout('warn', '⚠️', 'Watch out', b.h);
    case 'tutor': return callout('tutor', '🎓', 'Tutor notes (only visible with the switch on)', b.h);
    case 'cmp': {
      const d = el('div', 'compare');
      [b.a, b.b].forEach(x => d.appendChild(el('div', '', '<h5>' + x[0] + '</h5><pre>' + highlight(x[1]) + '</pre><p>' + x[2] + '</p>')));
      return d;
    }
    case 'widget': return Widgets[b.w]();
    case 'lab': return Lab.create(b);
    case 'quiz': {
      const q = quizBlock(lesson, b.qs, idx, b.title);
      return b.title && /Challenge/.test(b.title) ? fold('🔥 Challenge round <span class="muted">· ' + b.qs.length + ' harder questions</span>', q, false) : q;
    }
    case 'defs': return fold('📖 Key terms <span class="muted">· ' + b.defs.length + ' definitions</span>', defsBlock(b.defs, ''), false);
    case 'example': return fold('🌍 Example: ' + esc(b.title) + ' <span class="muted">· run it, tweak it</span>', exampleBlock(b), false);
  }
  return el('div');
}

/* ---------------------------------------------------------------- pages */
function lessonPage(id) {
  const i = LESSONS.findIndex(l => l.id === id); if (i < 0) return startPage();
  const l = LESSONS[i];
  const nL = l.blocks.filter(b => b.t === 'lab').length, nQ = l.blocks.filter(b => b.t === 'quiz').reduce((a, q) => a + q.qs.length, 0);
  main.innerHTML = '';
  const tr = TRACKS.find(t => t[2].includes(l.id));
  main.appendChild(el('div', 'lhead', '<div class="crumbs">Lesson ' + (i + 1) + ' of ' + LESSONS.length + (tr ? ' · ' + tr[0] : '') + '</div><h1>' + l.icon + ' ' + esc(l.title) + '</h1><p class="sub">' + esc(l.sub) + ' <span class="muted">· ' + l.min + ' min · ' + nL + ' tasks · ' + nQ + ' questions</span></p>'));
  if (SKIM.includes(l.id)) main.appendChild(el('div', 'skim', '⚡ <b>Skim lesson.</b> You know this from GDScript — read the <i>GDScript vs C</i> box for the syntax differences, do the lab, move on.'));
  const jump = el('div', 'jump'); main.appendChild(jump);
  main.appendChild(fold('🎯 What you will learn', el('ul', 'goals', l.goals.map(g => '<li>' + esc(g) + '</li>').join('')), false));
  const secs = [];
  l.blocks.forEach((b, k) => { const node = renderBlock(l, b, k); main.appendChild(node);
    let label = null, icon = '';
    if (b.t === 'widget') { const hd = node.querySelector('header span'); label = hd ? hd.textContent : null; icon = ''; }
    else if (b.t === 'lab') { label = '🧪 ' + (b.title || 'Task'); }
    else if (b.t === 'quiz' && !(b.title && /Challenge/.test(b.title))) label = '🧠 Quiz';
    if (label) { const id = 'sec' + k; node.id = id; secs.push([id, label]); } });
  secs.slice(0, 14).forEach(([sid, label]) => { const a = el('a', 'pill', esc(label.length > 34 ? label.slice(0, 32) + '…' : label)); a.href = '#'; a.onclick = e => { e.preventDefault(); const t = document.getElementById(sid); if (t) { const y = t.getBoundingClientRect().top + window.scrollY - 118; window.scrollTo({ top: y, behavior: 'smooth' }); } }; jump.appendChild(a); });
  if (!secs.length) jump.remove();
  const fin = el('div', 'finish');
  const btn = el('button', 'btn primary'); const lab = el('span', 'muted');
  const paint = () => { const d = isDone(l.id); btn.textContent = d ? '✓ Completed — undo' : '✔ Mark lesson complete'; btn.className = 'btn ' + (d ? '' : 'primary'); lab.textContent = d ? 'Great job!' : 'When you finish the tasks and the quiz.'; };
  btn.onclick = () => { store.set('lesson.' + l.id, isDone(l.id) ? '0' : '1'); paint(); renderNav('lesson/' + l.id); if (isDone(l.id)) toast('✅ Lesson ' + (i + 1) + ' complete!'); };
  paint(); fin.append(btn, lab); main.appendChild(fin);
  const pg = el('div', 'pager');
  const prev = i > 0 ? LESSONS[i - 1] : null, next = i < LESSONS.length - 1 ? LESSONS[i + 1] : null;
  pg.innerHTML = (prev ? '<a class="btn" href="#/lesson/' + prev.id + '">← ' + esc(prev.title) + '</a>' : '<a class="btn" href="#/start">← Start</a>') + (next ? '<a class="btn primary" href="#/lesson/' + next.id + '">' + esc(next.title) + ' →</a>' : '<a class="btn primary" href="#/play">Open the Playground →</a>');
  main.appendChild(pg);
  document.title = l.title + ' · C Quest';
}

function startPage() {
  main.innerHTML = '';
  const tmin = ids => ids.reduce((a, id) => a + ((LESSONS.find(l => l.id === id) || { min: 0 }).min), 0);
  const trackCard = (t, i) => '<a class="lcard" href="#/lesson/' + t[2][0] + '"><div class="em">' + t[0].split(' ')[0] + '</div><b>' + t[0].replace(/^\S+\s/, '') + '</b><span>' + (t[1] || '') + '</span><span class="small"> ' + t[2].length + ' lesson' + (t[2].length > 1 ? 's' : '') + ' · ~' + tmin(t[2]) + ' min</span></a>';
  main.appendChild(el('div', '', `
  <div class="hero"><h1>Learn C — then talk to Windows.</h1>
  <p class="lead">You already program in GDScript, so this course skips the “what is a variable” part. It shows what C does differently — memory, pointers, headers — and ends with real Windows API calls. Every lesson is: a short idea → a diagram you can play with → tasks with hints and solutions.</p>
  <div class="row"><a class="btn primary" href="#/lesson/how">Start the quick tour →</a><a class="btn" href="#/lesson/addr">Jump to pointers</a><a class="btn" href="#/gd2c">⇄ GDScript → C cheat sheet</a></div></div>
  <h2>Your path</h2><div class="lcards">${TRACKS.map(trackCard).join('')}</div>
  <h2>Tools</h2><div class="row"><a class="btn" href="#/play">⌨ Playground</a><a class="btn" href="#/cheat">📋 C cheat sheet</a><a class="btn" href="#/glossary">📖 Glossary</a><a class="btn" href="#/exam">🎓 Final exam</a><a class="btn" href="#/session">⏱ 1-hour session plan</a></div>
  <div class="callout tutor"><div class="ico">🎓</div><div><h4>Tutor guide: first session</h4>
    <p><b>1. Get to know him (10 min)</b> — what he wants to build; why the Windows API; agree weekday time slots.</p>
    <p><b>2. Tools (15 min)</b> — Visual Studio or MinGW; hello world; read compiler errors.</p>
    <p><b>3. Core C (30 min)</b> — types and sizes, main, no garbage collector, pointers as addresses.</p>
    <p><b>4. Windows win (10 min)</b> — <code>MessageBoxA</code>, then the roadmap. Short explanation → he types; he shares his screen.</p></div></div>`));
  const setup = el('div', '', '<div class="grid2"><div class="card" style="margin:0"><h3 style="margin-top:0">Visual Studio Community</h3><ol class="goals small"><li>Install it and tick <b>“Desktop development with C++”</b>.</li><li>New <b>Console App</b>, rename the file to <code>main.c</code>.</li><li><kbd>Ctrl</kbd>+<kbd>F5</kbd> builds and runs.</li></ol></div><div class="card" style="margin:0"><h3 style="margin-top:0">MinGW-w64 (gcc)</h3><ol class="goals small"><li>Install MSYS2, then <code>pacman -S mingw-w64-ucrt-x86_64-gcc</code>.</li><li><code>gcc main.c -o main.exe</code></li><li><code>./main.exe</code></li></ol></div></div>');
  main.appendChild(fold('🧰 Set up a real compiler at home', setup, false));
  const all = el('div', 'lcards'); LESSONS.forEach((l, i) => { const a = el('a', 'lcard' + (isDone(l.id) ? ' done' : ''), '<div class="em">' + l.icon + '</div><b>' + (i + 1) + '. ' + esc(l.title) + '</b><span>' + esc(l.sub) + ' · ' + l.min + ' min' + (isDone(l.id) ? ' · ✓' : '') + '</span>'); a.href = '#/lesson/' + l.id; all.appendChild(a); });
  main.appendChild(fold('📚 All ' + LESSONS.length + ' lessons (' + TOTAL_MIN + ' min in total)', all, false));
  document.title = 'C Quest — Learn C and the Windows API';
}

function gd2cPage() {
  const R = [
    ['Variable', 'var hp = 100', 'int hp = 100;', 'Type is mandatory and fixed.'],
    ['Constant', 'const MAX = 10', '#define MAX 10', 'or <code>const int MAX = 10;</code>'],
    ['Print', 'print("hp: ", hp)', 'printf("hp: %d\\n", hp);', 'Format specifiers; you add <code>\\n</code>.'],
    ['String', 'var s = "Hi"', 'char s[] = "Hi";', 'An array of chars ending with <code>\\0</code>. No + concatenation, no ==.'],
    ['if / elif', 'if a: … elif b: … else: …', 'if (a) { … } else if (b) { … } else { … }', 'Parentheses and braces.'],
    ['for loop', 'for i in range(5):', 'for (int i = 0; i < 5; i++) { }', 'Start; condition; step.'],
    ['match', 'match x: 1: …', 'switch (x) { case 1: …; break; }', 'Needs <code>break</code>.'],
    ['Function', 'func add(a, b): return a + b', 'int add(int a, int b) { return a + b; }', 'Types everywhere; declare before use (prototype).'],
    ['Array', 'var a = [1, 2, 3]; a.append(4)', 'int a[3] = {1, 2, 3};', 'Fixed size, no bounds check. Growable = malloc/realloc.'],
    ['Dictionary', 'var d = {"a": 1}', '— none —', 'You build it (struct array / hash table).'],
    ['Class / Node', 'class Player: var hp', 'typedef struct { int hp; } Player;', 'Data only. Functions are separate.'],
    ['null', 'null', 'NULL', 'Only for pointers; dereferencing it crashes.'],
    ['Signal / callable', 'signal hit; connect(f)', 'a function pointer / callback', 'e.g. <code>WndProc</code> in Win32.'],
    ['import', 'preload("res://u.gd")', '#include "u.h"', 'Text pasting + a linker step.'],
    ['Objects are references', 'automatic', 'pointers: <code>Player *p = &amp;hero;</code>', 'You choose copy or pointer every time.'],
    ['Memory', 'reference-counted', 'malloc / free by hand', 'Forget free → leak. Use after free → bug.'],
    ['Errors', 'engine shows a message', 'return codes, <code>GetLastError()</code>, crashes', 'No exceptions in C.'],
  ];
  main.innerHTML = '<h1>⇄ GDScript → C cheat sheet</h1><p class="lead">The 17 things that map directly — and the 5 that will surprise you.</p>' +
    '<div class="tablewrap"><table class="t cmpt"><tr><th>Idea</th><th>GDScript</th><th>C</th><th>Note</th></tr>' + R.map(r => '<tr><td><b>' + r[0] + '</b></td><td><code>' + esc(r[1]) + '</code></td><td><code>' + (r[2].includes('<code>') ? r[2] : esc(r[2])) + '</code></td><td class="small muted">' + r[3] + '</td></tr>').join('') + '</table></div>' +
    '<h2>The 5 big surprises</h2><div class="grid2">' + [['1 · Compile + link', 'Errors come from two tools before the program ever runs.', 'how'], ['2 · No safety net', 'Out-of-range index, bad pointer, overflow: C says nothing.', 'types'], ['3 · Manual memory', 'You malloc and free. The heap is yours.', 'struct'], ['4 · Strings are char arrays', 'Ending in <code>\\0</code>. Compare with strcmp.', 'arrays'], ['5 · Pointers everywhere', 'Addresses, *, &, ->, **, linked lists.', 'addr']].map(x => '<a class="lcard" href="#/lesson/' + x[2] + '"><b>' + x[0] + '</b><span>' + x[1] + '</span></a>').join('') + '</div>';
  document.title = 'GDScript → C · C Quest';
}

function playPage() {
  main.innerHTML = '<h1>⌨ Playground</h1><p class="lead">Write anything. Your code is saved in this browser.</p>';
  const sel = el('select', 'field'); sel.innerHTML = Object.keys(TEMPLATES).map(k => '<option>' + k + '</option>').join('');
  const row = el('div', 'row', '<label class="small muted">Load an example:</label>'); row.appendChild(sel); main.appendChild(row);
  const lab = Lab.create({ id: 'playground', title: 'Free playground', icon: '⌨', code: TEMPLATES['Hello World'], showStdin: true, stdin: '', maxRows: 30, minRows: 14 });
  sel.onchange = () => lab._lab.setCode(TEMPLATES[sel.value].replace(/^\n/, ''));
  main.appendChild(lab);
  main.appendChild(el('div', 'callout warn', '<div class="ico">ℹ️</div><div><h4>What the mini-compiler supports</h4><p class="small">int/char/float/double/long long, pointers, arrays, structs, enums, typedef, #define (including macros with arguments), if/for/while/do/switch, functions and recursion, stdio/stdlib/string/math/ctype basics, and a few Win32 functions. Not supported: function pointers, goto, unions with initialisers, floating-point <code>%e</code> edge cases, real windows.</p></div>'));
  document.title = 'Playground · C Quest';
}

function glossaryPage() {
  main.innerHTML = '<h1>📖 Glossary</h1><p class="lead">Every key term from the course in one place. Type to filter.</p>';
  const inp = el('input', 'field'); inp.placeholder = 'search terms…'; inp.style.cssText = 'width:100%;max-width:420px;margin:6px 0 16px'; main.appendChild(inp);
  const g = el('div', 'dgrid'); main.appendChild(g);
  const all = []; LESSONS.forEach((l, i) => (COURSE.DEFS[l.id] || []).forEach(d => all.push({ t: d[0], d: d[1], l: i + 1 })));
  all.sort((a, b) => a.t.replace(/<[^>]+>/g, '').toLowerCase().localeCompare(b.t.replace(/<[^>]+>/g, '').toLowerCase()));
  const draw = () => { const q = inp.value.toLowerCase(); g.innerHTML = ''; all.filter(x => !q || (x.t + ' ' + x.d).toLowerCase().includes(q)).forEach(x => g.appendChild(el('div', 'dcard', '<b>' + x.t + '</b> <span class="muted small">· lesson ' + x.l + '</span><p>' + x.d + '</p>'))); };
  inp.oninput = draw; draw(); document.title = 'Glossary · C Quest';
}

function examPage() {
  main.innerHTML = '<h1>🎓 Final exam</h1><p class="lead">30 random questions from every lesson, shuffled each time. Answer everything, then press <b>Submit</b>. Your best score is saved.</p>';
  const pool = [];
  LESSONS.forEach((l, li) => l.blocks.filter(b => b.t === 'quiz').forEach(qb => qb.qs.forEach(q => pool.push({ q, li }))));
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const N = Math.min(30, pool.length);
  const picked = shuffle(pool).slice(0, N).map(p => { const idx = shuffle(p.q.o.map((_, i) => i)); return { q: p.q, li: p.li, order: idx, right: idx.indexOf(p.q.a), chosen: -1 }; });
  const list = el('div'); main.appendChild(list);
  picked.forEach((p, i) => {
    const box = el('div', 'q'); box.appendChild(el('div', 'qt', (i + 1) + '. ' + esc(p.q.q)));
    if (p.q.code) { const pre = el('pre', 'mono small', highlight(p.q.code)); pre.style.cssText = 'margin:6px 0 10px;padding:10px 14px;border-radius:10px;background:var(--code-bg);border:1px solid var(--line);overflow:auto'; box.appendChild(pre); }
    p.btns = p.order.map((oi, k) => { const b = el('button', 'opt', esc(p.q.o[oi])); b.onclick = () => { if (p.done) return; p.chosen = k; p.btns.forEach((x, j) => x.style.outline = j === k ? '2px solid var(--accent)' : ''); upd(); }; box.appendChild(b); return b; });
    p.why = el('div', 'why', '💡 ' + p.q.why); box.appendChild(p.why); p.box = box; list.appendChild(box);
  });
  const bar = el('div', 'finish'); const sub = el('button', 'btn primary', 'Submit exam'); const prog = el('span', 'muted', '0 / ' + N + ' answered'); bar.append(sub, prog); main.appendChild(bar);
  const res = el('div'); main.appendChild(res);
  function upd() { prog.textContent = picked.filter(p => p.chosen >= 0).length + ' / ' + N + ' answered'; }
  sub.onclick = () => {
    if (sub.dataset.done) { examPage(); window.scrollTo(0, 0); return; }
    const un = picked.filter(p => p.chosen < 0).length;
    if (un && !confirm(un + ' question(s) are unanswered and will count as wrong. Submit anyway?')) return;
    let c = 0; const weak = {};
    picked.forEach(p => { p.done = true; p.btns.forEach((b, k) => { b.disabled = true; b.style.outline = ''; if (k === p.right) b.classList.add('right'); else if (k === p.chosen) b.classList.add('wrong'); }); p.box.classList.add('answered'); if (p.chosen === p.right) c++; else weak[p.li] = (weak[p.li] || 0) + 1; });
    const pct = Math.round(c / N * 100); const best = Math.max(pct, +(store.get('exam.best') || 0)); store.set('exam.best', String(best));
    const grade = pct >= 90 ? ['🏆', 'Outstanding!'] : pct >= 75 ? ['🌟', 'Great job!'] : pct >= 60 ? ['👍', 'Solid — review the topics below.'] : ['📚', 'Keep going — revisit the lessons below and retake.'];
    res.innerHTML = '<div class="card" style="text-align:center"><div style="font-size:3rem">' + grade[0] + '</div><h2 style="margin:.2em 0">' + c + ' / ' + N + ' · ' + pct + '%</h2><p>' + grade[1] + ' Best so far: <b>' + best + '%</b></p>' +
      (Object.keys(weak).length ? '<p class="small">Review: ' + Object.keys(weak).map(k => '<a href="#/lesson/' + LESSONS[k].id + '">' + esc(LESSONS[k].title) + '</a> (' + weak[k] + ' missed)').join(' · ') + '</p>' : '<p>No misses at all!</p>') + '</div>';
    sub.textContent = '↺ New exam'; sub.dataset.done = '1'; res.scrollIntoView({ behavior: 'smooth' }); renderNav('exam');
  };
  document.title = 'Final exam · C Quest';
}

function sessionPage() {
  const AG = [
    [5, 'Welcome and goals', '#/start', ['What do you want to build with C — a game, a tool, or understanding how Windows works?', 'Quick level check: have you used a compiler? What is hexadecimal? What did you do in x64?', 'Agree the weekday time slot for the next sessions.'], 'Share your screen. Keep explanations short, then he types.'],
    [10, 'How C runs: compiler, linker, first program', '#/lesson/how', ['Play the compiler & linker diagram with “math.c forgotten”.', 'Open “inside an object file” and press Link.', 'Run the first lab together.'], 'Skip the race animation if short on time.'],
    [10, 'Hello World and reading compiler errors', '#/lesson/hello', ['Anatomy diagram: hover each part.', 'Lab “Fix the broken program” — he drives, you only point.', 'Say it aloud: read the first error, then look at the line above.'], 'This is the most valuable skill of day one.'],
    [15, 'Variables and types', '#/lesson/types', ['Type sizes, then the “click the bits” byte (255 + 1, then 127 in a char).', 'Lab: the uninitialised garbage value (step through).', 'Lab: overflow challenge.'], 'Bridge to his x64: little-endian bytes = the debugger’s memory view.'],
    [8, 'Decisions and loops, fast', '#/lesson/loops', ['Flowchart for if/else (slide hp), then the for-loop flowchart.', 'Lab: 3 times table (step through).'], 'If behind, do only the loop flowchart and the times table.'],
    [9, 'The Windows wow moment', '#/lesson/win', ['Read the MessageBoxA signature with the API reader.', 'Lab: show a message box with a title and an icon.', 'Show the message-loop diagram for 2 minutes as a teaser.'], 'Finish here even if you skipped earlier parts — motivation matters.'],
    [3, 'Wrap-up', '#/lesson/done', ['“What was clearest? What was muddiest?” — write both down.', 'Give the homework (below).', 'Book the next session: pointers, arrays and structs.'], ''],
  ];
  const tot = AG.reduce((a, x) => a + x[0], 0);
  main.innerHTML = '<h1>⏱ Today’s 1-hour session</h1><p class="lead">A minute-by-minute plan for a first live lesson. Start the timer when you begin; tick each block when done.</p>' +
    '<div class="card"><div class="row sp"><div><b>Elapsed:</b> <span id="tm" style="font:700 1.6rem var(--mono)">00:00</span> <span class="muted">/ ' + tot + ':00</span></div><div class="row"><button class="btn primary" id="tgo">▶ Start</button><button class="btn" id="trs">Reset</button></div></div><div class="bar" style="width:100%;margin-top:10px;height:10px"><i id="tbar"></i></div></div>' +
    '<div class="callout real"><div class="ico">✅</div><div><h4>Before the call (5 minutes)</h4><div class="small"><ul class="goals"><li>Open this site and sign in; test screen-sharing.</li><li>Ask the student to open the same link, or to install <b>Visual Studio Community</b> beforehand (“Desktop development with C++”). Not required today — the in-browser compiler is enough.</li><li>Have a glass of water and the lesson order ready: 1 → 2 → 3 → 6 → 11.</li></ul></div></div></div><div class="agenda"></div>' +
    '<h2>🎯 If you finish early</h2><ul class="goals"><li>Operators and printf playground (lesson 4): integer division trap, <code>%d %f %s %c</code>.</li><li>Functions (lesson 7): the “swap that does not swap” lab, as a cliff-hanger for pointers.</li><li>The “my code doesn’t work” troubleshooting flowchart (lesson 2).</li></ul>' +
    '<h2>📝 Homework (small)</h2><ol class="goals"><li>Redo the Hello World and message-box labs without looking at the solution.</li><li>Write a program that prints your name, age and favourite game with <code>printf</code> and variables.</li><li>Install Visual Studio Community or MinGW-w64 and compile hello world on his own PC (steps on the Start page).</li><li>Finish lesson 1 and 2 quizzes (Challenge rounds) and note anything confusing.</li></ol>' +
    '<h2>🔭 Next session</h2><p>Arrays and strings → pointers → structs and malloc → a first real Win32 window. All of it is already in the course.</p>';
  const ag = main.querySelector('.agenda'); let t0 = 0;
  AG.forEach((x, i) => { const start = t0; t0 += x[0];
    const key = 'sess.' + i; const d = el('div', 'card agitem');
    d.innerHTML = '<div class="row sp"><label style="display:flex;gap:10px;align-items:center;cursor:pointer"><input type="checkbox" ' + (store.get(key) === '1' ? 'checked' : '') + '><b>' + String(start).padStart(2, '0') + '–' + String(t0).padStart(2, '0') + ' min · ' + x[1] + '</b></label><a class="btn sm" href="' + x[2] + '">Open ➜</a></div><ul class="goals small" style="margin-top:8px">' + x[3].map(q => '<li>' + q + '</li>').join('') + '</ul>' + (x[4] ? '<div class="muted small">💡 ' + x[4] + '</div>' : '');
    d.dataset.s = start; d.dataset.e = t0; d.querySelector('input').onchange = e => store.set(key, e.target.checked ? '1' : '0'); ag.appendChild(d); });
  let sec = 0, tmr = null; const tm = $('#tm'), bar = $('#tbar'), go = $('#tgo');
  const paint = () => { const m = Math.floor(sec / 60); tm.textContent = String(m).padStart(2, '0') + ':' + String(sec % 60).padStart(2, '0'); bar.style.width = Math.min(100, sec / (tot * 60) * 100) + '%'; ag.querySelectorAll('.agitem').forEach(d => { const on = m >= +d.dataset.s && m < +d.dataset.e && (tmr || sec > 0); d.style.borderColor = on ? 'var(--accent)' : ''; d.style.boxShadow = on ? '0 0 0 3px color-mix(in srgb,var(--accent) 25%,transparent)' : ''; }); };
  go.onclick = () => { if (tmr) { clearInterval(tmr); tmr = null; go.textContent = '▶ Resume'; } else { tmr = setInterval(() => { if (!document.body.contains(tm)) { clearInterval(tmr); return; } sec++; paint(); }, 1000); go.textContent = '⏸ Pause'; } paint(); };
  $('#trs').onclick = () => { clearInterval(tmr); tmr = null; sec = 0; go.textContent = '▶ Start'; paint(); };
  paint(); document.title = 'Session plan · C Quest';
}
function cheatPage() { main.innerHTML = CHEAT; document.title = 'Cheat sheet · C Quest'; }

/* ---------------------------------------------------------------- router */
function route() {
  const h = (location.hash || '#/start').replace(/^#\/?/, '');
  document.body.classList.remove('navopen');
  const [kind, arg] = h.split('/');
  if (kind === 'lesson') lessonPage(arg); else if (kind === 'play') playPage(); else if (kind === 'cheat') cheatPage(); else if (kind === 'glossary') glossaryPage(); else if (kind === 'session') sessionPage(); else if (kind === 'gd2c') gd2cPage(); else if (kind === 'exam') examPage(); else startPage();
  renderNav(kind === 'lesson' ? 'lesson/' + arg : kind || 'start');
  window.scrollTo(0, 0); main.focus({ preventScroll: true });
}
window.addEventListener('hashchange', route);
route();
})();
