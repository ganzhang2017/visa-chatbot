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
        let isLoading = false;
        
        async function send() {
            if (isLoading) return;
            
            const input = document.getElementById('input');
            const chat = document.getElementById('chat');
            const msg = input.value.trim();
            
            if (!msg) return;
            
            // Add user message
            chat.innerHTML += '<p><strong>You:</strong> ' + msg + '</p>';
            input.value = '';
            
            // Show loading
            isLoading = true;
            const loadingId = 'loading-' + Date.now();
            chat.innerHTML += '<p id="' + loadingId + '"><strong>Bot:</strong> <em>Thinking...</em></p>';
            chat.scrollTop = chat.scrollHeight;
            
            try {
                // Try to call your API
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: msg,
                        userId: 'user_' + Math.random().toString(36).substr(2, 9),
                        history: []
                    })
                });
                
                const data = await response.json();
                
                // Remove loading message
                document.getElementById(loadingId).remove();
                
                // Add bot response
                chat.innerHTML += '<p><strong>Bot:</strong> ' + data.response + '</p>';
                
            } catch (error) {
                console.log('API unavailable, using enhanced fallback');
                
                // Remove loading message
                document.getElementById(loadingId).remove();
                
                // Enhanced fallback responses
                const response = getEnhancedFallback(msg);
                chat.innerHTML += '<p><strong>Bot:</strong> ' + response + '</p>';
            }
            
            isLoading = false;
            chat.scrollTop = chat.scrollHeight;
        }
        
        function getEnhancedFallback(msg) {
            const lower = msg.toLowerCase();
            
            // Resume analysis - check for resume content or request
            if (lower.includes('resume') || lower.includes('cv') || lower.includes('my background') || 
                msg.length > 200 || lower.includes('experience') || lower.includes('analysis')) {
                
                // If it's a long message, assume it's resume content
                if (msg.length > 100) {
                    return analyzeResumeContent(msg);
                } else {
                    return "📄 <strong>Resume Analysis:</strong><br><br>" +
                           "I can analyze your resume for UK Global Talent Visa suitability!<br><br>" +
                           "<strong>Two ways to get analysis:</strong><br>" +
                           "1. Upload your PDF resume using the button above<br>" +
                           "2. Copy and paste your resume text here<br><br>" +
                           "I'll assess:<br>" +
                           "• Which endorsing body suits you best<br>" +
                           "• Strength of your evidence<br>" +
                           "• Exceptional talent vs promise route<br>" +
                           "• Missing elements to strengthen your case<br><br>" +
                           "Please share your resume content or upload your PDF!";
                }
            }
            
            // Digital Tech specific responses
            if (lower.includes('digital') || lower.includes('tech')) {
                return "🖥️ <strong>Digital Technology Route:</strong><br><br>" +
                       "• <strong>Endorsing body:</strong> Tech Nation<br>" +
                       "• <strong>Endorsement fee:</strong> £524<br>" +
                       "• <strong>Key requirements:</strong><br>" +
                       "  - Exceptional talent in digital tech<br>" +
                       "  - Evidence of impact and innovation<br>" +
                       "  - Strong technical skills + business impact<br>" +
                       "  - Letters from recognized tech leaders<br><br>" +
                       "• <strong>Evidence needed:</strong> GitHub repos, tech patents, speaking at conferences, leading tech teams, founding tech companies<br><br>" +
                       "Would you like specific guidance on preparing your Tech Nation application?";
            }
            
            // Documents specific
            if (lower.includes('document') || lower.includes('evidence')) {
                return "📋 <strong>Required Documents:</strong><br><br>" +
                       "<strong>General documents:</strong><br>" +
                       "• Valid passport<br>" +
                       "• TB test (certain countries)<br>" +
                       "• English language test (if required)<br>" +
                       "• Financial evidence (£1,270)<br><br>" +
                       "<strong>Endorsement specific:</strong><br>" +
                       "• Detailed CV<br>" +
                       "• Portfolio of work<br>" +
                       "• 3+ letters of recommendation<br>" +
                       "• Evidence of exceptional talent<br>" +
                       "• Publications, awards, media coverage<br>" +
                       "• Proof of salary/contracts<br><br>" +
                       "Which endorsing body are you applying through?";
            }
            
            // Eligibility detailed
            if (lower.includes('eligib')) {
                return "🎯 <strong>UK Global Talent Visa Eligibility:</strong><br><br>" +
                       "<strong>You must be endorsed in one of these fields:</strong><br>" +
                       "• <strong>Digital Technology</strong> - Tech Nation<br>" +
                       "• <strong>Sciences</strong> - The Royal Society<br>" +
                       "• <strong>Engineering</strong> - Royal Academy of Engineering<br>" +
                       "• <strong>Humanities</strong> - The British Academy<br>" +
                       "• <strong>Arts & Culture</strong> - Arts Council England<br>" +
                       "• <strong>Medicine</strong> - Academy of Medical Sciences<br><br>" +
                       "<strong>Two routes available:</strong><br>" +
                       "• <strong>Exceptional Talent:</strong> Established leaders<br>" +
                       "• <strong>Exceptional Promise:</strong> Emerging leaders<br><br>" +
                       "Which field matches your expertise?";
            }
            
            // Costs detailed
            if (lower.includes('cost') || lower.includes('fee') || lower.includes('price')) {
                return "💰 <strong>Complete Cost Breakdown:</strong><br><br>" +
                       "<strong>Endorsement stage:</strong><br>" +
                       "• Tech Nation: £524<br>" +
                       "• Royal Society: £524<br>" +
                       "• Other bodies: £524-£1,096<br><br>" +
                       "<strong>Visa application:</strong><br>" +
                       "• Application fee: £623<br>" +
                       "• Healthcare surcharge: £624/year<br>" +
                       "• Priority service: +£500-£1,000<br><br>" +
                       "<strong>Total typical cost:</strong><br>" +
                       "• Standard process: £2,000-£3,000<br>" +
                       "• With priority: £2,500-£4,000<br><br>" +
                       "Need help with the application strategy?";
            }
            
            // Timeline detailed
            if (lower.includes('time') || lower.includes('long') || lower.includes('when')) {
                return "⏰ <strong>Detailed Timeline:</strong><br><br>" +
                       "<strong>Phase 1 - Endorsement:</strong><br>" +
                       "• Standard: 8-12 weeks<br>" +
                       "• Fast-track: Available for some bodies<br><br>" +
                       "<strong>Phase 2 - Visa Application:</strong><br>" +
                       "• Standard: 3-8 weeks<br>" +
                       "• Priority: 5 working days<br>" +
                       "• Super Priority: 1 working day<br><br>" +
                       "<strong>Total journey:</strong> 3-6 months<br><br>" +
                       "<strong>Pro tip:</strong> Start gathering evidence 2-3 months before applying for endorsement!<br><br>" +
                       "What stage are you currently at?";
            }
            
            // Default comprehensive response
            return "🤖 <strong>I'm here to help with your UK Global Talent Visa!</strong><br><br>" +
                   "I can provide detailed information about:<br>" +
                   "• <strong>Eligibility</strong> - Which route suits you<br>" +
                   "• <strong>Endorsing bodies</strong> - Tech Nation, Royal Society, etc.<br>" +
                   "• <strong>Application process</strong> - Step-by-step guidance<br>" +
                   "• <strong>Required documents</strong> - Complete checklists<br>" +
                   "• <strong>Costs & timeline</strong> - Detailed breakdowns<br>" +
                   "• <strong>Evidence preparation</strong> - What strengthens your case<br><br>" +
                   "What specific aspect would you like to explore? Try asking about your field (e.g., 'digital tech', 'science', 'arts') or a specific topic!";
        }
        
        function analyzeResumeContent(resumeText) {
            const text = resumeText.toLowerCase();
            let analysis = "📄 <strong>Resume Analysis Complete!</strong><br><br>";
            
            // Determine field
            let field = "General";
            let endorsingBody = "";
            if (text.includes('software') || text.includes('tech') || text.includes('platform') || 
                text.includes('ai') || text.includes('data') || text.includes('digital')) {
                field = "Digital Technology";
                endorsingBody = "Tech Nation";
            }
            
            // Determine experience level
            let route = "Exceptional Promise";
            let experienceLevel = "";
            if (text.includes('senior') || text.includes('lead') || text.includes('head')) {
                route = "Exceptional Talent";
                experienceLevel = "Senior level";
            } else if (text.includes('manager') || text.includes('principal')) {
                route = "Exceptional Talent or Promise";
                experienceLevel = "Mid-senior level";
            }
            
            // Look for quantifiable achievements
            let hasMetrics = text.includes('
        
        document.getElementById('input').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') send();
        });
    </script>
