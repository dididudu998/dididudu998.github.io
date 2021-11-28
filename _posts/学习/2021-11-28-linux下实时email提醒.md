---
layout: post
title: linux下对事件进行实时email提醒
category: 学习
tags: [思维学习]
---


# 起因

原因是在早上对以前做的webdns进行测试修改的时候，看到dns的zone中存在一个记录，这个记录我没有印象。是2020年6月8号做的。感觉是和安全相关的。因为指向的记录是一个不存在的地址。可能是当时在query的记录中发现有大量的错误，所以做了这个zone。但是具体是什么，已经忘记了。

查看了下ssh的known_hosts，发现有2个hosts为新加坡的亚马逊的记录，因为我以前分享过root密码给别人，所以目前还不能断定这个记录是不是他们添加的。

为了安全起见，我需要做一个提醒给我，以免真的安全问题，自己还不清楚。

# 实现

以前写过将last的信息发邮件给我的。但是那个不是实时的。

这次必须要做成实时的警告。

解决方法是利用rsyslog的日志记录和邮件功能。

- 编辑/etc/rsyslog.d/alerttomark.conf文件
- 文件内容如下：

```conf
ModLoad ommail
$ActionMailSMTPServer localhost
$ActionMailFrom alert@example.com
$ActionMailTo mark@xxx.com
$ActionMailTo mark@yyy.com
$template mailSubject,"Login Alert on %hostname%"
$template mailBody,"%fromhost%\r\n\r\nTime:%timereported%\r\n\r\n\n%msg%"
$ActionMailSubject mailSubject
$ActionExecOnlyOnceEveryInterval 1
# the if ... then ... mailBody mus be on one line!
#if $msg contains 'session opened for user' then :ommail:;mailBody
if $msg contains 'session opened' then :ommail:;mailBody

$ActionMailFrom alert@example.com
$ActionMailTo mark@xxx.com
$ActionMailTo mark@yyy.com
$ActionMailSubject,"Something wrong on %hostname%"
## only works on newest rsyslog: make sure we receive a mail only once in half an hour
$ActionExecOnlyOnceEveryInterval 1800
if $msg contains 'fail' then :ommail:;mailBody
$ActionExecOnlyOnceEveryInterval 0

$ActionMailFrom alert@example.com
$ActionMailTo mark@xxx.com
$ActionMailTo mark@yyy.com
$ActionMailSubject,"logging information on %hostname%"
## only works on newest rsyslog: make sure we receive a mail only once in half an hour
$ActionExecOnlyOnceEveryInterval 1800
if $msg contains 'logging in' or 'logging out' then :ommail:;mailBody
$ActionExecOnlyOnceEveryInterval 0
```

- 重启rsyslog服务

```shell
systemctl restart rsyslog
```

- 测试
    - 退出所有的ssh终端
    - 重新ssh login
    - 检查是否收到邮件
    - 测试结果实现了实时的警告。

