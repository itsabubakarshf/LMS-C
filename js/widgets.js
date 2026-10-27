/* widgets.js — the interactive diagrams and toys used inside lessons */
(function (root) {
'use strict';
const { esc, el, highlight } = Lab;
const W = {};
const hex = (n, w) => '0x' + Math.round(n).toString(16).toUpperCase().padStart(w || 8, '0');
const code = s => '<pre class="mono small" style="margin:6px 0 0;white-space:pre-wrap">' + highlight(s) + '</pre>';

function shell(title, sub) {
  const w = el('div', 'widget');
  w.innerHTML = '<header><span>' + title + '</span>' + (sub ? '<small>' + sub + '</small>' : '') + '</header><div class="body"></div>';
  return [w, w.querySelector('.body')];
}

/* ------------------------------------------------------------ flowchart */
function flowchart(cfg) {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 ' + cfg.w + ' ' + cfg.h); svg.setAttribute('class', 'flow'); svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', cfg.label || 'flowchart');
  svg.innerHTML = '<defs><marker id="ar' + cfg.uid + '" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z"/></marker></defs>';
  const nodes = {}, edges = {};
  const anchor = (n, side) => side === 'b' ? [n.x, n.y + n.h / 2] : side === 't' ? [n.x, n.y - n.h / 2] : side === 'l' ? [n.x - n.w / 2, n.y] : [n.x + n.w / 2, n.y];
  for (const n of cfg.nodes) nodes[n.id] = n;
  for (const e of cfg.edges) {
    const a = nodes[e.from], b = nodes[e.to];
    const pts = [anchor(a, e.fs || 'b')].concat(e.via || [], [anchor(b, e.ts || 't')]);
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', 'M' + pts.map(q => q.join(' ')).join(' L')); p.setAttribute('class', 'edge'); p.setAttribute('marker-end', 'url(#ar' + cfg.uid + ')');
    svg.appendChild(p); edges[e.from + '>' + e.to] = p;
    if (e.label) {
      const t = document.createElementNS(NS, 'text'); t.setAttribute('class', 'elabel');
      const q = e.lp || [(pts[0][0] + pts[1][0]) / 2 + 14, (pts[0][1] + pts[1][1]) / 2 - 4]; t.setAttribute('x', q[0]); t.setAttribute('y', q[1]); t.textContent = e.label; svg.appendChild(t);
    }
  }
  const nodeEls = {};
  for (const n of cfg.nodes) {
    const g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'node ' + n.type);
    let shape;
    if (n.type === 'dec') { shape = document.createElementNS(NS, 'polygon'); shape.setAttribute('points', [[n.x, n.y - n.h / 2], [n.x + n.w / 2, n.y], [n.x, n.y + n.h / 2], [n.x - n.w / 2, n.y]].map(q => q.join(',')).join(' ')); }
    else if (n.type === 'term') { shape = document.createElementNS(NS, 'ellipse'); shape.setAttribute('cx', n.x); shape.setAttribute('cy', n.y); shape.setAttribute('rx', n.w / 2); shape.setAttribute('ry', n.h / 2); }
    else { shape = document.createElementNS(NS, 'rect'); shape.setAttribute('x', n.x - n.w / 2); shape.setAttribute('y', n.y - n.h / 2); shape.setAttribute('width', n.w); shape.setAttribute('height', n.h); shape.setAttribute('rx', 8); }
    g.appendChild(shape);
    const lines = n.text.split('\n');
    lines.forEach((ln, i) => { const t = document.createElementNS(NS, 'text'); t.setAttribute('x', n.x); t.setAttribute('y', n.y + (i - (lines.length - 1) / 2) * 16); t.textContent = ln; g.appendChild(t); });
    svg.appendChild(g); nodeEls[n.id] = g;
  }
  let prev = null;
  const api = {
    svg,
    reset() { prev = null; Object.values(nodeEls).forEach(g => g.setAttribute('class', g.getAttribute('class').replace(/ (hot|seen)/g, ''))); Object.values(edges).forEach(p => p.setAttribute('class', 'edge')); },
    hot(id) {
      Object.values(nodeEls).forEach(g => g.setAttribute('class', g.getAttribute('class').replace(' hot', '')));
      Object.values(edges).forEach(p => p.setAttribute('class', 'edge'));
      const g = nodeEls[id]; if (!g) return;
      g.setAttribute('class', g.getAttribute('class').replace(' seen', '') + ' hot seen');
      if (prev && edges[prev + '>' + id]) edges[prev + '>' + id].setAttribute('class', 'edge hot');
      prev = id;
    },
  };
  return api;
}
let uidN = 0;

/* generic "play a path through a flowchart" helper */
function player(fc, steps, onStep, done, ms) {
  let i = 0, t = null;
  fc.reset();
  function tick() {
    if (i >= steps.length) { t = null; done && done(); return; }
    fc.hot(steps[i].id); onStep && onStep(steps[i], i); i++; t = setTimeout(tick, ms || 650);
  }
  tick();
  return () => clearTimeout(t);
}

/* ------------------------------------------------------------- pipeline */
W.pipeline = function () {
  const [w, b] = shell('🏭 The journey from your code to a running program', 'click a stage');
  const stages = [
    { em: '📝', n: 'Source code', s: 'main.c', d: 'You write <b>human-readable text</b>. The computer cannot run this directly — a CPU only understands numbers.', ex: 'int x = MAX;   // MAX is a name I invented', real: 'A recipe written in English.' },
    { em: '✂️', n: 'Preprocessor', s: '#include, #define', d: 'A find-and-replace robot. It pastes in the contents of <code>#include</code> files and replaces <code>#define</code> names. It does <i>no thinking</i>.', ex: '#define MAX 3\nint x = MAX;\n        ⬇\nint x = 3;', real: 'Replacing every "a pinch" in the recipe with "1 gram".' },
    { em: '🧠', n: 'Compiler', s: 'checks + translates', d: 'Reads your code, <b>checks the grammar</b> (this is where error messages come from) and translates it to <b>assembly</b>. Since you have seen x64 — this is that.', ex: 'int x = 3;\n        ⬇\nmov  DWORD PTR [rbp-4], 3', real: 'A translator who also corrects your spelling.' },
    { em: '🔩', n: 'Assembler', s: 'assembly → machine code', d: 'Turns each assembly instruction into the actual <b>bytes</b> the CPU executes. Output: an object file (<code>.obj</code> / <code>.o</code>).', ex: 'mov DWORD PTR [rbp-4], 3\n        ⬇\nC7 45 FC 03 00 00 00', real: 'Writing the translated recipe in the oven\'s button codes.' },
    { em: '🔗', n: 'Linker', s: 'glues pieces together', d: 'Connects your object file with library code (like <code>printf</code>, which lives in the C runtime) and adds the program entry point. Missing a function? <b>"undefined reference"</b> comes from here.', ex: 'main.obj + ucrt (printf) + startup code\n        ⬇\nprogram.exe   (starts with "MZ")', real: 'Binding all the recipe pages and the shared cookbook into one book.' },
    { em: '🚀', n: 'Running .exe', s: 'Windows loads it', d: 'Windows copies the <code>.exe</code> into memory and jumps to <code>main</code>. Your code runs <b>directly on the CPU</b> — no interpreter in between, which is why C is fast.', ex: 'program.exe → process → main()', real: 'The chef actually cooking.' },
  ];
  b.innerHTML = '<div class="pipe"></div><div class="pipebox"></div><div class="row" style="margin-top:10px"><button class="btn" data-d="-1">◀ Previous</button><button class="btn primary" data-d="1">Next stage ▶</button><span class="muted small">GDScript comparison: Godot reads your script <i>while the game runs</i>. C is translated <i>once, ahead of time</i>.</span></div>';
  const pipe = b.querySelector('.pipe'), box = b.querySelector('.pipebox'); let cur = 0;
  stages.forEach((s, i) => { const d = el('div', 'stage', '<div class="em">' + s.em + '</div><b>' + s.n + '</b><span>' + s.s + '</span>'); d.tabIndex = 0; d.onclick = () => show(i); d.onkeydown = e => { if (e.key === 'Enter') show(i); }; pipe.appendChild(d); });
  function show(i) {
    cur = i; [...pipe.children].forEach((c, k) => c.className = 'stage' + (k === i ? ' on' : k < i ? ' past' : ''));
    const s = stages[i]; box.innerHTML = '<b>' + s.em + ' ' + s.n + '</b> — ' + s.d + '<div class="muted small" style="margin-top:6px">🍳 Real life: ' + s.real + '</div>' + code(s.ex);
  }
  b.querySelectorAll('[data-d]').forEach(x => x.onclick = () => show(Math.max(0, Math.min(stages.length - 1, cur + +x.dataset.d))));
  show(0); return w;
};

/* -------------------------------------------------------------- anatomy */
W.anatomy = function () {
  const [w, b] = shell('🔬 Anatomy of a C program', 'hover or tap any coloured part');
  const parts = {
    inc: ['#include &lt;stdio.h&gt;', 'Pastes in a <b>header</b> that describes <code>printf</code> (<i>st</i>andard <i>i</i>nput/<i>o</i>utput). Like <code>import</code> — but it literally copies text. Forget it and the compiler won\'t know what <code>printf</code> is.'],
    int: ['int', 'The <b>return type</b> of main: it hands back an integer to Windows. <code>0</code> means "everything went fine".'],
    main: ['main', 'The <b>entry point</b>. The OS starts your program here — like Godot calling <code>_ready()</code> for you, except there is only one and it is spelled <code>main</code>.'],
    args: ['(void)', 'The parameter list. <code>void</code> = "takes nothing".'],
    br: ['{ }', 'Curly braces mark a <b>block</b> of statements — what GDScript does with indentation. In C, indentation is just for humans.'],
    pf: ['printf', 'A library function that prints text to the console. The <b>f</b> stands for <i>formatted</i>.'],
    str: ['"Hello, world!\\n"', 'A <b>string literal</b>: text in double quotes. <code>\\n</code> is one invisible character: newline. Single quotes (<code>\'a\'</code>) are for one character only.'],
    semi: [';', 'Every <b>statement</b> ends with a semicolon. GDScript uses line ends; C uses <code>;</code>. This is the #1 beginner error.'],
    ret: ['return 0', 'Ends main and gives <code>0</code> back to the operating system as the <b>exit code</b>.'],
  };
  b.innerHTML = '<pre class="mono" style="font-size:15px;line-height:1.9;margin:0;overflow:auto">' +
    '<span class="p pp" data-k="inc">#include &lt;stdio.h&gt;</span>\n\n' +
    '<span class="p ty" data-k="int">int</span> <span class="p fn" data-k="main">main</span><span class="p" data-k="args">(void)</span>\n<span class="p" data-k="br">{</span>\n' +
    '    <span class="p fn" data-k="pf">printf</span>(<span class="p st" data-k="str">"Hello, world!\\n"</span>)<span class="p" data-k="semi">;</span>\n' +
    '    <span class="p k" data-k="ret">return 0</span><span class="p" data-k="semi">;</span>\n<span class="p" data-k="br">}</span></pre>' +
    '<div class="pipebox" style="min-height:70px;margin-top:12px">👆 Point at a part of the program.</div>';
  const box = b.querySelector('.pipebox');
  const show = e => { const k = e.currentTarget.dataset.k; b.querySelectorAll('.p').forEach(x => x.classList.toggle('on', x.dataset.k === k)); box.innerHTML = '<b>' + parts[k][0] + '</b> — ' + parts[k][1]; };
  b.querySelectorAll('.p').forEach(p => { p.addEventListener('mouseenter', show); p.addEventListener('click', show); });
  return w;
};

/* ----------------------------------------------------------- type sizes */
W.typeSizes = function () {
  const [w, b] = shell('📦 How big is each type?', 'sizes on 64-bit Windows');
  const T = [['char', 1], ['short', 2], ['int', 4], ['long', 4], ['float', 4], ['long long', 8], ['double', 8], ['pointer (void*)', 8]];
  b.innerHTML = '<div class="sizebars">' + T.map(t => '<div class="sb"><span>' + t[0] + '</span><i style="width:' + t[1] * 34 + 'px"></i><b>' + t[1] + ' byte' + (t[1] > 1 ? 's' : '') + '</b></div>').join('') + '</div>' +
    '<p class="small muted">⚠ On Windows, <code>long</code> is only <b>4 bytes</b> (on Linux it is 8). That is why Windows code uses explicit types like <code>DWORD</code> and <code>LONGLONG</code>. Click “Check on the real compiler” to ask the mini-compiler.</p><div class="row"><button class="btn">Check on the real compiler</button><code class="out"></code></div>';
  b.querySelector('button').onclick = () => {
    const r = CInterp.run('#include <stdio.h>\nint main(){printf("char=%zu short=%zu int=%zu long=%zu long long=%zu float=%zu double=%zu void*=%zu",sizeof(char),sizeof(short),sizeof(int),sizeof(long),sizeof(long long),sizeof(float),sizeof(double),sizeof(void*));return 0;}', { trace: false });
    b.querySelector('.out').textContent = r.stdout;
  };
  return w;
};

/* ------------------------------------------------------- bits explorer */
W.bits = function () {
  const [w, b] = shell('🧮 Inside a number: bits, bytes and overflow', 'type a value, pick a type');
  b.innerHTML = '<div class="row"><select class="field"><option>char</option><option>unsigned char</option><option>short</option><option selected>int</option><option>unsigned int</option><option>long long</option><option>float</option><option>double</option></select>' +
    '<input class="field" type="text" value="100" size="14" aria-label="value"><button class="btn sm" data-a="inc">+1</button><button class="btn sm" data-a="max">set to MAX</button><button class="btn sm" data-a="min">set to MIN</button></div>' +
    '<div class="out" style="margin-top:12px"></div>';
  const sel = b.querySelector('select'), inp = b.querySelector('input'), out = b.querySelector('.out');
  const INT = { 'char': [8, true], 'unsigned char': [8, false], 'short': [16, true], 'int': [32, true], 'unsigned int': [32, false], 'long long': [64, true] };
  function render() {
    const t = sel.value; let h = '';
    if (INT[t]) {
      const [bits, sg] = INT[t]; let v;
      try { v = BigInt(Math.trunc(Number(inp.value) || 0) === Number(inp.value) ? inp.value.trim() || '0' : Math.trunc(Number(inp.value) || 0)); } catch (_) { v = 0n; }
      const lo = sg ? -(1n << BigInt(bits - 1)) : 0n, hi = sg ? (1n << BigInt(bits - 1)) - 1n : (1n << BigInt(bits)) - 1n;
      const stored = sg ? BigInt.asIntN(bits, v) : BigInt.asUintN(bits, v);
      const u = BigInt.asUintN(bits, v);
      const bs = u.toString(2).padStart(bits, '0');
      h += '<div class="bits">' + [...bs].map((c, i) => '<span class="bit' + (c === '1' ? ' on' : '') + (sg && i === 0 ? ' sg' : '') + '">' + c + '</span>').join('') + '</div>';
      const nb = bits / 8, by = []; for (let i = 0; i < nb; i++) by.push(Number((u >> BigInt(8 * i)) & 255n));
      h += '<div class="small muted">In memory (little-endian: lowest byte first):</div><div class="bytes">' + by.map((x, i) => '<div class="byte">' + x.toString(16).toUpperCase().padStart(2, '0') + '<small>+' + i + '</small></div>').join('') + '</div>';
      h += '<p class="small">Range of <code>' + t + '</code>: <b>' + lo + '</b> … <b>' + hi + '</b>' + (sg ? ' · the <span style="border-bottom:2px solid var(--amber)">outlined</span> bit is the sign' : '') + '</p>';
      if (v < lo || v > hi) h += '<div class="callout warn" style="margin:8px 0"><span class="ico">💥</span><div><h4>OVERFLOW</h4><p>' + v + ' does not fit. C does <b>not</b> warn you — the value silently wraps around and becomes <b>' + stored + '</b>.</p></div></div>';
      else h += '<p class="small" style="color:var(--good)">✔ fits. Stored value: <b>' + stored + '</b></p>';
      b._t = { lo, hi, v: stored };
    } else {
      const x = Number(inp.value); const f32 = t === 'float'; const dv = new DataView(new ArrayBuffer(8));
      if (f32) dv.setFloat32(0, x, false); else dv.setFloat64(0, x, false);
      const n = f32 ? 4 : 8; let bs = ''; for (let i = 0; i < n; i++) bs += dv.getUint8(i).toString(2).padStart(8, '0');
      const eb = f32 ? 8 : 11;
      h += '<div class="bits">' + [...bs].map((c, i) => '<span class="bit' + (c === '1' ? ' on' : '') + (i === 0 ? ' sg' : '') + '" style="' + (i > 0 && i <= eb ? 'border-color:var(--amber)' : '') + '">' + c + '</span>').join('') + '</div>';
      h += '<p class="small"><b>1</b> sign bit (outlined) · <b>' + eb + '</b> exponent bits (amber border) · <b>' + (n * 8 - 1 - eb) + '</b> mantissa bits.</p>';
      const back = f32 ? dv.getFloat32(0, false) : dv.getFloat64(0, false);
      h += '<p class="small">Stored value: <b>' + back + '</b>' + (back !== x && isFinite(x) ? ' — not exactly ' + x + '! Floats store <i>approximations</i>.' : '') + '</p>';
      h += '<p class="small muted">Try 0.1 and 0.2 in <code>double</code>: neither can be stored exactly in binary, just like 1/3 can\'t be written exactly in decimal. Never compare floats with <code>==</code>.</p>';
      b._t = null;
    }
    out.innerHTML = h;
  }
  sel.onchange = render; inp.oninput = render;
  b.querySelectorAll('[data-a]').forEach(x => x.onclick = () => {
    const t = b._t; if (!t && x.dataset.a !== 'inc') return;
    if (x.dataset.a === 'inc') inp.value = t ? String(t.v + 1n) : String((Number(inp.value) || 0) + 1);
    else inp.value = String(x.dataset.a === 'max' ? t.hi : t.lo);
    render();
  });
  render(); return w;
};

/* ------------------------------------------------------ printf playground */
W.printf = function () {
  const [w, b] = shell('🎛 printf playground', 'runs on the mini-compiler');
  b.innerHTML = '<div class="row"><label class="small muted">Format string</label><input class="field" style="flex:1;min-width:240px" value="Score: %05d | pi = %.2f | name = %s | grade = %c"></div>' +
    '<div class="row" style="margin-top:8px"><label class="small muted">Values</label><input class="field" style="flex:1;min-width:240px" value="42, 3.14159, &quot;Ada&quot;, \'A\'"></div>' +
    '<div class="row" style="margin-top:10px"><button class="btn primary">Print</button>' +
    ['%d int', '%f float', '%s string', '%c char', '%x hex', '%p pointer', '%5d width', '%-5d left', '%.2f decimals', '%zu size_t'].map(s => '<button class="btn sm" data-s="' + s.split(' ')[0] + '" title="insert">' + s.split(' ')[0] + ' <span class="muted">' + s.split(' ')[1] + '</span></button>').join('') + '</div>' +
    '<div class="console" style="margin:12px 0 0"></div>';
  const [f, v] = b.querySelectorAll('input.field'), out = b.querySelector('.console');
  function go() {
    const fmt = f.value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\\\\n/g, '\\n');
    const src = '#include <stdio.h>\nint main(void){ int dummy=0; printf("' + fmt + '\\n"' + (v.value.trim() ? ', ' + v.value : '') + '); return dummy; }';
    const r = CInterp.run(src, { trace: false });
    if (r.phase === 'compile') out.innerHTML = '<span class="errc">' + esc(r.errors[0].msg) + '</span>'; else out.innerHTML = '<span class="dim">output ▸ </span>' + esc(r.stdout) + (r.ok === false ? '<span class="errc"> ' + esc(r.error) + '</span>' : '');
  }
  b.querySelector('.btn.primary').onclick = go; f.oninput = v.oninput = go;
  b.querySelectorAll('[data-s]').forEach(x => x.onclick = () => { f.value += ' ' + x.dataset.s; go(); });
  go(); return w;
};

