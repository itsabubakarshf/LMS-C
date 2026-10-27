// Verifies the extra content: every real-life example runs, every "what is printed?" question has the right answer,
// every quiz is well-formed, and every widget referenced by a lesson exists.
global.window = global; global.document = { createElement() { return {}; } };
global.CInterp = require('../js/cinterp.js'); require('../js/lab.js'); require('../js/lessons.js'); require('../js/lessons2.js');
const { LESSONS, DEFS } = global.COURSE;
let bad = 0, ex = 0, pq = 0, qn = 0;
const fs = require('fs'); const wsrc = fs.readFileSync(__dirname + '/../js/widgets.js', 'utf8') + fs.readFileSync(__dirname + '/../js/widgets2.js', 'utf8');
for (const l of LESSONS) for (const b of l.blocks) {
  if (b.t === 'widget' && !new RegExp('W\\.' + b.w + ' = function').test(wsrc)) { console.log('❌ missing widget', b.w); bad++; }
  if (b.t === 'example') {
    ex++; const r = CInterp.run(b.code.replace(/^\n/, ''), {});
    if (r.phase === 'compile') { console.log('❌ example', b.id, 'compile:', r.errors[0].msg, 'line', r.errors[0].line); bad++; }
    else if (r.ok === false) { console.log('❌ example', b.id, 'runtime:', r.error); bad++; }
    else if (/[^\x00-\x7f]/.test(b.code)) { console.log('❌ non-ASCII in C code', b.id); bad++; }
    else console.log('✅ example', b.id.padEnd(18), JSON.stringify(r.stdout.slice(0, 70)), r.warnings.map(w => w.msg).join(';'));
  }
  if (b.t === 'quiz') for (const q of b.qs) {
    qn++;
    if (!(q.o.length >= 2 && q.a >= 0 && q.a < q.o.length && q.why && q.q)) { console.log('❌ malformed question', q.q); bad++; }
    if (new Set(q.o).size !== q.o.length) { console.log('❌ duplicate options', q.q); bad++; }
    if (q.code) {
      pq++; const r = CInterp.run(q.code, {});
      if (r.phase === 'compile') { console.log('❌ predict compile:', q.q, r.errors[0].msg); bad++; continue; }
      const got = r.stdout.replace(/\n/g, '↵').replace(/↵$/, '↵');
      const want = q.o[q.a].replace(/↵$/, '↵');
      const norm = s => s.replace(/↵+$/, '').trim();
      if (norm(got) !== norm(want)) { console.log('❌ predict mismatch [' + l.id + ']:', q.q, '\n   program printed:', JSON.stringify(got), ' marked correct:', JSON.stringify(q.o[q.a])); bad++; }
    }
  }
}
for (const [id, d] of Object.entries(DEFS)) if (!LESSONS.find(l => l.id === id) || !d.length) { console.log('❌ bad defs', id); bad++; }
console.log(`\n${ex} examples, ${qn} questions (${pq} run-to-check), ${Object.values(DEFS).reduce((a, d) => a + d.length, 0)} definitions — ${bad} problems`);
process.exit(bad ? 1 : 0);
