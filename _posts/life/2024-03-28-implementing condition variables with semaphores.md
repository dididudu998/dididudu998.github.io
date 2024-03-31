---
layout: post
title: implementing condition variables with semaphores
category: paper
tags:
  - paper
description: 如果你也像我一样经常工作于Windows和Linux，那么这篇文章值得一看
---
here the summary of the paper:

## introduction

所有当今流行的用于多线程的操作系统的设计，都基于下面三种数据类型：

1. 线程，包括针对线程的fork和join
2. 锁，包括获取和释放
3. 条件变量，包括等待，信号，和广播

