---
layout: post
title: 将原来的GitHub page重新做了下
category: 学习
tags: [blog,学习]
---



# 重新建立github page

原来的github page是直接从jeklly那边fork过来用的，主题不是很好看。

昨天下午在网上搜了下，觉得还是有好看的主题的，就想着重新做下。

毕竟自己看了也会比较养眼一点。

虽然内容还是那么些内容。

## 过程

- 选个新的主题
  - 这个主题来自这里[SUNYAN](https://github.com/suyan/suyan.github.io)
- 配置的过程
  - 参看这里[byqiu](https://www.jianshu.com/p/e68fba58f75c)
- 其中在进行disqus的shortname的时候耗费了一点时间。
  - 这个shortname要在站点信息页里面看，仔细点即可。
- 新主题在进行切换的时候，要对以前的文章进行yaml的注释，否则会出现文章不显示的问题。这个是比较烦的，我记得有可以自动进行分类的，难道又要写个小玩意。算了。

## 结果

结果就是现在看到的样子，其中里面的main.js中存在http的链接，会在浏览器浏览的时候提示不安全，而且disqus的引用也是http的，会导致无法加载回复，这些都要在对应的js和html文件中对http替换为https。

总的来说还是可以的。

