---
layout: post
title: 在Ubuntu上面启用Bind的DNS-over-HTTPS
category: tech
tags: [Bind,DNS,devops,security]
description: 如果你也像我一样经常工作于Windows和Linux，那么这篇文章值得一
---

# 在Ubuntu20.04上安装Bind 9.18 启用DoH

DoH的意义在于将域名解析的请求由原来的网络层直接提升到了浏览器应用层。

网络层的问题是DoT使用853的端口，很容易被封锁，而DoH使用443端口，一般不会被封锁。

在进行域名查询的时候，浏览器和安全域名服务提供者之间是没有第三方的，第三方无法获取浏览器想要查询的域名。只有自己和安全浏览器提供者之间知道你访问的主站是什么，至于具体访问了什么页面也是不可知的。

但是DoH的速度上面并不见的比普通的UDP/TCP 53的DNS查询快。

只是这种查询在浏览器的多线程的配合下，加载复杂页面的时候，可能有突然一起加载完成的情况，感觉比较快。



## 过程

1. sudo add-apt-repository ppa:isc/bind-dev
2. sudo apt-get update
3. sudo apt install bind9
4. configure /etc/bind/named.conf.options

```conf
tls mytls{
                key-file "/etc/bind/private.pem";
                cert-file "/etc/bind/cert.pem";
        };

http local-http-server {
        endpoints { "/dns-query"; };
        };

options {
        directory "/var/cache/bind";

        // If there is a firewall between you and nameservers you want
        // to talk to, you may need to fix the firewall to allow multiple
        // ports to talk.  See http://www.kb.cert.org/vuls/id/800113

        // If your ISP provided one or more IP addresses for stable
        // nameservers, you probably want to use them as forwarders.
        // Uncomment the following block, and insert the addresses replacing
        // the all-0's placeholder.

        // forwarders {
        //      1.1.1.1;
        //      8.8.8.8;
        //      9.9.9.9;
        // };

        //========================================================================
        // If BIND logs error messages about the root key being expired,
        // you will need to update your keys.  See https://www.isc.org/bind-keys
        //========================================================================
        recursion yes;
        allow-recursion { any; };
        listen-on { 10.214.23.216; };
        listen-on port 443 tls mytls http local-http-server { 10.214.23.216; };
        //listen-on-v6 port 443 tls mytls http local-http-server { any; };
        //listen-on-v6 { any; };
        dnssec-validation auto;
};

logging {

        channel transfers {
            file "/var/log/bind/transfers" versions 3 size 10M;
            print-time yes;
            severity info;
        };
        channel notify {
           file "/var/log/bind/notify" versions 3 size 10M;
            print-time yes;
            severity info;
        };
        channel dnssec {
            file "/var/log/bind/dnssec" versions 3 size 10M;
            print-time yes;
            severity info;
        };
        channel query {
            file "/var/log/bind/query" versions 5 size 10M;
            print-time yes;
            severity info;
        };
        channel general {
            file "/var/log/bind/general" versions 3 size 10M;
        print-time yes;
        severity info;
        };
    channel slog {
        syslog security;
        severity info;
    };
        category xfer-out { transfers; slog; };
        category xfer-in { transfers; slog; };
        category notify { notify; };

        category lame-servers { general; };
        category config { general; };
        category default { general; };
        category security { general; slog; };
        category dnssec { dnssec; };

        category queries { query; };
};


```

5. 检查和启动服务

```shell
named-checkconf /etc/bind/named.conf
sudo systemctl restart bind9
sudo systemctl enable bind9
sudo systemctl status bind9
journalctl -xe  如果有错误信息的话，用这个检查。
```

6. 对bind log文件夹设定权限

```shell
sudo mkdir -p /var/log/bind
sudo chown bind/var/log/bind
```

7. 对apparmor进行设定

```shell
vi /etc/apparmor.d/usr.sbin.named
# 增加以下内容
  /etc/bind/** r,
  /var/lib/bind/** rw,
  /var/lib/bind/ rw,
  /var/cache/bind/** lrw,
  /var/cache/bind/ rw,
  /var/log/bind/** rw,
  /var/log/bind/ rw,
```

8. restart apparmor 服务 systemctl restart apparmor
9. 检查https查询： dig +https @dohserver.example.cn www.baidu.com A
10. 检查query log文件： cat /var/log/bind/query
11. 配置浏览器安全dns： https://dohserver.example.cn/dns-query
12. 测试是否可以正常访问网站
13. 检查query log是否正常

## 总结

这里的证书和私钥是已有的，不需要自己生成。

服务器使用的是Ubuntu20.04，安装了bind9，使用了apparmor。

服务器的主机名为dohserver.example.cn，域名为example.cn。

因为这个example.cn的域名由我管理，所以设定了dohserver.example.cn的A记录为10.214.23.216，内网可以解析即可。

如果使用bind的src进行安装的话，需要的依赖必须装好，这个比较烦。但是目前centos还没有相应的package，所以先放着吧。

```
root@dohserver:/var/log/bind# named -v
BIND 9.18.0-2+ubuntu20.04.1+isc+1-Ubuntu (Stable Release) <id:>
```



