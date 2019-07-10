---
layout: post
title: gitblit和被动ftp服务器
category: tech
tags: [Linux]
description: 如果你也像我一样经常工作于Windows和Linux，那么这篇文章值得一看
---



# 问题

由于已经设定过办公地方的gitblit服务器，这次将家用电脑配置为ftp服务器，可以从公司直接往家里传文件，省的还要通过网盘或者电脑来回对拷。

# 过程

##  gitblit 部分

- 首先安装java，这个gitblit需要。

- 然后下载gitblit的安装压缩包并解压

  - 打开解压目录中data\defaults.properties,编辑

  - ```ini
    git.repositoriesFolder=I:\mylab
    ```

这个就是我以后gitblit创建仓库的实际文件夹所处位置。

- 然后修改解压缩文件根目录下的installservice.cmd文件

  ```ini
  SET ARCH=amd64
  SET CD=H:\gitblit-1.8.0 #这个是我解压缩的文件夹
  #去掉--StartParams的参数
  --StartParams="" ^
  ```

然后开始运行下这个文件，用于注册下gitlbit这个服务

- 为了让这个可以自启动，也可以使用windows的startup快捷方式

- 创建gitblit.bat文件为下面的形式，可以避免出现java的运行命令行窗口

  ```ini
  @echo off
  cd H:\gitblit-1.8.0
  start java -jar gitblit.jar --baseFolder data %*
  ```

- 创建gitblit.bat的快捷方式，并放置到win10的startup文件夹即可

- Win10的startup文件夹位于：

  ```ini
  c:\programdata\microsoft\windows\start menu\programs\startup
  ```

## ftp部分

- 安装filezilla服务器
- 创建ftp的目录
- 打开filezilla控制台对该目录进行用户授权
- 创建自签名的证书，要求TLS加密
- 本地测试上传和下载，确认成功
- 打开被动访问，确定端口，这里以7000-7050为例
- 确定默认的ftp over tls使用的990端口



## 防火墙部分

这里是重头戏了。

- 在路由器上进行端口转发的设定，gitblit需要有ssh，https以及git的端口的映射，按照需要进行即可
- 对于ftp部分
  - 首先要有一个ftp的21端口的映射，这里我映射外部7021到内部的21端口
  - 还需要有个990端口的映射，用于ftp over tls
  - 然后还需要被动端口集7000-7050的允许入站连接，这个内部的端口映射留空即可。



## 测试

拨入个外部的vpn，填入申请的家里的ddns域名，然后试着git push，ftp upload，以及https的接入，都没有什么问题了。





