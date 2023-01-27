---
layout: post
title: esxcli 更新esxi主机
category: tech
tags: [vmware,esxcli,esxi]
description: 
---


# 利用esxcli升级esxi host

- 利用VUM升级是比较方便的，在新的VCSA的版本里面，VUM变更为lifecycle management，通过导入ISO的方式比较方便的进行新的profile和基准的设定
- 但是有个问题，就是如果导入的ISO的镜像中不包含对应的驱动的时候，会提示所提供的镜像和硬件不兼容而导致更新失败
- 大部分的情况下，vmware在新版本的vsphere的发布时候会削减掉对部分硬件的支持
- 利用esxcli的强制更新profile的方式可以实现强制升级，在一定的情况下，这样的升级方式不会对系统产生问题
  
## 过程
- network firewall ruleset set -e true -r httpClient
- 检索对应的ESXi的版本
  - esxcli software sources profile list -d https://hostupdate.vmware.com/software/VUM/PRODUCTION/main/vmw-depot-index.xml | grep ESXi-6.7.0-2020
  - 结果如下
    ```
    ESXi-6.7.0-20200404001-no-tools   VMware, Inc.  PartnerSupported  2020-06-04T02:20:40  2020-06-04T02:20:40
    ESXi-6.7.0-20200403001-no-tools   VMware, Inc.  PartnerSupported  2020-06-04T02:20:40  2020-06-04T02:20:40
    ESXi-6.7.0-20200604001-standard   VMware, Inc.  PartnerSupported  2020-06-04T02:20:40  2020-06-04T02:20:40
    ESXi-6.7.0-20200401001s-no-tools  VMware, Inc.  PartnerSupported  2020-06-04T02:20:40  2020-06-04T02:20:40
    ESXi-6.7.0-20200403001-standard   VMware, Inc.  PartnerSupported  2020-06-04T02:20:40  2020-06-04T02:20:40
    ESXi-6.7.0-20200401001s-standard  VMware, Inc.  PartnerSupported  2020-06-04T02:20:40  2020-06-04T02:20:40
    ESXi-6.7.0-20200404001-standard   VMware, Inc.  PartnerSupported  2020-06-04T02:20:40  2020-06-04T02:20:40
    ESXi-6.7.0-20200604001-no-tools   VMware, Inc.  PartnerSupported  2020-06-04T02:20:40  2020-06-04T02:20:40
    ```
- 选择对应的版本更新（强制更新）
  - 加参数 -f 为强制更新。 建议先不加 -f参数，看看输出结果，判断是有那些硬件驱动不兼容
  - esxcli software profile update -d https://hostupdate.vmware.com/software/VUM/PRODUCTION/main/vmw-depot-index.xml -p ESXi-6.7.0-20200604001-standard -f
- 更新完毕后，reboot机器