---
layout: post
title: unable mount root fs
category: tech
tags: [linux]
description: 
---

早上SSH连接到Ubuntu的时候，发现连接不上了，想起来，应该是升级的时候有个措施是开启1022端口作为SSH的端口，然后就直接到虚拟机控制台里面进系统查看了配置，开启SSH的22端口后，发现服务总是提示无法重启，莫名的。直接REBOOT了。

然后好戏就来了，提示“VFS： unable mount root fs....",就是进不去了。

下面是解决方法：
```shell

1. 重启，选择"Advanced opons for Ubuntu", 记录下最新的那个内核信息，这里是“6.8.0-11-generic"
2. 选择旧的那个正常的内核，进入系统
3. 创建初始化文件
4. sudo update-initramfs -u -k 6.8.0-11-generic
5. sudo update-grub
6. reboot
```

`initramfs` 是一个被加载到内存中的临时根文件系统（initial RAM file system），用于在 Linux 系统启动过程中进行初始化和准备工作。在 Linux 内核启动时，它会首先加载一个小型的、只读的 `initramfs`，以便在硬件初始化和根文件系统挂载之前提供必要的设备驱动程序、文件系统模块以及其他初始化所需的资源。

`initramfs` 的目的是在引导过程中提供一个轻量级的环境，使得操作系统能够识别并访问到真正的根文件系统所需的设备和驱动程序。一旦真正的根文件系统被挂载，`initramfs` 就会被卸载并释放掉，系统将切换到真正的根文件系统进行后续的初始化和操作。

不知道为什么会把这玩意儿给弄丢了，可能是更新到24.04的时候，没有完成？？

进入系统后，做了下apt-get update，提示open too many files.....

检查当前的状态：

sysctl fs.inotify

直接修改：

sysctl -w fs.inotify.max_user_instances=512

但是上面的修改，重启后会失效。

永久解决方法：

修改 /etc/sysctl.conf，

在文件末尾加上下面的语句：
```shell
fs.inotify.max_queued_events = 16384
fs.inotify.max_user_instances = 512
fs.inotify.max_user_watches = 16384
```

然后运行 sysctl -p 让其生效。

再次运行apt-get update，发现提示没有了。

