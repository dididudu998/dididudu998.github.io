---
layout: post
title: "Windows安装powercli并监控是否有新的虚拟机生成"
category: tech
tags: [git,devops]
description: 如果你也像我一样经常工作于Windows和Linux，那么这篇文章值得一
---

# 安装powercli

这个感觉是非常简单的，在管理员模式下，进入powershell，输入 install-module vmware.powercli

但是可惜报错，提示无法解析powershellgallary.microsoft.com，域名解析是没有问题的，出问题的原因在于请求的加密方式，需要在powershell下面输入下面的命令，调整安全请求的协议为TLS1.2.

```powershell

  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 
```

然后再运行

```powershell
install-module vmware.powercli
  ```

就可以正常安装了。

然后一定要记得，要import才可以使用哦。

```powershell
Import-Module VMware.PowerCLI
```

以上整个的安装过程结束。

# 测试监控脚本

```powershell
$vCenterServer = "myvc"    #Can also be a VMware host
$Days = 1
$Mail = @{
    To = "mark@example.com"
    From = "new-vm-created-notify@shanghai.nyu.edu"
    Subject = "new vm created notify"
    SMTPServer = "smtp.mark.com"
}

$Header = @"
<style>
TABLE {border-width: 1px;border-style: solid;border-color: black;border-collapse: collapse;}
TH {border-width: 1px;padding: 3px;border-style: solid;border-color: black;background-color: #6495ED;}
TD {border-width: 1px;padding: 3px;border-style: solid;border-color: black;}
</style>
"@

$pd=get-content "./password.txt" |convertto-SecureString
$mycre=new-object system.management.automation.PSCredential("mark@vsphere.local",$pd)
connect-viserver $vCenterServer -credential $mycre| Out-Null
$Events = Get-VIEvent -Start (Get-Date).AddDays(-$Days) -MaxSamples 100000 | Where {$_.Gettype().Name-eq "VmCreatedEvent" } | Sort CreatedTime -Descending | Select CreatedTime, UserName,FullformattedMessage #linux环境下，用Sort-Object替换Sort
If ($Events)
{   $Body = $Events | ConvertTo-HTML -PreContent "New VM's have been created:<br>" -Head $Header | Out-String
}
Else
{   $Body = "No VM's have been created today: $(Get-Date) in vCenter $vCenterServer"
}

Send-MailMessage @Mail -Body $Body -BodyAsHtml 
```
