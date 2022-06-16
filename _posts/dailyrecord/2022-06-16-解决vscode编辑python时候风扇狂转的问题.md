---
layout: post
title: vscode使用python时候出现多个python进程，导致风扇狂转的解决
category: tech
tags: [Linux,MacOS]
description: 如果你也像我一样经常工作于Windows和Linux，那么这篇文章值得一
---

# vscode使用python时候出现多个python进程，导致风扇狂转的解决

这问题困扰了我很久。搜了网上的解决方案vscode的language server的问题，将pylance换成jedi，或者将pylance换成none就可以解决。

我都试过了，没用。

只要一开python文件，就有数10个python进程在后台起来，然后风扇就狂转了，噪音加上发热，不可忍受。不断的killall python也不是个事啊。

昨天下午突发的想法，这么做了。

```bash
cd "/Users/ls3686/Library/Application Support/Code/User/workspaceStorage/
rm -rf ./workspaceStorage
```
然后重启vscode，再试试python文件的编辑和运行，好了。

值得记录一下。困扰的问题终于解决了。