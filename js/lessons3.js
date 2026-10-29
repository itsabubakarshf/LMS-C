/* lessons3.js — new lessons: Headers & preprocessor, Addresses, Structs, Pointer-to-pointer, Linked lists.
 * Written for someone who already programs (GDScript): short, example-first, with tasks, hints and solutions. */
(function (root) {
'use strict';
const R = String.raw;
const C = root.COURSE;
const W = n => ({ t: 'widget', w: n });
const html = h => ({ t: 'html', h });
const cmp = (a, b) => ({ t: 'cmp', a, b });
const defs = list => ({ t: 'defs', defs: list });
const quiz = qs => ({ t: 'quiz', qs });
const real = h => ({ t: 'real', h });
const gd = h => ({ t: 'gd', h });
const warn = h => ({ t: 'warn', h });

const NEW = [];

/* =============================================================== HEADERS */
NEW.push({
  after: 'func', id: 'headers', icon: '📎', title: 'Header files and the preprocessor', min: 12, level: 'core',
  sub: '#include, #define, #ifdef, include guards and multi-file programs',
  goals: ['Split a program into .h and .c files', 'Use #define, #ifdef and include guards correctly', 'Avoid the classic macro and double-include traps'],
  blocks: [
    html('<p><b>C has no import system.</b> <code>#include</code> literally <b>pastes the text</b> of another file into yours before compiling. Everything starting with <code>#</code> is handled by the <b>preprocessor</b>, a text-substitution step that runs first.</p>'),
    cmp(['GDScript', R`const MAX_HP = 100
const Util = preload("res://util.gd")

Util.heal(hp, 20)`, 'Modules are real objects; the engine finds them.'],
        ['C', R`#define MAX_HP 100
#include "util.h"      // paste util.h here

heal(hp, 20);`, 'Plain text pasting. The linker later finds heal()’s code in util.c.']),
    html(`<table class="t"><tr><th></th><th>Header (<code>.h</code>)</th><th>Source (<code>.c</code>)</th></tr>
      <tr><td>Contains</td><td><b>Declarations</b>: prototypes, struct types, #defines — “what exists”</td><td><b>Definitions</b>: the function bodies — “how it works”</td></tr>
      <tr><td>Included by</td><td>everyone who uses it</td><td>nobody (it is compiled on its own)</td></tr>
      <tr><td><code>&lt;x.h&gt;</code> vs <code>"x.h"</code></td><td colspan="2"><code>&lt;…&gt;</code> = compiler/system headers (stdio.h, windows.h). <code>"…"</code> = your own project files.</td></tr></table>`),
    W('preprocView'),
    html(`<table class="t"><tr><th>Directive</th><th>What it does</th></tr>
      <tr><td><code>#include "file.h"</code></td><td>paste a file</td></tr>
      <tr><td><code>#define NAME value</code></td><td>replace NAME with value everywhere (a <b>constant</b>)</td></tr>
      <tr><td><code>#define F(x) ((x)*(x))</code></td><td>macro with arguments — pasted text, <b>not</b> a function</td></tr>
      <tr><td><code>#ifdef X … #else … #endif</code></td><td>keep a block only if X is defined (debug code, platforms)</td></tr>
      <tr><td><code>#ifndef X / #define X / #endif</code></td><td>the <b>include guard</b> pattern</td></tr>
      <tr><td><code>#pragma once</code></td><td>short include guard</td></tr>
      <tr><td><code>__LINE__ __FILE__ _WIN32</code></td><td>predefined: current line, file name, “compiling for Windows”</td></tr></table>`),
    W('includeGuard'),
    { t: 'lab', id: 'h-multi', title: 'Build a 3-file program', icon: '📂', maxRows: 14,
      intro: 'Use the tabs. <code>main.c</code> is finished. Read the error you get first — it is a <b>linker</b> error.',
      task: 'Make it print <code>HP: 100</code>: (1) write <code>heal()</code> in <code>game.c</code>, (2) protect <code>game.h</code> with an include guard.',
      hint: 'heal adds amount to hp, then caps at MAX_HP. The guard is #ifndef GAME_H / #define GAME_H … #endif around everything in game.h.',
      files: [
        { name: 'main.c', code: R`
#include <stdio.h>
#include "game.h"

int main(void) {
    int hp = 70;
    hp = heal(hp, 50);
    printf("HP: %d\n", hp);
    return 0;
}
` },
        { name: 'game.h', code: R`
// TODO 2: add an include guard around this file
#define MAX_HP 100

int heal(int hp, int amount);
` },
        { name: 'game.c', code: R`
#include "game.h"

// TODO 1: write int heal(int hp, int amount)
// add amount to hp, but never return more than MAX_HP
` },
      ],
      solution: {
        'game.h': R`
#ifndef GAME_H
#define GAME_H

#define MAX_HP 100

int heal(int hp, int amount);

#endif
`,
        'game.c': R`
#include "game.h"

int heal(int hp, int amount) {
    hp += amount;
    if (hp > MAX_HP) hp = MAX_HP;
    return hp;
}
`,
      },
      expect: (o, r, src) => o === 'HP: 100\n' && /#ifndef|#pragma once/.test(src) },
    { t: 'lab', id: 'h-macro', title: 'Fix the macro trap', icon: '🪤',
      task: 'The program should print <code>9</code> (that is (1+2) squared) but prints 5. Fix the macro — not main.',
      hint: 'Macros paste text, so SQUARE(1 + 2) becomes 1 + 2 * 1 + 2. Wrap each use of x in brackets, and the whole body too.',
      code: R`
#include <stdio.h>

#define SQUARE(x) x * x

int main(void) {
    printf("%d\n", SQUARE(1 + 2));
    return 0;
}
`, solution: R`
#include <stdio.h>

#define SQUARE(x) ((x) * (x))

int main(void) {
    printf("%d\n", SQUARE(1 + 2));
    return 0;
}
`, expect: o => o.trim() === '9' },
    { t: 'lab', id: 'h-debug', title: 'A debug switch', icon: '🐞',
      task: 'Make the <code>[debug]</code> line appear by adding <b>one line</b> at the top of the file. Then delete that line and see it disappear.',
      hint: '#define DEBUG   (no value needed — #ifdef only asks “is it defined?”)',
      code: R`
#include <stdio.h>

int main(void) {
    int hp = 80;
#ifdef DEBUG
    printf("[debug] hp = %d\n", hp);
#endif
    printf("game running\n");
    return 0;
}
`, solution: R`
#define DEBUG
#include <stdio.h>

int main(void) {
    int hp = 80;
#ifdef DEBUG
    printf("[debug] hp = %d\n", hp);
#endif
    printf("game running\n");
    return 0;
}
`, expect: o => o.includes('[debug] hp = 80') },
    quiz([
      { q: 'What does #include <stdio.h> do?', o: ['Imports a compiled module', 'Pastes the text of stdio.h into your file before compiling', 'Starts the program', 'Links the library'], a: 1, why: 'It is text pasting done by the preprocessor. The compiled code of printf is added later by the linker.' },
      { q: 'When do you use "file.h" instead of <file.h>?', o: ['For system headers', 'For your own project files', 'For .c files only', 'Never'], a: 1, why: 'Quotes search your project first; angle brackets search the compiler’s system folders.' },
      { q: 'What belongs in a header file?', o: ['Function bodies', 'Declarations: prototypes, types, #defines', 'main()', 'Only comments'], a: 1, why: 'Bodies in a header would be copied into every .c file that includes it, causing duplicate definitions.' },
      { q: 'What is printed?', code: R`#include <stdio.h>
#define DOUBLE(x) x * 2
int main(void) {
    printf("%d\n", DOUBLE(3 + 1));
    return 0;
}`, o: ['8', '5', '6', '4'], a: 1, why: 'The text becomes 3 + 1 * 2 = 5. Macros do not evaluate arguments first.' },
      { q: 'Why does every header need an include guard?', o: ['To make it faster', 'To stop “redefinition” errors when it is included twice', 'To hide it from other files', 'To make it a library'], a: 1, why: 'Two headers may both include the same third header; the guard makes the second copy empty.' },
      { q: 'What is printed?', code: R`#include <stdio.h>
#define SIZE 4
int main(void) {
    int a[SIZE];
    printf("%d\n", (int)(sizeof(a) / sizeof(a[0])));
    return 0;
}`, o: ['4', '16', '1', '8'], a: 0, why: 'sizeof(a) is 16 bytes, sizeof(a[0]) is 4: 16 / 4 = 4 elements. A handy idiom.' },
      { q: 'util.h declares heal() but util.c is not part of the build. What happens?', o: ['Compile error in main.c', 'Linker error: undefined reference to heal', 'It prints 0', 'It works'], a: 1, why: 'The compiler is happy with a prototype; the linker cannot find the code.' },
      { q: 'What is printed?', code: R`#include <stdio.h>
#define DEBUG
int main(void) {
#ifdef DEBUG
    printf("A");
#else
    printf("B");
#endif
    printf("C\n");
    return 0;
}`, o: ['AC', 'BC', 'ABC', 'C'], a: 0, why: 'DEBUG is defined, so only the #ifdef branch survives the preprocessor.' },
    ]),
    defs([
      ['Preprocessor', 'The text-processing step that runs before the compiler and handles every line starting with <code>#</code>.'],
      ['Header file (.h)', 'A file of declarations shared between source files.'],
      ['Declaration vs definition', 'A declaration says a function/type <i>exists</i> (<code>int heal(int, int);</code>). A definition provides its <i>body</i>. Declare many times, define once.'],
      ['Macro', 'A name that the preprocessor replaces with text. Constant-like (<code>#define MAX 10</code>) or function-like (<code>#define SQ(x) …</code>).'],
      ['Include guard', '<code>#ifndef / #define / #endif</code> (or <code>#pragma once</code>) making a header usable only once per file.'],
      ['Conditional compilation', '<code>#ifdef … #endif</code>: parts of the source exist only in some builds (debug, Windows-only…).'],
      ['Translation unit', 'One .c file after all its #includes are pasted in — what the compiler actually compiles.'],
    ]),
  ],
});

/* =============================================================== ADDRESSES */
NEW.push({
  after: 'arrays', id: 'addr', icon: '📍', title: 'Memory addresses and the & operator', min: 8, level: 'core',
  sub: 'Every variable lives somewhere — the first step to pointers',
  goals: ['See that every variable has an address', 'Use & and %p', 'Know why array addresses step by sizeof(type)'],
  blocks: [
    html('<p>RAM is a huge row of numbered bytes. A variable is just <b>a named spot</b> in that row: it has a <b>value</b> and an <b>address</b> (the number of its first byte). GDScript hides the address; C lets you ask for it with <b>&amp;</b>.</p>'),
    real('<b>Street addresses.</b> “Ada lives at 12 Memory Street.” The person is the value, “12” is the address. Two people can have the same value (age 30) but never the same address.'),
    W('addrExplorer'),
    { t: 'lab', id: 'a-first', title: 'Print an address', icon: '🏷', intro: 'Press Run. Then change hp and run again — the value changes, does the address?',
      code: R`
#include <stdio.h>

int main(void) {
    int hp = 100;
    printf("value   : %d\n", hp);
    printf("address : %p\n", (void*)&hp);
    printf("size    : %zu bytes\n", sizeof(hp));
    return 0;
}
`, solution: null },
    { t: 'lab', id: 'a-task', title: 'Your turn: value and address', icon: '🎯',
      task: 'Print the <b>address</b> of <code>score</code> with <code>%p</code> on the first line, and <code>*(&amp;score)</code> on the second line. The second line must print 42.',
      hint: 'printf("%p\\n", (void*)&score); then printf("%d\\n", *(&score)); — * undoes &, like going to the address and looking inside.',
      code: R`
#include <stdio.h>

int main(void) {
    int score = 42;
    // TODO 1: print the address of score with %p
    // TODO 2: print *(&score)
    return 0;
}
`, solution: R`
#include <stdio.h>

int main(void) {
    int score = 42;
    printf("%p\n", (void*)&score);
    printf("%d\n", *(&score));
    return 0;
}
`, expect: o => /^0x[0-9a-f]+\n42\n$/.test(o) },
    html('<div class="callout warn"><div class="ico">⚠️</div><div><h4>You can only take the address of a variable</h4><p><code>&amp;score</code> is fine. <code>&amp;42</code> or <code>&amp;(a + b)</code> is an error: a temporary value has no home address.</p></div></div>'),
    quiz([
      { q: 'What does &x give you?', o: ['The value of x', 'The address of x', 'x doubled', 'A copy of x'], a: 1, why: '& = “address of”.' },
      { q: 'Which line prints a variable’s address correctly?', o: ['printf("%d", &x);', 'printf("%p", (void*)&x);', 'printf("%s", x);', 'printf("%a", x);'], a: 1, why: '%p is the pointer format; the (void*) cast is the standard way to pass the address.' },
      { q: 'What is printed?', code: R`#include <stdio.h>
int main(void) {
    int arr[3];
    printf("%d\n", (int)((char*)&arr[1] - (char*)&arr[0]));
    return 0;
}`, o: ['1', '4', '8', '12'], a: 1, why: 'Consecutive ints are 4 bytes apart. Casting to char* makes the subtraction count bytes.' },
      { q: 'An array of doubles: how far apart are arr[0] and arr[1] in memory?', o: ['1 byte', '4 bytes', '8 bytes', '16 bytes'], a: 2, why: 'sizeof(double) is 8.' },
      { q: 'Can you write &5 ?', o: ['Yes, it gives the address of the number 5', 'No — a literal has no address; you need a variable', 'Yes but only in main', 'Only with a cast'], a: 1, why: 'Only things that live in memory (variables, array elements, struct fields) have an address.' },
    ]),
    defs([
      ['Address', 'The number of a byte in memory. Written in hexadecimal: <code>0x000FFFF8</code>.'],
      ['Address-of operator &', 'Gives the address of a variable: <code>&amp;hp</code>.'],
      ['%p', 'The printf format for an address (use a <code>(void*)</code> cast).'],
      ['Hexadecimal (hex)', 'Base-16 numbers (0–9, A–F). Two hex digits = one byte, so addresses are always written in hex.'],
      ['Stack grows down', 'On x86/x64 new local variables get <b>lower</b> addresses than older ones.'],
    ]),
  ],
});

/* =============================================================== STRUCTS */
NEW.push({
  after: 'ptr', id: 'structs', icon: '🧱', title: 'Structs, step by step', min: 10, level: 'core',
  sub: 'Your own data types: fields, ., ->, copies and arrays of structs',
  goals: ['Declare, initialise and use a struct', 'Choose between . and ->', 'Pass structs to functions (by value or by pointer)'],
  blocks: [
    cmp(['GDScript', R`class_name Player
var name = "Ada"
var hp = 100

func damage(n):
    hp -= n`, 'Data and functions live together. Objects are references.'],
        ['C', R`typedef struct {
    char name[16];
    int  hp;
} Player;

void damage(Player *p, int n) { p->hp -= n; }`, 'A struct is <b>data only</b>. Functions are separate and receive the struct (or a pointer to it).']),
    html('<p>A struct groups variables into one value. Each <b>field</b> sits at a fixed offset inside it. A struct <b>variable</b> is stored in memory like any other; a <b>copy</b> is a full duplicate; a <b>pointer</b> to it is just its address.</p>'),
    W('structAccess'),
    html('<table class="t"><tr><th>You have</th><th>Access a field with</th><th>Example</th></tr><tr><td>the struct itself</td><td><code>.</code></td><td><code>hero.hp</code></td></tr><tr><td>a <b>pointer</b> to the struct</td><td><code>-&gt;</code></td><td><code>p-&gt;hp</code> (same as <code>(*p).hp</code>)</td></tr></table>'),
    { t: 'lab', id: 's-1', title: 'Fill in a struct', icon: '📦',
      task: 'Set the item’s name to <code>"Potion"</code> and its qty to 3. Expected output: <code>Potion x3</code>.',
      hint: 'A char array cannot be assigned with = ; use strcpy(it.name, "Potion"); For the number just it.qty = 3;',
      code: R`
#include <stdio.h>
#include <string.h>

typedef struct { char name[16]; int qty; } Item;

int main(void) {
    Item it = { "", 0 };
    // TODO: fill in it.name and it.qty
    printf("%s x%d\n", it.name, it.qty);
    return 0;
}
`, solution: R`
#include <stdio.h>
#include <string.h>

typedef struct { char name[16]; int qty; } Item;

int main(void) {
    Item it;
    strcpy(it.name, "Potion");
    it.qty = 3;
    printf("%s x%d\n", it.name, it.qty);
    return 0;
}
`, expect: o => o === 'Potion x3\n' },
    { t: 'lab', id: 's-2', title: 'A function that changes a struct', icon: '⚔️',
      task: 'Finish <code>damage</code> so the hero ends with hp 0 (never negative). Expected: <code>hp=0</code>.',
      hint: 'Receive Player *p, so write p->hp -= amount; then clamp: if (p->hp < 0) p->hp = 0;',
      code: R`
#include <stdio.h>

typedef struct { int hp; } Player;

void damage(Player *p, int amount) {
    // TODO: subtract amount from p's hp, but never go below 0
}

int main(void) {
    Player hero = { 30 };
    damage(&hero, 50);
    printf("hp=%d\n", hero.hp);
    return 0;
}
`, solution: R`
#include <stdio.h>

typedef struct { int hp; } Player;

void damage(Player *p, int amount) {
    p->hp -= amount;
    if (p->hp < 0) p->hp = 0;
}

int main(void) {
    Player hero = { 30 };
    damage(&hero, 50);
    printf("hp=%d\n", hero.hp);
    return 0;
}
`, expect: o => o === 'hp=0\n' },
    { t: 'lab', id: 's-3', title: 'An array of structs', icon: '🛒',
      task: 'Add up qty × price of every item. Expected: <code>total=32</code>.',
      hint: 'for (int i = 0; i < 3; i++) total += cart[i].qty * cart[i].price;',
      code: R`
#include <stdio.h>

typedef struct { int qty; int price; } Line;

int main(void) {
    Line cart[3] = { {2, 5}, {3, 4}, {1, 10} };
    int total = 0;
    // TODO: loop over the cart and add qty * price
    printf("total=%d\n", total);
    return 0;
}
`, solution: R`
#include <stdio.h>

typedef struct { int qty; int price; } Line;

int main(void) {
    Line cart[3] = { {2, 5}, {3, 4}, {1, 10} };
    int total = 0;
    for (int i = 0; i < 3; i++)
        total += cart[i].qty * cart[i].price;
    printf("total=%d\n", total);
    return 0;
}
`, expect: o => o === 'total=32\n' },
    quiz([
      { q: 'What is printed?', code: R`#include <stdio.h>
typedef struct { int hp; } P;
int main(void) {
    P a = {10};
    P b = a;
    b.hp = 99;
    printf("%d\n", a.hp);
    return 0;
}`, o: ['10', '99', '0', 'error'], a: 0, why: 'b is a separate copy; changing it leaves a alone.' },
      { q: 'What is printed?', code: R`#include <stdio.h>
typedef struct { int hp; } P;
int main(void) {
    P a = {10};
    P *p = &a;
    p->hp += 5;
    printf("%d\n", a.hp);
    return 0;
}`, o: ['10', '15', '5', 'error'], a: 1, why: 'p points at a, so p->hp is a.hp.' },
      { q: 'p->hp is the same as…', o: ['p.hp', '(*p).hp', '&p.hp', '*p.hp'], a: 1, why: 'Dereference first, then take the field. The arrow is shorthand.' },
      { q: 'What is printed?', code: R`#include <stdio.h>
typedef struct { int x; int y; } V;
int main(void) {
    V pts[2] = { {1, 2}, {3, 4} };
    printf("%d\n", pts[1].x + pts[0].y);
    return 0;
}`, o: ['3', '5', '4', '6'], a: 1, why: 'pts[1].x is 3 and pts[0].y is 2.' },
      { q: 'Why pass a big struct to a function by pointer?', o: ['It is required', 'It avoids copying and lets the function modify the original', 'Pointers are faster to type', 'Structs cannot be passed by value'], a: 1, why: 'By value copies every byte and changes affect only the copy.' },
      { q: 'Which line is an error for char name[16] inside a struct s?', o: ['strcpy(s.name, "Ada");', 's.name = "Ada";', 's.name[0] = \'A\';', 'printf("%s", s.name);'], a: 1, why: 'Arrays cannot be assigned with =. Use strcpy or set characters one by one.' },
    ]),
    defs([
      ['Struct', 'A custom type made of named fields stored together.'],
      ['Field', 'One named member of a struct.'],
      ['Dot operator (.)', 'Field access on a struct <b>value</b>: <code>hero.hp</code>.'],
      ['Arrow operator (-&gt;)', 'Field access through a <b>pointer</b> to a struct: <code>p-&gt;hp</code>.'],
      ['Struct copy', '<code>b = a;</code> copies every field into b — a deep copy of the bytes (but a pointer field copies only the address).'],
      ['Initialiser list', '<code>{ "Ada", 100 }</code> sets fields in order; the rest become 0.'],
    ]),
  ],
});

/* =============================================================== DOUBLE POINTER */
NEW.push({
  after: 'struct', id: 'dptr', icon: '🔗', title: 'Pointer to pointer (**)', min: 10, level: 'core',
  sub: 'Arrows that point at arrows — and why functions need them',
  goals: ['Read and draw a double pointer', 'Use **pp to change a variable and *pp to re-aim a pointer', 'Allocate memory inside a function'],
  blocks: [
    html('<p>A pointer is a variable, so it has an address too. A <b>pointer to a pointer</b> (<code>int **pp</code>) holds that address. One star more = one more arrow to follow.</p>'),
    W('ptrRead'),
    W('ptrChain'),
    html(`<table class="t"><tr><th>Expression</th><th>Means</th><th>Type</th></tr><tr><td><code>pp</code></td><td>the address of <b>p</b></td><td><code>int **</code></td></tr><tr><td><code>*pp</code></td><td>p itself (follow one arrow)</td><td><code>int *</code></td></tr><tr><td><code>**pp</code></td><td>x (follow two arrows)</td><td><code>int</code></td></tr></table>`),
    W('ptrAlloc'),
    { t: 'lab', id: 'd-1', title: 'Two arrows to x', icon: '🏹',
      task: 'Using only <code>pp</code>, set <code>x</code> to 99. Expected: <code>x=99</code>.',
      hint: '**pp = 99;   (first * reaches p, second * reaches x)',
      code: R`
#include <stdio.h>

int main(void) {
    int x = 1;
    int *p = &x;
    int **pp = &p;
    // TODO: change x to 99 using pp (not x, not p)
    printf("x=%d\n", x);
    return 0;
}
`, solution: R`
#include <stdio.h>

int main(void) {
    int x = 1;
    int *p = &x;
    int **pp = &p;
    **pp = 99;
    printf("x=%d\n", x);
    return 0;
}
`, expect: o => o === 'x=99\n' },
    { t: 'lab', id: 'd-2', title: 'Fix the allocator', icon: '🧰',
      intro: 'Run it first: main prints <code>got NULL</code> because alloc only changes its own copy.',
      task: 'Change <code>alloc</code> (and the call) to take an <code>int **</code> so main prints <code>got 42</code>, and free the memory at the end.',
      hint: 'void alloc(int **pp) { *pp = malloc(sizeof(int)); **pp = 42; }   call it with alloc(&ptr);   then free(ptr);',
      code: R`
#include <stdio.h>
#include <stdlib.h>

void alloc(int *p) {
    p = malloc(sizeof(int));
    *p = 42;
}

int main(void) {
    int *ptr = NULL;
    alloc(ptr);
    if (ptr) printf("got %d\n", *ptr); else printf("got NULL\n");
    return 0;
}
`, solution: R`
#include <stdio.h>
#include <stdlib.h>

void alloc(int **pp) {
    *pp = malloc(sizeof(int));
    **pp = 42;
}

int main(void) {
    int *ptr = NULL;
    alloc(&ptr);
    if (ptr) printf("got %d\n", *ptr); else printf("got NULL\n");
    free(ptr);
    return 0;
}
`, expect: (o, r) => o === 'got 42\n' && r.leaks.length === 0 },
    { t: 'lab', id: 'd-3', title: 'An array of strings', icon: '📚',
      intro: 'Each element of <code>names</code> is a <code>char *</code>. A pointer that walks over them is a <code>char **</code>.',
      task: 'Print the three names, one per line, by walking <code>p</code> over the array and printing <code>*p</code>.',
      hint: 'for (int i = 0; i < 3; i++) { printf("%s\\n", *p); p++; }',
      code: R`
#include <stdio.h>

int main(void) {
    char *names[3] = { "Ada", "Linus", "Grace" };
    char **p = names;
    // TODO: print each name using *p, advancing p each time
    return 0;
}
`, solution: R`
#include <stdio.h>

int main(void) {
    char *names[3] = { "Ada", "Linus", "Grace" };
    char **p = names;
    for (int i = 0; i < 3; i++) {
        printf("%s\n", *p);
        p++;
    }
    return 0;
}
`, expect: o => o === 'Ada\nLinus\nGrace\n' },
    quiz([
      { q: 'What does int **pp mean?', o: ['An array of two ints', 'A pointer to a pointer to an int', 'Two separate pointers', 'A pointer to two ints'], a: 1, why: 'Read right to left: pp is a pointer to a pointer to int.' },
      { q: 'What is printed?', code: R`#include <stdio.h>
int main(void) {
    int x = 1;
    int *p = &x;
    int **pp = &p;
    **pp = 7;
    printf("%d\n", x);
    return 0;
}`, o: ['1', '7', 'an address', 'error'], a: 1, why: 'Two stars follow two arrows to x.' },
      { q: 'What is printed?', code: R`#include <stdio.h>
int main(void) {
    int x = 1, y = 2;
    int *p = &x;
    int **pp = &p;
    *pp = &y;
    *p = 9;
    printf("%d %d\n", x, y);
    return 0;
}`, o: ['9 2', '1 9', '9 9', '1 2'], a: 1, why: '*pp = &y re-aims p at y, so *p = 9 writes y.' },
      { q: 'Why does alloc(int *p) { p = malloc(…); } not give the caller memory?', o: ['malloc fails', 'p is a copy of the caller’s pointer', 'p is const', 'malloc needs two arguments'], a: 1, why: 'Pointers are passed by value too: the function re-aims only its own copy.' },
      { q: 'To let a function change the caller’s pointer, pass…', o: ['The pointer', 'The address of the pointer (a pointer to pointer)', 'A copy of the pointee', 'A struct'], a: 1, why: 'Rule: to change something, pass its address — a pointer’s address is a **.' },
      { q: 'char *names[3] — what is names[1]?', o: ['A char', 'A char* pointing at the second string', 'The second letter', 'An int'], a: 1, why: 'Each element is itself a pointer to the first character of a string.' },
    ]),
    defs([
      ['Pointer to pointer (**)', 'A variable holding the address of another pointer: <code>int **pp</code>.'],
      ['Multiple indirection', 'Following more than one arrow to reach a value: <code>**pp</code>.'],
      ['Re-aiming a pointer', 'Making a pointer point somewhere else (<code>p = &amp;y;</code>). Do it through <code>*pp</code> to change a caller’s pointer.'],
      ['Out parameter (pointer)', 'A parameter used to hand a result back to the caller. For a pointer result it is a <code>**</code>.'],
      ['char **', 'A pointer to a <code>char *</code>: used for arrays of strings such as <code>argv</code>.'],
    ]),
  ],
});

/* =============================================================== LINKED LIST */
NEW.push({
  after: 'dptr', id: 'list', icon: '⛓', title: 'Linked lists', min: 14, level: 'core',
  sub: 'Nodes, next pointers, insert, delete, free — pointers in action',
  goals: ['Build a list node by node', 'Traverse, insert and delete with prev/cur pointers', 'Free every node (no leaks)'],
  blocks: [
    html('<p>An array stores items side by side. A <b>linked list</b> stores each item in its own <b>node</b> anywhere on the heap, and each node holds a pointer to the <b>next</b> one. Inserting or removing in the middle just re-aims a pointer — nothing else moves.</p>'),
    real('<b>Treasure hunt.</b> Each clue (node) holds a prize (value) and says where the <i>next</i> clue is hidden. The last clue says “the end” (<code>NULL</code>). You only know where the first clue is: <code>head</code>.'),
    cmp(['GDScript', R`var items = [10, 20, 30]
items.insert(1, 15)   # engine shifts the rest`, 'Array/linked list details hidden by the engine.'],
        ['C', R`typedef struct Node {
    int value;
    struct Node *next;   // address of the next node
} Node;

Node *head = NULL;   // empty list`, 'You build the chain yourself. <code>struct Node *next</code> uses the full name because the typedef is not finished yet.']),
    W('linkedList'),
    W('listWalk'),
    html(`<table class="t"><tr><th>Operation</th><th>Pattern</th></tr>
      <tr><td>Push front</td><td><code>n->next = head; head = n;</code></td></tr>
      <tr><td>Traverse</td><td><code>for (Node *c = head; c; c = c->next)</code></td></tr>
      <tr><td>Delete after prev</td><td><code>prev->next = cur->next; free(cur);</code></td></tr>
      <tr><td>Free all</td><td>save <code>next</code> <b>before</b> <code>free(cur)</code></td></tr></table>`),
    { t: 'lab', id: 'l-1', title: 'Walk a chain', icon: '🚶',
      task: 'Three nodes are already linked on the stack. Print their values in order with a loop. Expected: <code>10 20 30</code>.',
      hint: 'for (Node *cur = &a; cur != NULL; cur = cur->next) printf("%d ", cur->value);',
      code: R`
#include <stdio.h>

typedef struct Node { int value; struct Node *next; } Node;

int main(void) {
    Node c = { 30, NULL };
    Node b = { 20, &c };
    Node a = { 10, &b };
    // TODO: loop from &a following next until NULL, printing each value
    printf("\n");
    return 0;
}
`, solution: R`
#include <stdio.h>

typedef struct Node { int value; struct Node *next; } Node;

int main(void) {
    Node c = { 30, NULL };
    Node b = { 20, &c };
    Node a = { 10, &b };
    for (Node *cur = &a; cur != NULL; cur = cur->next)
        printf("%d ", cur->value);
    printf("\n");
    return 0;
}
`, expect: o => o.trim() === '10 20 30' },
    { t: 'lab', id: 'l-2', title: 'push_front on the heap', icon: '➕',
      task: 'Complete <code>push_front</code>: allocate a node, store the value, link it before the old head, return it. After pushing 10, 20, 30 the list prints <code>30 20 10</code>.',
      hint: 'Node *n = malloc(sizeof(Node)); n->value = v; n->next = head; return n;',
      code: R`
#include <stdio.h>
#include <stdlib.h>

typedef struct Node { int value; struct Node *next; } Node;

Node *push_front(Node *head, int v) {
    // TODO: make a new node that points at the old head; return it as the new head
    return head;
}

void print_list(Node *head) {
    for (Node *c = head; c; c = c->next) printf("%d ", c->value);
    printf("\n");
}

void free_list(Node *head) {
    while (head) { Node *next = head->next; free(head); head = next; }
}

int main(void) {
    Node *head = NULL;
    head = push_front(head, 10);
    head = push_front(head, 20);
    head = push_front(head, 30);
    print_list(head);
    free_list(head);
    return 0;
}
`, solution: R`
#include <stdio.h>
#include <stdlib.h>

typedef struct Node { int value; struct Node *next; } Node;

Node *push_front(Node *head, int v) {
    Node *n = malloc(sizeof(Node));
    n->value = v;
    n->next = head;
    return n;
}

void print_list(Node *head) {
    for (Node *c = head; c; c = c->next) printf("%d ", c->value);
    printf("\n");
}

void free_list(Node *head) {
    while (head) { Node *next = head->next; free(head); head = next; }
}

int main(void) {
    Node *head = NULL;
    head = push_front(head, 10);
    head = push_front(head, 20);
    head = push_front(head, 30);
    print_list(head);
    free_list(head);
    return 0;
}
`, expect: (o, r) => o.trim() === '30 20 10' && r.leaks.length === 0 },
    { t: 'lab', id: 'l-3', title: 'Sum the list', icon: '➕',
      task: 'Write <code>list_sum</code> that adds all values. The list holds 10, 20 and 30: expected <code>sum=60</code>.',
      hint: 'int total = 0; for (Node *c = head; c; c = c->next) total += c->value; return total;',
      code: R`
#include <stdio.h>

typedef struct Node { int value; struct Node *next; } Node;

int list_sum(Node *head) {
    // TODO
    return 0;
}

int main(void) {
    Node c = { 30, NULL }, b = { 20, &c }, a = { 10, &b };
    printf("sum=%d\n", list_sum(&a));
    return 0;
}
`, solution: R`
#include <stdio.h>

typedef struct Node { int value; struct Node *next; } Node;

int list_sum(Node *head) {
    int total = 0;
    for (Node *c = head; c; c = c->next) total += c->value;
    return total;
}

int main(void) {
    Node c = { 30, NULL }, b = { 20, &c }, a = { 10, &b };
    printf("sum=%d\n", list_sum(&a));
    return 0;
}
`, expect: o => o === 'sum=60\n' },
    { t: 'lab', id: 'l-4', title: 'Stretch: delete a value', icon: '✂️',
      task: 'Complete <code>delete_value</code> so the list prints <code>10 30</code> after deleting 20, with no memory leak. Use the <b>prev / cur</b> pattern from the diagram.',
      hint: 'Walk cur until cur->value == v, remembering prev. If prev is NULL the match was the head, so return cur->next. Otherwise prev->next = cur->next. Then free(cur).',
      code: R`
#include <stdio.h>
#include <stdlib.h>

typedef struct Node { int value; struct Node *next; } Node;

Node *push_front(Node *h, int v) { Node *n = malloc(sizeof(Node)); n->value = v; n->next = h; return n; }
void print_list(Node *h) { for (; h; h = h->next) printf("%d ", h->value); printf("\n"); }
void free_list(Node *h) { while (h) { Node *n = h->next; free(h); h = n; } }

Node *delete_value(Node *head, int v) {
    // TODO: unlink and free the first node whose value is v; return the (possibly new) head
    return head;
}

int main(void) {
    Node *head = NULL;
    head = push_front(head, 30);
    head = push_front(head, 20);
    head = push_front(head, 10);
    head = delete_value(head, 20);
    print_list(head);
    free_list(head);
    return 0;
}
`, solution: R`
#include <stdio.h>
#include <stdlib.h>

typedef struct Node { int value; struct Node *next; } Node;

Node *push_front(Node *h, int v) { Node *n = malloc(sizeof(Node)); n->value = v; n->next = h; return n; }
void print_list(Node *h) { for (; h; h = h->next) printf("%d ", h->value); printf("\n"); }
void free_list(Node *h) { while (h) { Node *n = h->next; free(h); h = n; } }

Node *delete_value(Node *head, int v) {
    Node *prev = NULL, *cur = head;
    while (cur && cur->value != v) {
        prev = cur;
        cur = cur->next;
    }
    if (!cur) return head;            // not found
    if (prev) prev->next = cur->next; // unlink from the middle/end
    else head = cur->next;            // it was the head
    free(cur);
    return head;
}

int main(void) {
    Node *head = NULL;
    head = push_front(head, 30);
    head = push_front(head, 20);
    head = push_front(head, 10);
    head = delete_value(head, 20);
    print_list(head);
    free_list(head);
    return 0;
}
`, expect: (o, r) => o.trim() === '10 30' && r.leaks.length === 0 },
    { t: 'lab', id: 'l-5', title: 'Stretch: reverse the list', icon: '🔄',
      task: 'Complete <code>reverse</code> so 1 2 3 prints as <code>3 2 1</code>. No new nodes — only flip the next pointers.',
      hint: 'Three pointers: prev = NULL, cur = head. Loop: save next = cur->next; cur->next = prev; prev = cur; cur = next. Return prev.',
      code: R`
#include <stdio.h>

typedef struct Node { int value; struct Node *next; } Node;

Node *reverse(Node *head) {
    // TODO: flip every next pointer; return the new head
    return head;
}

void print_list(Node *h) { for (; h; h = h->next) printf("%d ", h->value); printf("\n"); }

int main(void) {
    Node c = { 3, NULL }, b = { 2, &c }, a = { 1, &b };
    Node *head = reverse(&a);
    print_list(head);
    return 0;
}
`, solution: R`
#include <stdio.h>

typedef struct Node { int value; struct Node *next; } Node;

Node *reverse(Node *head) {
    Node *prev = NULL, *cur = head;
    while (cur) {
        Node *next = cur->next;
        cur->next = prev;
        prev = cur;
        cur = next;
    }
    return prev;
}

void print_list(Node *h) { for (; h; h = h->next) printf("%d ", h->value); printf("\n"); }

int main(void) {
    Node c = { 3, NULL }, b = { 2, &c }, a = { 1, &b };
    Node *head = reverse(&a);
    print_list(head);
    return 0;
}
`, expect: o => o.trim() === '3 2 1' },
    quiz([
      { q: 'What does the last node’s next pointer hold?', o: ['The head', 'NULL', '0 bytes', 'Its own address'], a: 1, why: 'NULL marks “no more nodes”.' },
      { q: 'What is the main advantage of a linked list over an array?', o: ['Faster indexing', 'Cheap insert/delete in the middle (no shifting)', 'Uses less memory per item', 'No pointers needed'], a: 1, why: 'Only a couple of pointers change. The price: no direct list[i], and extra memory for next.' },
      { q: 'What is printed?', code: R`#include <stdio.h>
typedef struct N { int v; struct N *next; } N;
int main(void) {
    N c = {3, NULL}, b = {2, &c}, a = {1, &b};
    int sum = 0;
    for (N *p = &a; p; p = p->next) sum += p->v;
    printf("%d\n", sum);
    return 0;
}`, o: ['1', '3', '6', '0'], a: 2, why: '1 + 2 + 3 = 6.' },
      { q: 'What is printed?', code: R`#include <stdio.h>
#include <stdlib.h>
typedef struct N { int v; struct N *next; } N;
int main(void) {
    N *head = NULL;
    for (int i = 1; i <= 3; i++) {
        N *n = malloc(sizeof(N));
        n->v = i;
        n->next = head;
        head = n;
    }
    printf("%d\n", head->v);
    return 0;
}`, o: ['1', '3', '2', 'NULL'], a: 1, why: 'Each new node is pushed in FRONT, so the head is the last one created (3).' },
      { q: 'Why must you save cur->next BEFORE calling free(cur)?', o: ['free is slow', 'After free, reading cur->next is use-after-free', 'next gets doubled', 'No need to'], a: 1, why: 'The node’s memory is gone after free; read what you need first.' },
      { q: 'To delete a node from the middle you do…', o: ['free(cur) only', 'prev->next = cur->next; then free(cur)', 'cur->next = NULL', 'head = NULL'], a: 1, why: 'Unlink first (so the chain skips it), then free it.' },
      { q: 'What happens with while (cur->next != NULL) when the list is empty (head == NULL)?', o: ['It loops zero times', 'It dereferences NULL and crashes', 'It returns 0', 'It allocates a node'], a: 1, why: 'Always handle the empty list before touching head->next.' },
    ]),
    defs([
      ['Node', 'One element of a linked structure: data plus pointer(s) to other nodes.'],
      ['head', 'A pointer to the first node. Lose it and you lose the whole list (leak).'],
      ['next pointer', 'The field inside a node holding the address of the following node.'],
      ['Traversal', 'Visiting each node by following next pointers until NULL.'],
      ['Self-referential struct', 'A struct containing a pointer to its own type: <code>struct Node *next;</code>.'],
      ['Singly vs doubly linked', 'A <b>doubly</b> linked node also has a <code>prev</code> pointer so you can walk backwards.'],
      ['Leak (list)', 'Forgetting to free every node. Free in a loop and save <code>next</code> first.'],
    ]),
  ],
});

/* -------------------------------------------------------------- insert them */
NEW.forEach(n => {
  const idx = C.LESSONS.findIndex(l => l.id === n.after);
  if (idx < 0) throw new Error('anchor lesson missing: ' + n.after);
  const { after, ...les } = n;
  // keep key terms first (like the older lessons): move the defs block to the top
  const di = les.blocks.findIndex(b => b.t === 'defs');
  if (di > 0) { const [d] = les.blocks.splice(di, 1); les.blocks.splice(1, 0, d); }
  C.LESSONS.splice(idx + 1, 0, les);
  C.DEFS[les.id] = (les.blocks.find(b => b.t === 'defs') || { defs: [] }).defs;
});
})(window);
