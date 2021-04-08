"""
p=3,q=11,e=7,M=5,求密文
"""

#先求出d
from Crypto.PublicKey import RSA
p=3
q=11
e=7
n=(p-1)*(q-1)
i=0
while True:
    if (1-n*i)%e==0:
        break;
    i-=1
print((1-n*i)/e)

输出为3.表示d=3.

pow(5,7) mod 20=5


def get_miwen(p,q,e,m):
    def get_d(p,q,e):
        n=(p-1)*(q-1)
        i=0
        while True:
            if (1-n*i)%e==0:
                break;
            i-=1
        return (1-n*i)/e
    return pow(m,get_d(p,q,e))%n



#已知密文求明文
e=5，n=35=5*7=(6-1)(8-1)
e=5,p=6,q=8,d=


#密文=pow(明文,e) mod n
#公钥=(e,n)
#私钥=(d,n)
#明文=pow(密文,d) mod n


# diffie-hellman

一个公共素数q，一个q的本源根p
A选择一个随机整数xa，xa需要大于q。作为自己的私钥
然后计算ya=pow(p,xa) mod q， 作为自己的 公钥
B选择一个随机整数xb，xb需要大于q。作为自己的私钥
yb=pow(p,xb) mod q，作为自己的公钥

共享密钥：
ka=pow(yb,xa) mod q
kb=pow(ya,xb) mod q

此时ka==kb




Step 1: Alice and Bob get public numbers P = 23, G = 9

Step 2: Alice selected a private key a = 4 and
        Bob selected a private key b = 3

Step 3: Alice and Bob compute public values
Alice:    x =(9^4 mod 23) = (6561 mod 23) = 6
Bob:    y = (9^3 mod 23) = (729 mod 23)  = 16

Step 4: Alice and Bob exchange public numbers

Step 5: Alice receives public key y =16 and
        Bob receives public key x = 6

Step 6: Alice and Bob compute symmetric keys
        Alice:  ka = y^a mod p = 65536 mod 23 = 9
        Bob:    kb = x^b mod p = 216 mod 23 = 9

Step 7: 9 is the shared secret.

