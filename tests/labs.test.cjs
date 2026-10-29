// Verifies every lab: starter code behaves sensibly, and the reference solution satisfies the lab's own check.
global.window = global; global.document = { createElement() { return {}; } };
global.CInterp = require('../js/cinterp.js'); require('../js/lab.js'); require('../js/lessons.js');
const { LESSONS, TEMPLATES } = global.COURSE;
let bad = 0, n = 0;
for (const l of LESSONS) for (const b of l.blocks) {
  if (b.t !== 'lab') continue; n++;
  const stdin = b.stdin !== undefined ? b.stdin + '\n' : '';
  const start = CInterp.run(b.code.replace(/^\n/, ''), { stdin });
  const sTag = start.phase === 'compile' ? 'COMPILE-ERR: ' + start.errors[0].msg : start.ok === false ? 'RUNTIME: ' + start.error : 'ok';
  let line = `${b.id.padEnd(12)} starter=${sTag.slice(0, 70)}`;
  if (b.expect) {
    let startPass = false; try { startPass = start.ok !== false && b.expect(start.stdout, start, b.code); } catch (e) {}
    if (startPass) { line += '  ❌ STARTER ALREADY PASSES'; bad++; }
  }
  if (b.solution) {
    const sol = CInterp.run(b.solution.replace(/^\n/, ''), { stdin });
    if (sol.phase === 'compile') { line += '  ❌ SOLUTION COMPILE ERR: ' + sol.errors[0].msg; bad++; }
    else if (sol.ok === false) { line += '  ❌ SOLUTION RUNTIME: ' + sol.error; bad++; }
    else if (b.expect) { const ok = b.expect(sol.stdout, sol, b.solution); line += ok ? '  ✅ solution passes' : '  ❌ SOLUTION FAILS CHECK. out=' + JSON.stringify(sol.stdout); if (!ok) bad++; }
    else line += '  (solution ran)';
  } else if (start.phase === 'compile' || start.ok === false) { line += '   ⚠ no solution and starter fails'; }
  console.log(line);
}
for (const [k, v] of Object.entries(TEMPLATES)) { const r = CInterp.run(v.replace(/^\n/, ''), { stdin: 'Ada 30\n' }); console.log('template', k.padEnd(20), r.phase === 'compile' ? '❌ ' + r.errors[0].msg : r.ok === false ? 'crash: ' + r.error : 'ok'); }
console.log(`\n${n} labs checked, ${bad} problems`); process.exit(bad ? 1 : 0);
