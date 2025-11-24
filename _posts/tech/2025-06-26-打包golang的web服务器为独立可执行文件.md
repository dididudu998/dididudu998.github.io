---
layout: post
title: 打包golang web服务器可执行文件为单文件
category: tech
tags:
  - golang
  - gin
  - 打包
description: 如果你也像我一样经常工作于Windows和Linux，那么这篇文章值得一看
---
前段时间写了golang的gin程序想着要打包一个独立的可执行文件，但是用embed试了下，没成功，趁着快要下班了，觉得还是再试试。发现下面的方式可行。

结构如下：

mytest
   main.go
   templates/
	   index.html

这个是main.go文件
```golang
package main
import (
	"embed"
	"fmt"
	"html/template"
	"net/http"
)

type DataRow struct {
	ID int
	Name string
	Aget int
}

//go:embed templates/index.html
var fs embed.FS

func main(){
	teplBytes,err:=fs.ReadFile("templates/index.html")
	if err!=nil{
		panic(err)
		}
		tmpl,err:=template.New("index.html").Parse(string(tmplBytes))
		if err!=nil{
			panic(err)
		}
	data:=[]DataRow{
		{ID:1,Name:"Alice",Age:30},
		{ID:2,Name:"Bob",Age:33},
		{ID:3,Name:"Charlie",Age:23},
	}

http.HandleFunc("/",func(w http.ResponseWriter, r *http.Request){
	err:=tmpl.ExecuteTemplate(w,"index.html",data)
	if err!=nil{
		http.Error(w,err.Error(),http.StatusInternalServerError)
	
	}
})

fmt.Println("server listening on port 6060")
http.ListenAndServe(":6060",nil)

}
```

下面是在templates目录下创建的index.html文件

```html
<html>
<head>
<title>Test</title>
</head>
<body>
<h1>Data table</h1>
<table>
<thead>
<tr>
<th>ID</th>
<th>Name</th>
<th>Age</th>
</tr>
</thead>
<tbody>
{{range .}}
<tr>
<td>{{.ID}}</td>
<td>{{.Name}}</td>
<td>{{.Age}}</td>
</tr>
{{end}}
</tbody>
</table>
</body>
</html>
```

然后执行编译：
go build -ldflags="-s -w" main.go

此时生成的可执行文件，可以拷贝到其他地方也能正常的进行web访问了。