/* ------------------------------------------------------ if/else flowchart */
W.flowIf = function () {
  const [w, b] = shell('🔀 Decision flowchart — an enemy checks your health', 'drag the slider, press Run');
  const uid = ++uidN;
  const fc = flowchart({
    uid, w: 640, h: 440, label: 'if / else if / else flowchart',
    nodes: [
      { id: 's', type: 'term', text: 'start', x: 320, y: 28, w: 110, h: 36 },
      { id: 'd1', type: 'dec', text: 'hp > 50 ?', x: 320, y: 112, w: 190, h: 70 },
      { id: 'a', type: 'io', text: 'puts("Healthy")', x: 548, y: 112, w: 150, h: 40 },
      { id: 'd2', type: 'dec', text: 'hp > 0 ?', x: 320, y: 232, w: 190, h: 70 },
      { id: 'bb', type: 'io', text: 'puts("Wounded")', x: 548, y: 232, w: 150, h: 40 },
      { id: 'c', type: 'io', text: 'puts("Game over")', x: 320, y: 340, w: 160, h: 40 },
      { id: 'e', type: 'term', text: 'continue…', x: 320, y: 416, w: 110, h: 36 },
    ],
    edges: [
      { from: 's', to: 'd1' }, { from: 'd1', to: 'a', fs: 'r', ts: 'l', label: 'yes', lp: [425, 104] }, { from: 'd1', to: 'd2', label: 'no', lp: [338, 170] },
      { from: 'd2', to: 'bb', fs: 'r', ts: 'l', label: 'yes', lp: [425, 224] }, { from: 'd2', to: 'c', label: 'no', lp: [338, 290] },
      { from: 'a', to: 'e', fs: 'b', ts: 'r', via: [[548, 416]] }, { from: 'bb', to: 'e', fs: 'b', ts: 'r', via: [[548, 416]] }, { from: 'c', to: 'e' },
    ],
  });
  b.innerHTML = '<div class="grid2" style="align-items:start"><div class="fcbox"></div><div><pre class="mono small" style="margin:0">' + highlight('if (hp > 50) {\n    puts("Healthy");\n} else if (hp > 0) {\n    puts("Wounded");\n} else {\n    puts("Game over");\n}') + '</pre>' +
    '<div class="row" style="margin-top:14px"><label class="small">hp = <b class="hpv">70</b></label><input type="range" min="-10" max="100" value="70" style="flex:1"></div><button class="btn primary" style="margin-top:8px">▶ Run the flowchart</button><p class="small muted say" style="min-height:2.6em"></p></div></div>';
  b.querySelector('.fcbox').appendChild(fc.svg);
  const sl = b.querySelector('input'), hpv = b.querySelector('.hpv'), say = b.querySelector('.say'); let stop = null;
  sl.oninput = () => { hpv.textContent = sl.value; };
  b.querySelector('.btn.primary').onclick = () => {
    stop && stop(); const hp = +sl.value; const path = ['s', 'd1']; const why = ['Program begins.', 'Is ' + hp + ' > 50 ? ' + (hp > 50 ? 'Yes.' : 'No.')];
    if (hp > 50) { path.push('a', 'e'); why.push('Prints "Healthy". The other branches are <b>skipped</b>.', 'Done.'); }
    else { path.push('d2'); why.push('Is ' + hp + ' > 0 ? ' + (hp > 0 ? 'Yes.' : 'No.')); if (hp > 0) { path.push('bb', 'e'); why.push('Prints "Wounded".', 'Done.'); } else { path.push('c', 'e'); why.push('Prints "Game over" — the <code>else</code> catches everything left.', 'Done.'); } }
    stop = player(fc, path.map((id, i) => ({ id, why: why[i] })), s => { say.innerHTML = s.why; }, null, 800);
  };
  return w;
};

