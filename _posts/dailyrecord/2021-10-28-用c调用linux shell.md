---
layout: post
title: 用C调用linux shell，用来屏蔽对shell的直接引用
category: tech
tags: [Linux]
description: 如果你也像我一样经常工作于Windows和Linux，那么这篇文章值得一
---

# 起因

有一个sqlite的数据库，用shell的方式获取查询的结果，然后输出到html文件，再将这个文件用shell发送给我。

# 实现

查询sqlite数据库文件见下：

```shell
#!/bin/sh
cd "/usr/local/lib/python3.6/dist-package/folder"

sqlite3 vlundb "select * from vluninfo where severity>=3;"
```

发邮件给我：
```shell
#!/bin/sh
cd "/usr/local/lib/python3.6/dist-packages/folder"

today=`date +%Y%m%d`
sh qs.sh > vluns-$today.html

mailx -r vluns-high@example.com -s "vluns-high-critical" mark@example.com <vluns-$today.html

```

C程序是网上抄的,见下：

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
int main(){
        FILE *pipe=popen("sh /usr/local/lib/python3.6/dist-packages/folder/mailtome.sh", "r");
        if(pipe){
                char buffer[128];
                while(!feof(pipe)){
                        if(fgets(buffer,128,pipe)!=NULL){}
                }
                pclose(pipe);
                buffer[strlen(buffer)-1]=='\0';
        }
}
```

# 结果

将编译生成后的可执行文件拷贝到其他的目录执行，发现结果如所期望的实现了。

目前就这样吧。

