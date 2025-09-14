document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.getElementById('chat-container');
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');
    const userId = getUniqueUserId(); // Function to get or create a unique user ID

    // Send the initial 'start' message to trigger the guided workflow
    sendMessage('start');

    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = messageInput.value.trim();
        if (message) {
            addMessageToChat(message, 'user');
            sendMessage(message);
            messageInput.value = '';
        }
    });

    async function sendMessage(message) {
        // Hide the resume upload button on the first message
        const uploadButton = document.querySelector('.resume-upload');
        if (uploadButton && message === 'start') {
            uploadButton.style.display = 'none';
        }

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: message }],
                    userId: userId,
                }),
            });

            const data = await response.json();
            addMessageToChat(data.response, 'bot');
        } catch (error) {
            console.error('Error sending message:', error);
            addMessageToChat('Sorry, an error occurred. Please try again.', 'bot');
        }
    }

    function addMessageToChat(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);
        messageElement.innerHTML = `<p>${message}</p>`;
        chatContainer.appendChild(messageElement);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // A simple way to get or create a unique user ID for session tracking
    function getUniqueUserId() {
        let id = localStorage.getItem('chat-user-id');
        if (!id) {
            id = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
            localStorage.setItem('chat-user-id', id);
        }
        return id;
    }
});