/* ------------------------------------------------------ loop flowchart */
W.flowLoop = function () {
  const [w, b] = shell('🔁 Loop flowchart — adding 1 + 2 + … + N', 'watch i and sum change');
  const uid = ++uidN;
  const fc = flowchart({
    uid, w: 600, h: 420, label: 'for loop flowchart',
    nodes: [
      { id: 's', type: 'term', text: 'start', x: 250, y: 26, w: 100, h: 34 },
      { id: 'init', type: 'proc', text: 'sum = 0;  i = 1;', x: 250, y: 90, w: 170, h: 38 },
      { id: 'cond', type: 'dec', text: 'i <= N ?', x: 250, y: 175, w: 170, h: 66 },
      { id: 'body', type: 'proc', text: 'sum += i;', x: 250, y: 262, w: 150, h: 38 },
      { id: 'step', type: 'proc', text: 'i++', x: 250, y: 332, w: 110, h: 36 },
      { id: 'out', type: 'io', text: 'printf(sum)', x: 460, y: 175, w: 130, h: 38 },
      { id: 'e', type: 'term', text: 'end', x: 460, y: 262, w: 90, h: 34 },
    ],
    edges: [
      { from: 's', to: 'init' }, { from: 'init', to: 'cond' }, { from: 'cond', to: 'body', label: 'yes', lp: [270, 222] }, { from: 'body', to: 'step' },
      { from: 'step', to: 'cond', fs: 'l', ts: 'l', via: [[100, 332], [100, 175]] }, { from: 'cond', to: 'out', fs: 'r', ts: 'l', label: 'no', lp: [345, 168] }, { from: 'out', to: 'e' },
    ],
  });
  b.innerHTML = '<div class="grid2" style="align-items:start"><div class="fcbox"></div><div><pre class="mono small" style="margin:0">' + highlight('int sum = 0;\nfor (int i = 1; i <= N; i++) {\n    sum += i;\n}\nprintf("%d", sum);') + '</pre>' +
    '<div class="row" style="margin-top:12px"><label class="small">N = <b class="nv">4</b></label><input type="range" min="0" max="8" value="4" style="flex:1"></div><button class="btn primary" style="margin-top:8px">▶ Run</button>' +
    '<div class="mem" style="display:block;margin-top:12px"><div class="vars" style="padding:0"><div class="var"><div class="nm"><span>i</span><em>int</em></div><div class="vl iv">–</div></div><div class="var"><div class="nm"><span>sum</span><em>int</em></div><div class="vl sv">–</div></div></div></div>' +
    '<p class="small muted say" style="min-height:2.6em"></p></div></div>';
  b.querySelector('.fcbox').appendChild(fc.svg);
  const sl = b.querySelector('input'), nv = b.querySelector('.nv'), say = b.querySelector('.say'), iv = b.querySelector('.iv'), sv = b.querySelector('.sv'); let stop = null;
  sl.oninput = () => { nv.textContent = sl.value; };
  b.querySelector('.btn.primary').onclick = () => {
    stop && stop(); const N = +sl.value; const steps = [{ id: 's', t: 'Program begins.', i: '–', sum: '–' }, { id: 'init', t: 'Set up: sum = 0, i = 1.', i: 1, sum: 0 }];
    let sum = 0;
    for (let i = 1; i <= N; i++) {
      steps.push({ id: 'cond', t: 'Is ' + i + ' <= ' + N + ' ? <b>Yes</b> → run the body.', i, sum });
      sum += i; steps.push({ id: 'body', t: 'sum = sum + ' + i + ' = <b>' + sum + '</b>', i, sum });
      steps.push({ id: 'step', t: 'i++ → i becomes <b>' + (i + 1) + '</b>. Jump back up to the check.', i: i + 1, sum });
    }
    steps.push({ id: 'cond', t: 'Is ' + (N + 1) + ' <= ' + N + ' ? <b>No</b> → leave the loop.', i: N + 1, sum }, { id: 'out', t: 'Prints <b>' + sum + '</b>.', i: N + 1, sum }, { id: 'e', t: 'Done. The loop body ran ' + N + ' time(s).', i: N + 1, sum });
    stop = player(fc, steps, s => { say.innerHTML = s.t; iv.textContent = s.i; sv.textContent = s.sum; }, null, 700);
  };
  return w;
};

