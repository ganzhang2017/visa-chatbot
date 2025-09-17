export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UK Global Talent Visa Bot</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
        
        .language-toggle {
            position: absolute;
            top: 15px;
            right: 15px;
            display: flex;
            gap: 5px;
        }
        
        .language-btn {
            background: rgba(255,255,255,0.2);
            color: white;
            border: 1px solid rgba(255,255,255,0.3);
            padding: 5px 12px;
            border-radius: 15px;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.2s;
        }
        
        .language-btn.active {
            background: white;
            color: #667eea;
            border-color: white;
        }
        
        .language-btn:hover {
            background: rgba(255,255,255,0.3);
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
            <div class="language-toggle">
                <button class="language-btn active" onclick="bot.switchLanguage('en')" id="lang-en">EN</button>
                <button class="language-btn" onclick="bot.switchLanguage('zh')" id="lang-zh">中文</button>
            </div>
            <div id="header-title">🇬🇧 UK Global Talent Visa Assistant</div>
            <div id="header-subtitle" style="font-size: 12px; opacity: 0.9; margin-top: 5px;">Digital Technology Route - Tech Nation</div>
        </div>
        
        <div id="chat" class="chat">
            <!-- Messages appear here -->
        </div>
        
        <div class="input-area">
            <div class="input-row">
                <input type="text" id="messageInput" placeholder="Type your response..." disabled>
                <button id="sendBtn" disabled>Send</button>
            </div>
            
            <div class="upload-section">
                <button id="uploadBtn" style="display: none;">📄 Upload Resume (PDF)</button>
                <input type="file" id="fileInput" accept=".pdf">
                <span class="upload-status" id="uploadStatus"></span>
            </div>
        </div>
    </div>
    
    <script>
        class GuidedWorkflowBot {
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
                this.currentLanguage = 'en'; // Default to English
                
                // Language text configurations
                this.texts = {
                    en: {
                        headerTitle: '🇬🇧 UK Global Talent Visa Assistant',
                        headerSubtitle: 'Digital Technology Route - Tech Nation',
                        welcome: '👋 Welcome! I will guide you through the UK Global Talent Visa application for Digital Technology.',
                        visaInfo: 'ℹ️ **About the UK Global Talent Visa:** This visa lets highly skilled individuals in digital technology live and work in the UK without needing employer sponsorship, while also giving their dependants full work and study rights. It offers flexibility, a pathway to settlement, and freedom to change jobs or be self-employed. Disclaimer: This is general guidance, not legal advice. For formal immigration advice, please speak with an OISC-registered adviser or solicitor.',
                        startTopics: 'Let us start with some quick topics. What would you like to know about first?',
                        eligibility: '📋 Eligibility',
                        process: '🚀 Process',
                        documents: '📄 Documents',
                        timeline: '⏰ Timeline',
                        startAssessment: '✨ Start Assessment',
                        assessmentStart: 'Let us assess your profile for the Tech Nation application! 🎯',
                        experienceQuestion: 'How many years of experience do you have in digital technology?',
                        roleQuestion: 'What is your primary role in digital technology?',
                        technical: '👩‍💻 Technical',
                        business: '💼 Business',
                        leadership: '🎯 Leadership',
                        inputPlaceholder: 'Type your response...',
                        inputPlaceholderFree: 'Ask me anything about Tech Nation application...',
                        send: 'Send',
                        uploadResume: '📄 Upload Resume (PDF)',
                        thinking: 'Thinking...',
                        finalMessage: 'Great! Now you can ask me any specific questions about the Tech Nation application process. I will use the official guidance to help you! 💬'
                    },
                    zh: {
                        headerTitle: '🇬🇧 英国全球人才签证助手',
                        headerSubtitle: '数字技术路径 - Tech Nation',
                        welcome: '👋 欢迎！我将指导您完成英国全球人才签证数字技术路径的申请。',
                        visaInfo: 'ℹ️ **关于英国全球人才签证：** 该签证允许数字技术领域的高技能人才在英国生活和工作，无需雇主担保，同时为其家属提供完整的工作和学习权利。它提供灵活性、定居途径以及换工作或自雇的自由。',
                        startTopics: '让我们从一些快速话题开始。您想首先了解什么？',
                        eligibility: '📋 资格要求',
                        process: '🚀 申请流程',
                        documents: '📄 所需文件',
                        timeline: '⏰ 时间安排',
                        startAssessment: '✨ 开始评估',
                        assessmentStart: '让我们评估您的Tech Nation申请档案！🎯',
                        experienceQuestion: '您在数字技术领域有多少年经验？',
                        roleQuestion: '您在数字技术领域的主要角色是什么？',
                        technical: '👩‍💻 技术岗位',
                        business: '💼 商务岗位',
                        leadership: '🎯 领导岗位',
                        inputPlaceholder: '输入您的回复...',
                        inputPlaceholderFree: '询问任何关于Tech Nation申请的问题...',
                        send: '发送',
                        uploadResume: '📄 上传简历 (PDF)',
                        thinking: '思考中...',
                        finalMessage: '很好！现在您可以询问任何关于Tech Nation申请流程的具体问题。我将使用官方指南来帮助您！💬'
                    }
                };
                
                this.init();
            }
            
            switchLanguage(lang) {
                this.currentLanguage = lang;
                
                // Update UI elements
                document.getElementById('header-title').textContent = this.texts[lang].headerTitle;
                document.getElementById('header-subtitle').textContent = this.texts[lang].headerSubtitle;
                document.getElementById('messageInput').placeholder = this.currentStep === 'free' 
                    ? this.texts[lang].inputPlaceholderFree 
                    : this.texts[lang].inputPlaceholder;
                document.getElementById('sendBtn').textContent = this.texts[lang].send;
                document.getElementById('uploadBtn').textContent = this.texts[lang].uploadResume;
                
                // Update active language button
                document.getElementById('lang-en').classList.toggle('active', lang === 'en');
                document.getElementById('lang-zh').classList.toggle('active', lang === 'zh');
                
                // Clear chat and restart workflow in new language
                this.chat.innerHTML = '';
                this.currentStep = 'welcome';
                this.userProfile = {};
                
                setTimeout(() => this.startWorkflow(), 500);
            }
            
            init() {
                console.log('🤖 Starting guided workflow...');
                
                // Event listeners
                this.sendBtn.addEventListener('click', () => this.handleSend());
                this.messageInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' && !this.isLoading) this.handleSend();
                });
                this.uploadBtn.addEventListener('click', () => this.fileInput.click());
                this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
                
                // Start workflow
                setTimeout(() => this.startWorkflow(), 500);
            }
            
            startWorkflow() {
                const t = this.texts[this.currentLanguage];
                this.addMessage(t.welcome, 'bot');
                
                setTimeout(() => {
                    this.addMessage(t.visaInfo, 'bot');
                }, 1500);
                
                setTimeout(() => {
                    this.addMessage(t.startTopics, 'bot');
                    this.showInitialOptions();
                }, 3000);
            }
            
            showInitialOptions() {
                const t = this.texts[this.currentLanguage];
                const buttonsHtml = '<div class="button-group">' +
                    '<button class="guide-button" onclick="bot.handleTopicChoice(\\'eligibility\\')">' + t.eligibility + '</button>' +
                    '<button class="guide-button" onclick="bot.handleTopicChoice(\\'process\\')">' + t.process + '</button>' +
                    '<button class="guide-button" onclick="bot.handleTopicChoice(\\'documents\\')">' + t.documents + '</button>' +
                    '<button class="guide-button" onclick="bot.handleTopicChoice(\\'timeline\\')">' + t.timeline + '</button>' +
                    '<button class="workflow-button" onclick="bot.startAssessment()">' + t.startAssessment + '</button>' +
                    '</div>';
                
                const buttonMessage = document.createElement('div');
                buttonMessage.className = 'message bot-message';
                buttonMessage.innerHTML = buttonsHtml;
                this.chat.appendChild(buttonMessage);
                this.scrollToBottom();
            }
            
            async handleTopicChoice(topic) {
                const topicQuestions = {
                    en: {
                        'eligibility': 'What are the eligibility requirements for the Digital Technology route?',
                        'process': 'How does the Tech Nation application process work?',
                        'documents': 'What documents and evidence do I need to prepare?',
                        'timeline': 'How long does the entire process take?'
                    },
                    zh: {
                        'eligibility': '数字技术路径的资格要求是什么？',
                        'process': 'Tech Nation申请流程是如何运作的？',
                        'documents': '我需要准备哪些文件和证据？',
                        'timeline': '整个流程需要多长时间？'
                    }
                };
                
                const question = topicQuestions[this.currentLanguage][topic];
                this.addMessage(question, 'user');
                await this.sendToAPI(question);
                
                setTimeout(() => {
                    const followUpText = this.currentLanguage === 'en' ? 
                        'Would you like a personalized assessment of your profile?' :
                        '您想要对您的档案进行个性化评估吗？';
                    const yesText = this.currentLanguage === 'en' ? 'Yes, assess my profile' : '是的，评估我的档案';
                    const anotherText = this.currentLanguage === 'en' ? 'Ask another question' : '问另一个问题';
                    
                    this.addMessage(followUpText, 'bot');
                    const buttonHtml = '<div class="button-group">' +
                        '<button class="workflow-button" onclick="bot.startAssessment()">' + yesText + '</button>' +
                        '<button class="guide-button" onclick="bot.showInitialOptions()">' + anotherText + '</button>' +
                        '</div>';
                    
                    const buttonMessage = document.createElement('div');
                    buttonMessage.className = 'message bot-message';
                    buttonMessage.innerHTML = buttonHtml;
                    this.chat.appendChild(buttonMessage);
                    this.scrollToBottom();
                }, 2000);
            }
            
            startAssessment() {
                const t = this.texts[this.currentLanguage];
                const stepText = this.currentLanguage === 'en' ? 'Step 1/5: Experience' : '步骤 1/5：经验';
                
                this.currentStep = 'experience';
                this.addProgressIndicator(stepText);
                this.addMessage(t.assessmentStart, 'bot');
                
                setTimeout(() => {
                    this.addMessage(t.experienceQuestion, 'bot');
                    this.showExperienceOptions();
                }, 1000);
            }
            
            showExperienceOptions() {
                const yearTexts = this.currentLanguage === 'en' ? 
                    ['0-2 years', '3-5 years', '6-10 years', '10+ years'] :
                    ['0-2年', '3-5年', '6-10年', '10年以上'];
                
                const buttonsHtml = '<div class="button-group">' +
                    '<button class="workflow-button" onclick="bot.selectExperience(\\'0-2\\')">' + yearTexts[0] + '</button>' +
                    '<button class="workflow-button" onclick="bot.selectExperience(\\'3-5\\')">' + yearTexts[1] + '</button>' +
                    '<button class="workflow-button" onclick="bot.selectExperience(\\'6-10\\')">' + yearTexts[2] + '</button>' +
                    '<button class="workflow-button" onclick="bot.selectExperience(\\'10+\\')">' + yearTexts[3] + '</button>' +
                    '</div>';
                
                const buttonMessage = document.createElement('div');
                buttonMessage.className = 'message bot-message';
                buttonMessage.innerHTML = buttonsHtml;
                this.chat.appendChild(buttonMessage);
                this.scrollToBottom();
            }
            
            selectExperience(experience) {
                this.userProfile.experience = experience;
                const responseText = this.currentLanguage === 'en' ? 
                    'I have ' + experience + ' years of experience' :
                    '我有' + (experience === '10+' ? '10年以上' : experience + '年') + '的经验';
                this.addMessage(responseText, 'user');
                
                const stepText = this.currentLanguage === 'en' ? 'Step 2/5: Role' : '步骤 2/5：角色';
                this.currentStep = 'role';
                this.addProgressIndicator(stepText);
                
                setTimeout(() => {
                    const t = this.texts[this.currentLanguage];
                    this.addMessage(t.roleQuestion, 'bot');
                    this.showRoleOptions();
                }, 1000);
            }
            
            showRoleOptions() {
                const t = this.texts[this.currentLanguage];
                const buttonsHtml = '<div class="button-group">' +
                    '<button class="workflow-button" onclick="bot.selectRole(\\'technical\\')">' + t.technical + '</button>' +
                    '<button class="workflow-button" onclick="bot.selectRole(\\'business\\')">' + t.business + '</button>' +
                    '<button class="workflow-button" onclick="bot.selectRole(\\'leadership\\')">' + t.leadership + '</button>' +
                    '</div>';
                
                const buttonMessage = document.createElement('div');
                buttonMessage.className = 'message bot-message';
                buttonMessage.innerHTML = buttonsHtml;
                this.chat.appendChild(buttonMessage);
                this.scrollToBottom();
            }
            
            selectRole(role) {
                this.userProfile.role = role;
                const roleTexts = {
                    en: { technical: 'Technical', business: 'Business', leadership: 'Leadership' },
                    zh: { technical: '技术岗位', business: '商务岗位', leadership: '领导岗位' }
                };
                const responseText = this.currentLanguage === 'en' ? 
                    'My role is: ' + roleTexts.en[role] :
                    '我的角色是：' + roleTexts.zh[role];
                this.addMessage(responseText, 'user');
                
                const stepText = this.currentLanguage === 'en' ? 'Step 3/3: Analysis' : '步骤 3/3：分析';
                this.currentStep = 'analysis';
                this.addProgressIndicator(stepText);
                
                setTimeout(() => {
                    this.generateSimpleFeedback();
                }, 1000);
            }
            
            generateSimpleFeedback() {
                let feedback = this.currentLanguage === 'en' ? 
                    '📊 **Your Tech Nation Assessment:**\\n\\n' :
                    '📊 **您的Tech Nation评估：**\\n\\n';
                
                const expYears = this.userProfile.experience;
                if (this.currentLanguage === 'en') {
                    if (expYears === '0-2') {
                        feedback += '⚠️ **Experience:** Focus on "Exceptional Promise" route\\n';
                    } else if (expYears === '3-5') {
                        feedback += '✅ **Experience:** Good for "Exceptional Promise"\\n';
                    } else {
                        feedback += '✅ **Experience:** Strong for "Exceptional Talent"\\n';
                    }
                    feedback += '\\n🎯 **Next Steps:**\\n';
                    feedback += '• Gather evidence across 4 criteria\\n';
                    feedback += '• Get 3 recommendation letters\\n';
                    feedback += '• Prepare detailed portfolio\\n';
                } else {
                    if (expYears === '0-2') {
                        feedback += '⚠️ **经验：** 专注于"杰出潜力"路径\\n';
                    } else if (expYears === '3-5') {
                        feedback += '✅ **经验：** 适合"杰出潜力"路径\\n';
                    } else {
                        feedback += '✅ **经验：** 非常适合"杰出人才"路径\\n';
                    }
                    feedback += '\\n🎯 **下一步：**\\n';
                    feedback += '• 收集4个标准的证据\\n';
                    feedback += '• 获得3封推荐信\\n';
                    feedback += '• 准备详细档案\\n';
                }
                
                this.addMessage(feedback, 'bot');
                
                setTimeout(() => {
                    this.enableFreeChat();
                }, 1500);
            }
            
            enableFreeChat() {
                const t = this.texts[this.currentLanguage];
                this.currentStep = 'free';
                this.messageInput.disabled = false;
                this.sendBtn.disabled = false;
                this.messageInput.placeholder = t.inputPlaceholderFree;
                this.messageInput.focus();
                
                this.addMessage(t.finalMessage, 'bot');
            }
            
            async handleFileUpload(e) {
                const file = e.target.files[0];
                if (!file) return;
                
                if (file.type !== 'application/pdf') {
                    this.uploadStatus.textContent = '❌ Please upload PDF only';
                    return;
                }
                
                this.uploadStatus.textContent = 'Processing...';
                this.addMessage('Resume uploaded: ' + file.name, 'user');
                
                setTimeout(() => {
                    this.uploadStatus.textContent = '✅ Uploaded!';
                    this.addMessage('✅ Resume processed successfully!', 'bot');
                }, 2000);
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
                const t = this.texts[this.currentLanguage];
                const typingElement = this.addMessage(t.thinking, 'typing');
                
                try {
                    const response = await fetch('/api/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            message: message,
                            userId: this.getUserId(),
                            userProfile: this.userProfile,
                            language: this.currentLanguage // Send language preference
                        })
                    });
                    
                    const data = await response.json();
                    this.chat.removeChild(typingElement);
                    
                    if (data.response) {
                        this.addMessage(data.response, 'bot');
                    } else {
                        const errorMsg = this.currentLanguage === 'en' ? 
                            'Sorry, I encountered an error. Please try again.' :
                            '抱歉，我遇到了错误。请重试。';
                        this.addMessage(errorMsg, 'bot');
                    }
                    
                } catch (error) {
                    console.error('API Error:', error);
                    this.chat.removeChild(typingElement);
                    const errorMsg = this.currentLanguage === 'en' ? 
                        'I apologize, but I encountered an error. Please try again.' :
                        '很抱歉，我遇到了错误。请重试。';
                    this.addMessage(errorMsg, 'bot');
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
                
                let formattedText = text
                    .replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>')
                    .replace(/\\*(.*?)\\*/g, '<em>$1</em>')
                    .replace(/\\n/g, '<br>');
                
                messageElement.innerHTML = '<p>' + formattedText + '</p>';
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
                let id = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
                return id;
            }
        }
        
        // Initialize bot
        let bot;
        document.addEventListener('DOMContentLoaded', () => {
            bot = new GuidedWorkflowBot();
        });
    </script>
</body>
</html>`;

  res.status(200).send(html);
}