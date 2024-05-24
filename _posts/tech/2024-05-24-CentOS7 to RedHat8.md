---
layout: post
title: CentOS7 to RedHat8 
category: tech
tags:
  - redhat
  - scripts
  - automatic
description: 如果你也像我一样经常工作于Windows和Linux，那么这篇文章值得一看
---

按照文档的说法应该是很方便的，但是实际上老的系统并不纯净，导致很多折腾。现在记录下整个的过程，提前的备份工作不谈：

## CentOS7 to RedHat7

1. 准备redhat7.9的ISO，这样会方便一些
2. 安装convert2rhel工具
```shell
curl -o /etc/yum.repos.d/convert2rhel.repo https://ftp.redhat.com/redhat/convert2rhel/7/convert2rhel.repo
yum repoinfo convert2rhel-for-rhel-7-rpms
yum install -y convert2rhel
```
3. 创建一个挂载点，挂起来，然后创建一个新的Repo。将当前的所有的repo都放到一个单独的文件夹里面。
```shell
  mkdir -p /mnt/redhat79
  mount -o loop rhel-server-7.9-x86_64-dvd.iso /mnt/redhat79/
  cd /etc/yum.repos.d
  mkdir repo_backup && move *.repo ./repo_backup
  cat >rhel.repo <<EOF
  [RHEL7]
  name=Red Hat Enterprise Linux 7
  baseurl=file:///mnt/redhat79
  enabled=1
  EOF
```
4. 进行转化
```shell
convert2rhel --disable-submgr --disablerepo=* --enablerepo=RHEL7 -y --no-rpm-va
```
5. 这个过程中可能会提示你要做一些参数的设定之类的事，例如
```shell
export CONVERT2RHEL_ALLOW_UNAVAILABLE_KMODS=1
export CONVERT2RHEL_OUTDATED_PACKAGE_CHECK_SKIP=1
export CONVERT2RHEL_TAINTED_KERNEL_MODULE_CHECK_SKIP=1
```
6. 根据提示，设定后，继续运行4中的转化语句即可
7. 转化完成后，检查下 cat /etc/os-release到Red Hat 7.9即可
8. 然后重启下，确保系统可以正常使用

## RedHat7 到 RedHat8

RedHat7.9也是在2024年6月30日就不再支持了，所以还得继续升级。很多时候看到文档说升级到RedHat8需要注册，其实升级本身不需要注册，只是以后要用起来需要。下面是以离线的方式做的整个过程：

1. 到RedHat网站下载最新的RedHat8 ISO下来
2. 参考这个页面：
3. https://access.redhat.com/zh_CN/solutions/7035235
4. 可以直接下载依赖项，也可以从ISO进行操作，参看这个：https://access.redhat.com/solutions/5492401
5. 下面的是笨办法：
<p>从<a href="https://access.redhat.com/downloads/content/69/ver=/rhel---7/7.9/x86_64/packages">红帽客户门户网站</a>下载软件包及其依赖项<br />
<p>以下是软件包及其依赖项列表：</p>
<pre><code>audit
audit-libs
audit-libs-python                     
checkpolicy               
dnf
dnf-data
json-glib                                            
leapp                                     
leapp-deps
leapp-upgrade-el7toel8
leapp-upgrade-el7toel8-deps
libcgroup
libcomps
libdnf
libmodulemd
librepo
libreport-filesystem
librhsm
libsemanage-python
libsolv
libyaml
pciutils
policycoreutils
policycoreutils-python
python-IPy
python-chardet
python-enum34
python-requests
python-urllib3
python2-dnf
python2-hawkey
python2-leapp
python2-libcomps
python2-libdnf
setools-libs
</code></pre>
6. <p>在离线系统上创建一个文件夹 <code>/tmp/packages</code>，将所有 rpm 复制到 <code>/tmp/packages</code>。安装软件包。</p>
<pre><code> 
mkdir /tmp/packages
cd /tmp/packages
yum localinstall *
</code></pre>
7. 在进行这个本地安装的时候，会提示一些依赖项的问题，比如无法安装leapp，需要依赖，比如我碰到的问题是需要下面的包：
	 1. wget https://rpmfind.net/linux/centos/7.9.2009/os/x86_64/Packages/hawkey-0.6.3-4.el7.x86_64.rpm
	 2. wget https://rpmfind.net/linux/centos/7.9.2009/os/x86_64/Packages/python2-hawkey-0.6.3-4.el7.x86_64.rpm
	 3. wget https://rpmfind.net/linux/centos/7.9.2009/os/x86_64/Packages/libsolv-0.6.34-4.el7.x86_64.rpm
	 4. wget http://mirror.centos.org/centos/7/extras/x86_64/Packages/python2-hawkey-0.22.5-2.el7_9.x86_64.rpm
	 5. yum install python2-hawkey-0.6.3-4.el7.x86_64.rpm hawkey-0.6.3-4.el7.x86_64.rpm libsolv-0.6.34-4.el7.x86_64.rpm 
