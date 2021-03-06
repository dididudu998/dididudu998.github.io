---
layout: post
title: 
category: daily
tags: [linux]
description: 像我一样经常工作于Windows和Linux，那么这篇文章值得一看
---

# 系统方面的问题

▲ 34 进程和线程之间有什么区别？

<a href="https://docs.microsoft.com/en-gb/windows/win32/procthread/about-processes-and-threads?redirectedfrom=MSDN">Microsoft explains</a>

Each process provides the resources needed to execute a program. A process has a virtual address space, executable code, open handles to system objects, a security context, a unique process identifier, environment variables, a priority class, minimum and maximum working set sizes, and at least one thread of execution. Each process is started with a single thread, often called the primary thread, but can create additional threads from any of its threads.

A thread is the entity within a process that can be scheduled for execution. All threads of a process share its virtual address space and system resources. In addition, each thread maintains exception handlers, a scheduling priority, thread local storage, a unique thread identifier, and a set of structures the system will use to save the thread context until it is scheduled. The thread context includes the thread's set of machine registers, the kernel stack, a thread environment block, and a user stack in the address space of the thread's process. Threads can also have their own security context, which can be used for impersonating clients.

<a href="https://www.backblaze.com/blog/whats-the-diff-programs-processes-and-threads/">backblaze</a>

每个进程有自己独立的内存地址，进程之间是隔离的。进程间的数据是不能直接访问的。

进程之间的切换需要一些时间，包括保存和调入registers（这个是CPU的入口），内存映射，以及其他的资源。

线程之间是共享内存地址和资源的，所以当某个进程里面的多个线程中的某个出现问题，会影响其他的线程。


操作系统的这样的管理方式，是为了保证当一个进程出现资源问题或者安全问题导致锁死和崩溃的时候，其他的进程不会受到影响，保证整体。


当一个进程启动的时候，操作系统会分配内存和其他的资源。进程中的线程会共享这些分配的内存和资源。如果单线程的进程，那么这个线程就是进程本身。




▲ 29 进程间有哪些通信方式？

进程通的目的：
- 将数据从一个进程发送到另一个进程的，进行数据传输
- 多个进程想要操作共享数据
- 一个进程向另外一个或者一组进程发送消息，或者通知某个事件
- 多个进程之间共享同样的资源。需要锁和同步机制
- 进程控制

linux可用的通信方式包括：

网上这里有位仁兄给了个总结，看这里<a href="https://www.jianshu.com/p/c1015f5ffa74">TyiMan</a>

- 管道

管道的实质是一个内核缓冲区，进程以先进先出的方式从缓冲区存取数据，管道一端的进程顺序的将数据写入缓冲区，另一端的进程则顺序的读出数据。
该缓冲区可以看做是一个循环队列，读和写的位置都是自动增长的，不能随意改变，一个数据只能被读一次，读出来以后在缓冲区就不复存在了。
当缓冲区读空或者写满时，有一定的规则控制相应的读进程或者写进程进入等待队列，当空的缓冲区有新数据写入或者满的缓冲区有数据读出来时，就唤醒等待队列中的进程继续读写。

作者：TyiMan
链接：https://www.jianshu.com/p/c1015f5ffa74
来源：简书
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。




流管道去除了半双工限制，可以双向传输。

有名管道可以允许无亲缘关系的进程之间通信。


- 信号


- 消息队列

消息队列是消息的链接表

- 共享内存


- 信号量


- 套接字

可用于不同的机器之间的进程的通信。

各种通信方式的比较和优缺点

管道：速度慢，容量有限，只有父子进程能通讯

FIFO：任何进程间都能通讯，但速度慢

消息队列：容量受到系统限制，且要注意第一次读的时候，要考虑上一次没有读完数据的问题

信号量：不能传递复杂消息，只能用来同步

共享内存区：能够很容易控制容量，速度快，但要保持同步，比如一个进程在写的时候，另一个进程要注意读写的问题，相当于线程中的线程安全，当然，共享内存区同样可以用作线程间通讯，不过没这个必要，线程间本来就已经共享了同一进程内的一块内存。


▲ 27 简述 socket 中 select 与 epoll 的使用场景以及区别，epoll 中水平触发以及边缘触发有什么不同？

socket的目的是设计并发的网络程序。

select的设计是这样的：当有I/O事件来的时候，select通知应用程序有事件了需要去处理，而应用程序必须轮询所有的FD集合，测试每个FD是否有事件发生，并处理事件。

