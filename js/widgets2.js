/* widgets2.js — more interactive diagrams and flowcharts */
(function (root) {
'use strict';
const { esc, el, highlight } = Lab;
const W = Widgets, H = W._h;
const { flowchart, player, shell, code } = H;
const hx = (n, w) => '0x' + Math.round(n).toString(16).toUpperCase().padStart(w || 2, '0');

/* ---------------------------------------------------------- number / bits */
W.bitToggle = function () {
  const [w, b] = shell('🔢 Click the bits: one byte, many meanings', 'flip bits, apply operators');
  b.innerHTML = '<div class="bits bt" style="gap:6px"></div><div class="grid2" style="margin-top:8px"><div class="out1"></div><div class="out2"></div></div>' +
    '<div class="row" style="margin-top:10px"><button class="btn sm" data-o="not">~x (NOT)</button><button class="btn sm" data-o="shl">x &lt;&lt; 1</button><button class="btn sm" data-o="shr">x &gt;&gt; 1</button><button class="btn sm" data-o="and">x &amp; 0x0F (mask low 4 bits)</button><button class="btn sm" data-o="or">x | 0x80 (set top bit)</button><button class="btn sm" data-o="xor">x ^ 0xFF (flip)</button><button class="btn sm" data-o="inc">x + 1</button><button class="btn sm" data-o="zero">clear</button></div>' +
    '<div class="pipebox say" style="min-height:48px;margin-top:10px">Each box is one <b>bit</b>. Click a bit to flip it. Eight bits = one <b>byte</b> = the size of a <code>char</code>.</div>';
  let v = 0b01000001;
  const bt = b.querySelector('.bt'), o1 = b.querySelector('.out1'), o2 = b.querySelector('.out2'), say = b.querySelector('.say');
  function render() {
    bt.innerHTML = '';
    for (let i = 7; i >= 0; i--) { const on = (v >> i) & 1; const d = el('div', '', '<div class="bit' + (on ? ' on' : '') + (i === 7 ? ' sg' : '') + '" style="cursor:pointer;width:44px;height:44px;font-size:18px">' + on + '</div><div class="muted small" style="text-align:center;font-family:var(--mono)">' + (1 << i) + '</div>'); d.onclick = () => { v ^= (1 << i); say.innerHTML = 'You flipped the bit worth <b>' + (1 << i) + '</b>. The value is the sum of all switched-on bits.'; render(); }; bt.appendChild(d); }
    const sg = v > 127 ? v - 256 : v;
    o1.innerHTML = '<table class="t"><tr><th>View</th><th>Value</th></tr><tr><td><code>unsigned char</code></td><td><b>' + v + '</b></td></tr><tr><td><code>signed char</code> (two’s complement)</td><td><b>' + sg + '</b></td></tr><tr><td>hexadecimal</td><td><b>' + hx(v) + '</b></td></tr><tr><td>as a character (ASCII)</td><td><b>' + (v >= 32 && v < 127 ? "'" + String.fromCharCode(v) + "'" : '(not printable)') + '</b></td></tr></table>';
    o2.innerHTML = '<p class="small muted" style="margin-top:0">The top bit (outlined) is the <b>sign bit</b> for signed types: when it is on, the value is “wrapped” negative: 256 is subtracted.</p><p class="small">Try <b>0b01000001</b> (65) → it is the letter <b>A</b>. Set the 0x20 bit → 97 → <b>a</b>. That is how <code>toupper()</code> works: flip one bit.</p>';
  }
  b.querySelectorAll('[data-o]').forEach(x => x.onclick = () => {
    const o = x.dataset.o, old = v;
    if (o === 'not') v = (~v) & 255; else if (o === 'shl') v = (v << 1) & 255; else if (o === 'shr') v = v >> 1; else if (o === 'and') v &= 0x0F; else if (o === 'or') v |= 0x80; else if (o === 'xor') v ^= 0xFF; else if (o === 'inc') v = (v + 1) & 255; else v = 0;
    const msg = { not: 'NOT flips every bit.', shl: 'Shifting left by 1 <b>doubles</b> the number (bits fall off the left end).', shr: 'Shifting right by 1 <b>halves</b> it (integer division by 2).', and: 'AND with a mask keeps only the bits that are 1 in <i>both</i> — here: the low 4 bits.', or: 'OR switches bits <b>on</b>. This is how flags like MB_OK | MB_ICONINFORMATION are combined.', xor: 'XOR with all-ones flips every bit.', inc: 'Adding 1 — when all bits are on, the next +1 wraps to 0 (overflow).', zero: 'All bits off.' }[o];
    say.innerHTML = msg + ' (' + old + ' → ' + v + ')'; render();
  });
  render(); return w;
};

/* ----------------------------------------------------------------- logic */
W.logic = function () {
  const [w, b] = shell('🧠 Logic gates: && || ! and short-circuiting', 'toggle A and B');
  b.innerHTML = '<div class="row"><label><input type="checkbox" class="a"> <code>A</code> = <b class="av">false (0)</b></label><label><input type="checkbox" class="bb"> <code>B</code> = <b class="bv">false (0)</b></label><select class="field"><option>A &amp;&amp; B</option><option>A || B</option><option>!A</option><option>A != B</option><option>!(A &amp;&amp; B)</option></select></div>' +
    '<div class="out" style="margin-top:12px"></div><div class="pipebox" style="margin-top:10px"><b>Short-circuit:</b> in <code>A &amp;&amp; B</code>, if A is false C <i>never even looks at B</i>. That is why this is safe: <code>if (p != NULL &amp;&amp; *p &gt; 0)</code> — the dereference only happens when p is valid.' + '</div>';
  const ca = b.querySelector('.a'), cb = b.querySelector('.bb'), sel = b.querySelector('select'), out = b.querySelector('.out');
  const F = [(a, c) => a && c, (a, c) => a || c, a => !a, (a, c) => a !== c, (a, c) => !(a && c)];
  function render() {
    b.querySelector('.av').textContent = ca.checked ? 'true (1)' : 'false (0)'; b.querySelector('.bv').textContent = cb.checked ? 'true (1)' : 'false (0)';
    const f = F[sel.selectedIndex], a = ca.checked, c = cb.checked; const r = f(a, c);
    let rows = ''; for (const A of [false, true]) for (const B of [false, true]) { const cur = (A === a && B === c); rows += '<tr style="' + (cur ? 'background:var(--accent-soft);font-weight:700' : '') + '"><td>' + +A + '</td><td>' + +B + '</td><td>' + +f(A, B) + '</td></tr>'; }
    out.innerHTML = '<div class="row" style="align-items:flex-start;gap:30px"><table class="t" style="width:auto"><tr><th>A</th><th>B</th><th>result</th></tr>' + rows + '</table><div><div style="font-size:2.2rem;font-weight:800;color:' + (r ? 'var(--good)' : 'var(--bad)') + '">' + (r ? 'TRUE → 1' : 'FALSE → 0') + '</div><div class="muted small">' + sel.value.replace(/&amp;/g, '&') + ' with A=' + +a + ', B=' + +c + '</div></div></div>';
  }
  ca.onchange = cb.onchange = sel.onchange = render; render(); return w;
};

/* ------------------------------------------------------------ precedence */
W.precedence = function () {
  const [w, b] = shell('⚖️ Operator precedence: what does C do first?', 'pick an expression, or type your own');
  const P = [['2 + 3 * 4', '2 + (3 * 4)', '* binds tighter than +, just like in maths.'], ['10 - 4 - 3', '(10 - 4) - 3', '- is evaluated left to right, so the answer is 3, not 9.'],
    ['7 / 2 * 2', '(7 / 2) * 2', 'Same level, left to right: 7/2 is 3 (integer division), then 3*2 = 6. Not 7!'], ['1 + 2 << 3', '(1 + 2) << 3', '+ is higher than <<, so this is 3 << 3 = 24.'],
    ['5 > 3 > 1', '(5 > 3) > 1', '(5 > 3) is 1, then 1 > 1 is false. Chained comparisons do NOT work like maths.'], ['1 || 0 && 0', '1 || (0 && 0)', '&& binds tighter than ||. Add brackets whenever in doubt.'],
    ['-2 * 3 + 4 % 3', '((-2) * 3) + (4 % 3)', 'Unary minus first, then * and % (same level), then +.']];
  b.innerHTML = '<div class="row"><select class="field">' + P.map((p, i) => '<option value="' + i + '">' + esc(p[0]) + '</option>').join('') + '</select><span class="muted small">or type:</span><input class="field" style="flex:1;min-width:200px" placeholder="e.g. 8 / 3 + 2 * 5"></div><div class="out" style="margin-top:12px"></div>' +
    '<table class="t small"><tr><th>Higher ↑</th><th>Operators</th><th>Associativity</th></tr><tr><td>1</td><td><code>( ) [ ] . -&gt; x++ x--</code></td><td>left→right</td></tr><tr><td>2</td><td><code>! ~ ++x --x -x *p &amp;x sizeof (cast)</code></td><td>right→left</td></tr><tr><td>3</td><td><code>* / %</code></td><td>left→right</td></tr><tr><td>4</td><td><code>+ -</code></td><td>left→right</td></tr><tr><td>5</td><td><code>&lt;&lt; &gt;&gt;</code></td><td>left→right</td></tr><tr><td>6</td><td><code>&lt; &lt;= &gt; &gt;=</code></td><td>left→right</td></tr><tr><td>7</td><td><code>== !=</code></td><td>left→right</td></tr><tr><td>8</td><td><code>&amp; ^ |</code> (in that order)</td><td>left→right</td></tr><tr><td>9</td><td><code>&amp;&amp;</code> then <code>||</code></td><td>left→right</td></tr><tr><td>10</td><td><code>?:</code> and <code>= += -= …</code></td><td>right→left</td></tr></table>';
  const sel = b.querySelector('select'), inp = b.querySelector('input'), out = b.querySelector('.out');
  function ev(expr) { const r = CInterp.run('#include <stdio.h>\nint main(void){ printf("%d", ' + expr + '); return 0; }', { trace: false }); return r.phase === 'compile' ? { err: r.errors[0].msg } : r.ok === false ? { err: r.error } : { v: r.stdout }; }
  function show(expr, group, why) { const r = ev(expr); out.innerHTML = '<div class="pipebox" style="min-height:0"><div>Expression: <code style="font-size:1.1rem">' + esc(expr) + '</code></div>' + (group ? '<div>C reads it as: <code style="font-size:1.1rem;color:var(--accent)">' + esc(group) + '</code></div>' : '') + '<div style="margin-top:6px">Result: <b style="font-size:1.4rem">' + (r.err ? '<span style="color:var(--bad)">' + esc(r.err) + '</span>' : r.v) + '</b></div>' + (why ? '<div class="muted small" style="margin-top:4px">' + why + '</div>' : '') + '</div>'; }
  sel.onchange = () => { inp.value = ''; const p = P[sel.value]; show(p[0], p[1], p[2]); };
  inp.oninput = () => { if (inp.value.trim()) show(inp.value, '', 'Your own expression — compare with what you expected.'); else sel.onchange(); };
  sel.onchange(); return w;
};

/* --------------------------------------------------------------- strings */
W.stringCells = function () {
  const [w, b] = shell('🔤 A string in memory: characters, ASCII codes and the hidden \\0', 'type a word; change the buffer size');
  b.innerHTML = '<pre class="mono small code" style="margin:0 0 10px"></pre><div class="row"><label class="small muted">text</label><input class="field" value="Hello" maxlength="14" size="14"><label class="small muted">buffer size N</label><input type="range" min="3" max="14" value="8"><b class="nv">8</b><label class="small"><input type="checkbox" class="nz"> forget the \\0</label></div><div class="mstrip" style="margin-top:16px;padding-top:6px"></div><div class="pipebox say" style="margin-top:12px;min-height:60px"></div>';
  const txt = b.querySelector('input.field'), rng = b.querySelector('input[type=range]'), nv = b.querySelector('.nv'), nz = b.querySelector('.nz'), strip = b.querySelector('.mstrip'), say = b.querySelector('.say'), cd = b.querySelector('.code');
  function render() {
    const N = +rng.value, t = txt.value; nv.textContent = N;
    cd.innerHTML = highlight('char word[' + N + '];\nstrcpy(word, "' + t + '");' + (nz.checked ? '   // (pretend the \\0 was not copied)' : ''));
    strip.innerHTML = '';
    const total = Math.max(N, t.length + 1);
    for (let i = 0; i < total; i++) {
      let ch = '', cls = 'mcell', sub = '';
      if (i < t.length) { ch = t[i]; sub = t.charCodeAt(i); }
      else if (i === t.length && !nz.checked) { ch = '\\0'; sub = 0; cls += ' hot'; }
      else if (i < N) { ch = '?'; sub = 'junk'; cls += ' pad'; }
      if (i >= N) cls += ' bad';
      const d = el('div', cls, '<small>[' + i + ']</small><div>' + esc(ch) + '</div><small>' + sub + '</small>'); d.style.width = '48px'; strip.appendChild(d);
    }
    let m = '<code>sizeof(word)</code> = <b>' + N + '</b> (the box). ';
    if (nz.checked) m += '<code>strlen(word)</code> would keep walking past the letters until it happens to hit a zero byte — <b style="color:var(--bad)">undefined behaviour</b> (garbage or crash).';
    else if (t.length + 1 > N) m += '<b style="color:var(--bad)">Buffer overflow!</b> The text needs ' + (t.length + 1) + ' bytes (letters + \\0) but the buffer has only ' + N + '. The red cells are written <i>past the end of the array</i>, corrupting whatever lives there. Real C does not stop you.';
    else m += '<code>strlen(word)</code> = <b>' + t.length + '</b> (letters, not counting \\0). Needs ' + (t.length + 1) + ' bytes in total — it fits.';
    say.innerHTML = m;
  }
  [txt, rng, nz].forEach(x => x.oninput = render); render(); return w;
};

/* ---------------------------------------------------------------- grid2d */
W.grid2d = function () {
  const [w, b] = shell('🗺 2D arrays: a game tile map', 'click tiles — see the code and the real memory layout');
  const R = 5, C = 8, TILES = ['·', '🧱', '🪙'];
  let map = Array.from({ length: R }, (_, r) => Array.from({ length: C }, (_, c) => (r === 0 || r === R - 1 || c === 0 || c === C - 1) ? 1 : (r === 2 && c === 4 ? 2 : 0)));
  b.innerHTML = '<div class="grid2" style="align-items:start"><div><div class="g" style="display:grid;grid-template-columns:repeat(' + C + ',44px);gap:3px"></div><p class="small muted">Click a tile: 0 = floor, 1 = wall, 2 = coin.</p></div><div><pre class="mono small code" style="margin:0;overflow:auto"></pre></div></div><h6 class="muted small" style="margin:14px 0 4px">THE REAL MEMORY: ONE LONG ROW (row-major order)</h6><div class="mstrip flat"></div><div class="pipebox say" style="margin-top:10px;min-height:44px">Hover or click a tile.</div>';
  const g = b.querySelector('.g'), cd = b.querySelector('.code'), flat = b.querySelector('.flat'), say = b.querySelector('.say'); let sel = null;
  function render() {
    g.innerHTML = '';
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) { const d = el('div', '', TILES[map[r][c]]); d.style.cssText = 'width:44px;height:44px;display:grid;place-items:center;border:1.5px solid ' + (sel && sel[0] === r && sel[1] === c ? 'var(--accent)' : 'var(--line)') + ';border-radius:6px;cursor:pointer;background:var(--panel2);font-size:20px'; d.onclick = () => { map[r][c] = (map[r][c] + 1) % 3; sel = [r, c]; info(r, c); render(); }; d.onmouseenter = () => info(r, c); g.appendChild(d); }
    cd.innerHTML = highlight('int map[' + R + '][' + C + '] = {\n' + map.map(row => '    {' + row.join(', ') + '}').join(',\n') + '\n};\n\nmap[2][4] = 2;   // row 2, column 4');
    flat.innerHTML = '';
    for (let i = 0; i < R * C; i++) { const r = Math.floor(i / C), c = i % C; const d = el('div', 'mcell' + (sel && sel[0] === r && sel[1] === c ? ' hot' : ''), '<small>' + i + '</small><div style="padding:4px 2px;min-height:0">' + map[r][c] + '</div>'); d.style.width = '30px'; flat.appendChild(d); }
  }
  function info(r, c) { sel = [r, c]; say.innerHTML = '<code>map[' + r + '][' + c + ']</code> = <b>' + map[r][c] + '</b> · flat index = row × columns + column = ' + r + ' × ' + C + ' + ' + c + ' = <b>' + (r * C + c) + '</b> · byte offset = ' + (r * C + c) + ' × 4 = <b>' + (r * C + c) * 4 + '</b> from the start. C stores 2D arrays as one long row, row after row.'; render(); }
  render(); return w;
};

/* ------------------------------------------------------------ linked list */
W.linkedList = function () {
  const [w, b] = shell('⛓ Linked list: nodes connected by pointers', 'push, append, pop — watch the pointers');
  b.innerHTML = '<div class="row"><button class="btn" data-o="front">push front</button><button class="btn" data-o="back">append at end</button><button class="btn" data-o="pop">pop front (free)</button><button class="btn" data-o="rev">reverse</button><button class="btn" data-o="rs">reset</button></div><div class="ll" style="display:flex;align-items:center;flex-wrap:wrap;gap:4px;margin:18px 0;min-height:90px"></div><pre class="mono small code" style="margin:0"></pre><div class="pipebox say" style="margin-top:10px;min-height:48px"></div>';
  const ll = b.querySelector('.ll'), cd = b.querySelector('.code'), say = b.querySelector('.say'); let nodes, nid;
  const reset = () => { nodes = [{ v: 10, a: 0x10000 }, { v: 20, a: 0x10010 }, { v: 30, a: 0x10020 }]; nid = 3; };
  reset();
  function render(msg, snippet) {
    ll.innerHTML = '<div class="mono small" style="text-align:center;margin-right:8px"><b style="color:var(--accent)">head</b><br>' + (nodes.length ? '0x' + nodes[0].a.toString(16) : 'NULL') + '<br>↓</div>';
    nodes.forEach((n, i) => { const d = el('div', '', '<div style="border:2px solid var(--accent);border-radius:8px;overflow:hidden;font:600 14px var(--mono);min-width:88px;text-align:center;background:var(--panel)"><div style="background:var(--accent-soft);font-size:11px;color:var(--muted)">0x' + n.a.toString(16) + '</div><div style="padding:4px">value ' + n.v + '</div><div style="border-top:1px solid var(--line);padding:3px;font-size:12px">next → ' + (i < nodes.length - 1 ? '0x' + nodes[i + 1].a.toString(16) : '<b style="color:var(--bad)">NULL</b>') + '</div></div>'); ll.appendChild(d); if (i < nodes.length - 1) ll.appendChild(el('span', '', '➜')); });
    if (!nodes.length) ll.appendChild(el('span', 'muted', '(empty list: head is NULL)'));
    cd.innerHTML = highlight(snippet || 'typedef struct Node {\n    int value;\n    struct Node *next;   // points at the next node\n} Node;'); if (msg) say.innerHTML = msg;
  }
  b.querySelectorAll('[data-o]').forEach(x => x.onclick = () => {
    const o = x.dataset.o;
    if (o === 'front') { const n = { v: (nid++) * 10, a: 0x10000 + nid * 16 }; nodes.unshift(n); render('A new node was allocated with <code>malloc</code>. Its <code>next</code> was set to the old head, then <code>head</code> was moved to it. No other node moved!', 'Node *n = malloc(sizeof(Node));\nn->value = ' + n.v + ';\nn->next = head;   // old first node\nhead = n;         // new first node'); }
    else if (o === 'back') { if (nodes.length > 7) return; const n = { v: (nid++) * 10, a: 0x10000 + nid * 16 }; nodes.push(n); render('To append you must <b>walk the whole chain</b> until <code>next</code> is NULL (that is O(n) — slower than an array index).', 'Node *c = head;\nwhile (c->next != NULL)\n    c = c->next;        // walk to the last node\nc->next = new_node;'); }
    else if (o === 'pop') { if (!nodes.length) { render('Nothing to pop: the list is empty.'); return; } const f = nodes.shift(); render('Saved <code>head->next</code> first, then <code>free</code>d the old head (0x' + f.a.toString(16) + '), then moved head. Forgetting to save next first would lose the rest of the list.', 'Node *old = head;\nhead = head->next;\nfree(old);'); }
    else if (o === 'rev') { nodes.reverse(); render('Reversing flips every <code>next</code> arrow, using three pointers: prev, current, next.', 'Node *prev = NULL, *cur = head;\nwhile (cur) {\n    Node *next = cur->next;\n    cur->next = prev;   // flip the arrow\n    prev = cur;\n    cur = next;\n}\nhead = prev;'); }
    else { reset(); render('Reset.'); }
  });
  render('Each node lives somewhere on the heap and only knows where the <i>next</i> one is. Try the buttons.'); return w;
};

/* ------------------------------------------------------- pointer diagram */
W.ptrDiagram = function () {
  const [w, b] = shell('🏹 Pointer arrows: who points at what?', 'run the statements and watch the arrows');
  b.innerHTML = '<div class="row stm"></div><div class="svgbox" style="margin-top:12px"></div><pre class="mono small code" style="margin:6px 0 0;min-height:70px"></pre><div class="pipebox say" style="margin-top:8px;min-height:48px"></div>';
  const stm = b.querySelector('.stm'), box = b.querySelector('.svgbox'), cd = b.querySelector('.code'), say = b.querySelector('.say');
  let st, log;
  const reset = () => { st = { x: 10, y: 20, p: null, q: null }; log = ['int x = 10, y = 20;', 'int *p = NULL, *q = NULL;']; };
  reset();
  const A = { x: 0x1000, y: 0x1004, p: 0x1008, q: 0x1010 };
  const POS = { x: [90, 40], y: [330, 40], p: [90, 170], q: [330, 170] };
  const ACT = [['p = &x;', s => { s.p = 'x'; return 'p now holds the <b>address of x</b>, drawn as an arrow.'; }], ['p = &y;', s => { s.p = 'y'; return 'p re-aimed at y. x is untouched.'; }], ['q = p;', s => { s.q = s.p; return 'q gets a <b>copy of the address</b> in p. Now both point at the same variable (aliasing!).'; }],
    ['*p = 99;', s => { if (!s.p) return '💥 p is NULL — writing through it is an <b>access violation</b> (crash)!'; s[s.p] = 99; return 'Went to the address in p and stored 99 there — so <b>' + s.p + '</b> changed, and so does <code>*q</code> if q points there.'; }],
    ['*q = *p + 1;', s => { if (!s.p || !s.q) return '💥 NULL pointer dereference!'; s[s.q] = s[s.p] + 1; return 'Read through p, wrote through q.'; }], ['p = NULL;', s => { s.p = null; return 'p points nowhere. Dereferencing it now would crash — that is the safe, <i>detectable</i> failure.'; }], ['reset', null]];
  ACT.forEach(a => { const bt = el('button', 'btn sm', '<code>' + a[0] + '</code>'); bt.onclick = () => { if (!a[1]) { reset(); draw('Reset.'); return; } log.push(a[0]); if (log.length > 6) log.splice(2, 1); draw(a[1](st)); }; stm.appendChild(bt); });
  function draw(msg) {
    const NS = 'http://www.w3.org/2000/svg'; let s = '<svg viewBox="0 0 520 230" class="flow" style="max-height:260px"><defs><marker id="pa" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="12" markerHeight="12" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--accent)"/></marker></defs>';
    for (const k of ['x', 'y', 'p', 'q']) { const [cx, cy] = POS[k]; const isP = k === 'p' || k === 'q'; const v = isP ? (st[k] ? '0x' + A[st[k]].toString(16) : 'NULL') : st[k];
      s += '<g><rect x="' + (cx - 60) + '" y="' + (cy - 26) + '" width="120" height="58" rx="8" fill="var(--panel)" stroke="' + (isP ? 'var(--accent)' : 'var(--muted)') + '" stroke-width="2"/><text x="' + cx + '" y="' + (cy - 8) + '" text-anchor="middle" style="font:600 12px var(--mono);fill:var(--muted)">' + (isP ? 'int* ' : 'int ') + k + '  @0x' + A[k].toString(16) + '</text><text x="' + cx + '" y="' + (cy + 18) + '" text-anchor="middle" style="font:700 18px var(--mono);fill:' + (v === 'NULL' ? 'var(--bad)' : 'var(--ink)') + '">' + v + '</text></g>'; }
    for (const k of ['p', 'q']) if (st[k]) { const [x1, y1] = POS[k], [x2, y2] = POS[st[k]]; const sx = x1 + (k === 'p' ? 0 : 0), mid = (y1 + y2) / 2; s += '<path d="M' + sx + ' ' + (y1 - 28) + ' C ' + sx + ' ' + (mid + 10) + ', ' + x2 + ' ' + (mid + 40) + ', ' + x2 + ' ' + (y2 + 34) + '" fill="none" stroke="var(--accent)" stroke-width="2.5" marker-end="url(#pa)" ' + (k === 'q' ? 'stroke-dasharray="6 4"' : '') + '/>'; }
    box.innerHTML = s + '</svg>'; cd.innerHTML = highlight(log.join('\n')); if (msg) say.innerHTML = msg;
  }
  draw('Press the statements in any order. Solid arrow = p, dashed = q.'); return w;
};

/* ------------------------------------------------------------ memory map */
W.memoryMap = function () {
  const [w, b] = shell('🧭 Where does everything live? Stack, heap, globals and code', 'press Next to run the program');
  const LINES = ['int score = 5;              // global', 'int main(void) {', '    int hp = 100;          // local', '    int *p = malloc(4);    // heap block', '    *p = 7;', '    free(p);', '    return 0;', '}'];
  const STEPS = [
    { l: 0, t: 'Windows loads the program. <b>Code</b> (your machine instructions) goes in the read-only code area and the global <code>score</code> into the <b>data</b> area. Both exist for the whole life of the program.', data: true },
    { l: 1, t: '<code>main</code> is called: a <b>stack frame</b> is pushed. The stack grows <b>downwards</b> and is managed automatically.', frame: true },
    { l: 2, t: '<code>hp</code> is a local variable: it lives inside the frame on the stack. Fast, automatic, but it vanishes when the function returns.', frame: true, hp: true },
    { l: 3, t: '<code>malloc(4)</code> asks the heap for 4 bytes. The block lands on the <b>heap</b> and malloc returns its address. The pointer <code>p</code> itself is a stack variable that holds that address.', frame: true, hp: true, p: true, heap: 'new' },
    { l: 4, t: '<code>*p = 7</code> follows the arrow and writes into the heap block.', frame: true, hp: true, p: true, heap: 'val' },
    { l: 5, t: '<code>free(p)</code> gives the block back. <b>p still holds the old address</b> (a <i>dangling pointer</i>) — using it now is a bug. Good habit: <code>p = NULL;</code>', frame: true, hp: true, p: true, heap: 'freed' },
    { l: 7, t: '<code>main</code> returns: the whole frame is popped, <code>hp</code> and <code>p</code> disappear automatically. Only the heap block needed a manual <code>free</code>.', data: true, heap: 'freed' },
  ];
  b.innerHTML = '<div class="grid2" style="align-items:start"><pre class="mono small code" style="margin:0"></pre><div class="mm" style="display:grid;gap:8px"></div></div><div class="row" style="margin:12px 0"><button class="btn primary nx">Next ▶</button><button class="btn rs">Restart</button></div><div class="pipebox say" style="min-height:70px"></div>';
  const cd = b.querySelector('.code'), mm = b.querySelector('.mm'), say = b.querySelector('.say'); let i = 0;
  function seg(title, sub, body, on) { return '<div style="border:2px solid ' + (on ? 'var(--accent)' : 'var(--line)') + ';border-radius:10px;overflow:hidden;background:var(--panel)"><div style="background:var(--panel2);padding:3px 10px;font:600 12px var(--mono)">' + title + ' <span class="muted" style="font-weight:400">' + sub + '</span></div><div style="padding:8px 10px;min-height:34px;font:600 13px var(--mono)">' + body + '</div></div>'; }
  function draw() {
    const s = STEPS[i];
    cd.innerHTML = LINES.map((ln, k) => '<span style="display:block;background:' + (k === s.l ? 'color-mix(in srgb,var(--accent) 25%,transparent)' : 'transparent') + '">' + highlight(ln) + ' </span>').join('');
    const heapBody = s.heap ? '<div style="display:inline-block;border:2px ' + (s.heap === 'freed' ? 'dashed var(--muted)' : 'solid var(--good)') + ';padding:3px 12px;border-radius:6px;background:' + (s.heap === 'freed' ? 'var(--panel2)' : 'var(--good-soft)') + '">0x10000 · ' + (s.heap === 'new' ? '?? (0xCD)' : s.heap === 'val' ? '7' : '(freed)') + '</div>' : '<span class="muted">(nothing allocated)</span>';
    const stackBody = s.frame ? '<div style="border:2px solid var(--accent);border-radius:8px;padding:4px 8px">main() frame' + (s.hp ? '<br>hp = 100' : '') + (s.p ? '<br>p = 0x10000 ' + (s.heap === 'freed' ? '<span style="color:var(--bad)">(dangling!)</span>' : '→ heap') : '') + '</div>' : '<span class="muted">(empty — no function running)</span>';
    mm.innerHTML = seg('CODE', 'read-only · machine instructions of main()', 'main: push rbp … ret', false) + seg('DATA', 'globals & string literals · whole program', s.data || s.frame ? 'score = 5' : '', !!s.data && i === 0) + seg('HEAP ↑', 'malloc/free · you manage it', heapBody, !!s.heap) + seg('STACK ↓', 'locals · automatic', stackBody, !!s.frame);
    say.innerHTML = s.t; b.querySelector('.nx').disabled = i === STEPS.length - 1;
  }
  b.querySelector('.nx').onclick = () => { if (i < STEPS.length - 1) i++; draw(); }; b.querySelector('.rs').onclick = () => { i = 0; draw(); };
  draw(); return w;
};

/* ----------------------------------------------------- flowchart: while */
W.flowWhile = function () {
  const [w, b] = shell('🔫 while vs do-while flowcharts — reloading ammo', 'choose the loop type and starting ammo');
  const mk = dw => {
    const uid = H.uid();
    return flowchart(dw ? {
      uid, w: 520, h: 360, label: 'do while flowchart', nodes: [
        { id: 's', type: 'term', text: 'start', x: 200, y: 26, w: 100, h: 34 }, { id: 'body', type: 'proc', text: 'ammo--;  shots++;', x: 200, y: 100, w: 190, h: 40 },
        { id: 'c', type: 'dec', text: 'ammo > 0 ?', x: 200, y: 200, w: 190, h: 70 }, { id: 'e', type: 'term', text: 'end', x: 420, y: 200, w: 90, h: 34 }],
      edges: [{ from: 's', to: 'body' }, { from: 'body', to: 'c' }, { from: 'c', to: 'body', fs: 'l', ts: 'l', via: [[40, 200], [40, 100]], label: 'yes', lp: [60, 190] }, { from: 'c', to: 'e', fs: 'r', ts: 'l', label: 'no', lp: [330, 192] }],
    } : {
      uid, w: 520, h: 360, label: 'while flowchart', nodes: [
        { id: 's', type: 'term', text: 'start', x: 200, y: 26, w: 100, h: 34 }, { id: 'c', type: 'dec', text: 'ammo > 0 ?', x: 200, y: 110, w: 190, h: 70 },
        { id: 'body', type: 'proc', text: 'ammo--;  shots++;', x: 200, y: 230, w: 190, h: 40 }, { id: 'e', type: 'term', text: 'end', x: 420, y: 110, w: 90, h: 34 }],
      edges: [{ from: 's', to: 'c' }, { from: 'c', to: 'body', label: 'yes', lp: [222, 176] }, { from: 'body', to: 'c', fs: 'l', ts: 'l', via: [[40, 230], [40, 110]] }, { from: 'c', to: 'e', fs: 'r', ts: 'l', label: 'no', lp: [330, 102] }],
    });
  };
  b.innerHTML = '<div class="row"><select class="field"><option value="0">while (ammo > 0) { … }</option><option value="1">do { … } while (ammo > 0);</option></select><label class="small">ammo = <b class="av">3</b></label><input type="range" min="0" max="5" value="3"><button class="btn primary">▶ Run</button></div><div class="grid2" style="align-items:start;margin-top:10px"><div class="fcbox"></div><div><pre class="mono small code" style="margin:0"></pre><div class="mem" style="display:block;margin-top:10px"><div class="vars" style="padding:0"><div class="var"><div class="nm"><span>ammo</span></div><div class="vl av2">–</div></div><div class="var"><div class="nm"><span>shots</span></div><div class="vl sh">–</div></div></div></div><p class="small muted say" style="min-height:2.5em"></p></div></div>';
  const sel = b.querySelector('select'), sl = b.querySelector('input'), av = b.querySelector('.av'), box = b.querySelector('.fcbox'), cd = b.querySelector('.code'), say = b.querySelector('.say'), a2 = b.querySelector('.av2'), sh = b.querySelector('.sh'); let fc, stop = null;
  function build() { stop && stop(); box.innerHTML = ''; fc = mk(sel.value === '1'); box.appendChild(fc.svg); cd.innerHTML = highlight(sel.value === '1' ? 'int ammo = ' + sl.value + ', shots = 0;\ndo {\n    ammo--;\n    shots++;\n} while (ammo > 0);' : 'int ammo = ' + sl.value + ', shots = 0;\nwhile (ammo > 0) {\n    ammo--;\n    shots++;\n}'); av.textContent = sl.value; a2.textContent = sh.textContent = '–'; say.textContent = ''; }
  sel.onchange = sl.oninput = build;
  b.querySelector('.btn.primary').onclick = () => {
    build(); const dw = sel.value === '1'; let ammo = +sl.value, shots = 0; const st = [{ id: 's', t: 'Start. ammo = ' + ammo + '.', a: ammo, k: 0 }];
    if (dw) { do { ammo--; shots++; st.push({ id: 'body', t: 'Body runs first: ammo = ' + ammo + ', shots = ' + shots + '.', a: ammo, k: shots }); st.push({ id: 'c', t: 'Is ' + ammo + ' > 0 ? <b>' + (ammo > 0 ? 'Yes' : 'No') + '</b>.', a: ammo, k: shots }); } while (ammo > 0); }
    else { st.push({ id: 'c', t: 'Is ' + ammo + ' > 0 ? <b>' + (ammo > 0 ? 'Yes' : 'No') + '</b>.', a: ammo, k: shots }); while (ammo > 0) { ammo--; shots++; st.push({ id: 'body', t: 'ammo = ' + ammo + ', shots = ' + shots + '.', a: ammo, k: shots }); st.push({ id: 'c', t: 'Is ' + ammo + ' > 0 ? <b>' + (ammo > 0 ? 'Yes' : 'No') + '</b>.', a: ammo, k: shots }); } }
    st.push({ id: 'e', t: 'Done after <b>' + shots + '</b> shot(s).' + (dw && +sl.value === 0 ? ' Notice: with ammo = 0 the do-while STILL fired once (and ammo went to -1)!' : (!dw && +sl.value === 0 ? ' With ammo = 0 the body never ran.' : '')), a: ammo, k: shots });
    stop = player(fc, st, s => { say.innerHTML = s.t; a2.textContent = s.a; sh.textContent = s.k; }, null, 650);
  };
  build(); return w;
};

/* ---------------------------------------------------- flowchart: switch */
W.flowSwitch = function () {
  const [w, b] = shell('🎮 switch flowchart — keyboard controls (and fall-through)', 'pick a key; toggle the missing break');
  const uid = H.uid();
  const fc = flowchart({
    uid, w: 640, h: 330, label: 'switch flowchart', nodes: [
      { id: 'sw', type: 'dec', text: 'switch (key)', x: 320, y: 40, w: 180, h: 62 },
      { id: 'cw', type: 'proc', text: "case 'w'", x: 90, y: 135, w: 100, h: 34 }, { id: 'ca', type: 'proc', text: "case 'a'", x: 235, y: 135, w: 100, h: 34 }, { id: 'cs', type: 'proc', text: "case 's'", x: 380, y: 135, w: 100, h: 34 }, { id: 'cd', type: 'proc', text: 'default', x: 535, y: 135, w: 100, h: 34 },
      { id: 'aw', type: 'io', text: 'move up', x: 90, y: 215, w: 100, h: 34 }, { id: 'aa', type: 'io', text: 'move left', x: 235, y: 215, w: 100, h: 34 }, { id: 'as', type: 'io', text: 'move down', x: 380, y: 215, w: 100, h: 34 }, { id: 'ad', type: 'io', text: 'ignore key', x: 535, y: 215, w: 100, h: 34 },
      { id: 'e', type: 'term', text: 'after the switch', x: 320, y: 300, w: 150, h: 34 }],
    edges: [{ from: 'sw', to: 'cw', fs: 'l', ts: 't', via: [[90, 40]] }, { from: 'sw', to: 'ca', fs: 'b', ts: 't', via: [[300, 90], [235, 90]] }, { from: 'sw', to: 'cs', fs: 'b', ts: 't', via: [[340, 90], [380, 90]] }, { from: 'sw', to: 'cd', fs: 'r', ts: 't', via: [[535, 40]] },
      { from: 'cw', to: 'aw' }, { from: 'ca', to: 'aa' }, { from: 'cs', to: 'as' }, { from: 'cd', to: 'ad' },
      { from: 'aw', to: 'e', fs: 'b', ts: 'l', via: [[90, 300]] }, { from: 'aa', to: 'e', fs: 'b', ts: 't', via: [[235, 262], [300, 262], [300, 283]] }, { from: 'as', to: 'e', fs: 'b', ts: 't', via: [[380, 262], [340, 262], [340, 283]] }, { from: 'ad', to: 'e', fs: 'b', ts: 'r', via: [[535, 300]] }, { from: 'aa', to: 'as', fs: 'r', ts: 'l' }],
  });
  b.innerHTML = '<div class="row"><label class="small">key = </label><select class="field"><option>w</option><option selected>a</option><option>s</option><option>x</option></select><label class="small"><input type="checkbox" class="ft"> remove <code>break;</code> after case \'a\'</label><button class="btn primary">▶ Run</button></div><div class="fcbox" style="margin-top:8px"></div><pre class="mono small code" style="margin:6px 0 0"></pre><p class="small muted say" style="min-height:2.5em"></p>';
  const sel = b.querySelector('select'), ft = b.querySelector('.ft'), cd = b.querySelector('.code'), say = b.querySelector('.say'); let stop = null;
  b.querySelector('.fcbox').appendChild(fc.svg);
  function code_() { cd.innerHTML = highlight("switch (key) {\n    case 'w': move_up();    break;\n    case 'a': move_left();" + (ft.checked ? '          // ← no break!' : '    break;') + "\n    case 's': move_down();  break;\n    default:  ignore();\n}"); }
  ft.onchange = code_; code_();
  b.querySelector('.btn.primary').onclick = () => {
    stop && stop(); const k = sel.value; const path = [{ id: 'sw', t: 'Compare key (' + k + ') with each case.' }];
    if (k === 'w') path.push({ id: 'cw', t: "Matches case 'w'." }, { id: 'aw', t: 'Moves up, then <code>break</code> jumps out.' });
    else if (k === 'a') { path.push({ id: 'ca', t: "Matches case 'a'." }, { id: 'aa', t: 'Moves left.' }); if (ft.checked) path.push({ id: 'as', t: '<b style="color:var(--bad)">No break → execution FALLS THROUGH</b> into the next case and also moves down!' }); }
    else if (k === 's') path.push({ id: 'cs', t: "Matches case 's'." }, { id: 'as', t: 'Moves down.' });
    else path.push({ id: 'cd', t: 'No case matches → <code>default</code> runs.' }, { id: 'ad', t: 'Ignored.' });
    path.push({ id: 'e', t: 'Continue after the switch.' }); stop = player(fc, path, s => { say.innerHTML = s.t; }, null, 800);
  };
  return w;
};

/* ------------------------------------------------- flowchart: Win32 file API */
W.flowApi = function () {
  const [w, b] = shell('🪟 Win32 call pattern: open → check → use → close', 'choose a scenario and run the flowchart');
  const uid = H.uid();
  const fc = flowchart({
    uid, w: 610, h: 470, label: 'file API flowchart', nodes: [
      { id: 's', type: 'term', text: 'start', x: 230, y: 24, w: 100, h: 32 }, { id: 'cf', type: 'io', text: 'h = CreateFileA(...)', x: 230, y: 84, w: 220, h: 38 },
      { id: 'ok', type: 'dec', text: 'h == INVALID_\nHANDLE_VALUE ?', x: 230, y: 170, w: 230, h: 76 }, { id: 'err', type: 'io', text: 'GetLastError() → report', x: 480, y: 170, w: 170, h: 44 },
      { id: 'wf', type: 'io', text: 'WriteFile(h, ...)', x: 230, y: 265, w: 190, h: 38 }, { id: 'wok', type: 'dec', text: 'returned TRUE ?', x: 230, y: 340, w: 190, h: 62 },
      { id: 'werr', type: 'io', text: 'handle the failure', x: 480, y: 340, w: 150, h: 38 }, { id: 'cl', type: 'io', text: 'CloseHandle(h)', x: 230, y: 420, w: 190, h: 36 }, { id: 'e', type: 'term', text: 'end', x: 480, y: 440, w: 90, h: 32 }],
    edges: [{ from: 's', to: 'cf' }, { from: 'cf', to: 'ok' }, { from: 'ok', to: 'err', fs: 'r', ts: 'l', label: 'yes (failed)', lp: [345, 160] }, { from: 'ok', to: 'wf', label: 'no (valid)', lp: [262, 228] }, { from: 'wf', to: 'wok' },
      { from: 'wok', to: 'werr', fs: 'r', ts: 'l', label: 'no', lp: [338, 332] }, { from: 'wok', to: 'cl', label: 'yes', lp: [246, 394] }, { from: 'werr', to: 'cl', fs: 'b', ts: 'r', via: [[480, 420]] }, { from: 'cl', to: 'e', fs: 'r', ts: 'l' }, { from: 'err', to: 'e', fs: 'r', ts: 'r', via: [[588, 170], [588, 440]] }],
  });
  b.innerHTML = '<div class="row"><select class="field"><option value="0">Everything works</option><option value="1">Cannot open the file (e.g. bad path)</option><option value="2">Opened, but the write fails (disk full / read-only)</option></select><button class="btn primary">▶ Run</button></div><div class="grid2" style="align-items:start;margin-top:10px"><div class="fcbox"></div><div><pre class="mono small code" style="margin:0"></pre><p class="small muted say" style="min-height:3em"></p><div class="callout warn" style="margin:8px 0"><span class="ico">🔑</span><div><h4>Golden rule of the Win32 API</h4><p class="small">Almost every call can fail. <b>Check the return value</b> every time, and always release what you acquired (<code>CloseHandle</code>) — even on the error path.</p></div></div></div></div>';
  b.querySelector('.fcbox').appendChild(fc.svg);
  b.querySelector('.code').innerHTML = highlight('HANDLE h = CreateFileA("save.dat", GENERIC_WRITE, 0, NULL,\n                       CREATE_ALWAYS, FILE_ATTRIBUTE_NORMAL, NULL);\nif (h == INVALID_HANDLE_VALUE) {\n    printf("open failed, error %lu\\n", GetLastError());\n    return 1;\n}\nDWORD n;\nif (!WriteFile(h, data, size, &n, NULL)) {\n    puts("write failed");\n}\nCloseHandle(h);');
  const sel = b.querySelector('select'), say = b.querySelector('.say'); let stop = null;
  b.querySelector('.btn.primary').onclick = () => {
    stop && stop(); const sc = +sel.value; const p = [{ id: 's', t: 'Program starts.' }, { id: 'cf', t: 'Ask Windows to open/create the file. It returns a handle — or INVALID_HANDLE_VALUE.' }, { id: 'ok', t: 'Always test the result before using the handle.' }];
    if (sc === 1) p.push({ id: 'err', t: 'Failed → GetLastError tells <i>why</i> (e.g. 2 = file not found, 5 = access denied). We stop here — there is no handle to close.' }, { id: 'e', t: 'Done.' });
    else { p.push({ id: 'wf', t: 'The handle is valid → write the data.' }, { id: 'wok', t: sc === 2 ? 'WriteFile returned FALSE.' : 'WriteFile returned TRUE.' }); if (sc === 2) p.push({ id: 'werr', t: 'Report the failure…' }); p.push({ id: 'cl', t: 'Always close the handle (even after a failed write) or you leak a kernel object.' }, { id: 'e', t: 'Done.' }); }
    stop = player(fc, p, s => { say.innerHTML = s.t; }, null, 850);
  };
  return w;
};

/* --------------------------------------------------- flowchart: debugging */
W.flowDebug = function () {
  const [w, b] = shell('🩺 "My program doesn\'t work" — an interactive troubleshooting flowchart', 'answer the questions');
  const uid = H.uid();
  const N = {
    s: { type: 'term', text: 'my code is wrong', x: 260, y: 24, w: 150, h: 32 },
    c1: { type: 'dec', text: 'Compile error?', x: 260, y: 100, w: 170, h: 64 },
    r1: { type: 'io', text: 'Read the FIRST error only\nfix that line (or the one above)', x: 500, y: 100, w: 220, h: 50 },
    c2: { type: 'dec', text: 'Crashes\nwhile running?', x: 260, y: 200, w: 170, h: 68 },
    r2: { type: 'io', text: 'Step through; find the bad\npointer / index / NULL', x: 500, y: 200, w: 220, h: 50 },
    c3: { type: 'dec', text: 'Output wrong?', x: 260, y: 300, w: 170, h: 64 },
    r3: { type: 'io', text: 'Step through; watch the\nvariables vs your expectation', x: 500, y: 300, w: 220, h: 50 },
    d: { type: 'term', text: 'it works 🎉', x: 260, y: 395, w: 140, h: 34 },
  };
  const nodes = Object.entries(N).map(([id, n]) => Object.assign({ id }, n));
  const fc = flowchart({ uid, w: 640, h: 430, label: 'debugging flowchart', nodes, edges: [
    { from: 's', to: 'c1' }, { from: 'c1', to: 'r1', fs: 'r', ts: 'l', label: 'yes', lp: [352, 92] }, { from: 'c1', to: 'c2', label: 'no', lp: [278, 150] },
    { from: 'r1', to: 'c1', fs: 'b', ts: 'r', via: [[500, 130], [400, 130], [400, 100]] },
    { from: 'c2', to: 'r2', fs: 'r', ts: 'l', label: 'yes', lp: [352, 192] }, { from: 'c2', to: 'c3', label: 'no', lp: [278, 255] }, { from: 'c3', to: 'r3', fs: 'r', ts: 'l', label: 'yes', lp: [352, 292] }, { from: 'c3', to: 'd', label: 'no', lp: [278, 358] }] });
  b.innerHTML = '<div class="grid2" style="align-items:start"><div class="fcbox"></div><div><div class="pipebox say" style="min-height:120px"></div><div class="row opts" style="margin-top:10px"></div><div class="callout real" style="margin:14px 0 0"><span class="ico">🕵️</span><div><h4>Detective rule</h4><p class="small">Never guess. <b>Make the bug visible</b>: print the variable, or use <i>Step through</i> and watch it change. The bug is always where reality first differs from your expectation.</p></div></div></div></div>';
  b.querySelector('.fcbox').appendChild(fc.svg);
  const say = b.querySelector('.say'), opts = b.querySelector('.opts');
  const T = { s: ['Something is wrong. Let\'s find out what kind of problem it is.', [['Start', 'c1']]], c1: ['Does the compiler refuse to build the program (red error text, nothing runs)?', [['Yes', 'r1'], ['No', 'c2']]], r1: ['Compilers report one real error and then a cascade of confused follow-ups. Fix the <b>first</b> one, the line it points to <i>or the line above it</i> (missing ;), then compile again.', [['Fixed it — compile again', 'c1']]],
    c2: ['It builds. When it runs, does it <b>crash</b> or freeze (access violation, "stopped working")?', [['Yes', 'r2'], ['No', 'c3']]], r2: ['Crashes are almost always: NULL pointer, array index out of range, use-after-free, or infinite recursion. Step through to the last line before the crash.', [['Found and fixed it', 'c3']]],
    c3: ['It runs without crashing. Is the <b>output</b> wrong?', [['Yes', 'r3'], ['No', 'd']]], r3: ['This is a <i>logic error</i>. Compare each variable with the value you expect, line by line — the first mismatch is the bug (off-by-one, integer division, = vs ==…).', [['Fixed it', 'c3']]], d: ['Nothing left to fix. Write a test, commit, celebrate!', [['Restart', 's']]] };
  function go(id) { fc.hot(id); const [t, o] = T[id]; say.innerHTML = t; opts.innerHTML = ''; o.forEach(([lab, nxt]) => { const bt = el('button', 'btn' + (o.length === 1 ? ' primary' : ''), lab); bt.onclick = () => go(nxt); opts.appendChild(bt); }); }
  go('s'); return w;
};

/* ----------------------------------------------------------- handle table */
W.handles = function () {
  const [w, b] = shell('🎫 What is a HANDLE? A ticket into Windows\' private table', 'open and close things');
  b.innerHTML = '<div class="row"><button class="btn" data-k="file">CreateFileA(...)</button><button class="btn" data-k="window">CreateWindow(...)</button><button class="btn" data-k="thread">CreateThread(...)</button></div><div class="grid2" style="margin-top:14px;align-items:start"><div><h6 class="muted small" style="margin:0 0 6px">YOUR PROGRAM (variables)</h6><div class="mine"></div></div><div><h6 class="muted small" style="margin:0 0 6px">WINDOWS KERNEL (private — you cannot look inside)</h6><div class="kern"></div></div></div><div class="pipebox say" style="min-height:54px;margin-top:12px">Press a button to ask Windows for a resource.</div>';
  const mine = b.querySelector('.mine'), kern = b.querySelector('.kern'), say = b.querySelector('.say'); let items = [], next = 0x104;
  const ICON = { file: '📄', window: '🪟', thread: '🧵' }, NAME = { file: 'File object "save.dat"', window: 'Window object (title bar, pixels)', thread: 'Thread object (a running flow of code)' };
  function render(msg) {
    mine.innerHTML = items.map((it, i) => '<div class="row" style="margin-bottom:6px"><code>HANDLE h' + i + ' = ' + hx(it.h, 4) + ';</code><button class="btn sm" data-i="' + i + '">CloseHandle(h' + i + ')</button></div>').join('') || '<span class="muted small">(no handles)</span>';
    kern.innerHTML = items.map(it => '<div style="border:1.5px solid var(--line);border-radius:8px;padding:6px 10px;margin-bottom:6px;background:var(--panel2)"><b class="mono small">handle ' + hx(it.h, 4) + '</b> ➜ ' + ICON[it.k] + ' ' + NAME[it.k] + '</div>').join('') || '<span class="muted small">(table is empty)</span>';
    mine.querySelectorAll('[data-i]').forEach(x => x.onclick = () => { const it = items.splice(+x.dataset.i, 1)[0]; render('Windows removed ' + hx(it.h, 4) + ' from the table and released the ' + it.k + '. <b>Forget this call and the resource leaks</b> until your process exits. Using the number afterwards is a bug.'); });
    if (msg) say.innerHTML = msg;
  }
  b.querySelectorAll('[data-k]').forEach(x => x.onclick = () => { if (items.length > 5) return; const it = { k: x.dataset.k, h: next }; next += 4; items.push(it); render('Windows created the object <b>inside the kernel</b> and gave you just a <b>number</b> (' + hx(it.h, 4) + '). The number is meaningless to you; pass it back to the API to say “that one”.'); });
  render(); return w;
};

/* ------------------------------------------------------ types decision tree */
W.typePicker = function () {
  const [w, b] = shell('🧭 Which type should I use? — a decision flowchart', 'answer about your data');
  const Q = {
    a: ['What kind of data is it?', [['Whole numbers (score, count, index)', 'b'], ['Numbers with decimals (speed, price)', 'c'], ['A single letter or symbol', 'd'], ['Text (a name, a message)', 'e'], ['An address of something else', 'f']]],
    b: ['How big can the number get?', [['Small: 0–255 (a colour channel, a tiny flag)', 'r1'], ['Up to about ±2 billion (most things)', 'r2'], ['Can exceed 2 billion (file sizes, timers, big IDs)', 'r3'], ['It can never be negative (a count, a size)', 'r4']]],
    c: ['How exact must it be?', [['Normal game maths (position, speed)', 'r5'], ['Scientific / money-like precision', 'r6']]],
    d: ['One character', 'r7'], e: ['Text', 'r8'], f: ['Pointer', 'r9'],
  };
  const R = { r1: ['unsigned char (or BYTE / uint8_t)', '1 byte. Wraps at 255 → 0.'], r2: ['int', '4 bytes, ±2.1 billion. The default choice.'], r3: ['long long', '8 bytes, ±9.2 quintillion. Print with %lld.'], r4: ['unsigned int (or size_t / DWORD)', 'Never negative — but beware: 0 - 1 wraps to 4 billion!'], r5: ['float', '4 bytes, ~7 digits. Fast; great for game maths. Literal: 2.5f'], r6: ['double', '8 bytes, ~15 digits. The default for decimals in C. Never compare with ==.'], r7: ['char', '1 byte holding an ASCII code. Literal: \'A\''], r8: ['char name[N];  or  const char *name', 'Array of char ending in \\0. Remember the extra byte for the terminator!'], r9: ['T * (e.g. int *p, void *p, HANDLE)', '8 bytes on 64-bit. Holds an address. Initialise to NULL.'] };
  b.innerHTML = '<div class="pipebox say" style="min-height:140px"></div><div class="row opts" style="margin-top:10px"></div><div class="trail small muted" style="margin-top:10px"></div>';
  const say = b.querySelector('.say'), opts = b.querySelector('.opts'), trail = b.querySelector('.trail'); let path = [];
  function go(id, label) {
    if (label) path.push(label); trail.innerHTML = path.length ? 'Your path: ' + path.map(esc).join(' → ') : '';
    opts.innerHTML = '';
    if (R[id]) { say.innerHTML = '<div style="font-size:1.3rem">✅ Use <code style="font-size:1.2rem"><b>' + esc(R[id][0]) + '</b></code></div><p>' + R[id][1] + '</p>'; const bt = el('button', 'btn primary', '↺ Ask again'); bt.onclick = () => { path = []; go('a'); }; opts.appendChild(bt); return; }
    const q = Q[id]; if (typeof q[1] === 'string') { go(q[1], q[0]); return; }
    say.innerHTML = '<b>' + q[0] + '</b>'; q[1].forEach(([lab, nx]) => { const bt = el('button', 'btn', esc(lab)); bt.onclick = () => go(nx, lab.split(' (')[0]); opts.appendChild(bt); });
  }
  go('a'); return w;
};

/* ----------------------------------------------------------- compile flow */
W.errorKinds = function () {
  const [w, b] = shell('🚦 Three kinds of mistakes: compile, run-time and logic', 'run each buggy program');
  const K = [
    ['Compile-time error', 'The compiler refuses. Nothing runs.', '#include <stdio.h>\nint main(void) {\n    int x = 5\n    printf("%d\\n", x);\n    return 0;\n}'],
    ['Run-time error', 'It builds, then crashes while running.', '#include <stdio.h>\nint main(void) {\n    int *p = NULL;\n    printf("before\\n");\n    *p = 1;\n    printf("after\\n");\n    return 0;\n}'],
    ['Logic error', 'It builds and runs, but gives the wrong answer — the sneakiest kind.', '#include <stdio.h>\nint main(void) {\n    int a = 7, b = 2;\n    printf("average of 7 and 2: %d\\n", (a + b) / 2);\n    printf("area of 3x4: %d\\n", 3 + 4);\n    return 0;\n}'],
  ];
  b.innerHTML = '<div class="grid2">' + K.map((k, i) => '<div class="card" style="margin:0"><b>' + k[0] + '</b><p class="small muted" style="margin:.3em 0">' + k[1] + '</p><pre class="mono small" style="overflow:auto;margin:6px 0">' + highlight(k[2]) + '</pre><button class="btn sm" data-i="' + i + '">▶ Run this</button><div class="console" style="margin:8px 0 0;max-height:150px;font-size:12px"></div></div>').join('') + '</div>';
  b.querySelectorAll('[data-i]').forEach(x => x.onclick = () => {
    const i = +x.dataset.i, cons = x.parentNode.querySelector('.console'), r = CInterp.run(K[i][2], { trace: false });
    if (r.phase === 'compile') cons.innerHTML = '<span class="errc">main.c:' + r.errors[0].line + ': error: ' + esc(r.errors[0].msg) + '</span>\n<span class="dim">Nothing was built — the compiler caught it for you.</span>';
    else if (r.ok === false) cons.innerHTML = esc(r.stdout) + '<span class="errc">💥 ' + esc(r.error) + '</span>\n<span class="dim">Built fine, died while running.</span>';
    else cons.innerHTML = esc(r.stdout) + '<span class="warnc">Ran with no complaint… but 7 and 2 average 4.5, and a 3×4 area is 12!</span>\n<span class="dim">Nobody tells you about logic errors — you must test.</span>';
  });
  return w;
};

/* ------------------------------------------------------ pass by value vs pointer */
W.passing = function () {
  const [w, b] = shell('📬 Pass by value vs pass by pointer', 'what does the function really receive?');
  b.innerHTML = '<div class="row"><button class="btn primary" data-m="val">heal(hp) — by value</button><button class="btn primary" data-m="ptr">heal(&amp;hp) — by pointer</button><button class="btn" data-m="rs">reset</button></div><div class="grid2" style="margin-top:12px;align-items:start"><pre class="mono small code" style="margin:0"></pre><div class="svgs"></div></div><div class="pipebox say" style="min-height:54px;margin-top:10px"></div>';
  const cd = b.querySelector('.code'), sv = b.querySelector('.svgs'), say = b.querySelector('.say');
  function draw(hp, fnv, arrow) { sv.innerHTML = '<div class="frame run" style="margin-bottom:8px"><b>main()</b><div class="vars"><div class="var' + (hp.chg ? ' chg' : '') + '"><div class="nm"><span>hp</span><em>int</em></div><div class="vl">' + hp.v + '</div><div class="ad">0x000ffffc</div></div></div></div>' + (fnv ? '<div class="frame"><b>heal()</b><div class="vars"><div class="var"><div class="nm"><span>' + fnv.name + '</span><em>' + fnv.type + '</em></div><div class="vl">' + fnv.v + '</div>' + (arrow ? '<span class="pt">→ points to hp in main</span>' : '<div class="ad">a separate copy!</div>') + '</div></div></div>' : ''); }
  function show(m) {
    if (m === 'rs') { cd.innerHTML = highlight('void heal(int h)  { h += 50; }\nvoid heal2(int *h) { *h += 50; }\n\nint hp = 40;\nheal(hp);     // hp stays 40\nheal2(&hp);   // hp becomes 90'); draw({ v: 40 }); say.innerHTML = 'Press one of the buttons.'; return; }
    if (m === 'val') { cd.innerHTML = highlight('void heal(int h) { h += 50; }\n\nint hp = 40;\nheal(hp);'); draw({ v: 40 }, { name: 'h', type: 'int', v: 90 }); say.innerHTML = '<b>By value:</b> the function got a <b>photocopy</b> of 40. It changed the copy to 90; when it returns the copy is destroyed. <b>hp is still 40.</b>'; }
    else { cd.innerHTML = highlight('void heal2(int *h) { *h += 50; }\n\nint hp = 40;\nheal2(&hp);'); draw({ v: 90, chg: true }, { name: 'h', type: 'int*', v: '0x000ffffc' }, true); say.innerHTML = '<b>By pointer:</b> the function got hp’s <b>address</b>. <code>*h += 50</code> went to that address and changed the real variable. <b>hp is now 90.</b>'; }
  }
  b.querySelectorAll('[data-m]').forEach(x => x.onclick = () => show(x.dataset.m)); show('rs'); return w;
};

/* ----------------------------------------------------- function anatomy */
W.funcAnatomy = function () {
  const [w, b] = shell('🔧 Anatomy of a function', 'click a part');
  const P = {
    ret: ['int', '<b>Return type</b>: what kind of value the function hands back. <code>void</code> = nothing.'], name: ['clamp', '<b>Name</b>: how you call it. Pick a verb that says what it does.'], p1: ['int value', '<b>Parameter</b>: a local variable that receives a <i>copy</i> of the first argument.'],
    p2: ['int lo, int hi', 'More parameters, separated by commas. Each needs its own type.'], body: ['{ … }', '<b>Body</b>: the statements that run when the function is called.'], rt: ['return value;', '<b>Return</b>: ends the function immediately and sends the value back to the caller.'], call: ['clamp(150, 0, 100)', '<b>Call</b>: the numbers inside are <b>arguments</b>. They are copied into the parameters. The call evaluates to the returned value (100).'],
  };
  b.innerHTML = '<pre class="mono" style="font-size:15px;line-height:1.9;margin:0;overflow:auto"><span class="p ty" data-k="ret">int</span> <span class="p fn" data-k="name">clamp</span>(<span class="p" data-k="p1">int value</span>, <span class="p" data-k="p2">int lo, int hi</span>)\n<span class="p" data-k="body">{</span>\n    if (value &lt; lo) return lo;\n    if (value &gt; hi) return hi;\n    <span class="p k" data-k="rt">return value;</span>\n}\n\nint hp = <span class="p" data-k="call">clamp(150, 0, 100)</span>;   <span class="cm">// hp becomes 100</span></pre><div class="pipebox say" style="margin-top:12px;min-height:60px">👆 Click a coloured part.</div>';
  const say = b.querySelector('.say');
  b.querySelectorAll('.p').forEach(p => p.onclick = () => { b.querySelectorAll('.p').forEach(x => x.classList.toggle('on', x === p)); const k = P[p.dataset.k]; say.innerHTML = '<b>' + esc(k[0]) + '</b> — ' + k[1]; });
  return w;
};

W.pageNotes = null;
})(window);
