/*
 * File: 清理大小为0的日志文件
 * File Created: Sunday, 31st July 2022 11:25:24 am
 * Author: Mark S (miaomiaomi@outlook.com)
 * -----
 * Last Modified: Sunday, 31st July 2022 11:25:24 am
 * Modified By: Mark S (miaomiaomi@outlook.com>)
 * -----
 * Copyright MarkShi
 */

# 在log目录清理大小为0的日志文件

由于在每2分钟生成一个nrs_{date}.log, 所以会有大量的0大小的日志文件，需要定期进行清除。

```shell
ls -alht | awk '{print $5 " " $9}' | sort|awk '{if($1<1) print $2}'|grep nrs_|xargs rm -f
```

# 查询磁盘空间的占用情况

```shell
du -x --max-depth=1 / | sort -k1 -nr | head -n 10
```

# 文件内的字符替换
    
```shell
find / -type f -name "*.txt" -exec sed -i 's/old/new/g' {} \;
```

# 文件打包

```shell
(find . -name "*.txt" |xargs tar -cvf my_txt.tar) && cp -f my_txt.tar /tmp/ && rm -f my_txt.tar
```

# redhat 发送邮件

```shell
#!/bin/bash
#mark @2024/04/21

dnf install mutt -y
update_log=$(dnf update -y)
dnf update -y >g.txt
ipaddress=$(hostname -I)
datetime=$(date +"%Y-%m-%d %H:%M:%S")
echo $ipaddress >>g.txt
echo $datetime >>g.txt
mutt -s "dnf update" myaccount@domain.coom <g.txt
rm g.txt

```