---
layout: post
title: 用openconnect替换anyconnect
category: tech
tags:
  - vpn
  - anyconnect
description:
---

自从这边用cisco anyconnect后，我就一直用openconnect来代替anyconnect了，因为openconnect可以用脚本节省我每次输入密码的麻烦，我基本上不记工作上的密码。

今天在进行vpn链接的时候，告诉我不行了，我查了下，现在多了个需要选择GROUP的动作，以前是默认的不需要选择。只好从新调整下我的openconnect脚本了。

调整后的脚本是这样的：

```shell
 echo "company VPN: All Traffic\nPassword\npush" |sudo openconnect -u myaccount company-vpn.aaa.com
```

这里要说明的是：

- company VPN: All Traffic是group的名字
- Password是我的真实的密码
- push是第二个密码，输入push会推送一个弹窗到手机的DUO应用，点击approve，则会连接VPN。也可以输入sms，这样会收到一条短信，短信中包含有一次性密码。
- myaccount是我的用户名
- company-vpn.aaa.com是公司的vpn服务器地址，其实也就是登录网页

完整的过程其实是用上面的参数填充登录网页中的各个项，然后发起post请求。

这样又可以一键上vpn了。

