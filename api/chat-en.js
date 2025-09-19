// api/chat-en.js - TEMPORARY SIMPLIFIED VERSION FOR TESTING
import { OpenAI } from 'openai';

// Initialize OpenRouter client
const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
        "HTTP-Referer": process.env.YOUR_SITE_URL || "http://localhost:3000",
        "X-Title": "UK Global Talent Visa Assistant",
    }
});

export default async function handler(req, res) {
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
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'No message provided' });
        }

        // Handle test connection
        if (message === 'test connection') {
            console.log('✅ Test connection successful');
            return res.status(200).json({ 
                response: 'English API connection successful! 🇬🇧 Using OpenRouter with simplified version.' 
            });
        }

        console.log('🤖 Processing message:', message.substring(0, 100));
        console.log('🔑 API Key exists:', !!process.env.OPENROUTER_API_KEY);
        console.log('🔑 API Key prefix:', process.env.OPENROUTER_API_KEY?.substring(0, 12));

        // Simple context for testing
        const simpleContext = "UK Global Talent Visa - Digital Technology Route. This visa allows exceptional talent in digital technology to live and work in the UK.";

        const messages = [
            {
                role: "system",
                content: `You are a UK Global Talent Visa expert. Use this context: ${simpleContext}`
            },
            {
                role: "user",
                content: message
            }
        ];

        console.log('📤 Sending request to OpenRouter...');
        console.log('📋 Model: openai/gpt-oss-120b');
        
        const completion = await openai.chat.completions.create({
            model: "openai/gpt-oss-120b",
            messages: messages,
            max_tokens: 500,
            temperature: 0.7,
        });

        const response = completion.choices[0]?.message?.content;
        
        if (!response) {
            throw new Error('No response from OpenRouter');
        }

        console.log('✅ Success! Response length:', response.length);
        return res.status(200).json({ response });

    } catch (error) {
        console.error('❌ FULL ERROR:', error);
        console.error('❌ Error name:', error.name);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error status:', error.status);
        console.error('❌ Error code:', error.code);
        
        return res.status(500).json({ 
            error: `API Error: ${error.message}`,
            details: error.status || error.code || 'Unknown error'
        });
    }
}