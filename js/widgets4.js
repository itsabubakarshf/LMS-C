/* widgets4.js — pointers, addresses, structs, double pointers, linked lists, preprocessor & headers */
(function (root) {
'use strict';
const { esc, el, highlight } = Lab;
const W = Widgets, H = W._h;
const { shell } = H;
const hx = n => '0x' + Math.round(n).toString(16).toUpperCase().padStart(6, '0');
const defCards = list => '<div class="dgrid" style="margin-top:12px">' + list.map(d => '<div class="dcard"><b>' + d[0] + '</b><p>' + d[1] + '</p></div>').join('') + '</div>';
const runC = (src, opts) => CInterp.run(src, Object.assign({ trace: false }, opts || {}));

/* ------------------------------------------------------ addresses and & */
W.addrExplorer = function () {
  const [w, b] = shell('📍 Every variable has an address — the & operator reveals it', 'click a variable · change the array type');
  b.innerHTML = '<pre class="mono small code" style="margin:0 0 10px"></pre><div class="mstrip vs" style="padding-top:4px"></div><div class="pipebox say" style="min-height:64px;margin-top:10px"></div>' +
    '<h3 style="margin:18px 0 6px">Arrays: addresses step by exactly sizeof(type)</h3><div class="row"><select class="field"><option>char</option><option selected>int</option><option>double</option></select><code class="decl"></code></div><div class="mstrip arr" style="padding-top:4px;margin-top:8px"></div><div class="pipebox say2" style="min-height:44px;margin-top:8px"></div>';
  const cd = b.querySelector('.code'), vs = b.querySelector('.vs'), say = b.querySelector('.say');
  const prog = '#include <stdio.h>\nint main(void) {\n    int a = 10;\n    int b = 20;\n    char c = \'A\';\n    double d = 3.5;\n    printf("%p %p %p %p", (void*)&a, (void*)&b, (void*)&c, (void*)&d);\n    return 0;\n}';
  const addrs = runC(prog).stdout.split(' ').map(x => parseInt(x, 16));
  const V = [['a', 'int', 10, 4], ['b', 'int', 20, 4], ['c', 'char', "'A'", 1], ['d', 'double', '3.5', 8]];
  cd.innerHTML = highlight('int    a = 10;\nint    b = 20;\nchar   c = \'A\';\ndouble d = 3.5;');
  V.forEach((v, i) => { const c = el('div', 'mcell', '<small>' + hx(addrs[i]) + '</small><div style="padding:10px 4px"><b>' + v[0] + '</b><br>' + esc(v[2]) + '</div><small>' + v[1] + ' · ' + v[3] + ' B</small>'); c.style.cssText = 'width:' + (60 + v[3] * 10) + 'px;cursor:pointer;margin-right:6px;border-radius:8px'; c.onclick = () => { vs.querySelectorAll('.mcell').forEach(x => x.classList.remove('hot')); c.classList.add('hot'); say.innerHTML = '<code>' + v[0] + '</code> holds <b>' + esc(v[2]) + '</b>.<br><code>&amp;' + v[0] + '</code> is its <b>address</b>: <b>' + hx(addrs[i]) + '</b>. <code>sizeof(' + v[0] + ')</code> = ' + v[3] + ' byte' + (v[3] > 1 ? 's' : '') + ', so it occupies ' + hx(addrs[i]) + ' … ' + hx(addrs[i] + v[3] - 1) + '.'; }; vs.appendChild(c); });
  say.innerHTML = '👆 Click a variable. Real addresses come from the built-in compiler (on a real PC they look different, but the idea is identical). Notice that <b>later variables get lower addresses</b>: the stack grows downwards.';
  const sel = b.querySelector('select'), arr = b.querySelector('.arr'), say2 = b.querySelector('.say2'), decl = b.querySelector('.decl');
  function draw() {
    const t = sel.value, n = { char: 1, int: 4, double: 8 }[t];
    const r = runC('#include <stdio.h>\nint main(void){ ' + t + ' arr[4]; printf("%p %p %p %p", (void*)&arr[0], (void*)&arr[1], (void*)&arr[2], (void*)&arr[3]); return 0; }');
    const A = r.stdout.split(' ').map(x => parseInt(x, 16)); decl.textContent = t + ' arr[4];  // 4 × ' + n + ' = ' + 4 * n + ' bytes';
    arr.innerHTML = ''; A.forEach((a, i) => { const c = el('div', 'mcell', '<small>' + hx(a) + '</small><div style="padding:10px 2px">arr[' + i + ']</div><small>+' + i * n + '</small>'); c.style.cssText = 'width:' + (46 + n * 9) + 'px;margin-right:4px;border-radius:6px'; arr.appendChild(c); });
    say2.innerHTML = 'Each address is exactly <b>' + n + '</b> higher than the one before: ' + hx(A[1]) + ' − ' + hx(A[0]) + ' = ' + n + '. That is what <code>p + 1</code> means for a <code>' + t + '*</code>: “move ' + n + ' byte' + (n > 1 ? 's' : '') + ' ahead”.';
  }
  sel.onchange = draw; draw(); return w;
};

/* ------------------------------------------------- reading declarations */
W.ptrRead = function () {
  const [w, b] = shell('🔤 How to read a pointer declaration — right to left', 'pick a declaration');
  const D = [
    ['int x;', [['x', 'x'], ['int', 'is an int']]],
    ['int *p;', [['p', 'p'], ['*', 'is a pointer to'], ['int', 'int']]],
    ['int **pp;', [['pp', 'pp'], ['*', 'is a pointer to'], ['*', 'a pointer to'], ['int', 'int']]],
    ['char *name;', [['name', 'name'], ['*', 'is a pointer to'], ['char', 'char  (a string!)']]],
    ['const char *msg;', [['msg', 'msg'], ['*', 'is a pointer to'], ['char', 'char'], ['const', '(read-only: you cannot change the text through msg)']]],
    ['Player *hero;', [['hero', 'hero'], ['*', 'is a pointer to'], ['Player', 'a Player struct']]],
    ['void *any;', [['any', 'any'], ['*', 'is a pointer to'], ['void', 'something of unknown type']]],
    ['int arr[3];', [['arr', 'arr'], ['[3]', 'is an array of 3'], ['int', 'ints']]],
    ['char *names[2];', [['names', 'names'], ['[2]', 'is an array of 2'], ['*', 'pointers to'], ['char', 'char (two strings)']]],
  ];
  b.innerHTML = '<div class="row">' + D.map((d, i) => '<button class="btn sm" data-i="' + i + '"><code>' + esc(d[0]) + '</code></button>').join('') + '</div><div class="out" style="margin-top:14px"></div><div class="pipebox" style="margin-top:10px"><b>The trick:</b> start at the <b>name</b>, then read outwards. Each <code>*</code> says “pointer to”. Where you put the <code>*</code> in a declaration is a matter of taste: <code>int *p</code>, <code>int* p</code> and <code>int * p</code> are identical.</div>' +
    defCards([['Declaration vs. dereference', 'In <code>int *p;</code> the star is part of the <b>type</b> (“p is a pointer”). In <code>*p = 5;</code> the star is the <b>dereference operator</b> (“go to where p points”). Same symbol, two jobs.']]);
  const out = b.querySelector('.out');
  function show(i) {
    b.querySelectorAll('[data-i]').forEach(x => x.classList.toggle('primary', +x.dataset.i === i));
    const [decl, words] = D[i]; let k = 0; out.innerHTML = '<div style="font:700 1.4rem var(--mono);margin-bottom:10px">' + esc(decl) + '</div><div class="row chips"></div>';
    const chips = out.querySelector('.chips');
    const step = () => { if (k >= words.length) return; const c = el('span', 'msg', '<b>' + esc(words[k][1]) + '</b>'); c.style.cssText = 'font:600 15px var(--sans);padding:6px 14px'; chips.appendChild(c); if (k < words.length - 1) chips.appendChild(el('span', 'muted', '→')); k++; setTimeout(step, 420); };
    step();
  }
  b.querySelectorAll('[data-i]').forEach(x => x.onclick = () => show(+x.dataset.i)); show(1); return w;
};

/* -------------------------------------------------- pointer to pointer */
W.ptrChain = function () {
  const [w, b] = shell('🔗 Pointer to pointer: arrows pointing at arrows', 'run the statements in any order');
  b.innerHTML = '<div class="row stm"></div><div class="svgbox" style="margin-top:10px"></div><pre class="mono small code" style="margin:6px 0 0;min-height:60px"></pre><div class="pipebox say" style="min-height:54px;margin-top:8px"></div>';
  const stm = b.querySelector('.stm'), box = b.querySelector('.svgbox'), cd = b.querySelector('.code'), say = b.querySelector('.say');
  let st, log; const reset = () => { st = { x: 10, y: 20, p: null, pp: null }; log = ['int x = 10, y = 20;', 'int *p = NULL;', 'int **pp = NULL;']; }; reset();
  const A = { x: 0xFFFF8, y: 0xFFFF4, p: 0xFFFE8, pp: 0xFFFE0 }; const POS = { x: [100, 36], y: [380, 36], p: [100, 150], pp: [100, 262] };
  const ACT = [
    ['p = &x;', s => { s.p = 'x'; return 'p now holds the address of x.'; }], ['pp = &p;', s => { s.pp = 'p'; return 'pp holds the address of <b>p</b> (a pointer variable has an address too!).'; }],
    ['**pp = 99;', s => { if (!s.pp || !s.p) return '💥 NULL somewhere in the chain — dereferencing it would crash.'; s[s.p] = 99; return 'First star: follow pp to p. Second star: follow p to ' + s.p + '. Write 99 there. <code>**pp</code> is <b>' + s.p + '</b> itself.'; }],
    ['*pp = &y;', s => { if (!s.pp) return '💥 pp is NULL.'; s[s.pp] = 'y'; return 'One star: follow pp to <b>p</b> and change <b>p</b> so it now points at y. We re-aimed a pointer <i>through</i> another pointer — the key use of double pointers.'; }],
    ['p = NULL;', s => { s.p = null; return 'p points nowhere. pp still points at p.'; }], ['reset', null]];
  ACT.forEach(a => { const bt = el('button', 'btn sm', '<code>' + a[0] + '</code>'); bt.onclick = () => { if (!a[1]) { reset(); draw('Reset.'); return; } log.push(a[0]); if (log.length > 7) log.splice(3, 1); draw(a[1](st)); }; stm.appendChild(bt); });
  function draw(msg) {
    let s = '<svg viewBox="0 0 520 320" class="flow" style="max-height:330px"><defs><marker id="ca" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="12" markerHeight="12" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--accent)"/></marker></defs>';
    const box1 = (k, label, val, ptr) => { const [cx, cy] = POS[k]; return '<rect x="' + (cx - 66) + '" y="' + (cy - 26) + '" width="132" height="58" rx="8" fill="var(--panel)" stroke="' + (ptr ? 'var(--accent)' : 'var(--muted)') + '" stroke-width="2"/><text x="' + cx + '" y="' + (cy - 8) + '" text-anchor="middle" style="font:600 12px var(--mono);fill:var(--muted)">' + label + ' @' + hx(A[k]).slice(2) + '</text><text x="' + cx + '" y="' + (cy + 18) + '" text-anchor="middle" style="font:700 17px var(--mono);fill:' + (val === 'NULL' ? 'var(--bad)' : 'var(--ink)') + '">' + val + '</text>'; };
    s += box1('x', 'int x', st.x, false) + box1('y', 'int y', st.y, false) + box1('p', 'int* p', st.p ? hx(A[st.p]).slice(2) : 'NULL', true) + box1('pp', 'int** pp', st.pp ? hx(A[st.pp]).slice(2) : 'NULL', true);
    if (st.p) { const [x2, y2] = POS[st.p]; s += '<path d="M' + (POS.p[0] + 20) + ' ' + (POS.p[1] - 28) + ' C ' + (POS.p[0] + 20) + ' ' + 100 + ', ' + x2 + ' ' + 90 + ', ' + x2 + ' ' + (y2 + 34) + '" fill="none" stroke="var(--accent)" stroke-width="2.5" marker-end="url(#ca)"/>'; }
    if (st.pp) s += '<path d="M' + (POS.pp[0] + 20) + ' ' + (POS.pp[1] - 28) + ' L ' + (POS.pp[0] + 20) + ' ' + (POS.p[1] + 36) + '" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-dasharray="6 4" marker-end="url(#ca)"/>';
    box.innerHTML = s + '</svg>'; cd.innerHTML = highlight(log.join('\n')); if (msg) say.innerHTML = msg;
  }
  draw('Try: <code>p = &x;</code> → <code>pp = &p;</code> → <code>**pp = 99;</code>, then <code>*pp = &y;</code>.'); return w;
};

/* ---------------------------------- why double pointers: changing a caller's pointer */
W.ptrAlloc = function () {
  const [w, b] = shell('🧰 Why do we need int **? To change the CALLER’s pointer', 'compare the two functions');
  b.innerHTML = '<div class="row"><button class="btn primary" data-m="a">alloc(int *p) — pointer by value</button><button class="btn primary" data-m="b">alloc(int **pp) — pointer to pointer</button></div><div class="grid2" style="margin-top:12px;align-items:start"><pre class="mono small code" style="margin:0"></pre><div class="st"></div></div><div class="pipebox say" style="min-height:60px;margin-top:10px"></div>';
  const cd = b.querySelector('.code'), st = b.querySelector('.st'), say = b.querySelector('.say');
  const card = (n, ty, v, extra) => '<div class="var' + (extra === 'chg' ? ' chg' : '') + '" style="display:inline-block;margin:0 8px 8px 0"><div class="nm"><span>' + n + '</span><em>' + ty + '</em></div><div class="vl">' + v + '</div></div>';
  function show(m) {
    if (m === 'a') {
      cd.innerHTML = highlight('void alloc(int *p) {\n    p = malloc(sizeof(int));   // changes the COPY\n    *p = 42;\n}\n\nint main(void) {\n    int *ptr = NULL;\n    alloc(ptr);\n    // ptr is still NULL here!\n}');
      st.innerHTML = '<div class="frame"><b>main()</b><div class="vars">' + card('ptr', 'int*', '<span style="color:var(--bad)">NULL</span>') + '</div></div><div class="frame run"><b>alloc()</b><div class="vars">' + card('p', 'int*', '0x010000 → heap', 'chg') + '</div></div><div class="heapblk">0x010000 · 4 B (42) <b style="color:var(--bad)">&nbsp;LEAKED — nobody can reach it</b></div>';
      say.innerHTML = '<b>Pointer by value:</b> <code>alloc</code> received a <i>copy</i> of ptr (NULL). It pointed the copy at new memory; when it returned the copy vanished. <b>main’s ptr is still NULL</b> and the block is leaked.';
    } else {
      cd.innerHTML = highlight('void alloc(int **pp) {\n    *pp = malloc(sizeof(int));  // changes ptr itself\n    **pp = 42;\n}\n\nint main(void) {\n    int *ptr = NULL;\n    alloc(&ptr);       // pass the ADDRESS of ptr\n    // ptr now points to the block\n}');
      st.innerHTML = '<div class="frame run"><b>main()</b><div class="vars">' + card('ptr', 'int*', '0x010000 → heap', 'chg') + '</div></div><div class="frame"><b>alloc()</b><div class="vars">' + card('pp', 'int**', '→ ptr in main') + '</div></div><div class="heapblk">0x010000 · 4 B (42) in use</div>';
      say.innerHTML = '<b>Pointer to pointer:</b> <code>&amp;ptr</code> gives alloc the <i>address of main’s pointer</i>. <code>*pp</code> <b>is</b> main’s <code>ptr</code>, so assigning to it re-aims the real pointer. Rule: <b>to change a variable inside a function, pass its address</b> — and if the variable is itself a pointer, its address is a pointer to pointer.';
    }
  }
  b.querySelectorAll('[data-m]').forEach(x => x.onclick = () => show(x.dataset.m)); show('a'); return w;
};

/* ------------------------------------------------------ linked-list algorithms */
W.listWalk = function () {
  const [w, b] = shell('🚶 Linked list algorithms, one pointer-step at a time', 'choose an algorithm and step through it');
  const ALG = {
    traverse: { title: 'Traverse (print every value)', code: ['Node *cur = head;', 'while (cur != NULL) {', '    printf("%d ", cur->value);', '    cur = cur->next;', '}'] },
    append: { title: 'Append 40 at the end', code: ['Node *n = malloc(sizeof(Node));', 'n->value = 40;  n->next = NULL;', 'Node *cur = head;', 'while (cur->next != NULL)', '    cur = cur->next;', 'cur->next = n;'] },
    del: { title: 'Delete the node holding 20', code: ['Node *prev = NULL, *cur = head;', 'while (cur && cur->value != 20) {', '    prev = cur;', '    cur = cur->next;', '}', 'if (prev) prev->next = cur->next;   // unlink', 'free(cur);'] },
  };
  b.innerHTML = '<div class="row"><select class="field">' + Object.entries(ALG).map(([k, a]) => '<option value="' + k + '">' + a.title + '</option>').join('') + '</select><button class="btn primary nx">Next ▶</button><button class="btn rs">Restart</button></div><div class="ll" style="display:flex;align-items:flex-start;flex-wrap:wrap;gap:2px;margin:18px 0 6px;min-height:120px"></div><div class="grid2" style="align-items:start"><pre class="mono small code" style="margin:0"></pre><div class="pipebox say" style="min-height:70px"></div></div><div class="muted small out" style="margin-top:6px"></div>';
  const sel = b.querySelector('select'), ll = b.querySelector('.ll'), cd = b.querySelector('.code'), say = b.querySelector('.say'), outEl = b.querySelector('.out'), nx = b.querySelector('.nx');
  let frames, i;
  const base = () => [{ v: 10, a: 0x10000 }, { v: 20, a: 0x10010 }, { v: 30, a: 0x10020 }];
  function build(k) {
    const f = []; let nodes = base(); const snap = (line, text, o) => f.push(Object.assign({ nodes: nodes.map(n => Object.assign({}, n)), line, text, cur: null, prev: null, head: nodes.length ? 0 : null, out: '' }, o));
    if (k === 'traverse') { let out = ''; snap(0, '<code>cur</code> starts at the first node (head).', { cur: 0 }); for (let c = 0; c < nodes.length; c++) { snap(1, 'Is cur != NULL? <b>Yes</b> — keep going.', { cur: c, out }); out += nodes[c].v + ' '; snap(2, 'Print <code>cur-&gt;value</code> = ' + nodes[c].v + '.', { cur: c, out }); snap(3, '<code>cur = cur-&gt;next</code> — move to the next node.', { cur: c + 1 < nodes.length ? c + 1 : null, out }); } snap(1, 'cur is NULL — the end of the list. Loop stops. Output: <b>' + out + '</b>', { cur: null, out }); }
    else if (k === 'append') {
      snap(0, '<code>malloc</code> a new node on the heap.', {}); const n = { v: 40, a: 0x10030, ghost: true }; nodes.push(n); snap(1, 'Fill it: value 40, next NULL (it will be the last node). It is not linked yet.', {});
      snap(2, '<code>cur</code> starts at head.', { cur: 0 }); for (let c = 0; c < 2; c++) { snap(3, 'Is cur->next NULL? <b>No</b> — there is a node after this one.', { cur: c }); snap(4, 'Move cur forward.', { cur: c + 1 }); } snap(3, 'cur->next is NULL: cur is the <b>last</b> node.', { cur: 2 }); n.ghost = false; snap(5, '<code>cur-&gt;next = n</code> — link the last node to the new one. Done.', { cur: 2 });
    } else {
      snap(0, 'prev = NULL (no node before head), cur = head.', { cur: 0, prev: null });
      snap(1, 'cur->value is 10, not 20 — keep searching.', { cur: 0 }); snap(2, 'prev follows cur…', { cur: 0, prev: 0 }); snap(3, '…and cur moves ahead.', { cur: 1, prev: 0 });
      snap(1, 'cur->value is 20 — <b>found it</b>. Loop stops.', { cur: 1, prev: 0 });
      nodes[0].next = 2; snap(5, '<code>prev-&gt;next = cur-&gt;next</code>: node 10 now skips over node 20 and points straight at node 30. Node 20 is <b>unlinked</b>.', { cur: 1, prev: 0, skip: true });
      nodes[1].freed = true; snap(6, '<code>free(cur)</code> releases node 20’s memory. Without this line it would leak.', { cur: 1, prev: 0, skip: true });
    }
    return f;
  }
  function draw() {
    const f = frames[i], k = sel.value; ll.innerHTML = '';
    ll.appendChild(el('div', 'mono small', '<div style="text-align:center;margin-right:6px;width:46px"><b style="color:var(--accent)">head</b><br>' + (f.nodes.length ? '↓' : 'NULL') + '</div>'));
    f.nodes.forEach((n, j) => {
      const next = n.next !== undefined ? n.next : j + 1; const hasNext = (n.next !== undefined ? true : j < f.nodes.length - 1 && !(f.nodes[j + 1].ghost)) && !n.ghost;
      const marks = (f.cur === j ? '<b style="color:var(--accent)">cur</b> ' : '') + (f.prev === j ? '<b style="color:var(--amber)">prev</b>' : '');
      const nd = el('div', '', '<div style="border:2px solid ' + (n.freed ? 'var(--line)' : n.ghost ? 'var(--amber)' : 'var(--accent)') + ';border-radius:8px;overflow:hidden;font:600 13px var(--mono);min-width:84px;text-align:center;background:var(--panel);' + (n.freed ? 'opacity:.4;text-decoration:line-through;' : '') + '"><div style="background:var(--accent-soft);font-size:10px;color:var(--muted)">0x' + n.a.toString(16) + '</div><div style="padding:3px">' + n.v + '</div><div style="border-top:1px solid var(--line);padding:2px;font-size:11px">next → ' + (n.freed ? '…' : hasNext ? '0x' + f.nodes[next].a.toString(16) : '<b style="color:var(--bad)">NULL</b>') + '</div></div><div style="text-align:center;font:12px var(--mono);height:18px">' + marks + '</div>');
      ll.appendChild(nd); if (j < f.nodes.length - 1 && !n.freed) ll.appendChild(el('span', 'muted', '<div style="padding-top:22px;' + (hasNext && next !== j + 1 ? 'color:var(--amber)" title="this node now skips the next one">↷' : '">' + (hasNext ? '➜' : '·')) + '</div>'));
    });
    cd.innerHTML = ALG[k].code.map((ln, j) => '<span style="display:block;background:' + (j === f.line ? 'color-mix(in srgb,var(--accent) 25%,transparent)' : 'transparent') + '">' + highlight(ln) + ' </span>').join('');
    say.innerHTML = f.text; outEl.textContent = f.out ? 'printed so far: ' + f.out : ''; nx.disabled = i >= frames.length - 1;
  }
  function start() { frames = build(sel.value); i = 0; draw(); }
  sel.onchange = start; b.querySelector('.rs').onclick = start; nx.onclick = () => { if (i < frames.length - 1) { i++; draw(); } };
  start(); return w;
};

/* ------------------------------------------------------ struct access */
W.structAccess = function () {
  const [w, b] = shell('🧱 Structs: . versus -> versus copies', 'run the statements and watch the memory');
  b.innerHTML = '<div class="row stm"></div><div class="grid2 cards" style="margin-top:12px;align-items:start"></div><pre class="mono small code" style="margin:8px 0 0;min-height:60px"></pre><div class="pipebox say" style="min-height:54px;margin-top:8px"></div>';
  const stm = b.querySelector('.stm'), cards = b.querySelector('.cards'), cd = b.querySelector('.code'), say = b.querySelector('.say');
  let hero, copy, ptr, log; const reset = () => { hero = { name: '"Ada"', hp: 100, level: 1 }; copy = null; ptr = false; log = ['typedef struct { char name[8]; int hp; int level; } Player;', 'Player hero = { "Ada", 100, 1 };']; }; reset();
  const A = [['hero.hp -= 30;', 'Direct access with the <b>dot</b>: hero is the struct itself.', () => { hero.hp -= 30; }], ['Player *p = &hero;', 'p holds hero’s <b>address</b>.', () => { ptr = true; }], ['p->level = 5;', '<b>Arrow</b> = “follow the pointer, then take the field”. Same as <code>(*p).level</code>. It changed <b>hero</b>.', () => { if (ptr) hero.level = 5; else return 'Make the pointer first!'; }],
    ['Player copy = hero;', 'A struct assignment <b>copies every field</b>. copy is a separate struct.', () => { copy = Object.assign({}, hero); }], ['copy.hp = 1;', 'Changing the copy does <b>not</b> touch hero.', () => { if (copy) copy.hp = 1; else return 'Make a copy first!'; }], ['reset', '', null]];
  A.forEach(a => { const bt = el('button', 'btn sm', '<code>' + a[0] + '</code>'); bt.onclick = () => { if (!a[2]) { reset(); draw('Reset.'); return; } const r = a[2](); if (typeof r === 'string') { draw('⚠ ' + r); return; } log.push(a[0]); if (log.length > 6) log.splice(2, 1); draw(a[1]); }; stm.appendChild(bt); });
  const sc = (n, s, addr, tag) => '<div class="var" style="display:block"><div class="nm"><span>' + n + '</span><em>Player · 16 B · ' + addr + '</em></div><div class="flds">' + ['name', 'hp', 'level'].map((f, i) => '<div><span>+' + [0, 8, 12][i] + ' ' + f + '</span><span>' + esc(s[f]) + '</span></div>').join('') + '</div>' + (tag || '') + '</div>';
  function draw(msg) { cards.innerHTML = sc('hero', hero, '0x0FFFE0') + (copy ? sc('copy', copy, '0x0FFFD0') : '') + (ptr ? '<div class="var" style="display:block"><div class="nm"><span>p</span><em>Player*</em></div><div class="vl">0x0FFFE0</div><span class="pt">→ points to hero</span></div>' : ''); cd.innerHTML = highlight(log.join('\n')); if (msg) say.innerHTML = msg; }
  draw('Click the statements in order.'); return w;
};

/* ------------------------------------------------------ preprocessor viewer */
W.preprocView = function () {
  const [w, b] = shell('✂️ The preprocessor: see the text the compiler really receives', 'edit the code, toggle DEBUG');
  const P = {
    'Constants (#define)': { code: '#include <stdio.h>\n#define MAX_HP 100\n#define TITLE "Space Miner"\n\nint main(void) {\n    int hp = MAX_HP;\n    printf("%s: %d\\n", TITLE, hp);\n    return 0;\n}', note: 'Every <code>MAX_HP</code> became <code>100</code> before the compiler even looked. No variable named MAX_HP exists.' },
    'Macro with arguments (a trap!)': { code: '#include <stdio.h>\n#define SQUARE(x) x * x\n\nint main(void) {\n    printf("%d\\n", SQUARE(2 + 3));\n    return 0;\n}', note: 'Macros paste <b>text</b>: <code>2 + 3 * 2 + 3</code> = 11, not 25! Fix: <code>#define SQUARE(x) ((x) * (x))</code>.' },
    'Macro, fixed with brackets': { code: '#include <stdio.h>\n#define SQUARE(x) ((x) * (x))\n\nint main(void) {\n    printf("%d\\n", SQUARE(2 + 3));\n    return 0;\n}', note: 'Brackets around the parameter and the whole body keep the maths in order. Real code often uses an inline function instead.' },
    'Debug switch (#ifdef)': { code: '#include <stdio.h>\n\nint main(void) {\n    int hp = 80;\n#ifdef DEBUG\n    printf("[debug] hp = %d\\n", hp);\n#endif\n    printf("playing...\\n");\n    return 0;\n}', note: 'With DEBUG undefined the log line is <b>removed from the program entirely</b> — zero cost in the release build.' },
    'Platform code (_WIN32)': { code: '#include <stdio.h>\n\nint main(void) {\n#ifdef _WIN32\n    puts("running on Windows");\n#else\n    puts("running somewhere else");\n#endif\n    return 0;\n}', note: '<code>_WIN32</code> is predefined by Windows compilers: how one source file supports several platforms.' },
  };
  b.innerHTML = '<div class="row"><select class="field">' + Object.keys(P).map(k => '<option>' + k + '</option>').join('') + '</select><label class="small"><input type="checkbox" class="dbg"> define <code>DEBUG</code> (like <code>-DDEBUG</code>)</label></div>' +
    '<div class="grid2" style="margin-top:10px;align-items:start"><div><h6 class="muted small" style="margin:0 0 4px">YOUR SOURCE (edit me)</h6><textarea class="field src" spellcheck="false" style="width:100%;min-height:210px;font-size:13px;line-height:1.5;white-space:pre"></textarea></div><div><h6 class="muted small" style="margin:0 0 4px">AFTER THE PREPROCESSOR (what the compiler sees)</h6><pre class="mono small after" style="margin:0;min-height:150px;overflow:auto;background:var(--code-bg);border:1px solid var(--line);border-radius:8px;padding:8px 12px"></pre><div class="small muted inc" style="margin-top:4px"></div></div></div>' +
    '<div class="console" style="margin:10px 0 0;font-size:12.5px"></div><div class="pipebox say" style="margin-top:10px;min-height:50px"></div>';
  const sel = b.querySelector('select'), src = b.querySelector('.src'), after = b.querySelector('.after'), inc = b.querySelector('.inc'), con = b.querySelector('.console'), say = b.querySelector('.say'), dbg = b.querySelector('.dbg');
  function render() {
    const d = dbg.checked ? { DEBUG: 1 } : {}; const e = CInterp.expand(src.value, { defines: d });
    after.innerHTML = e.ok ? highlight(e.text) : '<span class="errc">' + esc(e.error) + '</span>';
    inc.innerHTML = e.ok && e.includes.length ? 'Headers pasted in (contents hidden here): ' + e.includes.map(x => '<code>' + esc(x) + '</code>').join(' ') : '';
    const r = runC(src.value, { defines: d });
    con.innerHTML = '<span class="dim">output ▸ </span>' + (r.phase === 'compile' ? '<span class="errc">' + esc(r.errors[0].msg) + '</span>' : esc(r.stdout) + (r.ok === false ? '<span class="errc"> ' + esc(r.error) + '</span>' : ''));
  }
  function load() { const p = P[sel.value]; src.value = p.code; say.innerHTML = '💡 ' + p.note; render(); }
  sel.onchange = load; dbg.onchange = render; src.oninput = render; load(); return w;
};

/* ------------------------------------------------------ include guards */
W.includeGuard = function () {
  const [w, b] = shell('🛡 Include guards: why every header needs one', 'toggle the protection and build');
  const common = g => (g === 'guard' ? '#ifndef COMMON_H\n#define COMMON_H\n' : g === 'once' ? '#pragma once\n' : '') + 'typedef struct { int x, y; } Point;' + (g === 'guard' ? '\n#endif' : '');
  const F = { 'a.h': '#include "common.h"\nPoint origin_a(void);', 'b.h': '#include "common.h"\nPoint origin_b(void);' };
  b.innerHTML = '<div class="row"><label class="small"><input type="radio" name="g" value="none"> no protection</label><label class="small"><input type="radio" name="g" value="guard" checked> <code>#ifndef</code> guard</label><label class="small"><input type="radio" name="g" value="once"> <code>#pragma once</code></label><button class="btn primary">▶ Build</button></div>' +
    '<div class="grid2" style="margin-top:10px;align-items:start"><div><h6 class="muted small" style="margin:0 0 4px">main.c</h6><pre class="mono small" style="margin:0">' + highlight('#include <stdio.h>\n#include "a.h"\n#include "b.h"   // also pulls in common.h!\n\nint main(void) {\n    Point p = {3, 4};\n    printf("%d\\n", p.x + p.y);\n    return 0;\n}') + '</pre><h6 class="muted small" style="margin:10px 0 4px">a.h / b.h</h6><pre class="mono small" style="margin:0">' + highlight('#include "common.h"\nPoint origin_a(void);') + '</pre></div><div><h6 class="muted small" style="margin:0 0 4px">common.h</h6><pre class="mono small ch" style="margin:0"></pre><div class="console" style="margin:10px 0 0;font-size:12.5px;min-height:70px"></div></div></div><div class="pipebox say" style="margin-top:10px;min-height:56px"></div>' +
    defCards([['Include guard', 'The three lines <code>#ifndef X / #define X / #endif</code> around a header: the first time it is included it defines X; every later time the preprocessor skips it.'], ['#pragma once', 'A shorter, widely supported way to say “include this file only once”.']]);
  const ch = b.querySelector('.ch'), con = b.querySelector('.console'), say = b.querySelector('.say');
  const mode = () => b.querySelector('input[name=g]:checked').value;
  const show = () => { ch.innerHTML = highlight(common(mode())); };
  b.querySelectorAll('input[name=g]').forEach(x => x.onchange = () => { show(); con.innerHTML = ''; });
  b.querySelector('.btn.primary').onclick = () => {
    const files = Object.assign({ 'common.h': common(mode()) }, F);
    const main = '#include <stdio.h>\n#include "a.h"\n#include "b.h"\nint main(void) { Point p = {3, 4}; printf("%d\\n", p.x + p.y); return 0; }';
    const r = runC(main, { files });
    if (r.phase === 'compile') { con.innerHTML = '<span class="errc">' + esc(r.errors[0].file || 'main.c') + ':' + r.errors[0].line + ': error: ' + esc(r.errors[0].msg) + '</span>'; say.innerHTML = '<b>Build failed.</b> main.c includes a.h <i>and</i> b.h, and both include common.h — so <code>typedef struct { … } Point;</code> was pasted <b>twice</b>, and C refuses a second definition.'; }
    else { con.innerHTML = '<span class="okc">Build succeeded. Output: ' + esc(r.stdout.trim()) + '</span>'; say.innerHTML = '<b>Works.</b> The second time the preprocessor met common.h it skipped it, so Point was defined once.'; }
  };
  show(); return w;
};
})(window);
