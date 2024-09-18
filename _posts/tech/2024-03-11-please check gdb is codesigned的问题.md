---
layout: post
title: MacBook下gdb不能使用的问题
category: tech
tags: [debug,macos,dev]
description: 如果你也像我一样经常工作于Windows和Linux，那么这篇文章值得一看
---

今天在尝试用gdb对一个小程序进行检查的时候，发现提示这个
```shell
Unable to find Mach task port for process-id 62901: (os/kern) failure (0x5).
 (please check gdb is codesigned - see taskgated(8))
(gdb) exit
```

翻了下搜索引擎，找到这个解决方法，具体的含义不知道。只是照猫画虎后，gdb可以用了。


先创建一个文件 gdb-entitlement.xml，内容为:

<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.cs.debugger</key>
    <true/>
</dict>
</plist>
</pre>


再执行:
codesign --entitlements gdb-entitlement.xml -fs gdb-cert $(which gdb)


文章地址为：https://sourceware.org/gdb/wiki/PermissionsDarwin


