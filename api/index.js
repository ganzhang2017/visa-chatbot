// api/index.js
export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UK Global Talent Visa Assistant</title>
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

        .loading {
            opacity: 0.7;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>UK Global Talent Visa Assistant</h2>
            <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;">Tech Nation Endorsement Guide</p>
        </div>
        
        <div class="chat" id="chatContainer">
            <div class="bot-message">
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
                       onkeypress="if(event.key==='Enter' && !event.shiftKey) { event.preventDefault(); sendMessage(); }">
                <button id="sendBtn" onclick="sendMessage()">Send</button>
            </div>
        </div>
    </div>

    <script>
        let userId = 'user_' + Math.random().toString(36).substr(2, 9);
        
        async function checkConnection() {
            try {
                console.log('Checking connection...');
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        message: 'test connection',
                        userId: userId
                    })
                });
                
                console.log('Response status:', response.status);
                const data = await response.json();
                console.log('Response data:', data);
                
                if (response.ok && data.response) {
                    document.getElementById('connectionStatus').textContent = '✅ Connected';
                    document.getElementById('connectionStatus').classList.add('connected');
                } else {
                    throw new Error('Connection failed: ' + (data.error || 'Unknown error'));
                }
            } catch (error) {
                console.error('Connection test failed:', error);
                document.getElementById('connectionStatus').textContent = '⚠️ Connection Error';
                document.getElementById('connectionStatus').title = error.message;
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
            addMessage(escapeHtml(message), true);
            input.value = '';
            sendBtn.disabled = true;
            sendBtn.textContent = 'Sending...';
            sendBtn.classList.add('loading');
            
            try {
                console.log('Sending message:', message);
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        message: message,
                        userId: userId
                    })
                });
                
                console.log('Chat response status:', response.status);
                const data = await response.json();
                console.log('Chat response data:', data);
                
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
                sendBtn.classList.remove('loading');
                input.focus();
            }
        }
        
        function formatResponse(text) {
            return text
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\n/g, '<br>')
                .replace(/• /g, '• ');
        }
        
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
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
        
        // Initialize connection check
        document.addEventListener('DOMContentLoaded', function() {
            checkConnection();
        });
        
        // Check connection immediately as well
        checkConnection();
    </script>
</body>
</html>`;