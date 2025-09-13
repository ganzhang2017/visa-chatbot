document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const chatForm = document.getElementById('chat-form');
    const resumeUpload = document.getElementById('resume-upload');
    let sessionId = sessionStorage.getItem('sessionId') || `session-${Date.now()}`;
    sessionStorage.setItem('sessionId', sessionId);

    // Get message history from session storage
    const messageHistory = JSON.parse(sessionStorage.getItem('chatHistory')) || [];
    
    // Display initial messages
    messageHistory.forEach(msg => {
        appendMessage(msg.role === 'user' ? 'user' : 'bot', msg.content);
    });

    if (messageHistory.length === 0) {
        initChat();
    }

    function appendMessage(sender, message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);
        messageElement.textContent = message;
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    async function sendMessage(message, isResumeAnalysis = false) {
        if (!isResumeAnalysis) {
            appendMessage('user', message);
            // Add user message to history
            messageHistory.push({ role: 'user', content: message });
            userInput.value = '';
        }

        try {
            const body = { 
                messages: messageHistory,
                userId: sessionId 
            };
            
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await response.json();
            
            // Add bot message to history
            messageHistory.push({ role: 'bot', content: data.response });
            sessionStorage.setItem('chatHistory', JSON.stringify(messageHistory));
            
            appendMessage('bot', data.response);

        } catch (error) {
            console.error('Error:', error);
            appendMessage('bot', 'Sorry, something went wrong. Please try again.');
        }
    }

    async function uploadResume(file) {
        const formData = new FormData();
        formData.append('resume', file);
        
        appendMessage('bot', 'Uploading and analyzing your resume...');

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            
            const resumeMessage = `Here is the text from the resume: \n\n${data.extractedText}`;
            // Add bot's analysis message to history before sending to the bot
            messageHistory.push({ role: 'bot', content: 'Uploading and analyzing your resume...' });
            messageHistory.push({ role: 'bot', content: resumeMessage });
            sessionStorage.setItem('chatHistory', JSON.stringify(messageHistory));

            await sendMessage(resumeMessage, true);

        } catch (error) {
            console.error('Error:', error);
            appendMessage('bot', 'Sorry, there was an issue uploading or analyzing your resume.');
        }
    }

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = userInput.value.trim();
        if (message) {
            sendMessage(message);
        }
    });

    resumeUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            uploadResume(file);
        }
    });

    function initChat() {
        appendMessage('bot', 'Hello! I will guide you through a pre-screening for the UK Global Talent Visa. How can I help you today?');
    }
});
