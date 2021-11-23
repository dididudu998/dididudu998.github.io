---
layout: post
title: dump出内存，并进行简单分析
category: tech
tags: [git,devops,security]
description: 如果你也像我一样经常工作于Windows和Linux，那么这篇文章值得一
---

## 起因

主要是最近在学习c++，想要做一个内存镜像的东西，将内存中的文件夹和文件dump出来，然后将里面的文件内容给存储下来，这样可以解决的问题是，如果某个进程卡死，但是没有退出的话， 还有可能挽救文件啊，😄

自己编程目前以我的技术还差的有点远。但是linux系统本身就有这样的功能，虽然没有到我想要的地步。但是做事情哪能你想的有就有，肯定是要自己再去研究一下的。

## 过程

- 获取想要dump的进程的pid
  - ps|aux|grep -i "process name" | awk '{print $2}'
- 获取内存空间
  - cat /proc/pid/maps,见下面的例子

    ```shell
    root@flask:~# cat /proc/3678079/maps
    00400000-006a4000 r-xp 00000000 08:01 2622765                            /var/www/getnyuservice
    006a4000-00946000 r--p 002a4000 08:01 2622765                            /var/www/getnyuservice
    00946000-0099e000 rw-p 00546000 08:01 2622765                            /var/www/getnyuservice
    ......
    ```

- 将需要的部分内存空间dump出来

```shell
gdb --pid 3678079
(gdb) dump memory /tmp/memory.dump 0x00400000 0x006a4000
```

- 检索dump出来的文件. 如果存在service这个关键字，则显示其上下10行的内容

```shell
hexdump -C /tmp/memory.dump | grep -10 service
```

> 如果没有安装gdb，也可以使用gcore这样的，它可以直接将这个pid的所有的内存空间都dump出来。

```shell
gcore -o /tmp/core.dump 3678079
```

## 工具篇

如果不是用系统自带的，那么还有这样的工具可以使用。

参考这里<a href="https://book.hacktricks.xyz/forensics/basic-forensic-methodology/memory-dump-analysis/volatility-examples#dump-proc">volatility</a>

这个工具的功能非常强大，可以对系统做各种的分析。不仅是内存方面的，还有sid，token等等。

