/* lessons2.js — extra definitions, real-life examples, interactive diagrams and challenge quizzes.
 * It extends COURSE.LESSONS (from lessons.js) without touching the original text. */
(function (root) {
'use strict';
const R = String.raw;
const C = root.COURSE;
const L = id => C.LESSONS.find(l => l.id === id);

/* ------------------------------------------------------------ insert helper */
function ins(id, where, blocks) {
  const les = L(id); if (!les) throw new Error('no lesson ' + id);
  const bl = les.blocks; let at = -1;
  const find = pred => bl.findIndex(pred);
  const [kind, arg] = where.split(':');
  if (kind === 'start') at = 1;
  else if (kind === 'afterWidget') at = find(b => b.t === 'widget' && b.w === arg) + 1;
  else if (kind === 'beforeWidget') at = find(b => b.t === 'widget' && b.w === arg);
  else if (kind === 'afterLab') at = find(b => b.t === 'lab' && b.id === arg) + 1;
  else if (kind === 'beforeLab') at = find(b => b.t === 'lab' && b.id === arg);
  else if (kind === 'afterQuiz') { let k = -1; bl.forEach((b, i) => { if (b.t === 'quiz') k = i; }); at = k + 1; }
  else if (kind === 'beforeTutor') at = find(b => b.t === 'tutor');
  else if (kind === 'beforeQuiz') at = find(b => b.t === 'quiz');
  if (at < 0 || (kind !== 'start' && at === 0 && kind.startsWith('after'))) throw new Error('anchor not found: ' + id + ' ' + where);
  bl.splice(at, 0, ...blocks);
}
const W = n => ({ t: 'widget', w: n });
const defs = (id, title) => ({ t: 'defs', defs: C.DEFS[id], title });
const ex = (id, title, why, code, after, stdin) => ({ t: 'example', id, title, why, code, after, stdin });
const challenge = qs => ({ t: 'quiz', title: '🔥 Challenge round — harder questions', qs });

/* ------------------------------------------------------------- definitions */
C.DEFS = {
  how: [
    ['Source code', 'The human-readable text you write (<code>main.c</code>). The computer cannot execute it directly.'],
    ['Compiler', 'A program that checks your source for grammar mistakes and translates it into machine instructions. Examples: MSVC (<code>cl</code>), GCC, Clang.'],
    ['Preprocessor', 'The first stage: a find-and-replace robot that handles every line starting with <code>#</code> (<code>#include</code>, <code>#define</code>).'],
    ['Assembly', 'A readable form of CPU instructions such as <code>mov eax, 5</code>. One line ≈ one machine instruction.'],
    ['Machine code', 'The raw bytes a CPU executes. Each instruction is a few bytes, e.g. <code>B8 05 00 00 00</code>.'],
    ['Object file', 'The compiler’s output for one source file (<code>.obj</code> / <code>.o</code>): machine code with holes where other functions’ addresses go.'],
    ['Linker', 'Joins object files and libraries, fills in those holes and writes the final <code>.exe</code>. Produces “undefined reference” errors.'],
    ['Executable (.exe)', 'The finished program. On Windows it is a <b>PE file</b> starting with the letters “MZ”.'],
    ['Interpreter', 'A program that reads and runs code <i>while</i> it runs (like Godot running GDScript). Slower than compiled code but flexible.'],
    ['Undefined behaviour', 'Code the C standard gives no rules for (bad pointer, out-of-range index). Anything may happen: crash, wrong value, or “works” by luck.'],
  ],
  hello: [
    ['Function', 'A named, reusable block of code, e.g. <code>main</code> or <code>printf</code>.'],
    ['main', 'The function where every C program starts running. Returns an <code>int</code> exit code.'],
    ['Statement', 'One instruction that does something. In C it ends with a semicolon <code>;</code>.'],
    ['Header file', 'A <code>.h</code> file listing the functions/types a library offers (<code>stdio.h</code>, <code>windows.h</code>). Included with <code>#include</code>.'],
    ['String literal', 'Text in double quotes, like <code>"Hello"</code>. Stored as characters plus a hidden <code>\\0</code> at the end.'],
    ['Escape sequence', 'A backslash code for a special character: <code>\\n</code> new line, <code>\\t</code> tab, <code>\\\\</code> backslash, <code>\\"</code> quote.'],
    ['Exit code', 'The number <code>main</code> returns to the OS. <code>0</code> = success; other values mean an error.'],
    ['Comment', 'Text ignored by the compiler: <code>// one line</code> or <code>/* many lines */</code>.'],
    ['Syntax error', 'A violation of the language grammar (missing <code>;</code>, unbalanced brackets). The compiler refuses to build.'],
  ],
  types: [
    ['Variable', 'A named place in memory that holds a value of a fixed type.'],
    ['Type', 'Tells the compiler how many bytes a value occupies and how to interpret those bits.'],
    ['int', 'Whole numbers, 4 bytes on Windows: about −2.1 billion … +2.1 billion.'],
    ['char', 'One byte (8 bits). Holds a small number or one character (ASCII code).'],
    ['float / double', 'Numbers with a fractional part. float = 4 bytes (~7 digits), double = 8 bytes (~15 digits). Stored as approximations.'],
    ['unsigned', 'A type with no negative values; the sign bit is used to double the positive range. <code>unsigned char</code>: 0…255.'],
    ['Bit / byte', 'A bit is a 0 or 1. A byte is 8 bits and the smallest addressable unit of memory.'],
    ['sizeof', 'An operator giving the size of a type or variable in bytes. <code>sizeof(int)</code> is 4.'],
    ['Overflow', 'A result too big for its type. Integers silently <b>wrap around</b> (255 + 1 → 0 for unsigned char).'],
    ['Initialisation', 'Giving a variable its first value at declaration: <code>int hp = 100;</code>. Uninitialised locals hold garbage.'],
    ['Two’s complement', 'How computers store negative integers: the top bit is the sign bit and −1 is all ones (0xFFFFFFFF for int).'],
    ['Little-endian', 'The byte order used by x86/x64: the <i>least</i> significant byte is stored at the lowest address.'],
    ['ASCII', 'A table mapping numbers to characters: 65 = \'A\', 97 = \'a\', 48 = \'0\'.'],
  ],
  ops: [
    ['Operator', 'A symbol that computes something: <code>+ - * / % == && ! &amp; |</code>.'],
    ['Operand', 'A value an operator works on. In <code>3 + 4</code> the operands are 3 and 4.'],
    ['Integer division', 'Dividing two integers drops the fraction: <code>7 / 2 == 3</code>.'],
    ['Modulo (%)', 'The remainder after division: <code>7 % 3 == 1</code>. Great for wrapping and “every Nth”.'],
    ['Cast', 'Converting a value to another type on purpose: <code>(float)total / count</code>.'],
    ['Precedence', 'The order in which operators bind: <code>*</code> before <code>+</code>. Use brackets when unsure.'],
    ['Bitwise operators', '<code>&amp; | ^ ~ &lt;&lt; &gt;&gt;</code> work on individual bits. Used for flags, masks and fast maths.'],
    ['Flag', 'A single bit used as an on/off switch. Several are combined into one integer with <code>|</code>.'],
    ['Format specifier', 'A placeholder in a printf string (<code>%d %f %s %c %x</code>) replaced by an argument.'],
    ['Short-circuit', '<code>&&</code> and <code>||</code> stop evaluating as soon as the result is known.'],
  ],
  if: [
    ['Condition', 'An expression that is read as true (non-zero) or false (0).'],
    ['Branch', 'One of the possible paths through the code chosen by a condition.'],
    ['if / else', 'Runs one block when the condition is true and (optionally) another when false.'],
    ['switch', 'Chooses a branch by comparing one integer against constant <code>case</code> labels.'],
    ['Fall-through', 'Without <code>break</code>, execution continues into the next case.'],
    ['Ternary operator', '<code>cond ? a : b</code> — an expression form of if/else.'],
    ['Flowchart', 'A diagram of a program’s steps: rectangles for actions, diamonds for decisions, arrows for flow.'],
    ['Boolean', 'A value that is either true or false. In C: 0 is false, anything else is true (<code>stdbool.h</code> adds <code>bool</code>).'],
    ['enum', 'A list of named integer constants: <code>enum { IDLE, CHASE, FLEE };</code> (0, 1, 2).'],
  ],
  loops: [
    ['Loop', 'Code that repeats while a condition holds.'],
    ['Iteration', 'One pass through a loop body (one “lap”).'],
    ['for loop', 'Use when you know the count: <code>for (init; condition; step)</code>.'],
    ['while loop', 'Checks the condition <i>before</i> each lap; may run zero times.'],
    ['do-while loop', 'Checks <i>after</i> each lap; always runs at least once.'],
    ['Loop counter', 'A variable (usually <code>i</code>) that changes each lap and ends the loop.'],
    ['break / continue', '<code>break</code> leaves the loop; <code>continue</code> jumps to the next lap.'],
    ['Infinite loop', 'A loop whose condition never becomes false. Game loops are intentionally infinite until you quit.'],
    ['Off-by-one error', 'Running the loop one time too many or too few (<code>&lt;=</code> instead of <code>&lt;</code>).'],
    ['Nested loop', 'A loop inside a loop: rows × columns. Total laps multiply.'],
  ],
  func: [
    ['Parameter', 'A variable listed in a function’s definition that receives a value when called.'],
    ['Argument', 'The actual value you pass in the call: in <code>add(2, 3)</code> the arguments are 2 and 3.'],
    ['Return value', 'The result a function hands back with <code>return</code>.'],
    ['Prototype', 'A declaration of a function’s signature ending with <code>;</code>, placed above its first use.'],
    ['Scope', 'The region where a name is visible. A local variable exists only inside its <code>{ }</code> block.'],
    ['Call stack', 'The pile of active function calls. Each call pushes a <b>frame</b> holding its parameters and locals.'],
    ['Stack frame', 'The block of stack memory belonging to one function call. Popped when the function returns.'],
    ['Pass by value', 'The function receives a <i>copy</i> of the argument; the caller’s variable is unaffected.'],
    ['Recursion', 'A function calling itself. It needs a <b>base case</b> to stop, otherwise: stack overflow.'],
    ['void', 'The “nothing” type: a function returning <code>void</code> gives back no value.'],
    ['Side effect', 'Anything a function does besides returning (printing, changing a global or memory through a pointer).'],
  ],
  arrays: [
    ['Array', 'A fixed number of same-typed elements stored one after another in memory.'],
    ['Index', 'The position of an element, counted from 0. It is really an <i>offset</i> from the start.'],
    ['Element', 'One item of an array. <code>a[2]</code> is the third element.'],
    ['Bounds', 'The valid index range 0 … n−1. C does <b>not</b> check it.'],
    ['Buffer overflow', 'Writing past the end of an array, corrupting neighbouring memory. A top cause of crashes and security holes.'],
    ['String (C string)', 'An array of <code>char</code> ending with the null terminator <code>\\0</code>.'],
    ['Null terminator', 'The byte with value 0 that marks where a string ends.'],
    ['strlen / sizeof', '<code>strlen</code> counts characters up to <code>\\0</code>; <code>sizeof</code> gives the whole array size in bytes.'],
    ['2D array', 'An array of arrays (rows × columns), stored row after row (row-major).'],
    ['Initialiser list', '<code>{1, 2, 3}</code> — values given when declaring an array or struct. Missing items become 0.'],
  ],
  ptr: [
    ['Memory address', 'The number identifying a byte in memory, like a street number. Shown in hex: <code>0x000FFFF4</code>.'],
    ['Pointer', 'A variable whose value is a memory address. <code>int *p</code> points to an int.'],
    ['Address-of (&)', 'Gives the address of a variable: <code>&amp;x</code>.'],
    ['Dereference (*)', 'Follows a pointer to read or write the thing it points at: <code>*p</code>.'],
    ['NULL', 'The address 0, meaning “points to nothing”. Dereferencing it crashes immediately.'],
    ['Pointer arithmetic', '<code>p + 1</code> moves by <code>sizeof(*p)</code> bytes — to the next element.'],
    ['Out parameter', 'A pointer parameter a function writes its result through, e.g. <code>GetLocalTime(&amp;st)</code>.'],
    ['Dangling pointer', 'A pointer to memory that has been freed or has gone out of scope. Using it is a bug.'],
    ['void *', 'A pointer to “any type”. Must be cast back before dereferencing. <code>malloc</code> returns one.'],
    ['Aliasing', 'Two pointers referring to the same memory: changing it through one changes what the other sees.'],
    ['Segmentation fault / access violation', 'The OS killing a program for touching memory it has no right to (the Windows wording is “access violation”).'],
  ],
  struct: [
    ['Struct', 'A group of named fields (possibly different types) stored together as one object.'],
    ['Field / member', 'One named piece of a struct, accessed with <code>.</code> or <code>-&gt;</code>.'],
    ['typedef', 'Gives a type a new, shorter name: <code>typedef struct {…} Player;</code>.'],
    ['Padding', 'Unused bytes the compiler inserts so fields sit at addresses their type prefers. Makes <code>sizeof</code> bigger.'],
    ['Alignment', 'The rule that a type should start at an address divisible by its size (int at multiples of 4).'],
    ['Stack', 'Fast, automatic memory for local variables. Freed when the function returns. Small.'],
    ['Heap', 'Large memory you manage by hand with <code>malloc</code>/<code>free</code>. Lives until freed.'],
    ['malloc / free', '<code>malloc(n)</code> reserves n bytes on the heap and returns the address; <code>free(p)</code> returns them.'],
    ['Memory leak', 'Heap memory that is never freed — the program slowly eats RAM.'],
    ['Use-after-free', 'Using memory after <code>free</code>. Undefined behaviour — a classic bug and security hole.'],
    ['Linked list', 'A chain of heap-allocated nodes, each holding data and a pointer to the next.'],
    ['realloc', 'Resizes a heap block, copying the old contents if it has to move.'],
  ],
  win: [
    ['Win32 API', 'The set of C functions Windows provides to programs: windows, files, memory, processes.'],
    ['HANDLE', 'An opaque “ticket” (really a <code>void *</code>) that stands for something Windows owns: a file, thread, window…'],
    ['HWND', 'A handle to a <b>w</b>indow.'],
    ['DWORD', '“Double word”: a 32-bit unsigned integer (<code>unsigned long</code> on Windows).'],
    ['BOOL', 'An int used as true/false. <code>TRUE</code> = 1, <code>FALSE</code> = 0.'],
    ['LPCSTR', '“Long pointer to constant string” = <code>const char *</code>. The “long” is a 16-bit-era leftover.'],
    ['Hungarian notation', 'A prefix showing a variable’s type: <code>dwFlags</code> (DWORD), <code>lpText</code> (pointer), <code>hWnd</code> (handle).'],
    ['Message', 'A small package of information (click, key press, redraw) sent to a window. Identified by constants like <code>WM_PAINT</code>.'],
    ['Message loop', 'The loop <code>while (GetMessage(...)) { DispatchMessage(...); }</code> that keeps a Windows program alive.'],
    ['WndProc', 'The “window procedure”: a callback function you write that Windows calls with every message for your window.'],
    ['Callback', 'A function you give to someone else so they can call it back later (like WndProc).'],
    ['WinMain', 'The entry point of a graphical Windows program (instead of <code>main</code>).'],
    ['GetLastError', 'Returns the numeric reason the most recent Win32 call failed (2 = file not found, 5 = access denied).'],
    ['DLL', 'A <b>d</b>ynamic-<b>l</b>ink <b>l</b>ibrary: shared code (like <code>kernel32.dll</code>) loaded by many programs.'],
  ],
  done: [
    ['Debugging', 'Finding and fixing mistakes by making the program’s real behaviour visible.'],
    ['Breakpoint', 'A marker where a debugger pauses the program so you can inspect variables.'],
    ['Warning', 'The compiler noticing something suspicious but legal. Treat warnings as bugs waiting to happen.'],
    ['Build', 'The whole process of turning source files into a runnable program.'],
  ],
};

/* ---------------------------------------------------------- challenge quizzes */
const Q = {
  how: [
    { q: 'What does the linker do?', o: ['Checks the grammar of your code', 'Combines object files and libraries into one executable', 'Translates C to assembly', 'Runs the program'], a: 1, why: 'The compiler makes one object file per .c file; the linker glues them (and library code like printf) into the .exe.' },
    { q: 'What does the preprocessor do with  #define MAX 10 ?', o: ['Creates a variable named MAX', 'Replaces every MAX in the text with 10 before compiling', 'Declares a function', 'Nothing — it is a comment'], a: 1, why: 'It is pure text substitution; MAX never exists as a variable.' },
    { q: 'Which statement about C is true?', o: ['It is interpreted line by line while running', 'It is translated to machine code ahead of time', 'It has a garbage collector', 'It checks array bounds at run time'], a: 1, why: 'C is compiled ahead of time. There is no runtime checking or garbage collection unless you add it.' },
    { q: 'Where does a C program start executing?', o: ['The first line of the file', 'The function main', 'The #include line', 'The last function in the file'], a: 1, why: 'The runtime startup code calls main.' },
    { q: '“undefined reference to ‘foo’” is reported by…', o: ['The preprocessor', 'The compiler', 'The linker', 'The CPU'], a: 2, why: 'The compiler accepted the call (it saw a declaration) but the linker could not find the function’s code.' },
    { q: 'What is machine code?', o: ['Text you type', 'The bytes the CPU executes directly', 'A backup of your project', 'Python bytecode'], a: 1, why: 'Instructions encoded as numbers. Assembly is its readable form.' },
    { q: 'What does this program print?  (↵ means a new line)', code: R`#include <stdio.h>
int main(void) {
    printf("Hello");
    printf(" C");
    printf("!\n");
    return 0;
}`, o: ['Hello C!↵', 'Hello↵ C↵!↵', 'Hello C !', 'Hello'], a: 0, why: 'printf does not add a newline by itself. The only \\n is at the end.' },
    { q: 'Why is C considered “close to the hardware”?', o: ['It only runs on old computers', 'You work directly with memory, bytes and addresses', 'It has no functions', 'It needs assembly to run'], a: 1, why: 'Pointers, manual memory and fixed-size types map directly onto how the machine works.' },
  ],
  hello: [
    { q: 'Which line is a correct C statement?', o: ['printf("Hi")', 'printf("Hi");', 'print("Hi");', 'printf(Hi);'], a: 1, why: 'The function is spelled printf, the text needs quotes, and the statement ends with ;.' },
    { q: 'What does #include <stdio.h> give you?', o: ['The main function', 'Declarations for printf, scanf, puts and friends', 'The compiler', 'A window on screen'], a: 1, why: 'stdio.h = standard input/output declarations.' },
    { q: 'What does this print?  (↵ = new line)', code: R`#include <stdio.h>
int main(void) {
    printf("A\n");
    printf("B");
    printf("C\n");
    return 0;
}`, o: ['A↵BC↵', 'AB↵C↵', 'A B C', 'A↵B↵C↵'], a: 0, why: '"B" has no \\n after it, so "C" continues on the same line.' },
    { q: 'Which is a valid single-line comment in C?', o: ['// note', '# note', '-- note', '<!-- note -->'], a: 0, why: '// (C99) or /* … */. # starts a preprocessor directive.' },
    { q: 'What is the difference between puts("hi") and printf("hi")?', o: ['None', 'puts adds a newline automatically', 'puts is only for numbers', 'printf cannot print text'], a: 1, why: 'puts writes the string plus \\n. printf writes exactly what you give it.' },
    { q: 'main returns 0. What does the operating system conclude?', o: ['The program failed', 'The program succeeded', 'The program is empty', 'Nothing — the value is ignored'], a: 1, why: 'Exit code 0 is the universal “success” code (batch files check it with %ERRORLEVEL%).' },
    { q: 'What is the escape sequence for a tab character?', o: ['\\t', '\\n', '\\0', '\\\\'], a: 0, why: '\\t = tab, \\n = new line, \\0 = null, \\\\ = a backslash.' },
    { q: 'You forgot a semicolon at the end of line 4. The compiler usually reports the error on…', o: ['Line 4', 'Line 5 (the next statement)', 'Line 1', 'It never reports it'], a: 1, why: 'The compiler only realises something is wrong when it meets the next token.' },
  ],
  types: [
    { q: 'Which type is the best fit for the number 3.14?', o: ['int', 'char', 'float', 'void'], a: 2, why: 'float or double. int would chop the fraction.' },
    { q: 'What is the output?', code: R`#include <stdio.h>
int main(void) {
    unsigned char c = 250;
    c = c + 10;
    printf("%d\n", c);
    return 0;
}`, o: ['260', '4', '10', '-6'], a: 1, why: '260 does not fit in 8 bits: 260 − 256 = 4 (wrap-around).' },
    { q: 'What is the output?', code: R`#include <stdio.h>
int main(void) {
    int a = 7;
    double b = a / 2;
    printf("%.1f\n", b);
    return 0;
}`, o: ['3.5', '3.0', '3', '4.0'], a: 1, why: 'a / 2 is integer division = 3, only then converted to double 3.0.' },
    { q: 'What does char c = \'A\'; printf("%d", c); print?', o: ['A', '65', 'a', 'It does not compile'], a: 1, why: '%d prints the number stored in the char: the ASCII code of A.' },
    { q: 'Which type is 8 bytes on 64-bit Windows?', o: ['int', 'long', 'long long', 'float'], a: 2, why: 'On Windows long is only 4 bytes; long long is 8.' },
    { q: 'What does unsigned mean?', o: ['The value cannot be changed', 'No negative values — the range shifts to 0 … max×2+1', 'The variable is a pointer', 'The value is rounded'], a: 1, why: 'The sign bit is used for magnitude, doubling the positive range.' },
    { q: 'Visual Studio debug builds fill uninitialised stack memory with which byte?', o: ['0x00', '0xCC', '0xFF', 'random letters'], a: 1, why: '0xCC makes uninitialised variables easy to recognise (0xCCCCCCCC = −858993460).' },
    { q: 'Which is the correct way to avoid garbage in a local variable?', o: ['Never use it', 'Initialise it: int hp = 0;', 'Declare it twice', 'Use sizeof'], a: 1, why: 'Locals are not cleared automatically in C.' },
    { q: 'An int holds −1. Which bit pattern is that (two’s complement)?', o: ['0x00000001', '0x80000001', '0xFFFFFFFF', '0x7FFFFFFF'], a: 2, why: '−1 is all ones in two’s complement.' },
  ],
  ops: [
    { q: 'What is printed?', code: R`#include <stdio.h>
int main(void) {
    printf("%d %d\n", 17 / 5, 17 % 5);
    return 0;
}`, o: ['3 2', '3.4 2', '3 3', '2 3'], a: 0, why: '17 = 3 × 5 + 2: quotient 3, remainder 2.' },
    { q: 'What is the value of  5 > 3 && 2 > 4 ?', o: ['1', '0', '5', 'compile error'], a: 1, why: 'true && false = false = 0.' },
    { q: 'What is printed?', code: R`#include <stdio.h>
int main(void) {
    int x = 5;
    x += 3;
    x *= 2;
    printf("%d\n", x);
    return 0;
}`, o: ['13', '16', '10', '40'], a: 1, why: '5 + 3 = 8, then 8 × 2 = 16.' },
    { q: 'What is printed?', code: R`#include <stdio.h>
int main(void) {
    int i = 5;
    printf("%d ", i++);
    printf("%d\n", i);
    return 0;
}`, o: ['5 5', '5 6', '6 6', '6 5'], a: 1, why: 'Post-increment uses the old value (5) and then adds 1.' },
    { q: 'Which operator tests for equality?', o: ['=', '==', '!=', '=>'], a: 1, why: '= assigns, == compares.' },
    { q: 'What does  x & 1  tell you?', o: ['Whether x is zero', 'Whether x is odd (the lowest bit is set)', 'x squared', 'x halved'], a: 1, why: 'AND with 1 keeps only the lowest bit: 1 for odd numbers, 0 for even.' },
    { q: 'What is  1 << 4 ?', o: ['4', '8', '16', '14'], a: 2, why: 'Shifting left by n multiplies by 2ⁿ: 1 × 16.' },
    { q: 'What does printf("%5.1f", 3.14159) print?', o: ['3.14159', '  3.1', '3.1 (no padding)', '5.1'], a: 1, why: 'Width 5 (padded with spaces), 1 decimal place: "  3.1".' },
    { q: 'What is printed?', code: R`#include <stdio.h>
int main(void) {
    printf("%.2f\n", 10 / 4.0);
    return 0;
}`, o: ['2.00', '2.50', '2', '2.5000'], a: 1, why: 'One operand is a double, so the division is floating-point: 2.5.' },
  ],
  if: [
    { q: 'What is printed?  (↵ = new line)', code: R`#include <stdio.h>
int main(void) {
    int x = 10;
    if (x > 5) printf("A"); else printf("B");
    if (x > 20) printf("C");
    printf("\n");
    return 0;
}`, o: ['A↵', 'AC↵', 'B↵', 'AB↵'], a: 0, why: 'The first if prints A. The second condition is false.' },
    { q: 'What does  a ? b : c  do?', o: ['Loops', 'Evaluates to b if a is true, otherwise c', 'Declares three variables', 'Compares three values'], a: 1, why: 'It is a compact expression-style if/else.' },
    { q: 'What is printed?', code: R`#include <stdio.h>
int main(void) {
    int k = 2;
    switch (k) {
        case 1: printf("one ");
        case 2: printf("two ");
        case 3: printf("three "); break;
        default: printf("other");
    }
    printf("\n");
    return 0;
}`, o: ['two', 'two three', 'two three other', 'three'], a: 1, why: 'Case 2 has no break, so it falls through into case 3, which then breaks.' },
    { q: 'Which of these values is FALSE in C?', o: ['-1', '0', '0.5', '"0" (a string)'], a: 1, why: 'Only zero is false.' },
    { q: 'What is printed?', code: R`#include <stdio.h>
int main(void) {
    int a = 3;
    if (a = 0) printf("yes"); else printf("no");
    printf(" a=%d\n", a);
    return 0;
}`, o: ['yes a=3', 'no a=3', 'no a=0', 'yes a=0'], a: 2, why: 'a = 0 assigns 0 (and evaluates to 0 = false) → "no", and a is now 0.' },
    { q: 'Which keyword leaves a switch case?', o: ['stop', 'break', 'exit', 'end'], a: 1, why: 'break jumps to the end of the switch.' },
    { q: 'In  if (p != NULL && *p > 0)  what happens when p is NULL?', o: ['Crash at *p', 'The right side is skipped (short-circuit), no crash', 'Compile error', 'It prints a warning'], a: 1, why: '&& stops at the first false operand — that is why this idiom is safe.' },
    { q: 'enum { IDLE, CHASE, FLEE }; — what is the value of FLEE?', o: ['0', '1', '2', '3'], a: 2, why: 'Enumerators count up from 0: IDLE=0, CHASE=1, FLEE=2.' },
  ],
  loops: [
    { q: 'What is printed?', code: R`#include <stdio.h>
int main(void) {
    for (int i = 0; i < 3; i++) printf("%d ", i);
    printf("\n");
    return 0;
}`, o: ['0 1 2', '1 2 3', '0 1 2 3', '1 2'], a: 0, why: 'i starts at 0 and the loop stops when i reaches 3.' },
    { q: 'What is printed?', code: R`#include <stdio.h>
int main(void) {
    int n = 3;
    while (n > 0) { printf("%d ", n); n--; }
    printf("\n");
    return 0;
}`, o: ['3 2 1', '2 1 0', '3 2 1 0', 'nothing'], a: 0, why: 'n is printed before being decremented; the loop ends when n becomes 0.' },
    { q: 'What is printed?', code: R`#include <stdio.h>
int main(void) {
    for (int i = 1; i <= 10; i++) {
        if (i % 2 == 0) continue;
        if (i > 7) break;
        printf("%d ", i);
    }
    printf("\n");
    return 0;
}`, o: ['1 3 5 7', '1 3 5 7 9', '2 4 6 8', '1 3 5'], a: 0, why: 'Even numbers are skipped; at 9 the break fires before printing.' },
    { q: 'What is printed?', code: R`#include <stdio.h>
int main(void) {
    int n = 10;
    do { printf("x"); } while (n < 5);
    printf("\n");
    return 0;
}`, o: ['(nothing)', 'x', 'xxxxx', 'x forever'], a: 1, why: 'do-while runs its body once before testing the condition.' },
    { q: 'How many times does the body of  for (int i = 1; i <= 5; i++)  run?', o: ['4', '5', '6', 'forever'], a: 1, why: 'i = 1,2,3,4,5.' },
    { q: 'The three parts of a for loop header, in order, are…', o: ['condition; init; step', 'init; condition; step', 'step; init; condition', 'init; step; condition'], a: 1, why: 'Start; keep-going-while; after-each-lap.' },
    { q: 'Which loop never stops?', o: ['for (;;) { }', 'for (int i = 0; i < 3; i++) { }', 'while (0) { }', 'do { } while (0);'], a: 0, why: 'An empty condition means “always true”.' },
    { q: 'An array has n elements. What is wrong with  for (i = 0; i <= n; i++) a[i] = 0; ?', o: ['Nothing', 'It writes one element past the end', 'It skips the first element', 'It is slower'], a: 1, why: 'Valid indexes are 0 … n−1. Classic off-by-one buffer overflow.' },
  ],
  func: [
    { q: 'What is printed?', code: R`#include <stdio.h>
int twice(int n) { return n * 2; }
int main(void) {
    printf("%d\n", twice(twice(3)));
    return 0;
}`, o: ['6', '12', '9', '3'], a: 1, why: 'The inner call gives 6, the outer call doubles it: 12.' },
    { q: 'What does a void function return?', o: ['0', 'Nothing', 'A random value', 'The last variable'], a: 1, why: 'void = no value.' },
    { q: 'What is a prototype?', o: ['A finished function', 'A declaration of name, return type and parameters before the definition', 'A unit test', 'A macro'], a: 1, why: 'It lets you call a function that is defined further down the file.' },
    { q: 'What is printed?', code: R`#include <stdio.h>
void bump(int n) { n++; }
int main(void) {
    int a = 5;
    bump(a);
    printf("%d\n", a);
    return 0;
}`, o: ['5', '6', '0', 'error'], a: 0, why: 'bump changed its own copy of a.' },
    { q: 'A variable declared inside a function is visible…', o: ['everywhere', 'only inside that function/block', 'in other source files', 'after the function returns'], a: 1, why: 'Local scope: it is created on call and destroyed on return.' },
    { q: 'What is printed?', code: R`#include <stdio.h>
int sum(int n) { return n == 0 ? 0 : n + sum(n - 1); }
int main(void) {
    printf("%d\n", sum(4));
    return 0;
}`, o: ['4', '10', '24', '0'], a: 1, why: '4 + 3 + 2 + 1 + 0 = 10.' },
    { q: 'What happens with recursion that never reaches its base case?', o: ['It runs forever happily', 'Stack overflow: the program crashes', 'Compile error', 'Returns 0'], a: 1, why: 'Each call pushes a frame; the stack is finite.' },
    { q: 'What should main’s return type be?', o: ['void', 'int', 'char', 'float'], a: 1, why: 'int, so the OS receives an exit code.' },
  ],
  arrays: [
    { q: 'What is printed?', code: R`#include <stdio.h>
int main(void) {
    int a[4] = {5, 6, 7, 8};
    printf("%d %d\n", a[0], a[3]);
    return 0;
}`, o: ['5 8', '5 7', '6 8', '5 4'], a: 0, why: 'Index 0 is the first element, index 3 is the last.' },
    { q: 'What is printed?', code: R`#include <stdio.h>
int main(void) {
    int a[5] = {1, 2};
    printf("%d %d\n", a[1], a[4]);
    return 0;
}`, o: ['2 0', '2 garbage', '1 5', 'compile error'], a: 0, why: 'When an initialiser list is shorter than the array, the remaining elements are set to 0.' },
    { q: 'What is printed?', code: R`#include <stdio.h>
#include <string.h>
int main(void) {
    char s[] = "abc";
    printf("%zu %zu\n", sizeof(s), strlen(s));
    return 0;
}`, o: ['3 3', '4 3', '3 4', '4 4'], a: 1, why: 'sizeof counts the hidden \\0 (4 bytes); strlen does not (3).' },
    { q: 'In pointer terms, a[i] means…', o: ['*(a + i)', '&a + i', 'a * i', '*a * i'], a: 0, why: 'Indexing is just pointer arithmetic plus a dereference.' },
    { q: 'Which function copies a string?', o: ['strcmp', 'strcpy', 'strlen', 'strchr'], a: 1, why: 'strcpy(dest, src). strcmp compares, strlen measures.' },
    { q: 'What is wrong with  char name[4] = "Alice";  ?', o: ['Nothing', 'It needs 6 bytes (5 letters + \\0): it does not fit', 'Strings must be unsigned', 'Strings need malloc'], a: 1, why: 'The buffer is too small — a buffer overflow in the making.' },
    { q: 'What is printed?', code: R`#include <stdio.h>
int main(void) {
    char w[] = "cat";
    w[0] = 'b';
    printf("%s\n", w);
    return 0;
}`, o: ['cat', 'bat', 'bcat', 'error'], a: 1, why: 'A char array is writable memory, so we can change its first letter.' },
    { q: 'How many ints are in  int grid[3][4] ?', o: ['7', '12', '3', '4'], a: 1, why: '3 rows × 4 columns = 12.' },
    { q: 'What does  if (a == b)  compare when a and b are char* strings?', o: ['The text', 'The addresses (pointers), not the characters', 'The lengths', 'Nothing useful'], a: 1, why: 'Use strcmp(a, b) == 0 to compare contents.' },
  ],
  ptr: [
    { q: 'What is printed?', code: R`#include <stdio.h>
int main(void) {
    int x = 4;
    int *p = &x;
    *p = *p + 1;
    printf("%d\n", x);
    return 0;
}`, o: ['4', '5', 'an address', 'error'], a: 1, why: '*p is x itself, so x becomes 5.' },
    { q: 'What is printed?', code: R`#include <stdio.h>
int main(void) {
    int a[3] = {10, 20, 30};
    int *p = a;
    p++;
    printf("%d\n", *p);
    return 0;
}`, o: ['10', '20', '30', '11'], a: 1, why: 'p++ moves to the next int, so *p is a[1].' },
    { q: 'What is the &x operator called?', o: ['Dereference', 'Address-of', 'Bitwise AND only', 'Cast'], a: 1, why: '&x yields the memory address of x.' },
    { q: 'What happens with  int *p = NULL; *p = 1;  ?', o: ['p becomes 1', 'The program crashes with an access violation', 'Nothing', 'Compile error'], a: 1, why: 'Address 0 is never mapped; writing there faults immediately.' },
    { q: 'What is printed?', code: R`#include <stdio.h>
int main(void) {
    int x = 1, y = 2;
    int *p = &x;
    int *q = &y;
    p = q;
    *p = 9;
    printf("%d %d\n", x, y);
    return 0;
}`, o: ['9 2', '1 9', '9 9', '1 2'], a: 1, why: 'p was re-aimed at y, so *p = 9 changes y.' },
    { q: 'sizeof(int *) on 64-bit Windows is…', o: ['2', '4', '8', 'depends on the int'], a: 2, why: 'Every pointer is 8 bytes on a 64-bit system.' },
    { q: 'Why does scanf("%d", &x) need the &?', o: ['It is decoration', 'scanf must receive the address so it can store into x', 'It converts to hex', 'It makes the input faster'], a: 1, why: 'Pass by value would only give scanf a copy of x.' },
    { q: 'What is a dangling pointer?', o: ['A NULL pointer', 'A pointer to memory that was freed or is out of scope', 'A pointer to a pointer', 'An uninitialised int'], a: 1, why: 'It still holds an address, but the memory is no longer yours.' },
    { q: 'What is printed?', code: R`#include <stdio.h>
int main(void) {
    int a[5];
    int *p = &a[1];
    int *q = &a[4];
    printf("%d\n", (int)(q - p));
    return 0;
}`, o: ['3', '12', '4', '1'], a: 0, why: 'Pointer subtraction counts elements, not bytes: 4 − 1 = 3.' },
    { q: 'What does void * mean?', o: ['A pointer that cannot be used', 'A generic pointer to unknown type', 'A pointer to nothing', 'A pointer to a function'], a: 1, why: 'malloc returns void *; cast or assign it to the right pointer type.' },
  ],
  struct: [
    { q: 'What is printed?', code: R`#include <stdio.h>
struct P { int x; int y; };
int main(void) {
    struct P a = {3, 4};
    struct P *p = &a;
    p->x += 10;
    printf("%d %d\n", a.x, p->y);
    return 0;
}`, o: ['3 4', '13 4', '13 14', 'error'], a: 1, why: 'p->x is a.x, so it became 13.' },
    { q: 'What is sizeof(struct { char a; int b; }) on Windows?', o: ['5', '8', '4', '6'], a: 1, why: 'char (1) + 3 bytes of padding + int (4) = 8.' },
    { q: 'How many bytes does malloc(5 * sizeof(int)) request?', o: ['5', '10', '20', '40'], a: 2, why: '5 × 4 = 20 bytes.' },
    { q: 'What does malloc return when it cannot allocate?', o: ['0 bytes', 'NULL', '-1', 'It crashes'], a: 1, why: 'Always check for NULL before using the memory.' },
    { q: 'What is “use after free”?', o: ['Reading memory after calling free() on it', 'Freeing twice', 'Not calling free', 'Allocating too much'], a: 0, why: 'The memory may be reused or unmapped — undefined behaviour.' },
    { q: 'What fixes a memory leak?', o: ['Calling free() on every block you malloc', 'Using bigger blocks', 'Calling malloc twice', 'Using float'], a: 0, why: 'Every malloc needs exactly one matching free.' },
    { q: 'What is printed?', code: R`#include <stdio.h>
typedef struct { int a; } T;
int main(void) {
    T t = {5};
    T u = t;
    u.a = 9;
    printf("%d %d\n", t.a, u.a);
    return 0;
}`, o: ['5 5', '5 9', '9 9', '9 5'], a: 1, why: 'Struct assignment copies all fields: u is an independent copy.' },
    { q: 'In a singly linked list, the last node’s next pointer is…', o: ['the head', 'NULL', '0 bytes', 'itself'], a: 1, why: 'NULL marks the end of the chain.' },
    { q: 'Which kind of memory is freed automatically when the function returns?', o: ['The heap', 'The stack', 'Both', 'Neither'], a: 1, why: 'Locals live on the stack; heap blocks need free().' },
    { q: 'How does calloc(n, size) differ from malloc(n * size)?', o: ['It is slower', 'It zero-fills the memory', 'It allocates on the stack', 'No difference'], a: 1, why: 'calloc returns zeroed memory; malloc leaves it uninitialised.' },
  ],
  win: [
    { q: 'What does a HANDLE represent?', o: ['A pointer you may dereference', 'An opaque ticket for an object owned by Windows', 'A string', 'A function'], a: 1, why: 'You pass it to API functions; you never look inside.' },
    { q: 'Which function releases a file HANDLE?', o: ['free', 'CloseHandle', 'DeleteFileA', 'ExitProcess'], a: 1, why: 'free is for malloc memory. Kernel objects are released with CloseHandle.' },
    { q: 'What is a DWORD?', o: ['A 16-bit signed int', 'A 32-bit unsigned integer', 'A 64-bit pointer', 'A string'], a: 1, why: '“Double word” = 2 × 16-bit words = 32 bits.' },
    { q: 'What is WinMain?', o: ['A debugging tool', 'The entry point of a graphical Windows program', 'A DLL', 'A message'], a: 1, why: 'Console programs use main; GUI programs use WinMain.' },
    { q: 'MB_YESNO | MB_ICONQUESTION produces…', o: ['A logical OR true/false', 'One number combining two flag bits', 'A pipe to another process', 'A compile error'], a: 1, why: 'Each flag occupies different bits; | merges them.' },
    { q: 'GetMessage returns 0 when…', o: ['The queue is empty', 'WM_QUIT is received', 'The window is minimised', 'An error occurs'], a: 1, why: 'That is how the message loop knows to end.' },
    { q: 'What is WndProc?', o: ['A callback you write that Windows calls with messages', 'A Windows built-in function', 'A type of handle', 'A compiler flag'], a: 0, why: 'You register it in WNDCLASS.lpfnWndProc.' },
    { q: 'CreateFileA returns INVALID_HANDLE_VALUE. What does that mean?', o: ['The file is empty', 'The call failed', 'The file is huge', 'The handle is valid'], a: 1, why: 'Check for it before using the handle; GetLastError() says why.' },
    { q: 'LPCSTR is the same as…', o: ['char', 'const char *', 'int *', 'unsigned long'], a: 1, why: '“Long pointer to constant string”.' },
    { q: 'What is printed?', code: R`#include <stdio.h>
#include <windows.h>
int main(void) {
    DWORD a = 0xFFFFFFFF;
    a = a + 1;
    printf("%lu\n", a);
    return 0;
}`, o: ['0', '4294967296', '-1', '1'], a: 0, why: 'DWORD is 32-bit unsigned: the largest value + 1 wraps to 0.' },
  ],
};

/* ---------------------------------------------------------------- examples */
const EX = {
  how: [ex('ex-how-banner', 'a game boot screen', 'Every program starts as a handful of printf calls. Change the title and run it — this is exactly how a tool prints its start-up banner.', R`
#include <stdio.h>

int main(void) {
    printf("================================\n");
    printf("   SPACE MINER  v0.1  (C edition)\n");
    printf("================================\n");
    printf("Loading assets... done\n");
    printf("Press any key to start\n");
    return 0;
}
`)],
  hello: [ex('ex-hello-cat', 'ASCII art title screen', 'Before graphics there was text art. Notice the doubled backslash <code>\\\\</code> — one backslash would start an escape sequence.', R`
#include <stdio.h>

int main(void) {
    puts("  /\\_/\\  ");
    puts(" ( o.o ) ");
    puts("  > ^ <  ");
    printf("The cat says: \"Hello, %s!\"\n", "world");
    return 0;
}
`), ex('ex-hello-receipt', 'a shop receipt with aligned columns', 'Formatting matters in real tools. <code>%-12s</code> = left-aligned in 12 columns; <code>%8.2f</code> = width 8 with 2 decimals.', R`
#include <stdio.h>

int main(void) {
    printf("%-12s %3s %8s\n", "Item", "Qty", "Price");
    printf("%-12s %3d %8.2f\n", "Potion", 3, 4.5);
    printf("%-12s %3d %8.2f\n", "Sword", 1, 120.0);
    printf("%-12s %3d %8.2f\n", "Shield", 2, 60.25);
    printf("%-12s %12.2f\n", "TOTAL", 3 * 4.5 + 120.0 + 2 * 60.25);
    return 0;
}
`, 'Try changing a price or a column width and see how the table shifts.')],
  types: [ex('ex-types-enemy', 'a memory budget for 10 000 enemies', 'Game developers count bytes. Picking <code>uint8_t</code> instead of <code>int</code> for health shrinks every enemy — but the 255 limit wraps around (see the last line!).', R`
#include <stdio.h>
#include <stdint.h>

typedef struct {
    uint8_t  hp;
    uint8_t  level;
    uint16_t xp;
    float    x, y;
} Enemy;

int main(void) {
    printf("sizeof(Enemy) = %zu bytes\n", sizeof(Enemy));
    printf("10000 enemies = %zu KB\n", 10000 * sizeof(Enemy) / 1024);

    uint8_t hp = 250;
    hp += 10;                       // oops: 260 does not fit in 8 bits
    printf("hp after healing: %d\n", hp);
    return 0;
}
`, 'Click “Step through” and watch hp wrap from 250 to 4.'),
  ex('ex-types-convert', 'temperature and price calculations', 'float for quick game maths; double when you care about more digits. Mixing int and double promotes the int.', R`
#include <stdio.h>

int main(void) {
    float celsius = 36.6f;
    float fahrenheit = celsius * 9.0f / 5.0f + 32.0f;
    printf("%.1f C = %.1f F\n", celsius, fahrenheit);

    double price = 19.99;
    int qty = 3;
    printf("%d games cost %.2f\n", qty, price * qty);
    return 0;
}
`)],
  ops: [ex('ex-ops-damage', 'a damage calculator with a critical-hit chance', 'rand() % 100 gives 0…99, so “< 25” is a 25 % chance. The ternary <code>?:</code> picks the multiplier.', R`
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int attack = 50, defense = 20;
    int base = attack - defense / 2;

    srand(7);
    int crit = (rand() % 100) < 25;
    int damage = crit ? base * 2 : base;

    printf("base=%d crit=%d damage=%d\n", base, crit, damage);
    printf("enemy HP left: %d (%.1f%%)\n", 200 - damage, (200 - damage) * 100.0 / 200);
    return 0;
}
`, 'Change srand(7) to another seed to get a different roll.'),
  ex('ex-ops-time', 'seconds to hh:mm:ss with / and %', 'The same trick every game timer and video player uses: divide for the big unit, modulo for the remainder.', R`
#include <stdio.h>

int main(void) {
    int total = 3725;
    int h = total / 3600;
    int m = (total % 3600) / 60;
    int s = total % 60;
    printf("%d seconds = %02d:%02d:%02d\n", total, h, m, s);
    return 0;
}
`),
  ex('ex-ops-flags', 'permission flags with bit operators', 'Windows packs many yes/no options into a single number exactly like this (MB_YESNO | MB_ICONQUESTION, GENERIC_READ | GENERIC_WRITE…).', R`
#include <stdio.h>

#define CAN_READ  1
#define CAN_WRITE 2
#define CAN_ADMIN 4

int main(void) {
    int perms = CAN_READ | CAN_WRITE;      // 0b011
    printf("perms = %d\n", perms);

    if (perms & CAN_WRITE)    puts("can write");
    if (!(perms & CAN_ADMIN)) puts("not an admin");

    perms |= CAN_ADMIN;                    // switch a bit ON
    perms &= ~CAN_WRITE;                   // switch a bit OFF
    printf("now perms = %d\n", perms);
    return 0;
}
`, 'Use the “Click the bits” diagram above to see what | & ~ do to each bit.')],
  if: [ex('ex-if-atm', 'ATM withdrawal rules', 'Real programs are mostly checks like these, ordered from “reject early” to “do the work”.', R`
#include <stdio.h>

int main(void) {
    int balance = 120, request = 50, pin_ok = 1;

    if (!pin_ok)                 puts("Wrong PIN");
    else if (request > balance)  puts("Insufficient funds");
    else if (request % 10 != 0)  puts("Only multiples of 10");
    else {
        balance -= request;
        printf("Dispensed %d. Balance: %d\n", request, balance);
    }
    return 0;
}
`, 'Set request to 500, then to 55, then pin_ok to 0 and see each branch fire.'),
  ex('ex-if-ai', 'an enemy AI state machine', 'An enum names the states, if/else chooses one, and switch acts on it. This is the skeleton of most game AI.', R`
#include <stdio.h>

typedef enum { IDLE, PATROL, CHASE, FLEE } State;

int main(void) {
    int dist = 4, hp = 80;
    State s = IDLE;

    if (hp < 25)        s = FLEE;
    else if (dist < 5)  s = CHASE;
    else if (dist < 15) s = PATROL;

    switch (s) {
        case IDLE:   puts("zzz...");               break;
        case PATROL: puts("walks the route");      break;
        case CHASE:  printf("chases the player (distance %d)\n", dist); break;
        case FLEE:   puts("runs away!");           break;
    }
    return 0;
}
`)],
  loops: [ex('ex-loop-bar', 'a text health bar', 'A loop that prints one cell per iteration. The ternary chooses the symbol.', R`
#include <stdio.h>

int main(void) {
    int hp = 7, max = 10;
    printf("HP [");
    for (int i = 0; i < max; i++)
        putchar(i < hp ? '#' : '-');
    printf("] %d/%d\n", hp, max);
    return 0;
}
`),
  ex('ex-loop-primes', 'prime numbers (nested loops)', 'An inner loop inside an outer loop: for every n, try every divisor d. <code>break</code> stops early once a divisor is found.', R`
#include <stdio.h>

int main(void) {
    for (int n = 2; n <= 30; n++) {
        int prime = 1;
        for (int d = 2; d * d <= n; d++)
            if (n % d == 0) { prime = 0; break; }
        if (prime) printf("%d ", n);
    }
    printf("\n");
    return 0;
}
`),
  ex('ex-loop-menu', 'a game menu loop (do-while)', 'A menu must show at least once, then repeat until “quit”. We fake the keyboard with an array of pretend inputs.', R`
#include <stdio.h>

int main(void) {
    int inputs[] = {2, 2, 9, 1, 0};   // pretend the player typed these
    int i = 0, choice, coins = 0;

    do {
        choice = inputs[i++];
        if (choice == 1)      { coins += 10; puts("opened a chest"); }
        else if (choice == 2) { puts("walked"); }
        else if (choice != 0) { puts("unknown command"); }
    } while (choice != 0);

    printf("coins: %d\n", coins);
    return 0;
}
`)],
  func: [ex('ex-func-lib', 'a tiny game-maths library', 'Small, well-named functions are how big programs stay readable. clamp and lerp are in every engine, including Godot.', R`
#include <stdio.h>

int clamp(int v, int lo, int hi) {
    if (v < lo) return lo;
    if (v > hi) return hi;
    return v;
}

float lerp(float a, float b, float t) { return a + (b - a) * t; }

int max2(int a, int b) { return a > b ? a : b; }

int main(void) {
    printf("%d %d\n", clamp(150, 0, 100), clamp(-5, 0, 100));
    printf("%.2f\n", lerp(0.0f, 10.0f, 0.25f));
    printf("%d\n", max2(3, 9));
    return 0;
}
`),
  ex('ex-func-recursion', 'recursion: Fibonacci and a countdown', 'A function that calls itself needs a base case. Step through <code>countdown</code> and watch the stack grow to 6 frames and shrink again.', R`
#include <stdio.h>

int fib(int n) { return n < 2 ? n : fib(n - 1) + fib(n - 2); }

void countdown(int n) {
    if (n == 0) { puts("Liftoff!"); return; }
    printf("%d... ", n);
    countdown(n - 1);
}

int main(void) {
    for (int i = 0; i < 10; i++) printf("%d ", fib(i));
    printf("\n");
    countdown(5);
    return 0;
}
`)],
  arrays: [ex('ex-arr-scores', 'a high-score table (bubble sort)', 'Sort the array with two nested loops that swap neighbours, then print the top three.', R`
#include <stdio.h>

int main(void) {
    int scores[6] = {420, 1500, 90, 780, 1500, 15};
    int n = 6;

    for (int i = 0; i < n - 1; i++)
        for (int j = 0; j < n - 1 - i; j++)
            if (scores[j] < scores[j + 1]) {
                int t = scores[j];
                scores[j] = scores[j + 1];
                scores[j + 1] = t;
            }

    puts("HIGH SCORES");
    for (int i = 0; i < 3; i++)
        printf("%d. %5d\n", i + 1, scores[i]);
    return 0;
}
`),
  ex('ex-arr-vowels', 'counting vowels in a string', 'Walk the char array until you hit the <code>\\0</code> terminator. tolower() makes the test case-insensitive.', R`
#include <stdio.h>
#include <ctype.h>
#include <string.h>

int main(void) {
    char text[] = "Hello Windows API";
    int vowels = 0;

    for (int i = 0; text[i] != '\0'; i++) {
        char c = tolower(text[i]);
        if (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u')
            vowels++;
    }
    printf("\"%s\" has %d vowels in %zu characters\n", text, vowels, strlen(text));
    return 0;
}
`)],
  ptr: [ex('ex-ptr-divmod', 'returning two results with pointers', 'A function returns only one value — but it can <i>write</i> more through pointers. This is the “out parameter” pattern of the Win32 API.', R`
#include <stdio.h>

void divmod(int a, int b, int *q, int *r) {
    *q = a / b;
    *r = a % b;
}

int main(void) {
    int quo, rem;
    divmod(17, 5, &quo, &rem);
    printf("17 / 5 = %d remainder %d\n", quo, rem);
    return 0;
}
`, 'Step through and watch quo and rem fill in while the cursor is inside divmod.'),
  ex('ex-ptr-heal', 'healing a player through a pointer', 'Passing a struct’s address avoids copying it and lets the function modify the original. <code>p-&gt;hp</code> means “the hp of the struct p points to”.', R`
#include <stdio.h>

typedef struct { char name[16]; int hp, max_hp; } Player;

void heal(Player *p, int amount) {
    p->hp += amount;
    if (p->hp > p->max_hp) p->hp = p->max_hp;
}

int main(void) {
    Player hero = { "Ada", 40, 100 };
    heal(&hero, 30);  printf("%s: %d/%d\n", hero.name, hero.hp, hero.max_hp);
    heal(&hero, 500); printf("%s: %d/%d\n", hero.name, hero.hp, hero.max_hp);
    return 0;
}
`),
  ex('ex-ptr-strlen', 'writing your own strlen with a pointer', 'Pointer subtraction counts elements: the walker minus the start equals the length.', R`
#include <stdio.h>

int my_strlen(const char *s) {
    const char *p = s;
    while (*p != '\0') p++;
    return (int)(p - s);
}

int main(void) {
    printf("%d\n", my_strlen("pointers!"));
    return 0;
}
`)],
  struct: [ex('ex-struct-inv', 'an inventory: an array of structs', 'Arrays and structs together model almost any game data. <code>inv[i].qty</code> reads field qty of the i-th item.', R`
#include <stdio.h>

typedef struct { char name[12]; int qty; float price; } Item;

int main(void) {
    Item inv[3] = { {"Potion", 5, 2.5f}, {"Arrow", 40, 0.1f}, {"Map", 1, 12.0f} };
    float total = 0;

    for (int i = 0; i < 3; i++) {
        printf("%-8s x%-3d %6.2f\n", inv[i].name, inv[i].qty, inv[i].qty * inv[i].price);
        total += inv[i].qty * inv[i].price;
    }
    printf("inventory value: %.2f\n", total);
    return 0;
}
`),
  ex('ex-struct-vec', 'a growable array (like GDScript’s Array.append)', 'This is what <code>append()</code> does for you in GDScript. When full, double the capacity with <code>realloc</code>. Step through and watch the heap blocks.', R`
#include <stdio.h>
#include <stdlib.h>

typedef struct { int *data; int size, capacity; } Vec;

void push(Vec *v, int x) {
    if (v->size == v->capacity) {
        v->capacity = v->capacity ? v->capacity * 2 : 2;
        v->data = realloc(v->data, v->capacity * sizeof(int));
        printf("(grew to %d slots)\n", v->capacity);
    }
    v->data[v->size++] = x;
}

int main(void) {
    Vec v = {0};
    for (int i = 1; i <= 5; i++) push(&v, i * i);
    for (int i = 0; i < v.size; i++) printf("%d ", v.data[i]);
    printf("\n");
    free(v.data);
    return 0;
}
`)],
  win: [ex('ex-win-confirm', 'a confirm dialog', 'The return value of MessageBoxA tells you which button was pressed. (The simulator always “presses” the default button: Yes.)', R`
#include <stdio.h>
#include <windows.h>

int main(void) {
    int answer = MessageBoxA(NULL, "Quit without saving?", "Confirm",
                             MB_YESNO | MB_ICONQUESTION);
    if (answer == IDYES) puts("Bye!");
    else                 puts("Back to the game");
    return 0;
}
`),
  ex('ex-win-tick', 'measuring time with GetTickCount and Sleep', 'Game loops and profilers do exactly this: remember the start tick, do work, subtract.', R`
#include <stdio.h>
#include <windows.h>

int main(void) {
    DWORD start = GetTickCount();
    Sleep(250);
    DWORD elapsed = GetTickCount() - start;
    printf("slept for about %lu ms\n", elapsed);
    return 0;
}
`),
  ex('ex-win-save', 'saving and loading a whole struct as a binary file', 'WriteFile copies the struct’s raw bytes to disk and ReadFile copies them back — a real save-game format in 10 lines.', R`
#include <stdio.h>
#include <windows.h>

typedef struct { int level; int gold; float x, y; } Save;

int main(void) {
    Save s = { 7, 1250, 3.5f, 9.0f }, loaded = {0};
    DWORD n;

    HANDLE h = CreateFileA("game.sav", GENERIC_WRITE, 0, NULL,
                           CREATE_ALWAYS, FILE_ATTRIBUTE_NORMAL, NULL);
    WriteFile(h, &s, sizeof(s), &n, NULL);
    CloseHandle(h);
    printf("saved %lu bytes\n", n);

    h = CreateFileA("game.sav", GENERIC_READ, 0, NULL,
                    OPEN_EXISTING, FILE_ATTRIBUTE_NORMAL, NULL);
    ReadFile(h, &loaded, sizeof(loaded), &n, NULL);
    CloseHandle(h);
    printf("level %d, gold %d, pos (%.1f, %.1f)\n", loaded.level, loaded.gold, loaded.x, loaded.y);
    return 0;
}
`)],
  done: [ex('ex-done-guess', 'a number-guessing game', 'Everything together: rand, an array standing in for the keyboard, a loop, a conditional and printf. Turn the array into <code>scanf</code> for homework.', R`
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    srand(42);
    int secret = rand() % 20 + 1;
    int guesses[] = {10, 5, 3, 1, 2};
    int tries = 0;

    for (int i = 0; i < 5; i++) {
        tries++;
        int g = guesses[i];
        if (g == secret) {
            printf("Guess %d: %d - correct in %d tries!\n", tries, g, tries);
            break;
        }
        printf("Guess %d: %d is too %s\n", tries, g, g < secret ? "low" : "high");
    }
    return 0;
}
`)],
};

/* -------------------------------------------------------------- assemble */
Object.keys(C.DEFS).forEach(id => ins(id, 'start', [defs(id)]));

/* diagrams — placed near the concepts they explain */
ins('how', 'afterLab:l1-first', [W('errorKinds'), EX.how[0]]);
ins('hello', 'afterLab:l2-fix', [W('flowDebug')]);
ins('hello', 'afterWidget:anatomy', [EX.hello[0]]);
ins('hello', 'afterLab:l2-three', [EX.hello[1]]);
ins('types', 'afterWidget:bits', [W('typePicker')]);
ins('types', 'afterLab:l3-overflow', EX.types);
ins('ops', 'beforeWidget:printf', [W('bitToggle'), W('precedence')]);
ins('ops', 'afterWidget:printf', [W('logic')]);
ins('ops', 'afterLab:l4-div', EX.ops);
ins('if', 'afterWidget:flowIf', [W('flowSwitch')]);
ins('if', 'afterLab:l5-bug', EX.if);
ins('loops', 'afterWidget:flowLoop', [W('flowWhile')]);
ins('loops', 'afterLab:l6-fizz', EX.loops);
ins('func', 'beforeWidget:callStack', [W('funcAnatomy')]);
ins('func', 'afterWidget:callStack', [W('passing')]);
ins('func', 'afterLab:l7-swap', EX.func);
ins('arrays', 'afterWidget:array', [W('stringCells'), W('grid2d')]);
ins('arrays', 'afterLab:l8-rev', EX.arrays);
ins('ptr', 'afterWidget:pointer', [W('ptrDiagram')]);
ins('ptr', 'afterLab:l9-walk', EX.ptr);
ins('struct', 'afterWidget:structLayout', [W('memoryMap')]);
ins('struct', 'afterWidget:heap', [W('linkedList')]);
ins('struct', 'afterLab:l10-list', EX.struct);
ins('win', 'afterWidget:apiReader', [W('handles'), W('flowApi')]);
ins('win', 'afterLab:l11-file', EX.win);
ins('done', 'beforeQuiz', EX.done);

/* challenge rounds after each lesson's quick check */
Object.keys(Q).forEach(id => ins(id, 'afterQuiz', [challenge(Q[id])]));

root.COURSE.EXAMPLES = EX; root.COURSE.CHALLENGES = Q;
})(window);
