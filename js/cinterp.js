/*
 * cinterp.js — a small C "compiler + virtual machine" that runs in the browser.
 *
 * It is a teaching tool, not a real compiler: it understands a large, useful subset of C
 * (types, pointers, arrays, structs, enums, typedefs, macros, control flow, functions,
 * malloc/free, printf/scanf, string.h, math.h) plus a handful of Win32 API functions
 * (MessageBoxA, GetLocalTime, CreateFileA/WriteFile/ReadFile, HeapAlloc, ...).
 *
 * Memory is a real byte array, so pointers hold real addresses, sizeof is honest,
 * integers overflow like they do on x64 Windows (long = 4 bytes, pointers = 8 bytes),
 * and uninitialised stack variables contain 0xCC garbage like a Visual Studio debug build.
 */
(function (root) {
'use strict';

const MEM_SIZE = 0x100000;
const STATIC_BASE = 0x1000, STATIC_END = 0x10000;
const HEAP_BASE = 0x10000, HEAP_END = 0x80000;
const MAX_TRACE = 4000;

class CError extends Error {
  constructor(msg, line, col, kind) { super(msg); this.line = line || 0; this.col = col || 0; this.kind = kind || 'error'; }
}
class RuntimeError extends Error {
  constructor(msg, line) { super(msg); this.line = line || 0; }
}
class ExitSignal { constructor(code) { this.code = code; } }

/* ------------------------------------------------------------------ types */
const mkInt = (name, size, signed) => ({ k: 'int', name, size, signed, align: size });
const T = {
  char: mkInt('char', 1, true), uchar: mkInt('unsigned char', 1, false),
  short: mkInt('short', 2, true), ushort: mkInt('unsigned short', 2, false),
  int: mkInt('int', 4, true), uint: mkInt('unsigned int', 4, false),
  long: mkInt('long', 4, true), ulong: mkInt('unsigned long', 4, false),
  llong: mkInt('long long', 8, true), ullong: mkInt('unsigned long long', 8, false),
  bool: mkInt('_Bool', 1, false),
  float: { k: 'float', name: 'float', size: 4, align: 4 },
  double: { k: 'float', name: 'double', size: 8, align: 8 },
  void: { k: 'void', name: 'void', size: 1, align: 1 },
};
const ptr = to => ({ k: 'ptr', to, size: 8, align: 8 });
const arr = (of, n) => ({ k: 'array', of, n, size: of.size * n, align: of.align });
const alignUp = (n, a) => Math.ceil(n / a) * a;

function typeStr(t) {
  if (t.k === 'array') {
    let dims = '', b = t;
    while (b.k === 'array') { dims += '[' + b.n + ']'; b = b.of; }
    return typeStr(b) + dims;
  }
  if (t.k === 'ptr') return typeStr(t.to) + '*';
  if (t.k === 'struct') return (t.union ? 'union ' : 'struct ') + (t.name || '<anonymous>');
  return t.name;
}
function layout(st) {
  let off = 0, maxA = 1, maxS = 0;
  for (const f of st.fields) {
    if (f.ty.k === 'struct' && !f.ty.fields) throw new CError("field '" + f.name + "' has incomplete type", 0);
    const a = f.ty.align || 1; maxA = Math.max(maxA, a);
    if (st.union) { f.off = 0; maxS = Math.max(maxS, f.ty.size); }
    else { off = alignUp(off, a); f.off = off; off += f.ty.size; }
  }
  st.align = maxA;
  st.size = alignUp(st.union ? maxS : off, maxA) || 1;
}
const promote = t => (t.size < 4 ? T.int : t);
function arith(a, b) {
  if (a.k === 'float' || b.k === 'float') {
    if (a.k === 'float' && b.k === 'float') return a.size >= b.size ? a : b;
    return a.k === 'float' ? a : b;
  }
  a = promote(a); b = promote(b);
  if (a.size !== b.size) return a.size > b.size ? a : b;
  if (!a.signed) return a;
  if (!b.signed) return b;
  return a;
}
function wrap(ty, v) {
  if (ty.k !== 'int') return v;
  switch (ty.size) {
    case 1: return ty.signed ? (v << 24) >> 24 : v & 255;
    case 2: return ty.signed ? (v << 16) >> 16 : v & 65535;
    case 4: return ty.signed ? v | 0 : v >>> 0;
    default:
      if (Math.abs(v) >= 9007199254740992) return Number(ty.signed ? BigInt.asIntN(64, BigInt(v)) : BigInt.asUintN(64, BigInt(v)));
      if (!ty.signed && v < 0) return Number(BigInt.asUintN(64, BigInt(v)));
      return v;
  }
}

/* ------------------------------------------------------------------ lexer */
const KEYWORDS = new Set(['if', 'else', 'while', 'for', 'do', 'return', 'break', 'continue', 'switch', 'case', 'default',
  'sizeof', 'struct', 'union', 'enum', 'typedef', 'static', 'extern', 'const', 'volatile', 'unsigned', 'signed', 'short',
  'long', 'int', 'char', 'float', 'double', 'void', '_Bool', 'register', 'inline', 'goto']);
const OPS = ['<<=', '>>=', '...', '->', '++', '--', '<<', '>>', '<=', '>=', '==', '!=', '&&', '||', '+=', '-=', '*=', '/=', '%=',
  '&=', '|=', '^=', '+', '-', '*', '/', '%', '=', '<', '>', '!', '~', '&', '|', '^', '?', ':', ';', ',', '.', '(', ')', '[', ']', '{', '}'];
const NUM_RE = /(0[xX][0-9a-fA-F]+|0[bB][01]+|(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)([uUlLfF]*)/y;

function lex(src, startLine, internal) {
  const toks = []; let i = 0, line = startLine || 1, lineStart = 0, atLineStart = true;
  const n = src.length;
  const push = (t, v, start, extra) => {
    toks.push(Object.assign({ t, v, line, col: start - lineStart + 1, len: i - start, text: src.slice(start, i), internal: !!internal }, extra));
    atLineStart = false;
  };
  function escape() { // i points after the backslash
    const c = src[i++];
    switch (c) {
      case 'n': return 10; case 't': return 9; case 'r': return 13; case '0': case '1': case '2': case '3': case '4': case '5': case '6': case '7': {
        let v = c.charCodeAt(0) - 48, k = 0;
        while (k < 2 && /[0-7]/.test(src[i] || '')) { v = v * 8 + src.charCodeAt(i++) - 48; k++; }
        return v & 255;
      }
      case 'a': return 7; case 'b': return 8; case 'f': return 12; case 'v': return 11;
      case 'x': { let h = ''; while (/[0-9a-fA-F]/.test(src[i] || '')) h += src[i++]; return parseInt(h || '0', 16) & 255; }
      default: return c.charCodeAt(0);
    }
  }
  while (i < n) {
    const c = src[i];
    if (c === '\n') { i++; line++; lineStart = i; atLineStart = true; continue; }
    if (c === ' ' || c === '\t' || c === '\r' || c === '\f') { i++; continue; }
    if (c === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') i++; continue; }
    if (c === '/' && src[i + 1] === '*') {
      const startL = line, startC = i - lineStart + 1; i += 2;
      while (i < n && !(src[i] === '*' && src[i + 1] === '/')) { if (src[i] === '\n') { line++; lineStart = i + 1; } i++; }
      if (i >= n) throw new CError('unterminated comment', startL, startC);
      i += 2; continue;
    }
    if (c === '#' && atLineStart) {
      const startL = line; let text = ''; i++;
      while (i < n && src[i] !== '\n') {
        if (src[i] === '\\' && src[i + 1] === '\n') { i += 2; line++; lineStart = i; text += ' '; continue; }
        if (src[i] === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') i++; break; }
        if (src[i] === '/' && src[i + 1] === '*') { i += 2; while (i < n && !(src[i] === '*' && src[i + 1] === '/')) i++; i += 2; continue; }
        text += src[i++];
      }
      toks.push({ t: 'dir', text: text.trim(), line: startL, col: 1, internal: !!internal });
      continue;
    }
    const start = i;
    if (/[A-Za-z_]/.test(c)) {
      while (i < n && /\w/.test(src[i])) i++;
      const w = src.slice(start, i);
      push(KEYWORDS.has(w) ? 'kw' : 'id', w, start); continue;
    }
    if (/\d/.test(c) || (c === '.' && /\d/.test(src[i + 1] || ''))) {
      NUM_RE.lastIndex = i; const m = NUM_RE.exec(src);
      if (!m) throw new CError('invalid number', line, i - lineStart + 1);
      i += m[0].length;
      const body = m[1], suf = m[2].toLowerCase();
      const isHex = /^0[xX]/.test(body), isBin = /^0[bB]/.test(body);
      const isFloat = !isHex && !isBin && (/[.eE]/.test(body) || suf.includes('f'));
      let val, ty;
      if (isFloat) { val = parseFloat(body); ty = suf.includes('f') ? 'float' : 'double'; }
      else {
        if (isBin) val = parseInt(body.slice(2), 2);
        else if (isHex) val = parseInt(body.slice(2), 16);
        else if (body.length > 1 && body[0] === '0') val = parseInt(body, 8);
        else val = parseInt(body, 10);
        const u = suf.includes('u'), ll = (suf.match(/l/g) || []).length;
        const dec = !isHex && !isBin && !(body.length > 1 && body[0] === '0');
        if (ll >= 2) ty = u ? 'ullong' : 'llong';
        else if (ll === 1) ty = u ? (val > 0xffffffff ? 'ullong' : 'ulong') : (val > 0x7fffffff ? (dec ? 'llong' : 'ulong') : 'long');
        else if (u) ty = val > 0xffffffff ? 'ullong' : 'uint';
        else if (val <= 0x7fffffff) ty = 'int';
        else if (!dec && val <= 0xffffffff) ty = 'uint';
        else ty = 'llong';
      }
      push('num', val, start, { ty, isFloat }); continue;
    }
    if (c === "'") {
      i++; let v;
      if (src[i] === '\\') { i++; v = escape(); } else v = src.charCodeAt(i++);
      if (src[i] !== "'") throw new CError('multi-character or unterminated character constant', line, start - lineStart + 1);
      i++; push('num', v, start, { ty: 'int', isChar: true }); continue;
    }
    if (c === '"') {
      i++; let s = '';
      while (i < n && src[i] !== '"') {
        if (src[i] === '\n') throw new CError('missing terminating " character', line, start - lineStart + 1);
        if (src[i] === '\\') { i++; s += String.fromCharCode(escape()); } else s += src[i++];
      }
      if (i >= n) throw new CError('missing terminating " character', line, start - lineStart + 1);
      i++; push('str', s, start); continue;
    }
    let op = null;
    for (const o of OPS) if (src.startsWith(o, i)) { op = o; break; }
    if (!op) throw new CError("stray '" + c + "' in program", line, i - lineStart + 1);
    i += op.length; push('op', op, start);
  }
  return toks;
}

/* ----------------------------------------------------------- headers / lib */
const HEADERS = {
  'stdio.h': '#define NULL ((void*)0)\n#define EOF (-1)\n#define stdout ((void*)1)\n#define stderr ((void*)2)\n#define stdin ((void*)0)\ntypedef unsigned long long size_t;',
  'stdlib.h': '#define NULL ((void*)0)\n#define RAND_MAX 32767\n#define EXIT_SUCCESS 0\n#define EXIT_FAILURE 1\ntypedef unsigned long long size_t;',
  'string.h': '#define NULL ((void*)0)\ntypedef unsigned long long size_t;',
  'math.h': '#define M_PI 3.14159265358979323846\n#define M_E 2.71828182845904523536',
  'ctype.h': '',
  'time.h': 'typedef long long time_t;',
  'assert.h': '',
  'stdbool.h': '#define bool _Bool\n#define true 1\n#define false 0',
  'stdint.h': 'typedef signed char int8_t;\ntypedef unsigned char uint8_t;\ntypedef short int16_t;\ntypedef unsigned short uint16_t;\ntypedef int int32_t;\ntypedef unsigned int uint32_t;\ntypedef long long int64_t;\ntypedef unsigned long long uint64_t;\ntypedef unsigned long long uintptr_t;',
  'stddef.h': '#define NULL ((void*)0)\ntypedef unsigned long long size_t;',
  'limits.h': '#define INT_MAX 2147483647\n#define INT_MIN (-2147483647 - 1)\n#define UINT_MAX 4294967295U\n#define CHAR_BIT 8\n#define SHRT_MAX 32767\n#define LONG_MAX 2147483647L\n#define LLONG_MAX 9223372036854775807LL',
  'windows.h': [
    '#define NULL ((void*)0)', '#define TRUE 1', '#define FALSE 0', '#define WINAPI', '#define CALLBACK', '#define APIENTRY', '#define VOID void',
    '#define MB_OK 0', '#define MB_OKCANCEL 1', '#define MB_ABORTRETRYIGNORE 2', '#define MB_YESNOCANCEL 3', '#define MB_YESNO 4', '#define MB_RETRYCANCEL 5',
    '#define MB_ICONERROR 0x10', '#define MB_ICONQUESTION 0x20', '#define MB_ICONWARNING 0x30', '#define MB_ICONINFORMATION 0x40',
    '#define IDOK 1', '#define IDCANCEL 2', '#define IDABORT 3', '#define IDRETRY 4', '#define IDIGNORE 5', '#define IDYES 6', '#define IDNO 7',
    '#define GENERIC_READ 0x80000000', '#define GENERIC_WRITE 0x40000000', '#define CREATE_NEW 1', '#define CREATE_ALWAYS 2', '#define OPEN_EXISTING 3',
    '#define OPEN_ALWAYS 4', '#define FILE_ATTRIBUTE_NORMAL 0x80', '#define INVALID_HANDLE_VALUE ((HANDLE)0xFFFFFFFF)', '#define HEAP_ZERO_MEMORY 8',
    '#define SW_SHOWNORMAL 1', '#define INFINITE 0xFFFFFFFF', '#define MAX_PATH 260',
    'typedef unsigned long DWORD;', 'typedef unsigned short WORD;', 'typedef unsigned char BYTE;', 'typedef int BOOL;', 'typedef unsigned int UINT;',
    'typedef long LONG;', 'typedef unsigned long long ULONGLONG;', 'typedef long long LONGLONG;', 'typedef unsigned long long ULONG_PTR;',
    'typedef unsigned long long UINT_PTR;', 'typedef long long LONG_PTR;', 'typedef long long LRESULT;', 'typedef unsigned long long WPARAM;', 'typedef long long LPARAM;',
    'typedef void* HANDLE;', 'typedef void* HWND;', 'typedef void* HINSTANCE;', 'typedef void* HMODULE;', 'typedef void* LPVOID;', 'typedef const void* LPCVOID;',
    'typedef const char* LPCSTR;', 'typedef char* LPSTR;', 'typedef DWORD* LPDWORD;', 'typedef char CHAR;',
    'typedef struct _SYSTEMTIME { WORD wYear; WORD wMonth; WORD wDayOfWeek; WORD wDay; WORD wHour; WORD wMinute; WORD wSecond; WORD wMilliseconds; } SYSTEMTIME;',
    'typedef struct _POINT { LONG x; LONG y; } POINT;',
    'typedef struct _RECT { LONG left; LONG top; LONG right; LONG bottom; } RECT;',
  ].join('\n'),
};

/* ------------------------------------------------------------ preprocessor */
function expandTokens(list, defines, hide) {
  const out = [];
  for (let i = 0; i < list.length; i++) {
    const t = list[i];
    if (t.t === 'id' && defines.has(t.v) && !hide.has(t.v)) {
      const m = defines.get(t.v);
      const h2 = new Set(hide); h2.add(t.v);
      if (m.params === null) {
        out.push(...expandTokens(m.body.map(b => Object.assign({}, b, { line: t.line, col: t.col })), defines, h2));
      } else if (list[i + 1] && list[i + 1].t === 'op' && list[i + 1].v === '(') {
        let depth = 0, j = i + 1; const args = [[]];
        for (; j < list.length; j++) {
          const a = list[j];
          if (a.t === 'op' && a.v === '(') { if (depth > 0) args[args.length - 1].push(a); depth++; }
          else if (a.t === 'op' && a.v === ')') { depth--; if (depth === 0) break; args[args.length - 1].push(a); }
          else if (a.t === 'op' && a.v === ',' && depth === 1) args.push([]);
          else args[args.length - 1].push(a);
        }
        if (depth !== 0) throw new CError("unterminated argument list invoking macro '" + t.v + "'", t.line, t.col);
        if (m.params.length === 0 && args.length === 1 && args[0].length === 0) args.length = 0;
        if (args.length !== m.params.length) throw new CError("macro '" + t.v + "' requires " + m.params.length + ' arguments, but ' + args.length + ' given', t.line, t.col);
        const pmap = new Map();
        m.params.forEach((p, k) => pmap.set(p, expandTokens(args[k] || [], defines, hide)));
        const body = [];
        for (const b of m.body) {
          if (b.t === 'id' && pmap.has(b.v)) body.push(...pmap.get(b.v));
          else body.push(Object.assign({}, b, { line: t.line, col: t.col }));
        }
        out.push(...expandTokens(body, defines, h2));
        i = j;
      } else out.push(t);
    } else out.push(t);
  }
  return out;
}

function preprocess(src, state, internal) {
  const raw = lex(src, 1, internal);
  const out = []; let run = []; const cond = [];
  const active = () => cond.every(c => c.on);
  const flush = () => { if (run.length) { out.push(...expandTokens(run, state.defines, new Set())); run = []; } };
  const evalCond = (expr, line) => {
    let e = expr.replace(/defined\s*\(\s*(\w+)\s*\)|defined\s+(\w+)/g, (_, a, b) => (state.defines.has(a || b) ? '1' : '0'));
    e = e.replace(/\b[A-Za-z_]\w*\b/g, w => (state.defines.has(w) ? (state.defines.get(w).body.map(b => b.text || b.v).join(' ') || '0') : '0'));
    if (!/^[\s\d!()&|<>=+\-*/%x]+$/i.test(e)) return false;
    try { return !!Function('"use strict";return (' + e + ')')(); } catch (_) { throw new CError('invalid #if expression', line); }
  };
  for (const tk of raw) {
    if (tk.t !== 'dir') { if (active()) run.push(tk); continue; }
    flush();
    const m = /^(\w+)\s*(.*)$/s.exec(tk.text);
    const name = m ? m[1] : '', rest = m ? m[2].trim() : '';
    if (name === 'ifdef' || name === 'ifndef') {
      const d = state.defines.has(rest); cond.push({ on: name === 'ifdef' ? d : !d, taken: name === 'ifdef' ? d : !d });
    } else if (name === 'if') { const v = evalCond(rest, tk.line); cond.push({ on: v, taken: v }); }
    else if (name === 'elif') { const c = cond[cond.length - 1]; if (!c) throw new CError('#elif without #if', tk.line); const v = !c.taken && evalCond(rest, tk.line); c.on = v; c.taken = c.taken || v; }
    else if (name === 'else') { const c = cond[cond.length - 1]; if (!c) throw new CError('#else without #if', tk.line); c.on = !c.taken; c.taken = true; }
    else if (name === 'endif') { if (!cond.length) throw new CError('#endif without #if', tk.line); cond.pop(); }
    else if (!active()) { /* skipped */ }
    else if (name === 'include') {
      const im = /^[<"]([^>"]+)[>"]$/.exec(rest);
      if (!im) throw new CError('#include expects "FILENAME" or <FILENAME>', tk.line);
      const h = im[1].toLowerCase();
      if (!(h in HEADERS)) throw new CError(im[1] + ': No such file or directory', tk.line, 10, 'fatal error');
      if (!state.included.has(h)) { state.included.add(h); out.push(...preprocess(HEADERS[h], state, true)); }
    } else if (name === 'define') {
      const dm = /^([A-Za-z_]\w*)(\(([^)]*)\))?\s*(.*)$/s.exec(rest);
      if (!dm) throw new CError('macro names must be identifiers', tk.line);
      const params = dm[2] !== undefined ? dm[3].split(',').map(s => s.trim()).filter(Boolean) : null;
      state.defines.set(dm[1], { params, body: lex(dm[4], tk.line, internal) });
    } else if (name === 'undef') state.defines.delete(rest);
    else if (name === 'error') throw new CError('#error ' + rest, tk.line);
    else if (name === 'pragma' || name === 'line' || name === '') { /* ignore */ }
    else throw new CError('invalid preprocessing directive #' + name, tk.line);
  }
  flush();
  if (cond.length) throw new CError('unterminated conditional directive', raw.length ? raw[raw.length - 1].line : 1);
  return out;
}

/* ----------------------------------------------------------------- parser */
const BUILTIN_HEADER = {};
function regHeader(h, names) { for (const n of names.split(/\s+/)) if (n) BUILTIN_HEADER[n] = h; }
regHeader('stdio.h', 'printf puts putchar scanf scanf_s getchar sprintf snprintf fflush');
regHeader('stdlib.h', 'malloc calloc realloc free rand srand abs labs atoi atof exit');
regHeader('string.h', 'strlen strcpy strncpy strcat strcmp strncmp strchr strstr memset memcpy memmove memcmp');
regHeader('math.h', 'sqrt pow fabs floor ceil sin cos tan atan2 log exp fmod round');
regHeader('ctype.h', 'isdigit isalpha isalnum isspace isupper islower toupper tolower');
regHeader('time.h', 'time clock');
regHeader('assert.h', 'assert');
regHeader('windows.h', 'MessageBoxA MessageBox Sleep GetTickCount GetCurrentProcessId GetCurrentThreadId GetModuleHandleA GetLocalTime ExitProcess OutputDebugStringA GetLastError ' +
  'GetProcessHeap HeapAlloc HeapFree CreateFileA WriteFile ReadFile CloseHandle GetFileSize DeleteFileA');

const TYPE_KW = new Set(['unsigned', 'signed', 'short', 'long', 'int', 'char', 'float', 'double', 'void', '_Bool', 'struct', 'union', 'enum', 'const', 'volatile', 'static', 'extern', 'register', 'inline']);
const ASSIGN_OPS = new Set(['=', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<=', '>>=']);
const BIN_PREC = { '||': 1, '&&': 2, '|': 3, '^': 4, '&': 5, '==': 6, '!=': 6, '<': 7, '>': 7, '<=': 7, '>=': 7, '<<': 8, '>>': 8, '+': 9, '-': 9, '*': 10, '/': 10, '%': 10 };
const LIT_TYPES = { int: T.int, uint: T.uint, long: T.long, ulong: T.ulong, llong: T.llong, ullong: T.ullong, float: T.float, double: T.double };

class Parser {
  constructor(tokens, state) {
    this.toks = tokens; this.p = 0; this.state = state;
    this.typedefs = new Map(); this.structs = new Map(); this.enums = new Map();
    this.funcs = new Map(); this.globals = new Set(); this.scopes = []; this.warnings = [];
    this.curFn = null; this.gdecls = [];
  }
  peek(o) { return this.toks[this.p + (o || 0)] || { t: 'eof', v: 'end of file', line: (this.toks.length ? this.toks[this.toks.length - 1].line : 1), col: 1, len: 0 }; }
  next() { return this.toks[this.p++] || this.peek(); }
  prev() { return this.toks[this.p - 1] || this.peek(); }
  isOp(v, o) { const t = this.peek(o); return t.t === 'op' && t.v === v; }
  isKw(v, o) { const t = this.peek(o); return t.t === 'kw' && t.v === v; }
  acceptOp(v) { if (this.isOp(v)) { this.p++; return true; } return false; }
  tokText(t) { return t.t === 'eof' ? 'end of file' : (t.text || String(t.v)); }
  fail(msg, tok) { tok = tok || this.peek(); throw new CError(msg, tok.line, tok.col); }
  expectOp(v) {
    if (this.acceptOp(v)) return;
    const t = this.peek();
    if (v === ';' || v === ')' || v === ']' || v === '}') {
      const pv = this.prev();
      throw new CError("expected '" + v + "' before '" + this.tokText(t) + "'", pv.line || t.line, (pv.col || 1) + (pv.len || 0));
    }
    this.fail("expected '" + v + "' before '" + this.tokText(t) + "'");
  }
  /* scopes */
  pushScope() { this.scopes.push(new Map()); }
  popScope() {
    const s = this.scopes.pop();
    for (const [name, info] of s) if (!info.used && !info.param && !info.internal) this.warnings.push({ line: info.line, msg: "unused variable '" + name + "'" });
  }
  declare(name, tok, extra) {
    const s = this.scopes.length ? this.scopes[this.scopes.length - 1] : null;
    if (s) {
      if (s.has(name)) throw new CError("redefinition of '" + name + "'", tok.line, tok.col);
      s.set(name, Object.assign({ used: false, line: tok.line, internal: tok.internal }, extra));
    } else this.globals.add(name);
  }
  lookupVar(name) {
    for (let i = this.scopes.length - 1; i >= 0; i--) { const v = this.scopes[i].get(name); if (v) { v.used = true; return true; } }
    return this.globals.has(name);
  }
  isTypeStart(o) {
    const t = this.peek(o);
    if (t.t === 'kw') return TYPE_KW.has(t.v);
    return t.t === 'id' && this.typedefs.has(t.v) && !this.lookupVarQuiet(t.v);
  }
  lookupVarQuiet(name) { for (let i = this.scopes.length - 1; i >= 0; i--) if (this.scopes[i].has(name)) return true; return this.globals.has(name); }

  /* types */
  parseBase() {
    let uns = null, shortF = false, longN = 0, base = null, storage = null, ty = null, any = false;
    for (;;) {
      const t = this.peek();
      if (t.t === 'kw') {
        const v = t.v;
        if (v === 'const' || v === 'volatile' || v === 'register' || v === 'inline') { this.p++; continue; }
        if (v === 'static' || v === 'extern') { storage = v; this.p++; continue; }
        if (v === 'unsigned') { uns = true; any = true; this.p++; continue; }
        if (v === 'signed') { uns = false; any = true; this.p++; continue; }
        if (v === 'short') { shortF = true; any = true; this.p++; continue; }
        if (v === 'long') { longN++; any = true; this.p++; continue; }
        if (v === 'int' || v === 'char' || v === 'float' || v === 'double' || v === 'void' || v === '_Bool') {
          if (base) this.fail("two or more data types in declaration specifiers");
          base = v; any = true; this.p++; continue;
        }
        if (v === 'struct' || v === 'union') { if (any) this.fail('two or more data types in declaration specifiers'); this.p++; ty = this.parseStructSpec(v === 'union'); any = true; continue; }
        if (v === 'enum') { if (any) this.fail('two or more data types in declaration specifiers'); this.p++; ty = this.parseEnumSpec(); any = true; continue; }
        break;
      }
      if (t.t === 'id' && !any && this.typedefs.has(t.v)) { ty = this.typedefs.get(t.v); any = true; this.p++; continue; }
      break;
    }
    if (!any) this.fail('expected a type before \'' + this.tokText(this.peek()) + '\'');
    if (ty) return { ty, storage };
    let r;
    if (base === 'char') r = uns === true ? T.uchar : T.char;
    else if (base === 'float') r = T.float;
    else if (base === 'double') r = T.double;
    else if (base === 'void') r = T.void;
    else if (base === '_Bool') r = T.bool;
    else if (shortF) r = uns ? T.ushort : T.short;
    else if (longN >= 2) r = uns ? T.ullong : T.llong;
    else if (longN === 1) r = uns ? T.ulong : T.long;
    else r = uns ? T.uint : T.int;
    return { ty: r, storage };
  }
  parseStructSpec(isUnion) {
    let tag = null;
    if (this.peek().t === 'id') tag = this.next().v;
    let st = tag ? this.structs.get(tag) : null;
    if (!st) {
      st = { k: 'struct', name: tag, fields: null, size: 0, align: 1, union: isUnion };
      if (tag) this.structs.set(tag, st);
    }
    if (this.isOp('{')) {
      const open = this.next();
      if (st.fields) throw new CError("redefinition of 'struct " + tag + "'", open.line, open.col);
      const fields = [];
      while (!this.acceptOp('}')) {
        const base = this.parseBase().ty;
        do {
          const d = this.parseDeclarator(base);
          if (!d.name) this.fail('expected member name');
          if (d.ty.k === 'struct' && !d.ty.fields) this.fail("field '" + d.name + "' has incomplete type");
          fields.push({ name: d.name, ty: d.ty });
        } while (this.acceptOp(','));
        this.expectOp(';');
      }
      st.fields = fields; layout(st);
    }
    return st;
  }
  parseEnumSpec() {
    if (this.peek().t === 'id') this.next();
    if (this.acceptOp('{')) {
      let val = 0;
      while (!this.acceptOp('}')) {
        const nm = this.next();
        if (nm.t !== 'id') this.fail('expected enumerator name', nm);
        if (this.acceptOp('=')) val = this.constEval(this.parseCond());
        this.enums.set(nm.v, val++);
        if (!this.acceptOp(',')) { this.expectOp('}'); break; }
      }
    }
    return T.int;
  }
  parseDeclarator(base, abstract) {
    let ty = base;
    while (this.acceptOp('*')) { while (this.isKw('const') || this.isKw('volatile')) this.p++; ty = ptr(ty); }
    if (this.isOp('(') && this.isOp('*', 1)) this.fail('function pointers are not supported by this teaching compiler yet');
    let name = null, tok = this.peek();
    if (tok.t === 'id') { name = tok.v; this.p++; }
    else if (!abstract) this.fail("expected identifier before '" + this.tokText(tok) + "'");
    const dims = [];
    while (this.acceptOp('[')) {
      if (this.isOp(']')) dims.push(null); else dims.push(this.constEval(this.parseAssign()));
      this.expectOp(']');
    }
    for (let i = dims.length - 1; i >= 0; i--) {
      if (dims[i] === null) ty = { k: 'array', of: ty, n: 0, size: 0, align: ty.align, unsized: true };
      else {
        if (dims[i] < 0) this.fail('size of array is negative');
        ty = arr(ty, dims[i]);
      }
    }
    return { name, ty, tok };
  }
  parseTypeName() {
    const base = this.parseBase().ty;
    return this.parseDeclarator(base, true).ty;
  }
  constEval(n) {
    switch (n.k) {
      case 'num': return n.v;
      case 'sizeof': return n.ty ? n.ty.size : this.fail('sizeof of an expression is not a constant here');
      case 'cast': return this.constEval(n.a);
      case 'un': { const a = this.constEval(n.a); return n.op === '-' ? -a : n.op === '+' ? a : n.op === '~' ? ~a : n.op === '!' ? (a ? 0 : 1) : this.fail('not a constant expression'); }
      case 'cond': return this.constEval(n.c) ? this.constEval(n.a) : this.constEval(n.b);
      case 'bin': {
        const a = this.constEval(n.a), b = this.constEval(n.b);
        switch (n.op) {
          case '+': return a + b; case '-': return a - b; case '*': return a * b;
          case '/': if (!b) this.fail('division by zero in constant expression'); return Math.trunc(a / b);
          case '%': if (!b) this.fail('division by zero in constant expression'); return a % b;
          case '<<': return a << b; case '>>': return a >> b; case '&': return a & b; case '|': return a | b; case '^': return a ^ b;
          case '<': return +(a < b); case '>': return +(a > b); case '<=': return +(a <= b); case '>=': return +(a >= b);
          case '==': return +(a === b); case '!=': return +(a !== b); case '&&': return +(a && b); case '||': return +(a || b);
        }
      }
    }
    return this.fail('array size / enum value must be a constant expression');
  }

  /* program */
  parseProgram() {
    while (this.peek().t !== 'eof') this.parseTop();
    return { funcs: this.funcs, gdecls: this.gdecls, warnings: this.warnings };
  }
  parseTop() {
    const first = this.peek();
    if (this.isKw('typedef')) {
      this.p++;
      const { ty } = this.parseBase();
      do {
        const d = this.parseDeclarator(ty);
        if (!d.name) this.fail('typedef needs a name');
        this.typedefs.set(d.name, d.ty);
      } while (this.acceptOp(','));
      this.expectOp(';'); return;
    }
    if (!this.isTypeStart()) {
      const t = this.peek();
      if (t.t === 'id' && this.peek(1).t === 'id') this.fail("unknown type name '" + t.v + "'" + this.typeHint(t.v), t);
      this.fail("expected declaration or statement at '" + this.tokText(t) + "' (code must be inside a function)", t);
    }
    const { ty: base, storage } = this.parseBase();
    if (this.acceptOp(';')) return;
    for (;;) {
      const d = this.parseDeclarator(base);
      if (!d.name) this.fail('expected identifier');
      if (this.isOp('(')) { this.parseFunction(d, first); return; }
      if (d.ty.k === 'void') throw new CError("variable '" + d.name + "' declared void", d.tok.line, d.tok.col);
      this.declare(d.name, d.tok, {});
      let init = null;
      if (this.acceptOp('=')) init = this.parseInit();
      d.ty = this.fixUnsized(d.ty, init, d.tok);
      this.gdecls.push({ k: 'decl', line: d.tok.line, decls: [{ name: d.name, ty: d.ty, init, storage: storage || 'global', line: d.tok.line }] });
      if (!this.acceptOp(',')) break;
    }
    this.expectOp(';');
  }
  typeHint(n) {
    const hints = { bool: ' (did you forget #include <stdbool.h>?)', size_t: ' (did you forget #include <stddef.h> or <stdio.h>?)', uint8_t: ' (did you forget #include <stdint.h>?)', int32_t: ' (did you forget #include <stdint.h>?)', DWORD: ' (did you forget #include <windows.h>?)', HANDLE: ' (did you forget #include <windows.h>?)', BOOL: ' (did you forget #include <windows.h>?)', HWND: ' (did you forget #include <windows.h>?)' };
    return hints[n] || '';
  }
  fixUnsized(ty, init, tok) {
    if (ty.k === 'array' && ty.unsized) {
      if (!init) throw new CError('array size missing in declaration', tok.line, tok.col);
      let n;
      if (init.k === 'list') n = init.items.length; else if (init.k === 'str') n = init.v.length + 1; else throw new CError('invalid initializer for array', tok.line, tok.col);
      return arr(ty.of, n);
    }
    return ty;
  }
  parseParams() {
    this.expectOp('(');
    const params = [];
    if (this.isKw('void') && this.isOp(')', 1)) { this.p += 2; return params; }
    if (this.acceptOp(')')) return params;
    do {
      if (this.isOp('...')) this.fail('variadic user functions are not supported yet');
      const base = this.parseBase().ty;
      const d = this.parseDeclarator(base, true);
      let ty = d.ty;
      if (ty.k === 'array') ty = ptr(ty.of);
      params.push({ name: d.name, ty, tok: d.tok });
    } while (this.acceptOp(','));
    this.expectOp(')');
    return params;
  }
  parseFunction(d, first) {
    const params = this.parseParams();
    const name = d.name;
    let fn = this.funcs.get(name);
    if (!fn) { fn = { name, ret: d.ty, params, body: null, line: d.tok.line }; this.funcs.set(name, fn); }
    else if (fn.params.length !== params.length) throw new CError("conflicting types for '" + name + "'", d.tok.line, d.tok.col);
    if (this.isOp('{')) {
      if (fn.body) throw new CError("redefinition of '" + name + "'", d.tok.line, d.tok.col);
      fn.params = params; fn.ret = d.ty; fn.line = d.tok.line;
      this.curFn = fn;
      this.pushScope();
      for (const p of params) { if (p.name) this.declare(p.name, p.tok, { param: true }); }
      const body = this.parseBlockBody();
      this.popScope();
      fn.body = body; this.curFn = null;
    } else {
      this.expectOp(';');
    }
  }
  parseBlockBody() {
    const open = this.peek();
    this.expectOp('{');
    const stmts = [];
    while (!this.isOp('}')) {
      if (this.peek().t === 'eof') throw new CError("expected '}' at end of input", open.line, open.col);
      stmts.push(this.parseStatement());
    }
    this.p++;
    return { k: 'block', stmts, line: open.line };
  }

  /* statements */
  parseStatement() {
    const t = this.peek(); const line = t.line;
    if (t.t === 'op') {
      if (t.v === '{') { this.pushScope(); const b = this.parseBlockBody(); this.popScope(); return b; }
      if (t.v === ';') { this.p++; return { k: 'empty', line }; }
    }
    if (t.t === 'kw') {
      switch (t.v) {
        case 'if': {
          this.p++; this.expectOp('('); const c = this.parseExpr(); this.checkCond(c, t); this.expectOp(')');
          const a = this.parseStatement(); let b = null;
          if (this.isKw('else')) { this.p++; b = this.parseStatement(); }
          return { k: 'if', c, a, b, line };
        }
        case 'while': {
          this.p++; this.expectOp('('); const c = this.parseExpr(); this.checkCond(c, t); this.expectOp(')');
          return { k: 'while', c, body: this.parseStatement(), line };
        }
        case 'do': {
          this.p++; const body = this.parseStatement();
          if (!this.isKw('while')) this.fail("expected 'while' before '" + this.tokText(this.peek()) + "'");
          this.p++; this.expectOp('('); const c = this.parseExpr(); this.expectOp(')'); this.expectOp(';');
          return { k: 'dowhile', c, body, line };
        }
        case 'for': {
          this.p++; this.expectOp('('); this.pushScope();
          let init = null, c = null, step = null;
          if (!this.acceptOp(';')) {
            if (this.isTypeStart()) init = this.parseLocalDecl(); else { init = { k: 'expr', e: this.parseExpr(), line }; this.expectOp(';'); }
          }
          if (!this.isOp(';')) c = this.parseExpr();
          this.expectOp(';');
          if (!this.isOp(')')) step = this.parseExpr();
          this.expectOp(')');
          const body = this.parseStatement(); this.popScope();
          return { k: 'for', init, c, step, body, line };
        }
        case 'return': {
          this.p++; let e = null;
          if (!this.isOp(';')) e = this.parseExpr();
          this.expectOp(';');
          if (this.curFn) {
            if (this.curFn.ret.k === 'void' && e) this.warnings.push({ line, msg: "'return' with a value, in function returning void" });
            if (this.curFn.ret.k !== 'void' && !e) this.warnings.push({ line, msg: "'return' with no value, in function returning non-void" });
          }
          return { k: 'return', e, line };
        }
        case 'break': this.p++; this.expectOp(';'); return { k: 'break', line };
        case 'continue': this.p++; this.expectOp(';'); return { k: 'continue', line };
        case 'goto': this.fail('goto is not supported by this teaching compiler');
        case 'switch': {
          this.p++; this.expectOp('('); const e = this.parseExpr(); this.expectOp(')');
          const open = this.peek(); this.expectOp('{'); this.pushScope();
          const stmts = [];
          while (!this.isOp('}')) {
            if (this.peek().t === 'eof') throw new CError("expected '}' at end of input", open.line, open.col);
            if (this.isKw('case')) {
              const cl = this.next().line; const v = this.constEval(this.parseCond()); this.expectOp(':');
              stmts.push({ k: 'case', v, line: cl });
            } else if (this.isKw('default')) { const cl = this.next().line; this.expectOp(':'); stmts.push({ k: 'default', line: cl }); }
            else stmts.push(this.parseStatement());
          }
          this.p++; this.popScope();
          return { k: 'switch', e, stmts, line };
        }
        case 'case': case 'default': this.fail("'" + t.v + "' label not within a switch statement");
        case 'else': this.fail("'else' without a previous 'if'");
      }
    }
    if (this.isTypeStart()) return this.parseLocalDecl();
    if (t.t === 'id' && this.peek(1).t === 'id' && !this.lookupVarQuiet(t.v)) this.fail("unknown type name '" + t.v + "'" + this.typeHint(t.v), t);
    const e = this.parseExpr();
    this.expectOp(';');
    return { k: 'expr', e, line };
  }
  checkCond(c, tok) {
    if (c.k === 'assign' && c.op === '=' && !c.paren) this.warnings.push({ line: tok.line, msg: "suggest parentheses around assignment used as truth value (did you mean '=='?)" });
  }
  parseLocalDecl() {
    const line = this.peek().line;
    const { ty: base, storage } = this.parseBase();
    const decls = [];
    if (this.acceptOp(';')) return { k: 'empty', line };
    do {
      const d = this.parseDeclarator(base);
      if (!d.name) this.fail('expected identifier');
      if (d.ty.k === 'void') throw new CError("variable '" + d.name + "' declared void", d.tok.line, d.tok.col);
      if (this.isOp('(')) this.fail('nested function declarations are not supported');
      this.declare(d.name, d.tok, {});
      let init = null;
      if (this.acceptOp('=')) init = this.parseInit();
      d.ty = this.fixUnsized(d.ty, init, d.tok);
      decls.push({ name: d.name, ty: d.ty, init, storage, line: d.tok.line });
    } while (this.acceptOp(','));
    this.expectOp(';');
    return { k: 'decl', decls, line };
  }
  parseInit() {
    if (!this.isOp('{')) return this.parseAssign();
    this.p++;
    const items = [];
    while (!this.isOp('}')) {
      let desig = null;
      if (this.isOp('.') && this.peek(1).t === 'id') { this.p++; desig = this.next().v; this.expectOp('='); }
      items.push({ desig, init: this.parseInit() });
      if (!this.acceptOp(',')) break;
    }
    this.expectOp('}');
    return { k: 'list', items };
  }

  /* expressions */
  parseExpr() {
    let e = this.parseAssign();
    while (this.isOp(',')) { this.p++; e = { k: 'comma', a: e, b: this.parseAssign(), line: e.line }; }
    return e;
  }
  isLvalue(n) { return n.k === 'id' || n.k === 'index' || n.k === 'member' || (n.k === 'un' && n.op === '*'); }
  parseAssign() {
    const lhs = this.parseCond();
    const t = this.peek();
    if (t.t === 'op' && ASSIGN_OPS.has(t.v)) {
      if (!this.isLvalue(lhs)) this.fail('lvalue required as left operand of assignment', t);
      this.p++;
      const rhs = this.parseAssign();
      return { k: 'assign', op: t.v, a: lhs, b: rhs, line: t.line };
    }
    return lhs;
  }
  parseCond() {
    const c = this.parseBinary(1);
    if (this.isOp('?')) {
      this.p++; const a = this.parseExpr(); this.expectOp(':'); const b = this.parseCond();
      return { k: 'cond', c, a, b, line: c.line };
    }
    return c;
  }
  parseBinary(minPrec) {
    let lhs = this.parseUnary();
    for (;;) {
      const t = this.peek();
      if (t.t !== 'op') break;
      const prec = BIN_PREC[t.v];
      if (!prec || prec < minPrec) break;
      this.p++;
      const rhs = this.parseBinary(prec + 1);
      lhs = { k: 'bin', op: t.v, a: lhs, b: rhs, line: t.line };
    }
    return lhs;
  }
  parseUnary() {
    const t = this.peek();
    if (t.t === 'op') {
      if (t.v === '-' || t.v === '+' || t.v === '!' || t.v === '~' || t.v === '*' || t.v === '&') {
        this.p++; const a = this.parseUnary();
        if (t.v === '&' && !this.isLvalue(a) && a.k !== 'str') this.fail("lvalue required as unary '&' operand", t);
        return { k: 'un', op: t.v, a, line: t.line };
      }
      if (t.v === '++' || t.v === '--') {
        this.p++; const a = this.parseUnary();
        if (!this.isLvalue(a)) this.fail('lvalue required as increment operand', t);
        return { k: 'incdec', op: t.v, pre: true, a, line: t.line };
      }
      if (t.v === '(' && this.isTypeStart(1)) {
        this.p++; const ty = this.parseTypeName(); this.expectOp(')');
        return { k: 'cast', ty, a: this.parseUnary(), line: t.line };
      }
    }
    if (t.t === 'kw' && t.v === 'sizeof') {
      this.p++;
      if (this.isOp('(') && this.isTypeStart(1)) { this.p++; const ty = this.parseTypeName(); this.expectOp(')'); return { k: 'sizeof', ty, line: t.line }; }
      return { k: 'sizeof', e: this.parseUnary(), line: t.line };
    }
    return this.parsePostfix();
  }
  parsePostfix() {
    let e = this.parsePrimary();
    for (;;) {
      const t = this.peek();
      if (t.t !== 'op') break;
      if (t.v === '[') { this.p++; const i = this.parseExpr(); this.expectOp(']'); e = { k: 'index', a: e, i, line: t.line }; }
      else if (t.v === '(') {
        if (e.k !== 'id') this.fail('called object is not a function');
        this.p++; const args = [];
        if (!this.isOp(')')) { do args.push(this.parseAssign()); while (this.acceptOp(',')); }
        this.expectOp(')');
        const fn = this.funcs.get(e.name);
        if (fn && !e.isVar) {
          if (args.length !== fn.params.length) throw new CError("too " + (args.length > fn.params.length ? 'many' : 'few') + " arguments to function '" + e.name + "' (expected " + fn.params.length + ', got ' + args.length + ')', t.line, t.col);
        }
        e = { k: 'call', fn: e, args, line: t.line };
      }
      else if (t.v === '.' || t.v === '->') {
        this.p++; const nm = this.next();
        if (nm.t !== 'id') this.fail('expected member name', nm);
        e = { k: 'member', a: e, name: nm.v, arrow: t.v === '->', line: t.line };
      }
      else if (t.v === '++' || t.v === '--') {
        if (!this.isLvalue(e)) this.fail('lvalue required as increment operand', t);
        this.p++; e = { k: 'incdec', op: t.v, pre: false, a: e, line: t.line };
      } else break;
    }
    return e;
  }
  parsePrimary() {
    const t = this.next();
    if (t.t === 'num') return { k: 'num', v: t.v, ty: LIT_TYPES[t.ty], line: t.line };
    if (t.t === 'str') {
      let s = t.v;
      while (this.peek().t === 'str') s += this.next().v;
      return { k: 'str', v: s, line: t.line };
    }
    if (t.t === 'op' && t.v === '(') {
      const e = this.parseExpr(); this.expectOp(')');
      e.paren = true; return e;
    }
    if (t.t === 'id') {
      const name = t.v;
      if (this.lookupVar(name)) return { k: 'id', name, isVar: true, line: t.line };
      if (this.enums.has(name)) return { k: 'num', v: this.enums.get(name), ty: T.int, line: t.line };
      if (this.funcs.has(name)) return { k: 'id', name, line: t.line };
      if (name in BUILTIN_HEADER) {
        const h = BUILTIN_HEADER[name];
        if (!this.state.included.has(h)) {
          throw new CError("implicit declaration of function '" + name + "' — add #include <" + h + ">", t.line, t.col);
        }
        return { k: 'id', name, builtin: true, line: t.line };
      }
      if (this.isOp('(')) throw new CError("implicit declaration of function '" + name + "' — define it, or add a prototype above main()", t.line, t.col);
      throw new CError("'" + name + "' undeclared (first use in this function)", t.line, t.col);
    }
    this.p--;
    this.fail("expected expression before '" + this.tokText(t) + "'", t);
  }
}

/* --------------------------------------------------------------- machine */
class Env {
  constructor(p) { this.p = p; this.m = new Map(); }
  declare(name, t, a) { this.m.set(name, { name, t, a }); }
  find(n) { for (let e = this; e; e = e.p) { const v = e.m.get(n); if (v) return v; } return null; }
}
const BREAK = { brk: 1 }, CONT = { cont: 1 };
const hex = (n, w) => n.toString(16).padStart(w || 8, '0');

class Machine {
  constructor(prog, opts) {
    this.prog = prog; this.opts = opts;
    this.buf = new ArrayBuffer(MEM_SIZE); this.u8 = new Uint8Array(this.buf); this.dv = new DataView(this.buf);
    this.u8.fill(0xCC, HEAP_END);
    this.sp = MEM_SIZE; this.staticPtr = STATIC_BASE; this.heapPtr = HEAP_BASE;
    this.blocks = new Map(); this.strs = new Map();
    this.globals = new Env(null); this.frames = []; this.cur = null;
    this.out = ''; this.trace = []; this.events = []; this.steps = 0; this.truncated = false;
    this.stdin = opts.stdin || ''; this.stdinPos = 0; this.randState = 12345; this.fakeClock = 100000; this.depth = 0;
    this.files = new Map(); this.handles = new Map(); this.nextHandle = 0x104; this.lastLine = 0;
    this.debugOut = '';
  }
  err(msg, line) { return new RuntimeError(msg, line || this.lastLine); }

  /* memory */
  chk(a, n, write) {
    if (!(a >= STATIC_BASE && a + n <= MEM_SIZE) || a !== a) {
      throw this.err('Access violation ' + (write ? 'writing' : 'reading') + ' location 0x' + hex(Math.max(0, Math.floor(a) || 0), 16).toUpperCase() + (a < STATIC_BASE ? ' (NULL pointer dereference)' : ''));
    }
  }
  rd(a, t) {
    this.chk(a, t.size, false);
    switch (t.k) {
      case 'int':
        switch (t.size) {
          case 1: return t.signed ? this.dv.getInt8(a) : this.dv.getUint8(a);
          case 2: return t.signed ? this.dv.getInt16(a, true) : this.dv.getUint16(a, true);
          case 4: return t.signed ? this.dv.getInt32(a, true) : this.dv.getUint32(a, true);
          default: { const lo = this.dv.getUint32(a, true), hi = t.signed ? this.dv.getInt32(a + 4, true) : this.dv.getUint32(a + 4, true); return hi * 4294967296 + lo; }
        }
      case 'float': return t.size === 4 ? this.dv.getFloat32(a, true) : this.dv.getFloat64(a, true);
      case 'ptr': return this.dv.getUint32(a + 4, true) * 4294967296 + this.dv.getUint32(a, true);
      case 'struct': return this.u8.slice(a, a + t.size);
    }
    throw this.err('cannot read a value of type ' + typeStr(t));
  }
  wr(a, t, v) {
    this.chk(a, t.size, true);
    switch (t.k) {
      case 'int': case 'ptr':
        switch (t.size) {
          case 1: this.dv.setUint8(a, v & 255); return;
          case 2: this.dv.setUint16(a, v & 65535, true); return;
          case 4: this.dv.setUint32(a, v >>> 0, true); return;
          default: { const hi = Math.floor(v / 4294967296); this.dv.setUint32(a, v - hi * 4294967296, true); this.dv.setUint32(a + 4, hi >>> 0, true); return; }
        }
      case 'float': if (t.size === 4) this.dv.setFloat32(a, v, true); else this.dv.setFloat64(a, v, true); return;
      case 'struct': this.u8.set(v, a); return;
    }
    throw this.err('cannot write a value of type ' + typeStr(t));
  }
  allocStack(size, align) {
    this.sp = (this.sp - size) - ((this.sp - size) % (align || 1));
    if (this.sp < HEAP_END + 256) throw this.err('Stack overflow (too many nested calls or too much local data)');
    return this.sp;
  }
  allocStatic(size, align) {
    this.staticPtr = alignUp(this.staticPtr, align || 1);
    const a = this.staticPtr; this.staticPtr += size;
    if (this.staticPtr > STATIC_END) throw this.err('Out of static memory');
    return a;
  }
  strAddr(s) {
    let a = this.strs.get(s);
    if (a === undefined) {
      a = this.allocStatic(s.length + 1, 1);
      for (let i = 0; i < s.length; i++) this.u8[a + i] = s.charCodeAt(i) & 255;
      this.u8[a + s.length] = 0; this.strs.set(s, a);
    }
    return a;
  }
  cstr(a, max) {
    if (a === 0) return '(null)';
    let s = '';
    for (let i = 0; i < (max === undefined ? 100000 : max); i++) { this.chk(a + i, 1, false); const c = this.u8[a + i]; if (!c) break; s += String.fromCharCode(c); }
    return s;
  }
  malloc(n, fill) {
    n = Math.max(1, Math.floor(n)); const sz = alignUp(n, 16);
    for (const [a, b] of this.blocks) if (b.freed && b.size >= sz) { b.freed = false; b.req = n; this.u8.fill(fill === undefined ? 0xCD : fill, a, a + b.size); return a; }
    if (this.heapPtr + sz > HEAP_END) return 0;
    const a = this.heapPtr; this.heapPtr += sz;
    this.blocks.set(a, { size: sz, req: n, freed: false });
    this.u8.fill(fill === undefined ? 0xCD : fill, a, a + sz);
    return a;
  }
  free(a) {
    if (a === 0) return;
    const b = this.blocks.get(a);
    if (!b) throw this.err('free(): invalid pointer 0x' + hex(a) + ' (not returned by malloc)');
    if (b.freed) throw this.err('Heap corruption detected: double free of 0x' + hex(a));
    b.freed = true; this.u8.fill(0xDD, a, a + b.size);
  }

  /* tracing */
  rec(node, env) {
    if (node.line) this.lastLine = node.line;
    if (this.cur) this.cur.env = env;
    if (!this.opts.trace) return;
    if (this.trace.length >= MAX_TRACE) { this.truncated = true; return; }
    this.trace.push(this.snapshot(node.line));
  }
  fmtVal(t, a) {
    switch (t.k) {
      case 'int': {
        const v = this.rd(a, t);
        if (t.size === 1 && t.name !== '_Bool') { const c = v & 255; return v + (c >= 32 && c < 127 ? " '" + String.fromCharCode(c) + "'" : ''); }
        return String(v);
      }
      case 'float': { const v = this.rd(a, t); return Number.isInteger(v) && Math.abs(v) < 1e15 ? v.toFixed(1) : String(+v.toPrecision(t.size === 4 ? 7 : 15)); }
      case 'ptr': { const v = this.rd(a, t); return v === 0 ? 'NULL' : '0x' + hex(v); }
      case 'array': {
        if (t.of.k === 'int' && t.of.size === 1) { let s = '', term = false; for (let i = 0; i < t.n; i++) { const c = this.u8[a + i]; if (c === 0) { term = true; break; } s += c >= 32 && c < 127 ? String.fromCharCode(c) : '\\x' + hex(c, 2); } return '"' + s + '"' + (term ? '' : ' (no \\0 terminator!)'); }
        const items = []; for (let i = 0; i < Math.min(t.n, 12); i++) items.push(this.fmtVal(t.of, a + i * t.of.size));
        return '[' + items.join(', ') + (t.n > 12 ? ', …' : '') + ']';
      }
      case 'struct': return '{' + t.fields.map(f => f.name + '=' + this.fmtVal(f.ty, a + f.off)).join(', ') + '}';
    }
    return '?';
  }
  describe(v) {
    const t = v.t, o = { name: v.name, type: typeStr(t), addr: v.a, size: t.size, val: '', kind: t.k };
    try {
      o.val = this.fmtVal(t, v.a);
      let garbage = true; for (let i = 0; i < Math.min(t.size, 8); i++) if (this.u8[v.a + i] !== 0xCC) { garbage = false; break; }
      o.uninit = garbage && t.size > 0;
      if (t.k === 'array' && t.of.k !== 'array') {
        o.cells = []; for (let i = 0; i < Math.min(t.n, 32); i++) o.cells.push(t.of.k === 'struct' ? '{…}' : this.fmtVal(t.of, v.a + i * t.of.size).replace(/^(-?\d+) '(.)'$/, "'$2'"));
        o.elemSize = t.of.size; o.n = t.n; o.isChar = t.of.k === 'int' && t.of.size === 1;
      }
      if (t.k === 'struct') o.fields = t.fields.map(f => ({ name: f.name, type: typeStr(f.ty), off: f.off, size: f.ty.size, val: this.fmtVal(f.ty, v.a + f.off) }));
      if (t.k === 'ptr') o.ptrVal = this.rd(v.a, t);
    } catch (e) { o.val = '?'; }
    return o;
  }
  snapshot(line) {
    const frames = [], all = [];
    for (const f of this.frames) {
      const chain = []; for (let e = f.env; e && e !== this.globals; e = e.p) chain.push(e);
      chain.reverse();
      const vars = []; for (const e of chain) for (const v of e.m.values()) { const d = this.describe(v); vars.push(d); all.push(d); }
      frames.push({ fn: f.fn, vars });
    }
    const globals = []; for (const v of this.globals.m.values()) { const d = this.describe(v); globals.push(d); all.push(d); }
    const heap = [];
    for (const [a, b] of this.blocks) heap.push({ addr: a, size: b.size, req: b.req, freed: b.freed });
    for (const d of all) {
      if (d.kind !== 'ptr' || !d.ptrVal) continue;
      const p = d.ptrVal; let tgt = null;
      for (const o of all) if (o !== d && p >= o.addr && p < o.addr + Math.max(o.size, 1)) {
        tgt = o.name + (p !== o.addr ? (o.cells && o.elemSize ? '[' + Math.floor((p - o.addr) / o.elemSize) + ']' : '+' + (p - o.addr)) : '');
        break;
      }
      if (!tgt) for (const h of heap) if (p >= h.addr && p < h.addr + h.size) { tgt = 'heap block @0x' + hex(h.addr) + (h.freed ? ' (FREED!)' : ''); break; }
      if (tgt) d.points = tgt;
    }
    return { line, fn: this.cur ? this.cur.fn : '', frames, globals, heap, out: this.out.length, events: this.events.length, steps: this.steps };
  }

  /* values */
  cast(ty, rv) {
    const from = rv.t;
    switch (ty.k) {
      case 'int': {
        if (from.k === 'struct') throw this.err('cannot convert a struct to ' + typeStr(ty));
        let v = rv.v;
        if (from.k === 'float') v = isFinite(v) ? Math.trunc(v) : 0;
        if (ty.name === '_Bool') return { t: ty, v: v !== 0 ? 1 : 0 };
        return { t: ty, v: wrap(ty, v) };
      }
      case 'float': {
        if (from.k === 'struct') throw this.err('cannot convert a struct to ' + typeStr(ty));
        return { t: ty, v: ty.size === 4 ? Math.fround(rv.v) : rv.v };
      }
      case 'ptr': {
        let v = rv.v; if (from.k === 'float') v = Math.trunc(v);
        if (v < 0) v = v + 4294967296;
        return { t: ty, v };
      }
      case 'void': return { t: ty, v: 0 };
      case 'struct':
        if (from !== ty && !(from.k === 'struct' && from.fields === ty.fields)) throw this.err('incompatible types: cannot convert ' + typeStr(from) + ' to ' + typeStr(ty));
        return rv;
    }
    throw this.err('bad conversion');
  }
  truthy(rv) { if (rv.t.k === 'struct') throw this.err('struct used where a scalar is required'); return rv.v !== 0; }

  evalLV(n, env) {
    switch (n.k) {
      case 'id': {
        const v = env.find(n.name);
        if (!v) throw this.err("'" + n.name + "' is not a variable", n.line);
        return { t: v.t, a: v.a };
      }
      case 'un':
        if (n.op === '*') {
          const p = this.evalRV(n.a, env);
          if (p.t.k !== 'ptr') throw this.err('invalid type argument of unary * (' + typeStr(p.t) + ')', n.line);
          if (p.t.to.k === 'void') throw this.err("dereferencing 'void *' pointer", n.line);
          return { t: p.t.to, a: p.v };
        }
        break;
      case 'index': {
        let b = this.evalRV(n.a, env), i = this.evalRV(n.i, env);
        if (b.t.k !== 'ptr' && i.t.k === 'ptr') { const x = b; b = i; i = x; }
        if (b.t.k !== 'ptr') throw this.err('subscripted value is not an array or pointer', n.line);
        return { t: b.t.to, a: b.v + i.v * b.t.to.size };
      }
      case 'member': {
        let st, base;
        if (n.arrow) {
          const p = this.evalRV(n.a, env);
          if (p.t.k !== 'ptr' || p.t.to.k !== 'struct') throw this.err("'->' needs a pointer to a struct", n.line);
          st = p.t.to; base = p.v;
        } else {
          const l = this.evalLV(n.a, env);
          if (l.t.k !== 'struct') throw this.err("request for member '" + n.name + "' in something not a struct", n.line);
          st = l.t; base = l.a;
        }
        if (!st.fields) throw this.err('incomplete struct type', n.line);
        const f = st.fields.find(x => x.name === n.name);
        if (!f) throw this.err(typeStr(st) + " has no member named '" + n.name + "'", n.line);
        return { t: f.ty, a: base + f.off };
      }
      case 'str': return { t: arr(T.char, n.v.length + 1), a: this.strAddr(n.v) };
    }
    throw this.err('expression is not assignable (not an lvalue)', n.line);
  }
  fromLV(l) {
    if (l.t.k === 'array') return { t: ptr(l.t.of), v: l.a };
    return { t: l.t, v: this.rd(l.a, l.t) };
  }
  evalRV(n, env) {
    if (++this.steps > this.opts.maxSteps) throw this.err('Program ran for too long (' + this.opts.maxSteps.toLocaleString() + ' steps) — probably an infinite loop. Execution stopped.', n.line);
    switch (n.k) {
      case 'num': return { t: n.ty, v: n.v };
      case 'str': return { t: ptr(T.char), v: this.strAddr(n.v) };
      case 'id': {
        const v = env.find(n.name);
        if (!v) throw this.err("'" + n.name + "' cannot be used as a value here", n.line);
        return this.fromLV({ t: v.t, a: v.a });
      }
      case 'index': case 'member': return this.fromLV(this.evalLV(n, env));
      case 'un': return this.evalUnary(n, env);
      case 'bin': return this.evalBin(n, env);
      case 'assign': return this.evalAssign(n, env);
      case 'incdec': {
        const l = this.evalLV(n.a, env);
        if (l.t.k !== 'int' && l.t.k !== 'float' && l.t.k !== 'ptr') throw this.err('cannot increment this type', n.line);
        const old = this.rd(l.a, l.t); const d = n.op === '++' ? 1 : -1;
        let nv = l.t.k === 'ptr' ? old + d * l.t.to.size : old + d;
        nv = l.t.k === 'int' ? wrap(l.t, nv) : l.t.k === 'float' && l.t.size === 4 ? Math.fround(nv) : nv;
        this.wr(l.a, l.t, nv);
        return { t: l.t, v: n.pre ? nv : old };
      }
      case 'cond': return this.truthy(this.evalRV(n.c, env)) ? this.evalRV(n.a, env) : this.evalRV(n.b, env);
      case 'comma': this.evalRV(n.a, env); return this.evalRV(n.b, env);
      case 'cast': return this.cast(n.ty, this.evalRV(n.a, env));
      case 'sizeof': {
        if (n.ty) return { t: T.ullong, v: n.ty.size };
        const e = n.e;
        if (e.k === 'id' || e.k === 'index' || e.k === 'member' || (e.k === 'un' && e.op === '*') || e.k === 'str') return { t: T.ullong, v: this.evalLV(e, env).t.size };
        return { t: T.ullong, v: this.evalRV(e, env).t.size };
      }
      case 'call': return this.evalCall(n, env);
    }
    throw this.err('unsupported expression ' + n.k, n.line);
  }
  evalUnary(n, env) {
    switch (n.op) {
      case '*': return this.fromLV(this.evalLV(n, env));
      case '&': {
        const l = this.evalLV(n.a, env);
        return { t: ptr(l.t), v: l.a };
      }
      case '!': return { t: T.int, v: this.truthy(this.evalRV(n.a, env)) ? 0 : 1 };
    }
    const a = this.evalRV(n.a, env);
    if (a.t.k === 'ptr' || a.t.k === 'struct') throw this.err("invalid operand to unary '" + n.op + "'", n.line);
    if (a.t.k === 'float') {
      if (n.op === '~') throw this.err("invalid operand to unary '~' (float)", n.line);
      return { t: a.t, v: n.op === '-' ? -a.v : a.v };
    }
    const rt = promote(a.t);
    if (n.op === '-') return { t: rt, v: wrap(rt, -a.v) };
    if (n.op === '+') return { t: rt, v: a.v };
    if (rt.size === 8) return { t: rt, v: Number(BigInt.asIntN(64, ~BigInt(a.v))) };
    return { t: rt, v: wrap(rt, ~a.v) };
  }
  evalBin(n, env) {
    const op = n.op;
    if (op === '&&') { return { t: T.int, v: this.truthy(this.evalRV(n.a, env)) && this.truthy(this.evalRV(n.b, env)) ? 1 : 0 }; }
    if (op === '||') { return { t: T.int, v: this.truthy(this.evalRV(n.a, env)) || this.truthy(this.evalRV(n.b, env)) ? 1 : 0 }; }
    return this.binop(op, this.evalRV(n.a, env), this.evalRV(n.b, env), n.line);
  }
  binop(op, x, y, line) {
    const tx = x.t, ty = y.t, px = tx.k === 'ptr', py = ty.k === 'ptr';
    if (tx.k === 'struct' || ty.k === 'struct') throw this.err("invalid operands to binary '" + op + "' (struct)", line);
    if (px || py) {
      if (op === '+' && px !== py) { const p = px ? x : y, i = px ? y : x; return { t: p.t, v: p.v + i.v * p.t.to.size }; }
      if (op === '-' && px && !py) return { t: tx, v: x.v - y.v * tx.to.size };
      if (op === '-' && px && py) return { t: T.llong, v: Math.trunc((x.v - y.v) / (tx.to.size || 1)) };
      switch (op) {
        case '==': return { t: T.int, v: +(x.v === y.v) }; case '!=': return { t: T.int, v: +(x.v !== y.v) };
        case '<': return { t: T.int, v: +(x.v < y.v) }; case '>': return { t: T.int, v: +(x.v > y.v) };
        case '<=': return { t: T.int, v: +(x.v <= y.v) }; case '>=': return { t: T.int, v: +(x.v >= y.v) };
      }
      throw this.err("invalid operands to binary '" + op + "' (pointer and " + typeStr(px ? ty : tx) + ')', line);
    }
    const rt = (op === '<<' || op === '>>') ? promote(tx) : arith(tx, ty);
    const isF = rt.k === 'float';
    let a = isF ? x.v : wrap(rt, x.v), b = isF ? y.v : (op === '<<' || op === '>>' ? y.v : wrap(rt, y.v));
    switch (op) {
      case '==': return { t: T.int, v: +(a === b) }; case '!=': return { t: T.int, v: +(a !== b) };
      case '<': return { t: T.int, v: +(a < b) }; case '>': return { t: T.int, v: +(a > b) };
      case '<=': return { t: T.int, v: +(a <= b) }; case '>=': return { t: T.int, v: +(a >= b) };
    }
    let r;
    if (isF) {
      switch (op) {
        case '+': r = a + b; break; case '-': r = a - b; break; case '*': r = a * b; break; case '/': r = a / b; break;
        default: throw this.err("invalid operands to binary '" + op + "' (float)", line);
      }
      return { t: rt, v: rt.size === 4 ? Math.fround(r) : r };
    }
    switch (op) {
      case '+': r = a + b; break; case '-': r = a - b; break;
      case '*': r = rt.size === 8 ? a * b : (rt.signed ? Math.imul(a, b) : Math.imul(a, b) >>> 0); break;
      case '/': if (b === 0) throw this.err('Integer division by zero (EXCEPTION_INT_DIVIDE_BY_ZERO)', line); r = Math.trunc(a / b); break;
      case '%': if (b === 0) throw this.err('Integer division by zero (EXCEPTION_INT_DIVIDE_BY_ZERO)', line); r = a % b; break;
      case '<<': r = rt.size === 8 ? Number(BigInt.asIntN(64, BigInt(a) << BigInt(b & 63))) : a << (b & 31); break;
      case '>>': r = rt.size === 8 ? Number(BigInt(a) >> BigInt(b & 63)) : (rt.signed ? a >> (b & 31) : a >>> (b & 31)); break;
      case '&': case '|': case '^':
        if (rt.size === 8) { const A = BigInt(a), B = BigInt(b); r = Number(op === '&' ? A & B : op === '|' ? A | B : A ^ B); }
        else r = op === '&' ? a & b : op === '|' ? a | b : a ^ b;
        break;
      default: throw this.err('unsupported operator ' + op, line);
    }
    return { t: rt, v: wrap(rt, r) };
  }
  evalAssign(n, env) {
    const l = this.evalLV(n.a, env);
    if (l.t.k === 'array') throw this.err('assignment to expression with array type (arrays cannot be assigned — use strcpy / a loop)', n.line);
    let rhs = this.evalRV(n.b, env);
    if (n.op !== '=') {
      const cur = { t: l.t, v: this.rd(l.a, l.t) };
      rhs = this.binop(n.op.slice(0, -1), cur, rhs, n.line);
    }
    const cv = this.cast(l.t, rhs);
    this.wr(l.a, l.t, cv.v);
    return cv;
  }
  evalCall(n, env) {
    const f = n.fn, args = n.args.map(a => this.evalRV(a, env));
    this.lastLine = n.line;
    const user = this.prog.funcs.get(f.name);
    if (user && !(f.isVar && env.find(f.name))) {
      if (!user.body) throw this.err("undefined reference to '" + f.name + "' (declared but never defined)", n.line);
      return this.callUser(user, args, n.line);
    }
    const b = BUILTINS[f.name];
    if (!b) throw this.err("undefined reference to '" + f.name + "'", n.line);
    return b.call(this, args, n);
  }
  callUser(fn, args, line) {
    if (++this.depth > 3000) throw this.err('Stack overflow — function calls nested too deeply (infinite recursion?)', line);
    const savedSp = this.sp, savedCur = this.cur;
    const env = new Env(this.globals); const frame = { fn: fn.name, env };
    this.frames.push(frame); this.cur = frame;
    fn.params.forEach((p, i) => {
      const a = this.allocStack(p.ty.size, p.ty.align);
      const cv = this.cast(p.ty, args[i]);
      this.wr(a, p.ty, cv.v);
      if (p.name) env.declare(p.name, p.ty, a);
    });
    const r = this.execList(fn.body.stmts, env);
    this.frames.pop(); this.cur = savedCur; this.sp = savedSp; this.depth--;
    if (fn.ret.k === 'void') return { t: T.void, v: 0 };
    if (r && r.ret) return this.cast(fn.ret, r.ret);
    return { t: fn.ret, v: fn.ret.k === 'struct' ? new Uint8Array(fn.ret.size) : 0 };
  }

  /* statements */
  execList(list, env) {
    for (let i = 0; i < list.length; i++) { const r = this.exec(list[i], env); if (r) return r; }
    return undefined;
  }
  exec(s, env) {
    if (++this.steps > this.opts.maxSteps) throw this.err('Program ran for too long (' + this.opts.maxSteps.toLocaleString() + ' steps) — probably an infinite loop. Execution stopped.', s.line);
    switch (s.k) {
      case 'block': { const e = new Env(env), sv = this.sp; const r = this.execList(s.stmts, e); this.sp = sv; if (this.cur) this.cur.env = env; return r; }
      case 'empty': return undefined;
      case 'expr': this.rec(s, env); this.evalRV(s.e, env); return undefined;
      case 'decl': this.rec(s, env); this.execDecl(s, env); return undefined;
      case 'if': {
        this.rec(s, env);
        if (this.truthy(this.evalRV(s.c, env))) return this.exec(s.a, env);
        if (s.b) return this.exec(s.b, env);
        return undefined;
      }
      case 'while': {
        for (;;) {
          this.rec(s, env);
          if (!this.truthy(this.evalRV(s.c, env))) break;
          const r = this.exec(s.body, env);
          if (r) { if (r === BREAK) break; if (r === CONT) continue; return r; }
        }
        return undefined;
      }
      case 'dowhile': {
        for (;;) {
          const r = this.exec(s.body, env);
          if (r) { if (r === BREAK) break; if (r !== CONT) return r; }
          this.rec(s, env);
          if (!this.truthy(this.evalRV(s.c, env))) break;
        }
        return undefined;
      }
      case 'for': {
        const e = new Env(env), sv = this.sp; let first = true;
        this.rec(s, e);
        if (s.init) { if (s.init.k === 'decl') this.execDecl(s.init, e); else this.evalRV(s.init.e, e); }
        for (;;) {
          if (!first) this.rec(s, e);
          first = false;
          if (s.c && !this.truthy(this.evalRV(s.c, e))) break;
          const r = this.exec(s.body, e);
          if (r) { if (r === BREAK) break; if (r !== CONT) { this.sp = sv; return r; } }
          if (s.step) this.evalRV(s.step, e);
        }
        this.sp = sv; if (this.cur) this.cur.env = env;
        return undefined;
      }
      case 'return': {
        this.rec(s, env);
        if (!s.e) return { ret: null };
        return { ret: this.evalRV(s.e, env) };
      }
      case 'break': this.rec(s, env); return BREAK;
      case 'continue': this.rec(s, env); return CONT;
      case 'switch': {
        this.rec(s, env);
        const v = this.evalRV(s.e, env); const e = new Env(env);
        let start = -1;
        for (let i = 0; i < s.stmts.length; i++) if (s.stmts[i].k === 'case' && s.stmts[i].v === v.v) { start = i; break; }
        if (start < 0) for (let i = 0; i < s.stmts.length; i++) if (s.stmts[i].k === 'default') { start = i; break; }
        if (start < 0) return undefined;
        const sv = this.sp;
        for (let i = start; i < s.stmts.length; i++) {
          const st = s.stmts[i]; if (st.k === 'case' || st.k === 'default') continue;
          const r = this.exec(st, e);
          if (r) { this.sp = sv; if (r === BREAK) return undefined; return r; }
        }
        this.sp = sv; return undefined;
      }
    }
    throw this.err('unsupported statement ' + s.k, s.line);
  }
  execDecl(s, env) {
    for (const d of s.decls) {
      const ty = d.ty;
      if (ty.k === 'struct' && !ty.fields) throw this.err("storage size of '" + d.name + "' isn't known (incomplete type)", d.line);
      if (d.storage === 'static') {
        if (!d.addr) { d.addr = this.allocStatic(ty.size, ty.align); this.zeroInit(d.addr, ty, d.init, env); }
        env.declare(d.name, ty, d.addr); continue;
      }
      const a = this.allocStack(ty.size, ty.align);
      env.declare(d.name, ty, a);
      if (d.init) this.zeroInit(a, ty, d.init, env);
    }
  }
  zeroInit(a, ty, init, env) {
    if (!init) return;
    if (init.k === 'list') {
      this.u8.fill(0, a, a + ty.size);
      if (ty.k === 'array') {
        if (init.items.length > ty.n) this.warnings && 0;
        init.items.forEach((it, i) => { if (i < ty.n) this.zeroInit(a + i * ty.of.size, ty.of, it.init, env); });
      } else if (ty.k === 'struct') {
        let idx = 0;
        for (const it of init.items) {
          let f;
          if (it.desig) { f = ty.fields.find(x => x.name === it.desig); idx = ty.fields.indexOf(f) + 1; if (!f) throw this.err('unknown field ' + it.desig); }
          else f = ty.fields[idx++];
          if (!f) throw this.err('too many initializers for ' + typeStr(ty));
          this.zeroInit(a + f.off, f.ty, it.init, env);
        }
      } else if (init.items.length) this.zeroInit(a, ty, init.items[0].init, env);
      return;
    }
    if (ty.k === 'array' && init.k === 'str') {
      this.u8.fill(0, a, a + ty.size);
      for (let i = 0; i < Math.min(init.v.length, ty.n); i++) this.u8[a + i] = init.v.charCodeAt(i) & 255;
      return;
    }
    if (ty.k === 'array') throw this.err('invalid initializer for array');
    const cv = this.cast(ty, this.evalRV(init, env));
    this.wr(a, ty, cv.v);
  }

  /* run */
  runMain() {
    const res = { ok: true, stdout: '', trace: this.trace, events: this.events };
    let exit = 0;
    try {
      for (const g of this.prog.gdecls) this.execDecl(g, this.globals);
      let entry = this.prog.funcs.get('main'), args = [];
      if (entry && entry.body) {
        if (entry.params.length >= 1) {
          const argv = this.allocStatic(16, 8); this.wr(argv, ptr(T.char), this.strAddr('program.exe')); this.wr(argv + 8, ptr(T.char), 0);
          args = [{ t: T.int, v: 1 }, { t: ptr(ptr(T.char)), v: argv }];
        }
      } else {
        entry = this.prog.funcs.get('WinMain');
        if (!entry || !entry.body) throw new CError("undefined reference to 'main'", 0, 0, 'linker error');
        args = [{ t: ptr(T.void), v: 0x400000 }, { t: ptr(T.void), v: 0 }, { t: ptr(T.char), v: this.strAddr('') }, { t: T.int, v: 1 }];
      }
      this.cur = null;
      const r = this.callUser(entry, args, entry.line);
      exit = r.t.k === 'int' ? r.v : 0;
    } catch (e) {
      if (e instanceof ExitSignal) exit = e.code;
      else if (e instanceof RuntimeError) { res.ok = false; res.phase = 'runtime'; res.error = e.message; res.line = e.line; }
      else if (e instanceof CError) { res.ok = false; res.phase = 'compile'; res.errors = [{ line: e.line, col: e.col, msg: e.message, kind: e.kind }]; }
      else if (e instanceof RangeError) { res.ok = false; res.phase = 'runtime'; res.error = 'Stack overflow — the program recursed too deeply'; res.line = this.lastLine; }
      else throw e;
    }
    res.stdout = this.out; res.exit = exit; res.steps = this.steps; res.truncated = this.truncated;
    res.debug = this.debugOut;
    res.leaks = [...this.blocks].filter(([, b]) => !b.freed).map(([a, b]) => ({ addr: a, size: b.req }));
    res.files = [...this.files].map(([name, bytes]) => ({ name, text: Array.from(bytes).map(c => String.fromCharCode(c)).join(''), size: bytes.length }));
    if (this.opts.trace && res.ok !== undefined) {
      const last = this.trace.length && !this.truncated ? this.snapshotEnd() : null;
      if (last) this.trace.push(last);
    }
    return res;
  }
  snapshotEnd() {
    const g = []; for (const v of this.globals.m.values()) g.push(this.describe(v));
    const heap = []; for (const [a, b] of this.blocks) heap.push({ addr: a, size: b.size, req: b.req, freed: b.freed });
    return { line: 0, end: true, fn: '', frames: [], globals: g, heap, out: this.out.length, events: this.events.length, steps: this.steps };
  }
}

/* ------------------------------------------------------------- C library */
const I = v => ({ t: T.int, v });
const D = v => ({ t: T.double, v });
const V = () => ({ t: T.void, v: 0 });
const P = v => ({ t: ptr(T.void), v });

function doPrintf(m, fmt, args, wantArgsStart) {
  let out = '', ai = 0;
  for (let i = 0; i < fmt.length; i++) {
    const c = fmt[i];
    if (c !== '%') { out += c; continue; }
    i++;
    let flags = '';
    while ('-+ #0'.includes(fmt[i]) && i < fmt.length) flags += fmt[i++];
    let width = '';
    if (fmt[i] === '*') { width = String((args[ai++] || { v: 0 }).v); i++; } else while (/\d/.test(fmt[i] || '')) width += fmt[i++];
    let prec = null;
    if (fmt[i] === '.') {
      i++; prec = '';
      if (fmt[i] === '*') { prec = String((args[ai++] || { v: 0 }).v); i++; } else while (/\d/.test(fmt[i] || '')) prec += fmt[i++];
      prec = prec === '' ? 0 : parseInt(prec, 10);
    }
    let len = '';
    while ('hlLzjtI'.includes(fmt[i]) && i < fmt.length) len += fmt[i++];
    if (/^I(64)?$/.test(len) && fmt.startsWith('64', i)) { len = 'll'; i += 2; }
    const conv = fmt[i];
    if (conv === '%') { out += '%'; continue; }
    if (conv === undefined) { out += '%'; break; }
    const arg = args[ai++];
    if (!arg) { out += '<missing arg for %' + conv + '>'; continue; }
    const big = /ll|z|j|t|I/.test(len);
    let s = '';
    switch (conv) {
      case 'd': case 'i': {
        let v = arg.t.k === 'float' ? Math.trunc(arg.v) : arg.v;
        if (!big) v = wrap(T.int, v);
        s = String(Math.abs(v)); const neg = v < 0;
        if (prec !== null) s = s.padStart(prec, '0');
        const sign = neg ? '-' : flags.includes('+') ? '+' : flags.includes(' ') ? ' ' : '';
        if (flags.includes('0') && !flags.includes('-') && prec === null && width) s = s.padStart(Math.max(0, parseInt(width, 10) - sign.length), '0');
        s = sign + s; break;
      }
      case 'u': case 'x': case 'X': case 'o': {
        let v = arg.t.k === 'float' ? Math.trunc(arg.v) : arg.v;
        v = big ? wrap(T.ullong, v) : wrap(T.uint, v);
        s = conv === 'u' ? String(v) : v.toString(conv === 'o' ? 8 : 16);
        if (conv === 'X') s = s.toUpperCase();
        if (prec !== null) s = s.padStart(prec, '0');
        let pre = ''; if (flags.includes('#') && v !== 0) pre = conv === 'x' ? '0x' : conv === 'X' ? '0X' : conv === 'o' ? '0' : '';
        if (flags.includes('0') && !flags.includes('-') && width) s = s.padStart(Math.max(0, parseInt(width, 10) - pre.length), '0');
        s = pre + s; break;
      }
      case 'c': s = String.fromCharCode(arg.v & 255); break;
      case 's': s = m.cstr(arg.v, prec === null ? undefined : prec); break;
      case 'p': s = '0x' + hex(arg.v, 8); break;
      case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
        const v = arg.v; const p = prec === null ? 6 : prec;
        if (!isFinite(v)) s = isNaN(v) ? 'nan' : (v < 0 ? '-inf' : 'inf');
        else if (conv === 'f' || conv === 'F') s = v.toFixed(Math.min(p, 100));
        else if (conv === 'e' || conv === 'E') s = v.toExponential(Math.min(p, 100)).replace(/e([+-])(\d)$/, 'e$10$2');
        else {
          const pp = p === 0 ? 1 : p; const ex = v === 0 ? 0 : Math.floor(Math.log10(Math.abs(v)));
          if (ex < -4 || ex >= pp) s = v.toExponential(pp - 1).replace(/\.?0+e/, 'e').replace(/e([+-])(\d)$/, 'e$10$2');
          else { s = v.toFixed(Math.max(0, pp - 1 - ex)); if (s.includes('.') && !flags.includes('#')) s = s.replace(/\.?0+$/, ''); }
        }
        if (conv === 'E' || conv === 'G') s = s.toUpperCase();
        if (v >= 0 && !Object.is(v, -0)) { if (flags.includes('+')) s = '+' + s; else if (flags.includes(' ')) s = ' ' + s; }
        if (flags.includes('0') && !flags.includes('-') && width && isFinite(v)) {
          const sg = /^[+\- ]/.test(s) ? s[0] : ''; s = sg + s.slice(sg.length).padStart(Math.max(0, parseInt(width, 10) - sg.length), '0');
        }
        break;
      }
      default: out += '%' + conv; continue;
    }
    const w = parseInt(width || '0', 10);
    if (s.length < w) s = flags.includes('-') ? s.padEnd(w) : s.padStart(w);
    out += s;
  }
  return out;
}

function doScanf(m, fmt, args, safe) {
  let ai = 0, count = 0;
  const skipWs = () => { while (m.stdinPos < m.stdin.length && /\s/.test(m.stdin[m.stdinPos])) m.stdinPos++; };
  for (let i = 0; i < fmt.length; i++) {
    const c = fmt[i];
    if (/\s/.test(c)) { skipWs(); continue; }
    if (c !== '%') { skipWs(); if (m.stdin[m.stdinPos] === c) m.stdinPos++; else break; continue; }
    i++; let len = '', wd = '';
    while (/\d/.test(fmt[i] || '')) wd += fmt[i++];
    while ('hlLzjt'.includes(fmt[i]) && i < fmt.length) len += fmt[i++];
    const conv = fmt[i];
    if (conv === '%') { if (m.stdin[m.stdinPos] === '%') { m.stdinPos++; continue; } break; }
    const dst = args[ai++];
    if (!dst) throw m.err('scanf: not enough arguments for the format string');
    if (conv !== 'c') skipWs();
    if (m.stdinPos >= m.stdin.length) return count === 0 ? I(-1) : I(count);
    if (dst.t.k !== 'ptr') throw m.err('scanf needs a pointer (did you forget the & before the variable?)');
    const rest = m.stdin.slice(m.stdinPos);
    let mm;
    if (conv === 'd' || conv === 'i') {
      mm = /^[+-]?\d+/.exec(rest); if (!mm) break;
      m.stdinPos += mm[0].length;
      const t = len === 'll' ? T.llong : len === 'h' ? T.short : T.int; m.wr(dst.v, t, wrap(t, parseInt(mm[0], 10)));
    } else if (conv === 'u') {
      mm = /^\d+/.exec(rest); if (!mm) break; m.stdinPos += mm[0].length; m.wr(dst.v, T.uint, wrap(T.uint, parseInt(mm[0], 10)));
    } else if (conv === 'x') {
      mm = /^(0[xX])?[0-9a-fA-F]+/.exec(rest); if (!mm) break; m.stdinPos += mm[0].length; m.wr(dst.v, T.uint, wrap(T.uint, parseInt(mm[0], 16)));
    } else if (conv === 'f' || conv === 'e' || conv === 'g') {
      mm = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(rest); if (!mm) break;
      m.stdinPos += mm[0].length; m.wr(dst.v, len === 'l' ? T.double : T.float, parseFloat(mm[0]));
    } else if (conv === 's') {
      mm = /^\S+/.exec(rest); if (!mm) break; m.stdinPos += mm[0].length;
      let s = mm[0]; if (wd) s = s.slice(0, +wd); m.stdinPos -= mm[0].length - s.length; if (safe) { const lim = args[ai++]; if (lim) s = s.slice(0, Math.max(0, lim.v - 1)); }
      for (let k = 0; k < s.length; k++) m.u8[dst.v + k] = s.charCodeAt(k); m.chk(dst.v, s.length + 1, true); m.u8[dst.v + s.length] = 0;
    } else if (conv === 'c') {
      m.wr(dst.v, T.char, m.stdin.charCodeAt(m.stdinPos++)); if (safe) ai++;
    } else throw m.err("scanf: unsupported conversion '%" + conv + "'");
    count++;
  }
  return I(count);
}

const num = a => a.v;
const BUILTINS = {
  printf(a) { const s = doPrintf(this, this.cstr(a[0].v), a.slice(1)); this.out += s; return I(s.length); },
  puts(a) { const s = this.cstr(a[0].v) + '\n'; this.out += s; return I(s.length); },
  putchar(a) { this.out += String.fromCharCode(a[0].v & 255); return I(a[0].v); },
  sprintf(a) { const s = doPrintf(this, this.cstr(a[1].v), a.slice(2)); this.chk(a[0].v, s.length + 1, true); for (let i = 0; i < s.length; i++) this.u8[a[0].v + i] = s.charCodeAt(i) & 255; this.u8[a[0].v + s.length] = 0; return I(s.length); },
  snprintf(a) {
    const s = doPrintf(this, this.cstr(a[2].v), a.slice(3)); const n = a[1].v;
    if (n > 0) { const w = s.slice(0, n - 1); this.chk(a[0].v, w.length + 1, true); for (let i = 0; i < w.length; i++) this.u8[a[0].v + i] = w.charCodeAt(i) & 255; this.u8[a[0].v + w.length] = 0; }
    return I(s.length);
  },
  scanf(a) { return doScanf(this, this.cstr(a[0].v), a.slice(1), false); },
  scanf_s(a) { return doScanf(this, this.cstr(a[0].v), a.slice(1), true); },
  getchar() { return I(this.stdinPos < this.stdin.length ? this.stdin.charCodeAt(this.stdinPos++) : -1); },
  fflush() { return I(0); },
  malloc(a) { return P(this.malloc(a[0].v)); },
  calloc(a) { return P(this.malloc(a[0].v * a[1].v, 0)); },
  realloc(a) {
    const old = a[0].v, n = a[1].v;
    if (!old) return P(this.malloc(n));
    const ob = this.blocks.get(old); if (!ob || ob.freed) throw this.err('realloc(): invalid pointer');
    const np = this.malloc(n); if (!np) return P(0);
    this.u8.copyWithin(np, old, old + Math.min(ob.req, n)); this.free(old); return P(np);
  },
  free(a) { this.free(a[0].v); return V(); },
  rand() { this.randState = (Math.imul(this.randState, 1103515245) + 12345) >>> 0; return I((this.randState >>> 16) & 0x7fff); },
  srand(a) { this.randState = a[0].v >>> 0; return V(); },
  abs(a) { return I(wrap(T.int, Math.abs(a[0].v))); },
  labs(a) { return { t: T.long, v: Math.abs(a[0].v) }; },
  atoi(a) { const v = parseInt(this.cstr(a[0].v), 10); return I(isNaN(v) ? 0 : v | 0); },
  atof(a) { const v = parseFloat(this.cstr(a[0].v)); return D(isNaN(v) ? 0 : v); },
  exit(a) { throw new ExitSignal(a[0].v); },
  strlen(a) { return { t: T.ullong, v: this.cstr(a[0].v).length }; },
  strcpy(a) { const s = this.cstr(a[1].v); this.chk(a[0].v, s.length + 1, true); for (let i = 0; i < s.length; i++) this.u8[a[0].v + i] = s.charCodeAt(i); this.u8[a[0].v + s.length] = 0; return a[0]; },
  strncpy(a) { const s = this.cstr(a[1].v), n = a[2].v; this.chk(a[0].v, n, true); for (let i = 0; i < n; i++) this.u8[a[0].v + i] = i < s.length ? s.charCodeAt(i) : 0; return a[0]; },
  strcat(a) { const d = this.cstr(a[0].v), s = this.cstr(a[1].v); const p = a[0].v + d.length; this.chk(p, s.length + 1, true); for (let i = 0; i < s.length; i++) this.u8[p + i] = s.charCodeAt(i); this.u8[p + s.length] = 0; return a[0]; },
  strcmp(a) { const x = this.cstr(a[0].v), y = this.cstr(a[1].v); return I(x < y ? -1 : x > y ? 1 : 0); },
  strncmp(a) { const x = this.cstr(a[0].v).slice(0, a[2].v), y = this.cstr(a[1].v).slice(0, a[2].v); return I(x < y ? -1 : x > y ? 1 : 0); },
  strchr(a) { const s = this.cstr(a[0].v); const i = s.indexOf(String.fromCharCode(a[1].v & 255)); return { t: ptr(T.char), v: i < 0 ? 0 : a[0].v + i }; },
  strstr(a) { const i = this.cstr(a[0].v).indexOf(this.cstr(a[1].v)); return { t: ptr(T.char), v: i < 0 ? 0 : a[0].v + i }; },
  memset(a) { const n = a[2].v; this.chk(a[0].v, n, true); this.u8.fill(a[1].v & 255, a[0].v, a[0].v + n); return a[0]; },
  memcpy(a) { const n = a[2].v; this.chk(a[0].v, n, true); this.chk(a[1].v, n, false); this.u8.copyWithin(a[0].v, a[1].v, a[1].v + n); return a[0]; },
  memmove(a) { return BUILTINS.memcpy.call(this, a); },
  memcmp(a) { for (let i = 0; i < a[2].v; i++) { const d = this.u8[a[0].v + i] - this.u8[a[1].v + i]; if (d) return I(d < 0 ? -1 : 1); } return I(0); },
  sqrt(a) { return D(Math.sqrt(num(a[0]))); }, pow(a) { return D(Math.pow(num(a[0]), num(a[1]))); }, fabs(a) { return D(Math.abs(num(a[0]))); },
  floor(a) { return D(Math.floor(num(a[0]))); }, ceil(a) { return D(Math.ceil(num(a[0]))); }, sin(a) { return D(Math.sin(num(a[0]))); },
  cos(a) { return D(Math.cos(num(a[0]))); }, tan(a) { return D(Math.tan(num(a[0]))); }, atan2(a) { return D(Math.atan2(num(a[0]), num(a[1]))); },
  log(a) { return D(Math.log(num(a[0]))); }, exp(a) { return D(Math.exp(num(a[0]))); }, fmod(a) { return D(num(a[0]) % num(a[1])); },
  round(a) { const v = num(a[0]); return D(v < 0 ? -Math.round(-v) : Math.round(v)); },
  isdigit(a) { return I(+/[0-9]/.test(String.fromCharCode(a[0].v))); }, isalpha(a) { return I(+/[A-Za-z]/.test(String.fromCharCode(a[0].v))); },
  isalnum(a) { return I(+/[A-Za-z0-9]/.test(String.fromCharCode(a[0].v))); }, isspace(a) { return I(+/\s/.test(String.fromCharCode(a[0].v))); },
  isupper(a) { return I(+/[A-Z]/.test(String.fromCharCode(a[0].v))); }, islower(a) { return I(+/[a-z]/.test(String.fromCharCode(a[0].v))); },
  toupper(a) { const c = String.fromCharCode(a[0].v); return I(/[a-z]/.test(c) ? a[0].v - 32 : a[0].v); },
  tolower(a) { const c = String.fromCharCode(a[0].v); return I(/[A-Z]/.test(c) ? a[0].v + 32 : a[0].v); },
  time() { return { t: T.llong, v: 1760000000 + Math.floor(this.fakeClock / 1000) }; },
  clock() { return { t: T.long, v: this.fakeClock }; },
  assert(a, n) { if (!a[0].v) throw this.err('Assertion failed (line ' + n.line + ')', n.line); return V(); },

  /* ---- Win32 ---- */
  MessageBoxA(a) {
    const text = this.cstr(a[1].v), caption = a[2].v ? this.cstr(a[2].v) : 'Error', flags = a[3].v >>> 0;
    this.events.push({ kind: 'msgbox', text, caption, flags, step: this.trace.length, outLen: this.out.length });
    const btn = flags & 0xF;
    return I(btn === 4 || btn === 3 ? 6 : btn === 5 ? 4 : btn === 2 ? 3 : 1);
  },
  Sleep(a) { this.fakeClock += a[0].v; return V(); },
  GetTickCount() { return { t: T.ulong, v: (this.fakeClock + this.steps) >>> 0 }; },
  GetCurrentProcessId() { return { t: T.ulong, v: 4242 }; },
  GetCurrentThreadId() { return { t: T.ulong, v: 1337 }; },
  GetModuleHandleA() { return P(0x400000); },
  GetLastError() { return { t: T.ulong, v: this.lastError || 0 }; },
  ExitProcess(a) { throw new ExitSignal(a[0].v); },
  OutputDebugStringA(a) { this.debugOut += this.cstr(a[0].v); return V(); },
  GetLocalTime(a) {
    const d = new Date(), p = a[0].v, w = [d.getFullYear(), d.getMonth() + 1, d.getDay(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds()];
    w.forEach((v, i) => this.wr(p + i * 2, T.ushort, v)); return V();
  },
  GetProcessHeap() { return P(0x500000); },
  HeapAlloc(a) { return P(this.malloc(a[2].v, (a[1].v & 8) ? 0 : 0xCD)); },
  HeapFree(a) { this.free(a[2].v); return I(1); },
  CreateFileA(a) {
    const name = this.cstr(a[0].v), access = a[1].v >>> 0, disp = a[4].v;
    const exists = this.files.has(name);
    if ((disp === 3 && !exists) || (disp === 1 && exists)) { this.lastError = disp === 3 ? 2 : 80; return P(0xFFFFFFFF); }
    if (disp === 2 || !exists) this.files.set(name, new Uint8Array(0));
    const h = this.nextHandle; this.nextHandle += 4;
    this.handles.set(h, { name, pos: 0, write: !!(access & 0x40000000), read: !!(access & 0x80000000) });
    this.lastError = 0; return P(h);
  },
  WriteFile(a) {
    const h = this.handles.get(a[0].v); if (!h || !h.write) { this.lastError = 6; return I(0); }
    const n = a[2].v; this.chk(a[1].v, n, false);
    const old = this.files.get(h.name), nb = new Uint8Array(Math.max(old.length, h.pos + n)); nb.set(old); nb.set(this.u8.slice(a[1].v, a[1].v + n), h.pos);
    this.files.set(h.name, nb); h.pos += n;
    if (a[3].v) this.wr(a[3].v, T.ulong, n);
    return I(1);
  },
  ReadFile(a) {
    const h = this.handles.get(a[0].v); if (!h || !h.read) { this.lastError = 6; return I(0); }
    const data = this.files.get(h.name), n = Math.max(0, Math.min(a[2].v, data.length - h.pos));
    this.chk(a[1].v, n, true); this.u8.set(data.slice(h.pos, h.pos + n), a[1].v); h.pos += n;
    if (a[3].v) this.wr(a[3].v, T.ulong, n);
    return I(1);
  },
  GetFileSize(a) { const h = this.handles.get(a[0].v); return { t: T.ulong, v: h ? this.files.get(h.name).length : 0xFFFFFFFF }; },
  CloseHandle(a) { return I(this.handles.delete(a[0].v) ? 1 : 0); },
  DeleteFileA(a) { return I(this.files.delete(this.cstr(a[0].v)) ? 1 : 0); },
};
BUILTINS.MessageBox = BUILTINS.MessageBoxA;

/* -------------------------------------------------------------- public API */
function compile(source) {
  const state = { defines: new Map(), included: new Set() };
  const tokens = preprocess(source, state, false);
  const parser = new Parser(tokens, state);
  const prog = parser.parseProgram();
  for (const [name, fn] of prog.funcs) {
    if (!fn.body && name !== 'WinMain' && name !== 'main') {
      /* checked lazily: a prototype that is never called is fine */
    }
  }
  if (!(prog.funcs.get('main') && prog.funcs.get('main').body) && !(prog.funcs.get('WinMain') && prog.funcs.get('WinMain').body)) {
    throw new CError("undefined reference to 'main' — every C program needs int main(void) { ... }", 0, 0, 'linker error');
  }
  return prog;
}

function run(source, opts) {
  opts = Object.assign({ maxSteps: 3000000, trace: true, stdin: '' }, opts || {});
  let prog;
  try { prog = compile(source); }
  catch (e) {
    if (e instanceof CError) return { ok: false, phase: 'compile', errors: [{ line: e.line, col: e.col, msg: e.message, kind: e.kind }], warnings: [], stdout: '', trace: [], events: [] };
    throw e;
  }
  const m = new Machine(prog, opts);
  const res = m.runMain();
  res.warnings = prog.warnings;
  return res;
}

const api = { run, compile, typeStr, CError, version: '1.0' };
if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.CInterp = api;
})(typeof window !== 'undefined' ? window : globalThis);
