---
layout: post
title: 将huggingface上下载的模型转化为safetensors的格式
category: AI
tags: [stablediffusion,AI,huggingface]
---

由于在 https://civitai.com/models 上下载模型太慢了，一秒钟只有几百kb的速度，实在是太耗费时间。所以想到直接到huggingface.io上面去下载，这个速度非常快，下载下来转化下格式应该就可以用了。说干就干，下面是步骤。

### 步骤

- 访问huggingface.co找到text-to-image这个标签，或者如果知道自己要下载什么模型直接搜模型名字
- 建议搞一个本地的虚拟环境
```cmd
python -m virtualenv myenv
.\myenv\Scripts\activate
```
- 安装diffusers
```cmd
pip install diffusers
```
- 用下面的代码下载模型，酌情进行修改吧，不需要生成图片，我们只需要下载模型即可
```python
from diffusers import StableDiffusionPipeline
model_id="emilianJR/chilloutmix_NiPrunedFp32Fix"
pipe=StableDiffusionPipeline.from_pretrained(model_id,torch_dtype=torch.float16)
pipe=pipe.to("cuda")
prompt="a girl"
image=pipe(prompt).images[0]
image.save("image.png")
```
- <font color=red>注意：这里的精度是float16，后面要用到，否则生成的模型用不了</font>
- 下载diffusers这个库，这里面有脚本工具用来进行转化的
```cmd
git clone https://github.com/huggingface/diffusers.git
```
- 找到从huggingface下载的模型的位置，Windows默认一般在这里：
 ```cmd
 c:\users\myaccount\.cache\huggingface\hub\models--emilianxxxFix\snapshots\xxxxx
 ```
 如果只是将文件位置指定为models--emilianxxx这里，则下面使用的转化工具将提示无法找到对应的unet或vae文件夹，不能执行转化操作。
 - 现在进入我们clone好的diffusers文件夹下面的Scripts目录
 - 可以看到有这样的一个脚本convert_diffusers_to_original_stable_diffusion.py
 - 下面就是进行转化的命令行
```cmd
python convert_diffusers_to_original_stable_diffusion.py --model_path c:\users\myaccount\.cache\huggingface\hub\models--emilianxxxFix\snapshots\xxxxx --checkpoint_path d:\mymodel\emilian.safetensors --half --use_safetensors
```
- 再次提醒： 命令行里面必须有--half这个参数，因为前面下载的是float16的，如果不加这个--half参数，转化后的模型在SD中调用的时候会报错，提示”safetensors_rust.SafetensorError: Error with deserializing header: HeaderTooLarge".
- 将转化后的模型emilian.safetensors移动到SD的models,Stable-diffusion目录下，就可以直接使用了。

### 总结

这里解决方法，第一用到了曲线下载模型库，第二转化模型到SD原生模式，第三将转化后的模型加载到SD模型库中的三个步骤。

从huggingface上下载模型速度很快，最高可以到5MB/s，转化速度也很快，下载的模型有5GB大小，转化大概只要20秒就完成了。

主要是要注意精度问题，如果不做调整，转化出来也不能用。

