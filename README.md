<div align="center">

# 漢glish翻译器 / 漢glish Translator

> 中国人 and 日本人 can 相互交流 with 中学生 level 英語 and 漢字。——安处岛

[![中文](https://img.shields.io/badge/中文-日本語-red)](https://github.com/SternChiri/hanglish-translator/blob/main/README_JP.md)
[![Python](https://img.shields.io/badge/Python-3.11-blue)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-2.3.3-lightgrey)](https://flask.palletsprojects.com/)

[![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-D8BFD8)](https://sternchiri.github.io/hanglish-translator/)
[![Netfily](https://img.shields.io/badge/Netfily-20B2AA)](https://hanglish-translator.netlify.app/)

</div>

## 🌟 项目介绍 / Project Introduction


<div style="display: block;">

**漢glish翻译器**是一个线上翻译工具，专门用于将中文或日文转换为独特的 *漢glish*。这种语言使用汉字来表示名词，同时借用英语中的副词，让中日使用者能够用基础英语和汉字进行有效交流。

### 核心功能：
- 🔄 自动识别中文、日文 → 漢glish
- 🎯 汉字最大化保留策略
- ⚡ 异步处理支持长文本翻译

### 技术栈：
- 前端：HTML5 + CSS3 + JavaScript (GitHub Pages/Netfily)
- 后端：Python Flask + DeepSeek API (PythonAnywhere)

</div>

## 🚀 快速开始 / Quick Start

### 在线使用 / Online Usage
直接访问网站：
- GitHub Pages：[https://sternchiri.github.io/hanglish-translator/](https://sternchiri.github.io/hanglish-translator/)
- Netfily（国内直连）：[https://hanglish-translator.netlify.app/](https://hanglish-translator.netlify.app/)

### 本地开发 / Local Development

**前端开发：**
```bash
# 克隆项目
git clone https://github.com/sternchiri/hanglish-translator.git
cd hanglish-translator/frontend

# 使用本地服务器运行
python -m http.server 8000
# 或
npx serve .
```

**后端开发：**
```bash
cd backend

# 安装依赖
pip install -r requirements.txt

# 设置环境变量
export DEEPSEEK_API_KEY = sk-... # 你自己的API key

# 运行服务
python app.py
```

## 📖 使用指南 / Usage Guide

### 基本用法 / Basic Usage
1. **输入文本**：在原文区域输入中文或日文文本
2. **点击翻译**：点击翻译按钮开始转换
3. **查看结果**：在翻译结果区域查看漢glish格式的输出

### 功能特性 / Features
- **语言切换**：支持中日界面语言切换
- **字符计数**：实时显示输入字符数（仅能翻译1000字符数以内文本）
- **一键复制**：快速复制翻译结果
- **一键清空**：快速清空输入输出

### 翻译规则 / Translation Rules
1. 中文→（汉字最大化日文）→漢glish
2. 日文→漢glish（直接转换）
3. 保留所有汉字，假名替换为英文
4. 输出遵循英语语序

## 💝 支持项目 / Support Project

如果您喜欢这个项目，可以表达您的赞赏：

<div align="center">

![QR Code](frontend/donate.png)

</div>

您的支持将帮助：
- 🚀 持续维护和更新项目
- 🔧 修复bug
- 🌐 API费用支持

## 🙏 致谢 / Acknowledgments

- 感谢 [安处岛](https://xhslink.com/m/11a8HrimSsm) 提出这个有趣的想法
- 感谢 [DeepSeek](https://www.deepseek.com/) 提供功能强大且便宜的API
- 感谢 [Flask](https://flask.palletsprojects.com/) 团队提供的优秀Web框架
- 感谢所有贡献者和用户的支持

---

<div align="center">

**制作 with 心, only to 更好 建设 桥 for 中日交流**

*Made with ❤️ for better Sino-Japanese communication*

</div>