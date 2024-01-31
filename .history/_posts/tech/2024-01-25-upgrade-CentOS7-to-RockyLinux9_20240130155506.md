---
layout: post
title: Upgrade CentOS7 to RockyLinux9
category: tech
tags: [Linux, CentOS7, RockyLinux9]
description:
---

# upgrade CentOS7 to Rocky Linux 9

CentOS7 已经EOL，为了继续使用，准备升级到Rocky Linux。

升级的过程是，先升级到CentOS8，然后迁移到Rocky Linux8，这个EOL是2025年。

然后从Rocky Linux8 升级到 Rocky Linux9. 这个的EOL是2029. 但是这个不是官方支持的升级。官方建议直接重新安装新系统然后对数据和服务进行重新部署。

下面是升级步骤，可能出现的冲突的包和你的不同。但是概括下，就是添加repo，更新，解决包冲突问题，然后继续即可。

要说明的是，这里选择了清华的CentOS的镜像，因为这个在国内维护的非常好，我也喜欢他们的这个TUNA协会。

[TUNA Events](https://tuna.moe/events/)

@2024-01-26 update, 删除有可能带来困扰的命令行。

### 补充

从Rocky Linux8升级到Rocky Linux9不是官方支持的行为。

升级后，可能面临在进行“dnf update”的时候，出现大量的“conflicting requests"问题提示。这个问题可能由于来自CentOS7时候安装的部分软件。对于module的问题，可以这样进行解决。

```shell
Problem 1: conflicting requests
  - nothing provides module(platform:el8) needed by module gimp:2.8:8030020210427153901:c307c522.x86_64 from @modulefailsafe
 Problem 2: conflicting requests
  - nothing provides module(platform:el8) needed by module go-toolset:rhel8:8090020231117205530:da531176.x86_64 from @modulefailsafe
 Problem 3: conflicting requests
  - nothing provides module(platform:el8) needed by module mariadb:10.3:8080020230920001707:fd72936b.x86_64 from @modulefailsafe
```

使用 module reset命令可以一次解决。

```shell
dnf module reset -y gimp go-toolset mariadb
```
再次尝试 update，发现问题提示已经没有了。

## 完整更新过程

```shell
# check current version
cat /etc/os-release 
# install epel
yum -y install epel-release
# install rpmconf and yum-utils
yum -y install rpmconf yum-utils
rpmconf -a #yes for all
# install dnf
yum -y install dnf
# remove yum and yum-metadata-parser
dnf -y remove yum yum-metadata-parser
# remove current yum repo, otherwise there may some issues
rm -rf /etc/yum
# install dnf
dnf -y upgrade

# uninstall any centos- related packages
rpm -e --nodeps `rpm -qa|grep centos-`

# install centos8 repo

rpm -ivh --nodeps --force https://mirrors.tuna.tsinghua.edu.cn/centos-vault/8.5.2111/BaseOS/x86_64/os/Packages/centos-linux-repos-8-3.el8.noarch.rpm

rpm -ivh --nodeps --force https://mirrors.tuna.tsinghua.edu.cn/centos-vault/8.5.2111/BaseOS/x86_64/os/Packages/centos-linux-release-8.5-1.2111.el8.noarch.rpm

rpm -ivh --nodeps --force https://mirrors.tuna.tsinghua.edu.cn/centos-vault/8.5.2111/BaseOS/x86_64/os/Packages/dracut-network-049-191.git20210920.el8.x86_64.rpm

rpm -ivh --nodeps --force https://mirrors.tuna.tsinghua.edu.cn/centos-vault/8.5.2111/BaseOS/x86_64/os/Packages/centos-gpg-keys-8-3.el8.noarch.rpm

dnf -y upgrade https://dl.fedoraproject.org/pub/epel/epel-release-latest-8.noarch.rpm

# here I got an issue about ius, just remove it
dnf remove ius-release-1.0-156.ius.centos7.noarch
dnf remove ius

dnf clean all

# remove kernel
rpm -e --nodeps `rpm -qa|grep -i kernel`

# install centos8
dnf -y --releasever=8 --allowerasing --setopt=deltarpm=false distro-sync

# there still some issues, so move any not native repo to bak

cd /etc/yum.repos.d
ls
mv elasticsearch.repo elasticsearch.repo.bak
mv kibana.repo kibana.repo.bak
mv vmware-tools.repo vmware-tools.repo.bak
mv filebeat.repo filebeat.repo.bak

# just create a folder, and move the current repo files into the folder, then reinstall the centos 8 repo
 
# continure install centos8
dnf -y --releasever=8 --allowerasing --setopt=deltarpm=false distro-sync

# optional, if above command is not working, try this

minorver=8.5.2111
sudo sed -e "s|^mirrorlist=|#mirrorlist=|g"          -e "s|^#baseurl=http://mirror.centos.org/\$contentdir/\$releasever|baseurl=https://mirrors.tuna.tsinghua.edu.cn/centos-vault/$minorver|g"          -i.bak          /etc/yum.repos.d/CentOS-*.repo
dnf -y --releasever=8 --allowerasing --setopt=deltarpm=false distro-sync

#今天2024-01-30在升级一台bind服务器时，提示下面错误：
```shell
导入公钥成功
运行事务检查
错误：事务检查与依赖解决错误：
(mariadb >= 3:10.3.27 if mariadb) 被 mariadb-connector-c-3.1.11-2.el8_3.x86_64 需要
(mariadb-connector-c-config = 3.1.11-2.el8_3 if mariadb-connector-c-config) 被 mariadb-connector-c-3.1.11-2.el8_3.x86_64 需要
rpmlib(RichDependencies) <= 4.12.0-1 被 mariadb-connector-c-3.1.11-2.el8_3.x86_64 需要
(flatpak-selinux = 1.8.5-5.el8_5 if selinux-policy-targeted) 被 flatpak-1.8.5-5.el8_5.x86_64 需要
rpmlib(RichDependencies) <= 4.12.0-1 被 flatpak-1.8.5-5.el8_5.x86_64 需要

```

此时，需要从package里面安装对应的包。
```shell
rpm -ivh --nodeps --force https://mirrors.tuna.tsinghua.edu.cn/centos-vault/8.5.2111/AppStream/x86_64/os/Packages/flatpak-1.8.5-5.el8_5.x86_64.rpm

rpm -ivh --nodeps --force https://mirrors.tuna.tsinghua.edu.cn/centos-vault/8.5.2111/AppStream/x86_64/os/Packages/mariadb-connector-c-3.1.11-2.el8_3.x86_64.rpm
```

安装完毕后，再次
dnf -y --releasever=8 --allowerasing --setopt=deltarpm=false distro-sync

会提示有冲突的包。然后继续下面的操作


# there some conflict, remove it
rpm -e --nodeps sysvinit-tools-2.88-14.dsf.el7.x86_64
rpm -e --nodeps python36-rpmconf-1.1.7-1.el7.1.noarch
rpm -e --nodeps python-backports-1.0-8.el7.x86_64
rpm -e --nodeps python-six-1.9.0-2.el7.noarch
rpm -e --nodeps python-backports-ssl_match_hostname-3.5.0.1-1.el7.noarch

# try again
dnf -y --releasever=8 --allowerasing --setopt=deltarpm=false distro-sync

# still some conflict
rpm -e --nodeps python-ipaddress-1.0.16-2.el7.noarch
# try again
dnf -y --releasever=8 --allowerasing --setopt=deltarpm=false distro-sync
# pass, continue
rpmconf -a

# install kernel and kernel-core
dnf install kernel kernel-core -y
dnf -y install shim grub2-tools-extra grubby grub2-common grub2-pc 
dnf -y install grub2-tools-efi grub2-tools-minimal grub2-efi grub2-pc-modules grub2-tools

# remove /etc/yum to make a clean install
rm -rf /etc/yum
dnf -y groupinstall "Minimal Install"

reboot

# check current version, it should be centos8
cat /etc/os-release 

# download rocky linux migration tool
dnf install git
git clone https://github.com/rocky-linux/rocky-tools.git

cd rocky-tools/
cd migrate2rocky/
chmod u+x migrate2rocky.sh 
./migrate2rocky.sh -r

# some package detected conflict. remove any conflict packages
rpm -e python3-pyyaml-3.12-12.el8.x86_64
rpm -e python36-PyYAML-3.13-1.el7.x86_64

# enable any module that missing
dnf module enable perl:5.26
dnf remove python-tornado-4.2.1-5.el7.x86_64

#dnf --disablerepo '*' --enablerepo=extras swap centos-linux-repos centos-stream-repos
dnf clean all
dnf distro-sync

# try migrate again
./migrate2rocky.sh -r
# pass, continue and reboot
reboot

# continue upgrade to rocky linux 9, it is not official yet, but it works

# modify the default grub, to boot rocky linux kernel by default
vi /etc/default/grub 
grub2-mkconfig -o /boot/grub2/grub.cfg
reboot

# install rocky linux 9 repo
dnf upgrade --refresh
REPO_URL="https://download.rockylinux.org/pub/rocky/9/BaseOS/x86_64/os/Packages/r/"
RELEASE_PKG="rocky-release-9.3-1.2.el9.noarch.rpm"
REPOS_PKG="rocky-repos-9.3-1.2.el9.noarch.rpm"
GPG_KEYS_PKG="rocky-gpg-keys-9.3-1.2.el9.noarch.rpm"
sudo dnf install $REPO_URL/$RELEASE_PKG $REPO_URL/$REPOS_PKG $REPO_URL/$GPG_KEYS_PKG -y
# remove unwanted packages
sudo dnf -y remove rpmconf yum-utils epel-release
sudo rm -rf /usr/share/redhat-logos
# install rocky linux 9 packages
sudo dnf -y --releasever=9 --allowerasing --setopt=deltarpm=false distro-sync
# uninstall any conflict packages
rpm -e --nodeps iptables-ebtables-1.8.5-11.el8.x86_64
# try again
sudo dnf -y --releasever=9 --allowerasing --setopt=deltarpm=false distro-sync
# build rpm conf
rpm --rebuilddb
reboot
# check grub and make it rocky
vi /etc/default/grub
grub2-mkconfig -o /boot/grub2/grub.cfg
reboot

```