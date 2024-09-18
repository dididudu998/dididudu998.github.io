---
layout: post
title: 自动拨入Cisco anyconnect
category: tech
tags: [Windows]
description: 如果你也像我一样经常工作于Windows和Linux，那么这篇文章值得一
---

昨天台风，发了邮件通知，说在家办公，这个时候需要拨VPN。我以前用的mac电脑，直接一个脚本就上去了。但是现在换成windows了，配置了openconnect的gui，记得前些时候试过了都是可以的，但是昨天怎么地都连不上，不知道什么问题。只好下载Cisco的anyconnect客户端，手动连接了。

这玩意有个毛病，也可能是服务端配置的问题，不能自动记录密码。而且学校这边是两个密码，再加上一个手机上面的Duo，而密码呢又是复杂性的，长度又很长，我一般不记密码，记不住啊。所以只好想办法在windows上做个自动连接的脚本，减少手动的输入麻烦。

用了两种方法，一种是powershell的，一种是python的。分别如下，主要是测试的时候，这个拉起anyconnect后，焦点的问题，不是直接放到连接按钮上的，所以前面测试搞了好几次tab。用python就好点，因为调试好了。

下面的是powershell的脚本：
```powershell
# 加载 Windows Forms 库

Add-Type -AssemblyName System.Windows.Forms

  

# 用户名，vpn地址都已经自动保存在profile里面了，所以不用输入

# C:\Users\Mark\appdata\Local\Cisco\Cisco Secure Client\VPN\preferences.xml

$password = "mypassword"

$secondPassword = "push"  # 第二个密码

  

# 启动 Cisco AnyConnect

Start-Process "C:\Program Files (x86)\Cisco\Cisco Secure Client\UI\csc_ui.exe"

# 等待 AnyConnect 启动

Start-Sleep -Seconds 5

# 等待连接窗口加载
# 由于程序打开后，默认的焦点不在连接button上，所以使用3个tab定位到连接button，然后按下enter

<#

[System.Windows.Forms.SendKeys]::SendWait("{TAB}")

[System.Windows.Forms.SendKeys]::SendWait("{TAB}")

[System.Windows.Forms.SendKeys]::SendWait("{TAB}")

#> 

[System.Windows.Forms.SendKeys]::SendWait("{ENTER}")
Start-Sleep -Seconds 2

# 输入密码和二次密码

# 输入密码

[System.Windows.Forms.SendKeys]::SendWait("$password")

[System.Windows.Forms.SendKeys]::SendWait("{TAB}")

  

# 输入第二个密码

[System.Windows.Forms.SendKeys]::SendWait("$secondPassword")

[System.Windows.Forms.SendKeys]::SendWait("{ENTER}")

  

# 等待Duo确认

Start-Sleep -Seconds 10

[System.Windows.Forms.SendKeys]::SendWait("{ENTER}")
  

Write-Host "VPN 连接请求已发送，等待连接完成"
```

下面是python的脚本:
```python
'''

File: auto-anyconnect.py

File Created: Tuesday, 16th September 2024 10:43:02 am

Author: Mark S

-----

Last Modified: Tuesday, 16th September 2024 10:45:05 am

Modified By: Mark S

-----

Copyright MarkShi

'''

  

import pyautogui

import subprocess

import time

  

# 定义密码

password = "mypassword"

second_password = "push"


# 启动 Cisco AnyConnect

subprocess.Popen(r'"C:\Program Files (x86)\Cisco\Cisco Secure Client\UI\csc_ui.exe"')

  

# 等待 AnyConnect 启动

time.sleep(5)

pyautogui.press('enter')

# 等待连接窗口加载

time.sleep(2)
  

# 输入密码

pyautogui.typewrite(password)

pyautogui.press('tab')

  

# 输入第二个密码

pyautogui.typewrite(second_password)

pyautogui.press('enter')

  

# 等待Duo连接完成

time.sleep(15)

# 这里再手机上确认后，还有一个点击确认的按钮的步骤，直接电脑操作了，因为duo这个绕不过去，必须人在手机上点

print("VPN 连接请求已发送。")
```