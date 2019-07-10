---
layout: post
title: Ubuntu18的floopy问题
category: tech
tags: [Linux]

---

## 问题描述

在使用了Ubuntu18.04 LTS的虚拟机后，开机也好，运行一段时间也好，总会出现I/O error，fd0出错的问题。

这样的提示不影响应用，但是看着比较烦。

经过Google，发现这个[这里](https://askubuntu.com/questions/719058/blk-update-request-i-o-error-dev-fd0-sector-0/884026)有解决方案了。照猫画虎执行后，问题解决了。

```shell
sudo rmmod floppy
echo "blacklist floppy" | sudo tee /etc/modprobe.d/blacklist-floppy.conf
sudo dpkg-reconfigure initramfs-tools
```

发现Ubuntu18中有比较多的东西和以前的版本差别比较大。

有影响的是本来16的时候，做的批处理部署ubuntu模版的时候，在vmware中挂载vds网卡都是可以开机就挂载的，但是18就不行，因为vmware还没有制作针对18的开机挂载功能。现在最新的是16的。这个只有等。

还有就是18的网络配置使用netplan了，也谈不上这个和以前的相比有多好，只是ubuntu这是越来越向cloud端发展的苗头，不是很ok。

CentOS就一直的比较稳定和坚持。