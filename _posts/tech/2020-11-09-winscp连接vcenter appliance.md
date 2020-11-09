---
layout: post
title: winscp 连接vcenter appliance复制文件
category: tech
tags: [vcenter,winscp,vmware]
description: 
---

# winscp 连接vcenter appliance复制文件

## 问题

要收集vcenter的调试日志，用connect-viserver 和get-log的方法以及在webclient下导出system log的方式都很慢。

情急之下，直接ssh到vcenter以及不同的esxi主机上面去取。

## 步骤

- 收集esxi主机日志就登录到那台esxi主机，使用vm-support命令即可，日志会存在存储区里面
- 收集vcenter的日志，要登录到vcenter appliance中，用root登录，执行vc-support，结束会报出存放位置
  - 日志生成后，使用winscp用sftp的方式连接vcenter appliance的时候会报错，"receive too large packet sftp..."
  - 参考<a href="https://www.johnborhek.com/vmware/vmware-vsphere/vmware-vcenter/using-winscp-vmware-vcenter-server-appliance/">这里</a>
  - 调整advance里面的sftp server这个项目为：shell /usr/libexec/sftp-server  
  - 保存，重新连接就可以了。