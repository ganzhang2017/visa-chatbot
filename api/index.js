selectRole(role) {
                this.userProfile.role = role;
                const roleTexts = {
                    en: { technical: 'Technical', business: 'Business' },
                    zh: { technical: '技术岗位', business: '商务岗位' }
                };
                const responseText = this.currentLanguage === 'en' ? 
                    'My role is: ' + roleTexts.en[role] :
                    '我的角色是：' + roleTexts.zh[role];
                this.addMessage(responseText, 'user');
                
                const stepText = this.currentLanguage === 'en' ? 'Step 3/5: Background' : '步骤 3/5：背景';
                this.currentStep = 'specifics';
                this.addProgressIndicator(stepText);
                
                setTimeout(() => {
                    if (role === 'technical') {
                        this.askTechnicalQuestions();
                    } else {
                        this.askBusinessQuestions();
                    }
                }, 1000);
            }
            
            askTechnicalQuestions() {
                const t = this.texts[this.currentLanguage];
                const questionText = this.currentLanguage === 'en' ?
                    'For technical roles, I need to understand your contributions and recognition:' :
                    '对于技术岗位，我需要了解您的贡献和认可：';
                    
                this.addMessage(questionText, 'bot');
                
                setTimeout(() => {
                    const selectText = this.currentLanguage === 'en' ?
                        'Do you have any of the following? (Select all that apply)' :
                        '您是否具备以下任何条件？（选择所有适用项）';
                    this.addMessage(selectText, 'bot');
                    
                    const buttonsHtml = '<div class="button-group">' +
                        '<button class="workflow-button" onclick="bot.addTechContribution(\\'opensource\\')">' +
                        (this.currentLanguage === 'en' ? '🔓 Open Source Contributions' : '🔓 开源贡献') + '</button>' +
                        '<button class="workflow-button" onclick="bot.addTechContribution(\\'speaking\\')">' +
                        (this.currentLanguage === 'en' ? '🎤 Conference Speaking' : '🎤 会议发言') + '</button>' +
                        '<button class="workflow-button" onclick="bot.addTechContribution(\\'publications\\')">' +
                        (this.currentLanguage === 'en' ? '📝 Publications/Blogs' : '📝 出版物/博客') + '</button>' +
                        '<button class="workflow-button" onclick="bot.addTechContribution(\\'awards\\')">' +
                        (this.currentLanguage === 'en' ? '🏆 Awards/Recognition' : '🏆 奖项/认可') + '</button>' +
                        '<button class="workflow-button" onclick="bot.finishContributions()">' +
                        (this.currentLanguage === 'en' ? '✅ Done' : '✅ 完成') + '</button>' +
                        '</div>';
                    
                    const buttonMessage = document.createElement('div');
                    buttonMessage.className = 'message bot-message';
                    buttonMessage.innerHTML = buttonsHtml;
                    this.chat.appendChild(buttonMessage);
                    this.scrollToBottom();
                }, 1000);
            }
            
            askBusinessQuestions() {
                const questionText = this.currentLanguage === 'en' ?
                    'For business roles, I need to understand your impact and external activities:' :
                    '对于商务岗位，我需要了解您的影响和外部活动：';
                    
                this.addMessage(questionText, 'bot');
                
                setTimeout(() => {
                    const impactText = this.currentLanguage === 'en' ?
                        'What kind of business impact have you achieved?' :
                        '您取得了什么样的商业影响？';
                    this.addMessage(impactText, 'bot');
                    
                    const buttonsHtml = '<div class="button-group">' +
                        '<button class="workflow-button" onclick="bot.selectImpact(\\'revenue\\')">' +
                        (this.currentLanguage === 'en' ? '💰 Revenue Growth' : '💰 收入增长') + '</button>' +
                        '<button class="workflow-button" onclick="bot.selectImpact(\\'products\\')">' +
                        (this.currentLanguage === 'en' ? '🚀 Product Launches' : '🚀 产品发布') + '</button>' +
                        '<button class="workflow-button" onclick="bot.selectImpact(\\'scaling\\')">' +
                        (this.currentLanguage === 'en' ? '📈 Team/Company Scaling' : '📈 团队/公司扩展') + '</button>' +
                        '<button class="workflow-button" onclick="bot.selectImpact(\\'innovation\\')">' +
                        (this.currentLanguage === 'en' ? '💡 Innovation Projects' : '💡 创新项目') + '</button>' +
                        '</div>';
                    
                    const buttonMessage = document.createElement('div');
                    buttonMessage.className = 'message bot-message';
                    buttonMessage.innerHTML = buttonsHtml;
                    this.chat.appendChild(buttonMessage);
                    this.scrollToBottom();
                }, 1000);
            }
            
            addTechContribution(contribution) {
                if (!this.userProfile.contributions) this.userProfile.contributions = [];
                if (!this.userProfile.contributions.includes(contribution)) {
                    this.userProfile.contributions.push(contribution);
                    
                    const labels = {
                        en: {
                            'opensource': 'Open Source Contributions',
                            'speaking': 'Conference Speaking',
                            'publications': 'Publications/Blogs',
                            'awards': 'Awards/Recognition'
                        },
                        zh: {
                            'opensource': '开源贡献',
                            'speaking': '会议发言',
                            'publications': '出版物/博客',
                            'awards': '奖项/认可'
                        }
                    };
                    
                    const addedText = this.currentLanguage === 'en' ? 'Added: ' : '已添加：';
                    this.addMessage(addedText + labels[this.currentLanguage][contribution], 'user');
                }
            }
            
            finishContributions() {
                const stepText = this.currentLanguage === 'en' ? 'Step 4/5: Resume Upload' : '步骤 4/5：简历上传';
                this.currentStep = 'upload';
                this.addProgressIndicator(stepText);
                
                setTimeout(() => {
                    const uploadText = this.currentLanguage === 'en' ?
                        'Great! Now please upload your resume (PDF format only) so I can analyze your background in detail.' :
                        '很好！现在请上传您的简历（仅PDF格式），以便我详细分析您的背景。';
                    this.addMessage(uploadText, 'bot');
                    this.uploadBtn.style.display = 'inline-block';
                    
                    // Add continue without upload option
                    const buttonHtml = '<div class="button-group" style="margin-top: 15px;">' +
                        '<button class="guide-button" onclick="bot.performFinalAnalysis()">' +
                        (this.currentLanguage === 'en' ? 'Skip resume upload' : '跳过简历上传') + '</button>' +
                        '</div>';
                    
                    const buttonMessage = document.createElement('div');
                    buttonMessage.className = 'message bot-message';
                    buttonMessage.innerHTML = buttonHtml;
                    this.chat.appendChild(buttonMessage);
                    this.scrollToBottom();
                }, 1000);
            }
            
            selectImpact(impact) {
                this.userProfile.impact = impact;
                
                const labels = {
                    en: {
                        'revenue': 'Revenue Growth',
                        'products': 'Product Launches',
                        'scaling': 'Team/Company Scaling',
                        'innovation': 'Innovation Projects'
                    },
                    zh: {
                        'revenue': '收入增长',
                        'products': '产品发布',
                        'scaling': '团队/公司扩展',
                        'innovation': '创新项目'
                    }
                };
                
                const impactText = this.currentLanguage === 'en' ? 'My main impact: ' : '我的主要影响：';
                this.addMessage(impactText + labels[this.currentLanguage][impact], 'user');
                this.finishContributions();
            }
            
            performFinalAnalysis() {
                const stepText = this.currentLanguage === 'en' ? 'Step 5/5: Analysis' : '步骤 5/5：分析';
                this.currentStep = 'analysis';
                this.addProgressIndicator(stepText);
                
                const analyzingText = this.currentLanguage === 'en' ?
                    'Analyzing your profile against Tech Nation criteria...' :
                    '根据Tech Nation标准分析您的档案...';
                this.addMessage(analyzingText, 'bot');
                
                setTimeout(() => {
                    this.generatePersonalizedFeedback();
                }, 2000);
            }
            
            generatePersonalizedFeedback() {
                let feedback = this.currentLanguage === 'en' ? 
                    '📊 **Your Comprehensive Tech Nation Assessment:**\\n\\n' :
                    '📊 **您的综合Tech Nation评估：**\\n\\n';
                
                const expYears = this.userProfile.experience;
                if (this.currentLanguage === 'en') {
                    // Experience assessment with more detail
                    if (expYears === '0-2') {
                        feedback += '⚠️ **Experience Level:** With 0-2 years, focus on **"Exceptional Promise"** route.\\n';
                        feedback += '• Emphasize potential and unique contributions\\n';
                        feedback += '• Highlight early career recognition\\n\\n';
                    } else if (expYears === '3-5') {
                        feedback += '✅ **Experience Level:** 3-5 years is solid for **"Exceptional Promise"** route.\\n';
                        feedback += '• Focus on demonstrating rapid growth\\n';
                        feedback += '• Show external recognition despite shorter experience\\n\\n';
                    } else {
                        feedback += '✅ **Experience Level:** Strong foundation for **"Exceptional Talent"** route.\\n';
                        feedback += '• Demonstrate established expertise and recognition\\n';
                        feedback += '• Show progression to industry influence\\n\\n';
                    }
                    
                    // Role-specific detailed feedback
                    if (this.userProfile.role === 'technical') {
                        feedback += '💻 **Technical Role Strategy:**\\n';
                        if (this.userProfile.contributions && this.userProfile.contributions.length > 0) {
                            feedback += 'Great foundation with: ' + this.userProfile.contributions.join(', ') + '\\n\\n';
                            
                            this.userProfile.contributions.forEach(contrib => {
                                const detailedTips = {
                                    'opensource': '🔓 **Open Source:** Document download statistics and community adoption\\n',
                                    'speaking': '🎤 **Speaking:** Include audience sizes and conference prestige\\n',
                                    'publications': '📝 **Publications:** Show view counts and industry impact\\n',
                                    'awards': '🏆 **Awards:** These carry the highest weight - maximize impact\\n'
                                };
                                feedback += detailedTips[contrib];
                            });
                        }
                    } else if (this.userProfile.role === 'business') {
                        feedback += '💼 **Business Role Strategy:**\\n';
                        if (this.userProfile.impact) {
                            feedback += 'Focus area: ' + this.userProfile.impact + '\\n';
                        }
                        feedback += '• Quantify everything with specific metrics\\n';
                        feedback += '• Show external recognition and validation\\n';
                        feedback += '• Demonstrate innovation in business processes\\n\\n';
                    }
                } else {
                    // Chinese version with similar detail
                    if (expYears === '0-2') {
                        feedback += '⚠️ **经验水平：** 0-2年经验，专注于**"杰出潜力"**路径。\\n';
                        feedback += '• 强调潜力和独特贡献\\n';
                        feedback += '• 突出早期职业认可\\n\\n';
                    } else if (expYears === '3-5') {
                        feedback += '✅ **经验水平：** 3-5年经验适合**"杰出潜力"**路径。\\n';
                        feedback += '• 专注于展示快速成长\\n';
                        feedback += '• 显示外部认可\\n\\n';
                    } else {
                        feedback += '✅ **经验水平：** 强有力的**"杰出人才"**路径基础。\\n';
                        feedback += '• 展示既定专业知识和认可\\n';
                        feedback += '• 显示向行业影响力的进展\\n\\n';
                    }
                    
                    if (this.userProfile.role === 'technical') {
                        feedback += '💻 **技术岗位策略：**\\n';
                        if (this.userProfile.contributions && this.userProfile.contributions.length > 0) {
                            feedback += '良好基础：' + this.userProfile.contributions.join('、') + '\\n\\n';
                        }
                    } else if (this.userProfile.role === 'business') {
                        feedback += '💼 **商务岗位策略：**\\n';
                        feedback += '• 用具体指标量化一切\\n';
                        feedback += '• 显示外部认可和验证\\n';
                        feedback += '• 展示商业流程创新\\n\\n';
                    }
                }
                
                // Cost breakdown
                if (this.currentLanguage === 'en') {
                    feedback += '💰 **Application Costs:**\\n';
                    feedback += '• Tech Nation endorsement: £561\\n';
                    feedback += '• Visa application: £205\\n';
                    feedback += '• **Total: £766**\\n';
                    feedback += '\\n💊 **Additional Costs:**\\n';
                    feedback += '• Healthcare surcharge: £1,035/year\\n';
                    feedback += '• Dependants: £766 each (if applicable)\\n';
                    
                    feedback += '\\n🎯 **Your Action Plan:**\\n';
                    feedback += '• Gather evidence for each claim with specific examples\\n';
                    feedback += '• Prepare 10 pieces of evidence across the 4 criteria\\n';
                    feedback += '• Get 3 strong recommendation letters from industry leaders\\n';
                } else {
                    feedback += '💰 **申请费用：**\\n';
                    feedback += '• Tech Nation背书：£561\\n';
                    feedback += '• 签证申请：£205\\n';
                    feedback += '• **总计：£766**\\n';
                    feedback += '\\n💊 **额外费用：**\\n';
                    feedback += '• 医疗附加费：£1,035/年\\n';
                    feedback += '• 家属：每人£766（如适用）\\n';
                    
                    feedback += '\\n🎯 **您的行动计划：**\\n';
                    feedback += '• 为每项声明收集具体证据\\n';
                    feedback += '• 准备跨4个标准的10项证据\\n';
                    feedback += '• 获得3封来自行业领导者的推荐信\\n';
                }
                
                this.addMessage(feedback, 'bot');
                
                setTimeout(() => {
                    const finalText = this.currentLanguage === 'en' ?
                        'I now have a complete picture of your background. What would you like to focus on next?' :
                        '我现在对您的背景有了完整的了解。您接下来想重点关注什么？';
                    this.addMessage(finalText, 'bot');
                    this.showFinalOptions();
                }, 2000);
            }
            
            showFinalOptions() {
                const buttonsHtml = '<div class="button-group">' +
                    '<button class="guide-button" onclick="bot.askQuestion(\\'evidence requirements\\')">' +
                    (this.currentLanguage === 'en' ? '📋 Evidence Requirements' : '📋 证据要求') + '</button>' +
                    '<button class="guide-button" onclick="bot.askQuestion(\\'recommendation letters\\')">' +
                    (this.currentLanguage === 'en' ? '✍️ Recommendation Letters' : '✍️ 推荐信') + '</button>' +
                    '<button class="guide-button" onclick="bot.askQuestion(\\'application timeline\\')">' +
                    (this.currentLanguage === 'en' ? '⏰ Application Timeline' : '⏰ 申请时间') + '</button>' +
                    '<button class="workflow-button" onclick="bot.enableFreeChat()">' +
                    (export default function handler(req, res) {
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
        
        .role-examples {
            background: rgba(102, 126, 234, 0.05);
            border: 1px solid rgba(102, 126, 234, 0.1);
            border-radius: 10px;
            padding: 12px;
            margin: 10px 0;
            font-size: 12px;
            line-height: 1.4;
        }
        
        .role-examples h4 {
            margin: 0 0 8px 0;
            color: #667eea;
            font-size: 13px;
        }
        
        .role-examples ul {
            margin: 0;
            padding-left: 15px;
        }
        
        .role-examples li {
            margin-bottom: 3px;
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
                this.currentLanguage = 'en';
                
                // Language text configurations
                this.texts = {
                    en: {
                        headerTitle: '🇬🇧 UK Global Talent Visa Assistant',
                        headerSubtitle: 'Digital Technology Route - Tech Nation',
                        welcome: '👋 Welcome! I will guide you through the UK Global Talent Visa application for Digital Technology.',
                        visaInfo: 'ℹ️ **About the UK Global Talent Visa:** This visa lets highly skilled individuals in digital technology live and work in the UK without needing employer sponsorship, while also giving their dependants full work and study rights. It offers flexibility, a pathway to settlement, and freedom to change jobs or be self-employed. **Disclaimer:** This is general guidance, not legal advice. For formal immigration advice, please speak with an OISC-registered adviser or solicitor.',
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
                        visaInfo: 'ℹ️ **关于英国全球人才签证：** 该签证允许数字技术领域的高技能人才在英国生活和工作，无需雇主担保，同时为其家属提供完整的工作和学习权利。它提供灵活性、定居途径以及换工作或自雇的自由。**免责声明：** 本聊天机器人提供的是一般性指导信息，并非法律意见。如需正式的移民法律建议，请咨询经 OISC 注册的顾问或合格律师。',
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
                        inputPlaceholder: '输入您的回复...',
                        inputPlaceholderFree: '询问任何关于Tech Nation申请的问题...',
                        send: '发送',
                        uploadResume: '📄 上传简历 (PDF)',
                        thinking: '思考中...',
                        finalMessage: '很好！现在您可以询问任何关于Tech Nation申请流程的具体问题。我将使用官方指南来帮助您！💬'
                    }
                };
                
                // Role examples for better user guidance
                this.roleExamples = {
                    en: {
                        technical: {
                            title: 'Examples of Technical Roles:',
                            examples: [
                                'DevOps / SysOps engineers',
                                'Principal software engineers/developers',
                                'Experienced data scientists/data engineers',
                                'AI, NLP, ML experts',
                                'Cybersecurity experts',
                                'Hardware engineers',
                                'Experienced front-end developers',
                                'Operating systems engineers',
                                'Experienced video game developers',
                                'Experienced UX/UI designers',
                                'Experienced Mobile App developers',
                                'Back end developers (blockchain, Scala, Golang, etc.)',
                                'CTO or VP engineering experience',
                                'Virtual and augmented reality developers'
                            ]
                        },
                        business: {
                            title: 'Examples of Business Roles:',
                            examples: [
                                'Leading substantial VC investment over £25m GBP',
                                'Commercial/business lead roles (P&L, growth, sales)',
                                'Expanding or scaling digital technology business',
                                'Sector-specific expertise (FinTech, EdTech, etc.)',
                                'Solution sales experts',
                                'Experienced Product Managers',
                                'SaaS or enterprise sales leadership',
                                'Performance marketing experts',
                                'Senior VC or PE analysts',
                                'C-Suite roles in SMEs+ (CEO, CMO, CIO, etc.)'
                            ]
                        }
                    },
                    zh: {
                        technical: {
                            title: '技术岗位示例：',
                            examples: [
                                'DevOps / SysOps 工程师',
                                '首席软件工程师/开发人员',
                                '经验丰富的数据科学家/数据工程师',
                                'AI、NLP、ML专家',
                                '网络安全专家',
                                '硬件工程师',
                                '经验丰富的前端开发人员',
                                '操作系统工程师',
                                '经验丰富的游戏开发人员',
                                '经验丰富的UX/UI设计师',
                                '经验丰富的移动应用开发人员',
                                '后端开发人员（区块链、Scala、Golang等）',
                                'CTO或VP工程经验',
                                '虚拟和增强现实开发人员'
                            ]
                        },
                        business: {
                            title: '商务岗位示例：',
                            examples: [
                                '领导超过£25m GBP的大额VC投资',
                                '商业/业务主管角色（P&L、增长、销售）',
                                '扩展或扩大数字技术业务',
                                '特定行业专业知识（金融科技、教育科技等）',
                                '解决方案销售专家',
                                '经验丰富的产品经理',
                                'SaaS或企业销售领导',
                                '绩效营销专家',
                                '高级VC或PE分析师',
                                'SMEs+的C级角色（CEO、CMO、CIO等）'
                            ]
                        }
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
                
                // Start workflow immediately
                this.startWorkflow();
            }
            
            startWorkflow() {
                const t = this.texts[this.currentLanguage];
                
                // Add welcome message immediately
                this.addMessage(t.welcome, 'bot');
                
                // Add visa info after short delay
                setTimeout(() => {
                    this.addMessage(t.visaInfo, 'bot');
                }, 1000);
                
                // Add topic selection after another delay
                setTimeout(() => {
                    this.addMessage(t.startTopics, 'bot');
                    this.showInitialOptions();
                }, 2000);
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
                        'process': 'How does the Tech Nation application process work? Please include all costs.',
                        'documents': 'What documents and evidence do I need to prepare?',
                        'timeline': 'How long does the entire process take?'
                    },
                    zh: {
                        'eligibility': '数字技术路径的资格要求是什么？',
                        'process': 'Tech Nation申请流程是如何运作的？请包括所有费用。',
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
                const stepText = this.currentLanguage === 'en' ? 'Step 1/3: Experience' : '步骤 1/3：经验';
                
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
                
                const stepText = this.currentLanguage === 'en' ? 'Step 2/3: Role' : '步骤 2/3：角色';
                this.currentStep = 'role';
                this.addProgressIndicator(stepText);
                
                setTimeout(() => {
                    const t = this.texts[this.currentLanguage];
                    this.addMessage(t.roleQuestion, 'bot');
                    this.showRoleOptionsWithExamples();
                }, 1000);
            }
            
            showRoleOptionsWithExamples() {
                const t = this.texts[this.currentLanguage];
                const examples = this.roleExamples[this.currentLanguage];
                
                // Create role selection buttons
                const buttonsHtml = '<div class="button-group">' +
                    '<button class="workflow-button" onclick="bot.selectRole(\\'technical\\')">' + t.technical + '</button>' +
                    '<button class="workflow-button" onclick="bot.selectRole(\\'business\\')">' + t.business + '</button>' +
                    '</div>';
                
                const buttonMessage = document.createElement('div');
                buttonMessage.className = 'message bot-message';
                buttonMessage.innerHTML = buttonsHtml;
                this.chat.appendChild(buttonMessage);
                
                // Add technical examples
                const techExamplesHtml = '<div class="role-examples">' +
                    '<h4>' + examples.technical.title + '</h4>' +
                    '<ul>' +
                    examples.technical.examples.map(ex => '<li>' + ex + '</li>').join('') +
                    '</ul>' +
                    '</div>';
                
                const techMessage = document.createElement('div');
                techMessage.className = 'message bot-message';
                techMessage.innerHTML = techExamplesHtml;
                this.chat.appendChild(techMessage);
                
                // Add business examples
                const bizExamplesHtml = '<div class="role-examples">' +
                    '<h4>' + examples.business.title + '</h4>' +
                    '<ul>' +
                    examples.business.examples.map(ex => '<li>' + ex + '</li>').join('') +
                    '</ul>' +
                    '</div>';
                
                const bizMessage = document.createElement('div');
                bizMessage.className = 'message bot-message';
                bizMessage.innerHTML = bizExamplesHtml;
                this.chat.appendChild(bizMessage);
                
                this.scrollToBottom();
            }
            
            selectRole(role) {
                this.userProfile.role = role;
                const roleTexts = {
                    en: { technical: 'Technical', business: 'Business' },
                    zh: { technical: '技术岗位', business: '商务岗位' }
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
                    feedback += '\\n💰 **Total Costs:** £456 (Tech Nation endorsement) + £716 (visa application) = £1,172 total\\n';
                    feedback += '\\n💰 **Total Costs:** £561 (Tech Nation endorsement) + £205 (visa application) + £1,035/year (healthcare surcharge) = £766 + £1,035/year\\n';
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
                    feedback += '\\n💰 **总费用：** £561（Tech Nation背书）+ £205（签证申请）+ £1,035/年（医疗附加费）= £766 + £1,035/年\\n';
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
                            language: this.currentLanguage
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
        
        // Initialize bot when page loads
        let bot;
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOM loaded, initializing bot...');
            bot = new GuidedWorkflowBot();
        });
        
        // Fallback initialization
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                if (!bot) {
                    console.log('Fallback initialization...');
                    bot = new GuidedWorkflowBot();
                }
            });
        } else {
            console.log('Document already loaded, initializing immediately...');
            bot = new GuidedWorkflowBot();
        }
    </script>
</body>
</html>`;

  res.status(200).send(html);
}