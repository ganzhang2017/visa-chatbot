import { createClient } from "@vercel/kv";
import { getNotionPageContent } from './guide_content.js';

// Initialize the Vercel KV client
const kv = createClient({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.REDIS_TOKEN,
});

// Simple text search function
function findRelevantSections(content, query, maxSections = 5) {
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 100);
    const queryWords = query.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2)
        .filter(word => !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use'].includes(word));
    
    const scoredParagraphs = paragraphs.map(paragraph => {
        const paraLower = paragraph.toLowerCase();
        let score = 0;
        
        queryWords.forEach(word => {
            const matches = (paraLower.match(new RegExp(word, 'g')) || []).length;
            score += matches * (word.length > 4 ? 2 : 1);
        });
        
        // Bonus for exact phrase matches
        const queryPhrase = query.toLowerCase();
        if (paraLower.includes(queryPhrase)) {
            score += 10;
        }
        
        return { paragraph, score };
    });
    
    const relevantSections = scoredParagraphs
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, maxSections)
        .map(item => item.paragraph);
    
    return relevantSections.join('\n\n---\n\n');
}

// Call OpenRouter API
async function callOpenRouter(prompt) {
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000',
                'X-Title': 'UK Global Talent Visa Chatbot'
            },
            body: JSON.stringify({
                model: 'deepseek/deepseek-r1-distill-llama-70b:free',
                messages: [
                    {
                        role: 'system',
                        content: `You are a helpful and knowledgeable UK Global Talent Visa assistant. 
                        
Key guidelines:
- Answer questions based strictly on the provided context from the official UK visa guide
- If information is not in the context, politely say you don't have that specific information
- Be conversational but professional
- Provide practical, actionable advice
- Use emojis appropriately to make responses engaging
- Keep responses concise but comprehensive
- Always prioritize accuracy over completeness`
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 600,
                temperature: 0.7
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('OpenRouter API Error:', error);
        throw error;
    }
}

// Fallback responses when API is unavailable
function getFallbackResponse(message) {
    const msg = message.toLowerCase();
    
    if (msg.includes('eligib')) {
        return '🎯 **UK Global Talent Visa Eligibility:**\n\n• **Exceptional talent** or **exceptional promise** in:\n  - Science, engineering, medicine\n  - Digital technology  \n  - Arts and culture\n  - Research and academia\n\n• Endorsement from approved body\n• English proficiency\n• Financial requirements\n\nWhich field interests you most?';
    }
    
    if (msg.includes('cost') || msg.includes('fee') || msg.includes('price')) {
        return '💰 **UK Global Talent Visa Costs:**\n\n• **Application fee:** £623\n• **Healthcare surcharge:** £624/year\n• **Endorsement fee:** varies by field (£524-£1,096)\n• **Priority processing:** +£500-£1,000\n\n**Total typically:** £2,000-£4,000\n\nWould you like details about any specific fees?';
    }
    
    if (msg.includes('timeline') || msg.includes('long') || msg.includes('time')) {
        return '⏰ **Processing Timeline:**\n\n• **Endorsement:** 8-12 weeks\n• **Visa application:** 3-8 weeks  \n• **Fast-track available:** 5-10 days\n\n**Total process:** 3-6 months typically\n\n💡 **Tip:** Start your endorsement application first!\n\nNeed help with the application strategy?';
    }
    
    if (msg.includes('document') || msg.includes('evidence')) {
        return '📋 **Required Documents:**\n\n**General:**\n• Valid passport\n• TB test results (some countries)\n• English language test\n• Financial evidence\n\n**Endorsement specific:**\n• CV and portfolio\n• Evidence of exceptional talent/promise\n• Letters of recommendation\n• Publications/awards (if applicable)\n\nWhich endorsing body are you applying through?';
    }
    
    if (msg.includes('endors') || msg.includes('body') || msg.includes('bodies')) {
        return '🏛️ **UK Global Talent Visa Endorsing Bodies:**\n\n• **Tech:** Tech Nation\n• **Sciences:** The Royal Society\n• **Engineering:** Royal Academy of Engineering  \n• **Humanities:** The British Academy\n• **Arts:** Arts Council England\n• **Medicine:** Academy of Medical Sciences\n\nWhich field matches your expertise?';
    }
    
    if (msg.includes('thank') || msg.includes('help')) {
        return '😊 You\'re very welcome! I\'m here to help with your UK Global Talent Visa journey.\n\nFeel free to ask about:\n• Eligibility assessment\n• Application process\n• Required documents\n• Costs and timeline\n• Endorsing bodies\n\nWhat would you like to explore next?';
    }
    
    return '🤖 **I can help with UK Global Talent Visa questions about:**\n\n• 🎯 Eligibility requirements\n• 📝 Application process\n• 💰 Costs and timeline\n• 📋 Required documents\n• 🏛️ Endorsing bodies\n• 📄 Resume analysis\n\n**Could you be more specific about what you\'d like to know?**';
}

// The main handler function
export default async function handler(req, res) {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // Parse request body - handle both formats
        let body;
        try {
            body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        } catch (parseError) {
            return res.status(400).json({ error: 'Invalid JSON in request body' });
        }

        // Support both message formats from your frontend
        const message = body.message || (body.messages && body.messages[body.messages.length - 1]?.content);
        const userId = body.userId;
        const history = body.history || body.messages || [];

        if (!message) {
            return res.status(400).json({ error: 'Missing message in request' });
        }

        // Handle test requests
        if (message === 'test') {
            return res.status(200).json({ 
                response: '✅ API connection successful! How can I help you with the UK Global Talent Visa?',
                status: 'ready'
            });
        }

        let response;

        // Try to use AI API first, fallback to static responses
        try {
            // Only proceed with AI if we have the necessary environment variables
            if (process.env.OPENROUTER_API_KEY) {
                // Get content from Notion (with fallback)
                let notionContent = '';
                try {
                    notionContent = await getNotionPageContent();
                } catch (notionError) {
                    console.warn('Notion content unavailable:', notionError.message);
                    notionContent = 'UK Global Talent Visa guide content temporarily unavailable.';
                }

                // Find relevant sections
                const relevantContext = findRelevantSections(notionContent, message);

                // Format chat history (keep last 4 exchanges)
                const chatHistory = history.slice(-8)
                    .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
                    .join('\n');

                // Create comprehensive prompt
                const prompt = `Previous conversation:
${chatHistory}

Relevant context from UK Global Talent Visa guide:
${relevantContext.substring(0, 3000)}

Current question: ${message}

Please provide a helpful, accurate answer based on the context above. Use a conversational tone with appropriate emojis. If the question cannot be answered with the provided context, politely explain that you don't have that specific information and suggest what you can help with instead.`;

                // Get response from OpenRouter
                response = await callOpenRouter(prompt);
                
            } else {
                throw new Error('OpenRouter API key not configured');
            }
            
        } catch (aiError) {
            console.warn('AI API unavailable, using fallback:', aiError.message);
            response = getFallbackResponse(message);
        }

        // Try to store conversation history (non-blocking)
        if (userId && process.env.UPSTASH_REDIS_URL && process.env.REDIS_TOKEN) {
            try {
                const updatedHistory = [...history, 
                    { role: 'user', content: message },
                    { role: 'assistant', content: response }
                ];
                await kv.set(userId, JSON.stringify(updatedHistory));
            } catch (kvError) {
                console.warn('KV Store unavailable (non-critical):', kvError.message);
            }
        }
        
        return res.status(200).json({ 
            response,
            success: true,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Chat API Error:', error);
        
        // Return a helpful fallback response even on errors
        const fallbackMessage = 'I apologize, but I\'m experiencing some technical difficulties. However, I can still help with basic UK Global Talent Visa questions! What would you like to know about eligibility, costs, timeline, or required documents?';
        
        return res.status(200).json({ 
            response: fallbackMessage,
            success: true,
            fallback: true
        });
    }
}