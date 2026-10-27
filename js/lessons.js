/* lessons.js — all course content. Edit this file to change the course. */
(function (root) {
'use strict';
const R = String.raw;
const out = o => o.trim();

const LESSONS = [
/* ======================================================================== 1 */
{
  id: 'how', icon: '⚙️', title: 'How C actually runs', min: 8,
  sub: 'From text file to running program',
  goals: ['Explain what a compiler and a linker do', 'Know why C is fast — and why it is unforgiving', 'Run your very first C program'],
  blocks: [
    { t: 'html', h: `<p class="lead">Almost everything you use — Windows itself, the Godot engine, Python's interpreter — is written in <b>C or C++</b>. Learning C means learning what the machine is really doing underneath GDScript.</p>` },
    { t: 'real', h: `<b>Cookbook analogy.</b> Your C file is a recipe in English. The oven only understands button codes. A <b>compiler</b> is the translator: it translates the whole recipe <i>once</i>, in advance, and hands the chef a finished oven-ready version. GDScript is more like a waiter reading the recipe aloud while cooking — flexible, but slower.` },
    { t: 'cmp', a: ['GDScript', R`extends Node

func _ready():
    print("Hello")`, 'Godot reads this <b>while the game runs</b>, line by line, and checks types as it goes.'],
           b: ['C', R`#include <stdio.h>

int main(void) {
    printf("Hello\n");
    return 0;
}`, 'A compiler translates this <b>before</b> it runs into raw CPU instructions. No interpreter at all at run time.'] },
    { t: 'widget', w: 'pipeline' },
    { t: 'gd', h: `In GDScript a mistake usually shows up as a red error in the editor or a popup while playing. In C the compiler is <b>strict before running</b>, but once it runs it trusts you completely: a wrong array index or a bad pointer won't be caught — the program just crashes or misbehaves. The price of speed is responsibility.` },
    { t: 'lab', id: 'l1-first', title: 'Your first compile', icon: '🚀',
      intro: 'This editor contains a real (mini) C compiler. Everything below runs in your browser — nothing is sent anywhere.',
      task: 'Press <b>Compile &amp; Run</b>. Then change the message and run it again.',
      code: R`
#include <stdio.h>

int main(void) {
    printf("Hello from C!\n");
    return 0;
}
`, expect: o => o.length > 0, solution: null },
    { t: 'quiz', qs: [
      { q: 'Which stage produces the "error: expected ;" style messages?', o: ['The preprocessor', 'The compiler', 'The linker', 'Windows when you double-click the .exe'], a: 1, why: 'The compiler reads and checks your code. The linker produces a different kind of error: "undefined reference" (a function was used but never found).' },
      { q: 'Why is compiled C usually faster than a script?', o: ['It uses more RAM', 'It is already translated to CPU instructions before running', 'It skips the operating system', 'It has fewer features, so it is lighter'], a: 1, why: 'Translation happens once, ahead of time. The CPU runs your instructions directly.' },
      { q: 'A C program mistakenly reads memory it does not own. What happens?', o: ['The compiler stops it', 'GDScript-style error message with a line number', 'Anything — maybe a crash, maybe silent wrong results', 'Windows rewrites it'], a: 2, why: 'This is called undefined behaviour. C does not check at run time. That is why we learn pointers carefully.' },
    ] },
    { t: 'tutor', h: `<b>Minute plan:</b> 2 min story (what is under Godot/Windows) · 4 min walk through the pipeline widget (click each stage) · 2 min first Run.<br><b>Ask:</b> “When you press F5 in Godot, what do you think happens?” Let them guess, then contrast with ahead-of-time compilation.<br><b>Link to their x64 knowledge:</b> stage 3 output <i>is</i> the assembly they have seen.` },
  ],
},
/* ======================================================================== 2 */
{
  id: 'hello', icon: '👋', title: 'Hello, World — anatomy of a program', min: 8,
  sub: 'main, #include, printf, semicolons',
  goals: ['Name every part of a minimal C program', 'Read a compiler error and fix it', 'Print text with printf and puts'],
  blocks: [
    { t: 'html', h: `<p>Every C program starts in a function called <code>main</code>. Hover over each coloured part below.</p>` },
    { t: 'widget', w: 'anatomy' },
    { t: 'cmp', a: ['GDScript', R`print("Score: ", 10)`, 'No semicolon, no braces, no includes. Indentation is the structure.'],
           b: ['C', R`printf("Score: %d\n", 10);`, 'Semicolon after every statement. Braces <code>{ }</code> are the structure. <code>%d</code> is a placeholder filled by the next value.'] },
    { t: 'real', h: `<b>#include is a library card.</b> The compiler starts knowing almost nothing. <code>#include &lt;stdio.h&gt;</code> hands it the “catalogue” that explains what <code>printf</code> is, like checking a book out before you can quote it.` },
    { t: 'lab', id: 'l2-fix', title: 'Fix the broken program', icon: '🔧',
      intro: 'This program has two bugs. The compiler reports them one at a time — read the message, fix, run again.',
      task: 'Make it print exactly <code>Hello, Ada!</code>',
      hint: 'Bug 1: printf lives in a header you must include. Bug 2: statements end with a semicolon. The compiler points to the line <i>after</i> a missing semicolon.',
      code: R`
int main(void)
{
    printf("Hello, Ada!\n")
    return 0;
}
`, solution: R`
#include <stdio.h>

int main(void)
{
    printf("Hello, Ada!\n");
    return 0;
}
`, expect: o => o === 'Hello, Ada!\n' },
    { t: 'lab', id: 'l2-three', title: 'Print three lines', icon: '🖨',
      task: 'Make the program print three lines: your name, your favourite game, and a number.',
      hint: 'Use printf three times, each ending with \\n. Or try puts("text"), which adds the newline for you.',
      code: R`
#include <stdio.h>

int main(void) {
    // write your three printf lines here

    return 0;
}
`, solution: R`
#include <stdio.h>

int main(void) {
    printf("Ayesha\n");
    printf("Hades\n");
    printf("%d\n", 7);
    return 0;
}
`, expect: o => o.trim().split('\n').length >= 3 },
    { t: 'quiz', qs: [
      { q: 'What does return 0; at the end of main mean?', o: ['Print zero', 'The program finished successfully', 'Restart the program', 'Delete all variables'], a: 1, why: 'The value goes back to the operating system as the exit code. 0 = success, non-zero = something went wrong.' },
      { q: 'The compiler says "expected \';\' before return" pointing at line 5. Where is the real mistake?', o: ['Line 5', 'The end of line 4 (the line above)', 'The #include line', 'Nowhere, ignore it'], a: 1, why: 'The compiler only discovers a missing ; when it meets the next statement, so the cause is usually the line above.' },
      { q: 'What does \\n inside a string do?', o: ['Prints a backslash and n', 'Starts a new line', 'Prints the number zero', 'Ends the program'], a: 1, why: '\\n is one invisible “newline” character. Forget it and your next output continues on the same line.' },
    ] },
    { t: 'tutor', h: `<b>Minute plan:</b> 3 min anatomy · 3 min fix-the-bug lab (let them <i>drive</i>) · 2 min free print.<br><b>Habit to build:</b> read the compiler message out loud, then find the line. Normalise errors: “the compiler is your pair-programmer, not your critic.”<br><b>Common mistake:</b> typing <code>Printf</code> or forgetting the quotes. C is case-sensitive.` },
  ],
},
/* ======================================================================== 3 */
{
  id: 'types', icon: '📦', title: 'Variables and types', min: 12,
  sub: 'int, float, char — and how memory really stores them',
  goals: ['Declare variables with the right type', 'Know the size of each type (and why it matters)', 'Understand overflow and uninitialised variables'],
  blocks: [
    { t: 'html', h: `<p>In GDScript <code>var hp = 100</code> works for any value. C needs to know <b>how many bytes</b> to reserve, so every variable gets a type: <code>int hp = 100;</code></p>` },
    { t: 'cmp', a: ['GDScript', R`var hp = 100
var speed: float = 2.5
var grade = "A"`, 'Type is optional and can change.'],
           b: ['C', R`int hp = 100;
float speed = 2.5f;
char grade = 'A';`, 'Type is mandatory and fixed forever. <code>char</code> uses single quotes.'] },
    { t: 'real', h: `<b>Containers.</b> A variable is a labelled container in a warehouse. A <code>char</code> is a matchbox (1 byte), an <code>int</code> a shoebox (4 bytes), a <code>double</code> a crate (8 bytes). You pick the box before you put anything in — and if you cram a number that is too big for the box, it does not “break”: it quietly <b>wraps around</b>.` },
    { t: 'widget', w: 'typeSizes' },
    { t: 'widget', w: 'bits' },
    { t: 'warn', h: `<b>Uninitialised variables hold garbage.</b> <code>int hp;</code> reserves space but does <i>not</i> clear it. Whatever was left there is what you read. (Visual Studio debug builds fill it with <code>0xCC</code> on purpose, so you can spot it.) Always give a variable a value before you read it.` },
    { t: 'lab', id: 'l3-uninit', title: 'Meet the garbage value', icon: '🗑',
      intro: 'Click <b>Step through</b> and watch the variable card for <code>hp</code>.',
      code: R`
#include <stdio.h>

int main(void) {
    int hp;
    printf("before: %d\n", hp);
    hp = 100;
    printf("after:  %d\n", hp);
    return 0;
}
`, solution: null },
    { t: 'lab', id: 'l3-overflow', title: 'Overflow challenge', icon: '💥',
      intro: 'The largest <code>int</code> is 2 147 483 647. Adding 1 breaks it.',
      task: 'Make the program print <code>2147483648</code> correctly.',
      hint: 'Use a bigger type: <code>long long</code>, and print it with <code>%lld</code> instead of <code>%d</code>.',
      code: R`
#include <stdio.h>

int main(void) {
    int big = 2147483647;
    big = big + 1;
    printf("%d\n", big);
    return 0;
}
`, solution: R`
#include <stdio.h>

int main(void) {
    long long big = 2147483647;
    big = big + 1;
    printf("%lld\n", big);
    return 0;
}
`, expect: o => o.trim() === '2147483648' },
    { t: 'quiz', qs: [
      { q: 'How many bytes is an int on Windows?', o: ['1', '2', '4', '8'], a: 2, why: '4 bytes (32 bits), range about ±2.1 billion.' },
      { q: 'What happens when an int is pushed past its maximum?', o: ['The compiler errors', 'The program crashes at once', 'It silently wraps to a negative number', 'It becomes a float'], a: 2, why: 'Two’s-complement wrap-around, with no warning. A classic source of game bugs (score counters, timers).' },
      { q: 'int x; printf("%d", x); prints…', o: ['0', 'Garbage — whatever was in that memory', 'Nothing', 'A compile error'], a: 1, why: 'Locals are not zeroed. Initialise: int x = 0;' },
      { q: 'Which type is a single character?', o: ['string', 'char', 'text', 'byte[]'], a: 1, why: 'char is one byte. It is really a small number: \'A\' is 65.' },
    ] },
    { t: 'tutor', h: `<b>Minute plan:</b> 2 min types intro · 4 min bits widget (type 255 in <i>unsigned char</i>, click +1; type 127 in <i>char</i>) · 3 min uninit lab · 3 min overflow lab.<br><b>Bridge to x64:</b> “the little-endian bytes row is exactly what you see in a debugger's memory view.”<br><b>Windows tip:</b> <code>long</code> is 4 bytes on Windows but 8 on Linux — that is why the Win32 API invents its own names (DWORD…). We meet those in lesson 11.` },
  ],
},
/* ======================================================================== 4 */
{
  id: 'ops', icon: '➗', title: 'Operators and printf', min: 8,
  sub: 'Maths, comparisons, format specifiers',
  goals: ['Use arithmetic, comparison and logical operators', 'Avoid the integer-division trap', 'Format output with printf specifiers'],
  blocks: [
    { t: 'html', h: `<table class="t"><tr><th>Kind</th><th>Operators</th><th>Example</th></tr>
      <tr><td>Arithmetic</td><td><code>+ - * / %</code></td><td><code>7 % 3</code> is <b>1</b> (remainder)</td></tr>
      <tr><td>Compare</td><td><code>== != &lt; &gt; &lt;= &gt;=</code></td><td><code>hp &gt;= 50</code> gives 1 (true) or 0 (false)</td></tr>
      <tr><td>Logic</td><td><code>&amp;&amp; || !</code></td><td><code>alive &amp;&amp; hp &gt; 0</code></td></tr>
      <tr><td>Shortcuts</td><td><code>+= -= *= ++ --</code></td><td><code>score += 10;</code> <code>i++;</code></td></tr></table>
      <p>There is no separate <code>bool</code> in classic C: <b>0 is false, anything else is true</b>.</p>` },
    { t: 'warn', h: `<b>Integer division chops the decimals.</b> <code>7 / 2</code> is <b>3</b>, not 3.5, because both sides are integers. Make at least one side a float: <code>(float)7 / 2</code> or <code>7 / 2.0</code>.` },
    { t: 'real', h: `<b>Pizza.</b> 7 slices shared by 2 people: whole slices each is 3 (integer division), 1 slice is left over (<code>%</code>). Cut the last slice and you get 3.5 (float division).` },
    { t: 'widget', w: 'printf' },
    { t: 'lab', id: 'l4-div', title: 'Fix the average', icon: '🧮',
      task: 'The average of 7 and 2 should print <code>3.50</code>. Right now it prints 3.00. Fix it.',
      hint: 'Cast one operand before dividing: <code>(float)total / count</code>.',
      code: R`
#include <stdio.h>

int main(void) {
    int total = 7;
    int count = 2;
    float avg = total / count;
    printf("Average: %.2f\n", avg);
    return 0;
}
`, solution: R`
#include <stdio.h>

int main(void) {
    int total = 7;
    int count = 2;
    float avg = (float)total / count;
    printf("Average: %.2f\n", avg);
    return 0;
}
`, expect: o => /3\.50/.test(o) },
    { t: 'quiz', qs: [
      { q: 'What is 9 / 2 in C when both are int?', o: ['4.5', '4', '5', 'Compile error'], a: 1, why: 'Integer division drops the fractional part.' },
      { q: 'What is 9 % 4?', o: ['2', '1', '2.25', '5'], a: 1, why: '9 = 2×4 + 1, so the remainder is 1. Handy for “every Nth item” and wrapping around.' },
      { q: 'Which printf specifier prints a float with 1 decimal?', o: ['%d', '%s', '%.1f', '%1c'], a: 2, why: '%f is for floating point; .1 limits to one decimal place.' },
    ] },
    { t: 'tutor', h: `<b>Minute plan:</b> 2 min operators · 2 min integer-division pitfall (ask them to predict 7/2 first) · 3 min printf widget · 1 min lab.<br><b>Good question:</b> “what do you think <code>5 > 3 > 1</code> gives?” (0! because (5>3) is 1, and 1 > 1 is false.)` },
  ],
},
/* ======================================================================== 5 */
{
  id: 'if', icon: '🔀', title: 'Making decisions', min: 10,
  sub: 'if, else, switch and flowcharts',
  goals: ['Write if / else if / else chains', 'Trace code with a flowchart', 'Avoid the = versus == trap'],
  blocks: [
    { t: 'real', h: `<b>Airport security.</b> A passenger walks up: <i>Is the ticket valid? No → turn back. Yes → Is the bag too heavy? Yes → fee. No → board.</i> Every question is a diamond in a flowchart; the answer chooses the road.` },
    { t: 'cmp', a: ['GDScript', R`if hp > 50:
    print("Healthy")
elif hp > 0:
    print("Wounded")
else:
    print("Game over")`, 'Colon + indentation. <code>elif</code>.'],
           b: ['C', R`if (hp > 50) {
    puts("Healthy");
} else if (hp > 0) {
    puts("Wounded");
} else {
    puts("Game over");
}`, 'Condition in <b>parentheses</b>, body in <b>braces</b>. <code>else if</code> is two words.'] },
    { t: 'widget', w: 'flowIf' },
    { t: 'warn', h: `<b>= is assignment, == is comparison.</b> <code>if (lives = 0)</code> does not ask “is lives zero?” — it <i>sets</i> lives to zero. The compiler warns you; never ignore warnings.` },
    { t: 'html', h: `<h3>switch — a menu of exact values</h3><pre class="mono small card">${Lab.highlight(R`switch (key) {
    case 'w': puts("up");    break;
    case 's': puts("down");  break;
    default:  puts("unknown");
}`)}</pre><p>Without <code>break</code>, execution <b>falls through</b> into the next case — a famous C surprise.</p>` },
    { t: 'lab', id: 'l5-grade', title: 'Grade calculator', icon: '🎓', stdin: '85',
      task: 'Print <code>A</code> for 90+, <code>B</code> for 80–89, <code>C</code> for 70–79, otherwise <code>F</code>. With the input 85 it must print B. Then change the keyboard input and test the others.',
      hint: 'Check from the highest threshold down: if (score >= 90) … else if (score >= 80) …',
      code: R`
#include <stdio.h>

int main(void) {
    int score;
    printf("Enter score: ");
    scanf("%d", &score);

    // TODO: print the grade letter

    return 0;
}
`, solution: R`
#include <stdio.h>

int main(void) {
    int score;
    printf("Enter score: ");
    scanf("%d", &score);

    if (score >= 90) puts("A");
    else if (score >= 80) puts("B");
    else if (score >= 70) puts("C");
    else puts("F");

    return 0;
}
`, expect: o => /\bB\b/.test(o.replace('Enter score:', '')) },
    { t: 'lab', id: 'l5-bug', title: 'Bug hunt: the vanishing lives', icon: '🐛',
      task: 'The game should keep <code>lives</code> at 3 and print <code>Lives left: 3</code>. The compiler gives a warning — fix the bug and remove the warning.',
      hint: 'One character is missing in the if condition.',
      code: R`
#include <stdio.h>

int main(void) {
    int lives = 3;
    if (lives = 0) {
        printf("Game over\n");
    } else {
        printf("Still alive\n");
    }
    printf("Lives left: %d\n", lives);
    return 0;
}
`, solution: R`
#include <stdio.h>

int main(void) {
    int lives = 3;
    if (lives == 0) {
        printf("Game over\n");
    } else {
        printf("Still alive\n");
    }
    printf("Lives left: %d\n", lives);
    return 0;
}
`, expect: (o, r) => o.includes('Lives left: 3') && r.warnings.length === 0 },
    { t: 'quiz', qs: [
      { q: 'In C, which value counts as true?', o: ['Only 1', 'Only the word true', 'Any non-zero value', 'Any positive number'], a: 2, why: '0 is false; every other value (including -5) is true.' },
      { q: 'What does a missing break in a switch case do?', o: ['Compile error', 'Execution continues into the next case', 'Program exits', 'Nothing special'], a: 1, why: 'This “fall-through” is sometimes useful, usually a bug.' },
      { q: 'if (x = 5) …', o: ['Compares x with 5', 'Assigns 5 to x, and the condition is true', 'Is invalid syntax', 'Checks if x is greater than 5'], a: 1, why: 'The assignment’s value (5) is non-zero so the branch always runs. Use ==.' },
    ] },
    { t: 'tutor', h: `<b>Minute plan:</b> 1 min analogy · 3 min flowchart widget (slide hp to 0, 30, 70; press Run) · 3 min grade lab (student types) · 3 min bug hunt.<br><b>Ask:</b> “Which flowchart path runs if hp = 50?” (the wounded one: 50 > 50 is false). Boundaries are where bugs live.` },
  ],
},
/* ======================================================================== 6 */
{
  id: 'loops', icon: '🔁', title: 'Loops', min: 10,
  sub: 'for, while, do-while, break and continue',
  goals: ['Choose between for, while and do-while', 'Trace a loop step by step', 'Stop infinite loops'],
  blocks: [
    { t: 'real', h: `<b>Running laps.</b> “Run 5 laps” is a <code>for</code> loop (you know the count). “Run until you feel tired” is a <code>while</code> loop (you check a condition each time). “Do at least one lap, then ask if you want more” is <code>do … while</code>.` },
    { t: 'cmp', a: ['GDScript', R`for i in range(5):
    print(i)

while hp > 0:
    hp -= 10`, '<code>range</code> hides the counter details.'],
           b: ['C', R`for (int i = 0; i < 5; i++) {
    printf("%d\n", i);
}

while (hp > 0) {
    hp -= 10;
}`, 'A for loop has three parts: <b>start; keep-going-while; after-each-lap</b>.'] },
    { t: 'widget', w: 'flowLoop' },
    { t: 'html', h: `<ul><li><code>break;</code> leaves the loop immediately.</li><li><code>continue;</code> skips to the next lap.</li><li>A loop whose condition never becomes false runs <b>forever</b> — your program hangs. (Our mini-compiler stops it after 3 million steps and tells you.)</li></ul>` },
    { t: 'lab', id: 'l6-table', title: 'Times table', icon: '✖️',
      task: 'Print the 3 times table: <code>3 x 1 = 3</code> … <code>3 x 10 = 30</code>, one per line. Use <b>Step through</b> to watch <code>i</code> grow.',
      hint: 'for (int i = 1; i <= 10; i++) { printf("3 x %d = %d\\n", i, 3 * i); }',
      code: R`
#include <stdio.h>

int main(void) {
    // loop from 1 to 10 here

    return 0;
}
`, solution: R`
#include <stdio.h>

int main(void) {
    for (int i = 1; i <= 10; i++) {
        printf("3 x %d = %d\n", i, 3 * i);
    }
    return 0;
}
`, expect: o => o.trim().split('\n').length === 10 && o.includes('3 x 10 = 30') && o.startsWith('3 x 1 = 3') },
    { t: 'lab', id: 'l6-fizz', title: 'FizzBuzz', icon: '🎲',
      task: 'Print the numbers 1 to 15. But for multiples of 3 print <code>Fizz</code>, multiples of 5 print <code>Buzz</code>, and multiples of both print <code>FizzBuzz</code>.',
      hint: 'Test “divisible by both” (i % 15 == 0) first, otherwise Fizz or Buzz will catch it too early.',
      code: R`
#include <stdio.h>

int main(void) {
    for (int i = 1; i <= 15; i++) {
        printf("%d\n", i);
    }
    return 0;
}
`, solution: R`
#include <stdio.h>

int main(void) {
    for (int i = 1; i <= 15; i++) {
        if (i % 15 == 0) puts("FizzBuzz");
        else if (i % 3 == 0) puts("Fizz");
        else if (i % 5 == 0) puts("Buzz");
        else printf("%d\n", i);
    }
    return 0;
}
`, expect: o => o.trim() === '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz' },
    { t: 'quiz', qs: [
      { q: 'for (int i = 0; i < 3; i++) runs the body how many times?', o: ['2', '3', '4', 'Forever'], a: 1, why: 'i = 0, 1, 2. When i becomes 3 the check i < 3 fails.' },
      { q: 'Which loop always runs its body at least once?', o: ['for', 'while', 'do … while', 'none'], a: 2, why: 'do-while checks the condition at the END.' },
      { q: 'while (1) { } with no break…', o: ['Runs once', 'Runs forever', 'Is a compile error', 'Skips'], a: 1, why: '1 is true, so it never stops. Game loops are intentionally written like this, with a break or return inside.' },
    ] },
    { t: 'tutor', h: `<b>Minute plan:</b> 2 min analogy · 3 min flowchart (N = 3, then N = 0 to show a loop that never runs) · 5 min labs.<br><b>Godot link:</b> the engine's main loop is a giant <code>while (running)</code>; <code>_process(delta)</code> is one lap of it. We see this again in the Windows message loop.` },
  ],
},
/* ======================================================================== 7 */
{
  id: 'func', icon: '🧩', title: 'Functions', min: 10,
  sub: 'Parameters, return values, scope, the call stack',
  goals: ['Write and call your own functions', 'Understand that arguments are copied', 'Picture the call stack'],
  blocks: [
    { t: 'real', h: `<b>Vending machine.</b> You put in inputs (coin, button), the machine does something private inside, and you get one output (a snack). Callers don't care <i>how</i>. The machine’s buttons are the parameters; the snack is the return value.` },
    { t: 'cmp', a: ['GDScript', R`func add(a, b):
    return a + b

var total = add(2, 3)`, 'No types, defined anywhere in the file.'],
           b: ['C', R`int add(int a, int b) {
    return a + b;
}

int total = add(2, 3);`, 'Return type first, then name, then typed parameters. Must be declared <b>above</b> its first use.'] },
    { t: 'html', h: `<h3>Prototypes</h3><p>C reads top to bottom. If <code>main</code> comes first, announce the function above it with a <b>prototype</b> (just the signature + <code>;</code>):</p><pre class="mono small card">${Lab.highlight(R`int add(int a, int b);        // prototype

int main(void) { return add(2, 3); }

int add(int a, int b) { return a + b; }`)}</pre>` },
    { t: 'widget', w: 'callStack' },
    { t: 'warn', h: `<b>Arguments are copied.</b> A function receives <i>copies</i> of the values. Changing the parameter inside does not change the caller’s variable. Try the lab, then fix it properly in the pointers lesson.` },
    { t: 'lab', id: 'l7-square', title: 'Write your first function', icon: '🛠',
      task: 'Complete <code>square</code> so that it returns <code>n * n</code>. The program should print <code>7 squared is 49</code>.',
      code: R`
#include <stdio.h>

int square(int n) {
    // TODO: return n times n
    return 0;
}

int main(void) {
    printf("7 squared is %d\n", square(7));
    return 0;
}
`, solution: R`
#include <stdio.h>

int square(int n) {
    return n * n;
}

int main(void) {
    printf("7 squared is %d\n", square(7));
    return 0;
}
`, expect: o => o.includes('7 squared is 49') },
    { t: 'lab', id: 'l7-swap', title: 'The swap that does not swap', icon: '🔄',
      intro: 'Step through this and compare the variables in <code>main</code> with those in <code>swap</code>. Two separate frames — two separate copies of a and b.',
      code: R`
#include <stdio.h>

void swap(int a, int b) {
    int tmp = a;
    a = b;
    b = tmp;
}

int main(void) {
    int x = 1, y = 2;
    swap(x, y);
    printf("x=%d y=%d\n", x, y);
    return 0;
}
`, solution: null },
    { t: 'quiz', qs: [
      { q: 'void in "void hello(void)" the first one means…', o: ['The function returns nothing', 'The function is private', 'The function is empty', 'Takes a void pointer'], a: 0, why: 'Return type void = returns nothing. The second (void) = takes no parameters.' },
      { q: 'Why did swap(x, y) not change x and y?', o: ['Bug in the compiler', 'swap received copies', 'x and y are const', 'printf is wrong'], a: 1, why: 'Pass-by-value. To change the original you need its address — a pointer (next lesson).' },
      { q: 'Where do local variables live?', o: ['On the heap', 'On the stack frame of their function', 'In the .exe file', 'In the CPU only'], a: 1, why: 'Each call pushes a frame; returning pops it and the locals vanish.' },
    ] },
    { t: 'tutor', h: `<b>Minute plan:</b> 2 min vending machine · 3 min call-stack widget (press Next repeatedly, ask them to predict the next frame) · 5 min labs.<br><b>Key moment:</b> the swap lab. Let them be surprised, then say “hold that thought — the next lesson fixes it”.` },
  ],
},
/* ======================================================================== 8 */
{
  id: 'arrays', icon: '🗄', title: 'Arrays and strings', min: 10,
  sub: 'Lockers in a row, and text as numbers ending in \\0',
  goals: ['Create and loop over arrays', 'Understand why indexes start at 0', 'Know that a C string is a char array ending in \\0'],
  blocks: [
    { t: 'real', h: `<b>Lockers in a hallway.</b> They are the same size and numbered from the first one. Locker 0 is at the start; locker 3 is “3 lockers from the start”. That is why indexes start at 0 — an index is a <i>distance</i>, not a count.` },
    { t: 'cmp', a: ['GDScript', R`var scores = [10, 20, 30]
print(scores[5])   # error shown`, 'Arrays grow and are bounds-checked.'],
           b: ['C', R`int scores[3] = {10, 20, 30};
printf("%d", scores[5]);   // no error!`, 'Fixed size. No bounds checks. Reading <code>scores[5]</code> just reads whatever is in memory there.'] },
    { t: 'widget', w: 'array' },
    { t: 'html', h: `<h3>Strings are char arrays</h3><p>C has no string type. <code>"Hi"</code> is three bytes: <code>'H'</code> (72), <code>'i'</code> (105), and a hidden <code>'\\0'</code> (0) that marks the end. Functions like <code>printf("%s")</code> and <code>strlen</code> walk forward until they find that zero.</p>
      <pre class="mono small card">${Lab.highlight(R`char name[] = "Hi";     // 3 bytes: 'H' 'i' '\0'
printf("%zu", strlen(name));   // 2  (the \0 is not counted)
printf("%zu", sizeof(name));   // 3`)}</pre>` },
    { t: 'lab', id: 'l8-mem', title: 'See the string in memory', icon: '🔍',
      intro: 'Step through and look at the card for <code>word</code>: each character is a cell.',
      code: R`
#include <stdio.h>
#include <string.h>

int main(void) {
    char word[8] = "Hey";
    printf("%s has %zu letters\n", word, strlen(word));
    word[1] = 'a';
    printf("%s\n", word);
    return 0;
}
`, solution: null },
    { t: 'lab', id: 'l8-sum', title: 'Sum an array', icon: '➕',
      task: 'Loop over the array and add every element to <code>sum</code>. Expected output: <code>Sum: 150</code>.',
      code: R`
#include <stdio.h>

int main(void) {
    int nums[5] = {10, 20, 30, 40, 50};
    int sum = 0;

    // TODO: loop i from 0 to 4 and add nums[i] to sum

    printf("Sum: %d\n", sum);
    return 0;
}
`, solution: R`
#include <stdio.h>

int main(void) {
    int nums[5] = {10, 20, 30, 40, 50};
    int sum = 0;

    for (int i = 0; i < 5; i++) {
        sum += nums[i];
    }

    printf("Sum: %d\n", sum);
    return 0;
}
`, expect: o => o.includes('Sum: 150') },
    { t: 'lab', id: 'l8-rev', title: 'Reverse a string in place', icon: '🪞',
      task: 'Swap the first and last letters, the second and second-to-last, and so on. “Hello” must become <code>olleH</code>.',
      hint: 'char tmp = s[i]; s[i] = s[len - 1 - i]; s[len - 1 - i] = tmp;',
      code: R`
#include <stdio.h>
#include <string.h>

int main(void) {
    char s[] = "Hello";
    int len = strlen(s);

    for (int i = 0; i < len / 2; i++) {
        // TODO: swap s[i] with s[len - 1 - i]
    }

    printf("%s\n", s);
    return 0;
}
`, solution: R`
#include <stdio.h>
#include <string.h>

int main(void) {
    char s[] = "Hello";
    int len = strlen(s);

    for (int i = 0; i < len / 2; i++) {
        char tmp = s[i];
        s[i] = s[len - 1 - i];
        s[len - 1 - i] = tmp;
    }

    printf("%s\n", s);
    return 0;
}
`, expect: o => o.trim() === 'olleH' },
    { t: 'quiz', qs: [
      { q: 'int a[5]; — which is the LAST valid index?', o: ['5', '4', '6', '0'], a: 1, why: 'Indexes 0..4. a[5] is one past the end.' },
      { q: 'How many bytes does char s[] = "Hello"; occupy?', o: ['5', '6', '4', '8'], a: 1, why: '5 letters + the terminating \\0 = 6.' },
      { q: 'Writing to a[10] in an int a[5] array…', o: ['Throws an exception', 'Is silently allowed and may corrupt other data', 'Resizes the array', 'Is a compile error'], a: 1, why: 'Buffer overflow: the root of countless security bugs.' },
    ] },
    { t: 'tutor', h: `<b>Minute plan:</b> 2 min lockers · 3 min array widget (drag index to 5, 6, 7: “who lives there?”) · 5 min labs.<br><b>Safety:</b> mention buffer overflows briefly — this is what makes C code risky and why Rust exists.` },
  ],
},
/* ======================================================================== 9 */
{
  id: 'ptr', icon: '🏠', title: 'Pointers', min: 14,
  sub: 'Addresses, &, *, and why the Windows API needs them',
  goals: ['Explain a pointer as “a variable that holds an address”', 'Use & and * correctly', 'Pass pointers to functions to change the caller’s data'],
  blocks: [
    { t: 'real', h: `<b>Street addresses.</b> A variable is a house. Its <b>value</b> is who lives inside. Its <b>address</b> is “12 Memory Street”. A <b>pointer</b> is a note that says “go to 12 Memory Street”. Two operators do everything: <code>&amp;house</code> = “what is the address of this?” and <code>*note</code> = “go there and look inside”.` },
    { t: 'gd', h: `In GDScript, objects and arrays are passed “by reference” automatically — you never see an address. C makes the mechanism visible. If you have done x64 assembly: a pointer is just a 64-bit value in a register that you use inside <code>[brackets]</code> — <code>mov eax, [rbx]</code> is <code>*p</code>.` },
    { t: 'html', h: `<pre class="mono card">${Lab.highlight(R`int hp = 100;
int *p = &hp;     // p holds the ADDRESS of hp
*p = 75;          // go to that address, store 75  → hp is now 75
int copy = *p;    // go there and read             → copy is 75`)}</pre>
      <table class="t"><tr><th>Symbol</th><th>Read it as</th></tr><tr><td><code>int *p</code></td><td>“p is a pointer to an int”</td></tr><tr><td><code>&amp;x</code></td><td>“address of x”</td></tr><tr><td><code>*p</code></td><td>“the thing p points at”</td></tr></table>` },
    { t: 'widget', w: 'pointer' },
    { t: 'lab', id: 'l9-first', title: 'Watch a pointer work', icon: '🔭',
      intro: 'Step through. When <code>p</code> is created, its card says “→ points to hp”. After <code>*p = 75</code>, <code>hp</code> changes — but we never wrote to <code>hp</code> directly!',
      code: R`
#include <stdio.h>

int main(void) {
    int hp = 100;
    int *p = &hp;
    *p = 75;
    printf("hp = %d\n", hp);
    printf("p holds the address %p\n", (void*)p);
    return 0;
}
`, solution: null },
    { t: 'lab', id: 'l9-swap', title: 'Fix the swap', icon: '🔄',
      task: 'Make swap work by passing addresses. Expected output: <code>x=2 y=1</code>.',
      hint: 'Receive int *a, int *b; use *a and *b inside; call with swap(&x, &y).',
      code: R`
#include <stdio.h>

void swap(int *a, int *b) {
    // TODO: swap the values that a and b point to
}

int main(void) {
    int x = 1, y = 2;
    swap(&x, &y);
    printf("x=%d y=%d\n", x, y);
    return 0;
}
`, solution: R`
#include <stdio.h>

void swap(int *a, int *b) {
    int tmp = *a;
    *a = *b;
    *b = tmp;
}

int main(void) {
    int x = 1, y = 2;
    swap(&x, &y);
    printf("x=%d y=%d\n", x, y);
    return 0;
}
`, expect: o => o.includes('x=2 y=1') },
    { t: 'lab', id: 'l9-walk', title: 'Walk an array with a pointer', icon: '🚶',
      task: 'Inside the loop, add the value that <code>p</code> points at to <code>total</code>. Expected: <code>Total: 45</code>.',
      hint: 'total += *p;   then p++ moves to the next int.',
      code: R`
#include <stdio.h>

int main(void) {
    int nums[5] = {3, 6, 9, 12, 15};
    int *p = nums;      // an array name is the address of its first element
    int total = 0;

    for (int i = 0; i < 5; i++) {
        // TODO: add *p to total
        p++;
    }

    printf("Total: %d\n", total);
    return 0;
}
`, solution: R`
#include <stdio.h>

int main(void) {
    int nums[5] = {3, 6, 9, 12, 15};
    int *p = nums;
    int total = 0;

    for (int i = 0; i < 5; i++) {
        total += *p;
        p++;
    }

    printf("Total: %d\n", total);
    return 0;
}
`, expect: o => o.includes('Total: 45') },
    { t: 'warn', h: `<b>Danger zone.</b> An uninitialised pointer holds a random address; <code>*p</code> on it crashes or corrupts memory. A pointer set to <code>NULL</code> (address 0) crashes <i>immediately and predictably</i> — which is much better. Try it: change <code>p</code> to <code>NULL</code> in the first lab and run.` },
    { t: 'quiz', qs: [
      { q: 'int x = 5; int *p = &x; What is *p?', o: ['The address of x', '5', 'The address of p', 'A compile error'], a: 1, why: '*p follows the pointer and reads x.' },
      { q: 'For an int* p, what does p++ do to the address?', o: ['Adds 1 byte', 'Adds 4 bytes', 'Adds 8 bytes', 'Adds the value inside'], a: 1, why: 'Pointer arithmetic scales by the size of the pointed-to type.' },
      { q: 'Why does the Windows API take so many pointer parameters (like GetLocalTime(&st))?', o: ['To be slower', 'So the function can fill in YOUR variable (an “out parameter”)', 'Because Windows is written in assembly', 'It doesn’t'], a: 1, why: 'A function can only return one value, but it can write results through the pointers you give it.' },
      { q: 'Dereferencing a NULL pointer…', o: ['Returns 0', 'Is guaranteed to crash (access violation)', 'Allocates memory', 'Is ignored'], a: 1, why: 'Windows reserves the first page of memory so address 0 always faults. Crash early, fix early.' },
    ] },
    { t: 'tutor', h: `<b>The hardest and most important lesson. Slow down.</b><br><b>Minute plan:</b> 3 min analogy and symbols · 4 min pointer widget (<i>they</i> click: p++, *p = 99, switch to char*) · 3 min step-through lab · 4 min swap/walk labs.<br><b>Check understanding:</b> have them explain it back using the street metaphor. If they know assembly, draw <code>lea rax,[hp]</code> for <code>&amp;hp</code> and <code>mov [rax],75</code> for <code>*p = 75</code>.<br><b>Common mistakes:</b> forgetting & in scanf; writing <code>*p</code> in the declaration and thinking it dereferences.` },
  ],
},
/* ======================================================================== 10 */
{
  id: 'struct', icon: '🧱', title: 'Structs and the heap', min: 10,
  sub: 'Custom types, padding, malloc and free',
  goals: ['Group data into a struct', 'Use . and ->', 'Allocate and free memory on the heap'],
  blocks: [
    { t: 'real', h: `<b>Character sheet.</b> A role-playing character is not one number: it has a name, health, level… A <code>struct</code> is that sheet — several named fields stored together as one thing. The <b>heap</b> is a hotel: you call <code>malloc</code> to book a room of any size, and <b>must</b> check out with <code>free</code>, or the room stays booked forever (a memory leak).` },
    { t: 'cmp', a: ['GDScript', R`class Player:
    var name = "Ada"
    var hp = 100

var hero = Player.new()
hero.hp -= 30`, 'Classes with methods; memory freed automatically.'],
           b: ['C', R`typedef struct {
    char name[16];
    int  hp;
} Player;

Player hero = { "Ada", 100 };
hero.hp -= 30;`, 'Plain data only — no methods. <code>.</code> for a struct, <code>-&gt;</code> for a pointer to one.'] },
    { t: 'widget', w: 'structLayout' },
    { t: 'html', h: `<pre class="mono card">${Lab.highlight(R`Player *p = &hero;
p->hp = 50;          // same as (*p).hp = 50;

int *arr = malloc(5 * sizeof(int));   // ask for 20 bytes
if (arr == NULL) { /* out of memory! */ }
arr[0] = 42;
free(arr);           // give it back
arr = NULL;          // never use it again`)}</pre>` },
    { t: 'widget', w: 'heap' },
    { t: 'lab', id: 'l10-struct', title: 'Level up the hero', icon: '⚔️',
      task: 'The hero takes 30 damage and reaches level 2. Expected output: <code>Ada: hp=70 level=2</code>.',
      code: R`
#include <stdio.h>

typedef struct {
    char name[16];
    int  hp;
    int  level;
} Player;

int main(void) {
    Player hero = { "Ada", 100, 1 };

    // TODO: subtract 30 from hp and set level to 2

    printf("%s: hp=%d level=%d\n", hero.name, hero.hp, hero.level);
    return 0;
}
`, solution: R`
#include <stdio.h>

typedef struct {
    char name[16];
    int  hp;
    int  level;
} Player;

int main(void) {
    Player hero = { "Ada", 100, 1 };

    hero.hp -= 30;
    hero.level = 2;

    printf("%s: hp=%d level=%d\n", hero.name, hero.hp, hero.level);
    return 0;
}
`, expect: o => o.includes('Ada: hp=70 level=2') },
    { t: 'lab', id: 'l10-heap', title: 'A dynamic array — without leaking', icon: '🏨',
      task: 'Fill the array with squares (0, 1, 4, 9, 16), print them, then <code>free</code> the memory. The console will report a leak if you forget.',
      hint: 'sq[i] = i * i; and at the end: free(sq);',
      code: R`
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int n = 5;
    int *sq = malloc(n * sizeof(int));
    if (sq == NULL) return 1;

    // TODO: fill sq[i] with i * i

    for (int i = 0; i < n; i++) printf("%d ", sq[i]);
    printf("\n");

    // TODO: give the memory back
    return 0;
}
`, solution: R`
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int n = 5;
    int *sq = malloc(n * sizeof(int));
    if (sq == NULL) return 1;

    for (int i = 0; i < n; i++) sq[i] = i * i;

    for (int i = 0; i < n; i++) printf("%d ", sq[i]);
    printf("\n");

    free(sq);
    return 0;
}
`, expect: (o, r) => o.trim() === '0 1 4 9 16' && r.leaks.length === 0 },
    { t: 'lab', id: 'l10-list', title: 'Stretch: a linked list', icon: '⛓',
      intro: 'Each node holds a value and a pointer to the next node. Step through to watch the chain grow on the heap.',
      code: R`
#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int value;
    struct Node *next;
} Node;

int main(void) {
    Node *head = NULL;
    for (int i = 1; i <= 3; i++) {
        Node *n = malloc(sizeof(Node));
        n->value = i * 10;
        n->next = head;      // new node points at the old first node
        head = n;            // and becomes the first node
    }

    for (Node *c = head; c != NULL; c = c->next)
        printf("%d -> ", c->value);
    printf("NULL\n");

    while (head) {           // free every node
        Node *next = head->next;
        free(head);
        head = next;
    }
    return 0;
}
`, solution: null },
    { t: 'quiz', qs: [
      { q: 'If p is a pointer to a struct, how do you reach its hp field?', o: ['p.hp', 'p->hp', 'p::hp', '&p.hp'], a: 1, why: '-> means “follow the pointer, then take the field”. Equivalent to (*p).hp.' },
      { q: 'You malloc a block and never free it. This is…', o: ['A syntax error', 'A memory leak', 'Fine, Windows frees instantly', 'A dangling pointer'], a: 1, why: 'The memory is released when the process exits, but a long-running game would slowly eat RAM.' },
      { q: 'Why can sizeof(a struct) be bigger than the sum of its fields?', o: ['Compiler bug', 'Padding for alignment', 'Hidden methods', 'Debug information'], a: 1, why: 'The CPU wants ints at multiples of 4, doubles at multiples of 8. Reorder fields big → small to waste less.' },
    ] },
    { t: 'tutor', h: `<b>Minute plan:</b> 2 min struct · 2 min layout widget (click ✨ sort) · 2 min heap widget (make them leak + fragment) · 4 min labs. If time is short, skip the linked list — assign it as homework.<br><b>Bridge:</b> “Next lesson, structs and pointers are the Windows API.”` },
  ],
},
/* ======================================================================== 11 */
{
  id: 'win', icon: '🪟', title: 'Your first Windows API calls', min: 12,
  sub: 'Handles, DWORD, MessageBox, files and the message loop',
  goals: ['Read a Win32 function signature', 'Show a message box, read the time, write a file', 'Understand the message loop behind every Windows app'],
  blocks: [
    { t: 'html', h: `<p class="lead">The <b>Windows API</b> (Win32) is a huge collection of C functions that Windows exposes: open windows, read files, play sound, allocate memory. You already know everything needed to call them — it is just C with pointers and structs, plus <code>#include &lt;windows.h&gt;</code>.</p>` },
    { t: 'real', h: `<b>Hotel reception.</b> You never walk into the kitchen yourself. You ask reception: “One room, please” (<code>CreateFile</code>). Reception gives you a <b>key card with a number</b> — a <i>handle</i> (<code>HANDLE</code>). You show that card to every later request (<code>WriteFile(handle, …)</code>), and finally return it (<code>CloseHandle</code>). You never see Windows' real internal structures; you only hold the ticket.` },
    { t: 'html', h: `<h3>Windows’ own type names</h3><div class="tablewrap"><table class="t"><tr><th>Windows type</th><th>Really is</th><th>Think of it as</th></tr>
      <tr><td><code>DWORD</code></td><td>unsigned long (32-bit)</td><td>a plain positive number / flags</td></tr>
      <tr><td><code>BOOL</code></td><td>int</td><td>TRUE (1) or FALSE (0)</td></tr>
      <tr><td><code>HANDLE</code>, <code>HWND</code></td><td>void*</td><td>a ticket number for something Windows owns</td></tr>
      <tr><td><code>LPCSTR</code></td><td>const char*</td><td>a string you only read</td></tr>
      <tr><td><code>UINT</code></td><td>unsigned int</td><td>flags or a message id</td></tr></table></div>` },
    { t: 'widget', w: 'apiReader' },
    { t: 'lab', id: 'l11-msg', title: 'Your first Win32 call', icon: '💬',
      task: 'Show a message box whose caption is <code>Hello from C</code> and which has the <b>information icon</b> (<code>MB_ICONINFORMATION</code>).',
      hint: 'MessageBoxA(NULL, "It works!", "Hello from C", MB_OK | MB_ICONINFORMATION);',
      code: R`
#include <windows.h>

int main(void) {
    // TODO: call MessageBoxA here

    return 0;
}
`, solution: R`
#include <windows.h>

int main(void) {
    MessageBoxA(NULL, "It works!", "Hello from C", MB_OK | MB_ICONINFORMATION);
    return 0;
}
`, expect: (o, r) => r.events.some(e => e.caption === 'Hello from C' && (e.flags & 0x40)) },
    { t: 'lab', id: 'l11-time', title: 'Fill in a struct with an out-parameter', icon: '🕒',
      task: 'The program prints garbage because <code>st</code> was never filled in. Call <code>GetLocalTime</code> with the <b>address</b> of <code>st</code>.',
      hint: 'GetLocalTime(&st);',
      code: R`
#include <stdio.h>
#include <windows.h>

int main(void) {
    SYSTEMTIME st;

    // TODO: ask Windows to fill in st

    printf("Today is %04d-%02d-%02d\n", st.wYear, st.wMonth, st.wDay);
    return 0;
}
`, solution: R`
#include <stdio.h>
#include <windows.h>

int main(void) {
    SYSTEMTIME st;

    GetLocalTime(&st);

    printf("Today is %04d-%02d-%02d\n", st.wYear, st.wMonth, st.wDay);
    return 0;
}
`, expect: o => /Today is \d{4}-\d{2}-\d{2}/.test(o) },
    { t: 'lab', id: 'l11-file', title: 'Write a file and read it back', icon: '💾',
      intro: 'The mini-compiler gives you a virtual disk; the file appears below the console after running.',
      task: 'The program writes “Hello Win32” into <code>save.txt</code>. Finish the second half: call <code>ReadFile</code> to load it into <code>buf</code>. Expected: <code>Read back 11 bytes: Hello Win32</code>.',
      hint: 'ReadFile(h, buf, sizeof(buf) - 1, &got, NULL);',
      code: R`
#include <stdio.h>
#include <string.h>
#include <windows.h>

int main(void) {
    const char *text = "Hello Win32";
    DWORD written = 0, got = 0;
    char buf[64] = {0};

    HANDLE h = CreateFileA("save.txt", GENERIC_WRITE, 0, NULL,
                           CREATE_ALWAYS, FILE_ATTRIBUTE_NORMAL, NULL);
    if (h == INVALID_HANDLE_VALUE) { printf("could not create file\n"); return 1; }
    WriteFile(h, text, (DWORD)strlen(text), &written, NULL);
    CloseHandle(h);

    h = CreateFileA("save.txt", GENERIC_READ, 0, NULL,
                    OPEN_EXISTING, FILE_ATTRIBUTE_NORMAL, NULL);
    // TODO: ReadFile(h, buf, ..., &got, NULL);
    CloseHandle(h);

    printf("Read back %lu bytes: %s\n", got, buf);
    return 0;
}
`, solution: R`
#include <stdio.h>
#include <string.h>
#include <windows.h>

int main(void) {
    const char *text = "Hello Win32";
    DWORD written = 0, got = 0;
    char buf[64] = {0};

    HANDLE h = CreateFileA("save.txt", GENERIC_WRITE, 0, NULL,
                           CREATE_ALWAYS, FILE_ATTRIBUTE_NORMAL, NULL);
    if (h == INVALID_HANDLE_VALUE) { printf("could not create file\n"); return 1; }
    WriteFile(h, text, (DWORD)strlen(text), &written, NULL);
    CloseHandle(h);

    h = CreateFileA("save.txt", GENERIC_READ, 0, NULL,
                    OPEN_EXISTING, FILE_ATTRIBUTE_NORMAL, NULL);
    ReadFile(h, buf, sizeof(buf) - 1, &got, NULL);
    CloseHandle(h);

    printf("Read back %lu bytes: %s\n", got, buf);
    return 0;
}
`, expect: o => o.includes('Read back 11 bytes: Hello Win32') },
    { t: 'html', h: `<h2>How real Windows programs are built</h2><p>A program with a window never calls <code>printf</code>. Instead it creates a window and then loops forever asking Windows: <i>“anything happen?”</i> Every click, key press or resize arrives as a <b>message</b>. Try it:</p>` },
    { t: 'widget', w: 'msgLoop' },
    { t: 'html', h: `<details class="card"><summary><b>The full skeleton of a window program (you’ll write this in a later session)</b></summary><pre class="mono small" style="overflow:auto">${Lab.highlight(R`#include <windows.h>

LRESULT CALLBACK WndProc(HWND hwnd, UINT msg, WPARAM wp, LPARAM lp) {
    switch (msg) {
        case WM_DESTROY: PostQuitMessage(0); return 0;
    }
    return DefWindowProc(hwnd, msg, wp, lp);
}

int WINAPI WinMain(HINSTANCE hInst, HINSTANCE hPrev, LPSTR cmd, int show) {
    WNDCLASS wc = {0};
    wc.lpfnWndProc   = WndProc;           // "call THIS function for events"
    wc.hInstance     = hInst;
    wc.lpszClassName = "MyWindow";
    RegisterClass(&wc);

    HWND hwnd = CreateWindow("MyWindow", "Hello", WS_OVERLAPPEDWINDOW,
                             100, 100, 640, 480, NULL, NULL, hInst, NULL);
    ShowWindow(hwnd, show);

    MSG msg;
    while (GetMessage(&msg, NULL, 0, 0) > 0) {   // the message loop
        TranslateMessage(&msg);
        DispatchMessage(&msg);                   // → calls WndProc
    }
    return 0;
}`)}</pre><p class="muted small">Notice: a <b>function pointer</b> (<code>WndProc</code>), a <b>struct</b> (<code>WNDCLASS</code>), <b>handles</b> (<code>HWND</code>), and a <b>loop</b> — every concept from today. (Function pointers are a topic for session 2.)</p></details>` },
    { t: 'quiz', qs: [
      { q: 'What is an HWND?', o: ['The window’s pixels', 'A handle: a ticket number Windows gives you for a window', 'A string', 'A Windows error code'], a: 1, why: 'Handles are opaque. You hand them back to API functions; you never open them up.' },
      { q: 'GetLocalTime(&st): why the & ?', o: ['It is decoration', 'Windows needs the ADDRESS so it can fill in your struct', 'It makes it faster', '& means "and"'], a: 1, why: 'Out-parameter: the function writes its result through your pointer.' },
      { q: 'What is the job of the message loop?', o: ['Draw pixels', 'Repeatedly fetch events from the queue and dispatch them to WndProc', 'Allocate memory', 'Compile the code'], a: 1, why: 'GetMessage sleeps until something happens, DispatchMessage calls your WndProc for it.' },
      { q: 'In MB_YESNO | MB_ICONQUESTION, what does | do?', o: ['Logical OR (true/false)', 'Combines flag bits into one number', 'Pipes output', 'Divides'], a: 1, why: 'Each flag is a different bit; bitwise OR switches several on at once.' },
    ] },
    { t: 'tutor', h: `<b>This is the payoff lesson — their main interest. Don’t rush the first lab: the message box popping up is the “wow” moment.</b><br><b>Minute plan:</b> 2 min hotel analogy + types · 2 min API-reader widget · 3 min MessageBox · 2 min GetLocalTime · 3 min message-loop widget (let them click close and watch WM_QUIT).<br><b>Real tools next session:</b> install Visual Studio Community (“Desktop development with C++”) or MinGW-w64; compile the same code with <code>cl</code> / <code>gcc</code>.<br><b>Godot analogy:</b> WndProc ≈ <code>_input</code>, the message loop ≈ the engine's main loop.` },
  ],
},
/* ======================================================================== 12 */
{
  id: 'done', icon: '🏁', title: 'Wrap-up, homework and roadmap', min: 3,
  sub: 'What you learned and what comes next',
  goals: ['Check what you remember', 'Know your homework', 'See the next steps'],
  blocks: [
    { t: 'html', h: `<div class="grid2">
      <div class="card"><h3 style="margin-top:0">✅ You can now…</h3><ul class="goals"><li>explain what a compiler and linker do</li><li>write programs with variables, decisions, loops, functions</li><li>use arrays, strings, structs and malloc/free</li><li>use pointers and see why functions need them</li><li>call real Windows API functions and read their signatures</li></ul></div>
      <div class="card"><h3 style="margin-top:0">📝 Homework (small!)</h3><ol class="goals"><li>Write a number-guessing game (rand + scanf + loop).</li><li>Make a <code>Player</code> struct and a function <code>void heal(Player *p, int amount)</code>.</li><li>Use <code>MessageBoxA</code> with <code>MB_YESNO</code> and print which button was chosen.</li><li>Install Visual Studio Community <i>or</i> MinGW-w64 and compile hello world on your own PC.</li><li>Stretch: reverse an array of ints in place.</li></ol></div></div>
      <h3>🗺 Roadmap: the next four weeks</h3>
      <div class="tablewrap"><table class="t"><tr><th>Week</th><th>Topic</th><th>You will build</th></tr>
      <tr><td>1</td><td>Real toolchain, multi-file programs, header files, const, enums</td><td>A tiny text adventure</td></tr>
      <tr><td>2</td><td>Pointers deeper: function pointers, strings, memory bugs, debugger (breakpoints, watch)</td><td>A bug-hunt session in Visual Studio</td></tr>
      <tr><td>3</td><td>Win32 window: WinMain, WndProc, messages, GDI drawing</td><td>A window that draws and reacts to the mouse</td></tr>
      <tr><td>4</td><td>Files, threads, timers, a mini game loop with GetTickCount</td><td>A Pong clone in pure Win32</td></tr></table></div>` },
    { t: 'html', h: `<h3>Final check</h3>` },
    { t: 'quiz', qs: [
      { q: 'Which line prints 7 / 2 as 3.5?', o: ['printf("%d", 7/2);', 'printf("%f", 7/2);', 'printf("%f", 7/2.0);', 'printf("%s", 7/2);'], a: 2, why: 'One operand must be floating point for non-truncating division, and %f prints it.' },
      { q: 'int a[3] = {1,2,3}; what is a[3]?', o: ['3', '0', 'Out of bounds — undefined behaviour', 'A compile error'], a: 2, why: 'The valid indexes are 0, 1, 2.' },
      { q: 'You want a function to modify the caller’s int. You pass…', o: ['The int', 'The int’s address (int *)', 'The int twice', 'A string'], a: 1, why: 'Pointers let the callee write to the caller’s memory.' },
      { q: 'Every malloc needs a matching…', o: ['printf', 'free', 'return', 'include'], a: 1, why: 'Otherwise: leak.' },
      { q: 'A HANDLE in the Windows API is…', o: ['A pointer you can read directly', 'An opaque ticket number for an OS object', 'A kind of string', 'A function'], a: 1, why: 'Treat it as a black box: pass it back to the API.' },
    ] },
    { t: 'tutor', h: `<b>Close the session:</b> ask “what was the clearest thing and what was the muddiest?” Write both down — start next session from the muddy part. Agree the next time slot (weekdays, any time works for both).<br>Send them the repo/Vercel link so they can replay the lessons and labs.` },
  ],
},
];

/* ------------------------------------------------------------------ cheat sheet */
const CHEAT = `
<h1>📋 Cheat sheet</h1>
<h2>Types (64-bit Windows)</h2>
<div class="tablewrap"><table class="t"><tr><th>Type</th><th>Bytes</th><th>printf</th><th>Notes</th></tr>
<tr><td><code>char</code></td><td>1</td><td>%c / %d</td><td>a letter or a tiny number</td></tr>
<tr><td><code>short</code></td><td>2</td><td>%hd</td><td>−32 768 … 32 767</td></tr>
<tr><td><code>int</code></td><td>4</td><td>%d</td><td>±2.1 billion</td></tr>
<tr><td><code>long</code></td><td>4</td><td>%ld</td><td>same as int on Windows!</td></tr>
<tr><td><code>long long</code></td><td>8</td><td>%lld</td><td>±9.2 × 10¹⁸</td></tr>
<tr><td><code>unsigned int</code></td><td>4</td><td>%u</td><td>0 … 4.29 billion</td></tr>
<tr><td><code>float</code></td><td>4</td><td>%f</td><td>~7 digits</td></tr>
<tr><td><code>double</code></td><td>8</td><td>%f / %lf</td><td>~15 digits</td></tr>
<tr><td><code>size_t</code></td><td>8</td><td>%zu</td><td>result of sizeof / strlen</td></tr>
<tr><td>pointer</td><td>8</td><td>%p</td><td>an address</td></tr></table></div>
<h2>printf placeholders</h2>
<div class="tablewrap"><table class="t"><tr><th>Code</th><th>Meaning</th><th>Example → output</th></tr>
<tr><td><code>%d</code></td><td>int</td><td><code>printf("%d", 42)</code> → 42</td></tr><tr><td><code>%5d</code></td><td>width 5</td><td>→ "   42"</td></tr><tr><td><code>%05d</code></td><td>zero pad</td><td>→ 00042</td></tr>
<tr><td><code>%.2f</code></td><td>2 decimals</td><td>3.14159 → 3.14</td></tr><tr><td><code>%s</code></td><td>string</td><td>"Ada" → Ada</td></tr><tr><td><code>%c</code></td><td>character</td><td>'A' → A</td></tr>
<tr><td><code>%x</code></td><td>hex</td><td>255 → ff</td></tr><tr><td><code>%p</code></td><td>pointer</td><td>→ 0x0010a2f0</td></tr><tr><td><code>%%</code></td><td>a percent sign</td><td></td></tr></table></div>
<h2>Control flow</h2>
<pre class="mono card">${Lab.highlight(R`if (a) { } else if (b) { } else { }
switch (x) { case 1: ...; break; default: ...; }
for (int i = 0; i < n; i++) { }
while (cond) { }
do { } while (cond);
break;  continue;  return value;`)}</pre>
<h2>Pointers, arrays, memory</h2>
<pre class="mono card">${Lab.highlight(R`int *p = &x;        // address of x
*p = 5;            // write through the pointer
a[i]  ==  *(a + i) // same thing
int *m = malloc(n * sizeof(int));  free(m);
p->field  ==  (*p).field`)}</pre>
<h2>Common compiler messages</h2>
<div class="tablewrap"><table class="t"><tr><th>Message</th><th>Usually means</th></tr>
<tr><td>expected ';' before …</td><td>missing semicolon on the line above</td></tr>
<tr><td>'x' undeclared</td><td>typo, or forgot to declare / out of scope</td></tr>
<tr><td>implicit declaration of function</td><td>forgot #include, or function defined below its use</td></tr>
<tr><td>unknown type name</td><td>missing header (stdbool.h, windows.h…)</td></tr>
<tr><td>undefined reference to …</td><td>(linker) declared but never defined</td></tr></table></div>
<h2>Windows API essentials</h2>
<div class="tablewrap"><table class="t"><tr><th>Function</th><th>Purpose</th></tr>
<tr><td><code>MessageBoxA(hwnd, text, caption, flags)</code></td><td>popup dialog</td></tr><tr><td><code>GetLocalTime(&amp;st)</code></td><td>current date/time into a SYSTEMTIME</td></tr>
<tr><td><code>Sleep(ms)</code></td><td>pause</td></tr><tr><td><code>GetTickCount()</code></td><td>milliseconds since boot</td></tr>
<tr><td><code>CreateFileA / ReadFile / WriteFile / CloseHandle</code></td><td>file I/O with handles</td></tr>
<tr><td><code>HeapAlloc / HeapFree</code></td><td>Windows’ own malloc/free</td></tr>
<tr><td><code>GetMessage / DispatchMessage / WndProc</code></td><td>the message loop</td></tr></table></div>`;

const TEMPLATES = {
  'Hello World': R`
#include <stdio.h>

int main(void) {
    printf("Hello, world!\n");
    return 0;
}
`,
  'Pointers': R`
#include <stdio.h>

int main(void) {
    int a = 10, b = 20;
    int *p = &a;
    *p = 99;
    p = &b;
    *p += 1;
    printf("a=%d b=%d\n", a, b);
    return 0;
}
`,
  'Structs and malloc': R`
#include <stdio.h>
#include <stdlib.h>

typedef struct { int x, y; } Point;

int main(void) {
    Point *pts = malloc(3 * sizeof(Point));
    for (int i = 0; i < 3; i++) { pts[i].x = i; pts[i].y = i * i; }
    for (int i = 0; i < 3; i++) printf("(%d,%d) ", pts[i].x, pts[i].y);
    printf("\n");
    free(pts);
    return 0;
}
`,
  'MessageBox': R`
#include <windows.h>

int main(void) {
    int r = MessageBoxA(NULL, "Save your game?", "My Game", MB_YESNO | MB_ICONQUESTION);
    if (r == IDYES) MessageBoxA(NULL, "Saved!", "My Game", MB_OK | MB_ICONINFORMATION);
    return 0;
}
`,
  'Crash on purpose': R`
#include <stdio.h>

int main(void) {
    int *p = NULL;
    printf("about to crash...\n");
    *p = 42;
    return 0;
}
`,
  'Read keyboard input': R`
#include <stdio.h>

int main(void) {
    char name[32];
    int age;
    printf("Name and age? ");
    scanf("%31s %d", name, &age);
    printf("Hi %s, next year you are %d.\n", name, age + 1);
    return 0;
}
`,
};

root.COURSE = { LESSONS, CHEAT, TEMPLATES };
})(window);
