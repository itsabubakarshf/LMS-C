const C=require('../js/cinterp.js');
function t(name,src,stdin){const r=C.run(src,{stdin});console.log('---',name, r.ok?'':JSON.stringify(r.errors||r.error));console.log(r.stdout);if(r.warnings&&r.warnings.length)console.log('WARN',JSON.stringify(r.warnings));return r}
t('hello',`#include <stdio.h>
int main(void){ printf("Hello %d %5.2f %s %c %x\\n", 42, 3.14159, "hi", 'A', 255); return 0; }`);
t('types',`#include <stdio.h>
struct P{char a;int b;char c;};
int main(){ int x=2147483647; x=x+1; printf("%d %zu %zu %zu %zu\\n",x,sizeof(long),sizeof(void*),sizeof(struct P),sizeof(double)); unsigned char u=255;u++;printf("%d\\n",u); return 0;}`);
t('ptr',`#include <stdio.h>
void swap(int*a,int*b){int t=*a;*a=*b;*b=t;}
int main(){int x=1,y=2;swap(&x,&y);printf("%d %d\\n",x,y);int a[5]={1,2,3,4,5};int*p=a;p+=2;printf("%d %d\\n",*p,p[1]);return 0;}`);
t('malloc',`#include <stdio.h>
#include <stdlib.h>
#include <string.h>
typedef struct Node{int v;struct Node*next;}Node;
int main(){Node*h=NULL;for(int i=0;i<3;i++){Node*n=malloc(sizeof(Node));n->v=i;n->next=h;h=n;}
for(Node*c=h;c;c=c->next)printf("%d ",c->v);printf("\\n");char*s=malloc(10);strcpy(s,"hey");printf("%s %zu\\n",s,strlen(s));free(s);return 0;}`);
t('err1',`#include <stdio.h>
int main(){ int x = 5
 printf("%d",x); return 0;}`);
t('err2',`int main(){ printf("hi"); return 0;}`);
t('segv',`#include <stdio.h>
int main(){ int*p=NULL; *p=5; return 0;}`);
t('win',`#include <windows.h>
int main(){ int r=MessageBoxA(NULL,"Hello","Title",MB_OK|MB_ICONINFORMATION); DWORD pid=GetCurrentProcessId(); SYSTEMTIME st; GetLocalTime(&st); return 0;}`);
const r=t('loop',`int main(){ while(1){} }`);
const r2=t('trace',`#include <stdio.h>
int main(){int s=0;for(int i=1;i<=3;i++){s+=i;}printf("%d\\n",s);return 0;}`);
console.log(r2.trace.length, JSON.stringify(r2.trace[2].frames));
t('scanf',`#include <stdio.h>
int main(){int a,b;scanf("%d %d",&a,&b);printf("%d\\n",a+b);return 0;}`,'3 4');
t('sw',`#include <stdio.h>
#define SQR(x) ((x)*(x))
enum Color{RED,GREEN=5,BLUE};
int fact(int n){return n<=1?1:n*fact(n-1);}
int main(){int c=BLUE;switch(c){case RED:puts("r");break;case 6:puts("six");default:puts("fall");}printf("%d %d %d\\n",SQR(4),fact(10),c);
char s[]="Hi";printf("%s %zu\\n",s,sizeof(s)); int g; printf("%d\\n",g); return 0;}`);
