---
title: "检查CVE的安装情况"
published: 2026-07-02
draft: false
category: "tech"
tags: ["CVE", "安全", "系统"]
---

整理下关于CVE是否已经安装的检查方式。

由于公司现在全面部署了XDR+InsightVM这样的终端安全软件。经常会出现误报的情况，然后不懂技术的，就是只看着数据条目发邮件要求整改。这令我觉得非常的缺乏效率，而且好几个人可能为了填充其工作量的不足，会将一件事情通过2个人在不同的时间进行传达，完全是没有任何的意义。为了减少他们的骚扰，我整理下，从技术手段让这些人能安静一点。

## Redhat篇

检查是否安装了

```bash
dnf updateinfo list --cve CVE-2025-38352
```

如果输出为空，基本上是已经安装了。

如果要确认，可以使用下面的指令

```bash

rpm -q --changelog kernel | grep -i "CVE-2025-38352"
- posix-cpu-timers: fix race between handle_posix_cpu_timers() and posix_cpu_timer_del() (CKI Backport Bot) [RHEL-112783] {CVE-2025-38352}
- posix-cpu-timers: fix race between handle_posix_cpu_timers() and posix_cpu_timer_del() (CKI Backport Bot) [RHEL-112783] {CVE-2025-38352}
- posix-cpu-timers: fix race between handle_posix_cpu_timers() and posix_cpu_timer_del() (CKI Backport Bot) [RHEL-112783] {CVE-2025-38352}

```

检查kernel的状态

```bash
dnf history list kernel
```
通过列出的序号，可以检查详细的信息

```bash

dnf history info 90
Updating Subscription Management repositories.
Transaction ID : 90
Begin time     : Mon 15 Jun 2026 02:50:33 PM CST
Begin rpmdb    : aa24063c07e3c3aa35547dc07497fee7d344346022fa6dcd5dbd4587adf75915
End time       : Mon 15 Jun 2026 02:51:44 PM CST (71 seconds)
End rpmdb      : 20db09ccaa7e23a6b725a299df374992e6abebe402ad5fa354449b1b5884708b
User           : root <root>
Return-Code    : Success
Releasever     : 9
Command Line   : update
Persistence    : Persist
Comment        : 
Packages Altered:
    Install       kernel-5.14.0-687.15.1.el9_8.x86_64              @rhel-9-for-x86_64-baseos-rpms
    Install       kernel-core-5.14.0-687.15.1.el9_8.x86_64         @rhel-9-for-x86_64-baseos-rpms
    Install       kernel-modules-5.14.0-687.15.1.el9_8.x86_64      @rhel-9-for-x86_64-baseos-rpms
    Install       kernel-modules-core-5.14.0-687.15.1.el9_8.x86_64 @rhel-9-for-x86_64-baseos-rpms
    Upgrade       bind-libs-32:9.16.23-40.el9_8.2.x86_64           @rhel-9-for-x86_64-appstream-rpms
    Upgraded      bind-libs-32:9.16.23-40.el9_8.1.x86_64           @@System

```

还可以用rpm来查

```bash
rpm -qa --last | grep kernel

```

## Ubuntu

1. 通过检查变更日志来看
```bash

apt-changelog openssl | grep -i "CVE-2023-3817"
```

2. 通过工具来扫描

-  安装工具
sudo apt-get update && sudo apt-get install debsecan -y

-  全盘扫描未修复的 CVE（输出会很长）
debsecan

-  精准查找某个特定的 CVE 是否还存在于系统中
debsecan | grep "CVE-2023-41993"

如果命令有输出，说明确实存在该漏洞。如果没有输出，说明已经补好漏洞或者系统并不存在这样的漏洞


## 容器

如果是容器存在漏洞，则可以按照下面的方式进行检查

安装trivy，然后扫描对应的容器镜像
```bash

trivy image my-image:latest
```
或者安装grype，扫描本地目录
```bash

grype dir:/
```

只要这些工具的扫描报告中不存在对应的CVE编号，就说明不存在该漏洞了。