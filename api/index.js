// api/index.js - Fixed for Vercel deployment
export default function handler(req, res) {
    // Set proper headers
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    
    try {
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="UK Global Talent Visa Assistant for Tech Nation applications">
    <title>UK Global Talent Visa Assistant</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0; 
            padding: 15px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .container {
            width: 100%;
            max-width: 420px;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.15);
            overflow: hidden;
            height: 85vh;
            max-height: 700px;
            display: flex;
            flex-direction: column;
            position: relative;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 25px 20px;
            text-align: center;
            position: relative;
        }
        
        .header h1 {
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 5px;
        }
        
        .header p {
            font-size: 13px;
            opacity: 0.9;
            font-weight: 400;
        }
        
        .chat {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
            background: #f8f9fa;
            display: flex;
            flex-direction: column;
            gap: 15px;
            min-height: 0;
        }
        
        .chat::-webkit-scrollbar {
            width: 4px;
        }
        
        .chat::-webkit-scrollbar-track {
            background: #f1f1f1;
        }
        
        .chat::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 2px;
        }
        
        .message {
            padding: 14px 18px;
            border-radius: 18px;
            max-width: 85%;
            word-wrap: break-word;
            font-size: 14px;
            line-height: 1.5;
            animation: slideIn 0.4s ease-out;
        }
        
        @keyframes slideIn {
            from { 
                opacity: 0; 
                transform: translateY(15px) scale(0.95); 
            }
            to { 
                opacity: 1; 
                transform: translateY(0) scale(1); 
            }
        }
        
        .bot-message {
            background: white;
            color: #333;
            align-self: flex-start;
            border-bottom-left-radius: 6px;
            box-shadow: 0 2px 12px rgba(0,0,0,0.08);
            border: 1px solid #f0f0f0;
        }
        
        .user-message {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            align-self: flex-end;
            border-bottom-right-radius: 6px;
            box-shadow: 0 2px 12px rgba(102, 126, 234, 0.2);
        }
        
        .button-group {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 12px;
        }
        
        .guide-button {
            background: rgba(102, 126, 234, 0.08);
            color: #667eea;
            border: 1px solid rgba(102, 126, 234, 0.2);
            border-radius: 20px;
            padding: 8px 14px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 500;
            transition: all 0.2s ease;
            white-space: nowrap;
            user-select: none;
        }
        
        .guide-button:hover {
            background: #667eea;
            color: white;
            border-color: #667eea;
            transform: translateY(-1px);
        }
        
        .guide-button:active {
            transform: translateY(0);
        }
        
        .input-area {
            padding: 20px;
            background: white;
            border-top: 1px solid #f0f0f0;
        }
        
        .status-area {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
        }
        
        .connection-status {
            font-size: 11px;
            padding: 4px 10px;
            border-radius: 12px;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        
        .connection-status.connecting {
            background: #fff3cd;
            color: #856404;
        }
        
        .connection-status.connected {
            background: #d4edda;
            color: #155724;
        }
        
        .connection-status.error {
            background: #f8d7da;
            color: #721c24;
        }
        
        .upload-btn {
            background: #28a745;
            color: white;
            border: none;
            border-radius: 15px;
            padding: 6px 12px;
            cursor: pointer;
            font-size: 11px;
            font-weight: 500;
            transition: all 0.2s ease;
            user-select: none;
        }
        
        .upload-btn:hover {
            background: #218838;
            transform: translateY(-1px);
        }
        
        .upload-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        
        .quick-actions {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(75px, 1fr));
            gap: 6px;
            margin-bottom: 12px;
        }
        
        .quick-btn {
            background: #f8f9fa;
            color: #6c757d;
            border: 1px solid #e9ecef;
            border-radius: 12px;
            padding: 8px 6px;
            cursor: pointer;
            font-size: 10px;
            font-weight: 500;
            transition: all 0.2s ease;
            text-align: center;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            user-select: none;
        }
        
        .quick-btn:hover {
            background: #667eea;
            color: white;
            border-color: #667eea;
            transform: translateY(-1px);
        }
        
        .input-row {
            display: flex;
            gap: 10px;
            align-items: flex-end;
        }
        
        #messageInput {
            flex: 1;
            padding: 14px 18px;
            border: 2px solid #e9ecef;
            border-radius: 25px;
            outline: none;
            font-size: 14px;
            font-family: inherit;
            transition: all 0.2s ease;
            resize: none;
            min-height: 20px;
            max-height: 80px;
        }
        
        #messageInput:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        #messageInput::placeholder {
            color: #adb5bd;
        }
        
        #sendBtn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 20px;
            padding: 14px 20px;
            cursor: pointer;
            font-weight: 600;
            font-size: 13px;
            transition: all 0.2s ease;
            white-space: nowrap;
            user-select: none;
        }
        
        #sendBtn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(102, 126, 234, 0.3);
        }
        
        #sendBtn:active:not(:disabled) {
            transform: translateY(-1px);
        }
        
        #sendBtn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }
        
        .loading-animation {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 2px solid #f3f3f3;
            border-top: 2px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* Mobile responsive */
        @media (max-width: 480px) {
            body {
                padding: 10px;
            }
            
            .container {
                height: 90vh;
                border-radius: 15px;
            }
            
            .header {
                padding: 20px 15px;
            }
            
            .header h1 {
                font-size: 18px;
            }
            
            .chat {
                padding: 15px;
            }
            
            .input-area {
                padding: 15px;
            }
            
            .message {
                max-width: 90%;
                padding: 12px 16px;
                font-size: 13px;
            }
            
            .quick-actions {
                grid-template-columns: repeat(2, 1fr);
            }
        }
        
        /* Error states */
        .error-message {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
            padding: 12px 16px;
            border-radius: 8px;
            margin: 10px 0;
            font-size: 13px;
        }
        
        /* Success states */
        .success-message {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
            padding: 12px 16px;
            border-radius: 8px;
            margin: 10px 0;
            font-size: 13px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🇬🇧 UK Global Talent Visa</h1>
            <p>Tech Nation Endorsement Assistant</p>
        </div>
        
        <div class="chat" id="chatContainer">
            <div class="bot-message">
                <p><strong>Welcome! I'm your Tech Nation application assistant 🚀</strong></p>
                <p>I can help you understand the UK Global Talent Visa application process for digital technology professionals.</p>
                
                <div class="button-group">
                    <button class="guide-button" onclick="askQuestion('What are the eligibility requirements?')">✅ Eligibility</button>
                    <button class="guide-button" onclick="askQuestion('What evidence do I need?')">📄 Evidence</button>
                    <button class="guide-button" onclick="askQuestion('How much does it cost?')">💰 Costs</button>
                    <button class="guide-button" onclick="askQuestion('How long does the process take?')">⏰ Timeline</button>
                </div>
                
                <p style="margin-top: 12px; font-size: 13px; color: #666;">Ask me anything about the Tech Nation endorsement process!</p>
            </div>
        </div>
        
        <div class="input-area">
            <div class="status-area">
                <div class="connection-status connecting" id="connectionStatus">🔗 Connecting...</div>
                <button class="upload-btn" onclick="document.getElementById('resumeUpload').click()">📄 Upload CV</button>
                <input type="file" id="resumeUpload" accept=".pdf,.doc,.docx,.txt" style="display: none;" onchange="handleFileUpload(event)">
            </div>
            
            <div class="quick-actions">
                <button class="quick-btn" onclick="askQuestion('Am I eligible?')">Eligible?</button>
                <button class="quick-btn" onclick="askQuestion('Process steps')">Process</button>
                <button class="quick-btn" onclick="askQuestion('Evidence list')">Evidence</button>
                <button class="quick-btn" onclick="askQuestion('Total costs')">Costs</button>
            </div>
            
            <div class="input-row">
                <input type="text" id="messageInput" 
                       placeholder="Ask about eligibility, evidence, costs, timeline..." 
                       onkeypress="handleKeyPress(event)"
                       disabled>
                <button id="sendBtn" onclick="sendMessage()" disabled>Send</button>
            </div>
        </div>
    </div>

    <script>
        let userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
        let isLoading = false;
        
        // Connection check with improved error handling
        async function checkConnection() {
            const statusEl = document.getElementById('connectionStatus');
            const inputEl = document.getElementById('messageInput');
            const sendBtnEl = document.getElementById('sendBtn');
            
            try {
                console.log('🔗 Checking API connection...');
                statusEl.textContent = '🔗 Connecting...';
                statusEl.className = 'connection-status connecting';
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
                
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ 
                        message: 'test connection',
                        userId: userId
                    }),
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                console.log('📡 Response status:', response.status);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                console.log('✅ Connection successful:', data);
                
                if (data.response) {
                    statusEl.textContent = '✅ Connected';
                    statusEl.className = 'connection-status connected';
                    
                    // Enable input elements
                    inputEl.disabled = false;
                    sendBtnEl.disabled = false;
                    inputEl.focus();
                } else {
                    throw new Error('Invalid response format');
                }
                
            } catch (error) {
                console.error('❌ Connection failed:', error);
                
                let errorMessage = '❌ Connection Failed';
                if (error.name === 'AbortError') {
                    errorMessage = '❌ Timeout';
                } else if (error.message.includes('fetch')) {
                    errorMessage = '❌ Network Error';
                }
                
                statusEl.textContent = errorMessage;
                statusEl.className = 'connection-status error';
                statusEl.title = error.message;
                
                // Keep inputs disabled
                inputEl.disabled = true;
                sendBtnEl.disabled = true;
                
                // Retry connection after 5 seconds
                setTimeout(() => {
                    if (statusEl.className.includes('error')) {
                        checkConnection();
                    }
                }, 5000);
            }
        }
        
        // Add message to chat
        function addMessage(content, isUser = false) {
            const chatContainer = document.getElementById('chatContainer');
            const messageDiv = document.createElement('div');
            messageDiv.className = isUser ? 'user-message message' : 'bot-message message';
            messageDiv.innerHTML = content;
            chatContainer.appendChild(messageDiv);
            chatContainer.scrollTop = chatContainer.scrollHeight;
            return messageDiv;
        }
        
        // Format response text
        function formatResponse(text) {
            if (!text) return 'No response received.';
            
            return text
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/\n\n/g, '</p><p>')
                .replace(/\n/g, '<br>')
                .replace(/^/, '<p>')
                .replace(/$/, '</p>')
                .replace(/• /g, '• ');
        }
        
        // Escape HTML to prevent XSS
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
        
        // Handle keyboard input
        function handleKeyPress(event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
            }
        }
        
        // Send message function with improved error handling
        async function sendMessage() {
            if (isLoading) return;
            
            const input = document.getElementById('messageInput');
            const sendBtn = document.getElementById('sendBtn');
            const message = input.value.trim();
            
            if (!message) {
                input.focus();
                return;
            }
            
            // Update UI for loading state
            isLoading = true;
            addMessage(escapeHtml(message), true);
            input.value = '';
            input.disabled = true;
            sendBtn.disabled = true;
            sen