# 问题

在检查netdata的数据的时候，发现有个进程占了大量的cpu资源。

这台机器是centos8的，不知道是不是因为8里面安装了某些东西的缘故。

```shell
NAME="CentOS Linux"
VERSION="8 (Core)"
ID="centos"
ID_LIKE="rhel fedora"
VERSION_ID="8"
PLATFORM_ID="platform:el8"
PRETTY_NAME="CentOS Linux 8 (Core)"
ANSI_COLOR="0;31"
CPE_NAME="cpe:/o:centos:centos:8"
HOME_URL="https://www.centos.org/"
BUG_REPORT_URL="https://bugs.centos.org/"

CENTOS_MANTISBT_PROJECT="CentOS-8"
CENTOS_MANTISBT_PROJECT_VERSION="8"
REDHAT_SUPPORT_PRODUCT="centos"
REDHAT_SUPPORT_PRODUCT_VERSION="8"

```

![high-cpu-process](/images/tupian/ksmtuned.jpg)



google了下，内容如下：

```shell
Kernel same-page Merging (KSM), used by the KVM hypervisor, allows KVM guests to share identical memory pages. These shared pages are usually common libraries or other identical, high-use data. KSM allows for greater guest density of identical or similar guest operating systems by avoiding memory duplication……
```
# 解决

解决方案见[这里](https://thelinuxcluster.com/2020/06/22/swap-overheads-ksm-and-tuned/)

停止和禁用这服务

```shell

systemctl stop ksmtuned
systemctl stop ksm

systemctl disable ksmtuned
systemctl disable ksm

```
When KSM is disabled, any memory pages that were shared prior to deactivating KSM are still shared. To delete all of the PageKSM in the system, use the following command:

```shell
echo 2 >/sys/kernel/mm/ksm/run
```
