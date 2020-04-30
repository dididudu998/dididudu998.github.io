---
layout: post
title: Docker openVPN跨网实践
category: tech
tags: [vpn,security,docker]

---

# 问题

由于企业安全的限制，访问数据中心以及关键基础架构的时候只能在指定的网络进行，普通的网段无法进行访问的操作。

以前试着用反向代理的方式来解决，但是反向代理存在稳定性问题，而且不是所有的情况下都可以正常的使用。

为此，想着用做vpn的方式来实现，当我在普通的网络的时候可以远程接入专用网络做一些操作。

# 步骤

1. 目前我的环境是由一台windows 台式电脑，接在核心网络，但是日常使用的时候是macOS，macos是接入普通网络的，这个普通网络涵盖了整个的楼宇，但是核心网络我只有用Windows电脑才可以。

2. 为此想着在Windows电脑上搭建VPN服务，在选择VPN服务的时候，想到使用开放的openVPN，然后选择使用docker的模式来实现，既不会影响我现在Windows电脑上面的应用，也不妨碍有需要的时候可以用macOS拨入，毕竟拨入的流量非常的小，对于整体的稳定性来说影响要做到比较小，就是小动静，解决问题即可。

3. 安装docker for windows，参看这里[docker on windows wsl](https://nickjanetakis.com/blog/setting-up-docker-for-windows-and-wsl-to-work-flawlessly)

4. 重要的就是暴露出0.0.0.0:2375这个步骤，并且服务自动启动

5. 然后就是给Windows电脑部署开发人员工具，Ubuntu18.04LTS服务器

   1. 直接在Windows10的Microsot Store里面搜索即可。

   2. 然后安装，启动

   3. 启动后，就是安装docker服务

      ![ubuntu18.04](/images/tupian/ubuntu_in_win.jpg)

6. 检验下docker服务是否正常运行，我在部署的时候发现docker服务会存在无法获得链接点的错误，后来怎么弄好的也忘记了，应该可以搜索的到解决方案

7. 然后就是重头戏了，首先感谢大神已经做好的文档和工具，我是先搜索到这里[Set Up a VPN Server With Docker In 5 Minutes](https://medium.com/@gurayy/set-up-a-vpn-server-with-docker-in-5-minutes-a66184882c45)

8. 根据这里，在我的一个独立网段的ubuntu系统里创建好了一个openVPN服务，并且在我的macOS上连接正常。

9. 然后去了github的源，也就是这里[kylemanna](https://github.com/kylemanna/docker-openvpn)

10. 摘抄具体步骤如下，以免github上不去了。
    ```shell
     OVPN_DATA="ovpn-data-example"
     docker volume create --name $OVPN_DATA

    docker run -v $OVPN_DATA:/etc/openvpn --log-driver=none --rm kylemanna/openvpn ovpn_genconfig -u udp://VPN.SERVERNAME.COM
    这里的vpn.servername.com需要替换为自己真正的服务器地址或者域名

    docker run -v $OVPN_DATA:/etc/openvpn --log-driver=none --rm -it kylemanna/openvpn ovpn_initpki    

    开启openvpn服务
    docker run -v $OVPN_DATA:/etc/openvpn -d -p 1194:1194/udp --cap-add=NET_ADMIN kylemanna/openvpn

    创建证书
    docker run -v $OVPN_DATA:/etc/openvpn --log-driver=none --rm -it kylemanna/openvpn easyrsa build-client-full CLIENTNAME nopass

    导出客户端配置文件
    docker run -v $OVPN_DATA:/etc/openvpn --log-driver=none --rm kylemanna/openvpn ovpn_getclient CLIENTNAME > CLIENTNAME.ovpn```


11. 在已经运转正常的Windows10里面的Ubuntu18里面gitclone这个库，按照操作文档执行即可。

12. 为了可以让这个容器可以在Ubuntu启动后自动重启，可以使用

    ```bash
    docker update --restart=always container_name
    ```

13. 我这里因为专网前面还有一个路由器，所以做了个一个防火墙规则和端口转发的规则才可以。

14. 也就是普通的网络要访问UDP 3000端口，我先得设定允许inbound的访问到我的路由器所谓的公网的IP的UDP3000端口，然后还要将这个公网的UDP 3000端口转发给我现在的Windows电脑的IP的UDP 3000上面，这样才是一条完整的通路。

15. openVPN的客户端用的是TunnelBlick这个，上面的文档有提到。忘了在哪里下载的，搜索一些也就是了。

16. 总之是实现了。速度还是不错的，而且还是挺稳定的。

![tunnelblick](/images/tupian/tunnelblick.jpg)

16. <b>补充</b>

    1. 当将生成的profile文件，也就是.ovpn文件，是同一个用户的时候，导入openVPN客户端，在这里同时为user1账户时，发现当手机的VPN连接后，电脑的VPN就会中断。
    2. 为此，创建另外一个账户user2来生成新的配置文件，给到不同的设备。
    3. 配置方法和文档中提到的相同

    ```bash
    docker run -v $vpndata:/etc/openvpn --rm -it kylemanna/openvpn easyrsa build-client-full user2 nopass
    
    
    docker run -v $vpndata:/etc/openvpn --rm kylemanna/openvpn ovpn_getclient user2 >user2.ovpn
    ```

17. 这样给除了macOS设备的其他设备使用user2这个配置就可以互相不影响了。