---
layout: post
title: redhat satellite content views 自动发布
category: tech
tags:
  - redhat
  - scripts
  - automatic
description: 如果你也像我一样经常工作于Windows和Linux，那么这篇文章值得一看
---

由于目前使用的RedHat Satellite我们只有部分功能和权限，主要就是要跟上主库的更新，确保本地站点受管的RedHat客户端可以更新到最新的版本。

前几天写了个用dnf-automatic的脚本，自动下载和安装security更新包，然后清理和邮件通告。

但是要是content views不更新，那么就会找不到最新的更新。所以这次直接做了个自动任务，每隔4天，在半夜发布下两个content-views，分别是Redhat8和RedHat9.

Satellite服务器不在我们这边，我能用web访问，然后手动进行发布。

这都是玩剩下的，直接打开浏览器的开发者工具，追下过程。

然后简单看下Satellite的官方API，找到其中发布的API。然后在PostMan中试了post下，通过。唯一要注意的是head要用application/json进行提交。

下面是部分脚本，减去了发送邮件的部分：

```python
redhat8_url="https://mycorp.com/katello/api/v2/content_views/91/publish"
redhat9_url="https://mycrop.com/katello/api/v2/content_views/124/publish"

headers={

"Content-Type":"application/json"

}

username="myaccount"

password=keyring.get_password("gaogaogao",username)

  
payload={}

successful=1

  
response0=requests.post(redhat8_url,auth=(username,password),data=json.dumps(payload),headers=headers)

  

response1=requests.post(redhat9_url,auth=(username,password),data=json.dumps(payload),headers=headers)
  

redhat8_json_response=response0.json()

redhat9_json_response=response1.json()

  

if response0.status_code==202:

print("redhat8 content views publish success")

else:
successful=0
print("redhat8 content views publish publish failed")



#print(json.dumps(json_respose,indent=4))

print(json.dumps(redhat8_json_response,indent=4))

......


```

测试了下，通过。就是由于权限问题，没法生成自己的token，只能用basic authentication的方式。密码明文了。

不过这个脚本跑在独立的机器上，只有我能访问，就这样吧。

加上一个计划任务，每隔4天触发下，在半夜运行，然后发送邮件通告给我就好了。



