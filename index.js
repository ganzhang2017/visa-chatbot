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
            🇬🇧 UK Global Talent Visa Assistant
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
                
                this.init();
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
                this.startWorkflow();
            }
            
            startWorkflow() {
                this.addMessage('👋 Welcome! I\'ll guide you through the UK Global Talent Visa application for Digital Technology.', 'bot');
                
                setTimeout(() => {
                    this.addMessage('Let\'s start with some quick topics. What would you like to know about first?', 'bot');
                    this.showInitialOptions();
                }, 1000);
            }
            
            showInitialOptions() {
                const buttonsHtml = \`
                    <div class="button-group">
                        <button class="guide-button" onclick="bot.handleTopicChoice('eligibility')">📋 Eligibility</button>
                        <button class="guide-button" onclick="bot.handleTopicChoice('process')">🚀 Process</button>
                        <button class="guide-button" onclick="bot.handleTopicChoice('documents')">📄 Documents</button>
                        <button class="guide-button" onclick="bot.handleTopicChoice('timeline')">⏰ Timeline</button>
                        <button class="workflow-button" onclick="bot.startAssessment()">✨ Start Assessment</button>
                    </div>
                \`;
                
                const buttonMessage = document.createElement('div');
                buttonMessage.className = 'message bot-message';
                buttonMessage.innerHTML = buttonsHtml;
                this.chat.appendChild(buttonMessage);
                this.scrollToBottom();
            }
            
            async handleTopicChoice(topic) {
                const topicQuestions = {
                    'eligibility': 'What are the eligibility requirements for the Digital Technology route?',
                    'process': 'How does the Tech Nation application process work?',
                    'documents': 'What documents and evidence do I need to prepare?',
                    'timeline': 'How long does the entire process take?'
                };
                
                const question = topicQuestions[topic];
                this.addMessage(question, 'user');
                await this.sendToAPI(question);
                
                // Show assessment option after topic
                setTimeout(() => {
                    this.addMessage('Would you like a personalized assessment of your profile?', 'bot');
                    const buttonHtml = \`
                        <div class="button-group">
                            <button class="workflow-button" onclick="bot.startAssessment()">Yes, assess my profile</button>
                            <button class="guide-button" onclick="bot.showInitialOptions()">Ask another question</button>
                        </div>
                    \`;
                    
                    const buttonMessage = document.createElement('div');
                    buttonMessage.className = 'message bot-message';
                    buttonMessage.innerHTML = buttonHtml;
                    this.chat.appendChild(buttonMessage);
                    this.scrollToBottom();
                }, 1500);
            }
            
            startAssessment() {
                this.currentStep = 'experience';
                this.addProgressIndicator('Step 1/5: Experience');
                this.addMessage('Let\'s assess your profile for the Tech Nation application! 🎯', 'bot');
                
                setTimeout(() => {
                    this.addMessage('How many years of experience do you have in digital technology?', 'bot');
                    this.showExperienceOptions();
                }, 1000);
            }
            
            showExperienceOptions() {
                const buttonsHtml = \`
                    <div class="button-group">
                        <button class="workflow-button" onclick="bot.selectExperience('0-2')">0-2 years</button>
                        <button class="workflow-button" onclick="bot.selectExperience('3-5')">3-5 years</button>
                        <button class="workflow-button" onclick="bot.selectExperience('6-10')">6-10 years</button>
                        <button class="workflow-button" onclick="bot.selectExperience('10+')">10+ years</button>
                    </div>
                \`;
                
                const buttonMessage = document.createElement('div');
                buttonMessage.className = 'message bot-message';
                buttonMessage.innerHTML = buttonsHtml;
                this.chat.appendChild(buttonMessage);
                this.scrollToBottom();
            }
            
            selectExperience(experience) {
                this.userProfile.experience = experience;
                this.addMessage(\`I have \${experience} years of experience\`, 'user');
                
                this.currentStep = 'role';
                this.addProgressIndicator('Step 2/5: Role');
                
                setTimeout(() => {
                    this.addMessage('What is your primary role in digital technology?', 'bot');
                    this.showRoleOptions();
                }, 1000);
            }
            
            showRoleOptions() {
                const buttonsHtml = \`
                    <div class="button-group">
                        <button class="workflow-button" onclick="bot.selectRole('technical')">👩‍💻 Technical (Developer, Engineer, etc.)</button>
                        <button class="workflow-button" onclick="bot.selectRole('business')">💼 Business (PM, Marketing, etc.)</button>
                        <button class="workflow-button" onclick="bot.selectRole('leadership')">🎯 Leadership (CTO, Head of, etc.)</button>
                    </div>
                \`;
                
                const buttonMessage = document.createElement('div');
                buttonMessage.className = 'message bot-message';
                buttonMessage.innerHTML = buttonsHtml;
                this.chat.appendChild(buttonMessage);
                this.scrollToBottom();
            }
            
            selectRole(role) {
                this.userProfile.role = role;
                const roleLabels = {
                    'technical': 'Technical role (Developer, Engineer, etc.)',
                    'business': 'Business role (PM, Marketing, etc.)',
                    'leadership': 'Leadership role (CTO, Head of, etc.)'
                };
                
                this.addMessage(\`My role is: \${roleLabels[role]}\`, 'user');
                
                this.currentStep = 'specifics';
                this.addProgressIndicator('Step 3/5: Background');
                
                setTimeout(() => {
                    if (role === 'technical') {
                        this.askTechnicalQuestions();
                    } else {
                        this.askBusinessQuestions();
                    }
                }, 1000);
            }
            
            askTechnicalQuestions() {
                this.addMessage('For technical roles, I need to understand your contributions and recognition:', 'bot');
                
                setTimeout(() => {
                    this.addMessage('Do you have any of the following? (Select all that apply)', 'bot');
                    const buttonsHtml = \`
                        <div class="button-group">
                            <button class="workflow-button" onclick="bot.addTechContribution('opensource')">🔓 Open Source Contributions</button>
                            <button class="workflow-button" onclick="bot.addTechContribution('speaking')">🎤 Conference Speaking</button>
                            <button class="workflow-button" onclick="bot.addTechContribution('publications')">📝 Publications/Blogs</button>
                            <button class="workflow-button" onclick="bot.addTechContribution('awards')">🏆 Awards/Recognition</button>
                            <button class="workflow-button" onclick="bot.finishContributions()">✅ Done</button>
                        </div>
                    \`;
                    
                    const buttonMessage = document.createElement('div');
                    buttonMessage.className = 'message bot-message';
                    buttonMessage.innerHTML = buttonsHtml;
                    this.chat.appendChild(buttonMessage);
                    this.scrollToBottom();
                }, 1000);
            }
            
            askBusinessQuestions() {
                this.addMessage('For business roles, I need to understand your impact and external activities:', 'bot');
                
                setTimeout(() => {
                    this.addMessage('What kind of business impact have you achieved?', 'bot');
                    const buttonsHtml = \`
                        <div class="button-group">
                            <button class="workflow-button" onclick="bot.selectImpact('revenue')">💰 Revenue Growth</button>
                            <button class="workflow-button" onclick="bot.selectImpact('products')">🚀 Product Launches</button>
                            <button class="workflow-button" onclick="bot.selectImpact('scaling')">📈 Team/Company Scaling</button>
                            <button class="workflow-button" onclick="bot.selectImpact('innovation')">💡 Innovation Projects</button>
                        </div>
                    \`;
                    
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
                        'opensource': 'Open Source Contributions',
                        'speaking': 'Conference Speaking',
                        'publications': 'Publications/Blogs',
                        'awards': 'Awards/Recognition'
                    };
                    
                    this.addMessage(\`Added: \${labels[contribution]}\`, 'user');
                }
            }
            
            finishContributions() {
                this.currentStep = 'upload';
                this.addProgressIndicator('Step 4/5: Resume Upload');
                
                setTimeout(() => {
                    this.addMessage('Great! Now please upload your resume (PDF format) so I can analyze your background in detail.', 'bot');
                    this.uploadBtn.style.display = 'inline-block';
                }, 1000);
            }
            
            selectImpact(impact) {
                this.userProfile.impact = impact;
                
                const labels = {
                    'revenue': 'Revenue Growth',
                    'products': 'Product Launches',
                    'scaling': 'Team/Company Scaling',
                    'innovation': 'Innovation Projects'
                };
                
                this.addMessage(\`My main impact: \${labels[impact]}\`, 'user');
                this.finishContributions();
            }
            
            async handleFileUpload(e) {
                const file = e.target.files[0];
                if (!file) return;
                
                if (file.type !== 'application/pdf') {
                    this.uploadStatus.textContent = 'Please upload a PDF file only.';
                    return;
                }
                
                this.uploadStatus.textContent = 'Uploading...';
                
                const formData = new FormData();
                formData.append('resume', file);
                
                try {
                    const response = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData,
                    });
                    
                    const data = await response.json();
                    
                    if (response.ok) {
                        this.uploadStatus.textContent = \`✅ \${file.name} uploaded!\`;
                        this.addMessage(\`Resume uploaded: \${file.name}\`, 'user');
                        this.userProfile.resume = file.name;
                        
                        setTimeout(() => {
                            this.performFinalAnalysis();
                        }, 1000);
                    } else {
                        throw new Error(data.error || 'Upload failed');
                    }
                } catch (error) {
                    console.error('Upload error:', error);
                    this.uploadStatus.textContent = '❌ Upload failed';
                    this.addMessage('Upload failed. You can continue without resume upload for now.', 'bot');
                    
                    setTimeout(() => {
                        const buttonHtml = \`
                            <div class="button-group">
                                <button class="workflow-button" onclick="bot.performFinalAnalysis()">Continue without resume</button>
                            </div>
                        \`;
                        
                        const buttonMessage = document.createElement('div');
                        buttonMessage.className = 'message bot-message';
                        buttonMessage.innerHTML = buttonHtml;
                        this.chat.appendChild(buttonMessage);
                        this.scrollToBottom();
                    }, 1000);
                }
            }
            
            performFinalAnalysis() {
                this.currentStep = 'analysis';
                this.addProgressIndicator('Step 5/5: Analysis');
                
                this.addMessage('Analyzing your profile against Tech Nation criteria...', 'bot');
                
                setTimeout(() => {
                    this.generatePersonalizedFeedback();
                }, 2000);
            }
            
            generatePersonalizedFeedback() {
                let feedback = '📊 **Your Tech Nation Assessment:**\n\n';
                
                // Experience assessment
                const expYears = this.userProfile.experience;
                if (expYears === '0-2') {
                    feedback += '⚠️ **Experience:** You may be better suited for the "Exceptional Promise" route rather than "Exceptional Talent".\n\n';
                } else if (expYears === '3-5') {
                    feedback += '✅ **Experience:** Good foundation. Focus on demonstrating exceptional promise and potential.\n\n';
                } else {
                    feedback += '✅ **Experience:** Strong experience level. You could qualify for "Exceptional Talent" route.\n\n';
                }
                
                // Role-specific feedback
                if (this.userProfile.role === 'technical') {
                    feedback += '💻 **Technical Role Strengths:**\n';
                    if (this.userProfile.contributions) {
                        this.userProfile.contributions.forEach(contrib => {
                            const tips = {
                                'opensource': '• Open Source: Great! Highlight impact and community adoption',
                                'speaking': '• Speaking: Excellent! Document audience size and topics',
                                'publications': '• Publications: Perfect! Include metrics like views/citations',
                                'awards': '• Awards: Outstanding! These carry significant weight'
                            };
                            feedback += tips[contrib] + '\n';
                        });
                    }
                } else if (this.userProfile.role === 'business') {
                    feedback += '💼 **Business Role Focus:**\n';
                    feedback += '• Quantify your commercial impact with specific numbers\n';
                    feedback += '• Document any mentorship or speaking outside work\n';
                    feedback += '• Show innovation in business processes or strategies\n';
                } else {
                    feedback += '🎯 **Leadership Role:**\n';
                    feedback += '• Highlight team growth and organizational impact\n';
                    feedback += '• Document industry recognition and thought leadership\n';
                    feedback += '• Show contribution to the wider tech ecosystem\n';
                }
                
                feedback += '\n🎯 **Next Steps:**\n';
                feedback += '• Gather evidence for each claim with specific examples\n';
                feedback += '• Prepare 10 pieces of evidence across the 4 criteria\n';
                feedback += '• Get 3 strong recommendation letters from industry leaders\n\n';
                
                this.addMessage(feedback, 'bot');
                
                setTimeout(() => {
                    this.addMessage('Would you like specific guidance on any aspect?', 'bot');
                    this.showFinalOptions();
                }, 1500);
            }
            
            showFinalOptions() {
                const buttonsHtml = \`
                    <div class="button-group">
                        <button class="guide-button" onclick="bot.askQuestion('evidence requirements')">📋 Evidence Requirements</button>
                        <button class="guide-button" onclick="bot.askQuestion('recommendation letters')">✍️ Recommendation Letters</button>
                        <button class="guide-button" onclick="bot.askQuestion('application timeline')">⏰ Application Timeline</button>
                        <button class="workflow-button" onclick="bot.enableFreeChat()">💬 Ask Anything</button>
                    </div>
                \`;
                
                const buttonMessage = document.createElement('div');
                buttonMessage.className = 'message bot-message';
                buttonMessage.innerHTML = buttonsHtml;
                this.chat.appendChild(buttonMessage);
                this.scrollToBottom();
            }
            
            enableFreeChat() {
                this.currentStep = 'free';
                this.messageInput.disabled = false;
                this.sendBtn.disabled = false;
                this.messageInput.placeholder = 'Ask me anything about Tech Nation application...';
                this.messageInput.focus();
                
                this.addMessage('Great! Now you can ask me any specific questions about the Tech Nation application process. I\'ll use the official guidance to help you! 💬', 'bot');
            }
            
            async askQuestion(topic) {
                this.addMessage(\`Tell me about \${topic}\`, 'user');
                await this.sendToAPI(\`Tell me about \${topic} for Tech Nation application\`);
                
                // Enable free chat after answering
                setTimeout(() => {
                    if (this.currentStep !== 'free') {
                        this.enableFreeChat();
                    }
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
                this.messageInput.disabled = true;
                this.sendBtn.disabled = true;
                
                // Show typing
                const typingElement = this.addMessage('Thinking...', 'typing');
                
                try {
                    const response = await fetch('/api/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            message: message,
                            userId: this.getUserId(),
                            userProfile: this.userProfile
                        })
                    });
                    
                    const data = await response.json();
                    
                    // Remove typing indicator
                    this.chat.removeChild(typingElement);
                    
                    if (data.response) {
                        this.addMessage(data.response, 'bot');
                    } else {
                        throw new Error('No response received');
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
                messageElement.classList.add('message', \`\${sender}-message\`);
                
                // Format text with basic markdown-like styling
                let formattedText = text
                    .replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>')
                    .replace(/\\*(.*?)\\*/g, '<em>$1</em>')
                    .replace(/\\n/g, '<br>');
                
                messageElement.innerHTML = \`<p>\${formattedText}</p>\`;
                
                this.chat.appendChild(messageElement);
                this.scrollToBottom();
                
                return messageElement;
            }
            
            addProgressIndicator(step) {
                const progressElement = document.createElement('div');
                progressElement.classList.add('progress-indicator');
                progressElement.innerHTML = \`📍 \${step}\`;
                
                this.chat.appendChild(progressElement);
                this.scrollToBottom();
            }
            
            scrollToBottom() {
                this.chat.scrollTop = this.chat.scrollHeight;
            }
            
            getUserId() {
                let id = localStorage.getItem('tech-nation-user-id');
                if (!id) {
                    id = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
                    localStorage.setItem('tech-nation-user-id', id);
                }
                return id;
            }
        }
        
        // Initialize bot
        let bot;
        document.addEventListener('DOMContentLoaded', () => {
            bot = new GuidedWorkflowBot();
        });
        
        // Test API connection
        setTimeout(() => {
            fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: 'test connection',
                    userId: 'test'
                })
            }).then(response => {
                console.log('✅ API connection test:', response.status);
            }).catch(error => {
                console.error('❌ API connection failed:', error);
            });
        }, 2000);
    </script>
</body>
</html>`;

  res.status(200).send(html);
}