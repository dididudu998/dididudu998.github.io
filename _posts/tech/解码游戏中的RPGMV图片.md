---
layout: post
title: 解码游戏中的RPGMV图片
category: 看书
tags: [书籍,阅读,记录,游戏,文件解密]
---

兴趣是最好的老师！

昨天下午随意发现了一款游戏。晚上打开玩了一下，发现画风很好，但是我又没有时间耗费玩通关。所以想要将游戏的图片都保留下来看看。

发现这个游戏文件夹下有data目录，而且还有img/picture目录，为什么关注这个目录呢，因为这个picture目录是img下面文件大小最大的目录，这个一般就是真实的游戏图片目录了。

picture目录下的文件都是.png_的后缀，我用lmhex打开一个文件看了下，编码类似如下：

![[Pasted image 20260509154948.png]]

```hex
52 50 47 4D 56 00 00 00 00 03 01 00 00 00 00 00 A4 D1 F7 E0 E1 64 37 B8 34 05 21 8C 6B 57 CD CB 00 00 02 40 00 00 01 80 08 06 00 00 00 45 9A DD 1F 00 00 20 00 49 44 41 54 78 DA EC 9D 07 58 16 C7 D6 C7 AD
```


这里的52 50 47 4D 56用ASCII码解析就是RPGMV格式的magic number。

然后编码中还有IDAT的字样，这个是PNG图片块。说明图片内容是明文的。

很好，确定了真实的文件格式了。这个文件大概率是使用RPG maker加密过的PNG图片了。

现在我要想办法解密它。

通过搜索，这种加密方式通常采用的是： png+异或+key的方式，而且默认RPGMV只对PNG文件的前16个字节做XOR。还有我需要知道异或用的key是什么。
同样的搜索下知道RPGMV的key一般存在system.json文件里面，这个一下子就找到了，在游戏目录下面的data文件夹下的system.json,打开搜索下encryption，直接就找到了key。

这下好了。写一个简单的代码尝试解压一个文件看看能不能成功。

```python
#2d81b9a7ec6e2db234052181221f8999

from pathlib import Path
import sys

# =========================================
# 用法:
#
# python decrypt_rpgmv.py input.rpgmvp output.png KEY
#
# 例子:
#
# python decrypt_rpgmv.py Actor1.rpgmvp Actor1.png \
# 00112233445566778899AABBCCDDEEFF
#
# =========================================


PNG_MAGIC = bytes([
    0x89, 0x50, 0x4E, 0x47,
    0x0D, 0x0A, 0x1A, 0x0A
])

RPGMV_HEADER_SIZE = 16


def decrypt_rpgmvp(input_file, output_file, key_hex):
    key = bytes.fromhex(key_hex)

    with open(input_file, "rb") as f:
        data = bytearray(f.read())

    # 检查文件头
    if data[:4] != b"RPGM":
        print("[-] Not a RPGMV encrypted file")
        return

    print("[+] RPGMV header detected")

    # 去掉16字节头
    encrypted_data = data[RPGMV_HEADER_SIZE:]

    # 只解密前16字节
    decrypt_len = min(16, len(encrypted_data), len(key))

    for i in range(decrypt_len):
        encrypted_data[i] ^= key[i]

    # PNG 文件头检查
    if encrypted_data[:8] == PNG_MAGIC:
        print("[+] PNG header restored successfully")
    else:
        print("[!] Warning: PNG header mismatch")
        print("    key may be incorrect")

    with open(output_file, "wb") as f:
        f.write(encrypted_data)

    print(f"[+] Saved to: {output_file}")


def main():
    if len(sys.argv) != 4:
        print("Usage:")
        print("python decrypt_rpgmv.py input.rpgmvp output.png KEY")
        return

    input_file = sys.argv[1]
    output_file = sys.argv[2]
    key_hex = sys.argv[3]

    decrypt_rpgmvp(input_file, output_file, key_hex)


if __name__ == "__main__":
    main()
```


试了下，果然可以解码.png_文件到可以打开的图片文件。

剩下来就是解密整个picture文件夹了，这个文件夹有1.5GB大小，需要写个批处理了。见下面完整代码：

```python
from pathlib import Path
import sys

RPGMV_HEADER_SIZE = 16

PNG_MAGIC = bytes([
    0x89, 0x50, 0x4E, 0x47,
    0x0D, 0x0A, 0x1A, 0x0A
])


def is_rpgmv(path):
    try:
        with open(path, "rb") as f:
            return f.read(4) == b"RPGM"
    except:
        return False


def decrypt_file(src, dst, key):

    with open(src, "rb") as f:
        data = bytearray(f.read())

    encrypted = data[RPGMV_HEADER_SIZE:]

    for i in range(min(16, len(encrypted), len(key))):
        encrypted[i] ^= key[i]

    if encrypted[:8] != PNG_MAGIC:
        print(f"[WARN] PNG header mismatch: {src.name}")

    dst.parent.mkdir(parents=True, exist_ok=True)

    with open(dst, "wb") as f:
        f.write(encrypted)


def main():

    if len(sys.argv) != 4:
        print("Usage:")
        print("python batch_decrypt_any.py input_dir output_dir KEY")
        return

    input_dir = Path(sys.argv[1]).resolve()
    output_dir = Path(sys.argv[2]).resolve()
    key = bytes.fromhex(sys.argv[3])

    files = list(input_dir.rglob("*"))

    total = 0
    ok = 0

    for file in files:

        if not file.is_file():
            continue

        if not is_rpgmv(file):
            continue

        total += 1

        try:
            rel = file.relative_to(input_dir)

            # 去掉最后一个 "_" 并改成 png
            name = rel.name
            if name.endswith("_"):
                name = name[:-1]

            out = output_dir / rel.parent / name

            if out.suffix == "":
                out = out.with_suffix(".png")

            decrypt_file(file, out, key)

            print(f"[OK] {rel}")
            ok += 1

        except Exception as e:
            print(f"[FAIL] {file}")
            print(e)

    print()
    print("====== RESULT ======")
    print("Detected RPGMV files:", total)
    print("Decrypted:", ok)


if __name__ == "__main__":
    main()
```



![[Pasted image 20260509155026.png]]

然后我就可以在输出的文件夹里面挨个的欣赏美图了。

