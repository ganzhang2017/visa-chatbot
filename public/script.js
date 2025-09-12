document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const chatForm = document.getElementById('chat-form');
    const resumeUpload = document.getElementById('resume-upload');

    function appendMessage(sender, message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);
        messageElement.textContent = message;
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    async function sendMessage(message) {
        appendMessage('user', message);
        userInput.value = '';

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

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
        
        appendMessage('bot', 'Uploading your resume...');

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            appendMessage('bot', data.response);
        } catch (error) {
            console.error('Error:', error);
            appendMessage('bot', 'Sorry, there was an issue uploading your resume.');
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

    appendMessage('bot', 'Hello! I am a chatbot to help you with the UK Global Talent Visa application. How can I help you today?');
});
