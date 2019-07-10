---
layout: post
title: 各linux平台安装nodejs
category: tech
tags: [Linux]
description: 
---



## 问题

我只能说搞毛，要做个小项目，发现CentOS7 上面安装nodejs用源码安装要用gcc进行编译，也可能是电脑慢（不可思议），编译起来感觉慢，中途给ctrl+Z了。受不了，什么年代了，装个这东西还要编译。

搜索别的解决办法。

先是yum install epel-release，然后安装nodejs，但是宪法版本是旧的，而且旧的不是一点，目前的版本是11，这个装起来是6.

继续找。。。，找到下面的这个。

[nodesource](https://github.com/nodesource/distributions#rpminstall)

这个是真的不错啊。

```shell
curl -sL https://rpm.nodesource.com/setup_11.x | bash -
```

装好了nodejs，还有npm。

很好很好很好！

