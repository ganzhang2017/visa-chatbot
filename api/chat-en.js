// api/chat-en.js - English Version
import { createClient } from "@vercel/kv";
import { getNotionPageContent } from './guide_content.js';
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

// Initialize KV client
let kv = null;
if (process.env.UPSTASH_REDIS_URL && process.env.REDIS_TOKEN) {
    try {
        kv = createClient({
            url: process.env.UPSTASH_REDIS_URL,
            token: process.env.REDIS_TOKEN,
        });
        console.log('✅ Redis KV client initialized');
    } catch (error) {
        console.warn('⚠️ Redis KV client initialization failed:', error.message);
        kv = null;
    }
}

// Enhanced semantic search
function findRelevantSections(content, query, maxSections = 4) {
    if (!content || content.trim().length === 0) {
        console.warn('No content provided for search');
        return '';
    }

    const paragraphs = content.split('\n\n')
        .filter(p => p.trim().length > 30)
        .map(p => p.trim());
    
    if (paragraphs.length === 0) {
        return content.substring(0, 2000);
    }

    const queryLower = query.toLowerCase();
    const queryWords = queryLower
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2)
        .filter(word => !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use'].includes(word));
    
    const scoredParagraphs = paragraphs.map(paragraph => {
        const paraLower = paragraph.toLowerCase();
        let score = 0;
        
        // Exact phrase matching
        if (paraLower.includes(queryLower)) {
            score += 25;
        }
        
        // Word matching with weights
        queryWords.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            const matches = (paraLower.match(regex) || []).length;
            const wordWeight = word.length > 6 ? 4 : word.length > 4 ? 3 : 2;
            score += matches * wordWeight;
        });
        
        // Tech Nation specific terms
        const techTerms = [
            'tech nation', 'digital technology', 'exceptional talent', 'exceptional promise', 
            'endorsement', 'criteria', 'evidence', 'recommendation letter', 'application process',
            'global talent visa', 'home office', 'mandatory criteria', 'optional criteria'
        ];
        techTerms.forEach(term => {
            if (paraLower.includes(term)) {
                score += 8;
            }
        });
        
        return { paragraph, score };
    });
    
    const relevantSections = scoredParagraphs
        .filter(item => item.score > 1)
        .sort((a, b) => b.score - a.score)
        .slice(0, maxSections)
        .map(item => item.paragraph);
    
    if (relevantSections.length === 0) {
        return paragraphs.slice(0, 3).join('\n\n');
    }
    
    return relevantSections.join('\n\n---\n\n');
}

// Get user resume content
async function getResumeContent(userId) {
    try {
        if (!userId || !kv) {
            return null;
        }
        
        const resumeData = await kv.get(`resume:${userId}`);
        if (resumeData && resumeData.content) {
            console.log(`Retrieved resume for user ${userId}, length: ${resumeData.content.length}`);
            return resumeData.content;
        }
        return null;
    } catch (error) {
        console.warn('Failed to retrieve resume:', error);
        return null;
    }
}

// Store resume content
async function storeResumeContent(userId, content) {
    try {
        if (!userId || !kv || !content) {
            return false;
        }
        
        await kv.set(`resume:${userId}`, {
            content: content,
            timestamp: Date.now()
        }, { ex: 86400 * 7 }); // 7 days expiration
        
        console.log(`Stored resume for user ${userId}, length: ${content.length}`);
        return true;
    } catch (error) {
        console.warn('Failed to store resume:', error);
        return false;
    }
}

// Generate response using OpenAI
async function generateAIResponse(context, userMessage, resumeContent = null) {
    try {
        let systemPrompt = `You are a UK Global Talent Visa expert specializing in the Digital Technology route through Tech Nation. Your role is to provide actionable guidance based on the official Tech Nation guidelines.

IMPORTANT GUIDELINES:
1. Only provide specific actionable steps the applicant needs to take to get the visa
2. DO NOT assess chances or likelihood of success
3. Focus on what they need to DO, not whether they will succeed
4. Be encouraging but practical
5. Always reference the official criteria and requirements
6. Provide concrete next steps

Use the following official Tech Nation guidance as your knowledge base:
${context}`;

        if (resumeContent) {
            systemPrompt += `\n\nThe user has provided their resume/background information:
${resumeContent}

Based on their background, provide personalized guidance on what specific steps they should take to strengthen their application.`;
        }

        const messages = [
            {
                role: "system",
                content: systemPrompt
            },
            {
                role: "user",
                content: userMessage
            }
        ];

        console.log('Sending request to OpenRouter...');
        
        const completion = await openai.chat.completions.create({
            model: "anthropic/claude-3.5-sonnet", // You can change this to any model available on OpenRouter
            messages: messages,
            max_tokens: 1000,
            temperature: 0.7,
        });

        const response = completion.choices[0]?.message?.content;
        
        if (!response) {
            throw new Error('No response from OpenAI');
        }

        console.log('Received response from OpenRouter, length:', response.length);
        return response;

    } catch (error) {
        console.error('OpenRouter API Error:', error);
        
        if (error.status === 402 || error.message.includes('credits') || error.message.includes('insufficient_quota')) {
            return 'I apologize, but I am currently unable to access my AI capabilities due to API limits. Please try the question again later, or visit the official Tech Nation website for guidance.';
        }
        
        if (error.status === 429 || error.code === 'rate_limit_exceeded') {
            return 'I am currently experiencing high demand. Please try again in a moment.';
        }
        
        if (error.status === 401) {
            return 'I am experiencing authentication issues. Please try again later.';
        }
        
        // Return intelligent fallback
        return getIntelligentFallback(userMessage, context);
    }
}

