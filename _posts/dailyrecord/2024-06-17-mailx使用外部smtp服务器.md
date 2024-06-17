---
layout: post
title: mailx使用外部smtp服务器
category: daily
tags:
  - linux
description: 像我一样经常工作于Windows和Linux，那么这篇文章值得一看
---
在Ubuntu中使用unattended-upgrades服务的时候，有一个发送notify的选项，就是在安装了unattended-upgrades服务后，在/etc/apt/apt.conf.d/50unattended-upgrade这个文件中，编辑Unattended-Upgrade::Mail "myemailaddress";这个栏目。

但是这个由于比较基础，必须使用mailx或者mail来进行发送邮件，不支持使用别的替代方案。所以需要配置下mailx使用已有的smtp服务器来实现对外发送邮件的目的。

需要在当前用户目录下新建一个文件“～/.mailrc".

如果需要使用TLS的话，还得建立一下证书数据库：

```shell
mkdir ~/.certs
certutil -N -d ~/.certs
```


```ini
# external smtp server
set smtp-use-starttls #如果需要的话
set ssl-verify=ignore
set nss-config-dir=/home/user/.certs # 如果需要的话
set smtp="smtp://smtp.server:port"   # smtp://smtp.gmail.com:587, smtp://mail.company.net:25
set smtp-auth=login
set smtp-auth-user="user@domain.ltd"
set smtp-auth-password="S3cr37"
set from="whoami@server.com(My Name)"
```

以上的配置如果完成后，先测试下发送给自己的外网邮箱，看看是不是可以了。

```shell
echo "hello" | mail -s "test" abc@abc.com
```

如果可行了，那么再试试自动升级的邮件提醒是不是可以了。

```shell
unattented-upgrade --debug
```
