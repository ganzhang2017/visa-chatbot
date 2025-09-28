<<<<<<< HEAD
// api/index-en.js - Complete updated frontend with all fixes
=======
// api/index-en.js - English Version Frontend
>>>>>>> f1030aa399405e9f6e035f37c9717c58678c8ffb
export default function handler(req, res) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UK Global Talent Visa Bot - English</title>
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
        
<<<<<<< HEAD
=======
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
        
>>>>>>> f1030aa399405e9f6e035f37c9717c58678c8ffb
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
        
<<<<<<< HEAD
        .message h1, .message h2, .message h3 {
            margin: 10px 0 5px 0;
            font-weight: 600;
        }
        
        .message h1 { font-size: 18px; }
        .message h2 { font-size: 16px; }  
        .message h3 { font-size: 15px; }
        
        .message ul, .message ol {
            margin: 8px 0;
            padding-left: 20px;
        }
        
        .message li {
            margin: 4px 0;
            line-height: 1.4;
        }
        
        .message p {
            margin: 8px 0;
        }
        
        .message strong {
            font-weight: 600;
            color: #2c3e50;
        }
        
=======
>>>>>>> f1030aa399405e9f6e035f37c9717c58678c8ffb
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
<<<<<<< HEAD
        
        .resume-preview {
            background: #e8f4f8;
            border: 1px solid #bee5eb;
            border-radius: 8px;
            padding: 10px;
            margin: 10px 0;
            font-size: 12px;
            max-height: 100px;
            overflow-y: auto;
        }
=======
>>>>>>> f1030aa399405e9f6e035f37c9717c58678c8ffb
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
<<<<<<< HEAD
=======
            <a href="/api/index-zh" class="language-link">中文版</a>
