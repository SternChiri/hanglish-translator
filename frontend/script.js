// 配置 - 后端API地址
const API_BASE_URL = 'https://sternchiri.pythonanywhere.com'; // PythonAnywhere域名

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
        footer: '<a href="https://github.com/SternChiri/hanglish-translator" style="color: var(--text-light); text-decoration: none;">© 2025 漢glish翻译器</a> | 漢glish概念源自：<a href="https://xhslink.com/m/11a8HrimSsm" target="_blank" style="text-decoration: none;">@安处岛</a>'
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
        footer: '<a href="https://github.com/SternChiri/hanglish-translator" style="color: var(--text-light); text-decoration: none;">© 2025 漢glish翻訳器</a> | 漢glish提案：<a href="https://xhslink.com/m/11a8HrimSsm" target="_blank" style="text-decoration: none;">@安处岛</a>'
    }
};

let currentLanguage = 'zh'; // 默认中文
let currentSessionId = localStorage.getItem('session_id') || generateSessionId();
let currentPollingInterval = null;

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

    // 翻译按钮点击事件 - 异步版本
    translateBtn.addEventListener('click', async function () {
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

        try {
            // 1. 创建异步翻译任务
            const createResponse = await fetch(`${API_BASE_URL}/async_translate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-ID': currentSessionId
                },
                body: JSON.stringify({ text: text })
            });

            if (!createResponse.ok) {
                throw new Error(`创建任务失败! 状态: ${createResponse.status}`);
            }

            const taskData = await createResponse.json();
            const taskId = taskData.task_id;
            
            console.log(`任务已创建: ${taskId}`);
            
            // 更新session_id
            if (taskData.session_id) {
                currentSessionId = taskData.session_id;
                localStorage.setItem('session_id', currentSessionId);
            }

            // 2. 轮询任务状态
            const pollInterval = 3000; // 每3秒检查一次
            const maxPollTime = 1200000; // 最大轮询时间20分钟
            let pollCount = 0;
            const maxPollCount = maxPollTime / pollInterval;

            const pollTaskStatus = async () => {
                try {
                    const statusResponse = await fetch(`${API_BASE_URL}/task_status/${taskId}`);
                    
                    if (!statusResponse.ok) {
                        throw new Error(`检查任务状态失败! 状态: ${statusResponse.status}`);
                    }

                    const statusData = await statusResponse.json();
                    pollCount++;

                    if (statusData.status === 'completed') {
                        // 任务完成，显示结果
                        outputText.value = statusData.translated;
                        translationStatus.textContent = languageResources[currentLanguage].complete;
                        if (statusData.session_id) {
                            currentSessionId = statusData.session_id;
                            localStorage.setItem('session_id', currentSessionId);
                        }
                        return { done: true, success: true };
                    } else if (statusData.status === 'failed') {
                        // 任务失败，显示错误
                        outputText.value = languageResources[currentLanguage].error + ': ' + statusData.error;
                        translationStatus.textContent = languageResources[currentLanguage].error;
                        return { done: true, success: false };
                    } else if (pollCount >= maxPollCount) {
                        // 超过最大轮询次数
                        outputText.value = '翻译任务超时，请稍后重试';
                        translationStatus.textContent = '轮询超时';
                        return { done: true, success: false };
                    } else {
                        // 任务仍在处理中，保持原有状态文本
                        return { done: false };
                    }
                } catch (error) {
                    console.error('轮询请求失败:', error);
                    if (pollCount >= maxPollCount) {
                        outputText.value = languageResources[currentLanguage].networkError + ': ' + error.message;
                        translationStatus.textContent = '轮询失败';
                        return { done: true, success: false };
                    }
                    return { done: false };
                }
            };

            // 开始轮询
            const checkCompletion = async () => {
                const result = await pollTaskStatus();
                if (!result.done) {
                    // 如果未完成，继续轮询
                    currentPollingInterval = setTimeout(checkCompletion, pollInterval);
                } else {
                    // 无论成功失败，恢复按钮状态
                    translateBtn.disabled = false;
                    translateBtn.classList.remove('disabled');
                    translateBtn.innerHTML = `<i class="fas fa-exchange-alt"></i><span>${languageResources[currentLanguage].translate}</span>`;
                    currentPollingInterval = null;
                }
            };

            // 启动轮询循环
            currentPollingInterval = setTimeout(checkCompletion, pollInterval);

        } catch (error) {
            console.error('创建翻译任务失败:', error);
            outputText.value = languageResources[currentLanguage].networkError + ': ' + error.message;
            translationStatus.textContent = languageResources[currentLanguage].networkError;
            
            translateBtn.disabled = false;
            translateBtn.classList.remove('disabled');
            translateBtn.innerHTML = `<i class="fas fa-exchange-alt"></i><span>${languageResources[currentLanguage].translate}</span>`;
        }
    });

    // 清空按钮点击事件
    clearBtn.addEventListener('click', function () {
        // 清除轮询定时器
        if (currentPollingInterval) {
            clearTimeout(currentPollingInterval);
            currentPollingInterval = null;
        }
        
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

        // 使用现代Clipboard API
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(outputText.value)
                .then(() => {
                    showCopySuccess();
                })
                .catch(() => {
                    fallbackCopyText();
                });
        } else {
            fallbackCopyText();
        }

        function fallbackCopyText() {
            outputText.select();
            document.execCommand('copy');
            showCopySuccess();
        }

        function showCopySuccess() {
            const originalTitle = copyBtn.getAttribute('title');
            copyBtn.setAttribute('title', languageResources[currentLanguage].copied);
            copyBtn.innerHTML = '<i class="fas fa-check"></i>';

            setTimeout(() => {
                copyBtn.setAttribute('title', originalTitle);
                copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
            }, 2000);
        }
    });

    // 按Enter键翻译 (Ctrl+Enter)
    inputText.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && e.ctrlKey) {
            translateBtn.click();
        }
    });

    // 新会话按钮（如果需要可以添加）
    function newSession() {
        // 清除轮询定时器
        if (currentPollingInterval) {
            clearTimeout(currentPollingInterval);
            currentPollingInterval = null;
        }
        
        currentSessionId = generateSessionId();
        outputText.value = '';
        translationStatus.textContent = languageResources[currentLanguage].waiting;
    }
});