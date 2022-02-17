---
layout: post
title: 在Bind上面配置屏蔽广告和恶意站点
category: tech
tags: [Bind,DNS,devops,security,anti-ad]
description: 如果你也像我一样经常工作于Windows和Linux，那么这篇文章值得一
---

## 在Bind上配置屏蔽广告和恶意站点

主要是受了nextdns的启发，其实用adguard很久了，但是没有想过自己去实现这个功能。而受到nextdns的启发是因为它有个很好的个人页面，里面包含了自己想要的东西，数据的统计比较好看。

但是有个问题就是nextdns在国内的性能上面有问题，有时候是无法打开页面，有时候是慢了很多。

但是报表和查询功能是不错的，它的本地app做的不好，和adguard不是一个级别。所以我还是继续使用adguard。

回到正题，下面是在bind里面实现屏蔽广告和恶意站点的功能的步骤。


## 实现过程

1. 在bind的named.conf.options里面的options里增加response-policy那行： 

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

        response-policy {zone "adblock";};

response-policy {zone "adblock";};
...
    
    };
```

2. 在bind的named.conf.options里面增加广告站点的查询日志：

```conf
channel rpzlog {
                file "/var/log/bind/rpzlog" versions unlimited size 10M;
                print-time yes;
                print-category yes;
                print-severity yes;
                severity info;
        };
       
        category rpz { rpzlog; };  
```

3. 在bind的named.conf.default-zone里面添加查询的zone信息

```conf
zone "adblock" {
        type master;
        //file "/etc/bind/adblock.local";
        //file "/etc/bind/mark.rpz";
        file "/etc/bind/urlhaus.rpz";
};
```

4. 添加adguard.txt中的域名信息到urlhaus.rpz中, 这里我写了个脚本，下载adguard.txt数据后再进行转化，转化后附加到urlhaus.rpz文件里，再重启named服务，完成后发邮件给我. 

下面是部分代码：

```python

import requests
import os
import datetime
import smtplib
from email.mime.text import MIMEText
from email.header import Header

#remove old files
os.rename("urlhaus.rpz", "urlhaus.rpz.old")
os.rename("adguard.txt", "adguard.txt.old")
os.rename("myadguard.txt", "myadguard.txt.old")


urlhause=requests.get("https://urlhaus.abuse.ch/downloads/rpz/")
with open("urlhaus.rpz","wb") as f:
    f.write(urlhause.content)

# get adguard.txt from github

file=requests.get("https://anti-ad.net/adguard.txt")
with open("adguard.txt","w") as f:
    f.write(file.text)


os.system("systemctl restart named")
# get os.system("systemctl status named") output

named_status=os.popen("systemctl status named").read()
```


5. 经过测试，可以实现这样的功能

```shell
; (1 server found)
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NXDOMAIN, id: 32101
;; flags: qr rd ra; QUERY: 1, ANSWER: 0, AUTHORITY: 0, ADDITIONAL: 2

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 1232
; COOKIE: d265f88ef4163f1501000000620dd8ce1ba22d15bde64c10 (good)
;; QUESTION SECTION:
;dl.9xu.com.			IN	A

;; ADDITIONAL SECTION:
adblock.		1	IN	SOA	rpz.urlhaus.abuse.ch. hostmaster.urlhaus.abuse.ch. 2202170343 300 1800 604800 30

;; Query time: 917 msec
;; SERVER: 10.214.23.216#53(10.214.23.216) (UDP)
;; WHEN: Thu Feb 17 13:10:37 CST 2022
;; MSG SIZE  rcvd: 141
```

## 总结

在进行合并的时候，经过查询，可以直接在一个数据文本中一$INCLUDE的方式插入文件，这样就不需要做文件合并的动作。

类似这样
```conf
$TTL 30
@ SOA rpz.urlhaus.abuse.ch. hostmaster.urlhaus.abuse.ch. 2202170343 300 1800 604800 30
 NS localhost.
;
; abuse.ch URLhaus Response Policy Zones (RPZ)
; Last updated: 2022-02-17 03:43:06 (UTC)
;
; Terms Of Use: https://urlhaus.abuse.ch/api/
; For questions please contact urlhaus [at] abuse.ch
;
$INCLUDE "/etc/bind/adguard-after-convert.txt"
$INCLUDE "/etc/bind/other-anti-ad-after-convert.txt"

testentry.rpz.urlhaus.abuse.ch CNAME . ; Test entry for testing URLhaus RPZ
1008691.com CNAME . ; Malware download (2020-10-21), see https://urlhaus.abuse.ch/host/1008691.com/
123hpcom.site CNAME . ; Malware download (2021-12-30), see https://urlhaus.abuse.ch/host/123hpcom.site/
1566xueshe.com CNAME . ; Malware download (2022-01-14), see https://urlhaus.abuse.ch/host/1566xueshe.com/
...
```

经过测试，这样也是可以的。

这样反而更简单一些。

然后在查询这些广告站点的时候，可以看到rpzlog里面会有记录。nextdns是将这些客户端的查询，正常的和禁止的都列出来，然后进行标识在网页上，让人看的比较清晰一些。

```log
17-Feb-2022 05:34:40.468 rpz: info: client @0x7f19c4a43b70 100.200.200.50#65359 (tracker.eu.org): rpz QNAME NXDOMAIN rewrite tracker.eu.org/A/IN via tracker.eu.org.adblock
17-Feb-2022 05:34:43.212 rpz: info: client @0x7f19c4a43b70 100.200.200.50#59226 (ads.taboola.com): rpz QNAME NXDOMAIN rewrite ads.taboola.com/A/IN via ads.taboola.com.adblock
17-Feb-2022 05:35:03.369 rpz: info: client @0x7f19c4a44970 100.200.200.50#59904 (clientservices.googleapis.com): rpz QNAME NXDOMAIN rewrite clientservices.googleapis.com/A/IN via clientservices.googleapis.com.adblock
17-Feb-2022 05:35:03.369 rpz: info: client @0x7f19c4a44970 100.200.200.50#59904 
```

所以数据的可视化部分还是比较重要的。



