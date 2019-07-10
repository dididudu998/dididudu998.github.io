---
layout: post
title: golang挂载网盘
category: tech
tags: [Linux]
description: 如果你也像我一样经常工作于Windows和Linux，那么这篇文章值得一看
---



# 问题

前段时间用的python和nodejs做了一些web的事情，主要用于显示和封装后端的一些指令。最近在学习golang，所以，看到有需求了，就想用golang来实现。

问题是golang的轮子不是很多，找起来比较麻烦，所以尽可能用系统内置的一些指令来执行最好。

下面用挂载网络盘这个最简单的需求来说，怎么样用golang的os.exec模块来实现。



# 过程

- 第一步是对用户进行身份验证，确保他的账户和密码输入是正确的
  - 此时需要调用身份验证的模块，这里有两个选择，第一个是用ldap的方式进行验证，一个是使用smb的方式进行验证
  - 因为这个挂载的是smb的，所以就选择smb的方式进行验证了，当然这两个选择哪个都是没有任何问题的，这里以smb为例了
- 调用windows的内置挂在网络盘的命令
  - 这里同样有两种方式，一种就是net use的，这个最简单，还有就是使用powershell的方式
  - powershell的方式在这个例子里面也包括，所以怎么用powershell的方式来进行挂载你也可以自己试试，这里以net use的方式来说明
- 给出成功/失败/错误的信息给管理者
  - 这个是个可选的，不过我还是做了。通过邮件的方式来实现。将输出信息发送邮件给管理者，确定谁在什么时候是否访问了他的网络盘
  - 最近喜欢搞一些监控类的小东西，所以很多时候都写了邮件通告的部分，可以直接拿来就用

好了，前面的思考部分结束，开始代码部分：

```go
package main

import (
	"fmt"
	"log"
	"os/exec"
	"syscall"
	"time" //发送邮件的时候用来确定时间的

	"github.com/stacktitan/smb/smb" //这个就是说的用来做smb验证的
	"golang.org/x/crypto/ssh/terminal" //这个是用来确保在console输入的密码安全的

	ps "github.com/bhendo/go-powershell" //这个是调用powershell的指令的
	"github.com/bhendo/go-powershell/backend"

	"gopkg.in/gomail.v2" //这个是用来发送邮件的
)
```



验证部分：

```go

func createsession(username, password string) {
	host := "fileserver.domain.com"
	options := smb.Options{
		Host:        host,
		Port:        445,
		User:        username,
		Domain:      "domain",
		Workstation: "",
		Password:    password,
	}
	debug := false
	session, err := smb.NewSession(options, debug)
	if err != nil {
		log.Fatalln("[!]", err)
	}
	//defer session.Close() //这里我将这条给注释掉了，其实是不应该的。我们的目的仅仅是验证用户名和密码，并不需要做其他的事情。

	if session.IsAuthenticated {
		log.Println("[+] Login successful")
	} else {
		log.Println("[-] Login failed")
	}

	if err != nil {
		log.Fatalln("[!]", err)
	}
}
```

挂载部分：

这段才是我要说的重点，虽然做了后觉得没什么大不了的，可是当第一次做的时候，还是有点不对劲，我当时用引号的方式，以及``的方式总是得出错误的结果，后来换成和python一样的用arrary的方式，就是ok了。

```go
func mountfolder(username,password string){
    //net use 挂载
    cmd:=`net`
    args:=[]string{`use`,"P:",`\\fileserver.domain.com\`+username,`/User:`+`domain\`+username,password}
    mount:=exec.Command(cmd,args...)
    if err:=mount.Run();err!=nil{
        log.Fatal(err)
    }
    
    //利用powershell修改挂载的名字，让好看点
    back:=&backend.Local{}
    shell,err:=ps.New(back)
    defer shell.Exit()
    stdout, _, err := shell.Execute(`(New-Object -com shell.application).namespace('P:').self.name='Personal'`)
	if err != nil {
		log.Fatal(err)
	}
    
    //调取exploer直接打开这个P盘
    cmd0:=exec.Command(`explorer`,`P:`)
    cmd0.Run()  //这里不在设定err返回的东西
    
}
```

根据返回的code值发送通告：

```go
func alertmail(username, code string) {
	etime := time.Now().Format(time.RFC850)
	//send email to owner about new file created and write
	m := gomail.NewMessage()
	m.SetHeader("From", "Personal_folder_access@domain.com")
	m.SetHeader("To", "xxx@domain.com")
	m.SetAddressHeader("Bcc", "YYY@domain.com", "Mark")
	m.SetHeader("Subject", "Personal Folder Access alert")

	switch code {
	case "not exist":
		m.SetBody("text/html", "<b>Alert</b>\n"+etime+"----"+username+"---"+"Personal Folder does not exist!")
	case "success":
		m.SetBody("text/html", "<b>Alert</b>\n"+etime+"----"+username+"---"+"Access the Personal Folder")
	default:
		m.SetBody("text/html", "<b>Alert</b>\n"+etime+"----"+username+"---"+"try to access the personl folder")
	}
	d := gomail.NewDialer("smtp.domain.com", 25, "", "")
	if err := d.DialAndSend(m); err != nil {
		log.Fatal(err)
	}
```

# 收尾部分

基本的主要程序部分就是这样的，其实在windows里面就那么一句话而已，但是既然是做programmer，还是用程序的思维来的比较顺一些。最后用go build生成exe，试了下，没问题。为了美观，可以借鉴下面的这个链接来实现添加icon以及添加版本信息，作者等的属性给到exe程序。

[embedded-icon-in-go-windows-application](https://xuri.me/2016/06/15/embedded-icon-in-go-windows-application.html)

# 总结

这段时间对于golang的使用算是婴儿期，知道了一些语法，使用上面还没有很熟练，但是总的来说golang更多的在后端系统层面是很优秀的，尤其对于信号通告以及多进程的使用上面。这个要比其他的预言好很多，系统的阻塞基本上都可以排除了。nodejs在web层面的nonblock也很棒，但是nodejs在系统编程方面不是很合适，python的主要问题是如果你做了个小程序，发出去后基本上是明文的。而且python的自身要依靠系统的，或者第三方的应用才能发挥出来。

每种语言都有比较合适的用于处理问题的方式，不同的问题，用不同的语言来搞定会更明智一些。这个只是一个例子，并不应该是真正的处理问题的方式。

加油！！！