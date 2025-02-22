---
layout: post
title: powershell一句话脚本更新Windows主机
category: operation
tags: [powershell,scripts,windows]
---

很早之前用powershell写过一个自动更新windows的脚本，也给自己的机器都用上了。而前阵子用c#写了个监控核心服务的命令行，如果核心服务出现停止了，会尝试几次重启，如果重启失败了，就会进行报警。

核心服务停止很多时候就是在系统更新重启后发生的。所以监控系统更新也是个比较重要的事情。

本想着将这个功能添加到现在的c#代码中，但是奈何powershell太好用了，所以还是算了，直接用powershell，现在做个记录。

下面是一句话脚本：
```powershell
Install-WindowsUpdate -MicrosoftUpdate -AcceptAll -AutoReboot -SendReport -SendHistory -PSWUSettings @{SmtpServer="smtp.mysmtpserver.com";From="auto-windowsupdate@mydomain.com";To="myemailaddress";Port=25} -Verbose
```

当然前提是要安装下下面的模块。

```powershell
Install-Module -Name PSWindowsUpdate
```

完整的我就不重复了。这个只是记录。