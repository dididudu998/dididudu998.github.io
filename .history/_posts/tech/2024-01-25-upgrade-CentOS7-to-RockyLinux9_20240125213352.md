---
layout: post
title: Upgrade CentOS7 to RockyLinux9
category: tech
tags: [Linux, CentOS7, RockyLinux9]
description:
---

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
 
# continure install centos8
dnf -y --releasever=8 --allowerasing --setopt=deltarpm=false distro-sync

# optional, if above command is not working, try this

minorver=8.5.2111
sudo sed -e "s|^mirrorlist=|#mirrorlist=|g"          -e "s|^#baseurl=http://mirror.centos.org/\$contentdir/\$releasever|baseurl=https://mirrors.tuna.tsinghua.edu.cn/centos-vault/$minorver|g"          -i.bak          /etc/yum.repos.d/CentOS-*.repo
dnf -y --releasever=8 --allowerasing --setopt=deltarpm=false distro-sync

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
fdisk -l
reboot
cat /etc/os-release 
ls
git clone https://github.com/rocky-linux/rocky-tools.git
dnf install git
git clone https://github.com/rocky-linux/rocky-tools.git
cd rocky-tools/
ls
cd migrate2rocky/
ls
chmod u+x migrate2rocky.sh 
./migrate2rocky.sh -r

dnf --disablerepo '*' --enablerepo=extras swap centos-linux-repos centos-stream-repos
dnf clean all
dnf distro-sync
rpm -e python3-pyyaml-3.12-12.el8.x86_64
rpm -e python36-PyYAML-3.13-1.el7.x86_64
dnf distro-sync
  
dnf module enable perl:5.26
dnf remove python-tornado-4.2.1-5.el7.x86_64
./migrate2rocky.sh -r
reboot


vi /etc/default/grub 
grub2-mkconfig -o /boot/grub2/grub.cfg
reboot

dnf upgrade --refresh
REPO_URL="https://download.rockylinux.org/pub/rocky/9/BaseOS/x86_64/os/Packages/r/"
RELEASE_PKG="rocky-release-9.3-1.2.el9.noarch.rpm"
REPOS_PKG="rocky-repos-9.3-1.2.el9.noarch.rpm"
GPG_KEYS_PKG="rocky-gpg-keys-9.3-1.2.el9.noarch.rpm"
sudo dnf install $REPO_URL/$RELEASE_PKG $REPO_URL/$REPOS_PKG $REPO_URL/$GPG_KEYS_PKG
sudo dnf -y remove rpmconf yum-utils epel-release
sudo rm -rf /usr/share/redhat-logos
sudo dnf -y --releasever=9 --allowerasing --setopt=deltarpm=false distro-sync
rpm -e --nodeps iptables-ebtables-1.8.5-11.el8.x86_64
sudo dnf -y --releasever=9 --allowerasing --setopt=deltarpm=false distro-sync
history
rpm --rebuilddb
reboot
vi /etc/default/grub
grub2-mkconfig -o /boot/grub2/grub.cfg
reboot

```