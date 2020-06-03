---
layout: post
title: 利用cockpit远程管理Linux主机
category: tech
tags: [Linux]
description: 
---

# 起因

在使用了CentOS8.1的时候，发现开机有提示，可以enable cockpit.socket服务。  
当时感觉可能就是类似Ubuntu的那种聚合管理的东西，就打开了。

然后发现这个还真是所想的那种。

# 了解

参看[这里](https://cockpit-project.org/)

还有统一认证的部分以及架构

![架构](/images/tupian/cockpit-transport.png)