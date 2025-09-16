import { createClient } from "@vercel/kv";
import { getNotionPageContent } from './guide_content.js';

// Initialize the Vercel KV client (optional - for session storage)
const kv = createClient({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.REDIS_TOKEN,
});

// Improved text search with better relevance scoring
function findRelevantSections(content, query, maxSections = 3) {
    if (!content || content.trim().length === 0) {
        console.warn('No content provided for search');
        return '';
    }

    // Split into meaningful paragraphs
    const paragraphs = content.split('\n\n')
        .filter(p => p.trim().length > 50)
        .map(p => p.trim());
    
    if (paragraphs.length === 0) {
        console.warn('No paragraphs found in content');
        return content.substring(0, 1000);
    }

    // Clean and split query
    const queryWords = query.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2)
        .filter(word => !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use'].includes(word));
    
    // Score paragraphs
    const scoredParagraphs = paragraphs.map(paragraph => {
        const paraLower = paragraph.toLowerCase();
        let score = 0;
        
        // Word matching with weights
        queryWords.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            const matches = (paraLower.match(regex) || []).length;
            score += matches * (word.length > 4 ? 3 : 1);
        });
        
        // Exact phrase bonus
        const queryPhrase = query.toLowerCase();
        if (paraLower.includes(queryPhrase)) {
            score += 15;
        }
        
        // Tech Nation specific terms bonus
        const techTerms = ['tech nation', 'digital technology', 'exceptional talent', 'exceptional promise', 'endorsement', 'criteria'];
        techTerms.forEach(term => {
            if (paraLower.includes(term)) {
                score += 5;
            }
        });
        
        return { paragraph, score };
    });
    
    // Return top scoring sections
    const relevantSections = scoredParagraphs
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, maxSections)
        .map(item => item.paragraph);
    
    if (relevantSections.length === 0) {
        console.warn('No relevant sections found, using first paragraphs');
        return paragraphs.slice(0, 2).join('\n\n');
    }
    
    return relevantSections.join('\n\n---\n\n');
}

// Call OpenRouter API with improved prompts
async function callOpenRouter(prompt, context) {
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000',
                'X-Title': 'UK Global Talent Visa Bot'
            },
            body: JSON.stringify({
                model: 'deepseek/deepseek-r1-distill-llama-70b:free',
                messages: [
                    {
                        role: 'system',
                        content: `You are a specialized UK Global Talent Visa assistant focused ONLY on the Digital Technology route via Tech Nation.

CRITICAL RULES:
- Answer ONLY based on the provided context from the Tech Nation guide
- Keep responses under 200 words and well-structured
- Use bullet points and clear formatting where appropriate
- If information isn't in the context, say "I don't have that specific information in the Tech Nation guide"
- Focus ONLY on digital technology talent visa, not other categories
- Be conversational but concise
- Always end with a follow-up question to continue the guidance`
                    },
                    {
                        role: 'user',
                        content: `Context from Tech Nation Guide:
${context}

User question: ${prompt}

Please provide a concise, helpful answer based ONLY on the provided context.`
                    }
                ],
                max_tokens: 300,
                temperature: 0.3
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenRouter API error:', response.status, errorText);
            throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            console.error('Invalid OpenRouter response structure:', data);
            throw new Error('Invalid response structure from OpenRouter');
        }
        
        return data.choices[0].message.content;
        
    } catch (error) {
        console.error('OpenRouter API call failed:', error);
        throw error;
    }
}

// Main handler
export default async function handler(req, res) {
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const body = req.body;
        let message, userId, history;

        // Handle different request formats
        if (body.message) {
            // Simple format from your current frontend
            message = body.message;
            userId = body.userId;
            history = body.history || [];
        } else if (body.messages) {
            // Complex format with full message history
            const messages = body.messages;
            message = messages[messages.length - 1]?.content;
            userId = body.userId;
            history = messages;
        } else {
            return res.status(400).json({ error: 'No message found in request' });
        }

        if (!message) {
            return res.status(400).json({ error: 'Empty message' });
        }

        // Handle test connection
        if (message === 'test connection') {
            return res.status(200).json({ response: 'API connection successful! 🚀' });
        }

        console.log('Processing message:', message.substring(0, 100));

        // Get PDF content
        let pdfContent;
        try {
            pdfContent = await getNotionPageContent();
            if (!pdfContent || pdfContent.trim().length === 0) {
                console.error('PDF content is empty or failed to load');
                return res.status(200).json({ 
                    response: 'I apologize, but I am unable to load the Tech Nation guidance document right now. Please try again in a moment, or ask me general questions about the UK Global Talent Visa process.' 
                });
            }
            console.log('PDF content loaded, length:', pdfContent.length);
        } catch (error) {
            console.error('Error loading PDF content:', error);
            return res.status(200).json({ 
                response: 'I am currently unable to access the detailed Tech Nation guidance. However, I can still help with general questions about the UK Global Talent Visa application process. What would you like to know?'
            });
        }

        // Find relevant context
        const relevantContext = findRelevantSections(pdfContent, message, 3);
        console.log('Found relevant context, length:', relevantContext.length);

        if (!relevantContext || relevantContext.trim().length === 0) {
            return res.status(200).json({ 
                response: 'I could not find specific information about that in the Tech Nation guide. Could you please rephrase your question or ask about eligibility criteria, application process, or required evidence for the Digital Technology route?'
            });
        }

        // Check if OpenRouter API key is available
        if (!process.env.OPENROUTER_API_KEY) {
            console.error('OPENROUTER_API_KEY not found in environment variables');
            return res.status(200).json({
                response: 'I am currently experiencing configuration issues. Please check that all environment variables are properly set, particularly the OPENROUTER_API_KEY.'
            });
        }

        // Get AI response
        let response;
        try {
            response = await callOpenRouter(message, relevantContext);
        } catch (apiError) {
            console.error('OpenRouter API failed:', apiError);
            return res.status(200).json({
                response: 'I apologize, but I am currently having trouble processing your request due to an API issue. Please try again in a moment. In the meantime, I recommend checking the official Tech Nation website for the most up-to-date information.'
            });
        }

        // Optional: Store in KV (non-blocking)
        if (userId && process.env.UPSTASH_REDIS_URL) {
            try {
                await kv.set(`chat:${userId}`, JSON.stringify({ 
                    lastMessage: message, 
                    timestamp: Date.now() 
                }), { ex: 3600 });
            } catch (kvError) {
                console.warn('KV storage failed (non-critical):', kvError.message);
            }
        }
        
        return res.status(200).json({ response });

    } catch (error) {
        console.error('Chat API Error:', error);
        return res.status(200).json({ 
            response: 'I encountered an unexpected error while processing your request. Please try asking your question again, and if the problem persists, you may want to check the Tech Nation website directly for guidance.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}