/* ------------------------------------------------------- array lockers */
W.array = function () {
  const [w, b] = shell('🗄 Array = a row of lockers', 'int a[5] — try an index that does not exist');
  b.innerHTML = '<pre class="mono small" style="margin:0 0 10px">' + highlight('int a[5] = {10, 20, 30, 40, 50};\nint secret = 999;     // lives right after the array in memory') + '</pre>' +
    '<div class="mstrip" style="padding-top:22px"></div><div class="row" style="margin-top:14px"><label class="small">index i = <b class="iv">2</b></label><input type="range" min="-1" max="7" value="2" style="flex:1;max-width:280px"><button class="btn sm wr">a[i] = 0;</button><button class="btn sm rs">reset</button></div><div class="pipebox say" style="min-height:60px;margin-top:10px"></div>';
  const strip = b.querySelector('.mstrip'), sl = b.querySelector('input'), iv = b.querySelector('.iv'), say = b.querySelector('.say');
  let mem = [10, 20, 30, 40, 50, 999, 7, 1337];
  const names = ['a[0]', 'a[1]', 'a[2]', 'a[3]', 'a[4]', 'secret', '(other)', '(other)'];
  function render() {
    const i = +sl.value; iv.textContent = i; strip.innerHTML = '';
    mem.forEach((v, k) => { const c = el('div', 'mcell' + (k === i ? (k >= 5 || k < 0 ? ' bad' : ' hot') : ''), '<small>' + hex(0x1000 + 4 * k, 4) + '</small><div>' + v + '</div><small>' + names[k] + '</small>'); if (k === i) c.insertAdjacentHTML('afterbegin', '<span class="ptrmark">▼ a[' + i + ']</span>'); strip.appendChild(c); });
    if (i < 0) say.innerHTML = '<b style="color:var(--bad)">a[-1]</b> is <u>before</u> the array. C does not check — it reads whatever lives there (undefined behaviour).';
    else if (i < 5) say.innerHTML = '<code>a[' + i + ']</code> = address ' + hex(0x1000) + ' + ' + i + ' × 4 bytes = <b>' + hex(0x1000 + 4 * i, 4) + '</b> → value <b>' + mem[i] + '</b>. The index is a <i>distance</i> from the start, so the first locker is number <b>0</b>.';
    else say.innerHTML = '<b style="color:var(--bad)">Out of bounds!</b> a[' + i + '] is not part of the array — it is <b>' + names[i] + '</b>. Reading it gives ' + mem[i] + '; writing to it would silently corrupt another variable. C gives <b>no error</b> — this is how crashes and security holes happen.';
  }
  sl.oninput = render;
  b.querySelector('.wr').onclick = () => { const i = +sl.value; if (i >= 0) { mem[i] = 0; render(); } };
  b.querySelector('.rs').onclick = () => { mem = [10, 20, 30, 40, 50, 999, 7, 1337]; render(); };
  render(); return w;
};

