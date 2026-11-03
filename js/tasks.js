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
  how: ['how-1', 'how-2', 'how-3', 'how-4', 'how-5'],
  hello: ['hello-1', 'hello-2', 'hello-3', 'hello-4', 'hello-5'],
  types: ['types-1', 'types-2', 'types-3', 'types-4', 'l3-overflow'],
  ops: ['ops-1', 'ops-2', 'ops-3', 'ops-4', 'l4-div'],
  if: ['if-1', 'if-2', 'if-3', 'l5-bug', 'if-5'],
  loops: ['loop-1', 'loop-2', 'l6-table', 'loop-4', 'loop-5'],
  func: ['func-1', 'func-2', 'func-3', 'l7-square', 'func-5'],
  headers: ['hd-4', 'h-debug', 'h-macro', 'h-multi'],
  arrays: ['arr-1', 'arr-2', 'l8-sum', 'arr-4', 'arr-5'],
  addr: ['a-task', 'ad-2', 'ad-3'],
  ptr: ['p-1', 'p-2', 'l9-swap', 'p-3', 'l9-walk'],
  structs: ['s-0', 's-1', 's-3', 's-2'],
  struct: ['m-1', 'l10-heap', 'm-3'],
  dptr: ['d-1', 'd-3', 'd-2'],
  list: ['l-1', 'l-2', 'l-3', 'l-4', 'l-5'],
  win: ['l11-msg', 'w-2', 'l11-time', 'l11-file'],
  done: ['r-1', 'r-2', 'r-3'],
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
    return { t: 'lab', id: t.id, title: t.title, level: t.level, task: t.task, out: t.out || null, hint: t.hint, code: t.code, solution: t.solution, maxRows: 16, isTask: true,
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
  const head = { t: 'html', h: '<div class="taskhead"><h2>🧪 Practice tasks <span class="muted" style="font-size:.7em;font-weight:400">· ' + group.length + ' tasks, easy → harder</span></h2><p>' + (HEAD[id] || '') + ' Do them in order. Stuck? Press <b>💡 Hint</b>.</p></div>' };
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
