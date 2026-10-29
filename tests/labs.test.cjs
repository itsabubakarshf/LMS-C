// Verifies every lab: starter code behaves sensibly, and the reference solution satisfies the lab's own check.
global.window = global; global.document = { createElement() { return {}; } };
require('../js/cinterp.js'); require('../js/lab.js'); require('../js/lessons.js'); require('../js/lessons2.js'); require('../js/lessons3.js');
const { LESSONS, TEMPLATES } = global.COURSE;
let bad = 0, n = 0;
for (const l of LESSONS) for (const b of l.blocks) {
  if (b.t !== 'lab') continue; n++;
  const stdin = b.stdin !== undefined ? b.stdin + '\n' : '';
  const clean = t => t.replace(/^\n/, '');
  const runLab = (codeMain, others) => CInterp.run(clean(codeMain), { stdin, files: others });
  const startFiles = b.files ? Object.fromEntries(b.files.slice(1).map(f => [f.name, clean(f.code)])) : undefined;
  const startMain = b.files ? b.files[0].code : b.code;
  const start = runLab(startMain, startFiles);
  const sTag = start.phase === 'compile' ? 'COMPILE-ERR: ' + start.errors[0].msg : start.ok === false ? 'RUNTIME: ' + start.error : 'ok';
  let line = `${b.id.padEnd(12)} starter=${sTag.slice(0, 70)}`;
  const joined = b.files ? b.files.map(f => f.code).join('\n') : b.code;
  if (b.expect) {
    let startPass = false; try { startPass = start.ok !== false && b.expect(start.stdout, start, joined); } catch (e) {}
    if (startPass) { line += '  ❌ STARTER ALREADY PASSES'; if (b.id !== 'l1-first') bad++; }
  }
  if (b.solution) {
    let sol, solSrc;
    if (b.files) {
      const m = Object.fromEntries(b.files.map(f => [f.name, clean(typeof b.solution === 'object' && b.solution[f.name] !== undefined ? b.solution[f.name] : f.code)]));
      sol = CInterp.run(m['main.c'], { stdin, files: Object.fromEntries(Object.entries(m).filter(([k]) => k !== 'main.c')) }); solSrc = Object.values(m).join('\n');
    } else { sol = runLab(b.solution, undefined); solSrc = b.solution; }
    if (sol.phase === 'compile') { line += '  ❌ SOLUTION COMPILE ERR: ' + sol.errors[0].msg; bad++; }
    else if (sol.ok === false) { line += '  ❌ SOLUTION RUNTIME: ' + sol.error; bad++; }
    else if (b.expect) { const ok = b.expect(sol.stdout, sol, solSrc); line += ok ? '  ✅ solution passes' : '  ❌ SOLUTION FAILS CHECK. out=' + JSON.stringify(sol.stdout); if (!ok) bad++; }
    else line += '  (solution ran)';
  } else if (start.phase === 'compile' || start.ok === false) { line += '   ⚠ no solution and starter fails'; }
  console.log(line);
}
for (const [k, v] of Object.entries(TEMPLATES)) { const r = CInterp.run(v.replace(/^\n/, ''), { stdin: 'Ada 30\n' }); console.log('template', k.padEnd(20), r.phase === 'compile' ? '❌ ' + r.errors[0].msg : r.ok === false ? 'crash: ' + r.error : 'ok'); }
console.log(`\n${n} labs checked, ${bad} problems`); process.exit(bad ? 1 : 0);