/* --------------------------------------------------------- pointer street */
W.pointer = function () {
  const [w, b] = shell('🏠 Pointers: houses and addresses', 'move the pointer, change what it points to');
  b.innerHTML = '<div class="row" style="margin-bottom:8px"><label class="small muted">pointer type</label><select class="field"><option value="1">char* (1-byte houses)</option><option value="4" selected>int* (4-byte houses)</option><option value="8">double* (8-byte houses)</option></select></div>' +
    '<div class="mstrip" style="padding-top:24px"></div>' +
    '<div class="row" style="margin-top:14px"><button class="btn" data-a="inc">p++</button><button class="btn" data-a="dec">p--</button><button class="btn" data-a="set">*p = 99;</button><button class="btn" data-a="x">int copy = *p;</button><button class="btn" data-a="rs">reset</button></div>' +
    '<div class="pipebox say" style="margin-top:12px;min-height:90px"></div>';
  const strip = b.querySelector('.mstrip'), say = b.querySelector('.say'), sel = b.querySelector('select');
  let sz = 4, idx = 1, mem, copy = null, msg = '';
  const init = () => { mem = [11, 22, 33, 44, 55, 66]; idx = 1; copy = null; msg = 'Think of memory as a street. Each house has an <b>address</b> (small number). A <b>pointer</b> is just a variable holding a house address.'; };
  init();
  function render() {
    strip.innerHTML = '';
    mem.forEach((v, k) => {
      const c = el('div', 'mcell' + (k === idx ? ' hot' : ''), '<small>' + hex(0x1000 + k * sz, 4) + '</small><div>' + v + '</div><small>' + (k === idx ? '' : '&nbsp;') + '</small>');
      c.style.width = Math.max(62, sz * 12 + 20) + 'px';
      if (k === idx) c.insertAdjacentHTML('afterbegin', '<span class="ptrmark">▼ p</span>');
      strip.appendChild(c);
    });
    const pv = 0x1000 + idx * sz;
    say.innerHTML = '<div><code>p</code> holds <b>' + hex(pv, 4) + '</b> &nbsp;→&nbsp; <code>*p</code> (the thing at that address) is <b>' + mem[idx] + '</b>' + (copy !== null ? ' &nbsp;·&nbsp; <code>copy</code> = ' + copy : '') + '</div><div class="small muted" style="margin-top:6px">' + msg + '</div>';
  }
  sel.onchange = () => { sz = +sel.value; init(); msg = '<code>p++</code> does not add 1 — it adds <code>sizeof(*p)</code> = <b>' + sz + '</b> byte(s), so it always lands on the next element.'; render(); };
  b.querySelectorAll('[data-a]').forEach(x => x.onclick = () => {
    const a = x.dataset.a;
    if (a === 'inc') { if (idx < mem.length - 1) { idx++; msg = 'p++ moved the address from ' + hex(0x1000 + (idx - 1) * sz, 4) + ' to ' + hex(0x1000 + idx * sz, 4) + ' (+' + sz + ' bytes).'; } else msg = '⚠ p++ again would point past the array. C allows it — and reading there is a bug.'; }
    else if (a === 'dec') { if (idx > 0) { idx--; msg = 'p-- stepped back ' + sz + ' byte(s).'; } else msg = '⚠ Before the first house: reading there is undefined behaviour.'; }
    else if (a === 'set') { mem[idx] = 99; msg = '<code>*p = 99</code> — "go to the house p points at and put 99 inside". This is how a function can change its caller\'s variable.'; }
    else if (a === 'x') { copy = mem[idx]; msg = '<code>*p</code> read the value (' + copy + ') <i>through</i> the pointer.'; }
    else { init(); }
    render();
  });
  render(); return w;
};

