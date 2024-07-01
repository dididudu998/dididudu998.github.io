---
layout: post
title: alias in Windows11 like shell
category: tech
tags:
  - Windows
  - alias
  - doskey
description: 如果你也像我一样经常工作于Windows和Linux，那么这篇文章值得一看
---
从苹果的MacBook Pro换到Windows笔记本了，是华硕的ROG 幻16Air。这机器的硬件还凑合，但是发热有点大了，C面的上部分即使日常办公也非常的烫，而且什么A面的灯光对我来说一点意义都没有。用了Ghelper管理，直接就关了。还有最大的问题就是屏幕，我怎么调都觉得不适应，和MacBook的屏幕简直无法比较。OLED的这种，调太亮了伤眼，调暗了更伤眼。实在是很难受了。

回到正题，在MacBook上用的shell是zsh和fish，都配置了profile，里面加上了很多的alias，这下换到Windows，也想保持这些alias，经过查找，按照下面的方式实现了这个需求。

## 步骤

1. 创建一个bat文件，这里我直接在C盘根目录创建了autoexec.bat文件，内容如下所示：
```dos
@echo off
doskey gitblit=python C:\cursor-codes\在windows上设置gitblit的地址\set-gitblit-ip-in-hosts.py
doskey adguard=C:\AdGuardHome\AdGuardHome.exe
doskey weibo=python D:\MacOS-下载文件\weibocrawl\weibo-crawler\weibo.py
doskey finfo=python C:\my_shell\show-my-specific-files-in-webpage-adv.py
doskey paper=python C:\my_validate\获取arxiv的论文\get_paper.py 
doskey gugong=cd c:\程序原型与设想init\台湾故宫博物馆
doskey daying=cd c:\程序原型与设想init\爬取大英博物馆油画
doskey icon=cd c:\程序原型与设想init\生成固定大小的图片用于icon
doskey tangshi=c:\程序原型与设想init\从数据库中查询唐诗宋词\tangshisongci.exe
doskey syncthing="C:\Program Files\Syncthing\syncthing.exe"
doskey notepad="C:\Program Files\Notepad++\notepad++.exe" $*
doskey myip=c:\my_shell\get_public_ip_windows.cmd
...
```
2. 在注册表中创建对应的启动项
```regedit
Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Command Processor]
"CompletionChar"=dword:00000009
"DefaultColor"=dword:00000000
"EnableExtensions"=dword:00000001
"PathCompletionChar"=dword:00000009
"Autorun"="c:\\autoexec.bat"

```

这样在系统重启后，这个autoexec.bat会被执行，执行后，上面doskey建立的alias就可以在命令行窗口中直接运行了。

