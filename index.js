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
            font-family: Arial, sans-serif; 
            background: #667eea; 
            margin: 0; 
            padding: 20px;
            color: white;
        }
        .container {
            max-width: 400px;
            margin: 0 auto;
            background: white;
            color: black;
            padding: 20px;
            border-radius: 10px;
        }
        input { width: 100%; padding: 10px; margin: 10px 0; }
        button { padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; }
        .chat { height: 300px; border: 1px solid #ccc; padding: 10px; overflow-y: auto; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🇬🇧 UK Global Talent Visa Bot</h1>
        <div id="chat" class="chat">
            <p><strong>Bot:</strong> Hello! I can help with UK Global Talent Visa questions about eligibility, costs, timeline, and documents.</p>
        </div>
        <input type="text" id="input" placeholder="Ask me about the UK Global Talent Visa...">
        <button onclick="send()">Send</button>
    </div>
    
    <script>
        function send() {
            const input = document.getElementById('input');
            const chat = document.getElementById('chat');
            const msg = input.value.trim();
            
            if (!msg) return;
            
            chat.innerHTML += '<p><strong>You:</strong> ' + msg + '</p>';
            
            let response = "I can help with eligibility, costs (£2000-4000), timeline (3-6 months), and required documents. What specifically do you want to know?";
            
            if (msg.toLowerCase().includes('cost')) {
                response = "💰 UK Global Talent Visa costs: Application fee £623 + Healthcare surcharge £624/year + Endorsement fees £500-1000. Total typically £2000-4000.";
            } else if (msg.toLowerCase().includes('time')) {
                response = "⏰ Timeline: Endorsement takes 8-12 weeks, visa application 3-8 weeks. Total process 3-6 months. Fast-track available for extra cost.";
            } else if (msg.toLowerCase().includes('eligib')) {
                response = "🎯 You need exceptional talent/promise in: Science, Digital Tech, Arts, or Academia. Plus endorsement from approved body, English proficiency, and financial requirements.";
            }
            
            chat.innerHTML += '<p><strong>Bot:</strong> ' + response + '</p>';
            input.value = '';
            chat.scrollTop = chat.scrollHeight;
        }
        
        document.getElementById('input').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') send();
        });
    </script>
</body>
</html>`;

  res.status(200).send(html);
}