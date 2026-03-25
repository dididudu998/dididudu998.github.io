---
layout: post
title: Windows下用VIM
category: 学习
tags:
  - vim
  - powershell
  - 编辑器
---
不知道为啥notepad++有时候打开个文件会卡那么一点点，查了下说是打开的标签也太多了导致的，或许，这个现象促使我想要用linux上面的vim来作为日常看文档或者代码了。

# 实现步骤


## 下载neovim

这个有windows的msi安装包版本，直接安装就好了

## 配置init.vim


创建对应的目录：C:\Users\Mark\AppData\Local\nvim

如果nvim这个文件夹不存在，那就手动创建一个.

为了确保创建的init.vim中的插件可以马上启用，需要安装个插件vim plugin manager.

它会在C:\Users\Mark\AppData\Local\nvim\autoload目录下，clone plug.vim过来。

用powershell运行下面的命令即可。

```powershell
iwr -useb https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim `
>   | ni $env:LOCALAPPDATA\nvim\autoload\plug.vim -Force
```


然后在这个文件夹下面C:\Users\Mark\AppData\Local\nvim下创建init.vim文件。

内容如下：

```bash
" === Leader key ===
let mapleader = " "

" === 基础设置 ===
set number
set relativenumber
set mouse=a
set encoding=utf-8
set clipboard=unnamedplus

" === 缩进 ===
set tabstop=4
set shiftwidth=4
set expandtab
set autoindent

" === 搜索 ===
set ignorecase
set smartcase
set incsearch
set hlsearch


call plug#begin('~/.local/share/nvim/plugged')
Plug 'preservim/nerdtree'
Plug 'sheerun/vim-polyglot'      " 语法高亮

Plug 'junegunn/fzf', { 'do': { -> fzf#install() } }
Plug 'junegunn/fzf.vim'


" 状态栏
Plug 'vim-airline/vim-airline'
" 自动补全
Plug 'neoclide/coc.nvim', {'branch': 'release'}
call plug#end()


" =========================
" NERDTree 配置
" =========================
nnoremap <leader>n :NERDTreeToggle<CR>

" 打开 vim 自动定位当前文件
nnoremap <leader>f :NERDTreeFind<CR>

" 启动 vim 自动打开 NERDTree
autocmd VimEnter * NERDTree




"Let NERDTreeShowHidden=1




" =========================
" coc.nvim 基本配置
" =========================
set signcolumn=yes

" Tab 补全
inoremap <silent><expr> <TAB>
      \ pumvisible() ? "\<C-n>" :
      \ <SID>check_back_space() ? "\<TAB>" :
      \ coc#refresh()

inoremap <expr><S-TAB> pumvisible() ? "\<C-p>" : "\<C-h>"

function! s:check_back_space() abort
  let col = col('.') - 1
  return !col || getline('.')[col - 1]  =~# '\s'
endfunction

" 回车确认补全
inoremap <silent><expr> <CR> pumvisible() ? coc#_select_confirm() : "\<CR>"

" 跳转定义
nmap gd <Plug>(coc-definition)

" 查看文档
nnoremap K :call CocActionAsync('doHover')<CR>


" === LSP / Symbol ===
nnoremap <leader>o :CocList outline<CR>
nnoremap <leader>s :CocList symbols<CR>
nnoremap <leader>r <Plug>(coc-references)


" === Window split ===
nnoremap <leader>v :vsplit<CR>
nnoremap <leader>h :split<CR>
nnoremap <leader>c :close<CR>
nnoremap <leader>= <C-w>=



" === Markdown Preview ===
nnoremap <leader>mp :CocCommand markdown-preview-enhanced.openPreview<CR>
nnoremap <leader>mc :CocCommand markdown-preview-enhanced.closePreview<CR>


nnoremap <leader>p :Files<CR>
nnoremap <leader>b :Buffers<CR>
nnoremap <leader>r :Rg<CR>
nnoremap <leader>h :History<CR>
```

## 安装插件

进入powershell终端窗口或者cmd命令行窗口，运行nvim

然后:PlugInstall等待安装完毕

安装完毕后，由于对于不同的语言的支持需要单独安装，所以需要使用下面的指令：

:CocInstall coc-html coc-yaml coc-css coc-json coc-clangd coc-go coc-pyright

将针对html这些文件，以及go，python，c/c++的支持加上


## 简单说明

然后空格键作为leader键，使用快捷键n，f，m等这些可以做一些操作。

ctrl+w切换窗口，sp，vs用于分屏这些

/用于查找，这些慢慢用就好了。

主要是速度就是特别快啊。

清凉的感觉。


