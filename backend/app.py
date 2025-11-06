from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import time
import os
import uuid
import threading
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)  # 启用CORS支持

# DeepSeek API 配置
DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions"
API_KEY = os.getenv('DEEPSEEK_API_KEY')  # 从环境变量获取API Key

# 系统提示词
SYSTEM_PROMPT = """你是一个翻译器，遵循如下规则：
1. 你只会接收到2种语言的输入：中文、日文，不存在这2种语言之外的其他语言的输入；
2. 当你接收到中文时，将原文翻译为（汉字尽可能多的）日文，即某种表达有汉字表达时必须用汉字表达（如"牛乳"、"ミルク"均指中文中的"牛奶"，但你必须翻译成汉字形式"牛乳"）；
3. 当你（1）接收到日文，以及（2）接收到中文并按上一条中所规定将其译为（汉字尽可能多的）日文后，你需要将文本中所有的假名部分替换为对应的英语，而保留文本中所有的汉字部分（结果形如：`And 我発見 many 名詞 in 中国語 and 日本語 are 同一, but 文法 and 副詞 are 完全 different. So my 提案 is 借用some 副詞 from 英語，then 中国人 and 日本人 can 相互交流 with 中学生 level 英語 and 漢字。`）；
4. 翻译结果的文本之语序遵循英语语序。

若你已充分理解规则，请翻译user发给你的文本。"""

class SessionManager:
    """
    会话管理器 - 避免重复发送system prompt
    """
    def __init__(self):
        self.sessions = {}
    
    def create_session(self, session_id):
        """创建新会话"""
        self.sessions[session_id] = {
            'created_at': datetime.now(),
            'messages': [
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT
                }
            ],
            'is_initialized': True
        }
        return session_id
    
    def get_session(self, session_id):
        """获取会话，不存在则创建"""
        if session_id not in self.sessions:
            self.create_session(session_id)
        return self.sessions[session_id]
    
    def add_user_message(self, session_id, content):
        """添加用户消息到会话历史"""
        session_data = self.get_session(session_id)
        session_data['messages'].append({
            "role": "user",
            "content": content
        })
        # 限制会话历史长度，避免上下文过长
        if len(session_data['messages']) > 20:  # 保留最近20轮对话
            # 保留system prompt和最近的对话
            session_data['messages'] = [session_data['messages'][0]] + session_data['messages'][-19:]
    
    def add_assistant_message(self, session_id, content):
        """添加助手回复到会话历史"""
        session_data = self.get_session(session_id)
        session_data['messages'].append({
            "role": "assistant",
            "content": content
        })
    
    def cleanup_expired_sessions(self, expiry_minutes=30):
        """清理过期会话"""
        now = datetime.now()
        expired_sessions = []
        for session_id, session_data in self.sessions.items():
            if (now - session_data['created_at']).total_seconds() > expiry_minutes * 60:
                expired_sessions.append(session_id)
        
        for session_id in expired_sessions:
            del self.sessions[session_id]

# 初始化会话管理器
session_manager = SessionManager()

# 异步任务存储
task_status = {}

class BackgroundTranslator:
    def __init__(self):
        pass

    def start_translation(self, task_id, session_id, text):
        """在后台线程中执行翻译任务"""
        try:
            print(f"[后台任务] 开始执行任务 {task_id}")
            # 将任务状态标记为运行中
            task_status[task_id] = {'status': 'processing', 'started_at': datetime.now().isoformat()}
            
            # 这里是您原有的翻译逻辑，保持不变
            session_manager.add_user_message(session_id, text)
            session_data = session_manager.get_session(session_id)
            messages = session_data['messages']
            
            result = call_deepseek_api(messages)  # 这仍然可能需要900秒
            
            if 'error' in result:
                task_status[task_id] = {
                    'status': 'failed', 
                    'error': result['error'], 
                    'completed_at': datetime.now().isoformat()
                }
            else:
                session_manager.add_assistant_message(session_id, result['content'])
                task_status[task_id] = {
                    'status': 'completed', 
                    'translated': result['content'],
                    'session_id': session_id,
                    'completed_at': datetime.now().isoformat()
                }
                
            print(f"[后台任务] 任务 {task_id} 完成，状态: {task_status[task_id]['status']}")
            
        except Exception as e:
            error_msg = f'后台翻译过程中出现错误: {str(e)}'
            print(f"[后台任务] 任务 {task_id} 异常: {error_msg}")
            task_status[task_id] = {
                'status': 'failed', 
                'error': error_msg, 
                'completed_at': datetime.now().isoformat()
            }

