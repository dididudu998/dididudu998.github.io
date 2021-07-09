---
layout: post
title: git push到多个远程库
category: tech
tags: [git,devops]
description: 如果你也像我一样经常工作于Windows和Linux，那么这篇文章值得一
---

# git 一次推送到多个远程库


## 起因

因为既有自己搭建到git服务器，也有网上提供的github和gitlab的私有库可用。

为了能够一次性的提交，免得麻烦，可以用下面的方式实现。

## 过程

以下面的为例，已经有了下面的远程库。
```git
remote.gitlab.url=git@gitlab.com:xxxx/my_kee.git

remote.github.url=git@github.com:yyyy/kees.git

remote.mypc.url=ssh://admin@zzzz:8400/kee.git
```
如果不做一次性的提交，那么提交到gitlab就是git push gitlab master，其他的一样的。

为了可以实现一次性的提交，这么做：
```git
git remote add all git@gitlab.com:xxxx/my_kee.git

git remote set-url --add --push all git@github.com:yyyy/kees.git

git remote set-url --add --push all ssh://admin@zzzz:8400/kee.git
```
验证下，git remote -v 就能看到all的这个项目存在。

下次直接 git push all 就可以一次性的push到上面的三个远程库里面了，减少了麻烦。

