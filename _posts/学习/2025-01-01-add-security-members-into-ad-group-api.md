---
layout: post
title: add-domain-user-into-ad-security-group-api
category: operation
tags: [activedirecoty,web,api]
---
获得一个简单需求，要能够比较简单的将一些用户添加到安全组里面去，然后根据规则，对这个安全组的人员的网络进行限制。

大概用了2个小时的时间完成整个工作。

主要思路就是提供一个api，然后按照add，delete，list这样的动作来进行添加，删除和列表这个安全组的成员。

用法：
添加：https://server/add?user=user1
删除：https://server/delete?user=user1
列表：https://server/list

用的是golang实现。

代码如下：

```go  

package main

  

import (

    "crypto/tls"

    "fmt"

    "io"

    "log"

    "net"

    "net/http"

    "os"

    "path/filepath"

    "strings"

    "time"

  

    "github.com/gin-gonic/gin"

    "github.com/go-ldap/ldap/v3"

)

  
//定义连接参数

const (

    adServer    = "ldaps://domaincontroller:636"

    adUser      = "account@example.com"

    adPassword  = "xxxxxx"

    adGroupDN   = "CN=limited_sc,OU=Groups,dc=example,dc=com"

    logDir      = "logs"

    logFile     = "add-netid-into-vpn-group.log"

    certFile    = "server.crt"

    keyFile     = "server.key"

    port        = ":443"

    ldapTimeout = 10 * time.Second

)

  

// Add this init function at the beginning of the file

func init() {

    // Create logs directory if it doesn't exist

    if err := os.MkdirAll(logDir, 0755); err != nil {

        log.Fatalf("Failed to create log directory: %v", err)

    }

  

    // Open log file with append mode

    logPath := filepath.Join(logDir, logFile)

    file, err := os.OpenFile(logPath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)

    if err != nil {

        log.Fatalf("Failed to open log file: %v", err)

    }

  

    // Set stdout to be unbuffered

  

  

    // Use MultiWriter to write to both file and console

    

  

}

  

// Update the logAction function to include both file logging and console output

func logAction(clientIP, action, details string) {

    ....
        timestamp, clientIP, action, details)

  

    //log.Print(logMessage)

  

    // Flush the output to ensure it appears immediately

    if f, ok := log.Writer().(*os.File); ok {

        f.Sync() // Ensure the output is flushed

    } else {

        // If log.Writer() is not a file, we can use log.Output to flush

        log.Output(2, logMessage) // Adjust the call to ensure immediate output

    }

}

  

func isIPAllowed(ipStr string) bool {

    // Handle empty IP

    if ipStr == "" {

        return false

    }

  

    allowedNetwork := "192.168.10.0/23" // or your specific network

    ip := net.ParseIP(ipStr)

    if ip == nil {

        log.Printf("Failed to parse IP: %s", ipStr)

        return false

    }

  

    _, subnet, err := net.ParseCIDR(allowedNetwork)

    if err != nil {

        log.Printf("Failed to parse CIDR: %v", err)

        return false

    }

  

    return subnet.Contains(ip)

}

  

func dialLDAP() (*ldap.Conn, error) {

    dialer := &net.Dialer{Timeout: ldapTimeout}

    conn, err := ldap.DialURL(

        adServer,

        ldap.DialWithDialer(dialer),

        ldap.DialWithTLSConfig(&tls.Config{InsecureSkipVerify: true}),

    )

    if err != nil {

        return nil, fmt.Errorf("failed to connect to AD: %v", err)

    }

    return conn, nil

}

  

func listGroupMembers() ([]string, error) {

    conn, err := dialLDAP()

    if err != nil {

        return nil, fmt.Errorf("failed to connect to AD: %v", err)

    }

    defer conn.Close()

  

    err = conn.Bind(adUser, adPassword)

    if err != nil {

        return nil, fmt.Errorf("failed to bind to AD: %v", err)

    }

  

    searchRequest := ldap.NewSearchRequest(

        ....
        nil,

    )

  

    result, err := conn.Search(searchRequest)

    if err != nil {

        return nil, fmt.Errorf("failed to search group: %v", err)

    }

  

    if len(result.Entries) == 0 {

        return nil, fmt.Errorf("group not found")

    }

  

    members := []string{}

    for _, member := range result.Entries[0].GetAttributeValues("member") {

        // Extract CN from DN

        cn := strings.Split(member, ",")[0]

        cn = strings.TrimPrefix(cn, "CN=")

        members = append(members, cn)

    }

  

    return members, nil

}

  

func addUserToGroup(userDN string) error {

    conn, err := dialLDAP()

    if err != nil {

        return err

    }

    defer conn.Close()

  

    err = conn.Bind(adUser, adPassword)

    if err != nil {

        return fmt.Errorf("failed to bind to AD: %v", err)

    }

  

    modifyReq := ldap.NewModifyRequest(adGroupDN, nil)

    modifyReq.Add("member", []string{userDN})

  

    // 使用普通的 Modify 方法，因为 ModifyWithContext 不可用

    err = conn.Modify(modifyReq)

    if err != nil {

        return fmt.Errorf("failed to add user to group: %v", err)

    }

  

    return nil

}

  

func removeUserFromGroup(userDN string) error {

    conn, err := dialLDAP()

    if err != nil {

        return err

    }

    defer conn.Close()

  

    err = conn.Bind(adUser, adPassword)

    if err != nil {

        return fmt.Errorf("failed to bind to AD: %v", err)

    }

  

    modifyReq := ldap.NewModifyRequest(adGroupDN, nil)

    modifyReq.Delete("member", []string{userDN})

  

    // 使用普通的 Modify 方法，而不是 ModifyWithContext

    err = conn.Modify(modifyReq)

    if err != nil {

        return fmt.Errorf("failed to remove user from group: %v", err)

    }

  

    return nil

}

  

// Add this type for error response

type ErrorResponse struct {

    Error   string `json:"error"`

    Time    string `json:"time"`

    Details string `json:"details"`

}

  

// Add middleware for IP checking

func checkIPMiddleware() gin.HandlerFunc {

    return func(c *gin.Context) {

        // Try X-Real-IP header first

        ....
            }

        }

  

        // If no proxy headers, use RemoteAddr

        if ip == "" {

            ip = c.ClientIP()

        }

  

        ip = strings.TrimSpace(ip)

  

        if !isIPAllowed(ip) {

            c.JSON(http.StatusForbidden, ErrorResponse{

                Error:   "Access Denied",

                Time:    time.Now().Format("2006-01-02 15:04:05"),

                Details: fmt.Sprintf("IP %s is not allowed to access this service", ip),

            })

            logAction(ip, "ACCESS_DENIED", fmt.Sprintf("Attempted access from unauthorized IP: %s", ip))

            c.Abort()

            return

        }

        c.Next()

    }

}

  

// Update main function to use Gin

func main() {

    // Set Gin to release mode

    gin.SetMode(gin.ReleaseMode)

  

    r := gin.New()

    // Use Recovery middleware

    r.Use(gin.Recovery())

    // Apply IP check middleware to all routes

    r.Use(checkIPMiddleware())

  

    // Add endpoint

    r.GET("/add", func(c *gin.Context) {

        clientIP := c.ClientIP()

        userAccount := c.Query("user")

  

        if userAccount == "" {

            ....
            })

            return

        }

  

        userDN := fmt.Sprintf("CN=%s,dc=example,dc=com", userAccount)

        ....
            })

            return

        }

  

        logAction(clientIP, "ADD_SUCCESS", fmt.Sprintf("user: %s", userAccount))

        c.String(http.StatusOK, "user %s added successfully", userAccount)

    })

  

    // List endpoint

    r.GET("/list", func(c *gin.Context) {

        clientIP := c.ClientIP()

        members, err := listGroupMembers()

        if err != nil {

            .....
            })

            return

        }

  

        logAction(clientIP, "LIST", fmt.Sprintf("total members: %d", len(members)))

        c.JSON(http.StatusOK, members)

    })

  

    // Delete endpoint

    r.GET("/delete", func(c *gin.Context) {

        clientIP := c.ClientIP()

        userAccount := c.Query("user")

  

        if userAccount == "" {

            c.JSON(http.StatusBadRequest, ErrorResponse{

                .....

            })

            return

        }

  

        userDN := fmt.Sprintf("CN=%s,dc=example,dc=com", userAccount)

        if err := removeUserFromGroup(userDN); err != nil {

          ....

          Details: err.Error(),

            })

            return

        }

  

        logAction(clientIP, "DELETE_SUCCESS", fmt.Sprintf("user: %s", userAccount))

        c.String(http.StatusOK, "user %s removed successfully", userAccount)

    })

  

    // Get certificate paths

    exePath, err := os.Executable()
	....
   

    // Check certificate files
	....
    

    
  

    // Log startup information

    log.Printf("Starting HTTPS server on port %s", port)

    log.Printf("Using certificate: %s", certPath)

    log.Printf("Using private key: %s", keyPath)

  

    // Start HTTPS server

    if err := r.RunTLS(port, certPath, keyPath); err != nil {

        log.Fatalf("Failed to start HTTPS server: %v", err)

    }

}

```