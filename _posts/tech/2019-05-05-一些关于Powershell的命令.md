---
layout: post
title: 一些powershell的命令
category: tech
tags: [Linux]
description: 如果你也像我一样经常工作于Windows和Linux，那么这篇文章值得一看
---



# 问题

刚才在搞一个对DNS分析的数据。

用正则筛选出来了一天的所有的dns查询信息，现在想要做个数据总结和分析。

但是一没有excel，二也不想搞什么编程，咋整

直接用powershell开干

# 过程

- 正则出来的dns数据类似下面的形式,过滤掉了日期，更细分的那就上其他工具吧，这边只想筛选出来解析最多的和最少的域名

  ```bash
  cambrian-images.cdn.bcebos.com
  cambrian-images.cdn.bcebos.com
  cello.client-channel.google.com
  cello.client-channel.google.com
  cello.client-channel.google.com
  ```

  

- powershell直接排序

  ```powershell
  get-content C:\dns-201905.txt |Group-Object -NoElement |Sort-Object Count
  ```

  输出的样子是这样的

  ```powershell
     ...
     24 clients4.google.com
     30 chat-pa.clients6.googl...
     36 mail.google.com
     61 vortex.data.microsoft.com
     64 play.google.com
     66 ssl.gstatic.com
     ...
  ```

  将就能看了。更好看的方式那就上excel或者用程序来画图吧，我这边目前没有这样的需求。

# 顺便其他

powershell越来越类似于linux的shell，而且对于windows来说比cmdline有更加的功能性。

顺便摘抄一个foreach的loop项。

参见<a href="https://ss64.com/ps/foreach.html">Powershell Loop</a>

```powershell
Examples

Loop through an array of strings:

 $trees = @("Alder","Ash","Birch","Cedar","Chestnut","Elm")

 foreach ($tree in $trees) {
   "$tree = " + $tree.length
 }

Loop through a collection of the numbers, echo each number unless the number is 2:

 foreach ($num in 1,2,3,4,5) {
  if ($num -eq 2) { continue } ; $num
 }

Loop through a collection of .txt files:

  foreach ($file in get-ChildItem *.txt) {
    Echo $file.name
  }
```

是有必要好好再温习下基本的powershell语法了。现在就是想用的时候就直接上网google。