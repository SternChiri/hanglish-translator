# 漢glish翻訳器 / 漢glish Translator

<div align="center">

> 中国人 and 日本人 can 相互交流 with 中学生 level 英語 and 漢字。——安处岛

[![日本語](https://img.shields.io/badge/日本語-中文-red)](https://github.com/SternChiri/hanglish-translator/blob/main/README.md)
[![Python](https://img.shields.io/badge/Python-3.11-blue)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-2.3.3-lightgrey)](https://flask.palletsprojects.com/)

[![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-D8BFD8)](https://sternchiri.github.io/hanglish-translator/)
[![Netfily](https://img.shields.io/badge/Netfily-20B2AA)](https://hanglish-translator.netlify.app/)

</div>

## 🌟 プロジェクト紹介 / Project Introduction

<div style="display: block;">

**漢glish翻訳器**は、中国語や日本語を独自の *漢glish* に変換するためのオンライン翻訳器です。この言語は名詞に漢字を使用し、副詞には英語を借用することで、中日ユーザーが基礎的な英語と漢字を使って効果的に交流できるようにします。

### 主な機能：
- 🔄 中国語・日本語 → 漢glish の自動認識
- 🎯 漢字最大化保持戦略
- ⚡ 長文翻訳をサポートする非同期処理

### 技術スタック：
- フロントエンド：HTML5 + CSS3 + JavaScript (GitHub Pages/Netfily)
- バックエンド：Python Flask + DeepSeek API (PythonAnywhere)

</div>

## 💝 プロジェクト支援 / Support Project

このプロジェクトが気に入ったら、以下の方法で支援いただけます：

<div align="center">

![QR Code](https://via.placeholder.com/200x200/07C160/ffffff?text=WeChat)

</div>

ご支援は以下のために役立てられます：
- 🚀 プロジェクトの継続的なメンテナンスと更新
- 🔧 バグ修正
- 🌐 API費用のサポート

## 🚀 クイックスタート / Quick Start

### オンライン利用 / Online Usage
直接ウェブサイトにアクセス：
- GitHub Pages：[https://sternchiri.github.io/hanglish-translator/](https://sternchiri.github.io/hanglish-translator/)
- Netfily：[https://hanglish-translator.netlify.app/](https://hanglish-translator.netlify.app/)

### ローカル開発 / Local Development

**フロントエンド開発：**
```bash
# プロジェクトをクローン
git clone https://github.com/sternchiri/hanglish-translator.git
cd hanglish-translator/frontend

# ローカルサーバーで実行
python -m http.server 8000
# または
npx serve .
```

**バックエンド開発：**
```bash
cd backend

# 依存関係をインストール
pip install -r requirements.txt

# 環境変数を設定
export DEEPSEEK_API_KEY = sk-... # あなた自身のAPIキー

# サービスを実行
python app.py
```

## 📖 利用ガイド / Usage Guide

### 基本使い方 / Basic Usage
1. **テキスト入力**：原文エリアに中国語または日本語テキストを入力
2. **翻訳クリック**：翻訳ボタンをクリックして変換開始
3. **結果確認**：翻訳結果エリアで漢glish形式の出力を確認

### 機能特徴 / Features
- **言語切替**：中日インターフェース言語の切替をサポート
- **文字カウント**：入力文字数をリアルタイム表示（1000文字以内のみ翻訳可能）
- **ワンクリックコピー**：翻訳結果を素早くコピー
- **ワンクリッククリア**：入出力を素早くクリア

### 翻訳ルール / Translation Rules
1. 中国語→（漢字最大化日本語）→漢glish
2. 日本語→漢glish（直接変換）
3. 全ての漢字を保持、仮名を英語に置換
4. 出力は英語語順に従う

## 🔧 デプロイ説明 / Deployment

### フロントエンドデプロイ
多数のデプロイプラットフォームをサポート。GitHubリポジトリに接続し、`frontend`をソースディレクトリとして選択すれば自動デプロイ。

### バックエンドデプロイ
多数のデプロイプラットフォームをサポート。`backend/`ディレクトリの内容をアップロード、またはGitHubリポジトリに接続して自動デプロイ。

## 🤝 コントリビューションガイド / Contribution

あらゆる形式のコントリビューションを歓迎します！

### 問題報告 / Report Issues
バグを発見したり、改善提案がある場合は、[Issues](https://github.com/sternchiri/hanglish-translator/issues)から報告してください。

### 機能リクエスト / Feature Requests
新しい機能のアイデアがありますか？[Issues](https://github.com/sternchiri/hanglish-translator/issues)で提案を歓迎します！

### コードコントリビューション / Code Contribution
1. このプロジェクトをFork
2. 機能ブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. Pull Requestをオープン

## 🙏 謝辞 / Acknowledgments

- この面白いアイデアを提案してくださった [安处岛](https://xhslink.com/m/11a8HrimSsm) に感謝
- 強力で安価なAPIを提供してくださる [DeepSeek](https://www.deepseek.com/) に感謝
- 優れたWebフレームワークを提供してくださる [Flask](https://flask.palletsprojects.com/) チームに感謝
- すべてのコントリビューターとユーザーのサポートに感謝

---

<div align="center">

**制作 with 心, only to 更好 建设 桥 for 中日交流**

*Made with ❤️ for better Sino-Japanese communication*

</div>