# 初始化后台翻译器
bg_translator = BackgroundTranslator()

def call_deepseek_api(messages, max_retries=3):
    """
    调用DeepSeek API进行翻译
    """
    if not API_KEY:
        return {"error": "DeepSeek API Key 未设置，请设置 DEEPSEEK_API_KEY 环境变量"}
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }
    
    # 构建请求数据
    data = {
        "model": "deepseek-reasoner",
        "messages": messages,
        "temperature": 0.3,
        "max_tokens": 32000,
        "stream": False
    }
    
    # 实现指数退避重试机制
    for attempt in range(max_retries):
        try:
            print(f"[API] 请求DeepSeek API (尝试 {attempt + 1}/{max_retries})...")
            
            response = requests.post(
                DEEPSEEK_API_URL, 
                headers=headers, 
                json=data, 
                timeout=900
            )
            
            print(f"[API] 响应状态码: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                
                # 提取回复内容
                if 'choices' in result and len(result['choices']) > 0:
                    message = result['choices'][0]['message']
                    content = message.get('content', '')
                    
                    # 检查content是否为空
                    if not content:
                        error_msg = "API返回的翻译结果为空"
                        print(f"[API] 错误: {error_msg}")
                        return {"error": error_msg}
                    else:
                        print(f"[API] 翻译成功，结果长度: {len(content)} 字符")
                        return {"content": content}
                else:
                    error_msg = "API返回格式异常"
                    print(f"[API] 错误: {error_msg}")
                    return {"error": error_msg}
                    
            elif response.status_code == 429:
                # 频率限制，使用指数退避
                wait_time = min(2 ** attempt * 5, 60)
                print(f"[API] 频率限制，等待 {wait_time} 秒后重试...")
                time.sleep(wait_time)
                continue
                
            else:
                error_msg = f"API请求失败，状态码: {response.status_code}"
                print(f"[API] 错误: {error_msg}")
                return {"error": error_msg}
                
        except requests.exceptions.Timeout:
            error_msg = "API请求超时"
            print(f"[API] 错误: {error_msg}")
            if attempt == max_retries - 1:
                return {"error": error_msg}
            continue
        except requests.exceptions.RequestException as e:
            error_msg = f"网络请求异常: {str(e)}"
            print(f"[API] 错误: {error_msg}")
            if attempt == max_retries - 1:
                return {"error": error_msg}
            continue
        except Exception as e:
            error_msg = f"处理请求时出现错误: {str(e)}"
            print(f"[API] 错误: {error_msg}")
            if attempt == max_retries - 1:
                return {"error": error_msg}
            continue
    
    return {"error": "达到最大重试次数，请求失败"}

def cleanup_old_tasks():
    """清理超过1小时的已完成任务"""
    now = datetime.now()
    expired_tasks = []
    for task_id, status_info in task_status.items():
        if status_info['status'] in ['completed', 'failed'] and 'completed_at' in status_info:
            try:
                completed_time = datetime.fromisoformat(status_info['completed_at'])
                if now - completed_time > timedelta(hours=1):
                    expired_tasks.append(task_id)
            except:
                # 如果日期解析失败，也清理该任务
                expired_tasks.append(task_id)
    
    for task_id in expired_tasks:
        del task_status[task_id]
        print(f"[任务清理] 已清理任务 {task_id}")

@app.before_request
def before_request():
    """请求前清理过期会话和旧任务"""
    session_manager.cleanup_expired_sessions()
    # 每小时清理一次旧任务
    if hasattr(app, 'last_task_cleanup'):
        if datetime.now() - app.last_task_cleanup > timedelta(hours=1):
            cleanup_old_tasks()
            app.last_task_cleanup = datetime.now()
    else:
        app.last_task_cleanup = datetime.now()
        cleanup_old_tasks()

@app.route('/')
def index():
    return jsonify({
        "message": "漢glish翻译器API服务运行中",
        "status": "active",
        "timestamp": datetime.now().isoformat()
    })

# 保留原有的同步翻译接口（可选，可以删除）
@app.route('/translate', methods=['POST'])
def translate():
    data = request.get_json()
    text = data.get('text', '').strip()
    
    # 从Header获取session_id
    session_id = request.headers.get('X-Session-ID', str(uuid.uuid4()))
    
    print(f"[翻译] 收到请求: {text[:50]}..." if len(text) > 50 else f"[翻译] 收到请求: {text}")
    print(f"[翻译] Session ID: {session_id}")
    
    if not text:
        return jsonify({'error': '请输入要翻译的文本'})
    
    try:
        # 添加用户消息到会话历史
        session_manager.add_user_message(session_id, text)
        
        # 获取当前会话的完整消息历史
        session_data = session_manager.get_session(session_id)
        messages = session_data['messages']
        
        # 调用DeepSeek API
        result = call_deepseek_api(messages)
        
        if 'error' in result:
            print(f"[翻译] 失败: {result['error']}")
            return jsonify({'error': result['error']})
        else:
            # 添加助手回复到会话历史
            session_manager.add_assistant_message(session_id, result['content'])
            
            print(f"[翻译] 成功: {result['content'][:100]}...")
            return jsonify({
                'translated': result['content'],
                'session_id': session_id
            })
            
    except Exception as e:
        error_msg = f'翻译过程中出现错误: {str(e)}'
        print(f"[翻译] 异常: {error_msg}")
        return jsonify({'error': error_msg})

# 新的异步翻译接口
@app.route('/async_translate', methods=['POST'])
def async_translate():
    """创建异步翻译任务"""
    data = request.get_json()
    text = data.get('text', '').strip()
    session_id = request.headers.get('X-Session-ID', str(uuid.uuid4()))
    
    if not text:
        return jsonify({'error': '请输入要翻译的文本'}), 400
    
    # 生成唯一任务ID
    task_id = str(uuid.uuid4())
    
    # 在后台线程中启动翻译任务
    thread = threading.Thread(target=bg_translator.start_translation, args=(task_id, session_id, text))
    thread.daemon = True  # 设置为守护线程，主进程退出时自动结束
    thread.start()
    
    print(f"[异步翻译] 创建任务 {task_id}，使用会话 {session_id}")
    return jsonify({
        'task_id': task_id, 
        'status': 'processing',
        'session_id': session_id
    })

@app.route('/task_status/<task_id>', methods=['GET'])
def get_task_status(task_id):
    """查询任务状态"""
    if task_id not in task_status:
        return jsonify({'error': '任务不存在'}), 404
    
    status_info = task_status[task_id]
    result = {'task_id': task_id, 'status': status_info['status']}
    
    if status_info['status'] == 'completed':
        result['translated'] = status_info['translated']
        result['session_id'] = status_info.get('session_id')
    elif status_info['status'] == 'failed':
        result['error'] = status_info['error']
    
    return jsonify(result)

@app.route('/new_session', methods=['POST'])
def new_session():
    """创建新的翻译会话"""
    new_session_id = str(uuid.uuid4())
    
    # 从Header获取当前session_id（如果有的话）
    old_session_id = request.headers.get('X-Session-ID')
    if old_session_id and old_session_id in session_manager.sessions:
        # 可选：清理旧会话
        del session_manager.sessions[old_session_id]
    
    session_manager.create_session(new_session_id)
    
    return jsonify({'success': True, 'session_id': new_session_id})

@app.route('/session_info', methods=['GET'])
def session_info():
    """获取当前会话信息"""
    session_id = request.headers.get('X-Session-ID')
    if session_id and session_id in session_manager.sessions:
        session_data = session_manager.sessions[session_id]
        return jsonify({
            'session_id': session_id,
            'message_count': len(session_data['messages']) - 1,  # 减去system prompt
            'created_at': session_data['created_at'].isoformat()
        })
    return jsonify({'session_id': None})

@app.route('/health', methods=['GET'])
def health_check():
    """健康检查端点"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "active_sessions": len(session_manager.sessions),
        "active_tasks": len([t for t in task_status.values() if t['status'] == 'processing'])
    })

if __name__ == '__main__':
    # 检查API Key
    if not API_KEY:
        print("警告: 未设置 DEEPSEEK_API_KEY 环境变量")
        print("请设置环境变量: export DEEPSEEK_API_KEY=你的API密钥")
    
    # 启动时清理过期会话
    session_manager.cleanup_expired_sessions()
    cleanup_old_tasks()
    
    app.run(debug=False, host='0.0.0.0', port=5000)