</body>
</html>`;

  res.status(200).send(html);
}) || text.includes('€') || text.includes('%') || 
                           text.includes('million') || text.includes('efficiency') || text.includes('revenue');
            
            analysis += `<strong>🎯 Recommended Field:</strong> ${field}<br>`;
            analysis += `<strong>🏛️ Endorsing Body:</strong> ${endorsingBody}<br>`;
            analysis += `<strong>📈 Recommended Route:</strong> ${route}<br><br>`;
            
            analysis += "<strong>✅ Strengths I see:</strong><br>";
            if (text.includes('senior') || text.includes('lead')) {
                analysis += "• Leadership experience<br>";
            }
            if (hasMetrics) {
                analysis += "• Quantifiable business impact<br>";
            }
            if (text.includes('global') || text.includes('international')) {
                analysis += "• International experience<br>";
            }
            if (text.includes('ai') || text.includes('machine learning')) {
                analysis += "• Cutting-edge technology work<br>";
            }
            
            analysis += "<br><strong>💡 To strengthen your application:</strong><br>";
            analysis += "• Prepare 3+ recommendation letters<br>";
            analysis += "• Document technical innovations clearly<br>";
            analysis += "• Highlight industry recognition/awards<br>";
            analysis += "• Show progression and career growth<br><br>";
            
            analysis += "Based on your background, you have <strong>good potential</strong> for the UK Global Talent Visa!<br><br>";
            analysis += "Would you like specific guidance on preparing your " + endorsingBody + " application?";
            
            return analysis;
        }
        
        async function handleFileUpload(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            const uploadStatus = document.getElementById('uploadStatus');
            const chat = document.getElementById('chat');
            
            if (file.type !== 'application/pdf') {
                uploadStatus.textContent = 'Please upload a PDF file';
                uploadStatus.style.color = '#dc3545';
                return;
            }
            
            if (file.size > 5 * 1024 * 1024) {
                uploadStatus.textContent = 'File too large (max 5MB)';
                uploadStatus.style.color = '#dc3545';
                return;
            }
            
            uploadStatus.textContent = 'Uploading...';
            uploadStatus.style.color = '#666';
            
            try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('userId', 'user_' + Math.random().toString(36).substr(2, 9));
                
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });
                
                if (response.ok) {
                    const data = await response.json();
                    uploadStatus.textContent = '✅ Uploaded successfully';
                    uploadStatus.style.color = '#28a745';
                    
                    // Add bot response about the upload
                    chat.innerHTML += '<p><strong>Bot:</strong> ' + data.response + '</p>';
                    chat.scrollTop = chat.scrollHeight;
                } else {
                    throw new Error('Upload failed');
                }
            } catch (error) {
                uploadStatus.textContent = '❌ Upload failed';
                uploadStatus.style.color = '#dc3545';
                console.error('Upload error:', error);
                
                // Fallback message
                chat.innerHTML += '<p><strong>Bot:</strong> I had trouble processing your PDF, but I can still analyze your resume if you copy and paste the text here!</p>';
                chat.scrollTop = chat.scrollHeight;
            }
            
            // Clear file input
            event.target.value = '';
        }
        
        document.getElementById('input').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') send();
        });
    </script>
</body>
</html>`;

  res.status(200).send(html);
}