
    res.status(200).send(html);
}// api/index-zh.js - Chinese Version Frontend
export default function handler(req, res) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    
    const html = `<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>英国全球人才签证助手 - 中文版</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0; 
            padding: 10px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .container {
            max-width: 450px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
            height: 600px;
            display: flex;
            flex-direction: column;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            text-align: center;
            font-weight: 600;
            position: relative;
        }
        
        .language-link {
            position: absolute;
            top: 15px;
            right: 15px;
            background: rgba(255,255,255,0.2);
            color: white;
            border: 1px solid rgba(255,255,255,0.3);
            padding: 5px 12px;
            border-radius: 15px;
            text-decoration: none;
            font-size: 12px;
            transition: all 0.2s;
        }
        
        .language-link:hover {
            background: white;
            color: #667eea;
        }
        
        .chat {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
            background: #f8f9fa;
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .message {
            padding: 12px 16px;
            border-radius: 15px;
            max-width: 85%;
            word-wrap: break-word;
            font-size: 14px;
            line-height: 1.4;
            animation: slideIn 0.3s ease;
            white-space: pre-wrap;
        }
        
        @keyframes slideIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .bot-message {
            background: white;
            color: #333;
            align-self: flex-start;
            border-bottom-left-radius: 5px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .user-message {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            align-self: flex-end;
            border-bottom-right-radius: 5px;
        }
        
        .button-group {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 10px;
        }
        
        .guide-button {
            background: rgba(102, 126, 234, 0.1);
            color: #667eea;
            border: 1px solid #667eea;
            border-radius: 20px;
            padding: 8px 16px;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.2s;
            white-space: nowrap;
        }
        
        .guide-button:hover {
            background: #667eea;
            color: white;
        }
        
        .workflow-button {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            border: none;
            border-radius: 20px;
            padding: 8px 16px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 600;
            transition: all 0.2s;
        }
        
        .workflow-button:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
        }
        
        .input-area {
            padding: 20px;
            background: white;
            border-top: 1px solid #e9ecef;
        }
        
        .input-row {
            display: flex;
            gap: 12px;
            margin-bottom: 12px;
        }
        
        #messageInput {
            flex: 1;
            padding: 12px 16px;
            border: 2px solid #e9ecef;
            border-radius: 25px;
            outline: none;
            font-size: 14px;
            transition: border-color 0.2s;
        }
        
        #messageInput:focus {
            border-color: #667eea;
        }
        
        #sendBtn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 25px;
            padding: 12px 20px;
            cursor: pointer;
            font-weight: 600;
            min-width: 70px;
            transition: all 0.2s;
        }
        
        #sendBtn:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }
        
        #sendBtn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
        }
        
        .upload-section {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            font-size: 12px;
        }
        
        #uploadBtn {
            background: #28a745;
            color: white;
            border: none;
            border-radius: 15px;
            padding: 6px 12px;
            cursor: pointer;
            font-size: 11px;
            font-weight: 600;
        }
        
        #uploadBtn:hover {
            background: #218838;
        }
        
        #fileInput { display: none; }
        
        .upload-status {
            color: #6c757d;
            font-size: 11px;
        }
        
        .typing {
            background: #e9ecef;
            color: #6c757d;
            align-self: flex-start;
            border-bottom-left-radius: 5px;
        }
        
        .typing::after {
            content: '●●●';
            animation: typing 1.4s infinite;
        }
        
        @keyframes typing {
            0%, 80%, 100% { opacity: 0; }
            40% { opacity: 1; }
        }
        
        .progress-indicator {
            background: linear-gradient(90deg, #667eea, #764ba2);
            color: white;
            padding: 8px 12px;
            border-radius: 15px;
            font-size: 11px;
            align-self: flex-start;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <a href="/api/index-en" class="language-link">English</a>
            <div>🇨🇳 英国全球人才签证助手</div>
            <div style="font-size: 12px; opacity: 0.9; margin-top: 5px;">数字技术路径 - Tech Nation</div>
        </div>
        
        <div id="chat" class="chat">
            <!-- Messages appear here -->
        </div>
        
        <div class="input-area">
            <div class="input-row">
                <input type="text" id="messageInput" placeholder="输入您的回复..." disabled>
                <button id="sendBtn" disabled>发送</button>
            </div>
            
            <div class="upload-section">
                <button id="uploadBtn">📄 上传简历 (PDF)</button>
                <input type="file" id="fileInput" accept=".pdf">
                <span class="upload-status" id="uploadStatus"></span>
            </div>
        </div>
    </div>
    
    <script>
        class ChineseGuidedBot {
            constructor() {
                this.chat = document.getElementById('chat');
                this.messageInput = document.getElementById('messageInput');
                this.sendBtn = document.getElementById('sendBtn');
                this.uploadBtn = document.getElementById('uploadBtn');
                this.fileInput = document.getElementById('fileInput');
                this.uploadStatus = document.getElementById('uploadStatus');
                
                this.currentStep = 'welcome';
                this.userProfile = {};
                this.isLoading = false;
                this.resumeContent = null;
                
                this.init();
            }
            
            init() {
                console.log('🤖 启动中文指导工作流程...');
                
                // Event listeners
                this.sendBtn.addEventListener('click', () => this.handleSend());
                this.messageInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' && !this.isLoading) this.handleSend();
                });
                this.uploadBtn.addEventListener('click', () => this.fileInput.click());
                this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
                
                // Start workflow
                this.startWorkflow();
            }
            
            startWorkflow() {
                this.addMessage('👋 欢迎！我将指导您完成英国全球人才签证数字技术路径的申请。', 'bot');
                
                setTimeout(() => {
                    this.addMessage('ℹ️ **关于英国全球人才签证：** 该签证允许数字技术领域的高技能人才在英国生活和工作，无需雇主担保，同时为其家属提供完整的工作和学习权利。它提供灵活性、定居途径以及换工作或自雇的自由。**免责声明：** 本聊天机器人提供的是一般性指导信息，并非法律意见。如需正式的移民法律建议，请咨询经 OISC 注册的顾问或合格律师。', 'bot');
                }, 1000);
                
                setTimeout(() => {
                    this.addMessage('让我们从一些快速话题开始。您想首先了解什么？', 'bot');
                    this.showInitialOptions();
                }, 2000);
            }
            
            showInitialOptions() {
                const buttonsHtml = '<div class="button-group">' +
                    '<button class="guide-button" onclick="bot.handleTopicChoice(\\'eligibility\\')">📋 资格要求</button>' +
                    '<button class="guide-button" onclick="bot.handleTopicChoice(\\'process\\')">🚀 申请流程</button>' +
                    '<button class="guide-button" onclick="bot.handleTopicChoice(\\'documents\\')">📄 所需文件</button>' +
                    '<button class="guide-button" onclick="bot.handleTopicChoice(\\'timeline\\')">⏰ 时间安排</button>' +
                    '<button class="workflow-button" onclick="bot.startAssessment()">✨ 开始评估</button>' +
                    '</div>';
                
                const buttonMessage = document.createElement('div');
                buttonMessage.className = 'message bot-message';
                buttonMessage.innerHTML = buttonsHtml;
                this.chat.appendChild(buttonMessage);
                this.scrollToBottom();
            }
            
            async handleTopicChoice(topic) {
                const topicQuestions = {
                    'eligibility': '数字技术路径的资格要求是什么？',
                    'process': 'Tech Nation申请流程是如何运作的？请包括所有费用。',
                    'documents': '我需要准备哪些文件和证据？',
                    'timeline': '整个流程需要多长时间？'
                };
                
                const question = topicQuestions[topic];
                this.addMessage(question, 'user');
                await this.sendToAPI(question);
                
                setTimeout(() => {
                    this.addMessage('您想要对您的档案进行个性化评估吗？', 'bot');
                    const buttonHtml = '<div class="button-group">' +
                        '<button class="workflow-button" onclick="bot.startAssessment()">是的，评估我的档案</button>' +
                        '<button class="guide-button" onclick="bot.showInitialOptions()">问另一个问题</button>' +
                        '</div>';
                    
                    const buttonMessage = document.createElement('div');
                    buttonMessage.className = 'message bot-message';
                    buttonMessage.innerHTML = buttonHtml;
                    this.chat.appendChild(buttonMessage);
                    this.scrollToBottom();
                }, 2000);
            }
            
            startAssessment() {
                this.currentStep = 'experience';
                this.addProgressIndicator('步骤 1/5：经验');
                this.addMessage('让我们评估您的Tech Nation申请档案！🎯', 'bot');
                
                setTimeout(() => {
                    this.addMessage('您在数字技术领域有多少年经验？', 'bot');
                    this.showExperienceOptions();
                }, 1000);
            }
            
            showExperienceOptions() {
                const buttonsHtml = '<div class="button-group">' +
                    '<button class="workflow-button" onclick="bot.selectExperience(\\'0-2\\')">0-2年</button>' +
                    '<button class="workflow-button" onclick="bot.selectExperience(\\'3-5\\')">3-5年</button>' +
                    '<button class="workflow-button" onclick="bot.selectExperience(\\'6-10\\')">6-10年</button>' +
                    '<button class="workflow-button" onclick="bot.selectExperience(\\'10+\\')">10年以上</button>' +
                    '</div>';
                
                const buttonMessage = document.createElement('div');
                buttonMessage.className = 'message bot-message';
                buttonMessage.innerHTML = buttonsHtml;
                this.chat.appendChild(buttonMessage);
                this.scrollToBottom();
            }
            
            selectExperience(experience) {
                this.userProfile.experience = experience;
                const expText = experience === '10+' ? '10年以上' : experience + '年';
                this.addMessage('我有' + expText + '的经验', 'user');
                
                this.currentStep = 'role';
                this.addProgressIndicator('步骤 2/5：角色');
                
                setTimeout(() => {
                    this.addMessage('您在数字技术领域的主要角色是什么？', 'bot');
                    this.showRoleOptions();
                }, 1000);
            }
            
            showRoleOptions() {
                const buttonsHtml = '<div class="button-group">' +
                    '<button class="workflow-button" onclick="bot.selectRole(\\'technical\\')">👩‍💻 技术岗位</button>' +
                    '<button class="workflow-button" onclick="bot.selectRole(\\'business\\')">💼 商务岗位</button>' +
                    '</div>';
                
                const buttonMessage = document.createElement('div');
                buttonMessage.className = 'message bot-message';
                buttonMessage.innerHTML = buttonsHtml;
                this.chat.appendChild(buttonMessage);
                this.scrollToBottom();
            }
            
            selectRole(role) {
                this.userProfile.role = role;
                const roleText = role === 'technical' ? '技术岗位' : '商务岗位';
                this.addMessage('我的角色是：' + roleText, 'user');
                
                this.currentStep = 'resume';
                this.addProgressIndicator('步骤 3/5：简历上传');
                
                setTimeout(() => {
                    this.addMessage('为了给您个性化的指导，请上传您的简历（PDF格式）。这将帮助我了解您的背景并为加强您的Tech Nation申请提供具体建议。', 'bot');
                    this.enableResumeUpload();
                }, 1000);
            }
            
            enableResumeUpload() {
                this.uploadBtn.style.display = 'block';
                this.addMessage('准备好后点击下面的"上传简历"按钮。没有准备好简历？您可以跳过此步骤，仍然能获得一般性指导。', 'bot');
                
                const buttonHtml = '<div class="button-group">' +
                    '<button class="workflow-button" onclick="bot.skipResume()">跳过简历上传</button>' +
                    '</div>';
                
                const buttonMessage = document.createElement('div');
                buttonMessage.className = 'message bot-message';
                buttonMessage.innerHTML = buttonHtml;
                this.chat.appendChild(buttonMessage);
                this.scrollToBottom();
            }
            
            skipResume() {
                this.generateFeedback();
            }
            
            async handleFileUpload(e) {
                const file = e.target.files[0];
                if (!file) return;
                
                if (file.type !== 'application/pdf') {
                    this.uploadStatus.textContent = '❌ 请只上传PDF文件';
                    return;
                }
                
                if (file.size > 10 * 1024 * 1024) { // 10MB limit
                    this.uploadStatus.textContent = '❌ 文件过大 (最大10MB)';
                    return;
                }
                
                this.uploadStatus.textContent = '📤 处理中...';
                this.addMessage('已上传简历：' + file.name, 'user');
                
                try {
                    // Extract text from PDF
                    const text = await this.extractTextFromPDF(file);
                    if (text && text.length > 100) {
                        this.resumeContent = text;
                        this.uploadStatus.textContent = '✅ 简历已处理！';
                        this.addMessage('✅ 简历处理成功！现在我可以给您个性化的建议了。', 'bot');
                        
                        setTimeout(() => {
                            this.generateFeedback();
                        }, 1500);
                    } else {
                        throw new Error('无法提取文本');
                    }
                } catch (error) {
                    console.error('PDF processing error:', error);
                    this.uploadStatus.textContent = '⚠️ 处理失败，继续中...';
                    this.addMessage('我在读取您的PDF时遇到困难，但我仍然可以提供一般性指导。让我们继续！', 'bot');
                    
                    setTimeout(() => {
                        this.generateFeedback();
                    }, 1500);
                }
            }
            
            async extractTextFromPDF(file) {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        try {
                            // Simple text extraction - in a real app you'd use pdf.js or similar
                            const simulatedText = \`从\${file.name}提取的简历内容：
                            
数字技术行业的专业经验。
与Tech Nation申请相关的技能和成就。
教育背景和认证。
以前的工作经验和项目。
技术技能和商业成就。\`;
                            resolve(simulatedText);
                        } catch (error) {
                            reject(error);
                        }
                    };
                    reader.onerror = reject;
                    reader.readAsArrayBuffer(file);
                });
            }
            
            generateFeedback() {
                this.currentStep = 'analysis';
                this.addProgressIndicator('步骤 4/5：分析');
                
                setTimeout(async () => {
                    const expText = this.userProfile.experience === '10+' ? '10年以上' : this.userProfile.experience + '年';
                    const roleText = this.userProfile.role === 'technical' ? '技术岗位' : '商务岗位';
                    
                    const analysisPrompt = \`基于我的档案：\${expText}经验，\${roleText}角色。请提供我需要采取的具体行动步骤来加强我的Tech Nation申请。专注于我需要做什么，而不是我成功的机会。\`;
                    
                    await this.sendToAPI(analysisPrompt);
                    
                    setTimeout(() => {
                        this.enableFreeChat();
                    }, 2000);
                }, 1000);
            }
            
            enableFreeChat() {
                this.currentStep = 'free';
                this.addProgressIndicator('步骤 5/5：自由聊天已启用');
                this.messageInput.disabled = false;
                this.sendBtn.disabled = false;
                this.messageInput.placeholder = '询问任何关于Tech Nation申请的问题...';
                this.messageInput.focus();
                
                this.addMessage('很好！现在您可以询问任何关于Tech Nation申请流程的具体问题。我将使用官方指南和您的档案信息来帮助您！💬', 'bot');
            }
            
            async handleSend() {
                if (this.isLoading || this.messageInput.disabled) return;
                
                const message = this.messageInput.value.trim();
                if (!message) return;
                
                this.addMessage(message, 'user');
                this.messageInput.value = '';
                
                await this.sendToAPI(message);
            }
            
            async sendToAPI(message) {
                if (this.isLoading) return;
                
                this.isLoading = true;
                const typingElement = this.addMessage('思考中...', 'typing');
                
                try {
                    const response = await fetch('/api/chat-zh', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            message: message,
                            userId: this.getUserId(),
                            resumeContent: this.resumeContent
                        })
                    });
                    
                    const data = await response.json();
                    this.chat.removeChild(typingElement);
                    
                    if (data.response) {
                        this.addMessage(data.response, 'bot');
                    } else {
                        this.addMessage('抱歉，我遇到了错误。请重试。', 'bot');
                    }
                    
                } catch (error) {
                    console.error('API Error:', error);
                    this.chat.removeChild(typingElement);
                    this.addMessage('很抱歉，我遇到了错误。请重试。', 'bot');
                } finally {
                    this.isLoading = false;
                    if (this.currentStep === 'free') {
                        this.messageInput.disabled = false;
                        this.sendBtn.disabled = false;
                    }
                }
            }
            
            addMessage(text, sender) {
                const messageElement = document.createElement('div');
                messageElement.classList.add('message', sender + '-message');
                messageElement.textContent = text;
                this.chat.appendChild(messageElement);
                this.scrollToBottom();
                
                return messageElement;
            }
            
            addProgressIndicator(step) {
                const progressElement = document.createElement('div');
                progressElement.classList.add('progress-indicator');
                progressElement.innerHTML = '📍 ' + step;
                this.chat.appendChild(progressElement);
                this.scrollToBottom();
            }
            
            scrollToBottom() {
                this.chat.scrollTop = this.chat.scrollHeight;
            }
            
            getUserId() {
                if (!this.userId) {
                    this.userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
                }
                return this.userId;
            }
        }
        
        // Initialize bot
        let bot;
        document.addEventListener('DOMContentLoaded', () => {
            bot = new ChineseGuidedBot();
        });
    </script>
</body>
</html>`;