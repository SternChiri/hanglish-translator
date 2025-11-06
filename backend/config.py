import os

class Config:
    DEEPSEEK_API_KEY = os.getenv('DEEPSEEK_API_KEY')
    DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions"
    
    # 会话配置
    SESSION_EXPIRY_MINUTES = 30
    MAX_MESSAGE_HISTORY = 20
    
    # API配置
    MAX_RETRIES = 3
    REQUEST_TIMEOUT = 900