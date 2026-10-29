/* lab.js — the interactive code editor + "compile & run" + step-through visualiser */
(function (root) {
'use strict';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const KW = new Set('if else while for do return break continue switch case default sizeof struct union enum typedef static extern const unsigned signed goto'.split(' '));
const TY = new Set('int char short long float double void _Bool bool size_t DWORD WORD BYTE BOOL HANDLE HWND HINSTANCE LPCSTR LPSTR UINT LONG SYSTEMTIME POINT RECT LRESULT WPARAM LPARAM LPVOID uint8_t uint16_t uint32_t uint64_t int8_t int16_t int32_t int64_t FILE'.split(' '));

function highlight(code) {
  const re = /(\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$))|("(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?)|(^[ \t]*#[^\n]*)|\b(0[xX][0-9a-fA-F]+|\d+\.?\d*(?:[eE][+-]?\d+)?[fFuUlL]*)\b|\b([A-Za-z_]\w*)\b(\s*\()?/gm;
  let out = '', last = 0, m;
  while ((m = re.exec(code))) {
    out += esc(code.slice(last, m.index)); last = re.lastIndex;
    if (m[1]) out += '<span class="cm">' + esc(m[1]) + '</span>';
    else if (m[2]) out += '<span class="st">' + esc(m[2]) + '</span>';
    else if (m[3]) out += '<span class="pp">' + esc(m[3]) + '</span>';
    else if (m[4]) out += '<span class="nu">' + esc(m[4]) + '</span>';
    else {
      const w = m[5];
      if (KW.has(w)) out += '<span class="k">' + w + '</span>' + esc(m[6] || '');
      else if (TY.has(w)) out += '<span class="ty">' + w + '</span>' + esc(m[6] || '');
      else if (m[6]) out += '<span class="fn">' + w + '</span>' + esc(m[6]);
      else out += w;
    }
  }
  return out + esc(code.slice(last));
}

/* friendly explanations for the cryptic messages compilers give */
const EXPLAIN = [
  [/expected ';'/, "C ends every statement with a <b>;</b>. The compiler notices the problem on the <i>next</i> line, so look at the end of the line <u>above</u> the one it points to."],
  [/expected '\)'/, "A bracket was opened with ( but never closed. Count your ( and ) on that line."],
  [/expected '}'/, "A { was opened but never closed. Every { needs a matching }."],
  [/implicit declaration of function '(\w+)'.*#include/, "You called a function from a library you forgot to include. The <code>#include</code> line at the top is how C finds it — like importing a module."],
  [/implicit declaration of function/, "C reads top to bottom. A function must be defined (or have a <b>prototype</b>) <i>above</i> the place you call it."],
  [/'(\w+)' undeclared/, "C doesn't know that name. Did you misspell it, forget to declare it with a type (<code>int x;</code>), or use it outside its { } block?"],
  [/unknown type name/, "C doesn't recognise that type name. Types like <code>bool</code>, <code>DWORD</code> or <code>uint8_t</code> only exist after you #include the right header."],
  [/too (many|few) arguments/, "The number of values you passed doesn't match the function's parameter list."],
  [/redefinition of/, "You declared the same name twice in the same block."],
  [/lvalue required/, "The left side of = must be something that can hold a value, like a variable — not a number or an expression."],
  [/undefined reference to 'main'/, "Every C program starts at <code>int main(void)</code>. Without it the linker has nowhere to start."],
  [/No such file or directory/, "That header doesn't exist. Check the spelling, e.g. <code>#include &lt;stdio.h&gt;</code>."],
  [/function pointers/, "Function pointers are a more advanced topic; this mini-compiler skips them for now."],
];
function explain(msg) { for (const [re, t] of EXPLAIN) if (re.test(msg)) return t; return ''; }

const store = {
  get(k) { try { return localStorage.getItem('cq.' + k); } catch (_) { return null; } },
  set(k, v) { try { localStorage.setItem('cq.' + k, v); } catch (_) {} },
  del(k) { try { localStorage.removeItem('cq.' + k); } catch (_) {} },
};

function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }

function winbox(ev) {
  const f = ev.flags >>> 0, btn = f & 0xF, ic = f & 0xF0;
  const icon = ic === 0x10 ? '❌' : ic === 0x20 ? '❓' : ic === 0x30 ? '⚠️' : ic === 0x40 ? 'ℹ️' : '';
  const labels = [['OK'], ['OK', 'Cancel'], ['Abort', 'Retry', 'Ignore'], ['Yes', 'No', 'Cancel'], ['Yes', 'No'], ['Retry', 'Cancel']][btn] || ['OK'];
  const d = el('div', 'winbox');
  d.innerHTML = '<div class="tb"><span>' + esc(ev.caption) + '</span><i>✕</i></div><div class="bd">' + (icon ? '<div class="ic">' + icon + '</div>' : '') +
    '<div>' + esc(ev.text).replace(/\n/g, '<br>') + '</div></div><div class="bt">' + labels.map(l => '<span>' + l + '</span>').join('') + '</div>';
  return d;
}

function create(cfg) {
  const root = el('div', 'lab');
  const savedKey = 'code.' + cfg.id;
  const multi = Array.isArray(cfg.files) && cfg.files.length > 1;
  const initial = (cfg.code || (cfg.files && cfg.files[0].code) || '').replace(/^\n/, '');
  let code = store.get(savedKey);
  if (code === null || cfg.forceInitial) code = initial;
  const files = multi ? cfg.files.map(f => ({ name: f.name, init: f.code.replace(/^\n/, ''), text: store.get('code.' + cfg.id + '.' + f.name) })) : null;
  if (multi) { files.forEach(f => { if (f.text === null || cfg.forceInitial) f.text = f.init; }); code = files[0].text; }
  let curTab = 0, tabsEl = null;
  let result = null, stepIdx = 0, timer = null;

  root.innerHTML = '<div class="lab-head"><span>' + (cfg.icon || '🧪') + '</span><span class="lt"></span><span class="badge"></span></div>';
  root.querySelector('.lt').textContent = cfg.title || 'Try it';
  const badge = root.querySelector('.badge');
  const setBadge = ok => { badge.textContent = ok ? '✅ task complete' : (cfg.expect ? 'task not done yet' : 'free play'); badge.className = 'badge' + (ok ? ' ok' : ''); };
  setBadge(store.get('done.' + cfg.id) === '1');
  if (cfg.noBadge) badge.style.display = 'none';
  if (cfg.intro) root.appendChild(el('p', 'lab-intro', cfg.intro));
  if (cfg.task) root.appendChild(el('div', 'lab-task', '🎯 <b>Your task:</b> ' + cfg.task));

  const ed = el('div', 'editor');
  const gutter = el('div', 'gutter');
  const wrap = el('div', 'edwrap');
  const canvas = el('div', 'canvas');
  const lhs = el('div'); const pre = el('pre');
  canvas.append(lhs, pre);
  const ta = el('textarea'); ta.spellcheck = false; ta.setAttribute('wrap', 'off'); ta.setAttribute('aria-label', 'C source code');
  ta.setAttribute('autocapitalize', 'off'); ta.setAttribute('autocomplete', 'off');
  wrap.append(canvas, ta); ed.append(gutter, wrap);
  if (multi) { tabsEl = el('div', 'tabs'); root.appendChild(tabsEl); }
  root.appendChild(ed);

  let curLine = 0, errLine = 0;
  function paint() {
    code = ta.value;
    pre.innerHTML = highlight(code) + '\n';
    const n = code.split('\n').length;
    let g = ''; for (let i = 1; i <= n; i++) g += '<div class="' + (i === curLine ? 'cur' : i === errLine ? 'err' : '') + '">' + i + '</div>';
    gutter.innerHTML = g;
    const rows = Math.max(cfg.minRows || 5, Math.min(n + 1, cfg.maxRows || 24));
    ed.style.height = (rows * 20 + 18) + 'px';
    lhs.innerHTML = '';
    for (const [ln, cls] of [[curLine, 'cur'], [errLine, 'err']]) if (ln) { const d = el('div', 'lh ' + cls); d.style.top = (8 + (ln - 1) * 20) + 'px'; lhs.appendChild(d); }
    syncScroll();
  }
  function syncScroll() { canvas.style.transform = 'translate(' + (-ta.scrollLeft) + 'px,' + (-ta.scrollTop) + 'px)'; gutter.scrollTop = ta.scrollTop; }
  ta.value = code;
  ta.addEventListener('scroll', syncScroll);
  ta.addEventListener('input', () => { if (multi) { files[curTab].text = ta.value; store.set(savedKey + '.' + files[curTab].name, ta.value); } else store.set(savedKey, ta.value); curLine = errLine = 0; exitStep(); paint(); });
  function drawTabs() { if (!multi) return; tabsEl.innerHTML = ''; files.forEach((f, i) => { const b = el('button', 'tab' + (i === curTab ? ' on' : ''), '📄 ' + esc(f.name)); b.onclick = () => switchTab(i); tabsEl.appendChild(b); }); }
  function switchTab(i) { files[curTab].text = ta.value; curTab = i; ta.value = files[i].text; curLine = errLine = 0; ta.scrollTop = 0; drawTabs(); paint(); }
  drawTabs();
  ta.addEventListener('keydown', e => {
    if (e.key === 'Tab') {
      e.preventDefault(); const s = ta.selectionStart, en = ta.selectionEnd;
      ta.setRangeText('    ', s, en, 'end'); ta.dispatchEvent(new Event('input'));
    } else if (e.key === 'Enter') {
      e.preventDefault(); const s = ta.selectionStart;
      const lineStart = ta.value.lastIndexOf('\n', s - 1) + 1; const line = ta.value.slice(lineStart, s);
      let ind = /^[ \t]*/.exec(line)[0]; if (/\{\s*$/.test(line)) ind += '    ';
      ta.setRangeText('\n' + ind, s, ta.selectionEnd, 'end'); ta.dispatchEvent(new Event('input'));
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); run(); }
  });

  const bar = el('div', 'lab-bar');
  const bRun = el('button', 'btn primary', '▶ Compile &amp; Run');
  const bStep = el('button', 'btn', '👣 Step through');
  const bReset = el('button', 'btn', '↺ Reset code');
  const bHint = el('button', 'btn', '💡 Hint');
  bar.append(bRun); if (!multi && !cfg.noStep) bar.appendChild(bStep); bar.append(bReset); if (cfg.hint) bar.appendChild(bHint);
  const bSol = el('button', 'btn', '👀 Solution'); let mine = null;
  if (cfg.solution) {
    bar.appendChild(bSol);
    bSol.onclick = () => {
      exitStep();
      if (multi && typeof cfg.solution === 'object') {
        if (mine === null) { files[curTab].text = ta.value; mine = files.map(f => f.text); files.forEach(f => { if (cfg.solution[f.name] !== undefined) f.text = cfg.solution[f.name].replace(/^\n/, ''); }); bSol.textContent = '↩ Back to my code'; }
        else { files.forEach((f, i) => { f.text = mine[i]; }); mine = null; bSol.textContent = '👀 Solution'; }
        ta.value = files[curTab].text;
      } else if (mine === null) { mine = ta.value; ta.value = cfg.solution.replace(/^\n/, ''); bSol.textContent = '↩ Back to my code'; }
      else { ta.value = mine; mine = null; bSol.textContent = '👀 Solution'; }
      curLine = errLine = 0; paint();
    };
  }
  let stdinEl = null;
  if (cfg.stdin !== undefined || cfg.showStdin) {
    const s = el('label', 'stdin', 'keyboard input (stdin) <input class="field" value="">'); stdinEl = s.querySelector('input'); stdinEl.value = cfg.stdin || ''; bar.appendChild(s);
  }
  root.appendChild(bar);
  const hintBox = el('div', 'hintbox', '💡 ' + (cfg.hint || '')); root.appendChild(hintBox);
  bHint.onclick = () => { hintBox.style.display = hintBox.style.display === 'block' ? 'none' : 'block'; };

  const consoleEl = el('div', 'console'); consoleEl.setAttribute('role', 'log'); root.appendChild(consoleEl);
  const desktop = el('div', 'desktop'); root.appendChild(desktop);

  /* stepper */
  const stepper = el('div', 'stepper');
  stepper.innerHTML = '<div class="ctl"><button class="btn sm" data-a="first" title="First step">⏮</button><button class="btn sm" data-a="prev" title="Back">◀ Back</button><button class="btn sm primary" data-a="next" title="Next line">Next ▶</button><button class="btn sm" data-a="last" title="Last step">⏭</button><button class="btn sm" data-a="play">▶▶ Auto</button><input type="range" min="0" max="0" value="0" aria-label="Step"><button class="btn sm" data-a="close">✕ Close</button></div>' +
    '<div class="info"></div><div class="mem"><div class="stack"></div><div><div class="side"></div><div class="outmini"><h6>Output so far</h6><pre></pre></div></div></div>';
  root.appendChild(stepper);
  const range = stepper.querySelector('input'), info = stepper.querySelector('.info'), stackEl = stepper.querySelector('.stack'), sideEl = stepper.querySelector('.side'), outMini = stepper.querySelector('.outmini pre');

  function writeLine(cls, text) { const s = el('span', cls); s.textContent = text; consoleEl.appendChild(s); consoleEl.appendChild(document.createTextNode('\n')); }
  function showCompile(res, src) {
    for (const e of res.errors) {
      let lines = src.split('\n');
      if (multi && e.file) { const fi = files.findIndex(f => f.name === e.file); if (fi >= 0) { lines = (fi === curTab ? ta.value : files[fi].text).split('\n'); if (fi !== curTab) switchTab(fi); } }
      const kind = e.kind || 'error';
      writeLine('errc', (e.file || 'main.c') + ':' + (e.line || 1) + ':' + (e.col || 1) + ': ' + kind + ': ' + e.msg);
      if (e.line && lines[e.line - 1] !== undefined) {
        writeLine('dim', String(e.line).padStart(4) + ' | ' + lines[e.line - 1]);
        const sp = document.createElement('span'); sp.className = 'caret'; sp.textContent = '     | ' + ' '.repeat(Math.max(0, (e.col || 1) - 1)) + '^'; consoleEl.appendChild(sp); consoleEl.appendChild(document.createTextNode('\n'));
      }
      const ex = explain(e.msg);
      if (ex) { const h = el('span', 'hint', '💡 <b>What this means:</b> ' + ex); consoleEl.appendChild(h); }
      errLine = e.line || 0;
    }
    writeLine('errc', '\nCompilation failed — nothing was run.');
  }
  function showWarnings(w, src) { for (const x of w || []) writeLine('warnc', 'main.c:' + x.line + ': warning: ' + x.msg); }

  function run() {
    exitStep(); consoleEl.innerHTML = ''; desktop.innerHTML = ''; curLine = errLine = 0;
    if (multi) files[curTab].text = ta.value;
    const src = multi ? files[0].text : ta.value;
    const fmap = {}; if (multi) files.slice(1).forEach(f => { fmap[f.name] = f.text; });
    const stdin = stdinEl ? stdinEl.value.replace(/\\n/g, '\n') + (stdinEl.value ? '\n' : '') : '';
    let res;
    try { res = CInterp.run(src, { stdin, trace: !multi, files: fmap }); } catch (e) { consoleEl.innerHTML = ''; writeLine('errc', 'Internal error in the mini-compiler: ' + e.message); paint(); return; }
    result = res;
    writeLine('dim', '$ compile main.c … ' + (res.phase === 'compile' ? 'FAILED' : 'ok'));
    if (res.phase === 'compile') { showCompile(res, src); paint(); return; }
    showWarnings(res.warnings, src);
    const o = document.createElement('span'); o.textContent = res.stdout; consoleEl.appendChild(o);
    if (res.stdout && !res.stdout.endsWith('\n')) consoleEl.appendChild(document.createTextNode('\n'));
    if (res.debug) writeLine('dim', '[debug output] ' + res.debug.trim());
    if (res.ok === false) {
      writeLine('errc', '\n💥 Program crashed' + (res.line ? ' on line ' + res.line : '') + ': ' + res.error);
      errLine = multi ? 0 : (res.line || 0);
    } else writeLine('okc', '\n[Process finished with exit code ' + res.exit + ']');
    if (res.leaks && res.leaks.length) writeLine('warnc', '⚠ memory leak: ' + res.leaks.length + ' block(s) / ' + res.leaks.reduce((a, b) => a + b.size, 0) + ' bytes were never free()d');
    if (res.files && res.files.length) for (const f of res.files) writeLine('dim', '📄 virtual disk file "' + f.name + '" (' + f.size + ' bytes): ' + JSON.stringify(f.text));
    for (const ev of res.events) if (ev.kind === 'msgbox') desktop.appendChild(winbox(ev));
    consoleEl.scrollTop = consoleEl.scrollHeight;
    let ok = res.ok !== false;
    if (cfg.expect) {
      let pass = false; try { pass = ok && cfg.expect(res.stdout, res, multi ? files.map(f => f.text).join('\n') : src); } catch (_) { pass = false; }
      if (pass) {
        writeLine('okc', '🎉 Task complete!');
        store.set('done.' + cfg.id, '1'); setBadge(true); if (root.Lab_onDone) root.Lab_onDone(cfg.id); if (create.onDone) create.onDone(cfg.id);
      } else if (ok) writeLine('warnc', '… the program ran, but it does not do the task yet. Compare your output with the goal and try again.');
    }
    paint();
  }

  /* stepping */
  function enterStep() {
    run();
    if (!result || result.phase === 'compile' || !result.trace || !result.trace.length) return;
    stepper.classList.add('on'); desktop.innerHTML = '';
    range.max = result.trace.length - 1; goStep(0);
  }
  function exitStep() { clearInterval(timer); timer = null; stepper.classList.remove('on'); curLine = 0; const p = stepper.querySelector('[data-a=play]'); if (p) p.textContent = '▶▶ Auto'; }
  function varCard(v, prev, isTop) {
    const old = prev && prev.get(v.name + '@' + v.addr);
    const chg = old !== undefined && old !== v.val;
    const d = el('div', 'var' + (chg ? ' chg' : '') + (v.uninit ? ' un' : ''));
    let h = '<div class="nm"><span>' + esc(v.name) + '</span><em>' + esc(v.type) + '</em></div>';
    if (v.cells) {
      h += '<div class="cells">' + v.cells.map((c, i) => '<div class="' + (old && prev.get(v.name + '@' + v.addr + '#' + i) !== undefined && prev.get(v.name + '@' + v.addr + '#' + i) !== c ? 'chg' : '') + '">' + esc(c) + '<small>' + i + '</small></div>').join('') + '</div>';
      if (v.isChar) h += '<div class="vl" style="font-weight:400;font-size:12px">' + esc(v.val) + '</div>';
    } else if (v.fields) {
      h += '<div class="flds">' + v.fields.map(f => '<div><span>+' + f.off + ' ' + esc(f.name) + '</span><span>' + esc(f.val) + '</span></div>').join('') + '</div>';
    } else h += '<div class="vl">' + (v.uninit ? '?? garbage' : esc(v.val)) + '</div>';
    h += '<div class="ad">0x' + v.addr.toString(16).padStart(8, '0') + ' · ' + v.size + ' B</div>';
    if (v.points) h += '<span class="pt">→ points to ' + esc(v.points) + '</span>';
    d.innerHTML = h; return d;
  }
  function goStep(i) {
    const tr = result.trace; i = Math.max(0, Math.min(tr.length - 1, i)); stepIdx = i; range.value = i;
    const s = tr[i], prevS = i > 0 ? tr[i - 1] : null;
    const prev = new Map();
    if (prevS) for (const fr of prevS.frames.concat([{ vars: prevS.globals }])) for (const v of fr.vars) { prev.set(v.name + '@' + v.addr, v.val); if (v.cells) v.cells.forEach((c, k) => prev.set(v.name + '@' + v.addr + '#' + k, c)); }
    stackEl.innerHTML = '<h6>Call stack (top = running now)</h6>';
    if (s.end) {
      info.innerHTML = '🏁 <b>Program finished.</b> All local variables are gone — only globals and heap remain.';
      curLine = 0;
    } else {
      const srcLine = ta.value.split('\n')[s.line - 1] || '';
      info.innerHTML = '<b>Step ' + (i + 1) + ' of ' + tr.length + '</b> · about to run line ' + s.line + ': <code>' + esc(srcLine.trim()) + '</code> <span class="muted small">(variables below show the state <i>before</i> this line)</span>';
      curLine = s.line;
    }
    const frames = s.frames.slice().reverse();
    frames.forEach((fr, k) => {
      const f = el('div', 'frame' + (k === 0 ? ' run' : ''));
      f.appendChild(el('b', '', esc(fr.fn) + '()'));
      const vs = el('div', 'vars');
      if (!fr.vars.length) vs.appendChild(el('span', 'muted small', 'no variables yet'));
      fr.vars.forEach(v => vs.appendChild(varCard(v, prev)));
      f.appendChild(vs); stackEl.appendChild(f);
    });
    sideEl.innerHTML = '';
    if (s.globals.length) { sideEl.appendChild(el('h6', '', 'Global variables')); const g = el('div', 'vars'); s.globals.forEach(v => g.appendChild(varCard(v, prev))); sideEl.appendChild(g); }
    if (s.heap.length) {
      sideEl.appendChild(el('h6', '', 'Heap (malloc)'));
      s.heap.forEach(h => sideEl.appendChild(el('div', 'heapblk' + (h.freed ? ' freed' : ''), '0x' + h.addr.toString(16).padStart(8, '0') + ' · ' + h.req + ' B ' + (h.freed ? '(freed)' : '(in use)'))));
    }
    outMini.textContent = result.stdout.slice(0, s.out) || '(nothing printed yet)';
    desktop.innerHTML = ''; result.events.slice(0, s.events).forEach(ev => ev.kind === 'msgbox' && desktop.appendChild(winbox(ev)));
    if (result.truncated && i === tr.length - 1) info.innerHTML += ' <b>(trace limit reached — stepping stops after ' + tr.length + ' steps)</b>';
    paint();
    const lineTop = 8 + ((curLine || 1) - 1) * 20;
    if (curLine && (lineTop < ta.scrollTop || lineTop > ta.scrollTop + ed.clientHeight - 40)) ta.scrollTop = Math.max(0, lineTop - 60);
  }
  stepper.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return; const a = b.dataset.a;
    if (a === 'next') goStep(stepIdx + 1); else if (a === 'prev') goStep(stepIdx - 1);
    else if (a === 'first') goStep(0); else if (a === 'last') goStep(result.trace.length - 1);
    else if (a === 'close') { exitStep(); paint(); }
    else if (a === 'play') {
      if (timer) { clearInterval(timer); timer = null; b.textContent = '▶▶ Auto'; return; }
      b.textContent = '⏸ Pause';
      timer = setInterval(() => { if (stepIdx >= result.trace.length - 1) { clearInterval(timer); timer = null; b.textContent = '▶▶ Auto'; } else goStep(stepIdx + 1); }, 750);
    }
  });
  range.addEventListener('input', () => goStep(+range.value));
  bRun.onclick = run; bStep.onclick = enterStep;
  bReset.onclick = () => { if (multi) { files.forEach(f => { f.text = f.init; store.set(savedKey + '.' + f.name, f.init); }); ta.value = files[curTab].text; } else { ta.value = initial; store.set(savedKey, initial); } curLine = errLine = 0; exitStep(); consoleEl.innerHTML = ''; desktop.innerHTML = ''; paint(); };
  paint();
  root._lab = { run, setCode(c) { ta.value = c; store.set(savedKey, c); paint(); }, getCode: () => ta.value };
  return root;
}
create.onDone = null;

root.Lab = { create, highlight, esc, store, el };
})(window);
