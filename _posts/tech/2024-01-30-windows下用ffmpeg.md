---
layout: post
title: Windows下使用ffmpeg
category: tech
tags:
  - Windows
  - ffmpeg
description:
---

# windows 下使用ffmpeg

其实是两个事情，在手机上装了termux，装了yt-dlp，然后装了ffmpeg，可以从youtube上下载完整的音乐专辑，然后有的是演唱会模式的，所以用ffmpeg转为mp3.

台式机上面用的windows，有时候听youtube的时候，顺手也就可以这么干。

```shell

1. pip install yt-dlp
2. choco install ffmpeg-full  //in administrator mode， powershell)
3. pip install tldr //it can help you to understand the command
4. tldr ffmpeg

C:\WINDOWS\system32>tldr ffmpeg

  ffmpeg

  Video conversion tool.
  More information: https://ffmpeg.org.

  - Extract the sound from a video and save it as MP3:
    ffmpeg -i path/to/video.mp4 -vn path/to/sound.mp3

  - Save a video as GIF, scaling the height to 1000px and setting framerate to 15:
    ffmpeg -i path/to/video.mp4 -vf 'scale=-1:1000' -r 15 path/to/output.gif

  - Combine numbered images (`frame_1.jpg`, `frame_2.jpg`, etc) into a video or GIF:
    ffmpeg -i path/to/frame_%d.jpg -f image2 video.mpg|video.gif

  - Quickly extract a single frame from a video at time mm:ss and save it as a 128x128 resolution image:
    ffmpeg -ss mm:ss -i path/to/video.mp4 -frames 1 -s 128x128 -f image2 path/to/image.png

  - Trim a video from a given start time mm:ss to an end time mm2:ss2 (omit the -to flag to trim till the end):
    ffmpeg -ss mm:ss -to mm2:ss2 -i path/to/video.mp4 -codec copy path/to/output.mp4

  - Convert AVI video to MP4. AAC Audio @ 128kbit, h264 Video @ CRF 23:
    ffmpeg -i path/to/input_video.avi -codec:a aac -b:a 128k -codec:v libx264 -crf 23 path/to/output_video.mp4

  - Remux MKV video to MP4 without re-encoding audio or video streams:
    ffmpeg -i path/to/input_video.mkv -codec copy path/to/output_video.mp4

  - Convert MP4 video to VP9 codec. For the best quality, use a CRF value (recommended range 15-35) and -b:v MUST be 0:
    ffmpeg -i path/to/input_video.mp4 -codec:v libvpx-vp9 -crf 30 -b:v 0 -codec:a libopus -vbr on -threads number_of_threads path/to/output_video.webm

5. 这里的对于时间截取的部分非常友好，提取一个专辑中的特别的歌曲非常有用。
6. 然后windows中的话，直接自带的media player就可以满足基本的音频播放了。

```

最近听二手玫瑰和恰克飞鸟。