---
layout: post
title: 使用parsehub抓取indeed.com上的工作信息
category: 数据获取
tags: [parsehub,爬网]
description: 获取网络上的公开信息
---

# 使用parsehub抓取indeed.com上的工作信息

## 什么是parsehub

parsehub是一款免费的网络爬虫工具，可以用来抓取网络上的公开信息。

整体的操作比较简单，在一些不需要自己写代码的情况下，利用这个工具也能获取到较好的信息。


## 使用过程

- 首先建立新的project
- 输入要抓取的URL: "https://www.indeed.com/jobs?q=cyber+security&l=New+York%2C+NY&vjk=1b266e77a688b9f8"
- parsehub会开启浏览页面到该URL
- 然后选中职位名称，对每个职位名称进行点击，点击后进入第二个页面
- 第二个页面是获取岗位的具体信息的页面
- 选择岗位名称和岗位信息，然后选择relatives,对岗位描述进行解析
- 至此，岗位的信息拿到了。还需要对多页面的信息进行解析
- 返回到主模板，增加新page，选择翻页，循环，然后设定翻页的次数，我这里设定为10页。
- 保存，运行。就能获取到网页的信息了。

下面是

