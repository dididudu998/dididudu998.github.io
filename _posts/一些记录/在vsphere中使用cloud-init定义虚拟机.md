# 标准步骤

1. 到cloud-image.ubuntu.com下载对应的cloud-image镜像，这里下载ova格式的
2. 下载完成后，导入vsphere
3. 一般不需要特别的部署参数设定，磁盘，内存，cpu，网卡网段的问题可以后面进行虚拟机硬件配置的时候进行设定。
4. 对导入的这个虚拟机，在配置里面，将vapp options的选项关闭掉。
5. 对这个虚拟机转化为模版
6. 通过这个模版部署新的虚拟机。
7. 对这个新部署的虚拟机进行"VM Options"中"高级参数"的设定。
8. 增加一对key和value。分别是"guestinfo.metadata.encoding","guestinfo.userdata.encoding",它们的值可以为"base64"或者"gzip+base64". 不同的编码选项，要对数据进行不同的编码。还有guestinfo.metadata 和 guestinfo.userdata
9. 参考cloud-init的模版，建立userdata.yaml和metadata.yaml文件。
 > https://cloudinit.readthedocs.io/en/latest/reference/examples.html#yaml-examples
- userdata.yaml
 ```yaml
#cloud-config
users:
  - name: mark
    # passwd: $6$rounds=4096$4Jh2rwf9h2jM9TbQ$.CTSPJPIoIOUwKVo4A2Er19Deu945m/oD.JXVEGNH9g/piK.motblke/kpyPQ0npNKF.jZjzi61ZSBPGNbJyK/
    plain_text_passwd: secret1
    groups: sudo
    sudo: ALL=(ALL) NOPASSWD:ALL
    shell: /bin/bash
    lock_passwd: false
```

- metadata.yaml
```yaml
preserve_hostname: false
local-hostname: markcaicaicai
hostname: markcaicaicai
manage_etc_hosts: true
network:
  version: 2
  ethernets:
    ens192:
      dhcp4: false
      match:
      macaddress: 00:50:56:b4:b2:0b
      addresses:
        - 192.168.30.199/24
      gateway4: 192.168.30.1
      nameservers:
        addresses:
          - 192.168.30.2
timezone: America/New_York
```

10. 对建立好的yaml文件，获取对应的编码：例如base64 -i userdata.yaml
11. 如果是gzip+base64的，那就cat userdata.yaml |gzip|base64
12. 添加key，value到vm的高级参数中。分别是encoding和data，data需要用编码的格式，而不能是明文
13. 设定好后，保存。对虚拟机进行开机操作。即可实现我们data中描述的配置。


## 使用powercli来进行设定的实现

原帖在这里： https://williamlam.com/2022/07/exploring-the-cloud-init-datasource-for-vmware-guestinfo-using-vsphere.html

```powershell
connect-viserver vcenter -user admin -passwd password
$template=get-vm -name "ubuntu-cloud-img-golden-template"
# clone this template, always keep the golden template
new-vm -name "vm-test" -datastore "datastore" -template $template -resourcepool "resourcepool"

$vm=get-vm -name "vm-test"
$vm | New-AdvancedSetting -Name "guestinfo.metadata.encoding" -Value "gzip+base64" -Confirm:$false
$vm | New-AdvancedSetting -Name "guestinfo.userdata.encoding" -Value "gzip+base64" -Confirm:$false
# cat metadata.yaml |gzip|base64
$metadata = "H4sIAJRC12IAA22PXW7EIAyE33MKX4AUWIKCb+OA00S7CxJGXe3tS9Ssqv5IfvDnGY/sPUujHFntCcEv5Cc/OWUmtyiX1kXNF51UsnrlOJNZXRpuJdJNbUVapjsj1BKvTxWUNsO/w8ztUeoVB4APrrKXjGA7cNu4dlEOpWMWE+xXD3CnFrcXHBgppcoiCFrj1MsjBdQOnT9dp4HltaagB47Gz+NFjyaEN+tO5Z0aP+jp8IfjFI8HhOtx6/cBf8J/xdvhEy09s3lJAQAA"
$vm | New-AdvancedSetting -Name "guestinfo.metadata" -Value $metadata -Confirm:$false

$userdata = "H4sIAE8M12IAAx2OQQuCMBiG7/sVg46xViBCggcpMC2lLruGzbkGc5PtM3O/vtF7eS4PD++Gazv3hFszKIkWp0A8B6WFzxDBwnDbKyMzLMP2lSYI4yiCMJDhS+KrokivhzKCtlXgpmZ76VZ/ZKeGNivXTbizOrTsFjzVhTzTh/WhlEVcnsfW1ME7wxTGiX7GpXOCyFl4UGaw5H9LGQWk76DzdnZc7OAL6AduOZpxsQAAAA=="
$vm | New-AdvancedSetting -Name "guestinfo.userdata" -Value $userdata -Confirm:$false
start-vm "vm-test" 
```

也可以使用自定义部署的方式来实现这个：

```powershell

# Variables
$vc = "vc1.glacier.local"
$newvm = "Example VM"
$template = "Server 2012 R2 Template"
$custspec = "2012R2_DataCenter_PowerCLI"
$portgroup = "VLAN20-Servers"

# Add the required PowerCLI snapin/module
try
    {
    Import-Module VMware.VimAutomation.Vds -ErrorAction Stop
    Write-Host -ForegroundColor Yellow -BackgroundColor Black "Status: PowerCLI version 6.0+ found."
    }
catch
    {
    try {Add-PSSnapin VMware.VimAutomation.Vds -ErrorAction Stop} catch {throw "You are missing the VMware.VimAutomation.Vds snapin"}
    Write-Host -ForegroundColor Yellow -BackgroundColor Black "Status: PowerCLI prior to version 6.0 found."
    }

# Connect to vCenter
Connect-VIServer $vc | Out-Null

# Update the Customization Specification
Get-OSCustomizationSpec $custspec `
| Get-OSCustomizationNicMapping `
| Set-OSCustomizationNicMapping `
-IpMode:UseStaticIP `
-IpAddress (Read-Host "IP Address: ") `
-SubnetMask (Read-Host "Subnet Mask: ") `
-Dns (Read-Host "DNS Server IP: ") `
-DefaultGateway (Read-Host "Default Gateway IP: ")

# Clone the VM
New-VM -VM $template -Name $newvm -LinkedClone -ReferenceSnapshot "LinkedClone" -Location (Get-Folder Staging) -ResourcePool (Get-Cluster Lab) -OSCustomizationSpec $custspec

# Move VM to correct port group
try {Get-VM $newvm | Get-NetworkAdapter | Set-NetworkAdapter -NetworkName $portgroup -Confirm:$false -ErrorAction Stop}
catch {break}
```