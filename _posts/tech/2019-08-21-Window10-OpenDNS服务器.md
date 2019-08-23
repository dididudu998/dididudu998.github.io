---
layout: post
title: Win10下设定OpenVPN服务器
category: tech
tags: [vpn,security,Windows]
---

# 问题

大概上周的时候在公司，为了避开跨网管理的问题，部署了基于Docker的openvpn服务器。运行起来还是很好的。

但是在屋里的旧电脑奔腾双核4GB内存Windows10上面跑docker感觉很不方便，主要还是现在的Docker for Windows和Windows内置的defender有点冲突，安装的时候如果不把defender关闭，则会安装失败。

想了下，既然openVPN有原生的for Windows的版本，为什么不用这个呢。

说干就干。至于怎么在家用路由器上面开端口映射，以及怎么在Windows上面允许inbound连接就不提了，自己做一下，很快的。

# 过程

主要的参考文档是这个，可以说写的超级详细，国内也有。不过比较下来，还是这个好很多。

链接这里：[Wiki Knowledge OpenVPN on Windows](https://wiki.teltonika.lt/view/OpenVPN_server_on_Windows)

我还是简单提一下比较好，以免到时候这个页面因为某些原因不可访问了。

1. 下载openVPN for Windows的安装包，安装的时候将easy-rsa给勾上，用于下面生成证书私钥之类的

2. 命令行下进入easy-rsa目录，运行下面的指令

   > init-config
   >
   > vars
   >
   > clean-all

3. 下面就是申请证书

   > //创建ca，里面的commonName需要填好自己从外面访问过来的FQDN，我是申请的DDNS域名，所以填这个域名就好
   >
   > build-ca

   > //创建服务器证书，输入个比较好记的comon Name
   >
   > build-key-server server

   > //创建客户端证书
   >
   > build-key user1

   		> //创建tls加密用的密码
   		>
   		> build-dh

4. 然后将ca.crt,server.crt,server.key从easy-ras的key文件夹下拷贝到config目录下

5. 从sample-config中拷贝server.ovpn也到config这个目录下，做些调整。为了增加安全性，我还用上了HMAC firewall，所以需要加上那个ta.key，ta.key这么创建：

   > openvpn —genkey —secret ta.key
   >
   > //创建完成后，也一样的拷贝到config目录下，并在server.ovpn中添加一下

6. > ```
   > ca "C:\\Program Files\\OpenVPN\\config\\ca.crt"
   > cert "C:\\Program Files\\OpenVPN\\config\\server.crt"
   > key "C:\\Program Files\\OpenVPN\\config\\server.key"
   > dh "C:\\Program Files\\OpenVPN\\config\\dh2048.pem"
   > tls-auth "C:\\Program Files\\OpenVPN\\config\\ta.key" 0 # This file is secret
   > ```

7. 剩下的依次类推

8. 测试下，服务端用gui工具能不能连接成功，如果连接成功了，就开始做客户端的ovpn文件

9. 客户端的ovpn文件，模版如下所示：

   > ```bash
   > client
   > nobind
   > dev tun
   > remote-cert-tls server
   > remote myddns.domain.com 8294 udp4
   > resolv-retry infinite
   > keepalive 5 10
   > persist-key
   > persist-tun
   > verb 3
   > <ca>
   > -----BEGIN CERTIFICATE-----
   > 
   > -----END CERTIFICATE-----
   > </ca>
   > 
   > <cert>
   > -----BEGIN CERTIFICATE-----
   > 《这里是user1.
   > -----END CERTIFICATE-----
   > </cert>
   > 
   > <key>
   > -----BEGIN PRIVATE KEY-----
   > 《这里是user1.key》
   > -----END PRIVATE KEY-----
   > </key>
   > 
   > key-direction 1
   > 154 <tls-auth>
   > 155 #
   > 156 # 2048 bit OpenVPN static key
   > 157 #
   > 158 -----BEGIN OpenVPN Static key V1-----
   >   《这里加上ta.key的内容》
   > 175 -----END OpenVPN Static key V1-----
   > 176 </tls-auth>
   > ```

#  重头戏

会发现，当你的客户端的配置文件和服务器端的文件都好的，而且能互相连接上，日志也没有问题的时候，你的客户端却无法访问internet。

原理就不说了，现在说怎么做：参看这里[fix internet connect](https://forums.openvpn.net/viewtopic.php?t=20765), 我直接摘抄在下面了。

> Using this settings on Windows 10 :
> *Start -> Right-click My Computer -> Manage*
>
> *Services*
>
> *Right-click Routing and Remote Access -> Properties -> AutomaticRight-click Routing and Remote Access -> Start*
>
> *Next:Control Panel*
>
> *Network and Sharing Center*
>
> *Local Area Connection *
>
> *Properties*
>
> *Sharing*
>
> *Tick the box "Allow other network users to connect through this computer's Internet connection"*
>
> *From the drop-down list select "Local Area Connection 2", or whatever is the connection name of your TAP server connection.*
>
> *regedit*
>
> *Key: HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters*
>
> *Value: IPEnableRouter*
>
> *Type: REG_DWORD*
>
> *Data: 0x00000001 (1)*
>
> It Works !!!! 

然后就可以愉快的上网了，做个tracerout发现，客户端先走到服务端的网关，然后再出去。说明整个的VPN实现了。