/* ------------------------------------------------------- struct layout */
W.structLayout = function () {
  const [w, b] = shell('🧱 Struct layout and padding', 'reorder the fields — watch sizeof change');
  const TYPES = { char: 1, short: 2, int: 4, float: 4, double: 8, 'void*': 8 };
  let fields = [['char', 'alive'], ['int', 'hp'], ['char', 'level'], ['double', 'x']];
  b.innerHTML = '<div class="grid2" style="align-items:start"><div class="fl"></div><div><pre class="mono small code" style="margin:0"></pre><div class="row" style="margin-top:8px"><select class="field"></select><button class="btn sm add">+ add field</button><button class="btn sm opt">✨ sort big → small</button></div></div></div>' +
    '<div class="mstrip" style="margin-top:16px;flex-wrap:wrap"></div><div class="pipebox say" style="margin-top:12px;min-height:50px"></div>';
  const sel = b.querySelector('select'); sel.innerHTML = Object.keys(TYPES).map(t => '<option>' + t + '</option>').join('');
  const fl = b.querySelector('.fl'), strip = b.querySelector('.mstrip'), say = b.querySelector('.say'), codeEl = b.querySelector('.code');
  const cols = ['#4aa3ff', '#ff9f43', '#2ec4b6', '#c77dff', '#ff6b6b', '#8ac926', '#f4d35e'];
  function render() {
    let off = 0, maxA = 1; const cells = []; let total = 0, used = 0; const rows = [];
    fields.forEach((f, i) => {
      const s = TYPES[f[0]]; maxA = Math.max(maxA, s);
      const pad = (s - (off % s)) % s; for (let k = 0; k < pad; k++) cells.push({ pad: true, off: off + k });
      off += pad; rows.push({ i, off, s, pad });
      for (let k = 0; k < s; k++) cells.push({ f: i, off: off + k, name: f[1] }); off += s; used += s;
    });
    const end = (maxA - (off % maxA)) % maxA; for (let k = 0; k < end; k++) cells.push({ pad: true, off: off + k, tail: true }); total = off + end;
    fl.innerHTML = '';
    fields.forEach((f, i) => {
      const r = el('div', 'row', '<span style="width:14px;height:14px;border-radius:4px;background:' + cols[i % cols.length] + '"></span><code>' + f[0] + ' ' + f[1] + ';</code><span class="muted small">offset ' + rows[i].off + (rows[i].pad ? ' (+' + rows[i].pad + ' pad)' : '') + '</span>');
      r.style.marginBottom = '4px';
      const mk = (t, fn) => { const x = el('button', 'btn sm', t); x.onclick = fn; r.appendChild(x); };
      mk('↑', () => { if (i > 0) { [fields[i - 1], fields[i]] = [fields[i], fields[i - 1]]; render(); } }); mk('↓', () => { if (i < fields.length - 1) { [fields[i + 1], fields[i]] = [fields[i], fields[i + 1]]; render(); } }); mk('✕', () => { fields.splice(i, 1); render(); });
      fl.appendChild(r);
    });
    codeEl.innerHTML = highlight('struct Player {\n' + fields.map(f => '    ' + f[0] + ' ' + f[1] + ';').join('\n') + '\n};');
    strip.innerHTML = '';
    cells.forEach(c => { const d = el('div', 'mcell' + (c.pad ? ' pad' : ''), '<small>' + c.off + '</small><div>' + (c.pad ? '·' : '') + '</div>'); d.style.width = '34px'; if (!c.pad) d.style.background = cols[c.f % cols.length] + '55'; strip.appendChild(d); });
    const wasted = total - used;
    say.innerHTML = '<code>sizeof(struct Player)</code> = <b>' + total + ' bytes</b> — your fields only need ' + used + ', so <b style="color:' + (wasted ? 'var(--bad)' : 'var(--good)') + '">' + wasted + ' byte(s) are padding</b> (striped cells). The CPU is fastest when a <code>double</code> sits at an address divisible by 8 and an <code>int</code> at one divisible by 4, so the compiler inserts gaps.';
  }
  b.querySelector('.add').onclick = () => { fields.push([sel.value, 'f' + fields.length]); render(); };
  b.querySelector('.opt').onclick = () => { fields.sort((a, c) => TYPES[c[0]] - TYPES[a[0]]); render(); };
  render(); return w;
};

/* ------------------------------------------------------------ heap map */
W.heap = function () {
  const [w, b] = shell('🏨 The heap is a hotel: malloc books rooms, free checks out', 'try to leak, double-free and fragment');
  const SLOTS = 16;
  b.innerHTML = '<div class="row"><button class="btn" data-n="1">malloc(8)</button><button class="btn" data-n="2">malloc(16)</button><button class="btn" data-n="4">malloc(32)</button><button class="btn" data-n="0">reset</button></div>' +
    '<div class="mstrip" style="margin-top:14px;flex-wrap:wrap"></div><div class="row blocks" style="margin-top:12px"></div><div class="pipebox say" style="margin-top:12px;min-height:60px">The heap below is 128 bytes (16 slots of 8). Book some rooms!</div>';
  let slots, blocks, nid;
  const reset = () => { slots = Array(SLOTS).fill(null); blocks = []; nid = 1; };
  reset();
  const cols = ['#4aa3ff', '#ff9f43', '#2ec4b6', '#c77dff', '#ff6b6b', '#8ac926'];
  const strip = b.querySelector('.mstrip'), bl = b.querySelector('.blocks'), say = b.querySelector('.say');
  function render(msg) {
    strip.innerHTML = '';
    slots.forEach((s, i) => { const d = el('div', 'mcell', '<small>' + hex(0x10000 + i * 8, 5) + '</small><div>' + (s ? s.name : '') + '</div>'); d.style.width = '58px'; if (s) d.style.background = cols[s.c % cols.length] + '66'; strip.appendChild(d); });
    bl.innerHTML = '';
    blocks.filter(x => !x.freed).forEach(x => { const t = el('button', 'btn sm', 'free(' + x.name + ')  · ' + x.n * 8 + ' B'); t.onclick = () => { x.freed = true; for (let i = x.at; i < x.at + x.n; i++) slots[i] = null; render('<b>free(' + x.name + ')</b> — room returned. If you forget this call, those bytes are <b>leaked</b> until the program ends.'); }; bl.appendChild(t); });
    const dead = blocks.filter(x => x.freed);
    if (dead.length) { const t = el('button', 'btn sm', '💥 free(' + dead[dead.length - 1].name + ') AGAIN'); t.onclick = () => render('<b style="color:var(--bad)">Double free!</b> ' + dead[dead.length - 1].name + ' was already returned. The real program corrupts the heap and usually crashes. Set the pointer to <code>NULL</code> after freeing.'); bl.appendChild(t); }
    if (msg) say.innerHTML = msg;
  }
  b.querySelectorAll('[data-n]').forEach(x => x.onclick = () => {
    const n = +x.dataset.n; if (!n) { reset(); render('Heap reset.'); return; }
    let at = -1; for (let i = 0; i + n <= SLOTS; i++) { if (slots.slice(i, i + n).every(s => !s)) { at = i; break; } }
    if (at < 0) { const free = slots.filter(s => !s).length; render('<b style="color:var(--bad)">malloc returned NULL</b> — no <i>contiguous</i> run of ' + n * 8 + ' bytes' + (free >= n ? ', even though ' + free * 8 + ' bytes are free in total (fragmentation)' : '') + '. <b>Always check the result of malloc.</b>'); return; }
    const blk = { name: 'p' + nid, n, at, c: nid++, freed: false }; blocks.push(blk); for (let i = at; i < at + n; i++) slots[i] = blk;
    render('<code>' + blk.name + ' = malloc(' + n * 8 + ')</code> → address <b>' + hex(0x10000 + at * 8, 5) + '</b>. The memory is yours until <code>free</code> is called.');
  });
  render(); return w;
};

