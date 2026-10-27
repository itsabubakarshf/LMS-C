/* widgets3.js — the three Lesson-1 goal diagrams: compiler & linker, fast vs unforgiving, first program */
(function (root) {
'use strict';
const { esc, el, highlight } = Lab;
const W = Widgets, H = W._h;
const { flowchart, player, shell } = H;

const defCards = list => '<div class="dgrid" style="margin-top:14px">' + list.map(d => '<div class="dcard"><b>' + d[0] + '</b><p>' + d[1] + '</p></div>').join('') + '</div>';

/* ================================================== GOAL 1: compiler + linker */
W.compilerLinker = function () {
  const [w, b] = shell('🎯 Goal 1 · What a compiler and a linker do', 'pick a scenario, press Build, click any box');
  w.id = 'dg-compiler';
  const uid = H.uid();
  const nodes = [
    { id: 'main', type: 'io', text: 'main.c', x: 95, y: 34, w: 110, h: 34 }, { id: 'math', type: 'io', text: 'math.c', x: 255, y: 34, w: 110, h: 34 },
    { id: 'comp', type: 'proc', text: 'COMPILER', x: 175, y: 116, w: 250, h: 46 },
    { id: 'o1', type: 'proc', text: 'main.obj', x: 95, y: 206, w: 110, h: 34 }, { id: 'o2', type: 'proc', text: 'math.obj', x: 255, y: 206, w: 110, h: 34 }, { id: 'lib', type: 'io', text: 'C runtime lib\n(printf, malloc…)', x: 440, y: 206, w: 150, h: 46 },
    { id: 'link', type: 'proc', text: 'LINKER', x: 265, y: 300, w: 300, h: 46 },
    { id: 'exe', type: 'term', text: 'program.exe', x: 265, y: 382, w: 170, h: 36 },
  ];
  const fc = flowchart({ uid, w: 560, h: 412, label: 'Compiler and linker pipeline', nodes, edges: [
    { from: 'main', to: 'comp' }, { from: 'math', to: 'comp' }, { from: 'comp', to: 'o1' }, { from: 'comp', to: 'o2' },
    { from: 'o1', to: 'link' }, { from: 'o2', to: 'link' }, { from: 'lib', to: 'link' }, { from: 'link', to: 'exe' },
  ] });
  const INFO = {
    main: ['main.c — source file', 'Your text. Each <code>.c</code> file is compiled <b>separately</b> into its own object file, so big programs can be split into many files.'],
    math: ['math.c — another source file', 'Defines helper functions such as <code>int square(int n)</code> that <code>main.c</code> calls.'],
    comp: ['Compiler', '<b>Reads one .c file at a time</b>, checks the grammar and the types, and translates each function into machine code. It only needs to know a called function’s <i>signature</i> (from a header or prototype) — not its code. Errors here look like <code>error: expected ‘;’</code>.'],
    o1: ['main.obj — object file', 'Machine code for main.c, but with <b>blanks</b>: where it calls <code>square</code> or <code>printf</code> the address is unknown yet.'],
    o2: ['math.obj — object file', 'Machine code for the functions defined in math.c — they are the pieces that will fill main.obj’s blanks.'],
    lib: ['C runtime library', 'Ready-made, already compiled code for <code>printf</code>, <code>malloc</code>, <code>strlen</code>… shipped with the compiler/Windows. Linked into every program that uses it.'],
    link: ['Linker', '<b>Matches every blank to a real function</b> across all object files and libraries, fixes up the addresses, adds start-up code that calls <code>main</code>, and writes the .exe. Error: <code>undefined reference to ‘square’</code> = a called function exists nowhere.'],
    exe: ['program.exe', 'The finished Windows program (a “PE” file). Windows loads it into memory and starts it. No compiler needed on the user’s PC.'],
  };
  b.innerHTML = '<div class="row"><select class="field"><option value="ok">✅ Everything is fine</option><option value="typo">⌨ Typo in main.c (missing ;)</option><option value="miss">📂 math.c was forgotten in the build</option><option value="lib">📚 Misspelled function name (prinft)</option></select><button class="btn primary">▶ Build</button></div>' +
    '<div class="grid2" style="align-items:start;margin-top:10px"><div class="fcbox"></div><div><div class="pipebox say" style="min-height:130px"></div><div class="console" style="margin:10px 0 0;font-size:12.5px;min-height:90px"></div></div></div>' +
    defCards([['Compiler', 'Translates <b>one source file</b> into machine code and checks it for mistakes. Catches grammar and type errors.'], ['Linker', 'Joins <b>all the pieces</b> (object files + libraries) into one program. Catches “function not found” errors.'], ['Object file', 'Half-finished machine code from one source file, with blanks for functions defined elsewhere.'], ['Library', 'A collection of ready-made compiled functions you can reuse (printf lives in one).']]);
  b.querySelector('.fcbox').appendChild(fc.svg);
  fc.svg.querySelectorAll('.node').forEach((g, i) => { g.style.cursor = 'pointer'; g.addEventListener('click', () => { const k = nodes[i].id; fc.hot(k); say.innerHTML = '<b>' + INFO[k][0] + '</b><p>' + INFO[k][1] + '</p>'; }); });
  const say = b.querySelector('.say'), cons = b.querySelector('.console'), sel = b.querySelector('select'); let stop = null;
  say.innerHTML = '👆 Click any box to read its definition, or press <b>Build</b> to watch the whole journey.';
  b.querySelector('.btn.primary').onclick = () => {
    stop && stop(); cons.innerHTML = ''; const sc = sel.value;
    const steps = [{ id: 'main', t: 'You hand <b>main.c</b> to the compiler…' }, { id: 'math', t: '…and <b>math.c</b> too.' }];
    if (sc === 'typo') { steps.push({ id: 'comp', t: '<b style="color:var(--bad)">The compiler stops.</b> It cannot make main.obj from a file with a grammar error. This is a <b>compile-time error</b> — the linker never even starts.', err: 'main.c:5:20: error: expected \';\' before \'return\'\nBuild failed during COMPILATION.' }); }
    else if (sc === 'lib') { steps.push({ id: 'comp', t: '<b style="color:var(--bad)">The compiler does not recognise <code>prinft</code></b> — it was never declared (no header declares it). Compile-time error.', err: "main.c:4:5: error: implicit declaration of function 'prinft'\nBuild failed during COMPILATION." }); }
    else {
      steps.push({ id: 'comp', t: 'The compiler translates each file <i>separately</i>, checking grammar and types.' }, { id: 'o1', t: 'main.obj is ready — but its call to <code>square(7)</code> has a blank where the address should be.' });
      if (sc === 'miss') { steps.push({ id: 'link', t: '<b style="color:var(--bad)">The linker looks for <code>square</code></b> in main.obj, in the libraries… nowhere! math.obj was never built because math.c was forgotten. This is a <b>link-time error</b>: every file compiled fine, yet the program cannot be assembled.', err: "main.obj : error LNK2019: unresolved external symbol square\n(GCC says: undefined reference to `square')\nBuild failed during LINKING." }); }
      else steps.push({ id: 'o2', t: 'math.obj is ready — it contains the code for <code>square</code>.' }, { id: 'lib', t: 'The library supplies the compiled code for <code>printf</code>.' }, { id: 'link', t: 'The linker fills in every blank: <code>square</code> → address in math.obj, <code>printf</code> → address in the library. It also adds start-up code that calls <code>main</code>.' }, { id: 'exe', t: '🎉 <b>program.exe</b> is written. Windows can now run it.', ok: 'Build succeeded: program.exe (10 KB)' });
    }
    stop = player(fc, steps, s => { say.innerHTML = s.t; if (s.err) cons.innerHTML = '<span class="errc">' + esc(s.err) + '</span>'; if (s.ok) cons.innerHTML = '<span class="okc">' + esc(s.ok) + '</span>'; }, null, 1250);
  };
  return w;
};

/* ============================================ GOAL 2: why C is fast / unforgiving */
W.fastUnforgiving = function () {
  const [w, b] = shell('🎯 Goal 2 · Why C is fast — and why it is unforgiving', 'run the race, then try the traps');
  w.id = 'dg-fast';
  b.innerHTML = '<h3 style="margin-top:0">⚡ Why it is fast: do less work per operation</h3><p class="small muted" style="margin-top:0">Simplified model of what happens for <code>c = a + b</code>. Press Race.</p>' +
    '<div class="grid2"><div class="card" style="margin:0"><b>🎮 GDScript (interpreted)</b><ol class="small gd" style="padding-left:1.2em;margin:.4em 0"></ol><div class="bar2" style="height:16px;border-radius:99px;background:var(--panel2);overflow:hidden"><i style="display:block;height:100%;width:0;background:var(--amber);transition:width 1.2s"></i></div></div>' +
    '<div class="card" style="margin:0"><b>⚙️ C (compiled)</b><ol class="small cc" style="padding-left:1.2em;margin:.4em 0"></ol><div class="bar2" style="height:16px;border-radius:99px;background:var(--panel2);overflow:hidden"><i style="display:block;height:100%;width:0;background:var(--accent);transition:width 1.2s"></i></div></div></div>' +
    '<div class="row" style="margin:12px 0"><button class="btn primary race">🏁 Race (1 million additions)</button><span class="muted small res"></span></div>' +
    '<div class="callout real" style="margin:6px 0"><span class="ico">🚚</span><div><h4>Real life</h4><p class="small">A courier who must <b>read the address, check the parcel type and ask the boss</b> at every door (interpreter) versus one who memorised the whole route in advance (compiled code). Same city, very different speed.</p></div></div>' +
    '<h3>🧨 Why it is unforgiving: nobody double-checks you</h3><p class="small muted" style="margin-top:0">Run each program. Notice that C says <b>nothing</b> — it does exactly what you typed, even when that is not what you meant.</p><div class="grid2 traps"></div>' +
    '<div class="tablewrap"><table class="t small"><tr><th>Mistake</th><th>GDScript</th><th>C</th></tr><tr><td>Misspelled variable name</td><td>✅ error message</td><td>✅ compile error (caught before running)</td></tr><tr><td>Typo inside a message</td><td>❌ nobody checks</td><td>❌ nobody checks</td></tr><tr><td>Using a variable you never gave a value</td><td>✅ it starts as null / a default</td><td>❌ garbage value</td></tr><tr><td>Number too big for its type</td><td>✅ (numbers are 64-bit, rarely overflow)</td><td>❌ wraps around silently</td></tr><tr><td>Who is responsible?</td><td>the engine</td><td><b>you, the programmer</b></td></tr></table></div>' +
    defCards([['Interpreter', 'Reads and checks every operation <i>while the program runs</i>. Flexible and safe, but slower.'], ['Compiled code', 'Translated once, ahead of time, into CPU instructions. Runs with no middleman.'], ['Run-time check', 'A safety test performed while running (is this value allowed here?). C has almost none — that is what makes it fast.'], ['Undefined behaviour', 'Code C gives no rules for (like reading a variable you never set). It may give garbage, crash, or seem to work. Not an error message — a trap.'], ['Garbage value', 'Leftover bytes in memory read through an uninitialised variable.']]);
  const gd = ['look up variable <code>a</code> by name', 'check its type (could be anything!)', 'look up variable <code>b</code>', 'check its type', 'find the right “+” for those types', 'create a new Variant for the result', 'store it in <code>c</code>'];
  const cc = ['<code>mov eax, [a]</code> — load a', '<code>add eax, [b]</code> — add b', '<code>mov [c], eax</code> — store c'];
  b.querySelector('.gd').innerHTML = gd.map(x => '<li>' + x + '</li>').join(''); b.querySelector('.cc').innerHTML = cc.map(x => '<li>' + x + '</li>').join('');
  const bars = b.querySelectorAll('.bar2 i'), res = b.querySelector('.res');
  b.querySelector('.race').onclick = () => { bars.forEach(i => { i.style.transition = 'none'; i.style.width = '0'; }); void b.offsetWidth; bars[0].style.transition = 'width 2.4s linear'; bars[1].style.transition = 'width ' + (2.4 * 3 / 7).toFixed(2) + 's linear'; bars[0].style.width = '100%'; bars[1].style.width = '100%'; res.innerHTML = '≈ <b>7 steps vs 3</b> → C does the same job in under half the work (real engines vary, often 10–100× in tight loops).'; };
  const T = [
    ['A typo in your own message', R_(`#include <stdio.h>
int main(void) {
    printf("Welcom to the game!\\n");
    return 0;
}`), 'No error — C has no spell-checker. It prints exactly what you typed, typo included.'],
    ['Dividing two whole numbers', R_(`#include <stdio.h>
int main(void) {
    int pizza = 7;
    int friends = 2;
    printf("Each friend gets %d slices\\n", pizza / friends);
    return 0;
}`), 'No error — whole-number division throws away the .5, so 7 / 2 gives 3.'],
    ['A box you never filled', R_(`#include <stdio.h>
int main(void) {
    int score;
    printf("score = %d\\n", score);
    return 0;
}`), 'No error — "int score;" reserves a box but leaves old junk inside, so you see a strange number.'],
    ['A number too big for its box', R_(`#include <stdio.h>
int main(void) {
    unsigned char lives = 255;
    lives = lives + 1;
    printf("lives = %d\\n", lives);
    return 0;
}`), 'No error — like a car odometer rolling from 99999 to 00000, the number wraps back to 0.'],
  ];
  function R_(s) { return s; }
  const tr = b.querySelector('.traps');
  T.forEach(t => { const c = el('div', 'card', '<b>' + t[0] + '</b><pre class="mono small" style="margin:6px 0;overflow:auto">' + highlight(t[1]) + '</pre><button class="btn sm">▶ Run</button><div class="console" style="margin:8px 0 0;max-height:110px;font-size:12px"></div>'); c.style.margin = '0'; const con = c.querySelector('.console'); c.querySelector('button').onclick = () => { const r = CInterp.run(t[1], { trace: false }); con.innerHTML = esc(r.stdout) + (r.ok === false ? '<span class="errc">💥 ' + esc(r.error) + '</span>\n' : '') + '<span class="warnc">' + esc(t[2]) + '</span>'; }; tr.appendChild(c); });
  return w;
};

/* ========================================================= GOAL 3: first program */
W.firstProgram = function () {
  const [w, b] = shell('🎯 Goal 3 · Run your very first C program', 'the edit → compile → run cycle');
  w.id = 'dg-first';
  const uid = H.uid();
  const nodes = [
    { id: 'w', type: 'io', text: '1. Write / edit\nmain.c', x: 130, y: 36, w: 170, h: 46 }, { id: 'c', type: 'proc', text: '2. Compile\n(build)', x: 130, y: 128, w: 170, h: 46 },
    { id: 'e', type: 'dec', text: 'compile\nerrors?', x: 130, y: 232, w: 160, h: 72 }, { id: 'f', type: 'io', text: 'Read the FIRST error,\nfix that line', x: 380, y: 232, w: 190, h: 46 },
    { id: 'r', type: 'proc', text: '3. Run the program', x: 130, y: 336, w: 190, h: 40 }, { id: 'o', type: 'dec', text: 'output\ncorrect?', x: 130, y: 432, w: 160, h: 72 },
    { id: 'd', type: 'term', text: 'done 🎉', x: 130, y: 524, w: 120, h: 36 }, { id: 'x', type: 'io', text: 'Step through,\nfind the logic bug', x: 380, y: 432, w: 190, h: 46 },
  ];
  const fc = flowchart({ uid, w: 520, h: 560, label: 'Edit compile run cycle', nodes, edges: [
    { from: 'w', to: 'c' }, { from: 'c', to: 'e' }, { from: 'e', to: 'f', fs: 'r', ts: 'l', label: 'yes', lp: [255, 224] }, { from: 'f', to: 'w', fs: 't', ts: 'r', via: [[380, 36]] },
    { from: 'e', to: 'r', label: 'no', lp: [148, 292] }, { from: 'r', to: 'o' }, { from: 'o', to: 'd', label: 'yes', lp: [148, 494] }, { from: 'o', to: 'x', fs: 'r', ts: 'l', label: 'no', lp: [235, 424] }, { from: 'x', to: 'w', fs: 'r', ts: 'r', via: [[505, 432], [505, 36]] },
  ] });
  const INFO = {
    w: ['Write / edit', 'Type your program in a <b>text editor</b> or IDE and save it as <code>main.c</code>. Source code is just text — a C file has no magic in it.'],
    c: ['Compile (build)', 'Run the compiler (in Visual Studio: <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>B</kbd>; with gcc: <code>gcc main.c -o main.exe</code>). It checks and translates your code; then the linker makes the .exe.'],
    e: ['Did the build report errors?', 'Errors mean <b>nothing was built</b> — there is no new .exe to run. Warnings are different: the program still builds, but treat them as bugs in waiting.'],
    f: ['Read the first error', 'Fix the <b>first</b> message only; later ones are often side-effects. The reported line may be the line <i>after</i> the real mistake (missing <code>;</code>).'],
    r: ['Run', 'Launch <code>main.exe</code> (VS: <kbd>Ctrl</kbd>+<kbd>F5</kbd>; terminal: <code>./main.exe</code>). Windows loads the file and starts at <code>main</code>. Output appears in the console window.'],
    o: ['Is the output what you expected?', 'A program can build and run fine and still be <b>wrong</b> (a logic error). Compare the output with what you predicted <i>before</i> running.'],
    x: ['Debug', 'Use <b>Step through</b> (here) or the debugger (in VS: F10) to watch variables change line by line, and find where reality first differs from your plan.'],
    d: ['Done', 'It works! Change something small, rebuild, run again — this loop is the whole day-to-day job of a programmer.'],
  };
  b.innerHTML = '<div class="grid2" style="align-items:start"><div class="fcbox"></div><div><div class="pipebox say" style="min-height:120px"></div><div class="row" style="margin-top:10px"><button class="btn primary a1">▶ Typical first try (a typo)</button><button class="btn a2">▶ Wrong output</button><button class="btn a3">▶ Perfect run</button></div>' +
    '<h6 class="muted small" style="margin:14px 0 4px">YOUR FIRST PROGRAM, ANNOTATED</h6><pre class="mono small" style="margin:0;line-height:1.9;overflow:auto">' + highlight('#include <stdio.h>      // 1. bring in printf') + '\n' + highlight('int main(void) {        // 2. the program starts here') + '\n' + highlight('    printf("Hello!\\n");  // 3. print one line') + '\n' + highlight('    return 0;            // 4. tell Windows "success"') + '\n' + highlight('}') + '</pre>' +
    '<button class="btn" style="margin-top:10px" data-go>👇 Try it in the lab below</button></div></div>' +
    defCards([['Source code', 'The text of your program.'], ['Build', 'Compile + link: turn source into an .exe.'], ['Run', 'Ask Windows to load the .exe and start executing at <code>main</code>.'], ['Console / stdout', 'The text window where <code>printf</code> writes. “Standard output”.'], ['Exit code', 'The number <code>main</code> returns: 0 means success.'], ['IDE', 'An editor + compiler + debugger in one app (Visual Studio, VS Code with extensions, CLion).']]);
  b.querySelector('.fcbox').appendChild(fc.svg);
  const say = b.querySelector('.say'); let stop = null;
  say.innerHTML = '👆 Click any box to see what happens there, or play one of the example journeys.';
  fc.svg.querySelectorAll('.node').forEach((g, i) => { g.style.cursor = 'pointer'; g.addEventListener('click', () => { stop && stop(); const k = nodes[i].id; fc.hot(k); say.innerHTML = '<b>' + INFO[k][0] + '</b><p>' + INFO[k][1] + '</p>'; }); });
  const play = steps => { stop && stop(); stop = player(fc, steps, s => { say.innerHTML = s.t; }, null, 1300); };
  b.querySelector('.a1').onclick = () => play([{ id: 'w', t: 'You type the program but forget the <code>;</code> after <code>printf(...)</code>.' }, { id: 'c', t: 'You press Build.' }, { id: 'e', t: '<b>Yes, errors.</b> No .exe was made.' }, { id: 'f', t: 'You read the first message — “expected ‘;’ before ‘return’” — and add the semicolon on the line <i>above</i>.' }, { id: 'w', t: 'Back to the editor with the fix…' }, { id: 'c', t: 'Build again…' }, { id: 'e', t: 'No errors this time.' }, { id: 'r', t: 'You run it. The console shows <code>Hello!</code>' }, { id: 'o', t: 'Is that what you wanted?' }, { id: 'd', t: 'Yes. 🎉 You just built and ran your first C program!' }]);
  b.querySelector('.a2').onclick = () => play([{ id: 'w', t: 'You write a program meant to print “Hello”.' }, { id: 'c', t: 'Build…' }, { id: 'e', t: 'No errors.' }, { id: 'r', t: 'Run: the console shows <code>Helo</code>.' }, { id: 'o', t: 'Not what you expected: <b>a logic error</b>. The computer did exactly what you typed.' }, { id: 'x', t: 'Step through / re-read the string literal: a letter is missing.' }, { id: 'w', t: 'Fix the text and go round the cycle again.' }]);
  b.querySelector('.a3').onclick = () => play([{ id: 'w', t: 'Write.' }, { id: 'c', t: 'Compile.' }, { id: 'e', t: 'No errors.' }, { id: 'r', t: 'Run.' }, { id: 'o', t: 'Output is right.' }, { id: 'd', t: 'Done! (It rarely goes this smoothly the first time — and that is normal.)' }]);
  b.querySelector('[data-go]').onclick = () => { const l = document.querySelector('.lab'); if (l) l.scrollIntoView({ behavior: 'smooth', block: 'center' }); };
  return w;
};

/* ============================================================ object file inside */
W.objectFile = function () {
  const [w, b] = shell('🎯 Goal 1b · What is inside an object file?', 'open main.obj, then let the linker fill the blanks');
  w.id = 'dg-object';
  b.innerHTML = '<div class="grid2" style="align-items:start"><div><pre class="mono small" style="margin:0 0 8px">' + highlight('// main.c\nint square(int n);          // declared, not defined here\nint main(void) {\n    int r = square(7);\n    printf("%d\\n", r);\n    return 0;\n}') + '</pre><pre class="mono small" style="margin:0">' + highlight('// math.c\nint square(int n) {\n    return n * n;\n}') + '</pre></div>' +
    '<div><div class="row" style="margin-bottom:8px"><button class="btn sm tab on" data-t="main">main.obj</button><button class="btn sm tab" data-t="math">math.obj</button><button class="btn primary sm link">🔗 Link them</button><button class="btn sm rs">↺ Unlink</button></div><div class="objbox"></div></div></div>' +
    '<div class="pipebox say" style="min-height:70px;margin-top:12px"></div>' +
    defCards([['Object file (.obj / .o)', 'The compiler’s output for <b>one</b> source file: machine code plus bookkeeping tables. It cannot run by itself because some addresses are still unknown.'], ['.text section', 'The machine-code bytes of your functions (read-only code).'], ['.data section', 'Initialised global variables and string literals.'], ['Symbol', 'A name the linker cares about: a function or global variable such as <code>main</code>, <code>square</code>, <code>printf</code>.'], ['Defined vs undefined symbol', '<b>Defined</b> = this file contains its code. <b>Undefined</b> (external) = used here but defined somewhere else; the linker must find it.'], ['Relocation entry', 'A note saying “patch the 4 bytes at offset X with the final address of symbol Y”. This is how a blank gets filled.']]);
  const box = b.querySelector('.objbox'), say = b.querySelector('.say'), tabs = b.querySelectorAll('.tab'); let cur = 'main', linked = false;
  const row = (a, bytes, txt, cls) => '<tr' + (cls ? ' style="' + cls + '"' : '') + '><td class="mono">' + a + '</td><td class="mono"><b>' + bytes + '</b></td><td class="mono">' + txt + '</td></tr>';
  function draw() {
    const blank = linked ? 'E8 <span style="color:var(--good)">1A 00 00 00</span>' : 'E8 <span style="color:var(--bad)">00 00 00 00</span>';
    const blank2 = linked ? 'E8 <span style="color:var(--good)">3C 00 00 00</span>' : 'E8 <span style="color:var(--bad)">00 00 00 00</span>';
    let h;
    if (cur === 'main') {
      h = '<div class="muted small">SECTION <b>.text</b> (machine code of main)</div><table class="t small"><tr><th>offset</th><th>bytes</th><th>assembly</th></tr>' +
        row('0x00', '55', 'push rbp', '') + row('0x01', '48 89 E5', 'mov rbp, rsp', '') + row('0x04', 'B9 07 00 00 00', 'mov ecx, 7        ; argument', '') + row('0x09', blank, 'call square' + (linked ? '   → 0x...1A' : '   ← BLANK address!'), 'background:' + (linked ? 'var(--good-soft)' : 'var(--bad-soft)')) + row('0x0E', '89 C2', 'mov edx, eax     ; r', '') + row('0x10', blank2, 'call printf' + (linked ? '   → 0x...3C' : '   ← BLANK address!'), 'background:' + (linked ? 'var(--good-soft)' : 'var(--bad-soft)')) + row('0x15', '31 C0 5D C3', 'xor eax,eax / pop rbp / ret', '') + '</table>' +
        '<div class="muted small">SECTION <b>.data</b>: <code>"%d\\n"</code> → 25 64 0A 00</div><div class="muted small" style="margin-top:6px">SYMBOL TABLE</div><table class="t small"><tr><th>symbol</th><th>status</th><th>meaning</th></tr><tr><td><code>main</code></td><td style="color:var(--good)"><b>DEFINED</b> @0x00</td><td>code lives in this file</td></tr><tr><td><code>square</code></td><td style="color:' + (linked ? 'var(--good)' : 'var(--bad)') + '"><b>' + (linked ? 'RESOLVED → math.obj' : 'UNDEFINED') + '</b></td><td>' + (linked ? 'address patched at 0x0A' : 'defined in some other file') + '</td></tr><tr><td><code>printf</code></td><td style="color:' + (linked ? 'var(--good)' : 'var(--bad)') + '"><b>' + (linked ? 'RESOLVED → C library' : 'UNDEFINED') + '</b></td><td>' + (linked ? 'address patched at 0x11' : 'defined in the C library') + '</td></tr></table>' +
        '<div class="muted small" style="margin-top:6px">RELOCATIONS: patch 4 bytes @0x0A with &amp;square · patch 4 bytes @0x11 with &amp;printf</div>';
    } else {
      h = '<div class="muted small">SECTION <b>.text</b> (machine code of square)</div><table class="t small"><tr><th>offset</th><th>bytes</th><th>assembly</th></tr>' + row('0x00', '89 C8', 'mov eax, ecx', '') + row('0x02', '0F AF C1', 'imul eax, ecx   ; n * n', '') + row('0x05', 'C3', 'ret', '') + '</table>' +
        '<div class="muted small" style="margin-top:6px">SYMBOL TABLE</div><table class="t small"><tr><th>symbol</th><th>status</th><th>meaning</th></tr><tr><td><code>square</code></td><td style="color:var(--good)"><b>DEFINED</b> @0x00</td><td>this file is where square lives' + (linked ? ' — main.obj’s call now points here' : '') + '</td></tr></table><div class="muted small">No relocations: this file calls nobody else, so it has no blanks to fill.</div>';
    }
    box.innerHTML = h; tabs.forEach(t => t.classList.toggle('on', t.dataset.t === cur));
  }
  tabs.forEach(t => t.onclick = () => { cur = t.dataset.t; draw(); say.innerHTML = cur === 'main' ? '<b>main.obj</b> — the compiler could translate <code>main</code> fully, but it had no idea <i>where</i> <code>square</code> and <code>printf</code> would end up, so it left <b>blank (00 00 00 00) addresses</b> and wrote them in the symbol table as UNDEFINED.' : '<b>math.obj</b> — the only thing it offers is the symbol <code>square</code>. The linker will match it to the call in main.obj.'; });
  b.querySelector('.link').onclick = () => { linked = true; draw(); say.innerHTML = '🔗 <b>The linker</b> walked the relocation list: it found <code>square</code> in math.obj and <code>printf</code> in the C library, computed their final addresses and <b>patched the blanks</b> (red → green). Now the code is complete. If a symbol had been found nowhere, you would get <code>undefined reference</code>.'; };
  b.querySelector('.rs').onclick = () => { linked = false; draw(); say.innerHTML = 'Back to the compiler’s output: blanks and UNDEFINED symbols.'; };
  say.innerHTML = '👆 Look at the red blanks in main.obj, open math.obj, then press <b>Link them</b>.'; draw(); return w;
};
})(window);
