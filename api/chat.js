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
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000',
            'X-Title': 'Visa Chatbot'
        },
        body: JSON.stringify({
            model: 'deepseek/deepseek-r1-distill-llama-70b:free',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful and knowledgeable visa chatbot specializing in the UK Global Talent Visa. Answer questions based strictly on the provided context. If information is not in the context, politely say you don\'t have that specific information.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: 500,
            temperature: 0.7
        })
    });
    
    if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
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
    try {
        const { messages, userId } = await getRequestBody(req);

        if (!messages) {
            return res.status(400).json({ error: 'Missing messages in request' });
        }

        const currentMessage = messages[messages.length - 1];
        if (!currentMessage) {
            return res.status(400).json({ error: 'No current message found' });
        }

        // Get content and find relevant sections
        const notionContent = await getNotionPageContent();
        const relevantContext = findRelevantSections(notionContent, currentMessage.content);

        // Format chat history (keep last 4 exchanges)
        const chatHistory = messages.slice(-8)
            .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
            .join('\n');

        // Create comprehensive prompt
        const prompt = `Previous conversation:
${chatHistory}

Relevant context from UK Global Talent Visa guide:
${relevantContext.substring(0, 3000)}

Current question: ${currentMessage.content}

Please provide a helpful answer based on the context above. If the question cannot be answered with the provided context, politely explain that you don't have that specific information in the visa guide.`;

        // Get response from OpenRouter
        const response = await callOpenRouter(prompt);

        // Try to store conversation history (non-blocking)
        if (userId) {
            try {
                const updatedMessages = [...messages, { role: 'assistant', content: response }];
                await kv.set(userId, JSON.stringify(updatedMessages));
            } catch (kvError) {
                console.error('KV Store warning:', kvError.message);
                // Continue without saving
            }
        }
        
        return res.status(200).json({ response });

    } catch (error) {
        console.error('API Error:', error.message);
        return res.status(500).json({ 
            error: 'I apologize, but I encountered an error processing your request. Please try again.',
            details: error.message
        });
    }
};

export default handler;