// 配置 - 后端API地址
const API_BASE_URL = 'https://your-username.pythonanywhere.com'; // 替换为您的PythonAnywhere域名

// 语言资源
const languageResources = {
    zh: {
        languageText: "日本語",
        title: "漢glish翻译器",
        subtitle: "中国人 and 日本人 can 相互交流 with 中学生 level 英語 and 漢字",
        original: "原文",
        clear: "清空",
        placeholder: "请输入要翻译的内容（仅限中文/日文）...",
        chars: "字符",
        translate: "翻译",
        translatingBtn: "翻译中",
        result: "翻译结果",
        copy: "复制",
        waiting: "等待输入",
        ready: "准备翻译",
        translating: "正在翻译，请耐心等待...",
        complete: "翻译完成",
        error: "翻译出错",
        networkError: "网络错误",
        noInput: "请输入要翻译的文本",
        noContent: "没有内容可复制",
        copied: "已复制!",
        maxChars: "字符数超过限制 (最大1000字符)",
        footer: '© 2025 漢glish翻译器 | 源：小红书<a href="https://xhslink.com/m/11a8HrimSsm" target="_blank">@安处岛</a>'
    },
    ja: {
        languageText: "中文",
        title: "漢glish翻訳器",
        subtitle: "中国人 and 日本人 can 相互交流 with 中学生 level 英語 and 漢字",
        original: "原文",
        clear: "クリア",
        placeholder: "翻訳する内容を入力してください（中国語/日本語のみ）...",
        chars: "文字",
        translate: "翻訳",
        translatingBtn: "翻訳中",
        result: "翻訳結果",
        copy: "コピー",
        waiting: "入力待ち",
        ready: "翻訳準備完了",
        translating: "翻訳中、しばらくお待ちください...",
        complete: "翻訳完了",
        error: "翻訳エラー",
        networkError: "ネットワークエラー",
        noInput: "翻訳するテキストを入力してください",
        noContent: "コピーする内容がありません",
        copied: "コピーしました!",
        maxChars: "文字数制限を超えています (最大1000文字)",
        footer: '© 2025 漢glish翻訳器 | 元：小红书<a href="https://xhslink.com/m/11a8HrimSsm" target="_blank">@安处岛</a>'
    }
};

let currentLanguage = 'zh'; // 默认中文
let currentSessionId = localStorage.getItem('session_id') || generateSessionId();

function generateSessionId() {
    const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('session_id', sessionId);
    return sessionId;
}

