---
layout: post
title: 关于metasploit
category: 学习
tags: [管理平台]
---
# 安装
直接在官网下载针对MacOS的pkg包安装即可。
安装后最好做个alias，这样方便操作。
我用的zsh，所以做了这个alias：

  ```shell
 alias msf= "cd /opt/metasploit-framework/bin"
  ```
  这样source ~/.zshrc后， 在窗口输入msf就能到对应目录。
  
  # 使用
   使用的话，先show -h
  会有对应的帮助命令出来。

   -- 使用基本的portscan
  1. use auxiliary/scanner/portscan/tcp
  2. show options
  3. set RHOSTS www.google.com.hk
  4. set THREADS 11
  5. set CONCURRENCY 20
  6. run
   -- 使用证书扫描
  1. use auxiliary/scanner/http/ssl
  2. show options
    3. set RHOSTS www.microsoft.com
     4. run
  
   ## 获取详细的payload

    有时候我想看看这个payload是怎么样子的，可以这么做。
    
  ```bash
    ./msfvenom LPORT=4444 --payload windows/shell_bind_tcp --platform windows --arch x86 --encoder x86/shikata_ga
  ```
   这里是看shell_bind_tcp这个payload在x86平台上面，使用python语言看到的payload信息。

   这里的语言的选项有很多种，这个platform的选项也有多种。都可以看看。

