---
layout: post
title: vscode抽了
category: tech
tags: [Linux]
description: 如果你也像我一样经常工作于Windows和Linux，那么这篇文章值得一看
---



# 问题

可能是因为升级的问题，具体我还没查出来。反正就是动不动这个python的进程后台就出来很多个，然后就听到风扇呜呜的转起来。这个这两天特别严重啊。

# 搜索

Google了下，说是jedi的问题，可是我没有开启这个，然后还有说是pylint的问题，这个要禁用吗？还是换另外一个flake8？还是啥别的pep8

换了个pep8，竟然多了更多的问题，warning个没完

算了，直接disable这些pylint了再说

为这个问题，还装了了个glances，Mac自带的那个任务管理器用起来不是很好。

```shell
pip3 install glances
```

运行的效果是挺漂亮的，用1，2，3，4就可以有效的看到情况了。

而且这个tasks的信息更明了。

问题重现的时候，看到：

此时的task中进行着很多个python的进程，进行pytest 测试。导致CPU被吃完了。

但是前段时间是没有这样的情况的。

# 结论

目前先disable pylint这些先，等到vscode再升级的时候打开下看看，希望不会再有这样的问题发生。

bug是无处不在的，就好像美，你不看它的时候，它是不存在的，你看它的时候，它就在看你，😄