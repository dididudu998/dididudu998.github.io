---
layout:post
title:用powershell导出ova
category:tech
tags:[ova,powershll,vmare]
description:闲的

---



# 问题



这垃圾的VMware现在全部搞web来访问，垃圾的flash总是要用，反应慢的要死。

今天早上想要导出个虚拟机，简直是耗费了要一个小时，折腾死了。

我就想问搞VMware Vcenter客户端管理的项目经理是吃屎了吗，非要用web来访问和控制，而且每一个版本的升级总会有bug出现。

垃圾的要死。

# 解决

骂归骂，还是要解决问题的。

想着搞ssh直接从存储库里面拉出来好了。但是那个出来得直接是vmdk文件。我想要一个ovf的，以后可以从控制台导入的。这个方法放弃。

后来搜到还是搞vmware的powershell。

最终还是要感谢微软，现在win10的powershell集合了vmware 的powercli的部分命令。

废话不说，干就是了。

```powershell
connect-viserver -server vcenter_ip -user username -pass password 

get-vm vm_name | Export-VApp -Destination "f:\"
```

等待结束。

我只能说vmware如果以后还是web的客户端管理模式，我以后就只用接口了，这垃圾的web console。

