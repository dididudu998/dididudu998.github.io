'''
File: get-adguard-and-convert-bind-format.py
File Created: Thursday, 17th February 2022 10:31:19 am
Author: Mark S (miaomiaomi@outlook.com)
-----
Last Modified: Thursday, 17th February 2022 10:31:50 am
Modified By: Mark S (miaomiaomi@outlook.com>)
-----
Copyright MarkShi
'''

# 先下载urlhaus的adblock文件，名字为urlhaus.rpz
# 然后再对下载的adguard文件进行转化
# 将转后后的文件附加在urlhaus.rpz后面



import requests
import os
import datetime
import smtplib
from email.mime.text import MIMEText
from email.header import Header

#remove old files
os.rename("urlhaus.rpz", "urlhaus.rpz.old")
os.rename("adguard.txt", "adguard.txt.old")
os.rename("myadguard.txt", "myadguard.txt.old")


urlhause=requests.get("https://urlhaus.abuse.ch/downloads/rpz/")
with open("urlhaus.rpz","wb") as f:
    f.write(urlhause.content)

# get adguard.txt from github

file=requests.get("https://anti-ad.net/adguard.txt")
with open("adguard.txt","w") as f:
    f.write(file.text)

# convert adguard.txt to bind format

data=open("adguard.txt","r").readlines()
for line in data:
    if "||" in line:
        line=line.split("||")[1].strip()
        line=line.split("^")[0].strip()
        line=line+" "+"CNAME"+" "+"."
        with open("myadguard.txt","w") as f:
            f.write(line+"\n")
'''
因为可以使用$INCLUDE的方式插入这个文件到urlhaus.rpz中，所以合并文件的部分不需要操作了。
'''
#merge myadguard.txt and urlhaus.rpz
for line in open("myadguard.txt","r").readlines():
    with open("urlhaus.rpz","a") as f:
        f.write(line)

#restart bind 

os.system("systemctl restart named")

# show bind status
# os.system("systemctl status named")

# get os.system("systemctl status named") output

named_status=os.popen("systemctl status named").read()


# mail me the task is done

timestamp=datetime.datetime.now()
timestamp_str=timestamp.strftime("%Y-%m-%d %H:%M:%S")

####email me the information
text=("Hi Mark,\n"
    "there rpz data update at "+timestamp_str+"\n"+
    "and the bind status is:\n"+named_status+"\n")


msg=MIMEText(text,'plain')
msg['subject']="update adguard.txt and urlhaus.rpz is done"

msg['From'] = "myrpz@shanghai.nyu.edu"
msg['To']="ls3686@nyu.edu"
#msg['BCc']=username+'@nyu.edu' #发给使用者。

s=smtplib.SMTP('smtp.nyu.edu')
s.send_message(msg)
s.quit()
print("email sent")