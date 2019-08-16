---
layout: post
title: Bind-Dhcpd-DDNS
category: tech
tags: [Bind,DDNS,DHCPD]

---

 # 问题

前阵子做了个webdns的东西，用来给生产和测试环境的机器注册dns的。

但是测试环境的dns我觉得还是自动的来比较好，毕竟我在做测试机器部署的时候已经可以定义机器名了，部署完成后，直接就可以机器名+测试域名的方式进行访问，岂不方便。

当然还是有人需要手动注册的，所以这个webdns的页面还是要留着，前几天就有人要做类似load balance的需求，一个ip对应多个域名的。

最终结果两种，一种就是保持原样，注册用webdns实现。还有就是webdns不用了，所有注册都自动。因为我没解决webdns实现的时候会修改dns文件，但是修改后，（即使做了改进，不会出现语法错误的提示而导致dns服务中断）slave dns服务器不能同步。。。。，找了大半天也没有解决方案，放弃了。

# 解决

看了下DDNS的部分，刚好Bind和DHCP服务器都在我的控制下，说干就干。

要修改的包括两个服务器的配置，一个是Bind，也就是DNS服务器，这里是/etc/named.conf 文件；一个是DHCP服务器，这里/etc/dhcp/dhcpd.conf

下面贴出配置：

- DNS部分

  - 其中的rndc.key是可以生成的

    ```bash
    rndc-confgen
    ```

  - named.conf文件部分

```bash
        zone "test.example.com" IN {
        type master;
        file "test.example.com.zone";
//      allow-update { none; };
        allow-update { key rndc-key; };
        allow-transfer {10.214.8.24; 10.214.8.25;};
        };

include "/etc/named.root.key";
include "/etc/named.rfc1912.zones";
include "/etc/rndc.key";
};
```

- DHCP部分

  ```bash
  option domain-name "test.example.com";
  ddns-update-style interim;
  update-static-leases on;
  one-lease-per-client on;
   
   //这里的rndc-key要和dns服务器上使用的一样，否则通讯失败
  key rndc-key {  
          algorithm hmac-md5;
          secret "qASUM2NKt7udawe10021==";
  }
  
  zone test.example.com. {
          primary 10.214.x.x;
          key rndc-key;   
  }
  
  subnet 10.214.x.0 netmask 255.255.254.0 {
  	range .....;
  	option routers 10.214.x.1;
  	
  	allow client-updates;
  	update-optimization off;
  	update-conflict-detection on;
  	
  	group {
  	 ....... //这些是绑定mac地址的机器，固定IP
  	}
  }
  ```

  

弄好了上面两个，重启dhcp服务和named服务就可以了。slave DNS的配置和其他的slave zone的相似。

需要说明的是：

1. 当*.jnl文件不能创建的时候，是权限问题，用chmod 775 /var/named后重启下named服务一般就好了

2. 服务都启动后，要等待一会儿，只要jnl生成成功，zone文件就会及时更新的。不放心可以看看/var/log/message

3. dhcpd.conf文件中的domain-name必须写对

4. 检查zone文件，就会有A记录和TXT记录以及$ORIGIN TTL值的新机器进来

5. update-optimization 解释如下：

   ```bash
   update-static-leases flag;
   
   	    The	update-static-leases flag, if enabled, causes the DHCP	server
   	    to	do  DNS	 updates  for  clients even if those clients are being
   	    assigned their IP address using a fixed-address statement  -  that
   	    is,	the client is being given a static assignment.	 This can only
   	    work with the interim DNS update scheme.   It is  not  recommended
   	    because  the  DHCP	server	has no way to tell that	the update has
   	    been done, and therefore will not delete the record	when it	is not
   	    in	use.	Also, the server must attempt the update each time the
   	    client renews its lease, which could have  a  significant  perfor-
   	    mance  impact in environments that place heavy demands on the DHCP
   	    server.
   ```

6. bind系统自生成的文件，如果手动做了修改，很容易导致dns服务出错，提示zone文件语法错误，无法loaded。

7. 折腾了半天，用python对文件进行内容的替换，不影响结构，也不影响dns服务的情况下，却导致slave dns的zone文件不能更新，提示“ refresh: unexpected rcode (SERVFAIL) from master ”。Bind对于少量的DNS管理是比较OK的，但是大型的DNS的话，还是建议使用后台有数据库做数据管理的比较好一些。

8. 准备有时间的话，将bind换成powerdns之类的dns服务器

