---
layout: post
title: 安卓用twrp的时候不能挂载分区的问题
category: tech
tags: [手机,安卓,twrp,刷机]
description: 如果你也像我一样经常工作于Windows和Linux，那么这篇文章值得一看
---

# 背景

给家人买了一个新的荣耀9x手机替换用的红米note3，这个红米的电池有问题了，经常用着就自动关机了，我拿过来看了下，发现电池已经鼓包了，这个是一年前换的淘宝上面的电池，还所谓的原厂的，很垃圾啊。继续在淘宝花40块钱买一个新的电池，还能用啊。然后我又有第二张卡，所以就把这个note3拿过来，替换中国移动50块钱给的一个阿里云os的手机，这个移动的手机的系统很糟糕，各种封闭，而且自己做的还不够好。在这个移动的手机之前我的是小米3，在小米3之前是iPhone4，再下来是windows phone，就是htc的雷达。再前面是被称为神机的一个htc的，再前面是多普达的一个windows mobile。现在用的是红米note7，就是某晚上突发的买的那款，其实这个note7不是很合意。

# 问题

换过来的note3，仍然像往常一样刷aospextend的rom，但是发现这次的这个印度的小哥做的rom不是很ok啊，因为以前给小米3刷的aosp的rom的，那叫一个好，所以一有手机，就先上aosp找rom，这次看来是失败了。

再下来我看miui有开发版的rom，下载下来后，发现这个开发版的rom的root不完全啊，用rootexplorer依然不能够mount根目录，而且没发修改文件的权限啊。折腾了几个小时，还下载了google的全套，到后面也是给出厂化了，浪费几个小时。

想着换个魔趣的rom，没想到，现在魔趣的rom下载那叫一个慢，慢的要死，也是放弃了，累死了，何必。

想着不用miui自己的root了，换magisk试试，或许这个行呢。

下面是实现的步骤：

- 换个低版本的twrp版本，从3.3.1换到3.3.0
- twrp进去后，先选择wipe data分区，再选择高级wipe，在选择更改文件系统格式到ext2，应用，然后再选择修改文件格式为ext4，应用
- 参考的是另外一篇，但是忘记哪里了，就搜到下面的这篇[修复不能mount的问题](https://appuals.com/how-to-fix-twrp-unable-to-mount-storage-internal-storage-0mb/)
  
  ```json
  
  How to Fix TWRP Unable to Mount Storage
  
    The first thing to try is if somehow your internal storage became encrypted when using a legacy screen lock method.
    - Go to your Android device’s Settings > Security > Screen Lock, and change your screen lock method to either Pass or Pin. Create a new one.
    - Reboot into TWRP, and it should ask for a password – enter the pass or pin you just created.
    TWRP will attempt to decrypt your device’s internal storage, and if it succeeds, you should not have further issues. However, if this does not solve your issue of “unable to mount data, internal storage 0mb”, continue with the rest of this guide.
    - Reboot your device into TWRP again.
    Navigate to Wipe > Advance Wipe > Data, and choose Repair or Change File System.
    Press Repair File System to see if this fixes the issue. If not, continue.
    Press Change File System, choose Ext2, and swipe to confirm.
    Now switch back to Ext4 and swipe to confirm.
    Go back to TWRP main menu, then the Mount menu, and check if your partitions can be mounted now.
    If you are still unable to mount your partitions, you need to repair Internal partition, which will most likely wipe your internal storage.
    ```
- 修复后，可以挂载data分区了，这下应该是好了。
- 下载magisk的zip包，下载note3的开发者rom
- 在twrp下面刷进去
  - twrp直接在bootloader的情况下，用fastboot flash recovery twrp.img刷入
  - 用adb push note3rom.zip /sdcard的方式传rom到手机
- 刷完后，安装下rootexplore来检验magisk的root完整性，发现完美。
- 安装adaway，也可以更新host文件了。
- 小米这个经常搞不完全root，很糟糕，就像现在的note7一样，也是得第三方的root才成。


# 后记

note3 虽然已经是5年前的东西了，但是接电话，刷刷微博还是没问题的，电子产品现在这样的不让换电池的设置真的不喜欢啊，现在的一些安卓pad就是因为这个，电池坏了基本上就废了。

现在无力最早的ipad一代，还能用，就在旁边，装上老版本的adobe reader就能看pdf，装上我的文档就能狗无线上传文件，还有老版本的网易新闻等，我放到百度网盘里面了。

ipad1代看pdf大文件，nook看文字小说，合起来用挺好的。

我不喜欢将能用的东西扔掉，总想着挖掘下，直到没有法了再说。

