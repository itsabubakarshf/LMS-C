# C Quest — an interactive 2-hour course: C fundamentals → the Windows API

A self-contained learning-management site for teaching C to someone who already knows a little programming
(GDScript / Python / a bit of x64) and wants to get to **Windows API programming**.

**No install, no server, no internet needed.** Download the repo (or the ZIP) and **double-click `index.html`**.

## What is inside

* **12 lessons / 115 minutes** — how C runs · Hello World · types & memory · operators & printf · decisions · loops · functions ·
  arrays & strings · **pointers** · structs & heap · **first Windows API calls** · wrap-up, homework and roadmap.
* **A built-in C "compiler"** (`js/cinterp.js`) that runs in the browser. It has a real byte-addressable memory, so `sizeof`,
  pointers, overflow, uninitialised variables (`0xCC`), `malloc`/`free` (with leak detection), NULL-pointer crashes and
  compile errors behave like real C on 64-bit Windows (`long` = 4 bytes, pointers = 8 bytes).
* **Step-through debugger** — watch variables, arrays, structs, the call stack, the heap and "→ points to" arrows change line by line.
* **Win32 simulation** — `MessageBoxA` (pops up a Windows-style dialog), `GetLocalTime`, `CreateFileA/WriteFile/ReadFile` (virtual disk),
  `HeapAlloc`, `Sleep`, `GetTickCount`, …
* **Interactive diagrams** — compile pipeline, decision & loop flowcharts, array "lockers", pointer street, struct padding explorer,
  heap hotel, call stack, Win32 signature reader, and an interactive **Windows message loop**.
* Real-life analogies, GDScript-vs-C comparisons, 24 hands-on labs with checkers, quizzes with explanations, progress tracking
  (saved in the browser), dark mode, cheat-sheet and free playground.
* **Tutor mode** — flip the "Tutor notes" switch for minute-by-minute teaching plans, questions to ask and common mistakes.

## Run it

```text
double-click index.html          # that's it
```

Or host the folder anywhere static (GitHub Pages, Vercel, Netlify).

## Edit the course

All content is in **`js/lessons.js`** (plain JavaScript objects: text blocks, labs with `expect` checkers, quizzes).
Widgets are in `js/widgets.js`, the editor/stepper in `js/lab.js`, the C interpreter in `js/cinterp.js`.

## Tests

```bash
node tests/labs.test.js     # compiles every lab's starter + reference solution and runs its checker
node tests/t1.js            # interpreter smoke tests
```

## Limits of the mini-compiler

Supports: int/char/short/long/long long/float/double, pointers, arrays, structs, unions (basic), enums, typedef, `#define`
(incl. function-like macros), `#ifdef`, all control flow, recursion, a good part of stdio/stdlib/string/math/ctype and some Win32.
Not supported: function pointers, `goto`, variadic user functions, a real GUI window. For real projects use Visual Studio
(“Desktop development with C++”) or MinGW-w64 — the setup steps are on the course start page.
