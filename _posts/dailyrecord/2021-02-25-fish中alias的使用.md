---
layout: post
title: fish中alias的使用
category: tech
tags: [Linux]
description: 
---

# 简便的shell-fish

好像是在微博上看到的有人问除了zsh还有什么shell比较好用.

我现在用的是zsh，配合使用的oh-my-zsh这个。

然后也跟风去安装了fish，fish和zsh的区别是有些命令没有。还有在zshrc中配置的alias都没有。但是fish的自动补全功能是很好的。而且启动新的窗口比zsh要快，可能是我的zshrc中配置的东西太多了导致的。

我只是想在fish shell中使用更快捷的alias命令，所以在这里配置即可。

```bash
cd ~/.config/fish
ls
config.fish    fish_variables functions
vi config.fish
alias updatedb="sudo /usr/libexec/locate.updatedb"
....
....
```
其他的alias逐行添加即可。
添加后重新打开fish shell，就可以用了。