/* -------------------------------------------------------- API reader */
W.apiReader = function () {
  const [w, b] = shell('📖 Learn to read a Windows API signature', 'click a coloured part');
  const APIS = {
    MessageBoxA: { sig: [['int', 'ret'], [' MessageBoxA(', null], ['HWND', 'a'], [' hWnd, ', null], ['LPCSTR', 'b'], [' lpText, ', null], ['LPCSTR', 'c'], [' lpCaption, ', null], ['UINT', 'd'], [' uType);', null]],
      ret: ['int (return)', 'Which button the user pressed: <code>IDOK</code> (1), <code>IDYES</code> (6), <code>IDNO</code> (7), …'], a: ['HWND hWnd', '<b>H</b>andle to a <b>W</b>i<b>nd</b>ow — the owner. A handle is a ticket number Windows gives you instead of a real pointer. Pass <code>NULL</code> for "no owner". Under the hood: <code>typedef void* HWND;</code>'], b: ['LPCSTR lpText', '<b>L</b>ong <b>P</b>ointer to <b>C</b>onst <b>STR</b>ing = <code>const char*</code>. "LP" is a leftover from 16-bit Windows — today it is just a normal pointer. The message text.'], c: ['LPCSTR lpCaption', 'Same type: the title-bar text.'], d: ['UINT uType', '<code>unsigned int</code> of <b>flags</b> combined with <code>|</code>: <code>MB_YESNO | MB_ICONQUESTION</code>. Each flag is one bit pattern (see the bits widget!).'] },
    GetLocalTime: { sig: [['void', 'ret'], [' GetLocalTime(', null], ['LPSYSTEMTIME', 'a'], [' lpSystemTime);', null]],
      ret: ['void (return)', 'Returns nothing — it <b>fills in</b> the struct you give it.'], a: ['LPSYSTEMTIME lpSystemTime', 'A pointer to a <code>SYSTEMTIME</code> struct. <b>You</b> create the struct, pass its address with <code>&amp;</code>, and Windows writes the year, month, … into it. This "out parameter" pattern is everywhere in the Win32 API — it is exactly why pointers matter.'] },
    CreateFileA: { sig: [['HANDLE', 'ret'], [' CreateFileA(', null], ['LPCSTR', 'a'], [' lpFileName, ', null], ['DWORD', 'b'], [' dwDesiredAccess, ', null], ['DWORD', 'c'], [' dwShareMode, ', null], ['LPSECURITY_ATTRIBUTES', 'd'], [' lpSec, ', null], ['DWORD', 'e'], [' dwCreationDisposition, ', null], ['DWORD', 'f'], [' dwFlags, ', null], ['HANDLE', 'g'], [' hTemplate);', null]],
      ret: ['HANDLE (return)', 'A handle (ticket) for the opened file, or <code>INVALID_HANDLE_VALUE</code> if it failed. Use it with <code>WriteFile</code>, <code>ReadFile</code>, and finally <code>CloseHandle</code>.'], a: ['LPCSTR lpFileName', 'The path, e.g. <code>"save.dat"</code>.'], b: ['DWORD dwDesiredAccess', '<b>D</b>ouble <b>WORD</b> = 32-bit unsigned (<code>unsigned long</code> on Windows). <code>GENERIC_READ</code>, <code>GENERIC_WRITE</code>, or both with <code>|</code>. The <code>dw</code> prefix is <i>Hungarian notation</i>: it tells you the type from the name.'], c: ['DWORD dwShareMode', 'Whether other programs may open the file at the same time. 0 = exclusive.'], d: ['LPSECURITY_ATTRIBUTES', 'Advanced permissions. Almost always <code>NULL</code>.'], e: ['DWORD dwCreationDisposition', 'What to do if the file exists or not: <code>CREATE_ALWAYS</code>, <code>OPEN_EXISTING</code>, <code>OPEN_ALWAYS</code>…'], f: ['DWORD dwFlags', 'Attributes — normally <code>FILE_ATTRIBUTE_NORMAL</code>.'], g: ['HANDLE hTemplate', 'Rarely used. <code>NULL</code>.'] },
  };
  b.innerHTML = '<div class="row"><select class="field">' + Object.keys(APIS).map(k => '<option>' + k + '</option>').join('') + '</select></div><div class="apiparts" style="margin-top:12px"></div><div class="pipebox say" style="margin-top:10px">👆 Click a coloured part of the signature.</div>' +
    '<p class="small muted">Tip: on Microsoft\'s docs site, search the function name — every parameter is explained exactly like this.</p>';
  const sel = b.querySelector('select'), ap = b.querySelector('.apiparts'), say = b.querySelector('.say');
  function render() {
    const a = APIS[sel.value]; ap.innerHTML = ''; say.innerHTML = '👆 Click a coloured part of the signature.';
    a.sig.forEach(([t, k]) => { if (!k) { ap.appendChild(document.createTextNode(t)); return; } const s = el('span', 'p', esc(t)); s.onclick = () => { ap.querySelectorAll('.p').forEach(x => x.classList.remove('on')); s.classList.add('on'); say.innerHTML = '<b>' + esc(a[k][0]) + '</b> — ' + a[k][1]; }; ap.appendChild(s); });
  }
  sel.onchange = render; render(); return w;
};

