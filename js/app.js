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
const tt = $('#tutorToggle');
tt.checked = store.get('tutor') === '1'; document.body.classList.toggle('tutor', tt.checked);
tt.onchange = () => { document.body.classList.toggle('tutor', tt.checked); store.set('tutor', tt.checked ? '1' : '0'); };
$('#menuBtn').onclick = () => document.body.classList.toggle('navopen');
$('#scrim').onclick = () => document.body.classList.remove('navopen');

function toast(msg) { const t = el('div', 'toast', msg); document.body.appendChild(t); setTimeout(() => t.remove(), 2600); }
Lab.create.onDone = () => toast('🎉 Task complete! Nice work.');

/* ---------------------------------------------------------------- nav + progress */
function renderNav(route) {
  const doneCount = LESSONS.filter(l => isDone(l.id)).length;
  const doneMin = LESSONS.filter(l => isDone(l.id)).reduce((a, l) => a + l.min, 0);
  $('#progBar').style.width = (doneCount / LESSONS.length * 100) + '%';
  $('#progTxt').textContent = doneCount + ' / ' + LESSONS.length + ' · ' + doneMin + '/' + TOTAL_MIN + ' min';
  let h = '<a href="#/start" class="' + (route === 'start' ? 'on' : '') + '"><span class="num">★</span>Start here</a><h6>Lessons · ' + TOTAL_MIN + ' minutes</h6>';
  LESSONS.forEach((l, i) => { h += '<a href="#/lesson/' + l.id + '" class="' + (route === 'lesson/' + l.id ? 'on ' : '') + (isDone(l.id) ? 'done' : '') + '"><span class="num">' + (isDone(l.id) ? '✓' : i + 1) + '</span>' + esc(l.title) + '<span class="min">' + l.min + '′</span></a>'; });
  h += '<h6>Tools</h6><a href="#/play" class="' + (route === 'play' ? 'on' : '') + '"><span class="num">⌨</span>Playground</a><a href="#/cheat" class="' + (route === 'cheat' ? 'on' : '') + '"><span class="num">📋</span>Cheat sheet</a>';
  h += '<h6>Course</h6><a href="#" id="resetAll" style="color:var(--muted)"><span class="num">↺</span>Reset my progress</a>';
  nav.innerHTML = h;
  const r = $('#resetAll'); if (r) r.onclick = e => { e.preventDefault(); if (confirm('Erase all progress, quiz answers and saved code on this browser?')) { try { Object.keys(localStorage).filter(k => k.startsWith('cq.')).forEach(k => localStorage.removeItem(k)); } catch (_) {} location.hash = '#/start'; location.reload(); } };
}

/* ---------------------------------------------------------------- blocks */
function callout(cls, ico, title, h) { return el('div', 'callout ' + cls, '<div class="ico">' + ico + '</div><div><h4>' + title + '</h4><div>' + h + '</div></div>'); }

function quizBlock(lesson, qs, qid) {
  const wrap = el('div', 'quiz'); wrap.appendChild(el('h2', '', '🧠 Quick check'));
  const score = el('p', 'muted small');
  const upd = () => { let a = 0, c = 0; qs.forEach((q, i) => { const v = store.get('quiz.' + lesson.id + '.' + qid + '.' + i); if (v !== null) { a++; if (+v === q.a) c++; } }); score.textContent = a ? 'Score: ' + c + ' / ' + qs.length + (a < qs.length ? ' (answered ' + a + ')' : '') : ''; };
  qs.forEach((q, qi) => {
    const key = 'quiz.' + lesson.id + '.' + qid + '.' + qi;
    const box = el('div', 'q'); box.appendChild(el('div', 'qt', (qi + 1) + '. ' + esc(q.q)));
    const btns = q.o.map((o, oi) => { const b = el('button', 'opt', esc(o)); b.onclick = () => choose(oi, true); box.appendChild(b); return b; });
    const why = el('div', 'why', '💡 ' + q.why); box.appendChild(why);
    function choose(oi, save) {
      btns.forEach((b, i) => { b.disabled = true; if (i === q.a) b.classList.add('right'); else if (i === oi) b.classList.add('wrong'); });
      box.classList.add('answered'); if (save) store.set(key, String(oi)); upd();
    }
    const saved = store.get(key); if (saved !== null) choose(+saved, false);
    wrap.appendChild(box);
  });
  wrap.appendChild(score); upd(); return wrap;
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
    case 'quiz': return quizBlock(lesson, b.qs, idx);
  }
  return el('div');
}

