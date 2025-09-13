import { createClient } from "@vercel/kv";
import { getNotionPageContent } from './guide_content.js';

// Initialize the Vercel KV client
const kv = createClient({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.REDIS_TOKEN,
});

// Simple text search function
function findRelevantSections(content, query, maxSections = 5) {
    console.log('🔍 Searching for relevant content...');
    
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 100);
    const queryWords = query.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2);
    
    const scoredParagraphs = paragraphs.map(paragraph => {
        const paraLower = paragraph.toLowerCase();
        let score = 0;
        
        queryWords.forEach(word => {
            const matches = (paraLower.match(new RegExp(word, 'g')) || []).length;
            score += matches;
        });
        
        return { paragraph, score };
    });
    
    const relevantSections = scoredParagraphs
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, maxSections)
        .map(item => item.paragraph);
    
    return relevantSections.join('\n\n---\n\n');
}

// Test OpenRouter API directly
async function testOpenRouterAPI(message) {
    console.log('🧪 Testing OpenRouter API directly...');
    
    const apiKey = process.env.OPENROUTER_API_KEY;
    console.log('🔑 API Key exists:', !!apiKey);
    console.log('🔑 API Key prefix:', apiKey ? apiKey.substring(0, 8) + '...' : 'None');
    
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000',
                'X-Title': 'Visa Chatbot'
            },
            body: JSON.stringify({
                model: 'openai/gpt-3.5-turbo',  // Using cheaper model for testing
                messages: [
                    {
                        role: 'user',
                        content: message
                    }
                ],
                max_tokens: 150
            })
        });
        
        console.log('📡 Response status:', response.status);
        console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
        
        const responseText = await response.text();
        console.log('📡 Raw response length:', responseText.length);
        console.log('📡 Response starts with:', responseText.substring(0, 200));
        
        if (response.ok) {
            try {
                const jsonData = JSON.parse(responseText);
                console.log('✅ Successfully parsed JSON response');
                return jsonData.choices[0].message.content;
            } catch (parseError) {
                console.error('❌ Failed to parse JSON:', parseError.message);
                return `Error parsing response: ${parseError.message}`;
            }
        } else {
            console.error('❌ API call failed with status:', response.status);
            return `API Error (${response.status}): ${responseText.substring(0, 500)}`;
        }
        
    } catch (error) {
        console.error('❌ Fetch error:', error);
        return `Network Error: ${error.message}`;
    }
}

// Utility function to parse the request body
async function getRequestBody(req) {
    if (req.json) {
        return await req.json();
    }
    const chunks = [];
    for await (const chunk of req) {
        chunks.push(chunk);
    }
    const body = Buffer.concat(chunks).toString();
    return JSON.parse(body);
}

// The chat endpoint handler
export const handler = async (req, res) => {
    console.log('🚀 Handler started - Debug version');
    
    try {
        const { messages, userId } = await getRequestBody(req);

        if (!messages) {
            return res.status(400).json({ error: 'Missing messages in request' });
        }

        const currentMessage = messages[messages.length - 1];
        if (!currentMessage) {
            return res.status(400).json({ error: 'No current message found' });
        }

        console.log('💬 Processing message:', currentMessage.content);

        // Get content for context
        console.log('📄 Getting content...');
        const notionContent = await getNotionPageContent();
        const relevantContext = findRelevantSections(notionContent, currentMessage.content);

        // Create a simple prompt
        const prompt = `You are a helpful visa chatbot. Based on the context below, answer this question about the UK Global Talent Visa:

Context: ${relevantContext.substring(0, 2000)}

Question: ${currentMessage.content}

Answer briefly:`;

        // Test OpenRouter API directly
        const response = await testOpenRouterAPI(prompt);

        // Store conversation history
        if (userId) {
            await kv.set(userId, JSON.stringify([...messages, { role: 'assistant', content: response }]));
        }
        
        console.log('🎉 Returning response');
        return res.status(200).json({ response });

    } catch (error) {
        console.error('❌ Handler Error:', {
            message: error.message,
            name: error.name,
            stack: error.stack
        });
        
        return res.status(500).json({ 
            error: error.message,
            type: error.constructor.name 
        });
    }
};

export default handler;
