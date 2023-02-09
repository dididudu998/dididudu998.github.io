---
layout: post
title: 用coredns容器做本地dns
category: tech
tags: [docker,coredns]
description: 
---

# 用coredns容器做本地dns

前几天由于搬迁，网络不稳定，由于需要远程连接，IP地址总是找不到，于是做了个下面的发送IP地址给我的python脚本,用hmailserver做了个smtp服务器。有两台机器是windows的，我用来平时作为Mac的辅助，因为开的浏览器页面太多，Mac屏幕太小，所以阅读类的和邮件类的都在这两台windows上。
    
    ```python
import socket
import smtplib
#import platform

# Get the current IP address
ip = socket.gethostbyname(socket.gethostname())
hostname=socket.gethostname()



# Set up the email information
sender = "user1@mytemp.com"
receiver = "mark@mark.com"
password = "password"

# Build the message
message = "Subject: Current IP Address\n\nThe current IP address is: " + ip +"\n\n"+"the system running on hostname "+hostname

# Send the email
server = smtplib.SMTP("mytemp.com", 25)
#server.starttls()
server.login(sender, password)
server.sendmail(sender, receiver, message)
server.quit()
```

然后想要其他的机器能够通过域名使用邮件smtp服务。就又搞了个coredns容器。

还别说docker的windows desktop版还真是好用。

首先pull镜像

    docker pull coredns/coredns

然后，创建一个文件夹，我的就叫c:\myscripts

在文件夹里面创建个Corefile文件，内容如下：

```conf   
    .:53 {
    forward . 8.8.8.8 9.9.9.9
    log
    errors
}

mytemp.com:53 {
    file /root/mytemp.db
    log
    errors
}
```

然后创建一个mytemp.db文件，内容如下：

```conf

$ORIGIN mytemp.com.  ; designates the start of this zone file in the namespace
$TTL 1h               ; default expiration time of all resource records without their own TTL value
@                 IN  SOA     ns.mytemp.com. mark.mytemp.com. (
                                  2020010510     ; Serial
                                  1d             ; Refresh
                                  2h             ; Retry
                                  4w             ; Expire
                                  1h)            ; Minimum TTL
@                 IN  A       10.212.131.101       ; Local IPv4 address for example.com.
@                 IN  NS      ns.mytemp.com.    ; Name server for example.com.
ns                IN  CNAME   @                  ; Alias for name server (points to example.com.)
mail			  IN  A       10.212.131.101
```

然后就开始运行docker容器

    docker run -d --name coredns -p 53:53/udp -v c:\myscripts:/root coredns/coredns -conf /root/Corefile

再下来，开nslookup，输入下面的命令，就可以看到上面的mytemp.db文件里面的内容了。

    nslookup mytemp.com 127.0.0.1

还有desktop版本的log，可以看到coredns的运行情况。

![coredns](/images/tupian/coredns.jpg)

然后只要其他机器配置coredns这台机器的ip作为dns服务器，就可以在其他机器上，通过域名访问邮件服务器了。

    telnet mytemp.com 25

为以后的邮件投递减少了配置的成本。

## 参考

[coredns](https://coredns.io/)

[manual](https://coredns.io/manual/toc/#configuration)

[custom dns with coredns](https://mac-blog.org.ua/kubernetes-coredns-wildcard-ingress)