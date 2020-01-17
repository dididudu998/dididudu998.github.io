---
layout: post
title: vCenter 6.7的postgresql数据库
category: 学习
tags: [blog,数据库,postgresql]
---


# 设想

原始的设想是想要做一个可视化的关于虚拟机数量的dashboard。
如果用遍历的方式，感觉有点low，就想着直接从vmware的数据库上面找找，希望能更直接的获得点信息。

但是现在的vcenter不是以前的用mssql的了，用的PostgreSQL，我想要搞出数据来，需要两个工具。

一个就是notepad++,还有一个就是pgadmin。

安装这两个软件后，进入直接的操作部分。

# 操作

- 用notepad++打开这个文件 c:\programdata\vmware\vcenterserver\cfg\vmware-vpx\vcdb.properties
- 获得pgadmin连接数据库需要的条目
  - database name: VCDB
  - username: vc
  - password: ......
  - url: jdbc:postgresql://server:5432/VCDB
- 第一次打开pgadmin的时候，要求输入一个master密码用于保护以后建立的连接信息
  - 这个密码仅仅是为了保护以后的数据，和连接服务器的信息无关
- 连接成功后，就可以看到VCDB的数据库信息
![pgadmin.jpg](/images/tupian/pgadmin.jpg)
- 查询数据库table的语句和sql的一样
  | Tables                 | Comment                          |
  | -----------------------|:--------------------------------:|
  | select * from vpx_entity| （用于query所有的对象）<br>
  |select * from vpx_entity where type_id=0 |（这个用于query所有的虚拟机）  
  |select * from vpx_event_33 |(查询所有的事件日志，从第33表开始)  
  |select * from vpx_event_arg_33 |(查询event对应的参数信息，应该是vmware api的接口模式，我这里用了pyvmomi和golang的http)  
  |select * from vpx_ext |(查询vmware vcenter注册的其他vmware服务，包括vcops，nsx等的版本好，和指纹信息，以及心跳时间)  
  | select * from vpx_ext_client |(查询扩展服务的url地址，版本号，以及厂商信息等)
  | select * from vpx_host |(查询所有的物理主机信息)
  | select * from vpx_host_cpu |(查询host的cpu数量以及cpu信息)
  | select * from vpx_host_cpu_thread |(查询主机所有的cpu的线程数)
  | select * from vpx_ip_address |(查询所有的IP地址记录，包括ipv4和ipv6)
  | select * from vpx_network |(查询所有的网络名称，包括动态和静态的VLAN名称)
  | select * from vpx_snapshot |(查询所有做过的snapshot的信息)  
  | select * from vpx_uptime | 查询vcenter机器的开机和重启记录，非常的详细
  | select * from vpx_vm | 查询vm的一些信息，包括dns名称和ip地址以及存储位置等


  - <font color=red><b>关联查询</font></b>
   1. 查询时间戳之前哪些虚拟机做了snapshot，用于清理这些snapshot
   ![sql-join-select](/images/tupian/sqljoin.jpg)
    ```sql
  select * from vpx_entity join vpx_snapshot
    on vpx_snapshot.vm_id=vpx_entity.id 
    and vpx_snapshot.create_time < timestamp '2018-01-01 00:00:00';
    ```
  2. 利用pgadmin图形界面的download按钮可以将output直接下载为csv文件。
   
