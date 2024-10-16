---
layout: post
title: 在Windows sandbox里使用宿主机的代理服务器联网
category: tech
tags:
  - Windows
  - sandbox
  - 代理服务器
description: 如果你也像我一样经常工作于Windows和Linux，那么这篇文章值得一看
---

主要是为了安全的考虑，还有安装windows sandbox的原因是：
1.  现在用的笔记本是windows的
2. 虽然也装了vmware workstation，但是单装一个OS虚拟机也要10个GB左右，而我只需要浏览器就可以，所以没必要用虚拟机
3.  windows sandbox装起来很快，不费事

运行，optionalfeatures，选择windows sandbox，然后安装，需要重启，重启完成后，就是安装成功了。

由于我本地的代理服务器端口是7897，先开启它的局域网代理模式，允许sandbox使用的default switch使用该端口。

参考了这篇文章：[Hyper-V之二:Sandbox除错Windows 沙盒的各种 bug ,比如傻傻的复制本地网络导致无法联网,本来应该 - 掘金 (juejin.cn)](https://juejin.cn/post/7362057701792727076)

然后创建一个mysandbox.wsb文件，内容如下：
```wsb
<Configuration>
  <MappedFolders>
    <MappedFolder>
      <HostFolder>D:\my-sandbox-folder</HostFolder>
      <SandboxFolder>C:\Users\WDAGUtilityAccount\Downloads</SandboxFolder>
      <ReadOnly>false</ReadOnly>
    </MappedFolder>
  </MappedFolders>
  <LogonCommand>
    <Command>C:\Users\WDAGUtilityAccount\Downloads\start.bat</Command>
  </LogonCommand>
</Configuration>
```

这个文件的意思是：我要将我宿主机的D:\my-sandbox-folder目录映射到sandbox的C:\Users\WDAGUtilityAccount\Downloads目录。然后我还要运行一个登录命令，这个登录命令使用的文件是：C:\Users\WDAGUtilityAccount\Downloads\start.bat。

其实就是在宿主机的D:\my-sandbox-folder下面创建一个start.bat文件，文件内容如下：
```bat
for /f "tokens=13" %%i in ('ipconfig ^| findstr /i "Gateway"') do set ip=%%i
netsh interface portproxy add v4tov4 listenaddress=localhost listenport=7897 connectaddress=%ip% connectport=7897
```

上面的批处理命令的意思解释如下：

1. findstr /i "Gateway" 用于筛选出包含“Gateway”这个关键词的行，/i 表示不区分大小写
2. for /f "tokens=13" %%i in (...) 用于处理命令输出。tokens=13 表示提取输出的第13个字段，这通常是默认网关的IP地址。
3. set ip=%%i 将提取到的IP地址存储在环境变量 ip 中。
4. netsh interface portproxy add v4tov4 是用来添加一个IPv4到IPv4的端口代理。
5. listenaddress=localhost 指定代理监听在本地地址
6. `listenport=7897` 指定监听的端口号为7897。
7. connectaddress=%ip% 使用之前提取的默认网关IP地址作为连接地址。
8. `connectport=7897` 指定连接的目标端口为7897。

整个脚本的作用是设置一个端口代理，使得所有发送到本地7897端口的流量都被转发到默认网关的7897端口。

当你看到sandbox的网络代理的时候发现是127.0.0.1:7897,但是实际上是发送到sandbox的网关的7897端口去了，也就是我们宿主机的代理端口上去了。

然后最重要的是打开宿主机的防火墙，创建一条incoming的规则，允许到宿主机的TCP 7897端口访问。

好了。现在返回到最早创建的mysandbox.wsb，双击它，就可以启动我们设定的沙盒了。

启动后，打开沙盒里面的edge浏览器，访问下站点，到代理服务器上看看日志，就能看到确实是通过代理访问出去了。

至此，完成了。