document.addEventListener('DOMContentLoaded', function () {
    const inputText = document.getElementById('input-text');
    const outputText = document.getElementById('output-text');
    const translateBtn = document.getElementById('translate-btn');
    const clearBtn = document.getElementById('clear-btn');
    const copyBtn = document.getElementById('copy-btn');
    const charCount = document.getElementById('char-count');
    const translationStatus = document.getElementById('translation-status');
    const languageToggle = document.getElementById('language-toggle');
    const languageText = document.getElementById('language-text');

    // 初始化语言
    updateLanguage();

    // 语言切换事件
    languageToggle.addEventListener('click', function () {
        currentLanguage = currentLanguage === 'zh' ? 'ja' : 'zh';
        updateLanguage();
    });

    // 更新语言
    function updateLanguage() {
        const resources = languageResources[currentLanguage];

        // 更新页面文本
        document.querySelectorAll('[data-lang-zh], [data-lang-ja]').forEach(element => {
            element.textContent = element.getAttribute(`data-lang-${currentLanguage}`);
        });

        // 更新placeholder
        document.querySelectorAll('[data-placeholder-zh], [data-placeholder-ja]').forEach(element => {
            element.placeholder = element.getAttribute(`data-placeholder-${currentLanguage}`);
        });

        // 更新title属性
        document.querySelectorAll('[data-title-zh], [data-title-ja]').forEach(element => {
            element.title = element.getAttribute(`data-title-${currentLanguage}`);
        });

        // 更新语言切换按钮文本
        languageText.textContent = resources.languageText;

        // 更新文档标题
        document.title = resources.title;

        // 更新footer
        document.getElementById('footer-content').innerHTML = resources.footer;

        // 更新状态消息
        if (translationStatus.textContent === languageResources['zh'].waiting ||
            translationStatus.textContent === languageResources['ja'].waiting) {
            translationStatus.textContent = resources.waiting;
        } else if (translationStatus.textContent === languageResources['zh'].ready ||
            translationStatus.textContent === languageResources['ja'].ready) {
            translationStatus.textContent = resources.ready;
        }
    }

    // 更新字符计数
    inputText.addEventListener('input', function () {
        const count = inputText.value.length;
        charCount.textContent = count;

        // 检查字符数限制
        if (count > 1000) {
            charCount.classList.add('over-limit');
            translateBtn.disabled = true;
            translateBtn.classList.add('disabled');
            translationStatus.textContent = languageResources[currentLanguage].maxChars;
        } else {
            charCount.classList.remove('over-limit');
            translateBtn.disabled = false;
            translateBtn.classList.remove('disabled');

            if (count > 0) {
                translationStatus.textContent = languageResources[currentLanguage].ready;
            } else {
                translationStatus.textContent = languageResources[currentLanguage].waiting;
            }
        }
    });

    // 翻译按钮点击事件
    translateBtn.addEventListener('click', function () {
        const text = inputText.value.trim();
        if (!text) {
            alert(languageResources[currentLanguage].noInput);
            return;
        }

        if (text.length > 1000) {
            alert(languageResources[currentLanguage].maxChars);
            return;
        }

        // 显示加载状态
        outputText.value = '';
        translationStatus.textContent = languageResources[currentLanguage].translating;
        translateBtn.disabled = true;
        translateBtn.classList.add('disabled');
        translateBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i><span>${languageResources[currentLanguage].translatingBtn}</span>`;

        // 发送翻译请求
        fetch(`${API_BASE_URL}/translate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-ID': currentSessionId
            },
            body: JSON.stringify({ text: text })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.error) {
                    outputText.value = languageResources[currentLanguage].error + ': ' + data.error;
                    translationStatus.textContent = languageResources[currentLanguage].error;
                } else {
                    outputText.value = data.translated;
                    translationStatus.textContent = languageResources[currentLanguage].complete;
                }
                translateBtn.disabled = false;
                translateBtn.classList.remove('disabled');
                translateBtn.innerHTML = `<i class="fas fa-exchange-alt"></i><span>${languageResources[currentLanguage].translate}</span>`;
            })
            .catch(error => {
                console.error('Translation error:', error);
                outputText.value = languageResources[currentLanguage].networkError + ': ' + error.message;
                translationStatus.textContent = languageResources[currentLanguage].networkError;
                translateBtn.disabled = false;
                translateBtn.classList.remove('disabled');
                translateBtn.innerHTML = `<i class="fas fa-exchange-alt"></i><span>${languageResources[currentLanguage].translate}</span>`;
            });
    });

    // 清空按钮点击事件
    clearBtn.addEventListener('click', function () {
        inputText.value = '';
        outputText.value = '';
        charCount.textContent = '0';
        charCount.classList.remove('over-limit');
        translateBtn.disabled = false;
        translateBtn.classList.remove('disabled');
        translationStatus.textContent = languageResources[currentLanguage].waiting;
    });

    // 复制按钮点击事件
    copyBtn.addEventListener('click', function () {
        if (!outputText.value) {
            alert(languageResources[currentLanguage].noContent);
            return;
        }

        outputText.select();
        document.execCommand('copy');

        // 显示复制成功提示
        const originalTitle = copyBtn.getAttribute('title');
        copyBtn.setAttribute('title', languageResources[currentLanguage].copied);
        copyBtn.innerHTML = '<i class="fas fa-check"></i>';

        setTimeout(() => {
            copyBtn.setAttribute('title', originalTitle);
            copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
        }, 2000);
    });

    // 按Enter键翻译 (Ctrl+Enter)
    inputText.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && e.ctrlKey) {
            translateBtn.click();
        }
    });

    // 新会话按钮（如果需要可以添加）
    function newSession() {
        currentSessionId = generateSessionId();
        outputText.value = '';
        translationStatus.textContent = languageResources[currentLanguage].waiting;
    }
});