6. 解决方法就是直接去rpmfind.net去搜，然后安装对应的CentOS的即可，否则就是会出现leapp无法安装的问题。我的链接是这个：https://rpmfind.net/linux/RPM/centos/7.9.2009/x86_64/Packages/
7. 依赖的包都安装好后，再到步骤6，安装升级需要的必须包
8. 确保leapp都可以正常使用，在我这里，leapp会爆出urllib3.exception包不存在的问题
9. 解决方法如下：
```shell
pip3 install --upgrade pip
pip install --target=/usr/lib/python2.7/site-packages urllib3
```
10. 然后再运行leapp发现正常了。接着就是预升级阶段了
```shell
leapp preupgrade --no-rhsm --iso rhel-8.10-x86_64-dvd.iso 
```
11. 等待运行完毕，会生成一个answer文件，位于 /var/log/leapp/answerfile
12. 打开这个文件，去掉confirm那行的注释，并写入True值，保存。
13. 重复运行步骤10，进行预检查，我碰到的问题是
```shell
Inhibitor: Detected loaded kernel drivers which have been removed in RHEL 8. Upgrade cannot proceed.
```
14. 解决方法参见：https://access.redhat.com/solutions/6971716
15. 就是打开 /var/log/leapp/leapp-report.txt文件，会看到
```txt
Risk Factor: high (inhibitor)
Title: Detected loaded kernel drivers which have been removed in RHEL 8. Upgrade cannot proceed.
Summary: Support for the following RHEL 7 device drivers has been removed in RHEL 8: 
 - floppy
 - pata_acpi
```
16. 然后执行： sudo rmmod floppy pata_acpi 就可以了
17. 继续返回，执行 leapp upgrade --no-rhsm --iso rhel-8.10-x86_64-dvd.iso 
18. 确保没有什么error之类的大问题就可以了。然后进入升级环节
19. 运行 leapp upgrade --no-rhsm --iso rhel-8.10-x86_64-dvd.iso 
20. 这时候一般会出现很多类似冲突的提示，然后结束。收集这些冲突的包，然后删除它。
21. 我这里删除了这么多的冲突包：
```shell
rpm -qa |grep python36-six
rpm -e python36-six
rpm -e python36-six-1.14.0-3.el7.noarch
rpm -qa |grep python36-requests-2.14.2-2.el7.noarch
rpm -e python36-requests-2.14.2-2.el7.noarch
rpm -qa |grep python36-requests-2.14.2-2.el7.noarch
rpm -qa |grep python36-chardet-3.0.4-12.el7.noarch
rpm -e python36-chardet-3.0.4-12.el7.noarch
rpm -e python36-PyYAML-3.13-1.el7.x86_64
rpm -e python36-markupsafe-0.23-4.el7.x86_64
rpm -e python36-jinja2-2.11.1-1.el7.noarch
rpm -e python36-pycurl-7.43.0-8.el7.x86_64
rpm -e python36-tornado-4.5.3-1.el7.x86_64
rpm -e python36-pycurl-7.43.0-8.el7.x86_64
rpm -e python36-markupsafe-0.23-4.el7.x86_64
rpm -e python36-six-1.14.0-3.el7.noarch
rpm -e python36-urllib3-1.25.6-2.el7.noarch
rpm -e python36-six-1.14.0-3.el7.noarch
```
22. 删除这些冲突后，继续执行步骤19，进行升级
23. 在运行结束后，会给出一个说明，如果没有什么大的问题，只需要重启就可以了
24. 重启的过程中，会大量的对系统进行更新，可能需要等待一段时间。
25. 可以的话，还是要做下注册工作，然后运行下 yum update，确保更新到最新了
```shell
subscription-manager register --org="mycompany" --activionkey="dev"
yum update 
```

基本就是这个过程，非常的麻烦。如果这个机器不值得去折腾，那就不要去做这样的事情。因为时间成本很高。顺利的话，也需要半天时间，根本没必要。

