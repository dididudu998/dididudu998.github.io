---
layout: post
title: 重置mariadb/mysql的root账户密码
category: tech
tags: [mysql,mariadb]
description: mysql/mariadb root forgot password
---

# 背景

有一台fedora装了mariadb的数据库想要知道数据库的信息，但是没有人知道密码。

用mysql -uroot -p的形式，提示root没有权限访问。


# 过程

1. systemctl stop mariadb
2. mysqld_safe --skip-grant-table --skip-networking &
3. 此时mariadb即可直接登陆，不需要用户名和密码
4. 连接mysql,mysql -uroot
5. 执行下面的步骤  
```mysql
use mysql;
update user set password="abcdef" where user='root';
flush privileges;
quit
```
6. 然后ps aux|grep mysql*
7. kill -9 掉那些mysql的进程
8. 尝试 systemctl start mariadb
9. 然后用新的密码登陆试试

# tips

如果没有kill掉mysql的进程的话，修改密码会失败。而且start服务会卡住。
建议在修改密码，quit后，有条件也可以直接重启机器。
