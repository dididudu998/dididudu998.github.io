---
layout: post
title: 又搞一次elasticsearch
category: tech
tags: [java,elasticsearch,logstash,kibana]
description: 闲的

---

# 又搞一次elasticsearch

发现这周又搞一次的事情还真是多，先是搞了一次对DHCP的监控，搞了一阵发现原来在一个月前搞过了，后来因为并不实用就放弃了，这是彻底的晕头了。浪费时间。

再下来，就是大概五六年前搞了elasticsearch+kibana+logstash+syslog的用于监控所有服务器事件日志的东西，这套系统其实觉得最有用的一次是有几个人的账户，莫名的总是会被锁定，最后到我这里来，我就用这个给搜索了下，发现他们都是把自己的账户绑定到服务了，但是在自己的电脑上改了密码，这个绑定的服务上面没有更新，导致不断的重试，最后被锁。还有就是审计的时候比较有用，查查谁的密码过期了，谁的账户乱登机器之类的小事情。

过了这么些年，这边搞splunk，确实是有钱了就可以整。这个没话说。

但是实际上真的大型企业用这个的还是比较铺张，毕竟这个东西不自由啊。

又想起了elasticsearch这套玩意儿。不过我不再想去监控这些日志了。

我监控下网络情况。

# 过程

1. 先是开通一台CentOS7的虚拟机，双网卡，一个用来配置管理，一个用来接收mirror过来的数据包用于分析
2. 接着配置mirror，在vCenter里面将一个vSwitch的一个VLAN引入刚才开的虚拟机的对应的网卡的PortID
3. 看文档，来安装下packetbeat这个，还要记得安装一些依赖

## packetbeat部分

1. 默认安装后packetbeat在/usr/share/packetbeat这个文件夹

2. 配置文件在 /etc/packetbeat/packetbeat.yml这里

3. 修改的部分包括 要监听那块网卡，我的有明确的，所以就是那块mirror的，如果没有特别的就保持原样即可，什么都不需要改

4. 但是要记得是在ELK都实现后，默认的kibana中是没有dashboard的，为了有个现成的dashboard，只需要运行下packetbeat setup，它就自动的下载对应的dashboard json文件了，省事。

5. 启动服务的时候这样

   ```bash
   packetbeat -e -c /etc/packetbeat/packetbeat.yml
   ```

6. 然后应该能看到一些翻滚过来的数据

## 配置java环境

1. 我不得不说我很烦JAVA环境，但是配置还是有必要记一下

   ```bash
   alternatives --config java 
   ```

   用这个获取java的路径，前提是你装过了yum install java。

   或者按照下面的方式，获得最终的路径

   ```bash
   which java
   ls -lrt $(which java)
   ls -lrt $(上一步的结果)
   ```

2. 找到路径后就可以往配置文件(~/.bashrc)里面写了

   比如找到了这个/usr/lib/jvm/java-1.8.x-openjdk-1.8.x/jre/bin/java

   ```bash
   export JAVA_HOME=/usr/lib/jvm/java-1.8.x-openjdk-1.8.x
   export JRE_HOME=$JAVA_HOME/jre
   export CLASSPATH=$JAVA_HOME/lib:$JRE_HOME/lib:$CLASSPATH
   export PATH=$JAVA_HOME/bin:$JRE_HOME/bin:$PATH
   ```

3. 写完后保存，然后source一下更新即可。

## ELK部分

1. 按照步骤来，整个的结构式，packetbeat分析数据包，然后将数据包的情况发送给logstash，logstash经过筛选，再发送给elasticsearch，然后kibana用来进行展示。

2. 建议ELK这三个都用tgz的方式下载解压来安装，用yum的安装到时候会发现路径很烦。

3. 因为elasticicsearch不让用root账户，所以还得创建一个普通账户

4. 创建完后，还需要chown -R 普通账户 elasticsearch文件夹 赋权一下。

5. 我碰到的问题是，elasticsearch的启动怎么都不认java环境。后来直接修改elasticsearch的env运行文件才好，因为它默认里面少了那个jre的子目录路径，真是折腾

6. elasticsearch没啥好弄的。

   1. 到logstash了，这个主要是配置一下logstash.conf文件,其实什么都没配置。就是说我接受5044端口发过来的东西，然后我将这些东西发送给elasticsearch，而elasticsearch是本地机的9200端口

   ```bash
   input {
     beats {
       port => 5044
     }
   }
   
   output {
     if [source_ip] not in ['10.200.100.100','127.0.0.1'] {
           elasticsearch {
                   hosts => ["http://localhost:9200"]
                   index => "%{[@metadata][beat]}-%{[@metadata][version]}-%{+YYYY.MM.dd}"
       #user => "elastic"
       #password => "changeme"
     }
    }
   }
   ```

7. 现在试着启动packetbeat，logstash，elasticsearch

8. logstash启动的时候 ./bin/logstash -f ./config/logstash

9. elasticsearch要用普通用户 ./bin/elasticsearch

10. 如果没事，继续kibana

11. kibana有个/etc/kibana/kibana.yml的配置文件，我主要是修改下里面的server.host为0.0.0.0，这样外面也好访问

12. 启动kibana，如果用root的话，会提示，照着加参数就好了

13. 用netstat -nltp看看端口是不是都ok了

14. 如果什么9200,5601,5044,9300,9600都有了，那么就开始去开通防火墙，让外面能访问kibana的5601端口即可。

15. 因为本身就有nginx的机器，就做了个反向代理。

    ![kibana](images/tupian/kibana.jpg)

