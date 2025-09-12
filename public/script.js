document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const chatForm = document.getElementById('chat-form');
    const resumeUpload = document.getElementById('resume-upload');
    let sessionId = sessionStorage.getItem('sessionId') || `session-${Date.now()}`;
    sessionStorage.setItem('sessionId', sessionId);

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
            userInput.value = '';
        }

        try {
            const body = { message, sessionId };
            if (isResumeAnalysis) {
                body.isResumeAnalysis = true;
            }

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await response.json();
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

    // New function to initialize the chat
    function initChat() {
        appendMessage('bot', 'Hello! I will guide you through a pre-screening for the UK Global Talent Visa. How can I help you today?');
    }

    // Call the function to start the chat
    initChat();
});
