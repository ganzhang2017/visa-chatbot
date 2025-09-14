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

// Workflow-specific prompts for guided experience
const workflowPrompts = {
    'eligibility': 'Focus on eligibility criteria, requirements, and qualifications needed for the Global Talent Visa.',
    'application': 'Provide clear, step-by-step application guidance and process information.',
    'documents': 'List required documents, evidence needed, and preparation tips.',
    'endorsement': 'Explain different endorsement bodies, their criteria, and selection guidance.',
    'timeline': 'Detail processing times, costs, fees, and timeline expectations.',
    'general': 'Provide comprehensive information about the Global Talent Visa.'
};

// Enhanced system message for better responses
function getSystemMessage(workflowType = 'general') {
    const workflowGuidance = workflowPrompts[workflowType] || workflowPrompts['general'];
    
    return `You are a helpful and knowledgeable visa chatbot specializing in the UK Global Talent Visa. 

Your role:
- Answer questions based strictly on the provided context from official UK visa guidance
- ${workflowGuidance}
- If information is not in the context, politely say you don't have that specific information
- Provide structured, actionable guidance when possible
- Break down complex processes into clear, numbered steps
- Be encouraging and supportive - visa applications can be stressful
- Use bullet points and clear formatting for better readability

Guidelines:
- Always base answers on the provided context
- If asked about costs or fees, mention they may change and to check official sources
- For document requirements, emphasize the importance of checking current requirements
- Encourage users to verify information with official UK government sources`;
}

// Call OpenRouter API with enhanced error handling
async function callOpenRouter(prompt, workflowType = 'general') {
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
                        content: getSystemMessage(workflowType)
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 800,
                temperature: 0.3,
                top_p: 0.9
            })
        });
        
        if (!response.ok) {
            const errorData = await response.text();
            console.error('OpenRouter API error:', response.status, errorData);
            throw new Error(`OpenRouter API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('Invalid response structure from OpenRouter API');
        }
        
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error calling OpenRouter API:', error);
        throw error;
    }
}

// Utility function to parse the request body
async function getRequestBody(req) {
    try {
        if (req.json) {
            return await req.json();
        }
        const chunks = [];
        for await (const chunk of req) {
            chunks.push(chunk);
        }
        const body = Buffer.concat(chunks).toString();
        return JSON.parse(body);
    } catch (error) {
        console.error('Error parsing request body:', error);
        throw new Error('Invalid JSON in request body');
    }
}

// Detect workflow type from user message
function detectWorkflowType(message) {
    const messageLower = message.toLowerCase();
    
    if (messageLower.includes('eligible') || messageLower.includes('qualify') || messageLower.includes('requirement')) {
        return 'eligibility';
    } else if (messageLower.includes('apply') || messageLower.includes('application') || messageLower.includes('process')) {
        return 'application';
    } else if (messageLower.includes('document') || messageLower.includes('evidence') || messageLower.includes('proof')) {
        return 'documents';
    } else if (messageLower.includes('endorsement') || messageLower.includes('body') || messageLower.includes('sponsor')) {
        return 'endorsement';
    } else if (messageLower.includes('time') || messageLower.includes('cost') || messageLower.includes('fee') || messageLower.includes('how long')) {
        return 'timeline';
    }
    
    return 'general';
}

// Main chat endpoint handler
export const handler = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { messages, userId } = await getRequestBody(req);

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Missing or invalid messages in request' });
        }

        const currentMessage = messages[messages.length - 1];
        if (!currentMessage || !currentMessage.content) {
            return res.status(400).json({ error: 'No current message found or message is empty' });
        }

        // Detect workflow type for better responses
        const workflowType = detectWorkflowType(currentMessage.content);
        
        // Get content and find relevant sections
        let notionContent;
        try {
            notionContent = await getNotionPageContent();
            if (!notionContent || notionContent.trim().length === 0) {
                console.warn('No content loaded from PDF guide');
                notionContent = "No guide content available at this time.";
            }
        } catch (error) {
            console.error('Error loading guide content:', error);
            notionContent = "Error loading guide content.";
        }

        const relevantContext = findRelevantSections(notionContent, currentMessage.content);

        // Format chat history (keep last 6 exchanges for better context)
        const chatHistory = messages.slice(-12)
            .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
            .join('\n');

        // Create comprehensive prompt
        const prompt = `Previous conversation:
${chatHistory}

Relevant context from UK Global Talent Visa guide:
${relevantContext.substring(0, 4000)}

Current question: ${currentMessage.content}

Please provide a helpful, structured answer based on the context above. If you cannot answer with the provided context, politely explain that you don't have that specific information in the visa guide and suggest checking official UK government sources.

Focus on being practical and actionable in your response.`;

        // Get response from OpenRouter
        let response;
        try {
            response = await callOpenRouter(prompt, workflowType);
        } catch (apiError) {
            console.error('OpenRouter API call failed:', apiError);
            return res.status(503).json({ 
                error: 'I apologize, but I\'m having trouble accessing my knowledge base right now. Please try again in a moment.',
                details: process.env.NODE_ENV === 'development' ? apiError.message : undefined
            });
        }

        // Try to store conversation history (non-blocking)
        if (userId) {
            try {
                const updatedMessages = [...messages, { role: 'assistant', content: response }];
                // Only store last 20 messages to avoid storage limits
                const messagesToStore = updatedMessages.slice(-20);
                await kv.set(userId, JSON.stringify(messagesToStore), { ex: 3600 }); // Expire after 1 hour
            } catch (kvError) {
                console.error('KV Store warning (non-blocking):', kvError.message);
                // Continue without saving - this is not critical
            }
        }
        
        return res.status(200).json({ response });

    } catch (error) {
        console.error('Chat API Error:', error);
        
        // Determine error type and provide appropriate response
        let errorMessage = 'I apologize, but I encountered an error processing your request. Please try again.';
        let statusCode = 500;

        if (error.message.includes('JSON')) {
            errorMessage = 'There was an issue with your request format. Please try again.';
            statusCode = 400;
        } else if (error.message.includes('OpenRouter')) {
            errorMessage = 'I\'m temporarily unable to process your request. Please try again in a moment.';
            statusCode = 503;
        }

        return res.status(statusCode).json({ 
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Default export for Vercel
export default handler;