// Intelligent fallback system
function getIntelligentFallback(prompt, context) {
    const query = prompt.toLowerCase();
    
    if (query.includes('process') || query.includes('how') || query.includes('steps')) {
        return `**Tech Nation Application Process:**

**Step 1: Tech Nation Endorsement Application**
• Cost: £561
• Processing: 8-12 weeks (standard)
• Submit online via Tech Nation portal

**Step 2: Home Office Visa Application**
• Cost: £205
• Processing: 3 weeks (outside UK), 8 weeks (inside UK)
• Additional documents and biometric appointment required

**What You Need to Do:**

1. **Prepare Your Evidence Portfolio (2-6 months)**
   • Gather evidence for 4 criteria categories
   • Maximum 10 pieces of evidence
   • Focus on external recognition and quantifiable impact

2. **Secure Recommendation Letters**
   • Get 3 letters from established leaders in digital technology
   • Ensure they know your work personally
   • Letters should be written specifically for this application

3. **Submit Applications**
   • Tech Nation application first (£561)
   • Wait for endorsement decision
   • Then apply for actual visa (£205)

**Total Investment:** £766 + £1,035/year healthcare surcharge

**Next Steps:**
• Review the 4 criteria categories in detail
• Start gathering evidence that shows external recognition
• Identify potential recommenders in your network`;
    }
    
    if (query.includes('evidence') || query.includes('document') || query.includes('portfolio')) {
        return `**Evidence Requirements - What You Need to Prepare:**

**Key Evidence Categories (need at least 2 of 4):**

**1. Recognition Outside Your Job**
• Media coverage in major publications
• Speaking at significant conferences
• Industry awards or honors
• Advisory roles or expert panels

**2. Technical Expertise**
• Open source contributions with measurable impact
• Technical publications or patents
• Recognition by expert peers
• Leading technical innovations

**3. Academic/Commercial Success**
• Research with citations and peer endorsement
• Product launches with metrics showing impact
• Revenue growth achievements
• Successful scaling of technology products

**4. Innovation in Digital Technology**
• New technologies or methodologies you've created
• Significant improvements to existing tech
• Leadership in technology transformation

**What You Should Do:**
• Review each category and identify your strongest areas
• Gather quantifiable metrics for your achievements
• Collect external validation (awards, media coverage, peer recognition)
• Document your impact beyond just your day job
• Prepare a compelling narrative showing your contribution to digital technology

**Pro Tips:**
• Quality over quantity - 10 pieces maximum
• Show external recognition, not just internal achievements
• Include metrics wherever possible
• Focus on recent work (last 5 years preferred)`;
    }
    
    return `Based on the Tech Nation guidance, here's what you need to focus on:

**Essential Steps to Take:**

1. **Meet Basic Requirements**
   • 5+ years experience in digital technology
   • Clear evidence of working IN digital technology (not just using it)

2. **Choose Your Route**
   • Exceptional Talent: Already recognized leader
   • Exceptional Promise: Potential to be a leader (early career)

3. **Prepare Strong Evidence**
   • Focus on external recognition
   • Show quantifiable impact
   • Demonstrate contribution to the sector

4. **Secure Quality Recommendations**
   • 3 letters from established digital tech leaders
   • People who know your work personally
   • Written specifically for this application

**Immediate Next Steps:**
• Review the 4 evidence criteria in detail
• Identify your 2 strongest criteria areas
• Start documenting your achievements with metrics
• Begin reaching out to potential recommenders

Would you like me to elaborate on any of these areas?`;
}

// Main handler
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
        const { message, userId, resumeContent } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'No message provided' });
        }

        // Handle test connection
        if (message === 'test connection') {
            return res.status(200).json({ 
                response: 'English API connection successful! 🇬🇧 Using OpenRouter AI-powered responses with PDF guidance.' 
            });
        }

        console.log('Processing English message:', message.substring(0, 100));

        // Get guide content
        let guideContent;
        try {
            guideContent = await getNotionPageContent();
            if (!guideContent || guideContent.trim().length === 0) {
                throw new Error('Empty guide content');
            }
            console.log('Guide content loaded, length:', guideContent.length);
        } catch (error) {
            console.error('Error loading guide content:', error);
            return res.status(500).json({ 
                error: 'Unable to load guidance content. Please try again later.' 
            });
        }

        // Store resume content if provided
        if (resumeContent && userId) {
            await storeResumeContent(userId, resumeContent);
        }

        // Get existing resume content if userId provided
        let existingResumeContent = null;
        if (userId) {
            existingResumeContent = await getResumeContent(userId);
        }

        // Use provided resume content or existing one
        const finalResumeContent = resumeContent || existingResumeContent;

        // Find relevant sections from guide
        const relevantContext = findRelevantSections(guideContent, message, 4);
        console.log('Found relevant context, length:', relevantContext.length);

        if (!relevantContext || relevantContext.trim().length === 0) {
            return res.status(500).json({ 
                error: 'Could not find relevant information in the guidance. Please try rephrasing your question.' 
            });
        }

        // Generate AI response
        const response = await generateAIResponse(relevantContext, message, finalResumeContent);

        // Store conversation
        if (userId && kv) {
            try {
                await kv.set(`chat:${userId}`, JSON.stringify({ 
                    lastMessage: message, 
                    response: response,
                    timestamp: Date.now(),
                    language: 'en'
                }), { ex: 7200 });
            } catch (kvError) {
                console.warn('KV storage failed:', kvError.message);
            }
        }
        
        return res.status(200).json({ response });

    } catch (error) {
        console.error('English Chat API Error:', error);
        return res.status(500).json({ 
            error: 'I encountered an unexpected error. Please try again, and if the problem persists, please visit the official Tech Nation website for guidance.'
        });
    }
}