/* ---------------------------------------------------- Windows message loop */
W.msgLoop = function () {
  const [w, b] = shell('📬 The Windows message loop — interactive', 'click the window, then pump the queue');
  const uid = ++uidN;
  const fc = flowchart({
    uid, w: 500, h: 430, label: 'Windows message loop',
    nodes: [
      { id: 'reg', type: 'proc', text: 'RegisterClass + CreateWindow', x: 200, y: 30, w: 250, h: 38 },
      { id: 'get', type: 'dec', text: 'GetMessage()\nreturns > 0 ?', x: 200, y: 130, w: 210, h: 84 },
      { id: 'disp', type: 'proc', text: 'DispatchMessage(&msg)', x: 200, y: 245, w: 210, h: 38 },
      { id: 'proc', type: 'io', text: 'WndProc(hwnd, msg, …)\nswitch (msg) { case … }', x: 200, y: 330, w: 250, h: 52 },
      { id: 'end', type: 'term', text: 'exit program', x: 432, y: 130, w: 104, h: 34 },
    ],
    edges: [
      { from: 'reg', to: 'get' }, { from: 'get', to: 'disp', label: 'yes', lp: [222, 196] }, { from: 'disp', to: 'proc' },
      { from: 'proc', to: 'get', fs: 'l', ts: 'l', via: [[40, 330], [40, 130]] }, { from: 'get', to: 'end', fs: 'r', ts: 'l', label: 'WM_QUIT', lp: [338, 120] },
    ],
  });
  b.innerHTML = '<div class="grid2" style="align-items:start"><div class="fcbox"></div><div>' +
    '<div class="fakewin"><div class="tb">My Game Window</div><div class="cl"><button data-m="WM_LBUTTONDOWN">🖱 Click me</button><button data-m="WM_KEYDOWN">⌨ Press a key</button><button data-m="WM_PAINT">🎨 Needs redraw</button><button data-m="WM_CLOSE">✕ Close window</button></div></div>' +
    '<h6 class="muted small" style="margin:12px 0 4px">MESSAGE QUEUE</h6><div class="qlist"></div><div class="row" style="margin:10px 0"><button class="btn primary pump">GetMessage → Dispatch ▶</button><label class="small"><input type="checkbox" class="auto"> auto-pump</label></div></div></div>' +
    '<pre class="mono small wp" style="margin:12px 0 0;line-height:1.7"></pre><div class="pipebox say" style="margin-top:10px;min-height:56px">Nothing has happened yet. Click something in the window above — the event goes into the <b>queue</b>.</div>' +
    '<p class="small muted">🎮 Godot analogy: the engine already runs this loop for you and calls <code>_input(event)</code>, <code>_draw()</code> and <code>_process()</code>. In plain Win32 <b>you</b> write the loop — and <code>WndProc</code> is your <code>_input</code>.</p>';
  b.querySelector('.fcbox').appendChild(fc.svg);
  const WP = [['WM_LBUTTONDOWN', '    case WM_LBUTTONDOWN:\n        MessageBoxA(hwnd, "Clicked!", "Event", MB_OK);\n        return 0;'], ['WM_KEYDOWN', '    case WM_KEYDOWN:\n        player_jump();\n        return 0;'], ['WM_PAINT', '    case WM_PAINT:\n        draw_everything(hwnd);\n        return 0;'], ['WM_CLOSE', '    case WM_CLOSE:\n        DestroyWindow(hwnd);      // → WM_DESTROY\n        return 0;'], ['WM_DESTROY', '    case WM_DESTROY:\n        PostQuitMessage(0);       // → WM_QUIT\n        return 0;']];
  const qEl = b.querySelector('.qlist'), wp = b.querySelector('.wp'), say = b.querySelector('.say'), pump = b.querySelector('.pump'), auto = b.querySelector('.auto');
  let queue = [], running = true, hl = null, timer = null;
  function renderCode() {
    wp.innerHTML = highlight('LRESULT CALLBACK WndProc(HWND hwnd, UINT msg, WPARAM wp, LPARAM lp) {\n    switch (msg) {') + '\n' +
      WP.map(([n, c]) => '<span style="display:block;background:' + (hl === n ? 'color-mix(in srgb,var(--accent) 25%,transparent)' : 'transparent') + '">' + highlight(c) + '</span>').join('') +
      highlight('    }\n    return DefWindowProc(hwnd, msg, wp, lp);   // everything else: default behaviour\n}');
  }
  function renderQ() { qEl.innerHTML = queue.length ? queue.map(m => '<span class="msg">' + m + '</span>').join('') : '<span class="muted small">(empty)</span>'; }
  b.querySelectorAll('[data-m]').forEach(x => x.onclick = () => { if (!running) { say.innerHTML = 'The program has exited — reload the widget by pressing the lesson\'s reset.'; return; } queue.push(x.dataset.m); renderQ(); say.innerHTML = 'Windows put <code>' + x.dataset.m + '</code> in your thread\'s <b>queue</b>. Nothing runs yet — your loop must ask for it with <code>GetMessage</code>.'; });
  function step() {
    if (!running) return;
    if (!queue.length) { fc.hot('get'); say.innerHTML = '<code>GetMessage</code> <b>sleeps</b> — the queue is empty, so your program uses 0% CPU while waiting. (A game loop would use <code>PeekMessage</code> and keep drawing instead.)'; return; }
    const m = queue.shift(); renderQ(); fc.reset(); fc.hot('reg');
    const seq = ['get', 'disp', 'proc']; let i = 0;
    const t = setInterval(() => {
      if (i < seq.length) { fc.hot(seq[i]); if (seq[i] === 'proc') { hl = m; renderCode(); } i++; return; }
      clearInterval(t);
      let more = '';
      if (m === 'WM_CLOSE') { queue.push('WM_DESTROY'); renderQ(); more = ' It asked Windows to destroy the window, which queues <code>WM_DESTROY</code>.'; }
      if (m === 'WM_DESTROY') { queue.push('WM_QUIT'); renderQ(); more = ' <code>PostQuitMessage</code> queued <code>WM_QUIT</code>.'; }
      if (m === 'WM_QUIT') { running = false; fc.hot('end'); hl = null; renderCode(); say.innerHTML = '<code>GetMessage</code> returned 0 for <code>WM_QUIT</code> → the loop ends → program exits. 👋'; return; }
      say.innerHTML = 'Handled <code>' + m + '</code> in <code>WndProc</code> (highlighted).' + more;
    }, 450);
  }
  pump.onclick = () => { if (queue[0] === 'WM_QUIT') { const m = queue.shift(); renderQ(); fc.hot('get'); setTimeout(() => { fc.hot('end'); running = false; say.innerHTML = '<code>GetMessage</code> returned 0 for <code>WM_QUIT</code> → the loop ends → program exits. 👋'; }, 400); } else step(); };
  auto.onchange = () => { clearInterval(timer); if (auto.checked) timer = setInterval(() => { if (!document.body.contains(w)) { clearInterval(timer); return; } pump.onclick(); }, 1800); };
  renderCode(); renderQ(); fc.hot('reg'); return w;
};

/* -------------------------------------------------- function call stack */
W.callStack = function () {
  const [w, b] = shell('🥞 Function calls stack up like plates', 'factorial(4) unwinding');
  b.innerHTML = '<pre class="mono small" style="margin:0 0 10px">' + highlight('int factorial(int n) {\n    if (n <= 1) return 1;\n    return n * factorial(n - 1);\n}') + '</pre><div class="row"><button class="btn primary nx">Next ▶</button><button class="btn rs">Reset</button></div><div class="stk" style="margin-top:12px;display:flex;flex-direction:column-reverse;gap:6px;max-width:420px"></div><div class="pipebox say" style="margin-top:12px;min-height:50px"></div>';
  const stk = b.querySelector('.stk'), say = b.querySelector('.say');
  let ev = [], i;
  function build() { ev = []; const frames = []; const rec = n => { frames.push(n); ev.push({ f: frames.slice(), t: 'factorial(' + n + ') is called. A new <b>frame</b> (its own private n) is pushed on the stack.' }); if (n <= 1) { ev.push({ f: frames.slice(), t: 'n is 1 → <b>return 1</b>. The base case stops the recursion.', ret: 1 }); frames.pop(); return 1; } const r = n * rec(n - 1); ev.push({ f: frames.slice().concat([n]), t: 'Back in factorial(' + n + '): ' + n + ' × ' + (r / n) + ' = <b>' + r + '</b> → return it, pop the frame.', ret: r }); frames.pop(); return r; }; rec(4); i = -1; }
  function show() { stk.innerHTML = ''; if (i < 0) { say.textContent = 'Press Next to call factorial(4).'; return; } const e = ev[i]; e.f.forEach((n, k) => { const d = el('div', 'frame' + (k === e.f.length - 1 ? ' run' : ''), '<b>factorial(n = ' + n + ')</b>'); stk.appendChild(d); }); say.innerHTML = e.t; }
  b.querySelector('.nx').onclick = () => { if (i < ev.length - 1) i++; show(); };
  b.querySelector('.rs').onclick = () => { build(); show(); };
  build(); show(); return w;
};

root.Widgets = W;
})(window);
