// api/index.js
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
            opacity: 0.6;
            cursor: not-allowed;
        }
        
        .upload-area {
            display: flex;
            gap: 8px;
            align-items: center;
            margin-bottom: 8px;
        }
        
        .upload-btn {
            background: #28a745;
            color: white;
            border: none;
            border-radius: 20px;
            padding: 8px 16px;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.2s;
        }
        
        .upload-btn:hover {
            background: #218838;
        }
        
        .status-indicator {
            font-size: 12px;
            color: #6c757d;
            padding: 4px 8px;
            background: #f8f9fa;
            border-radius: 10px;
        }
        
        .status-indicator.connected {
            color: #28a745;
            background: #d4edda;
        }
        
        .quick-actions {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            margin-bottom: 12px;
        }
        
        .quick-btn {
            background: #f8f9fa;
            color: #6c757d;
            border: 1px solid #dee2e6;
            border-radius: 15px;
            padding: 6px 12px;
            cursor: pointer;
            font-size: 11px;
            transition: all 0.2s;
            flex: 1;
            min-width: 80px;
            text-align: center;
        }
        
        .quick-btn:hover {
            background: #667eea;
            color: white;
            border-color: #667eea;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="language-toggle">
                <button class="language-btn active" onclick="setLanguage('en')">EN</button>
                <button class="language-btn" onclick="setLanguage('zh')">中文</button>
            </div>
            <h2 id="headerTitle">UK Global Talent Visa Assistant</h2>
            <p id="headerSubtitle" style="margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;">Tech Nation Endorsement Guide</p>
        </div>
        
        <div class="chat" id="chatContainer">
            <div class="bot-message">
                <div id="welcomeMessage">
                    <p><strong>Welcome to your UK Global Talent Visa Assistant! 🇬🇧</strong></p>
                    <p>I'm here to help you understand the Tech Nation endorsement process. I can answer questions about:</p>
                    
                    <div class="button-group">
                        <button class="guide-button" onclick="askQuestion('What are the eligibility requirements?')">Eligibility</button>
                        <button class="guide-button" onclick="askQuestion('What evidence do I need?')">Evidence</button>
                        <button class="guide-button" onclick="askQuestion('How much does it cost?')">Costs</button>
                        <button class="guide-button" onclick="askQuestion('How long does the process take?')">Timeline</button>
                    </div>
                    
                    <p style="margin-top: 15px;">Ask me anything about the application process!</p>
                </div>
            </div>
        </div>
        
        <div class="input-area">
            <div class="upload-area">
                <button class="upload-btn" onclick="document.getElementById('resumeUpload').click()">📄 Upload Resume</button>
                <div class="status-indicator" id="connectionStatus">Connecting...</div>
                <input type="file" id="resumeUpload" accept=".pdf,.doc,.docx,.txt" style="display: none;" onchange="handleFileUpload(event)">
            </div>
            
            <div class="quick-actions">
                <button class="quick-btn" onclick="askQuestion('Am I eligible?')">Eligibility</button>
                <button class="quick-btn" onclick="askQuestion('Process steps')">Process</button>
                <button class="quick-btn" onclick="askQuestion('Evidence list')">Evidence</button>
                <button class="quick-btn" onclick="askQuestion('Total costs')">Costs</button>
            </div>
            
            <div class="input-row">
                <input type="text" id="messageInput" placeholder="Ask about eligibility, evidence, process, timeline..." 
                       onkeypress="if(event.key==='Enter') sendMessage()">
                <button id="sendBtn" onclick="sendMessage()">Send</button>
            </div>
        </div>
    </div>

    <script>
        let currentLanguage = 'en';
        let userId = 'user_' + Math.random().toString(36).substr(2, 9);
        
        const translations = {
            en: {
                headerTitle: 'UK Global Talent Visa Assistant',
                headerSubtitle: 'Tech Nation Endorsement Guide',
                welcomeMessage: \`<p><strong>Welcome to your UK Global Talent Visa Assistant! 🇬🇧</strong></p>
                    <p>I'm here to help you understand the Tech Nation endorsement process. I can answer questions about:</p>
                    
                    <div class="button-group">
                        <button class="guide-button" onclick="askQuestion('What are the eligibility requirements?')">Eligibility</button>
                        <button class="guide-button" onclick="askQuestion('What evidence do I need?')">Evidence</button>
                        <button class="guide-button" onclick="askQuestion('How much does it cost?')">Costs</button>
                        <button class="guide-button" onclick="askQuestion('How long does the process take?')">Timeline</button>
                    </div>
                    
                    <p style="margin-top: 15px;">Ask me anything about the application process!</p>\`,
                placeholder: 'Ask about eligibility, evidence, process, timeline...',
                quickBtns: ['Eligibility', 'Process', 'Evidence', 'Costs']
            },
            zh: {
                headerTitle: '英国全球人才签证助手',
                headerSubtitle: 'Tech Nation 背书指南',
                welcomeMessage: \`<p><strong>欢迎使用英国全球人才签证助手! 🇬🇧</strong></p>
                    <p>我在这里帮助您了解 Tech Nation 背书流程。我可以回答以下问题：</p>
                    
                    <div class="button-group">
                        <button class="guide-button" onclick="askQuestion('资格要求是什么？')">资格要求</button>
                        <button class="guide-button" onclick="askQuestion('我需要什么证据？')">证据材料</button>
                        <button class="guide-button" onclick="askQuestion('费用是多少？')">费用</button>
                        <button class="guide-button" onclick="askQuestion('流程需要多长时间？')">时间安排</button>
                    </div>
                    
                    <p style="margin-top: 15px;">请随时询问申请流程的任何问题！</p>\`,
                placeholder: '询问资格、证据、流程、时间安排...',
                quickBtns: ['资格要求', '流程', '证据材料', '费用']
            }
        };
        
        function setLanguage(lang) {
            currentLanguage = lang;
            
            // Update active language button
            document.querySelectorAll('.language-btn').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            
            // Update UI text
            document.getElementById('headerTitle').textContent = translations[lang].headerTitle;
            document.getElementById('headerSubtitle').textContent = translations[lang].headerSubtitle;
            document.getElementById('welcomeMessage').innerHTML = translations[lang].welcomeMessage;
            document.getElementById('messageInput').placeholder = translations[lang].placeholder;
            
            // Update quick buttons
            const quickBtns = document.querySelectorAll('.quick-btn');
            translations[lang].quickBtns.forEach((text, index) => {
                if (quickBtns[index]) quickBtns[index].textContent = text;
            });
        }
        
        async function checkConnection() {
            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        message: 'test connection',
                        userId: userId,
                        userProfile: { language: currentLanguage }
                    })
                });
                
                if (response.ok) {
                    document.getElementById('connectionStatus').textContent = '✅ Connected';
                    document.getElementById('connectionStatus').classList.add('connected');
                } else {
                    throw new Error('Connection failed');
                }
            } catch (error) {
                document.getElementById('connectionStatus').textContent = '⚠️ Connection Error';
                console.error('Connection test failed:', error);
            }
        }
        
        function addMessage(content, isUser = false) {
            const chatContainer = document.getElementById('chatContainer');
            const messageDiv = document.createElement('div');
            messageDiv.className = isUser ? 'user-message message' : 'bot-message message';
            messageDiv.innerHTML = content;
            chatContainer.appendChild(messageDiv);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
        
        async function sendMessage() {
            const input = document.getElementById('messageInput');
            const sendBtn = document.getElementById('sendBtn');
            const message = input.value.trim();
            
            if (!message) return;
            
            // Add user message
            addMessage(message, true);
            input.value = '';
            sendBtn.disabled = true;
            sendBtn.textContent = 'Sending...';
            
            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        message: message,
                        userId: userId,
                        userProfile: { language: currentLanguage }
                    })
                });
                
                const data = await response.json();
                
                if (response.ok && data.response) {
                    // Format markdown-style response
                    const formattedResponse = formatResponse(data.response);
                    addMessage(formattedResponse);
                } else {
                    throw new Error(data.error || 'Unknown error');
                }
            } catch (error) {
                console.error('Chat error:', error);
                addMessage('Sorry, I encountered an error. Please try again or visit the official Tech Nation website for guidance.');
            } finally {
                sendBtn.disabled = false;
                sendBtn.textContent = 'Send';
            }
        }
        
        function formatResponse(text) {
            return text
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\n/g, '<br>')
                .replace(/• /g, '• ');
        }
        
        function askQuestion(question) {
            document.getElementById('messageInput').value = question;
            sendMessage();
        }
        
        async function handleFileUpload(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            if (file.size > 10 * 1024 * 1024) {
                alert('File too large. Please upload a file smaller than 10MB.');
                return;
            }
            
            try {
                const text = await readFileAsText(file);
                
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        content: text,
                        userId: userId,
                        filename: file.name
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    document.getElementById('connectionStatus').textContent = '📄 Resume uploaded';
                    document.getElementById('connectionStatus').classList.add('connected');
                    addMessage('Resume uploaded successfully! You can now ask me questions about your background in relation to the Tech Nation criteria.');
                } else {
                    throw new Error(result.error);
                }
            } catch (error) {
                console.error('Upload error:', error);
                alert('Upload failed: ' + error.message);
            }
        }
        
        function readFileAsText(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = e => resolve(e.target.result);
                reader.onerror = reject;
                reader.readAsText(file);
            });
        }
        
        // Initialize
        checkConnection();
    </script>
</body>
</html>`;
  
  return res.status(200).send(html);
}