>>>>>>> f1030aa399405e9f6e035f37c9717c58678c8ffb
            <div>🇬🇧 UK Global Talent Visa Assistant</div>
            <div style="font-size: 12px; opacity: 0.9; margin-top: 5px;">Digital Technology Route - Tech Nation</div>
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
                <button id="uploadBtn">📄 Upload Resume (PDF)</button>
                <input type="file" id="fileInput" accept=".pdf">
                <span class="upload-status" id="uploadStatus"></span>
            </div>
        </div>
    </div>
    
    <script>
        class EnglishGuidedBot {
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
<<<<<<< HEAD
                this.resumeAnalysis = null;
=======
>>>>>>> f1030aa399405e9f6e035f37c9717c58678c8ffb
                
                this.init();
            }
            
            init() {
                console.log('🤖 Starting English guided workflow...');
                
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
                this.addMessage('👋 Welcome! I will guide you through the UK Global Talent Visa application for Digital Technology.', 'bot');
                
                setTimeout(() => {
<<<<<<< HEAD
                    this.addMessage('ℹ️ **About the UK Global Talent Visa:** This visa lets highly skilled individuals in digital technology live and work in the UK without needing employer sponsorship, while also giving their dependants full work and study rights. **Disclaimer:** This is general guidance, not legal advice.', 'bot');
=======
                    this.addMessage('ℹ️ **About the UK Global Talent Visa:** This visa lets highly skilled individuals in digital technology live and work in the UK without needing employer sponsorship, while also giving their dependants full work and study rights. It offers flexibility, a pathway to settlement, and freedom to change jobs or be self-employed. **Disclaimer:** This is general guidance, not legal advice. For formal immigration advice, please speak with an OISC-registered adviser or solicitor.', 'bot');
>>>>>>> f1030aa399405e9f6e035f37c9717c58678c8ffb
                }, 1000);
                
                setTimeout(() => {
                    this.addMessage('Let us start with some quick topics. What would you like to know about first?', 'bot');
                    this.showInitialOptions();
                }, 2000);
            }
            
            showInitialOptions() {
                const buttonsHtml = '<div class="button-group">' +
                    '<button class="guide-button" onclick="bot.handleTopicChoice(\\'eligibility\\')">📋 Eligibility</button>' +
                    '<button class="guide-button" onclick="bot.handleTopicChoice(\\'process\\')">🚀 Process</button>' +
                    '<button class="guide-button" onclick="bot.handleTopicChoice(\\'documents\\')">📄 Documents</button>' +
                    '<button class="guide-button" onclick="bot.handleTopicChoice(\\'timeline\\')">⏰ Timeline</button>' +
                    '<button class="workflow-button" onclick="bot.startAssessment()">✨ Start Assessment</button>' +
                    '</div>';
                
                const buttonMessage = document.createElement('div');
                buttonMessage.className = 'message bot-message';
                buttonMessage.innerHTML = buttonsHtml;
                this.chat.appendChild(buttonMessage);
                this.scrollToBottom();
            }
            
            async handleTopicChoice(topic) {
                const topicQuestions = {
                    'eligibility': 'What are the eligibility requirements for the Digital Technology route?',
<<<<<<< HEAD
                    'process': 'How does the Tech Nation application process work? Please include all costs.',
=======
                    'process': 'How does the Tech Nation application process work? It costs 766 GBP to apply.',
>>>>>>> f1030aa399405e9f6e035f37c9717c58678c8ffb
                    'documents': 'What documents and evidence do I need to prepare?',
                    'timeline': 'How long does the entire process take?'
                };
                
                const question = topicQuestions[topic];
                this.addMessage(question, 'user');
                await this.sendToAPI(question);
                
                setTimeout(() => {
                    this.addMessage('Would you like a personalized assessment of your profile?', 'bot');
                    const buttonHtml = '<div class="button-group">' +
                        '<button class="workflow-button" onclick="bot.startAssessment()">Yes, assess my profile</button>' +
                        '<button class="guide-button" onclick="bot.showInitialOptions()">Ask another question</button>' +
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
                this.addProgressIndicator('Step 1/5: Experience');
                this.addMessage('Let us assess your profile for the Tech Nation application! 🎯', 'bot');
                
                setTimeout(() => {
                    this.addMessage('How many years of experience do you have in digital technology?', 'bot');
                    this.showExperienceOptions();
                }, 1000);
            }
            
            showExperienceOptions() {
                const buttonsHtml = '<div class="button-group">' +
                    '<button class="workflow-button" onclick="bot.selectExperience(\\'0-2\\')">0-2 years</button>' +
                    '<button class="workflow-button" onclick="bot.selectExperience(\\'3-5\\')">3-5 years</button>' +
                    '<button class="workflow-button" onclick="bot.selectExperience(\\'6-10\\')">6-10 years</button>' +
                    '<button class="workflow-button" onclick="bot.selectExperience(\\'10+\\')">10+ years</button>' +
                    '</div>';
                
                const buttonMessage = document.createElement('div');
                buttonMessage.className = 'message bot-message';
                buttonMessage.innerHTML = buttonsHtml;
                this.chat.appendChild(buttonMessage);
                this.scrollToBottom();
            }
            
            selectExperience(experience) {
                this.userProfile.experience = experience;
                this.addMessage('I have ' + experience + ' years of experience', 'user');
                
                this.currentStep = 'role';
                this.addProgressIndicator('Step 2/5: Role');
                
                setTimeout(() => {
                    this.addMessage('What is your primary role in digital technology?', 'bot');
                    this.showRoleOptions();
                }, 1000);
            }
            
            showRoleOptions() {
                const buttonsHtml = '<div class="button-group">' +
                    '<button class="workflow-button" onclick="bot.selectRole(\\'technical\\')">👩‍💻 Technical</button>' +
                    '<button class="workflow-button" onclick="bot.selectRole(\\'business\\')">💼 Business</button>' +
                    '</div>';
                
                const buttonMessage = document.createElement('div');
                buttonMessage.className = 'message bot-message';
                buttonMessage.innerHTML = buttonsHtml;
                this.chat.appendChild(buttonMessage);
                this.scrollToBottom();
            }
            
            selectRole(role) {
                this.userProfile.role = role;
                this.addMessage('My role is: ' + (role === 'technical' ? 'Technical' : 'Business'), 'user');
                
                this.currentStep = 'resume';
                this.addProgressIndicator('Step 3/5: Resume Upload');
                
                setTimeout(() => {
<<<<<<< HEAD
                    this.addMessage('To give you personalized guidance, please upload your resume (PDF format). This will help me analyze your recent positions and provide specific recommendations.', 'bot');
=======
                    this.addMessage('To give you personalized guidance, please upload your resume (PDF format). This will help me understand your background and provide specific recommendations for strengthening your Tech Nation application.', 'bot');
>>>>>>> f1030aa399405e9f6e035f37c9717c58678c8ffb
                    this.enableResumeUpload();
                }, 1000);
            }
            
            enableResumeUpload() {
                this.uploadBtn.style.display = 'block';
<<<<<<< HEAD
                this.addMessage('Click the "Upload Resume" button below when you\\'re ready. Don\\'t have your resume ready? You can skip this step.', 'bot');
=======
                this.addMessage('Click the "Upload Resume" button below when you\\'re ready. Don\\'t have your resume ready? You can skip this step and still get general guidance.', 'bot');
>>>>>>> f1030aa399405e9f6e035f37c9717c58678c8ffb
                
                const buttonHtml = '<div class="button-group">' +
                    '<button class="workflow-button" onclick="bot.skipResume()">Skip Resume Upload</button>' +
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
                    this.uploadStatus.textContent = '❌ Please upload PDF only';
                    return;
                }
                
<<<<<<< HEAD
                if (file.size > 10 * 1024 * 1024) {
=======
                if (file.size > 10 * 1024 * 1024) { // 10MB limit
>>>>>>> f1030aa399405e9f6e035f37c9717c58678c8ffb
                    this.uploadStatus.textContent = '❌ File too large (max 10MB)';
                    return;
                }
                
                this.uploadStatus.textContent = '📤 Processing...';
                this.addMessage('Resume uploaded: ' + file.name, 'user');
                
                try {
<<<<<<< HEAD
                    // Try backend processing first
                    const backendResult = await this.uploadToBackend(file);
                    if (backendResult.success && backendResult.textExtracted) {
                        this.resumeContent = backendResult.extractedText || (backendResult.preview && backendResult.preview.replace('...', ''));
                        this.uploadStatus.textContent = '✅ Resume processed successfully';
                        this.analyzeAndShowResume();
                        this.addMessage('✅ Resume processed successfully! I\\'ve analyzed your background and can now provide personalized advice.', 'bot');
=======
                    // Extract text from PDF
                    const text = await this.extractTextFromPDF(file);
                    if (text && text.length > 100) {
                        this.resumeContent = text;
                        this.uploadStatus.textContent = '✅ Resume processed!';
                        this.addMessage('✅ Resume processed successfully! I can now give you personalized recommendations.', 'bot');
>>>>>>> f1030aa399405e9f6e035f37c9717c58678c8ffb
                        
                        setTimeout(() => {
                            this.generateFeedback();
                        }, 1500);
<<<<<<< HEAD
                        return;
                    }
                    
                    // Fallback to frontend processing
                    console.log('Backend processing failed, trying frontend...');
                    const frontendText = await this.extractTextFromPDF(file);
                    if (frontendText && frontendText.length > 100) {
                        this.resumeContent = frontendText;
                        this.uploadStatus.textContent = '✅ Resume processed successfully';
                        this.analyzeAndShowResume();
                        this.addMessage('✅ Resume processed successfully! I\\'ve analyzed your background and can now provide personalized advice.', 'bot');
                        
                        setTimeout(() => {
                            this.generateFeedback();
                        }, 1500);
                        return;
                    }
                    
                    throw new Error('Could not extract sufficient text');
                    
=======
                    } else {
                        throw new Error('Could not extract text');
                    }
>>>>>>> f1030aa399405e9f6e035f37c9717c58678c8ffb
                } catch (error) {
                    console.error('PDF processing error:', error);
                    this.uploadStatus.textContent = '⚠️ Processing failed, continuing...';
                    this.addMessage('I had trouble reading your PDF, but I can still provide general guidance. Let\\'s continue!', 'bot');
                    
                    setTimeout(() => {
                        this.generateFeedback();
                    }, 1500);
                }
            }
            
<<<<<<< HEAD
            analyzeAndShowResume() {
                if (!this.resumeContent) return;
                
                // Analyze the resume content
                this.resumeAnalysis = this.analyzeResume(this.resumeContent);
                
                console.log('Frontend resume analysis result:', this.resumeAnalysis);
                
                // Show preview of what was detected
                const preview = this.resumeContent.substring(0, 300);
                const analysis = this.resumeAnalysis;
                
                const previewHtml = '<div class="resume-preview">📄 Resume Summary: ' + preview + '...</div>' +
                    '<div class="resume-preview">🔍 Key Information Detected:<br>' +
                    'Recent Positions: ' + (analysis.recentPositions.join(', ') || 'None detected') + '<br>' +
                    'Skills: ' + (analysis.skills.slice(0, 8).join(', ') || 'None detected') + '<br>' +
                    'Companies: ' + (analysis.companies.join(', ') || 'None detected') + '</div>';
                
                const previewMessage = document.createElement('div');
                previewMessage.className = 'message bot-message';
                previewMessage.innerHTML = previewHtml;
                this.chat.appendChild(previewMessage);
                this.scrollToBottom();
            }
            
            analyzeResume(text) {
                const lowerText = text.toLowerCase();
                const analysis = {
                    recentPositions: [],
                    skills: [],
                    companies: [],
                    experienceYears: 0
                };
                
                console.log('Analyzing resume text:', text.substring(0, 500));
                
                // Extract recent positions (focus on senior roles and common titles)
                const positionPatterns = [
                    /(?:senior|lead|principal|chief|director|head of|vp|vice president|manager)\\s+(?:software|data|machine learning|ai|full stack|backend|frontend|devops|security|product|engineering|technical|technology)\\s+(?:engineer|developer|scientist|architect|manager|director|lead)/gi,
                    /(?:software|data|machine learning|ai|full stack|backend|frontend|devops|security|product|technical|technology)\\s+(?:engineer|developer|scientist|architect|manager|director|lead)/gi,
                    /(?:cto|chief technology officer|engineering manager|technical lead|solutions architect|staff engineer|principal engineer)/gi
                ];
                
                positionPatterns.forEach(pattern => {
                    const matches = text.match(pattern);
                    if (matches) {
                        analysis.recentPositions.push(...matches.slice(0, 3).map(m => m.trim()));
                        console.log('Found positions with pattern:', pattern, matches);
                    }
                });
                
                // Extract technical skills (broader patterns)
                const skillPatterns = [
                    /(?:python|java|javascript|typescript|go|rust|c\\+\\+|c#|scala|r|php|ruby|swift|kotlin)/gi,
                    /(?:react|angular|vue|node\\.?js|express|django|flask|spring|laravel|rails)/gi,
                    /(?:aws|azure|gcp|google cloud|docker|kubernetes|terraform|jenkins|gitlab|github)/gi,
                    /(?:sql|nosql|mongodb|postgresql|mysql|redis|elasticsearch|cassandra)/gi,
                    /(?:tensorflow|pytorch|scikit-learn|pandas|numpy|spark|hadoop|kafka)/gi,
                    /(?:machine learning|artificial intelligence|deep learning|data science|big data|cloud computing|devops|cybersecurity|blockchain)/gi
                ];
                
                skillPatterns.forEach(pattern => {
                    const matches = text.match(pattern);
                    if (matches) {
                        analysis.skills.push(...matches.map(m => m.trim()));
                        console.log('Found skills with pattern:', pattern, matches);
                    }
                });
                
                // Extract companies (broader list including common tech companies)
                const companyPattern = /(?:google|microsoft|amazon|apple|facebook|meta|netflix|uber|airbnb|spotify|salesforce|oracle|ibm|intel|nvidia|adobe|paypal|linkedin|twitter|dropbox|slack|zoom|atlassian|shopify|stripe|square|robinhood|coinbase|tiktok|bytedance|alibaba|tencent|baidu|xiaomi|huawei|tesla|spacex|github|gitlab|docker|databricks|snowflake|palantir|cloudflare|twilio|okta|zendesk|hubspot|mailchimp|asana|figma|notion|miro)/gi;
                const companyMatches = text.match(companyPattern);
                if (companyMatches) {
                    analysis.companies.push(...companyMatches.map(m => m.trim()));
                    console.log('Found companies:', companyMatches);
                }
                
                // Remove duplicates and limit results
                analysis.recentPositions = [...new Set(analysis.recentPositions)].slice(0, 3);
                analysis.skills = [...new Set(analysis.skills)].slice(0, 15);
                analysis.companies = [...new Set(analysis.companies)].slice(0, 5);
                
                console.log('Final analysis result:', analysis);
                return analysis;
            }
            
            async uploadToBackend(file) {
                try {
                    const formData = new FormData();
                    formData.append('resume', file);
                    formData.append('userId', this.getUserId());
                    
                    const response = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData
                    });
                    
                    if (!response.ok) {
                        throw new Error('Backend upload failed: ' + response.status);
                    }
                    
                    const result = await response.json();
                    console.log('Backend upload result:', result);
                    
                    return {
                        success: result.success,
                        textExtracted: result.textExtracted,
                        extractedText: result.extractedText,
                        preview: result.preview
                    };
                } catch (error) {
                    console.error('Backend upload error:', error);
                    return { success: false };
                }
            }
            
=======
>>>>>>> f1030aa399405e9f6e035f37c9717c58678c8ffb
            async extractTextFromPDF(file) {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        try {
<<<<<<< HEAD
                            // For demo purposes - in production you'd use PDF.js
                            const simulatedText = 'Resume content extracted from ' + file.name + ':\\n\\n' +
                                'Senior Software Engineer with 5+ years experience at Google.\\n' +
                                'Technical Skills: Python, React, AWS, Machine Learning, Kubernetes\\n' +
                                'Led development of recommendation systems serving millions of users.\\n' +
                                'Previous roles: Software Developer at Microsoft, Technical Lead at startup.\\n' +
                                'Educational background: Computer Science degree from top university.\\n' +
                                'Notable achievements: Published research papers, open source contributions.';
=======
                            // Simple text extraction - in a real app you'd use pdf.js or similar
                            const text = 'PDF content: ' + file.name + ' (size: ' + file.size + ' bytes)';
                            // For demo purposes, we'll simulate extracted text
                            const simulatedText = \`Resume content extracted from \${file.name}:
                            
Professional experience in digital technology sector.
Skills and achievements relevant to Tech Nation application.
Educational background and certifications.
Previous work experience and projects.
Technical skills and business accomplishments.\`;
>>>>>>> f1030aa399405e9f6e035f37c9717c58678c8ffb
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
                this.addProgressIndicator('Step 4/5: Analysis');
                
                setTimeout(async () => {
<<<<<<< HEAD
                    let analysisPrompt = 'Based on my profile: ' + this.userProfile.experience + ' years experience, ' + this.userProfile.role + ' role.';
                    
                    // Add resume analysis if available
                    if (this.resumeContent && this.resumeAnalysis) {
                        analysisPrompt += '\\n\\nBased on my resume analysis:';
                        if (this.resumeAnalysis.recentPositions.length > 0) {
                            analysisPrompt += '\\n- Most recent positions: ' + this.resumeAnalysis.recentPositions.slice(0, 2).join(', ');
                        }
                        if (this.resumeAnalysis.skills.length > 0) {
                            analysisPrompt += '\\n- Key technical skills: ' + this.resumeAnalysis.skills.slice(0, 10).join(', ');
                        }
                        if (this.resumeAnalysis.companies.length > 0) {
                            analysisPrompt += '\\n- Companies worked at: ' + this.resumeAnalysis.companies.join(', ');
                        }
                        analysisPrompt += '\\n\\nResume excerpt: ' + this.resumeContent.substring(0, 500);
                    }
                    
                    analysisPrompt += '\\n\\nPlease provide specific actionable steps I need to take to strengthen my Tech Nation application. Based on my background, recommend: 1) Which application route (Exceptional Talent vs Exceptional Promise) 2) The 2 best assessment criteria for me 3) Specific evidence I should collect based on my recent roles 4) Next action steps.';
                    
                    console.log('Sending analysis prompt:', analysisPrompt);
=======
                    const analysisPrompt = \`Based on my profile: \${this.userProfile.experience} years experience, \${this.userProfile.role} role. Please provide specific actionable steps I need to take to strengthen my Tech Nation application. Focus on what I need to DO, not my chances of success.\`;
                    
>>>>>>> f1030aa399405e9f6e035f37c9717c58678c8ffb
                    await this.sendToAPI(analysisPrompt);
                    
                    setTimeout(() => {
                        this.enableFreeChat();
                    }, 2000);
                }, 1000);
            }
            
            enableFreeChat() {
                this.currentStep = 'free';
                this.addProgressIndicator('Step 5/5: Free Chat Enabled');
                this.messageInput.disabled = false;
                this.sendBtn.disabled = false;
                this.messageInput.placeholder = 'Ask me anything about Tech Nation application...';
                this.messageInput.focus();
                
<<<<<<< HEAD
                this.addMessage('Great! Now you can ask me any specific questions about the Tech Nation application process. I understand your background and can provide personalized advice! 💬', 'bot');
=======
                this.addMessage('Great! Now you can ask me any specific questions about the Tech Nation application process. I will use the official guidance and your profile information to help you! 💬', 'bot');
>>>>>>> f1030aa399405e9f6e035f37c9717c58678c8ffb
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
                const typingElement = this.addMessage('Thinking...', 'typing');
                
                try {
<<<<<<< HEAD
                    const payload = {
                        message: message,
                        userId: this.getUserId()
                    };
                    
                    // Include resume content and analysis for personalized responses
                    if (this.resumeContent) {
                        payload.resumeContent = this.resumeContent;
                        console.log('Sending resume content:', this.resumeContent.substring(0, 200));
                    }
                    if (this.resumeAnalysis) {
                        payload.resumeAnalysis = this.resumeAnalysis;
                        console.log('Sending resume analysis:', this.resumeAnalysis);
                    }
                    
                    const response = await fetch('/api/chat-en', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
=======
                    const response = await fetch('/api/chat-en', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            message: message,
                            userId: this.getUserId(),
                            resumeContent: this.resumeContent
                        })
>>>>>>> f1030aa399405e9f6e035f37c9717c58678c8ffb
                    });
                    
                    const data = await response.json();
                    this.chat.removeChild(typingElement);
                    
                    if (data.response) {
                        this.addMessage(data.response, 'bot');
                    } else {
                        this.addMessage('Sorry, I encountered an error. Please try again.', 'bot');
                    }
                    
                } catch (error) {
                    console.error('API Error:', error);
                    this.chat.removeChild(typingElement);
                    this.addMessage('I apologize, but I encountered an error. Please try again.', 'bot');
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
<<<<<<< HEAD
                
                // Add markdown rendering for bot messages
                if (sender === 'bot') {
                    messageElement.innerHTML = this.renderMarkdown(text);
                } else {
                    messageElement.textContent = text;
                }
                
=======
                messageElement.textContent = text;
>>>>>>> f1030aa399405e9f6e035f37c9717c58678c8ffb
                this.chat.appendChild(messageElement);
                this.scrollToBottom();
                
                return messageElement;
            }
            
<<<<<<< HEAD
            renderMarkdown(text) {
                // Convert markdown to HTML
                let html = text
                    // Bold text
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    // Headers
                    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                    // Bullet points
                    .replace(/^• (.*)$/gim, '<li>$1</li>')
                    // Numbered lists
                    .replace(/^(\d+)\. (.*)$/gim, '<ol><li>$2</li></ol>')
                    // Line breaks
                    .replace(/\n\n/g, '</p><p>')
                    .replace(/\n/g, '<br>');
                
                // Wrap lists in ul tags
                html = html.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');
                
                // Fix multiple consecutive ul tags
                html = html.replace(/<\/ul>\s*<ul>/g, '');
                
                // Fix multiple consecutive ol tags  
                html = html.replace(/<\/ol>\s*<ol>/g, '');
                
                // Wrap in paragraphs
                if (html && !html.startsWith('<')) {
                    html = '<p>' + html + '</p>';
                }
                
                return html;
            }
            
=======
>>>>>>> f1030aa399405e9f6e035f37c9717c58678c8ffb
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
            bot = new EnglishGuidedBot();
        });
    </script>
</body>
</html>`;

    res.status(200).send(html);
}