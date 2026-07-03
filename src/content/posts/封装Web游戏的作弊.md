---
title: "封装的web游戏的作弊"
published: 2026-05-07
draft: false
category: "tech"
tags: ["游戏", "解密", "开发模式"]
---

继续游戏相关的问题。

玩游戏最多的使用就是修改器。最常用的是cheat engine，这个对于类似红警2这样的游戏非常友好。但是对于封装过的游戏就不行了。比如通过NW.js打包的RPG maker MV游戏，cheat engine是扫不到对应的内存的。

由于游戏的机理是浏览器+JavaScript，所以我们只需要开启游戏的debug模式就能够利用浏览器开发者模式进行调控。

进入游戏目录，找到package.json文件，建议修改package.json前保留一份原始副本。
修改为如下的形式：

```json
"name": "mygame",
"main": "index.html",
"chromium-args": "--remote-debugging-port=9222 --force-color-profile=srgb --enable-logging",
```

将chromium-args中禁止调试的参数去掉，增加允许远程调试的参数 --remote-debugging-port=9222，这样可以方便使用chrome://inspect进行调试

--enable-logging:是启用日志输出

修改后保存，然后重启游戏。

重启游戏后，打开chrome浏览器，在地址栏输入chrome://inspect
点击configure按钮，添加localhost:9222,然后确认

![[Pasted image 20260510130059.png|697]]看到上面有2个，我们选择index.html的这个对应的inspect按钮进入开发者工具控制台，然后就和调试网页一样了。

首先我们还是得看看data目录下js的一些信息，否则对于属性不了解，就没法发组偶下面的配置。

```javascript
// 我们的主角色的ID是1，因为_actorId:1
const actor=$gameActors.actor(1);

// 然后输入actor，就能看到对应的属性

// 我们这里可以直接设置生命值，灵力值和怒气值都最大

actor._hp=99999
actor._mp=99999
actor._tp=99999


// 修改8项属性的额外加成，顺序对应：[HP加成, MP加成, 攻击, 防御, 魔攻, 魔防, 敏捷, 幸运] // 全部设为99999后，最终属性会直接拉满，闪避（和敏捷强相关）也会到上限 
for (let i = 0; i < 8; i++) { 
	actor._paramPlus[i] = 99999; 
}

```

其他的以此类推，可以直接在开发者模式下，对数据的值双击进行修改，修改后在游戏中查看确认后，保存为游戏记录，下次读取记录后就是无敌模式了。

但是要注意，不要乱改，游戏的数据不是无限制的，搞不好，改出个负值出来，有可能游戏就进行不下去了。

不过这种调试非常简单，可以很快的恢复回来。一般的情况下都能够很快的掌握的。

可以让我玩游戏的时候更注意剧情，而不受游戏中敌人的能力值过大，而需要不断地修炼，耗费时间。


