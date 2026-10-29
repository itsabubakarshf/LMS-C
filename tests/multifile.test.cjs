// Multi-file builds, headers, include guards and preprocessor features of the mini-compiler.
global.window = global; global.document = {}; require('../js/cinterp.js'); const C = global.CInterp;
let bad = 0; const t = (n, ok, extra) => { console.log((ok ? '✅ ' : '❌ ') + n + (ok ? '' : '  ' + (extra || ''))); if (!ok) bad++; };
const main = '#include <stdio.h>\n#include "util.h"\nint main(void) {\n    printf("%d\\n", square(7));\n    return 0;\n}';
const h = '#ifndef UTIL_H\n#define UTIL_H\nint square(int n);\n#endif';
const c = '#include "util.h"\nint square(int n) { return n * n; }';
let r = C.run(main, { files: { 'util.h': h, 'util.c': c } }); t('header + .c file link and run', r.ok !== false && r.stdout === '49\n', JSON.stringify(r.errors || r.error));
r = C.run(main, { files: { 'util.h': h } }); t('missing util.c → linker error', r.phase === 'compile' && /undefined reference/.test(r.errors[0].msg) && r.errors[0].kind === 'linker error', JSON.stringify(r));
r = C.run(main, { files: { 'util.c': c } }); t('missing header → file not found', r.phase === 'compile' && /No such file/.test(r.errors[0].msg));
const hs = '#ifndef P_H\n#define P_H\ntypedef struct { int x, y; } Point;\n#endif';
const m2 = '#include <stdio.h>\n#include "p.h"\n#include "p.h"\nint main(void) { Point p = {1,2}; printf("%d\\n", p.x + p.y); return 0; }';
r = C.run(m2, { files: { 'p.h': hs } }); t('include guard: header twice is fine', r.ok !== false && r.stdout === '3\n', JSON.stringify(r.errors));
const hn = 'struct P { int x; };';
r = C.run('#include "p.h"\n#include "p.h"\nint main(void){return 0;}', { files: { 'p.h': hn } }); t('no guard: redefinition error mentions include guard', r.phase === 'compile' && /include guard/.test(r.errors[0].msg), JSON.stringify(r.errors));
r = C.run('#include "p.h"\n#include "p.h"\nint main(void){return 0;}', { files: { 'p.h': '#pragma once\n' + hn } }); t('#pragma once works', r.ok !== false, JSON.stringify(r.errors));
// same struct header used from two .c files
const sh = '#ifndef S_H\n#define S_H\ntypedef struct { int hp; } Player;\nvoid heal(Player *p, int n);\n#endif';
const sm = '#include <stdio.h>\n#include "s.h"\nint main(void) { Player p = {10}; heal(&p, 5); printf("%d\\n", p.hp); return 0; }';
const sc = '#include "s.h"\nvoid heal(Player *p, int n) { p->hp += n; }';
r = C.run(sm, { files: { 's.h': sh, 's.c': sc } }); t('struct from header shared by two .c files', r.ok !== false && r.stdout === '15\n', JSON.stringify(r.errors || r.error));
r = C.run('#include <stdio.h>\nint main(void){ printf("%d %s\\n", __LINE__, __FILE__); return 0; }'); t('__LINE__ and __FILE__', r.stdout === '2 main.c\n', r.stdout);
r = C.run('#include <stdio.h>\nint main(void){\n#ifdef _WIN32\n puts("windows");\n#else\n puts("other");\n#endif\nreturn 0;}'); t('_WIN32 predefined', r.stdout === 'windows\n', r.stdout);
r = C.run('#include <stdio.h>\nint main(void){\n#ifdef DEBUG\n puts("debug on");\n#endif\n puts("hi");\nreturn 0;}', { defines: { DEBUG: 1 } }); t('-DDEBUG via opts.defines', r.stdout === 'debug on\nhi\n', r.stdout);
const e = C.expand('#define SQ(x) ((x)*(x))\nint a = SQ(1+2);\n#define MAX 10\nint b = MAX;'); t('expand() shows macro substitution', e.ok && /\(\( 1 \+ 2 \) \* \( 1 \+ 2 \)\)|\(\(1 \+ 2\) \* \(1 \+ 2\)\)/.test(e.text) && /int b = 10/.test(e.text), JSON.stringify(e));
console.log(bad ? `\n${bad} FAILED` : '\nall multi-file tests passed'); process.exit(bad ? 1 : 0);
