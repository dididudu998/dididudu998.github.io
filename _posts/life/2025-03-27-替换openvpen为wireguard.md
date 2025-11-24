---
layout: post
title: 替换openvpn为wireguard
category: life
tags: [openvpn,wireguard]
description: 如果你也像我一样经常工作于Windows和Linux，那么这篇文章值得一看
---

今天用openvpn客户端的时候，提示证书过期了。一直用的都是openvpn的容器，速度还是可以的，反应也挺快的，唯一的问题就是openvpn的流量一直被GFW给断掉的。

试了下将原来的openvpn的容器停掉，重新起一个新的容器，但是试了下，反而报了错了。索性换个新的方式，就选了wireguard，同样的为了方便，也是用容器部署的。
下面是容器的命令：

```shell


  docker run -d \
  --name=wg-easy \
  -e LANG=en \
  -e WG_HOST=x.x.x.x \
  -e PASSWORD_HASH='$2a$12$ZMZ0tyMgTMod2i6iARStLeFk0SikcY6qBhkM3HtvgVkOc7lbOxV4O' \
  -e PORT=51821 \
  -e WG_PORT=51820 \
  -v ~/.wg-easy:/etc/wireguard \
  -p 51820:51820/udp \
  -p 51821:51821/tcp \
  --cap-add=NET_ADMIN \
  --cap-add=SYS_MODULE \
  --sysctl="net.ipv4.conf.all.src_valid_mark=1" \
  --sysctl="net.ipv4.ip_forward=1" \
  --restart unless-stopped \
  ghcr.io/wg-easy/wg-easy
```                          

这里的51821是用于登录管理的端口，这里我没有用secure的模式，所以就是http://x.x.x.x:51821就可以了。用密码登录，这个里面的密码哈希是bcrypt的模式，如果忘了密码的话就在生成一个，然后重启容器就可以。

好的一点是wireguard不管是用wifi还是5g都可以连接上。以后就用这个了好了。

但是v2ray的安卓客户端里面虽然说可以添加wireguard的配置，扫描后却是失败的。
只有下载到了安卓的wireguard的app，用这个扫描就可以了。应该是v2ray和当前的wireguard不匹配或者版本太老了。