epoll不仅会告诉应用程序有I/O需要处理，还会告诉应用程序相关的信息，这些信息是应用程序填充的，因此应用程序可以直接定位到事件，而不需要遍历FD集合。

select模型是对每隔进程的文件描述符进行管理，文件描述符由FD_SETSIZE设置，默认1024/2048，虽然可以修改，让select的最大并发数变大，但是由于select每次的调用都是扫描所有的FD的集合，并发变大，导致扫描的时间就变长，最糟糕的情况就是发生拥堵和超时。

select采取内存拷贝的方法，就是每次调用select，都需要把FD的集合从用户态拷贝到内核态。


epoll没有最大并发连接数的限制，一般来说和系统的内存有关系，内存越大可以打开的文件的数目就越大，可以看/proc/sys/fs/file-max，1G内存的机器可以打开10万左右的连接。

epoll只管理活动的连接，而不是所有的连接。

epoll使用共享内存，而不需要进行内存拷贝。



▲ 26 Linux 进程调度中有哪些常见算法以及策略？

参看这里<a href="https://blog.csdn.net/gatieme/article/details/51699889">linux进程调度器概述</a>

进程调度基本的要求：
低延迟，快速的进程反应时间
最大的系统利用，高的输出

实时进程调度策略有：
- 先进先出，实时处理

A First-In, First-Out real-time process. When the scheduler assigns the CPU to the process, it leaves the process descriptor in its current position in the runqueue list. If no other higher-priority real-time process is runnable, the process will continue to use the CPU as long as it wishes, even if other real-time processes having the same priority are runnable.

- 轮询实时处理

A Round Robin real-time process. When the scheduler assigns the CPU to the process, it puts the process descriptor at the end of the runqueue list. This policy ensures a fair assignment of CPU time to all SCHED_RR real-time processes that have the same priority.

- 其他

A conventional, time-shared process.
The policy field also encodes a SCHED_YIELD binary flag. This flag is set when the process invokes the sched_ yield( ) system call (a way of voluntarily relinquishing the processor without the need to start an I/O operation or go to sleep. The scheduler puts the process descriptor at the bottom of the runqueue list.



进程优先级
时间切片

公平调度算法： 每一个process会收到1/n个处理器时间，这里的n是所有在运行的process


▲ 18 操作系统如何申请以及管理内存的？
▲ 12 简单介绍进程调度的算法
▲ 11 简述 Linux 系统态与用户态，什么时候会进入系统态？
▲ 11 简述 LRU 算法及其实现方式
▲ 11 线程间有哪些通信方式？
▲ 8 简述同步与异步的区别，阻塞与非阻塞的区别
▲ 8 简述操作系统如何进行内存管理
▲ 7 简述操作系统中的缺页中断
▲ 3 简述操作系统中 malloc 的实现原理
▲ 2 BIO、NIO 有什么区别？怎么判断写文件时 Buffer 已经写满？简述 Linux 的 IO模型
▲ 1 进程空间从高位到低位都有些什么？






▲ 41 简述 TCP 三次握手以及四次挥手的流程。为什么需要三次握手以及四次挥手？
▲ 32 RestFul 与 RPC 的区别是什么？RestFul 的优点在哪里？
▲ 29 HTTP 与 HTTPS 有哪些区别？
▲ 26 RestFul 是什么？RestFul 请求的 URL 有什么特点？
▲ 23 一次 HTTP 的请求过程中发生了什么？
▲ 19 TCP 与 UDP 在网络协议中的哪一层，他们之间有什么区别？
▲ 18 TCP 中常见的拥塞控制算法有哪些？
▲ 17 TCP 怎么保证可靠传输？
▲ 17 从系统层面上，UDP如何保证尽量可靠？
▲ 8 TCP 的 keepalive 了解吗？说一说它和 http 的 keepalive 的区别？
▲ 8 简述 TCP 滑动窗口以及重传机制
▲ 8 简述 HTTP 1.0，1.1，2.0 的主要区别
▲ 7 简述 TCP 的 TIME_WAIT
▲ 5 HTTP 的方法有哪些？
▲ 4 简述 TCP 协议的延迟 ACK 和累计应答
▲ 1 简述 TCP 的报文头部结构
▲ 1 简述 TCP 半连接发生场景
▲ 1 什么是 SYN flood，如何防止这类攻击？



