---
layout: post
title: rancher-k8s-kubesphere
category: 学习
tags: [k8s,rancher]
---

# rancher,k8s,kubesphere

因为开发准备使用docker的结构来发布软件，为了满足他们的需求，需要尽快搞一套管理平台给他们用。
原始的基于kubeadm的模式构建感觉比较烦。
这次采用了rancher的方式，会比较方便一点。

rancher对于我来说比较方便，但是对于使用者来说可能没有kubesphere好用。其实本质都一样，但是各花入各眼，做个kubepsher的ui对他们来说比较好一点。

## 过程
1. 4台centos7的机器，其中3台做k8s，1台做rancher的管理机
2. 按照rancher的需求，我这里关闭了防火墙，将这台rancher的管理机器的公钥拷贝到其他的3台机器
3. 安装docker
4. 安装docker的时候最好确认下以后文件的存储位置。默认docker文件存储/var/lib/docker中。
5. 可以适当的将/var/空间扩容，或者移动docker的默认存储到较大的空间，方便以后使用
6. 配置管理机的dns
7. sudo docker run -d -v /opt/rancher-data:/var/lib/rancher --restart=unless-stopped -p 80:80 -p 443:443 rancher/rancher
8. rancher安装完毕后，可以直接使用https://dns名称 的方式打开访问界面，设定密码后进入管理界面
9. 选择创建集群，输入集群名
10. 选择使用已有的机器，按照需求勾选机器的职能，然后拷贝出现的命令行，在对应的主机上面运行即可。
11. 等待集群构建完成
12. 测试创建部署服务，见[这里](https://rancher.com/docs/rancher/v2.x/en/quick-start-guide/workload/)
13. 测试部署ingress和nodeport的两个方式，访问对应的服务
14. 在全局的界面，能看到kubectl的按钮，这里可以利用kubectl做很多事情
15. 创建存储类(storageclass),这里使用longhore
    1.  开始在节点安装必要组件,参见[这里](https://longhorn.io/docs/1.0.2/deploy/install/#installing-open-iscsi)
    2.  yum install iscsi-initiator-utils -y
    3.  在k8s部署： kubectl apply -f https://raw.githubusercontent.com/longhorn/longhorn/master/deploy/longhorn.yaml
    4. 部署完成后会产生新的longhore的命名空间
    5. 可以通过ingress来映射longhore的web ui访问
16. 创建完成后，设定为默认存储类,设定完成后，存储类的默认会出现闪亮的五星标志。这个步骤可以直接在图像界面用鼠标确定。
    1.  kubectl get storageclass
    2.  kubectl patch storageclass <storage-class-name> -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
17. 开始部署kubesphere
18. 参看[这里](https://kubesphere.io/docs/quick-start/minimal-kubesphere-on-k8s/)
19. 如果没有默认的存储类，会部署失败。
20. 部署完成后，将kubesphere对应的命名空间移动到kube-system中。等待所有的pod启动完成。


## 下面看图
![longhore](/images/tupian/longhore.jpg)
![longhore2](/images/tupian/longhore2.jpg)
![longhore3](/images/tupian/longhore3.jpg)
![rancher0](/images/tupian/rancher0.jpg)
![rancher1](/images/tupian/rancher1.jpg)
![rancher2](/images/tupian/rancher2.jpg)