/* tasks.js — graded practice tasks for every lesson (⭐ easy → ⭐⭐⭐ harder), plus gentle-pacing fixes.
 * Rules this file follows: a task only uses things taught EARLIER in the course; no puts/scanf; no comparisons before the
 * "decisions" lesson; every task has an exact expected output, a hint and a solution (solutions show in Tutor mode). */
(function (root) {
'use strict';
const R = String.raw;
const C = root.COURSE;
const L = id => C.LESSONS.find(l => l.id === id);
const norm = s => String(s).split('\n').map(l => l.replace(/\s+$/, '')).join('\n').replace(/\s+$/, '');
const T = (id, level, title, task, out, hint, code, solution, extra) => Object.assign({ id, level, title, task, out, hint, code, solution }, extra || {});

/* ================================================================ NEW TASKS */
const NEW = {};

NEW['how-1'] = T('how-1', 1, 'Run it, then make it yours',
  'Press <b>Compile &amp; Run</b>. Then change the text between the quotes to <b>your own name</b> and run it again.', null,
  'Only change the words inside the quotation marks. Keep the <code>\\n</code> at the end.',
  R`
#include <stdio.h>

int main(void) {
    printf("Hello from C!\n");
    return 0;
}
`, R`
#include <stdio.h>

int main(void) {
    printf("Hello, Ayesha!\n");
    return 0;
}
`, { expect: o => o.trim().length > 0 && o !== 'Hello from C!\n' });

NEW['how-2'] = T('how-2', 1, 'Two lines',
  'The program prints one line. Add a <b>second printf</b> so the output has two lines.',
  'Hello\nC is fun\n',
  'Copy the first printf line, paste it below, and change the text. Each printf ends with <code>\\n</code> to start a new line.',
  R`
#include <stdio.h>

int main(void) {
    printf("Hello\n");
    // TODO: print a second line:  C is fun
    return 0;
}
`, R`
#include <stdio.h>

int main(void) {
    printf("Hello\n");
    printf("C is fun\n");
    return 0;
}
`);

NEW['how-3'] = T('how-3', 1, 'Fix the spelling',
  'This program does not build. Read the red error message, find the spelling mistake and fix it.',
  'Hi!\n',
  'The function that prints is spelled <code>printf</code> (p-r-i-n-t-f). The compiler does not know the word on line 4.',
  R`
#include <stdio.h>

int main(void) {
    pritnf("Hi!\n");
    return 0;
}
`, R`
#include <stdio.h>

int main(void) {
    printf("Hi!\n");
    return 0;
}
`);

NEW['how-4'] = T('how-4', 2, 'The missing semicolon',
  'The compiler complains. Read the message — it points at line 5 — then fix the line <b>above</b> it.',
  'One\nTwo\n',
  'Every statement ends with <code>;</code>. The compiler only notices the problem when it reaches the next line.',
  R`
#include <stdio.h>

int main(void) {
    printf("One\n")
    printf("Two\n");
    return 0;
}
`, R`
#include <stdio.h>

int main(void) {
    printf("One\n");
    printf("Two\n");
    return 0;
}
`);

NEW['how-5'] = T('how-5', 2, 'A title banner',
  'Print a three-line banner: a line of 10 equals signs, the title <code>MY GAME</code>, and another line of 10 equals signs.',
  '==========\nMY GAME\n==========\n',
  'Three printf lines. A line of ten <code>=</code> characters is <code>==========</code>.',
  R`
#include <stdio.h>

int main(void) {
    // TODO: print the three lines
    return 0;
}
`, R`
#include <stdio.h>

int main(void) {
    printf("==========\n");
    printf("MY GAME\n");
    printf("==========\n");
    return 0;
}
`);

NEW['hello-1'] = T('hello-1', 1, 'Complete the program',
  'The program has <code>#include</code> and <code>main</code> but does nothing. Make it print <code>Hello, Ada!</code>',
  'Hello, Ada!\n',
  'Put one <code>printf("...\\n");</code> between the braces, before <code>return 0;</code>.',
  R`
#include <stdio.h>

int main(void) {
    // TODO: print Hello, Ada!
    return 0;
}
`, R`
#include <stdio.h>

int main(void) {
    printf("Hello, Ada!\n");
    return 0;
}
`);

NEW['hello-2'] = T('hello-2', 1, 'Three lines about you',
  'Print three lines: <b>your name</b>, <b>your favourite game</b> and <b>your favourite number</b>. Any text is fine.', null,
  'Use three printf lines, each ending with <code>\\n</code>.',
  R`
#include <stdio.h>

int main(void) {
    // write your three printf lines here

    return 0;
}
`, R`
#include <stdio.h>

int main(void) {
    printf("Ayesha\n");
    printf("Hades\n");
    printf("7\n");
    return 0;
}
`, { expect: o => o.trim().split('\n').filter(x => x.trim()).length >= 3 });

NEW['hello-3'] = T('hello-3', 2, 'Tell the compiler where printf lives',
  'This program is almost right but the build fails. Fix it so it prints <code>Hello, Ada!</code>',
  'Hello, Ada!\n',
  'printf is declared in a header file. Add <code>#include &lt;stdio.h&gt;</code> as the very first line.',
  R`
int main(void) {
    printf("Hello, Ada!\n");
    return 0;
}
`, R`
#include <stdio.h>

int main(void) {
    printf("Hello, Ada!\n");
    return 0;
}
`);

NEW['hello-4'] = T('hello-4', 2, 'A tab and quotation marks',
  'Print exactly two lines. Line 1: <code>Name:</code>, a <b>tab</b>, then <code>Ada</code>. Line 2: <code>He said "Hello"</code> (with the quotation marks).',
  'Name:\tAda\nHe said "Hello"\n',
  'A tab is the escape sequence <code>\\t</code>. To print a quotation mark inside a string write <code>\\"</code>.',
  R`
#include <stdio.h>

int main(void) {
    // TODO line 1: Name:<tab>Ada
    // TODO line 2: He said "Hello"
    return 0;
}
`, R`
#include <stdio.h>

int main(void) {
    printf("Name:\tAda\n");
    printf("He said \"Hello\"\n");
    return 0;
}
`);

NEW['hello-5'] = T('hello-5', 3, 'Draw a box',
  'Print this little box. Count the spaces carefully: there are 6 spaces between the two <code>|</code> characters.',
  '+------+\n|      |\n+------+\n',
  'Three printf lines. The top and bottom are identical.',
  R`
#include <stdio.h>

int main(void) {
    printf("+------+\n");
    // TODO: the middle line
    // TODO: the bottom line
    return 0;
}
`, R`
#include <stdio.h>

int main(void) {
    printf("+------+\n");
    printf("|      |\n");
    printf("+------+\n");
    return 0;
}
`);

NEW['types-1'] = T('types-1', 1, 'An int variable',
  'The variable <code>age</code> has no value yet. Give it the value <b>20</b> on the TODO line.',
  'Age: 20\n',
  'Write <code>age = 20;</code>',
  R`
#include <stdio.h>

int main(void) {
    int age;
    // TODO: give age the value 20
    printf("Age: %d\n", age);
    return 0;
}
`, R`
#include <stdio.h>

int main(void) {
    int age;
    age = 20;
    printf("Age: %d\n", age);
    return 0;
}
`);

NEW['types-2'] = T('types-2', 1, 'A number with decimals',
  'Give the <code>float</code> variable <code>price</code> the value <b>4.5</b>. The printf shows it with 2 decimals.',
  'Price: 4.50\n',
  'Write <code>price = 4.5;</code>',
  R`
#include <stdio.h>

int main(void) {
    float price;
    // TODO: give price the value 4.5
    printf("Price: %.2f\n", price);
    return 0;
}
`, R`
#include <stdio.h>

int main(void) {
    float price;
    price = 4.5;
    printf("Price: %.2f\n", price);
    return 0;
}
`);

NEW['types-3'] = T('types-3', 1, 'One letter',
  'A <code>char</code> holds one letter. Make <code>grade</code> the letter <b>A</b>.',
  'Grade: A\n',
  'A single letter goes in <b>single</b> quotes: <code>grade = \'A\';</code>',
  R`
#include <stdio.h>

int main(void) {
    char grade;
    // TODO: give grade the letter A
    printf("Grade: %c\n", grade);
    return 0;
}
`, R`
#include <stdio.h>

int main(void) {
    char grade;
    grade = 'A';
    printf("Grade: %c\n", grade);
    return 0;
}
`);

NEW['types-4'] = T('types-4', 2, 'Three kinds of variables',
  'The printf at the bottom needs three variables that do not exist yet. Declare <code>level</code> (int) = 7, <code>speed</code> (float) = 2.5 and <code>initial</code> (char) = K, then run.',
  'Level 7, speed 2.5, initial K\n',
  'Declare and fill in one line each: <code>int level = 7;</code> &nbsp; <code>float speed = 2.5;</code> &nbsp; <code>char initial = \'K\';</code>',
  R`
#include <stdio.h>

int main(void) {
    // TODO: declare level, speed and initial here

    printf("Level %d, speed %.1f, initial %c\n", level, speed, initial);
    return 0;
}
`, R`
#include <stdio.h>

int main(void) {
    int level = 7;
    float speed = 2.5;
    char initial = 'K';

    printf("Level %d, speed %.1f, initial %c\n", level, speed, initial);
    return 0;
}
`);

NEW['ops-1'] = T('ops-1', 1, 'Add two numbers',
  'Make <code>sum</code> equal to <code>a</code> plus <code>b</code>.',
  'Sum: 42\n',
  'Replace the <code>0</code> with <code>a + b</code>.',
  R`
#include <stdio.h>

int main(void) {
    int a = 12;
    int b = 30;
    int sum = 0;   // TODO: make sum the total of a and b
    printf("Sum: %d\n", sum);
    return 0;
}
`, R`
#include <stdio.h>

int main(void) {
    int a = 12;
    int b = 30;
    int sum = a + b;
    printf("Sum: %d\n", sum);
    return 0;
}
`);

NEW['ops-2'] = T('ops-2', 1, 'Add, subtract, multiply',
  'The first line is done. Add two more printf lines for the <b>difference</b> (a − b) and the <b>product</b> (a × b).',
  'Sum: 26\nDifference: 14\nProduct: 120\n',
  'Put the calculation straight in printf: <code>printf("Product: %d\\n", a * b);</code>',
  R`
#include <stdio.h>

int main(void) {
    int a = 20;
    int b = 6;
    printf("Sum: %d\n", a + b);
    // TODO: print the difference (a - b)
    // TODO: print the product (a * b)
    return 0;
}
`, R`
#include <stdio.h>

int main(void) {
    int a = 20;
    int b = 6;
    printf("Sum: %d\n", a + b);
    printf("Difference: %d\n", a - b);
    printf("Product: %d\n", a * b);
    return 0;
}
`);

NEW['ops-3'] = T('ops-3', 2, 'Divide and remainder',
  'Replace the two zeros: the <b>whole-number division</b> a / b and the <b>remainder</b> a % b.',
  '17 / 5 = 3 remainder 2\n',
  'Division of two ints drops the decimals. The remainder operator is <code>%</code>.',
  R`
#include <stdio.h>

int main(void) {
    int a = 17;
    int b = 5;
    printf("%d / %d = %d remainder %d\n", a, b, 0, 0);   // TODO: replace the two 0s
    return 0;
}
`, R`
#include <stdio.h>

int main(void) {
    int a = 17;
    int b = 5;
    printf("%d / %d = %d remainder %d\n", a, b, a / b, a % b);
    return 0;
}
`);

NEW['ops-4'] = T('ops-4', 2, 'Shopping total',
  'A game costs 3 coins and you buy 4. (1) Make <code>total</code> price × qty. Print it. (2) Add 5 coins shipping with <code>+=</code>. Print again.',
  'Total: 12\nWith shipping: 17\n',
  '<code>total = price * qty;</code> then <code>total += 5;</code> (that means total = total + 5).',
  R`
#include <stdio.h>

int main(void) {
    int price = 3;
    int qty = 4;
    int total = 0;
    // TODO 1: set total to price * qty
    printf("Total: %d\n", total);
    // TODO 2: add 5 to total using +=
    printf("With shipping: %d\n", total);
    return 0;
}
`, R`
#include <stdio.h>

int main(void) {
    int price = 3;
    int qty = 4;
    int total = 0;
    total = price * qty;
    printf("Total: %d\n", total);
    total += 5;
    printf("With shipping: %d\n", total);
    return 0;
}
`);

/* ops-5 reuses the old l4-div lab (float cast) */

NEW['if-1'] = T('if-1', 1, 'Your first if',
  'If <code>temp</code> is greater than 25, print <code>Hot</code>.',
  'Hot\n',
  'Write: <code>if (temp &gt; 25) { printf("Hot\\n"); }</code>',
  R`
#include <stdio.h>

int main(void) {
    int temp = 30;
    // TODO: if temp is greater than 25, print Hot
    return 0;
}
`, R`
#include <stdio.h>

int main(void) {
    int temp = 30;
    if (temp > 25) {
        printf("Hot\n");
    }
    return 0;
}
`);

NEW['if-2'] = T('if-2', 1, 'if and else',
  'Now temp is 10. Print <code>Hot</code> when temp is above 25, otherwise print <code>Cold</code>.',
  'Cold\n',
  'Add an <code>else { ... }</code> block right after the closing brace of the if.',
  R`
#include <stdio.h>

int main(void) {
    int temp = 10;
    if (temp > 25) {
        printf("Hot\n");
    }
    // TODO: add an else that prints Cold
    return 0;
}
`, R`
#include <stdio.h>

int main(void) {
    int temp = 10;
    if (temp > 25) {
        printf("Hot\n");
    } else {
        printf("Cold\n");
    }
    return 0;
}
`);

NEW['if-3'] = T('if-3', 2, 'Three outcomes',
  'Print <code>A</code> if score is 90 or more, <code>B</code> if 80 or more, otherwise <code>C</code>. With score = 85 it must print B. (Change the score afterwards to test the others!)',
  'B\n',
  'Check the highest limit first: <code>if (score &gt;= 90) … else if (score &gt;= 80) … else …</code>',
  R`
#include <stdio.h>

int main(void) {
    int score = 85;
    // TODO: print A, B or C
    return 0;
}
`, R`
#include <stdio.h>

int main(void) {
    int score = 85;
    if (score >= 90) {
        printf("A\n");
    } else if (score >= 80) {
        printf("B\n");
    } else {
        printf("C\n");
    }
    return 0;
}
`);

/* if-4 reuses the old l5-bug lab (= versus ==) */

NEW['if-5'] = T('if-5', 3, 'Two conditions at once',
  'A visitor may enter if their <code>age</code> is 12 or more <b>and</b> they have a ticket (<code>has_ticket</code> is 1). Print <code>Welcome</code> if both are true, otherwise <code>Sorry</code>.',
  'Welcome\n',
  'Join two conditions with <code>&amp;&amp;</code>: <code>if (age &gt;= 12 &amp;&amp; has_ticket == 1)</code>',
  R`
#include <stdio.h>

int main(void) {
    int age = 15;
    int has_ticket = 1;
    // TODO: print Welcome only if age >= 12 AND has_ticket is 1, else Sorry
    return 0;
}
`, R`
#include <stdio.h>

int main(void) {
    int age = 15;
    int has_ticket = 1;
    if (age >= 12 && has_ticket == 1) {
        printf("Welcome\n");
    } else {
        printf("Sorry\n");
    }
    return 0;
}
`);

NEW['loop-1'] = T('loop-1', 1, 'Print 1 to 5',
  'Inside the loop, print the value of <code>i</code> followed by a space.',
  '1 2 3 4 5\n',
  'Inside the braces: <code>printf("%d ", i);</code>',
  R`
#include <stdio.h>

int main(void) {
    for (int i = 1; i <= 5; i++) {
        // TODO: print i followed by a space
    }
    printf("\n");
    return 0;
}
`, R`
#include <stdio.h>

int main(void) {
    for (int i = 1; i <= 5; i++) {
        printf("%d ", i);
    }
    printf("\n");
    return 0;
}
`);

NEW['loop-2'] = T('loop-2', 1, 'Countdown',
  'Use a <code>while</code> loop: while <code>n</code> is bigger than 0, print n and a space, then make n one smaller.',
  '5 4 3 2 1 Liftoff!\n',
  'Inside the loop: <code>printf("%d ", n);</code> and then <code>n = n - 1;</code> (or <code>n--;</code>).',
  R`
#include <stdio.h>

int main(void) {
    int n = 5;
    // TODO: while n is bigger than 0, print n and a space, then subtract 1
    printf("Liftoff!\n");
    return 0;
}
`, R`
#include <stdio.h>

int main(void) {
    int n = 5;
    while (n > 0) {
        printf("%d ", n);
        n = n - 1;
    }
    printf("Liftoff!\n");
    return 0;
}
`);

NEW['loop-4'] = T('loop-4', 2, 'Add up 1 to 10',
  'Add every number from 1 to 10 into <code>sum</code>. Print the result at the end.',
  'Sum: 55\n',
  'Inside the loop: <code>sum = sum + i;</code> (or <code>sum += i;</code>). Print after the loop.',
  R`
#include <stdio.h>

int main(void) {
    int sum = 0;
    for (int i = 1; i <= 10; i++) {
        // TODO: add i to sum
    }
    printf("Sum: %d\n", sum);
    return 0;
}
`, R`
#include <stdio.h>

int main(void) {
    int sum = 0;
    for (int i = 1; i <= 10; i++) {
        sum += i;
    }
    printf("Sum: %d\n", sum);
    return 0;
}
`);

NEW['loop-5'] = T('loop-5', 3, 'Only the even numbers',
  'Go through 1 to 10 but print <b>only the even numbers</b>.',
  '2 4 6 8 10\n',
  'A number is even when the remainder after dividing by 2 is 0: <code>if (i % 2 == 0) { … }</code>',
  R`
#include <stdio.h>

int main(void) {
    for (int i = 1; i <= 10; i++) {
        // TODO: print i only when it is even
    }
    printf("\n");
    return 0;
}
`, R`
#include <stdio.h>

int main(void) {
    for (int i = 1; i <= 10; i++) {
        if (i % 2 == 0) {
            printf("%d ", i);
        }
    }
    printf("\n");
    return 0;
}
`);

NEW['func-1'] = T('func-1', 1, 'Call a function',
  'The function <code>hello</code> already exists. Call it <b>three times</b> from main.',
  'Hello!\nHello!\nHello!\n',
  'A call looks like <code>hello();</code> — write it three times.',
  R`
#include <stdio.h>

void hello(void) {
    printf("Hello!\n");
}

int main(void) {
    // TODO: call hello three times
    return 0;
}
`, R`
#include <stdio.h>

void hello(void) {
    printf("Hello!\n");
}

int main(void) {
    hello();
    hello();
    hello();
    return 0;
}
`);

NEW['func-2'] = T('func-2', 1, 'Write your first function',
  'main calls <code>welcome()</code> but it does not exist. Write the function <b>above main</b> so it prints <code>Welcome!</code>',
  'Welcome!\n',
  'Copy the shape of <code>void hello(void) { … }</code> from the previous task and change the name and the text.',
  R`
#include <stdio.h>

// TODO: write void welcome(void) here, it prints Welcome!

int main(void) {
    welcome();
    return 0;
}
`, R`
#include <stdio.h>

void welcome(void) {
    printf("Welcome!\n");
}

int main(void) {
    welcome();
    return 0;
}
`);

NEW['func-3'] = T('func-3', 2, 'A function with a parameter',
  'Write <code>print_double</code> so it prints twice the number it receives. main calls it with 21.',
  'Double: 42\n',
  'The parameter is a variable: <code>void print_double(int n) { printf("Double: %d\\n", n * 2); }</code>',
  R`
#include <stdio.h>

void print_double(int n) {
    // TODO: print "Double: " followed by n times 2
}

int main(void) {
    print_double(21);
    return 0;
}
`, R`
#include <stdio.h>

void print_double(int n) {
    printf("Double: %d\n", n * 2);
}

int main(void) {
    print_double(21);
    return 0;
}
`);

/* func-4 reuses the old l7-square lab (return a value) */

NEW['func-5'] = T('func-5', 3, 'Which is bigger?',
  'Write <code>bigger</code>: it receives two numbers and <b>returns</b> the larger one. main prints the answer for 4 and 9.',
  'bigger=9\n',
  'Use an if/else with return: <code>if (a &gt; b) { return a; } else { return b; }</code>',
  R`
#include <stdio.h>

int bigger(int a, int b) {
    // TODO: return the larger of a and b
    return 0;
}

int main(void) {
    printf("bigger=%d\n", bigger(4, 9));
    return 0;
}
`, R`
#include <stdio.h>

int bigger(int a, int b) {
    if (a > b) {
        return a;
    } else {
        return b;
    }
}

int main(void) {
    printf("bigger=%d\n", bigger(4, 9));
    return 0;
}
`);

NEW['arr-1'] = T('arr-1', 1, 'Read and change one element',
  'Print the <b>middle</b> element <code>a[1]</code>. Then set the <b>first</b> element to 99 and print it.',
  '20\n99\n',
  'Index numbers start at 0. <code>a[0] = 99;</code> changes the first element.',
  R`
#include <stdio.h>

int main(void) {
    int a[3] = {10, 20, 30};
    // TODO 1: print a[1]
    // TODO 2: set a[0] to 99 and print it
    return 0;
}
`, R`
#include <stdio.h>

int main(void) {
    int a[3] = {10, 20, 30};
    printf("%d\n", a[1]);
    a[0] = 99;
    printf("%d\n", a[0]);
    return 0;
}
`);

NEW['arr-2'] = T('arr-2', 1, 'Loop over an array',
  'Use a for loop to print every element of the array on one line.',
  '5 10 15 20\n',
  'The loop counter is the index: <code>printf("%d ", a[i]);</code>',
  R`
#include <stdio.h>

int main(void) {
    int a[4] = {5, 10, 15, 20};
    for (int i = 0; i < 4; i++) {
        // TODO: print a[i] followed by a space
    }
    printf("\n");
    return 0;
}
`, R`
#include <stdio.h>

int main(void) {
    int a[4] = {5, 10, 15, 20};
    for (int i = 0; i < 4; i++) {
        printf("%d ", a[i]);
    }
    printf("\n");
    return 0;
}
`);

/* arr-3 reuses the old l8-sum lab */

NEW['arr-4'] = T('arr-4', 2, 'How long is the word?',
  'A string is an array of letters. Use <code>strlen</code> to print how many letters the word has.',
  'Letters: 5\n',
  'Pass the string to strlen and print with <code>%zu</code>: <code>printf("Letters: %zu\\n", strlen(word));</code>',
  R`
#include <stdio.h>
#include <string.h>

int main(void) {
    char word[] = "Hello";
    // TODO: print Letters: followed by the length of word
    return 0;
}
`, R`
#include <stdio.h>
#include <string.h>

int main(void) {
    char word[] = "Hello";
    printf("Letters: %zu\n", strlen(word));
    return 0;
}
`);

NEW['arr-5'] = T('arr-5', 3, 'Find the biggest',
  'Find the biggest number in the array and print it. Start with <code>max</code> = the first element, then check the others.',
  'max=9\n',
  'In the loop: <code>if (a[i] &gt; max) { max = a[i]; }</code>',
  R`
#include <stdio.h>

int main(void) {
    int a[4] = {3, 9, 4, 7};
    int max = a[0];
    for (int i = 1; i < 4; i++) {
        // TODO: if a[i] is bigger than max, remember it
    }
    printf("max=%d\n", max);
    return 0;
}
`, R`
#include <stdio.h>

int main(void) {
    int a[4] = {3, 9, 4, 7};
    int max = a[0];
    for (int i = 1; i < 4; i++) {
        if (a[i] > max) {
            max = a[i];
        }
    }
    printf("max=%d\n", max);
    return 0;
}
`);

NEW['hd-4'] = T('hd-4', 1, 'A constant with #define',
  'Add a line at the top that defines a constant named <code>PRICE</code> with the value 5. The program then prints the price of 3 items.',
  'Total: 15\n',
  '<code>#define PRICE 5</code> — no equals sign, no semicolon.',
  R`
#include <stdio.h>

// TODO: define PRICE as 5

int main(void) {
    printf("Total: %d\n", PRICE * 3);
    return 0;
}
`, R`
#include <stdio.h>

#define PRICE 5

int main(void) {
    printf("Total: %d\n", PRICE * 3);
    return 0;
}
`, { expect: (o, r, src) => o === 'Total: 15\n' && /#define\s+PRICE\s+5/.test(src) });

NEW['ad-2'] = T('ad-2', 1, 'Two addresses',
  'Print the address of <code>x</code> on line 1 and the address of <code>y</code> on line 2 with <code>%p</code>. They must be different.', null,
  '<code>printf("%p\\n", (void*)&amp;x);</code> and the same for y.',
  R`
#include <stdio.h>

int main(void) {
    int x = 1;
    int y = 2;
    // TODO: print the address of x, then the address of y
    return 0;
}
`, R`
#include <stdio.h>

int main(void) {
    int x = 1;
    int y = 2;
    printf("%p\n", (void*)&x);
    printf("%p\n", (void*)&y);
    return 0;
}
`, { expect: o => { const l = o.trim().split('\n'); return l.length === 2 && /^0x[0-9a-f]+$/.test(l[0]) && /^0x[0-9a-f]+$/.test(l[1]) && l[0] !== l[1]; } });

NEW['ad-3'] = T('ad-3', 2, 'How many bytes?',
  'An array of 5 ints sits in memory. Print how many <b>bytes</b> the whole array takes with <code>sizeof</code>.',
  '20\n',
  '<code>printf("%zu\\n", sizeof(arr));</code> — 5 ints × 4 bytes.',
  R`
#include <stdio.h>

int main(void) {
    int arr[5];
    // TODO: print sizeof(arr)
    return 0;
}
`, R`
#include <stdio.h>

int main(void) {
    int arr[5];
    printf("%zu\n", sizeof(arr));
    return 0;
}
`);

NEW['p-1'] = T('p-1', 1, 'Change x through a pointer',
  '<code>p</code> points at <code>x</code>. Use <code>*p</code> to set x to 50 — without writing <code>x = 50</code>.',
  'x=50\n',
  '<code>*p = 50;</code> means: go to the address in p and store 50 there.',
  R`
#include <stdio.h>

int main(void) {
    int x = 5;
    int *p = &x;
    // TODO: change x to 50 using *p
    printf("x=%d\n", x);
    return 0;
}
`, R`
#include <stdio.h>

int main(void) {
    int x = 5;
    int *p = &x;
    *p = 50;
    printf("x=%d\n", x);
    return 0;
}
`);

NEW['p-2'] = T('p-2', 1, 'Point at an array element',
  'Make <code>p</code> point at the <b>middle</b> element of the array, then print what p points at.',
  '20\n',
  'The middle element is <code>a[1]</code>, so its address is <code>&amp;a[1]</code>. Print <code>*p</code>.',
  R`
#include <stdio.h>

int main(void) {
    int a[3] = {10, 20, 30};
    int *p = &a[0];
    // TODO: make p point at a[1]
    printf("%d\n", *p);
    return 0;
}
`, R`
#include <stdio.h>

int main(void) {
    int a[3] = {10, 20, 30};
    int *p = &a[1];
    printf("%d\n", *p);
    return 0;
}
`);

NEW['p-3'] = T('p-3', 2, 'Walk with p + 1',
  'p points at the first element. Print the three values using <code>*p</code>, <code>*(p + 1)</code> and <code>*(p + 2)</code>.',
  '10 20 30\n',
  '<code>p + 1</code> is the address of the next int. <code>*(p + 1)</code> is the value there.',
  R`
#include <stdio.h>

int main(void) {
    int a[3] = {10, 20, 30};
    int *p = a;
    // TODO: print *p, *(p + 1) and *(p + 2) on one line
    printf("\n");
    return 0;
}
`, R`
#include <stdio.h>

int main(void) {
    int a[3] = {10, 20, 30};
    int *p = a;
    printf("%d %d %d", *p, *(p + 1), *(p + 2));
    printf("\n");
    return 0;
}
`);

NEW['s-0'] = T('s-0', 1, 'Your first struct',
  'The struct <code>Player</code> has two fields. Give <code>hero</code> hp 100 and level 1, then print them.',
  'hp=100 level=1\n',
  'Fields are set with a dot: <code>hero.hp = 100;</code> and <code>hero.level = 1;</code>',
  R`
#include <stdio.h>

typedef struct { int hp; int level; } Player;

int main(void) {
    Player hero;
    // TODO: set hero.hp to 100 and hero.level to 1
    printf("hp=%d level=%d\n", hero.hp, hero.level);
    return 0;
}
`, R`
#include <stdio.h>

typedef struct { int hp; int level; } Player;

int main(void) {
    Player hero;
    hero.hp = 100;
    hero.level = 1;
    printf("hp=%d level=%d\n", hero.hp, hero.level);
    return 0;
}
`);

NEW['m-1'] = T('m-1', 1, 'malloc one int',
  'Reserve room for one int on the heap, store 7 in it, print it, and <b>give the memory back</b> with free.',
  '7\n',
  '<code>*p = 7;</code> stores through the pointer. The last step before return is <code>free(p);</code>',
  R`
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int *p = malloc(sizeof(int));
    // TODO 1: store 7 in the memory p points at
    printf("%d\n", *p);
    // TODO 2: free the memory
    return 0;
}
`, R`
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int *p = malloc(sizeof(int));
    *p = 7;
    printf("%d\n", *p);
    free(p);
    return 0;
}
`, { expect: (o, r) => o === '7\n' && r.leaks.length === 0 });

NEW['m-3'] = T('m-3', 2, 'Plug the leak',
  'The program works but it leaks memory (the console warns you after running). Fix it with <b>one extra line</b>.',
  'Total: 15\n',
  'Every <code>malloc</code> needs a <code>free</code>. Add <code>free(nums);</code> before <code>return 0;</code>',
  R`
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int *nums = malloc(3 * sizeof(int));
    nums[0] = 4;
    nums[1] = 5;
    nums[2] = 6;
    printf("Total: %d\n", nums[0] + nums[1] + nums[2]);
    return 0;
}
`, R`
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int *nums = malloc(3 * sizeof(int));
    nums[0] = 4;
    nums[1] = 5;
    nums[2] = 6;
    printf("Total: %d\n", nums[0] + nums[1] + nums[2]);
    free(nums);
    return 0;
}
`, { expect: (o, r) => o === 'Total: 15\n' && r.leaks.length === 0 });

NEW['w-2'] = T('w-2', 2, 'Yes or No?',
  'Show a Yes/No message box (<code>MB_YESNO</code>). The simulator answers Yes. If the answer is <code>IDYES</code> print <code>You chose Yes</code>.',
  'You chose Yes\n',
  '<code>int r = MessageBoxA(NULL, "Save?", "Game", MB_YESNO);</code> then <code>if (r == IDYES) { … }</code>',
  R`
#include <stdio.h>
#include <windows.h>

int main(void) {
    // TODO: show a Yes/No box and store the answer in r
    int r = 0;
    if (r == IDYES) {
        printf("You chose Yes\n");
    }
    return 0;
}
`, R`
#include <stdio.h>
#include <windows.h>

int main(void) {
    int r = MessageBoxA(NULL, "Save your game?", "Game", MB_YESNO);
    if (r == IDYES) {
        printf("You chose Yes\n");
    }
    return 0;
}
`);

NEW['r-1'] = T('r-1', 2, 'Price list total',
  'Four prices are stored in an array. Loop over it, add them up and print the total.',
  'Total: 50\n',
  'Same pattern as before: <code>total += prices[i];</code> inside a for loop that goes from 0 to 3.',
  R`
#include <stdio.h>

int main(void) {
    int prices[4] = {5, 10, 15, 20};
    int total = 0;
    // TODO: loop over prices and add each one to total
    printf("Total: %d\n", total);
    return 0;
}
`, R`
#include <stdio.h>

int main(void) {
    int prices[4] = {5, 10, 15, 20};
    int total = 0;
    for (int i = 0; i < 4; i++) {
        total += prices[i];
    }
    printf("Total: %d\n", total);
    return 0;
}
`);

NEW['r-2'] = T('r-2', 2, 'Count the even numbers',
  'Count how many numbers in the array are even and print the count.',
  'Evens: 3\n',
  'Inside the loop, <code>if (a[i] % 2 == 0) { count++; }</code>',
  R`
#include <stdio.h>

int main(void) {
    int a[6] = {1, 2, 3, 4, 5, 6};
    int count = 0;
    // TODO: loop over a and count the even numbers
    printf("Evens: %d\n", count);
    return 0;
}
`, R`
#include <stdio.h>

int main(void) {
    int a[6] = {1, 2, 3, 4, 5, 6};
    int count = 0;
    for (int i = 0; i < 6; i++) {
        if (a[i] % 2 == 0) {
            count++;
        }
    }
    printf("Evens: %d\n", count);
    return 0;
}
`);

NEW['r-3'] = T('r-3', 3, 'Heal a player (everything together)',
  'Finish <code>heal</code>: add the amount to the player’s hp (use the arrow <code>-&gt;</code>), but never let hp go above 100.',
  'hp=100\n',
  '<code>p-&gt;hp += amount;</code> then <code>if (p-&gt;hp &gt; 100) { p-&gt;hp = 100; }</code>',
  R`
#include <stdio.h>

typedef struct { int hp; } Player;

void heal(Player *p, int amount) {
    // TODO: add amount to p's hp, but cap it at 100
}

int main(void) {
    Player hero = { 80 };
    heal(&hero, 50);
    printf("hp=%d\n", hero.hp);
    return 0;
}
`, R`
#include <stdio.h>

typedef struct { int hp; } Player;

void heal(Player *p, int amount) {
    p->hp += amount;
    if (p->hp > 100) {
        p->hp = 100;
    }
}

int main(void) {
    Player hero = { 80 };
    heal(&hero, 50);
    printf("hp=%d\n", hero.hp);
    return 0;
}
`);


/* ================================================================ "WRITE THE WHOLE PROGRAM" TASKS
 * From task 3 of every lesson the student starts from an (almost) empty file and a problem statement. */
const BLANK = '\n// Write the whole program here.\n';
const BLANK_HINT = '\n// Write the whole program here.\n// Remember the parts:  #include <stdio.h>   and   int main(void) { ... return 0; }\n';
const SKEL = '\n#include <stdio.h>\n\nint main(void) {\n    // write your printf lines here\n    return 0;\n}\n';
const W = (id, level, title, task, out, hint, solution, extra) => T(id, level, title, task, out, hint, BLANK, solution, Object.assign({ mode: 'write' }, extra || {}));

/* ---- lesson 1 (skeleton given: he has not met main yet) ---- */
NEW['how-5'] = T('how-5', 2, 'A title banner',
  '<b>Problem:</b> a game needs a title banner. The skeleton below already has <code>main</code>. Write the printf lines so the program prints a line of 10 equals signs, the title <code>MY GAME</code>, and another line of 10 equals signs.',
  '==========\nMY GAME\n==========\n',
  'Plan: three printf lines, each ending with <code>\\n</code>. A line of ten <code>=</code> is <code>==========</code>.',
  SKEL, R`
#include <stdio.h>

int main(void) {
    printf("==========\n");
    printf("MY GAME\n");
    printf("==========\n");
    return 0;
}
`, { mode: 'write' });
NEW['how-6'] = T('how-6', 3, 'The main menu',
  '<b>Problem:</b> print the main menu of a game: a title line, then three numbered options, exactly as in the expected output. Use only printf.',
  '=== MAIN MENU ===\n1. Play\n2. Options\n3. Quit\n',
  'Plan: four printf lines. Do not forget the <code>\\n</code> at the end of each one.',
  SKEL, R`
#include <stdio.h>

int main(void) {
    printf("=== MAIN MENU ===\n");
    printf("1. Play\n");
    printf("2. Options\n");
    printf("3. Quit\n");
    return 0;
}
`, { mode: 'write' });

/* ---- hello ---- */
NEW['hw-card'] = W('hw-card', 2, 'A business card',
  '<b>Problem:</b> print this business card. The text on each line must match exactly (count the spaces).',
  '+------------------+\n| Ada Lovelace     |\n| Programmer       |\n+------------------+\n',
  'Plan: 1) the include and main, 2) four printf lines. Each text line has a <code>|</code> at both ends; pad with spaces so the right <code>|</code> lines up.',
  R`
#include <stdio.h>

int main(void) {
    printf("+------------------+\n");
    printf("| Ada Lovelace     |\n");
    printf("| Programmer       |\n");
    printf("+------------------+\n");
    return 0;
}
`, { code: BLANK_HINT });
NEW['hw-quote'] = W('hw-quote', 2, 'A line of dialogue',
  '<b>Problem:</b> print a character’s name and what they say. Line 1: <code>Player:</code>, a <b>tab</b>, then <code>Ada</code>. Line 2: <code>Says: "Let\'s play!"</code> — the quotation marks are part of the output.',
  'Player:\tAda\nSays: "Let\'s play!"\n',
  'Plan: two printf lines. A tab is <code>\\t</code>; a quotation mark inside a string is <code>\\"</code>.',
  R`
#include <stdio.h>

int main(void) {
    printf("Player:\tAda\n");
    printf("Says: \"Let's play!\"\n");
    return 0;
}
`, { code: BLANK_HINT });
NEW['hw-house'] = W('hw-house', 3, 'Draw a house',
  '<b>Problem:</b> print this little house made of characters. Watch out: a backslash is a special character in C strings.',
  '  /\\\n /  \\\n/____\\\n|    |\n|____|\n',
  'To print one backslash you must write <code>\\\\</code> inside the string. Plan: five printf lines.',
  R`
#include <stdio.h>

int main(void) {
    printf("  /\\\n");
    printf(" /  \\\n");
    printf("/____\\\n");
    printf("|    |\n");
    printf("|____|\n");
    return 0;
}
`, { code: BLANK_HINT });

/* ---- types ---- */
NEW['tw-card'] = W('tw-card', 2, 'Player card',
  '<b>Problem:</b> store a player’s data in variables, then print it. Use: an <code>int</code> level = 12, a <code>float</code> health = 87.5 and a <code>char</code> rank = \'B\'. Print one line for each, as shown (health with 1 decimal).',
  'Level: 12\nHealth: 87.5\nRank: B\n',
  'Plan: 1) declare the three variables with their values, 2) three printf lines using <code>%d</code>, <code>%.1f</code> and <code>%c</code>.',
  R`
#include <stdio.h>

int main(void) {
    int level = 12;
    float health = 87.5;
    char rank = 'B';
    printf("Level: %d\n", level);
    printf("Health: %.1f\n", health);
    printf("Rank: %c\n", rank);
    return 0;
}
`, { code: BLANK_HINT });
NEW['tw-receipt'] = W('tw-receipt', 2, 'A tiny receipt',
  '<b>Problem:</b> a shop sells items. Use an <code>int</code> items = 3, a <code>float</code> price = 2.25 and a <code>char</code> currency = \'$\'. Print the three lines shown (price with 2 decimals).',
  'Items: 3\nPrice each: 2.25\nCurrency: $\n',
  'Same recipe as the player card: declare, then print with the matching format letters. A char is printed with <code>%c</code>.',
  R`
#include <stdio.h>

int main(void) {
    int items = 3;
    float price = 2.25;
    char currency = '$';
    printf("Items: %d\n", items);
    printf("Price each: %.2f\n", price);
    printf("Currency: %c\n", currency);
    return 0;
}
`, { code: BLANK_HINT });
NEW['tw-sizes'] = W('tw-sizes', 3, 'How big is each type?',
  '<b>Problem:</b> print how many bytes each type uses, using <code>sizeof</code>. Print four lines for <code>int</code>, <code>float</code>, <code>char</code> and <code>double</code>, in that order.',
  'int: 4\nfloat: 4\nchar: 1\ndouble: 8\n',
  'Use <code>printf("int: %zu\\n", sizeof(int));</code> — <code>%zu</code> is the format letter for sizeof results. Repeat for the other three types.',
  R`
#include <stdio.h>

int main(void) {
    printf("int: %zu\n", sizeof(int));
    printf("float: %zu\n", sizeof(float));
    printf("char: %zu\n", sizeof(char));
    printf("double: %zu\n", sizeof(double));
    return 0;
}
`, { code: BLANK_HINT });

/* ---- ops ---- */
NEW['ow-pizza'] = W('ow-pizza', 2, 'Pizza party',
  '<b>Problem:</b> 3 friends share 17 pizza slices equally. Use two <code>int</code> variables (<code>friends</code> and <code>slices</code>). Print how many slices each friend gets, and how many are left over.',
  'Each gets 5 slices\nLeft over: 2\n',
  'Plan: <code>slices / friends</code> is the share (whole-number division) and <code>slices % friends</code> is what is left over.',
  R`
#include <stdio.h>

int main(void) {
    int friends = 3;
    int slices = 17;
    printf("Each gets %d slices\n", slices / friends);
    printf("Left over: %d\n", slices % friends);
    return 0;
}
`);
NEW['ow-temp'] = W('ow-temp', 2, 'Celsius to Fahrenheit',
  '<b>Problem:</b> convert 25 degrees Celsius to Fahrenheit with the formula <code>F = C × 9 / 5 + 32</code>. Store the Celsius value in an <code>int</code> variable and print the line exactly as shown.',
  '25 C = 77 F\n',
  'Plan: <code>int c = 25;</code> <code>int f = c * 9 / 5 + 32;</code> then one printf with two <code>%d</code>.',
  R`
#include <stdio.h>

int main(void) {
    int c = 25;
    int f = c * 9 / 5 + 32;
    printf("%d C = %d F\n", c, f);
    return 0;
}
`);
NEW['ow-time'] = W('ow-time', 3, 'Seconds to hours, minutes, seconds',
  '<b>Problem:</b> a video is 3725 seconds long. Work out how many <b>hours</b>, <b>minutes</b> and <b>seconds</b> that is and print it in the shape shown.',
  '1 h 2 min 5 sec\n',
  'Hours: <code>total / 3600</code>. Minutes: <code>(total % 3600) / 60</code>. Seconds: <code>total % 60</code>. Store each in a variable first.',
  R`
#include <stdio.h>

int main(void) {
    int total = 3725;
    int h = total / 3600;
    int m = (total % 3600) / 60;
    int s = total % 60;
    printf("%d h %d min %d sec\n", h, m, s);
    return 0;
}
`);

/* ---- if ---- */
NEW['iw-ticket'] = W('iw-ticket', 2, 'Ticket price',
  '<b>Problem:</b> a cinema charges by age. Under 12 pays 5, ages 12 to 64 pay 10, and 65 or older pay 7. Store the age in an <code>int</code> (use <b>10</b>) and print <code>Price: </code> followed by the price. <i>Afterwards change the age to 30 and 70 and check the other prices.</i>',
  'Price: 5\n',
  'Plan: one variable for the age and one for the price. Use <code>if</code> / <code>else if</code> / <code>else</code> to set the price, then a single printf at the end.',
  R`
#include <stdio.h>

int main(void) {
    int age = 10;
    int price;
    if (age < 12) {
        price = 5;
    } else if (age < 65) {
        price = 10;
    } else {
        price = 7;
    }
    printf("Price: %d\n", price);
    return 0;
}
`);
NEW['iw-odd'] = W('iw-odd', 2, 'Odd or even?',
  '<b>Problem:</b> store the number <b>17</b> in an <code>int</code>. Print <code>17 is odd</code> if it is odd, or <code>17 is even</code> if it is even (the number in the text must come from the variable).',
  '17 is odd\n',
  'A number is even when <code>n % 2 == 0</code>. Use if / else with two different printf lines. <i>Try 18 afterwards.</i>',
  R`
#include <stdio.h>

int main(void) {
    int n = 17;
    if (n % 2 == 0) {
        printf("%d is even\n", n);
    } else {
        printf("%d is odd\n", n);
    }
    return 0;
}
`);
NEW['iw-login'] = W('iw-login', 3, 'Door code',
  '<b>Problem:</b> a door has the code <code>pin = 1234</code>. Someone typed <code>entered = 1234</code> and has already tried <code>attempts = 2</code> times (use these three variables). Rules: if attempts is more than 3, print <code>Locked</code>. Otherwise, if entered equals pin print <code>Access granted</code>, else print <code>Access denied</code>.',
  'Access granted\n',
  'Check the <b>lock</b> first (attempts &gt; 3), then compare the code. A chain: <code>if … else if … else …</code>. <i>Test other values afterwards.</i>',
  R`
#include <stdio.h>

int main(void) {
    int pin = 1234;
    int entered = 1234;
    int attempts = 2;
    if (attempts > 3) {
        printf("Locked\n");
    } else if (entered == pin) {
        printf("Access granted\n");
    } else {
        printf("Access denied\n");
    }
    return 0;
}
`);

/* ---- loops ---- */
NEW['lw-table'] = W('lw-table', 2, 'Table of 4',
  '<b>Problem:</b> print the multiplication table of 4, from 4 × 1 to 4 × 5, one line each, in the shape shown. Use a loop (do not write five printfs).',
  '4 x 1 = 4\n4 x 2 = 8\n4 x 3 = 12\n4 x 4 = 16\n4 x 5 = 20\n',
  'A for loop with <code>i</code> from 1 to 5. Inside: <code>printf("4 x %d = %d\\n", i, 4 * i);</code>',
  R`
#include <stdio.h>

int main(void) {
    for (int i = 1; i <= 5; i++) {
        printf("4 x %d = %d\n", i, 4 * i);
    }
    return 0;
}
`, { expect: (o, r, src) => norm(o) === norm('4 x 1 = 4\n4 x 2 = 8\n4 x 3 = 12\n4 x 4 = 16\n4 x 5 = 20\n') && /\b(for|while)\b/.test(src) });
NEW['lw-evens'] = W('lw-evens', 2, 'Sum of the even numbers',
  '<b>Problem:</b> add up all the even numbers from 1 to 20 (2 + 4 + 6 + … + 20) and print the result.',
  'Sum of evens: 110\n',
  'Plan: a variable <code>sum = 0</code>; a loop from 1 to 20; inside, an <code>if</code> that checks <code>i % 2 == 0</code> and then adds i to sum; print after the loop.',
  R`
#include <stdio.h>

int main(void) {
    int sum = 0;
    for (int i = 1; i <= 20; i++) {
        if (i % 2 == 0) {
            sum += i;
        }
    }
    printf("Sum of evens: %d\n", sum);
    return 0;
}
`);
NEW['lw-double'] = W('lw-double', 3, 'Doubling',
  '<b>Problem:</b> start with the number 1 and keep doubling it, printing each value followed by a space, until you have printed 128. Finish with a new line.',
  '1 2 4 8 16 32 64 128\n',
  'A while loop: <code>int n = 1; while (n &lt;= 128) { print n; n = n * 2; }</code> then <code>printf("\\n");</code>',
  R`
#include <stdio.h>

int main(void) {
    int n = 1;
    while (n <= 128) {
        printf("%d ", n);
        n = n * 2;
    }
    printf("\n");
    return 0;
}
`);

/* ---- func ---- */
NEW['fw-area'] = W('fw-area', 2, 'Area of a rectangle',
  '<b>Problem:</b> write a function <code>area</code> that receives a width and a height (both <code>int</code>) and <b>returns</b> width × height. In main, print the area of a 6 × 4 rectangle.',
  'Area: 24\n',
  'Plan: 1) <code>int area(int w, int h) { return w * h; }</code> above main, 2) call it inside the printf in main.',
  R`
#include <stdio.h>

int area(int w, int h) {
    return w * h;
}

int main(void) {
    printf("Area: %d\n", area(6, 4));
    return 0;
}
`, { expect: (o, r, src) => o === 'Area: 24\n' && /\barea\s*\(\s*int/.test(src) });
NEW['fw-even'] = W('fw-even', 2, 'Is it even?',
  '<b>Problem:</b> write a function <code>is_even</code> that receives an <code>int</code> and returns <b>1</b> if it is even, otherwise <b>0</b>. In main print the answer for 8 and for 7 as shown.',
  '8 even: 1\n7 even: 0\n',
  'Inside the function: <code>if (n % 2 == 0) { return 1; } else { return 0; }</code>. In main: <code>printf("8 even: %d\\n", is_even(8));</code>',
  R`
#include <stdio.h>

int is_even(int n) {
    if (n % 2 == 0) {
        return 1;
    } else {
        return 0;
    }
}

int main(void) {
    printf("8 even: %d\n", is_even(8));
    printf("7 even: %d\n", is_even(7));
    return 0;
}
`, { expect: (o, r, src) => o === '8 even: 1\n7 even: 0\n' && /is_even\s*\(\s*int/.test(src) });
NEW['fw-temp'] = W('fw-temp', 3, 'A converter function',
  '<b>Problem:</b> write a function <code>to_fahrenheit</code> that receives Celsius (an <code>int</code>) and returns <code>c * 9 / 5 + 32</code>. In main, use it to print the three lines shown, for 0, 25 and 100 degrees.',
  '0 C = 32 F\n25 C = 77 F\n100 C = 212 F\n',
  'Write the function once, call it three times. Each call: <code>printf("25 C = %d F\\n", to_fahrenheit(25));</code>',
  R`
#include <stdio.h>

int to_fahrenheit(int c) {
    return c * 9 / 5 + 32;
}

int main(void) {
    printf("0 C = %d F\n", to_fahrenheit(0));
    printf("25 C = %d F\n", to_fahrenheit(25));
    printf("100 C = %d F\n", to_fahrenheit(100));
    return 0;
}
`, { expect: (o, r, src) => o === '0 C = 32 F\n25 C = 77 F\n100 C = 212 F\n' && /to_fahrenheit\s*\(\s*int/.test(src) });

/* ---- headers ---- */
NEW['hw-tax'] = W('hw-tax', 2, 'Tax with a constant',
  '<b>Problem:</b> a game shop adds 10 percent tax. Define a constant <code>TAX</code> as 10 with <code>#define</code>. Store the price 200 in an <code>int</code> and print the tax as <code>price * TAX / 100</code>.',
  'Tax: 20\n',
  'Plan: <code>#define TAX 10</code> at the top (no <code>=</code>, no <code>;</code>), then use TAX like a number in the calculation.',
  R`
#include <stdio.h>

#define TAX 10

int main(void) {
    int price = 200;
    printf("Tax: %d\n", price * TAX / 100);
    return 0;
}
`, { expect: (o, r, src) => o === 'Tax: 20\n' && /#define\s+TAX\s+10/.test(src) });
NEW['hw-mathlib'] = { id: 'hw-mathlib', level: 3, mode: 'write', title: 'Write a tiny maths library (3 files)',
  task: '<b>Problem:</b> <code>main.c</code> is finished: it calls <code>add</code> and <code>times</code>. Write the other two files yourself. <code>mathx.h</code> declares both functions (with an include guard) and <code>mathx.c</code> contains their code. Both take two ints and return an int.',
  out: '7 + 5 = 12\n7 * 5 = 35\n',
  hint: 'Plan: 1) mathx.h: <code>#ifndef MATHX_H / #define MATHX_H</code>, the two prototypes, <code>#endif</code>. 2) mathx.c: <code>#include "mathx.h"</code> then the two function bodies. Read the linker error first if you forget one!',
  files: [
    { name: 'main.c', code: '\n#include <stdio.h>\n#include "mathx.h"\n\nint main(void) {\n    printf("7 + 5 = %d\\n", add(7, 5));\n    printf("7 * 5 = %d\\n", times(7, 5));\n    return 0;\n}\n' },
    { name: 'mathx.h', code: '\n// declare add and times here (with an include guard)\n' },
    { name: 'mathx.c', code: '\n// write add and times here\n' },
  ],
  solution: { 'mathx.h': '\n#ifndef MATHX_H\n#define MATHX_H\n\nint add(int a, int b);\nint times(int a, int b);\n\n#endif\n', 'mathx.c': '\n#include "mathx.h"\n\nint add(int a, int b) { return a + b; }\nint times(int a, int b) { return a * b; }\n' },
  expect: (o, r, src) => o === '7 + 5 = 12\n7 * 5 = 35\n' && /#ifndef|#pragma once/.test(src) };

/* ---- arrays ---- */
NEW['aw-avg'] = W('aw-avg', 2, 'Class average',
  '<b>Problem:</b> four test scores are stored in an array: 70, 85, 90 and 60. Add them up with a loop and print the average (whole-number division is fine).',
  'Average: 76\n',
  'Plan: 1) <code>int scores[4] = {70, 85, 90, 60};</code> 2) a for loop adding each element to <code>sum</code> 3) print <code>sum / 4</code>.',
  R`
#include <stdio.h>

int main(void) {
    int scores[4] = {70, 85, 90, 60};
    int sum = 0;
    for (int i = 0; i < 4; i++) {
        sum += scores[i];
    }
    printf("Average: %d\n", sum / 4);
    return 0;
}
`);
NEW['aw-name'] = W('aw-name', 2, 'Name length',
  '<b>Problem:</b> store the word <code>Windows</code> in a <code>char</code> array and print <code>Windows has 7 letters</code> where the word and the number both come from your variable (use <code>strlen</code>).',
  'Windows has 7 letters\n',
  'You need <code>#include &lt;string.h&gt;</code> too. <code>printf("%s has %zu letters\\n", word, strlen(word));</code>',
  R`
#include <stdio.h>
#include <string.h>

int main(void) {
    char word[] = "Windows";
    printf("%s has %zu letters\n", word, strlen(word));
    return 0;
}
`);
NEW['aw-pass'] = W('aw-pass', 3, 'How many passed?',
  '<b>Problem:</b> five scores are in an array: 45, 80, 33, 91, 60. A score of <b>50 or more</b> passes. Count how many scores pass and print the count.',
  'Passed: 3\n',
  'Plan: a counter starting at 0; a loop over the 5 elements; inside, an <code>if</code> that checks <code>scores[i] &gt;= 50</code> and increases the counter.',
  R`
#include <stdio.h>

int main(void) {
    int scores[5] = {45, 80, 33, 91, 60};
    int passed = 0;
    for (int i = 0; i < 5; i++) {
        if (scores[i] >= 50) {
            passed++;
        }
    }
    printf("Passed: %d\n", passed);
    return 0;
}
`);

/* ---- addr ---- */
NEW['adw-array'] = W('adw-array', 2, 'Addresses of an array',
  '<b>Problem:</b> create an array <code>int nums[3] = {7, 8, 9};</code> and print the <b>address</b> of each element, one address per line, using a loop and <code>%p</code>. (Your addresses will differ from other people’s — but each should be 4 higher than the one before.)',
  null,
  'Plan: a for loop from 0 to 2; inside <code>printf("%p\\n", (void*)&amp;nums[i]);</code>',
  R`
#include <stdio.h>

int main(void) {
    int nums[3] = {7, 8, 9};
    for (int i = 0; i < 3; i++) {
        printf("%p\n", (void*)&nums[i]);
    }
    return 0;
}
`, { expect: o => { const a = o.trim().split('\n').map(x => parseInt(x, 16)); return a.length === 3 && a.every(x => x > 0) && a[1] - a[0] === 4 && a[2] - a[1] === 4; } });

/* ---- ptr ---- */
NEW['pw-double'] = W('pw-double', 2, 'Double it through a pointer',
  '<b>Problem:</b> declare <code>int score = 21;</code> and a pointer <code>p</code> that points at it. Double the score by writing through the pointer only (do not write <code>score =</code>), then print <code>score=</code> and the value.',
  'score=42\n',
  'Plan: <code>int *p = &amp;score;</code> then <code>*p = *p * 2;</code> then print <code>score</code>.',
  R`
#include <stdio.h>

int main(void) {
    int score = 21;
    int *p = &score;
    *p = *p * 2;
    printf("score=%d\n", score);
    return 0;
}
`, { expect: (o, r, src) => o === 'score=42\n' && /\*\s*p\s*=/.test(src) });
NEW['pw-swap'] = W('pw-swap', 2, 'Swap two numbers',
  '<b>Problem:</b> write a function <code>swap</code> that exchanges the values of two <code>int</code> variables of the caller. In main set <code>x = 3</code> and <code>y = 8</code>, call swap, and print <code>x=8 y=3</code>.',
  'x=8 y=3\n',
  'The function must receive <b>addresses</b>: <code>void swap(int *a, int *b)</code>. Use a third variable <code>tmp</code> to hold one value while you copy. Call it with <code>swap(&amp;x, &amp;y);</code>',
  R`
#include <stdio.h>

void swap(int *a, int *b) {
    int tmp = *a;
    *a = *b;
    *b = tmp;
}

int main(void) {
    int x = 3;
    int y = 8;
    swap(&x, &y);
    printf("x=%d y=%d\n", x, y);
    return 0;
}
`);
NEW['pw-sum'] = W('pw-sum', 3, 'Walk an array with a pointer',
  '<b>Problem:</b> an array holds 2, 4, 6 and 8. Add the numbers up by moving a pointer <code>p</code> along the array (use <code>*p</code> and <code>p++</code>, no <code>nums[i]</code>) and print <code>sum=20</code>.',
  'sum=20\n',
  'Plan: <code>int *p = nums;</code> then a loop of 4 laps: <code>sum += *p;</code> and <code>p++;</code>.',
  R`
#include <stdio.h>

int main(void) {
    int nums[4] = {2, 4, 6, 8};
    int *p = nums;
    int sum = 0;
    for (int i = 0; i < 4; i++) {
        sum += *p;
        p++;
    }
    printf("sum=%d\n", sum);
    return 0;
}
`, { expect: (o, r, src) => o === 'sum=20\n' && /\*\s*p\b/.test(src) && !/nums\s*\[\s*i/.test(src) });

/* ---- structs ---- */
NEW['sw-monster'] = W('sw-monster', 2, 'A monster struct',
  '<b>Problem:</b> define a struct type <code>Monster</code> with two <code>int</code> fields, <code>hp</code> and <code>attack</code>. Create a monster named <code>goblin</code> with hp 30 and attack 5, and print <code>Goblin: hp=30 attack=5</code> using the fields.',
  'Goblin: hp=30 attack=5\n',
  'Plan: 1) <code>typedef struct { int hp; int attack; } Monster;</code> above main, 2) <code>Monster goblin = { 30, 5 };</code> 3) printf with <code>goblin.hp</code> and <code>goblin.attack</code>.',
  R`
#include <stdio.h>

typedef struct { int hp; int attack; } Monster;

int main(void) {
    Monster goblin = { 30, 5 };
    printf("Goblin: hp=%d attack=%d\n", goblin.hp, goblin.attack);
    return 0;
}
`, { expect: (o, r, src) => o === 'Goblin: hp=30 attack=5\n' && /struct/.test(src) });
NEW['sw-shop'] = W('sw-shop', 3, 'Shopping cart total',
  '<b>Problem:</b> define a struct <code>Line</code> with <code>qty</code> and <code>price</code> (ints). Make an array of three lines: (2 items at 5), (3 at 4) and (1 at 10). Loop over the array, add up qty × price for every line, and print <code>total=</code> and the sum.',
  'total=32\n',
  'Plan: struct type, array <code>Line cart[3] = { {2, 5}, {3, 4}, {1, 10} };</code>, then <code>total += cart[i].qty * cart[i].price;</code> in a for loop.',
  R`
#include <stdio.h>

typedef struct { int qty; int price; } Line;

int main(void) {
    Line cart[3] = { {2, 5}, {3, 4}, {1, 10} };
    int total = 0;
    for (int i = 0; i < 3; i++) {
        total += cart[i].qty * cart[i].price;
    }
    printf("total=%d\n", total);
    return 0;
}
`, { expect: (o, r, src) => o === 'total=32\n' && /struct/.test(src) });

/* ---- struct / heap ---- */
NEW['mw-squares'] = W('mw-squares', 3, 'Squares on the heap',
  '<b>Problem:</b> reserve room for 5 ints on the heap with <code>malloc</code>. Fill them with the squares 0, 1, 4, 9, 16 (i × i), print them on one line separated by spaces, and then give the memory back with <code>free</code>.',
  '0 1 4 9 16\n',
  'Plan: <code>int *sq = malloc(5 * sizeof(int));</code>, a loop filling <code>sq[i] = i * i;</code>, a loop printing, then <code>free(sq);</code>. Remember <code>#include &lt;stdlib.h&gt;</code>.',
  R`
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int *sq = malloc(5 * sizeof(int));
    for (int i = 0; i < 5; i++) {
        sq[i] = i * i;
    }
    for (int i = 0; i < 5; i++) {
        printf("%d ", sq[i]);
    }
    printf("\n");
    free(sq);
    return 0;
}
`, { expect: (o, r) => norm(o) === '0 1 4 9 16' && r.leaks.length === 0 });

/* ---- dptr ---- */
NEW['dw-make'] = W('dw-make', 3, 'Create a number inside a function',
  '<b>Problem:</b> write a function <code>make_number(int **out)</code> that allocates an int on the heap, stores 42 in it and gives the pointer back through <code>out</code>. In main, call it, print <code>got 42</code> from the result, and free the memory.',
  'got 42\n',
  'Inside the function: <code>*out = malloc(sizeof(int));</code> and <code>**out = 42;</code>. In main: <code>int *p = NULL; make_number(&amp;p);</code> then print <code>*p</code> and <code>free(p);</code>',
  R`
#include <stdio.h>
#include <stdlib.h>

void make_number(int **out) {
    *out = malloc(sizeof(int));
    **out = 42;
}

int main(void) {
    int *p = NULL;
    make_number(&p);
    printf("got %d\n", *p);
    free(p);
    return 0;
}
`, { expect: (o, r, src) => o === 'got 42\n' && r.leaks.length === 0 && /int\s*\*\*/.test(src) });

/* ---- list ---- */
NEW['lw-build'] = W('lw-build', 3, 'Build a list from scratch',
  '<b>Problem:</b> build a linked list of the numbers 1, 2, 3, 4 by adding each new node at the <b>front</b>. Then walk the list, print the values on one line (it will read 4 3 2 1), print the sum on the next line, and finally free every node.',
  '4 3 2 1\nsum=10\n',
  'Plan: 1) <code>typedef struct Node { int value; struct Node *next; } Node;</code> 2) a loop making a node with malloc: <code>n-&gt;value = i; n-&gt;next = head; head = n;</code> 3) a walking loop <code>for (Node *c = head; c; c = c-&gt;next)</code> 4) free in a loop, saving <code>next</code> first.',
  R`
#include <stdio.h>
#include <stdlib.h>

typedef struct Node { int value; struct Node *next; } Node;

int main(void) {
    Node *head = NULL;
    for (int i = 1; i <= 4; i++) {
        Node *n = malloc(sizeof(Node));
        n->value = i;
        n->next = head;
        head = n;
    }
    int sum = 0;
    for (Node *c = head; c != NULL; c = c->next) {
        printf("%d ", c->value);
        sum += c->value;
    }
    printf("\n");
    printf("sum=%d\n", sum);
    while (head != NULL) {
        Node *next = head->next;
        free(head);
        head = next;
    }
    return 0;
}
`, { expect: (o, r) => norm(o) === '4 3 2 1\nsum=10' && r.leaks.length === 0 });

/* ---- win ---- */
NEW['ww-wait'] = W('ww-wait', 2, 'Did we really wait?',
  '<b>Problem:</b> measure a pause. Read <code>GetTickCount()</code> into a <code>DWORD</code> variable, call <code>Sleep(100)</code>, read the tick count again and subtract. If at least 100 milliseconds passed print <code>Waited OK</code>, otherwise <code>Too fast</code>.',
  'Waited OK\n',
  'You need <code>#include &lt;windows.h&gt;</code>. Plan: <code>DWORD start = GetTickCount();</code> … <code>DWORD elapsed = GetTickCount() - start;</code> then an if on <code>elapsed &gt;= 100</code>.',
  R`
#include <stdio.h>
#include <windows.h>

int main(void) {
    DWORD start = GetTickCount();
    Sleep(100);
    DWORD elapsed = GetTickCount() - start;
    if (elapsed >= 100) {
        printf("Waited OK\n");
    } else {
        printf("Too fast\n");
    }
    return 0;
}
`, { expect: (o, r, src) => o === 'Waited OK\n' && /Sleep\s*\(/.test(src) });

/* ---- wrap-up: all three are write-it-yourself ---- */
NEW['dw-1'] = W('dw-1', 2, 'Price list total',
  '<b>Problem:</b> four prices are stored in an array: 5, 10, 15 and 20. Loop over the array, add them up and print the total.',
  'Total: 50\n',
  'Array + for loop + a running total. Same pattern as the class average.',
  R`
#include <stdio.h>

int main(void) {
    int prices[4] = {5, 10, 15, 20};
    int total = 0;
    for (int i = 0; i < 4; i++) {
        total += prices[i];
    }
    printf("Total: %d\n", total);
    return 0;
}
`);
NEW['dw-2'] = W('dw-2', 2, 'Count the even numbers',
  '<b>Problem:</b> the array holds 1, 2, 3, 4, 5, 6. Count how many of them are even and print the count.',
  'Evens: 3\n',
  'Loop + if (<code>a[i] % 2 == 0</code>) + a counter.',
  R`
#include <stdio.h>

int main(void) {
    int a[6] = {1, 2, 3, 4, 5, 6};
    int count = 0;
    for (int i = 0; i < 6; i++) {
        if (a[i] % 2 == 0) {
            count++;
        }
    }
    printf("Evens: %d\n", count);
    return 0;
}
`);
NEW['dw-3'] = W('dw-3', 3, 'Heal a player',
  '<b>Problem:</b> define a struct <code>Player</code> with an <code>int hp</code>. Write a function <code>heal</code> that receives a <b>pointer</b> to a Player and an amount, adds the amount to hp, but never lets hp go above 100. In main create a player with hp 80, heal by 50, and print <code>hp=100</code>.',
  'hp=100\n',
  'Plan: typedef the struct, then <code>void heal(Player *p, int amount)</code> using <code>p-&gt;hp</code>; in main call <code>heal(&amp;hero, 50);</code>.',
  R`
#include <stdio.h>

typedef struct { int hp; } Player;

void heal(Player *p, int amount) {
    p->hp += amount;
    if (p->hp > 100) {
        p->hp = 100;
    }
}

int main(void) {
    Player hero = { 80 };
    heal(&hero, 50);
    printf("hp=%d\n", hero.hp);
    return 0;
}
`, { expect: (o, r, src) => o === 'hp=100\n' && /->/.test(src) });


NEW['lw-sum'] = W('lw-sum', 2, 'Sum a chain of nodes',
  '<b>Problem:</b> define a node type <code>Node</code> with an <code>int value</code> and a <code>next</code> pointer. Create three nodes on the stack holding 10, 20 and 30, linked in that order (the last one points to <code>NULL</code>). Walk the chain with a loop, add up the values and print <code>sum=60</code>.',
  'sum=60\n',
  'Plan: <code>typedef struct Node { int value; struct Node *next; } Node;</code> then <code>Node c = {30, NULL}; Node b = {20, &amp;c}; Node a = {10, &amp;b};</code> and <code>for (Node *cur = &amp;a; cur != NULL; cur = cur-&gt;next)</code>.',
  R`
#include <stdio.h>

typedef struct Node { int value; struct Node *next; } Node;

int main(void) {
    Node c = { 30, NULL };
    Node b = { 20, &c };
    Node a = { 10, &b };
    int sum = 0;
    for (Node *cur = &a; cur != NULL; cur = cur->next) {
        sum += cur->value;
    }
    printf("sum=%d\n", sum);
    return 0;
}
`, { expect: (o, r, src) => o === 'sum=60\n' && /->\s*next/.test(src) });
NEW['lw-find'] = W('lw-find', 3, 'Is the value in the list?',
  '<b>Problem:</b> using the same three-node chain (10, 20, 30), write a function <code>contains(Node *head, int v)</code> that returns <b>1</b> if some node holds v and <b>0</b> if not. In main print <code>contains 20: 1</code> and <code>contains 99: 0</code>.',
  'contains 20: 1\ncontains 99: 0\n',
  'Walk with <code>for (Node *c = head; c != NULL; c = c-&gt;next)</code>; if <code>c-&gt;value == v</code> return 1 immediately; after the loop return 0.',
  R`
#include <stdio.h>

typedef struct Node { int value; struct Node *next; } Node;

int contains(Node *head, int v) {
    for (Node *c = head; c != NULL; c = c->next) {
        if (c->value == v) {
            return 1;
        }
    }
    return 0;
}

int main(void) {
    Node c = { 30, NULL };
    Node b = { 20, &c };
    Node a = { 10, &b };
    printf("contains 20: %d\n", contains(&a, 20));
    printf("contains 99: %d\n", contains(&a, 99));
    return 0;
}
`, { expect: (o, r, src) => o === 'contains 20: 1\ncontains 99: 0\n' && /contains\s*\(\s*Node/.test(src) });
NEW['ww-box'] = W('ww-box', 3, 'Quit confirmation',
  '<b>Problem:</b> show a Yes/No message box with the text <code>Quit the game?</code> and the title <code>Confirm</code> (use <code>MB_YESNO | MB_ICONQUESTION</code>). Store the answer. If it is <code>IDYES</code> print <code>Quitting</code>, otherwise print <code>Staying</code>. (The simulator always answers Yes.)',
  'Quitting\n',
  'Include <code>&lt;stdio.h&gt;</code> and <code>&lt;windows.h&gt;</code>. <code>int answer = MessageBoxA(NULL, "Quit the game?", "Confirm", MB_YESNO | MB_ICONQUESTION);</code> then if / else on <code>answer == IDYES</code>.',
  R`
#include <stdio.h>
#include <windows.h>

int main(void) {
    int answer = MessageBoxA(NULL, "Quit the game?", "Confirm", MB_YESNO | MB_ICONQUESTION);
    if (answer == IDYES) {
        printf("Quitting\n");
    } else {
        printf("Staying\n");
    }
    return 0;
}
`, { expect: (o, r) => o === 'Quitting\n' && r.events.some(e => e.caption === 'Confirm' && e.text === 'Quit the game?' && (e.flags & 0xF) === 4) });

/* ================================================================ PLAN: order + which old labs to keep */
const KEEP = {   // existing lab id → [level, expected-output text shown to the student]
  'l4-div': [3, 'Average: 3.50\n'], 'l5-bug': [2, 'Still alive\nLives left: 3\n'], 'l6-table': [2, '3 x 1 = 3\n3 x 2 = 6\n…\n3 x 10 = 30\n'],
  'l7-square': [2, '7 squared is 49\n'], 'l8-sum': [2, 'Sum: 150\n'], 'l3-overflow': [3, '2147483648\n'],
  'h-debug': [1, '[debug] hp = 80\ngame running\n'], 'h-macro': [2, '9\n'], 'h-multi': [3, 'HP: 100\n'],
  'a-task': [1, null], 'l9-swap': [2, 'x=2 y=1\n'], 'l9-walk': [3, 'Total: 45\n'],
  's-1': [2, 'Potion x3\n'], 's-2': [3, 'hp=0\n'], 's-3': [2, 'total=32\n'], 'l10-heap': [2, '0 1 4 9 16\n'],
  'd-1': [1, 'x=99\n'], 'd-3': [2, 'Ada\nLinus\nGrace\n'], 'd-2': [3, 'got 42\n'],
  'l-1': [1, '10 20 30\n'], 'l-2': [2, '30 20 10\n'], 'l-3': [2, 'sum=60\n'], 'l-4': [3, '10 30\n'], 'l-5': [3, '3 2 1\n'],
  'l11-msg': [1, null], 'l11-time': [2, null], 'l11-file': [3, 'Read back 11 bytes: Hello Win32\n'],
};
const PLAN = {
  how: ['how-1', 'how-2', 'how-4', 'how-5', 'how-6'],
  hello: ['hello-1', 'hello-3', 'hw-card', 'hw-quote', 'hw-house'],
  types: ['types-1', 'types-2', 'tw-card', 'tw-receipt', 'tw-sizes'],
  ops: ['ops-1', 'ops-2', 'ow-pizza', 'ow-temp', 'ow-time'],
  if: ['if-1', 'if-2', 'iw-ticket', 'iw-odd', 'iw-login'],
  loops: ['loop-1', 'loop-2', 'lw-table', 'lw-evens', 'lw-double'],
  func: ['func-1', 'func-2', 'fw-area', 'fw-even', 'fw-temp'],
  headers: ['hd-4', 'h-debug', 'hw-tax', 'hw-mathlib'],
  arrays: ['arr-1', 'arr-2', 'aw-avg', 'aw-name', 'aw-pass'],
  addr: ['a-task', 'ad-2', 'adw-array'],
  ptr: ['p-1', 'p-2', 'pw-double', 'pw-swap', 'pw-sum'],
  structs: ['s-0', 's-1', 'sw-monster', 'sw-shop'],
  struct: ['m-1', 'm-3', 'mw-squares'],
  dptr: ['d-1', 'd-3', 'dw-make'],
  list: ['l-1', 'l-2', 'lw-sum', 'lw-build', 'lw-find'],
  win: ['l11-msg', 'w-2', 'ww-wait', 'ww-box'],
  done: ['dw-1', 'dw-2', 'dw-3'],
};
const HEAD = {
  how: 'Learn the build cycle: run, spot, fix.', hello: 'Anatomy of a program, escape characters.', types: 'Variables: int, float, char.',
  ops: 'Maths with variables. No conditions yet.', if: 'Comparisons, if / else, and / or.', loops: 'for and while — repeat things.',
  func: 'Name a piece of code and reuse it.', headers: 'Constants, #ifdef and multi-file builds.', arrays: 'Lists of values, and text as an array.',
  addr: 'Where variables live.', ptr: 'Store addresses, read and write through them.', structs: 'Group variables together.',
  struct: 'malloc and free — manual memory.', dptr: 'Arrows pointing at arrows.', list: 'Build, walk, insert, delete, reverse.',
  win: 'Real Windows calls.', done: 'Put it all together.',
};

/* ================================================================ APPLY */
function labBlock(item, lesson) {
  if (typeof item !== 'string') return null;
  if (NEW[item]) {
    const t = NEW[item];
    return { t: 'lab', id: t.id, title: t.title, level: t.level, mode: t.mode || null, task: t.task, out: t.out || null, hint: t.hint, code: t.code, files: t.files, solution: t.solution, maxRows: 18, isTask: true,
      expect: t.expect || (o => norm(o) === norm(t.out)) };
  }
  const old = lesson.blocks.find(b => b.t === 'lab' && b.id === item);
  if (!old) throw new Error('task ' + item + ' not found in lesson ' + lesson.id);
  const k = KEEP[item]; if (!k) throw new Error('KEEP entry missing for ' + item);
  return Object.assign({}, old, { level: k[0], out: k[1] || null, isTask: true, hint: old.hint || 'Look for the TODO comments in the code — that is where you write.', maxRows: old.maxRows || 16 });
}
Object.keys(PLAN).forEach(id => {
  const les = L(id); if (!les) throw new Error('lesson missing ' + id);
  const group = PLAN[id].map(it => labBlock(it, les));
  group.forEach((g, i) => { g.num = i + 1; });
  // remove every old task-lab (those with a checker); keep free-play demos
  les.blocks = les.blocks.filter(b => !(b.t === 'lab' && b.expect));
  const head = { t: 'html', h: '<div class="taskhead"><h2>🧪 Practice tasks <span class="muted" style="font-size:.7em;font-weight:400">· ' + group.length + ' tasks, easy → harder</span></h2><p>' + (HEAD[id] || '') + ' Tasks 1–2 are guided (fill in the <code>TODO</code>). From task 3 you get a problem and write the <b>whole program</b> yourself. Stuck? Press <b>💡 Hint</b>.</p></div>' };
  let at = les.blocks.findIndex(b => b.t === 'quiz'); if (at < 0) { at = les.blocks.findIndex(b => b.t === 'tutor'); if (at < 0) at = les.blocks.length; }
  les.blocks.splice(at, 0, head, ...group);
});

/* ================================================================ gentle-pacing fixes */
const blocksOf = (id, pred) => L(id).blocks.filter(pred);
function dropQ(id, re, add) {
  L(id).blocks.filter(b => b.t === 'quiz').forEach(q => { const before = q.qs.length; q.qs = q.qs.filter(x => !re.test(x.q + ' ' + (x.code || '') + ' ' + x.o.join(' '))); if (add && /Challenge/.test(q.title || '')) q.qs.push(...add); });
}
const Qd = (q, o, a, why, code) => Object.assign({ q, o, a, why }, code ? { code } : {});

/* hello */
L('hello').goals = ['Name every part of a minimal C program', 'Read a compiler error and fix it', 'Print text with printf and escape characters (\\n, \\t, \\")'];
dropQ('hello', /puts|scanf|stdio\.h give/, [
  Qd('What does #include <stdio.h> give you?', ['The main function', 'The declaration of printf (so the compiler knows it)', 'A window on screen', 'The compiler'], 1, 'stdio.h tells the compiler that printf exists and how to call it.'),
  Qd('What does this print?  (↵ = new line)', ['Hi↵There↵', 'Hi There', 'Hi↵There', 'HiThere↵'], 0, 'Each \\n starts a new line.', R`#include <stdio.h>
int main(void) {
    printf("Hi\n");
    printf("There\n");
    return 0;
}`),
]);

/* types: replace the struct/stdint example with something plain */
L('types').blocks.forEach(b => { if (b.t === 'example' && b.id === 'ex-types-enemy') {
  b.title = 'game stats and a score that wraps'; b.why = 'Different kinds of data need different types. The last lines show a number that is too big for its box.';
  b.code = R`
#include <stdio.h>

int main(void) {
    int level = 7;
    float speed = 2.5;
    char rank = 'S';
    printf("level %d, speed %.1f, rank %c\n", level, speed, rank);
    printf("an int takes %zu bytes, a char takes %zu\n", sizeof(int), sizeof(char));

    int score = 2147483647;
    score = score + 1;
    printf("score after one more point: %d\n", score);
    return 0;
}
`; b.after = 'Click “Step through” and watch score wrap around to a negative number.'; } });

/* ops: arithmetic only */
{
  const o = L('ops');
  o.blocks = o.blocks.filter(b => !(b.t === 'widget' && (b.w === 'bitToggle' || b.w === 'logic')));
  const ti = o.blocks.findIndex(b => b.t === 'html' && /<th>Kind<\/th>/.test(b.h));
  if (ti >= 0) o.blocks[ti] = { t: 'html', h: `<table class="t"><tr><th>Operator</th><th>Meaning</th><th>Example</th></tr>
    <tr><td><code>+ - *</code></td><td>add, subtract, multiply</td><td><code>3 * 4</code> is 12</td></tr>
    <tr><td><code>/</code></td><td>divide (whole numbers: the decimals are dropped)</td><td><code>7 / 2</code> is <b>3</b></td></tr>
    <tr><td><code>%</code></td><td>remainder after dividing</td><td><code>7 % 3</code> is 1</td></tr>
    <tr><td><code>= += -= *= ++ --</code></td><td>store a result / shortcuts</td><td><code>score += 10;</code> means <code>score = score + 10;</code></td></tr></table>
    <p class="small muted">Comparing values (is a bigger than b?) comes in the next-but-two lesson, “Making decisions”.</p>` };
  o.blocks = o.blocks.filter(b => b.t !== 'warn' || !/no separate/.test(b.h));
  o.blocks.forEach(b => { if (b.t === 'example' && b.id === 'ex-ops-damage') {
    b.title = 'a damage calculator'; b.why = 'Real game maths is just + − × ÷ on variables. Change the numbers and run it.';
    b.code = R`
#include <stdio.h>

int main(void) {
    int attack = 50;
    int defense = 20;
    int damage = attack - defense / 2;
    int enemy_hp = 200;

    printf("damage = %d\n", damage);
    printf("enemy HP left: %d\n", enemy_hp - damage);
    return 0;
}
`; b.after = 'Try changing defense to 30. Notice defense / 2 is calculated before the subtraction.'; } });
  // the flags example + bit widget move to the Windows lesson where | is actually used
  const flagEx = o.blocks.find(b => b.t === 'example' && b.id === 'ex-ops-flags');
  o.blocks = o.blocks.filter(b => b !== flagEx);
  const w = L('win'), ai = w.blocks.findIndex(b => b.t === 'widget' && b.w === 'apiReader');
  w.blocks.splice(ai + 1, 0, { t: 'html', h: '<p><b>Flags.</b> Many Win32 options are single bits combined with <code>|</code> (e.g. <code>MB_YESNO | MB_ICONQUESTION</code>). Click the bits to see how that works:</p>' }, { t: 'widget', w: 'bitToggle' }, ...(flagEx ? [flagEx] : []));
  const ti2 = o.blocks.findIndex(b => b.t === 'tutor');
  if (ti2 >= 0) o.blocks[ti2] = { t: 'tutor', h: '<b>Minute plan:</b> 2 min operators table · 2 min integer-division pitfall (ask them to predict 7/2 first) · 3 min printf widget · tasks.<br><b>Keep it arithmetic only</b> — comparisons come in the decisions lesson.' };
  dropQ('ops', /5 > 3|operator tests for equality|x & 1|1 << 4/, [
    Qd('What is printed?', ['3 1', '3.3 1', '1 3', '3 3'], 0, '10 = 3 × 3 + 1: quotient 3, remainder 1.', R`#include <stdio.h>
int main(void) {
    int a = 10, b = 3;
    printf("%d %d\n", a / b, a % b);
    return 0;
}`),
    Qd('What is printed?', ['18', '6', '60', '13'], 0, '10 − 4 = 6, then 6 × 3 = 18.', R`#include <stdio.h>
int main(void) {
    int x = 10;
    x -= 4;
    x *= 3;
    printf("%d\n", x);
    return 0;
}`),
    Qd('Which line means the same as  score = score + 10; ?', ['score =+ 10;', 'score += 10;', 'score + 10;', 'score ++ 10;'], 1, '+= adds the right side to the variable.'),
    Qd('What does 2 + 3 * 4 give?', ['20', '14', '24', '9'], 1, 'Multiplication happens first: 3 * 4 = 12, then + 2.'),
  ]);
}
/* shorter precedence note inside the widget header is already arithmetic-only */

/* if: comparisons + logic live here now */
{
  const f = L('if');
  const wi = f.blocks.findIndex(b => b.t === 'widget' && b.w === 'flowIf');
  f.blocks.splice(wi, 0, { t: 'html', h: `<h3>Comparing values</h3><table class="t"><tr><th>Write</th><th>Meaning</th><th>Example (hp = 30)</th></tr>
    <tr><td><code>&gt;</code> &nbsp; <code>&lt;</code></td><td>bigger than / smaller than</td><td><code>hp &gt; 50</code> is false</td></tr>
    <tr><td><code>&gt;=</code> &nbsp; <code>&lt;=</code></td><td>bigger or equal / smaller or equal</td><td><code>hp &lt;= 30</code> is true</td></tr>
    <tr><td><code>==</code> &nbsp; <code>!=</code></td><td>equal to / not equal to</td><td><code>hp == 30</code> is true</td></tr>
    <tr><td><code>&amp;&amp;</code> &nbsp; <code>||</code> &nbsp; <code>!</code></td><td>and / or / not</td><td><code>hp &gt; 0 &amp;&amp; hp &lt; 50</code> is true</td></tr></table>
    <p>A comparison is either <b>true</b> or <b>false</b>. In C, false is <code>0</code> and anything else is true.</p>` });
  const wi2 = f.blocks.findIndex(b => b.t === 'widget' && b.w === 'flowIf');
  f.blocks.splice(wi2 + 1, 0, { t: 'widget', w: 'logic' });
  f.blocks.forEach(b => { if (b.t === 'example' && b.id === 'ex-if-ai') {
    b.title = 'an enemy that decides what to do'; b.why = 'A chain of if / else if picks one behaviour.';
    b.code = R`
#include <stdio.h>

int main(void) {
    int distance = 4;
    int hp = 80;

    if (hp < 25) {
        printf("runs away!\n");
    } else if (distance < 5) {
        printf("chases the player (distance %d)\n", distance);
    } else if (distance < 15) {
        printf("walks the route\n");
    } else {
        printf("zzz...\n");
    }
    return 0;
}
`; b.after = 'Change hp to 10, then distance to 30, and watch the choice change.'; } });
  dropQ('if', /a \? b|enum|NULL|FLEE/, [
    Qd('What is printed?  (↵ = new line)', ['A↵', 'B↵', 'AB↵', '(nothing)'], 1, 'hp > 50 is false, so the else branch runs.', R`#include <stdio.h>
int main(void) {
    int hp = 40;
    if (hp > 50) printf("A"); else printf("B");
    printf("\n");
    return 0;
}`),
    Qd('What does  &&  mean?', ['or', 'and — both sides must be true', 'not', 'equals'], 1, '&& is true only when BOTH conditions are true.'),
    Qd('Which operator means “not equal”?', ['<>', '!=', '=/=', '=!'], 1, 'In C: !=  (and == for equal).'),
  ]);
}

/* loops: simpler examples */
{
  const l = L('loops');
  l.blocks.forEach(b => {
    if (b.t === 'example' && b.id === 'ex-loop-bar') { b.code = R`
#include <stdio.h>

int main(void) {
    int hp = 7;
    int max = 10;
    printf("HP [");
    for (int i = 0; i < max; i++) {
        if (i < hp) {
            printf("#");
        } else {
            printf("-");
        }
    }
    printf("] %d/%d\n", hp, max);
    return 0;
}
`; b.why = 'One loop lap per cell; an if chooses the symbol.'; }
    if (b.t === 'example' && b.id === 'ex-loop-menu') { b.title = 'a game menu loop (do-while)'; b.why = 'A menu must show at least once, then repeat until the player chooses 0 (quit). We fake the choices with a counter.'; b.code = R`
#include <stdio.h>

int main(void) {
    int turn = 0;
    int choice;
    int coins = 0;

    do {
        turn++;
        choice = 3 - turn;      // pretend the player chose 2, 1, 0
        if (choice == 1) {
            coins += 10;
            printf("opened a chest\n");
        } else if (choice == 2) {
            printf("walked\n");
        }
    } while (choice != 0);

    printf("coins: %d\n", coins);
    return 0;
}
`; }
  });
  dropQ('loops', /array has n elements|a\[i\]/, [
    Qd('How many times does the body of  for (int i = 0; i <= 5; i++)  run?', ['5', '6', '7', 'forever'], 1, 'i = 0,1,2,3,4,5 — that is 6 laps. <= includes the last value.'),
  ]);
}

/* arrays: examples stay; mark the sort as a stretch */
L('arrays').blocks.forEach(b => { if (b.t === 'example' && b.id === 'ex-arr-scores') b.title = 'a high-score table (stretch: sorting)'; });

/* wrap-up */
{
  const d = L('done');
  d.blocks.forEach(b => {
    if (b.t === 'html' && /Homework/.test(b.h)) b.h = b.h.replace(/<li>Write a number-guessing game[^<]*<\/li>/, '<li>Redo every ⭐ and ⭐⭐ task without pressing Hint.</li>').replace(/<li>Make a <code>Player<\/code> struct and a function <code>void heal\(Player \*p, int amount\)<\/code>\.<\/li>/, '<li>Pick two ⭐⭐⭐ tasks from the lessons you liked best and solve them again from a blank file.</li>');
    if (b.t === 'example' && b.id === 'ex-done-guess') { b.title = 'a score summary'; b.why = 'Variables, arithmetic, a loop, an if and printf — everything from the first lessons in one small program.'; b.code = R`
#include <stdio.h>

int main(void) {
    int total = 0;
    int best = 0;

    for (int round = 1; round <= 5; round++) {
        int points = round * 10;
        total += points;
        if (points > best) {
            best = points;
        }
        printf("round %d: %d points\n", round, points);
    }
    printf("total %d, best %d\n", total, best);
    return 0;
}
`; b.after = ''; }
  });
}


/* ptr: scanf is never taught, so no question may need it */
dropQ('ptr', /scanf/, [Qd('Why does a function need the ADDRESS of a variable (a pointer) to change it?', ['It does not', 'Without the address it only gets a copy of the value', 'Addresses are faster', 'The compiler requires it'], 1, 'Arguments are copied. With the address, the function can reach the original variable.')]);
L('ptr').blocks.forEach(b => { if (b.t === 'tutor') b.h = b.h.replace('forgetting & in scanf; ', ''); });

/* ================================================================ extra tallies for the tutor sheet */
C.TASKS_META = { plan: PLAN, head: HEAD };
})(window);
