---
title: "让R可以正常显示中文"
published: 2024-03-22
draft: false
description: "如果你也像我一样经常工作于Windows和Linux，那么这篇文章值得一"
category: "tech"
tags: ["Linux"]
---

1. 退出当前的R
2. 在终端下，执行下面的命令：
```shell
defaults write org.R-project.R force.LANG en_US.UTF-8
```
3. 重新打开进入R即可