/* ---------------------------------------------------------------- pages */
function lessonPage(id) {
  const i = LESSONS.findIndex(l => l.id === id); if (i < 0) return startPage();
  const l = LESSONS[i];
  main.innerHTML = '';
  main.appendChild(el('div', '', '<div class="muted small">Lesson ' + (i + 1) + ' of ' + LESSONS.length + '</div><h1>' + l.icon + ' ' + esc(l.title) + '</h1><p class="lead" style="margin-top:0">' + esc(l.sub) + '</p>' +
    '<div class="meta"><span class="chip">⏱ ' + l.min + ' min</span><span class="chip">🧪 ' + l.blocks.filter(b => b.t === 'lab').length + ' labs</span><span class="chip">🧠 quiz</span></div>' +
    '<div class="card"><b>By the end you can:</b><ul class="goals">' + l.goals.map(g => '<li>' + esc(g) + '</li>').join('') + '</ul></div>'));
  l.blocks.forEach((b, k) => main.appendChild(renderBlock(l, b, k)));
  const fin = el('div', 'finish');
  const btn = el('button', 'btn primary'); const lab = el('span', 'muted');
  const paint = () => { const d = isDone(l.id); btn.textContent = d ? '✓ Completed — undo' : '✔ Mark lesson complete'; btn.className = 'btn ' + (d ? '' : 'primary'); lab.textContent = d ? 'Great job!' : 'When you finish the labs and the quiz.'; };
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
  const segs = LESSONS.map(l => '<a href="#/lesson/' + l.id + '" style="flex:' + l.min + '" title="' + esc(l.title) + ' · ' + l.min + ' min">' + l.icon + '<span>' + l.min + '′</span></a>').join('');
  main.appendChild(el('div', '', `
  <div class="hero"><div class="muted small">A 2-hour hands-on course · no videos, no installs</div>
  <h1>Learn C — then talk to Windows.</h1>
  <p class="lead">You make games in GDScript. This course shows what is going on underneath: memory, pointers, and the Windows API that every Windows program is built on. Every lesson has a real-life picture, a diagram you can play with, and a <b>built-in C compiler</b> that runs right here in the page.</p></div>
  <div class="timeline" aria-label="Two-hour timeline">${segs}</div>
  <p class="muted small" style="margin-top:-6px">The 12 lessons, drawn to scale (${TOTAL_MIN} minutes in total). Click a block to jump to it.</p>
  <div class="grid2" style="margin-top:20px">
    <div class="card" style="margin:0"><h3 style="margin-top:0">🧭 How a lesson works</h3><ol class="goals"><li>Read the short idea and the <b>real-life picture</b>.</li><li>Play with the <b>diagram</b> — click, drag, press run.</li><li>Open the <b>lab</b>: edit real C, press <kbd>Compile &amp; Run</kbd> (or <kbd>Ctrl</kbd>+<kbd>Enter</kbd>).</li><li>Press <b>Step through</b> to watch variables and memory change line by line.</li><li>Answer the quick check, then mark the lesson complete.</li></ol></div>
    <div class="card" style="margin:0"><h3 style="margin-top:0">🔬 About the built-in compiler</h3><p class="small">It is a small C interpreter with a real byte-addressable memory, so <code>sizeof</code>, pointers, overflow, uninitialised variables, <code>malloc</code>/<code>free</code> and crashes behave like real C on 64-bit Windows. It also simulates a few Win32 functions (MessageBox, files, time, heap). It is a learning tool — for real projects you will use Visual Studio or MinGW-w64 (next section).</p></div>
  </div>
  <h2>🧰 Set up a real compiler (do this at home)</h2>
  <div class="grid2">
    <div class="card" style="margin:0"><h3 style="margin-top:0">Option A — Visual Studio Community</h3><ol class="goals small"><li>Download <i>Visual Studio Community</i> (free) from Microsoft.</li><li>In the installer tick <b>“Desktop development with C++”</b>.</li><li>Create a <b>Console App</b> project, rename the file to <code>main.c</code>.</li><li>Press <kbd>Ctrl</kbd>+<kbd>F5</kbd> to build and run.</li></ol><p class="small muted">Best debugger; ideal for the Windows API.</p></div>
    <div class="card" style="margin:0"><h3 style="margin-top:0">Option B — MinGW-w64 (gcc)</h3><ol class="goals small"><li>Install MSYS2 and then <code>pacman -S mingw-w64-ucrt-x86_64-gcc</code>.</li><li>Open the UCRT64 terminal in your folder.</li><li><code>gcc main.c -o main.exe</code></li><li>Run <code>./main.exe</code>. For windows apps add <code>-mwindows</code>.</li></ol><p class="small muted">Lightweight; works well with VS Code.</p></div>
  </div>
  <div class="callout tutor"><div class="ico">🎓</div><div><h4>Tutor guide: running the first session</h4>
    <p><b>1. Get to know the student (10 min)</b> — what do they want to build (game, tool, or understanding Windows)? Why the Windows API (windows &amp; buttons, files, memory, processes)? Agree a weekday time slot and time zone.</p>
    <p><b>2. Tools (15 min)</b> — Visual Studio or MinGW; get hello world compiling; practise reading compiler errors (a new skill coming from GDScript).</p>
    <p><b>3. Core C (30 min)</b> — types and sizes (his x64 helps), functions and main, no garbage collector, first taste of pointers as memory addresses.</p>
    <p><b>4. Quick Windows win (10 min)</b> — <code>MessageBoxA</code>: a popup keeps motivation high. Then show the roadmap.</p>
    <p><b>How to teach:</b> short explanation → he types code. Ask him to share his screen. Small weekly homework. This course covers steps 2–4 in one 2-hour sitting; the lessons’ tutor notes give a minute plan.</p></div></div>
  <h2>📚 All lessons</h2><div class="lcards"></div>`));
  const lc = main.querySelector('.lcards');
  LESSONS.forEach((l, i) => lc.appendChild(el('a', 'lcard' + (isDone(l.id) ? ' done' : ''), '<div class="em">' + l.icon + '</div><b>' + (i + 1) + '. ' + esc(l.title) + '</b><span>' + esc(l.sub) + ' · ' + l.min + ' min' + (isDone(l.id) ? ' · ✓' : '') + '</span>')));
  main.querySelectorAll('.lcard').forEach((a, i) => a.href = '#/lesson/' + LESSONS[i].id);
  main.appendChild(el('div', 'finish', '<a class="btn primary" href="#/lesson/' + LESSONS[0].id + '">Start lesson 1 →</a><span class="muted">First stop: how a C program actually runs.</span>'));
  document.title = 'C Quest — Learn C and the Windows API';
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
function cheatPage() { main.innerHTML = CHEAT; document.title = 'Cheat sheet · C Quest'; }

/* ---------------------------------------------------------------- router */
function route() {
  const h = (location.hash || '#/start').replace(/^#\/?/, '');
  document.body.classList.remove('navopen');
  const [kind, arg] = h.split('/');
  if (kind === 'lesson') lessonPage(arg); else if (kind === 'play') playPage(); else if (kind === 'cheat') cheatPage(); else startPage();
  renderNav(kind === 'lesson' ? 'lesson/' + arg : kind || 'start');
  window.scrollTo(0, 0); main.focus({ preventScroll: true });
}
window.addEventListener('hashchange', route);
route();
})();
