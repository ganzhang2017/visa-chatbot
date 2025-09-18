// api/chat.js
import { createClient } from "@vercel/kv";
import { getNotionPageContent } from './guide_content.js';

// Initialize KV client only if environment variables are available
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
} else {
    console.log('ℹ️ Redis environment variables not found, running without KV storage');
}

// Enhanced semantic search with better scoring
function findRelevantSections(content, query, maxSections = 4) {
    if (!content || content.trim().length === 0) {
        console.warn('No content provided for search');
        return '';
    }

    // Split into meaningful paragraphs
    const paragraphs = content.split('\n\n')
        .filter(p => p.trim().length > 30)
        .map(p => p.trim());
    
    if (paragraphs.length === 0) {
        console.warn('No paragraphs found in content');
        return content.substring(0, 2000);
    }

    // Enhanced query processing
    const queryLower = query.toLowerCase();
    const queryWords = queryLower
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2)
        .filter(word => !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use'].includes(word));
    
    // Enhanced scoring with semantic understanding
    const scoredParagraphs = paragraphs.map(paragraph => {
        const paraLower = paragraph.toLowerCase();
        let score = 0;
        
        // 1. Exact phrase matching (highest priority)
        if (paraLower.includes(queryLower)) {
            score += 25;
        }
        
        // 2. Word matching with enhanced weights
        queryWords.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            const matches = (paraLower.match(regex) || []).length;
            const wordWeight = word.length > 6 ? 4 : word.length > 4 ? 3 : 2;
            score += matches * wordWeight;
        });
        
        // 3. Tech Nation specific terminology
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
    
    // Return top scoring sections
    const relevantSections = scoredParagraphs
        .filter(item => item.score > 1)
        .sort((a, b) => b.score - a.score)
        .slice(0, maxSections)
        .map(item => item.paragraph);
    
    if (relevantSections.length === 0) {
        console.warn('No relevant sections found, using first paragraphs');
        return paragraphs.slice(0, 3).join('\n\n');
    }
    
    return relevantSections.join('\n\n---\n\n');
}

// Intelligent response generator
function generateIntelligentResponse(prompt, context) {
    const query = prompt.toLowerCase();
    
    // Extract relevant information from context based on query
    const contextLines = context.split('\n').filter(line => line.trim().length > 20);
    
    let response = '';
    
    if (query.includes('process') || query.includes('how') || query.includes('steps')) {
        response += `**Tech Nation Application Process:**\n\n`;
        
        const processInfo = contextLines.filter(line => 
            line.toLowerCase().includes('stage') || 
            line.toLowerCase().includes('step') || 
            line.toLowerCase().includes('application') ||
            line.toLowerCase().includes('submit') ||
            line.toLowerCase().includes('process')
        ).slice(0, 8);
        
        if (processInfo.length > 0) {
            response += `Based on the Tech Nation guidance:\n\n`;
            processInfo.forEach((info, index) => {
                response += `• ${info.trim()}\n`;
            });
        } else {
            response += `**Step 1: Tech Nation Endorsement Application**
• Cost: £561
• Processing: 8-12 weeks (standard), faster service available for extra cost
• Online application via Tech Nation portal

**Step 2: Home Office Visa Application**
• Cost: £205
• Processing: 3 weeks (outside UK), 8 weeks (inside UK)
• Additional documents and biometric appointment required

**Cost Breakdown:**
• Tech Nation endorsement: £561
• Visa application fee: £205
• **Total: £766**

**Additional Costs:**
• Healthcare surcharge: £1,035 per year
• If you're including your partner or children in your application, they'll each need to pay £766

**Complete Process:**
1. Prepare evidence portfolio (2-6 months)
2. Secure recommendation letters (3 letters)
3. Submit Tech Nation application (£561)
4. Wait for endorsement decision (8-12 weeks)
5. Apply for actual visa (£205)
6. Biometric appointment
7. Receive visa decision

**Visa Duration:**
• Up to 5 years validity
• No limit on renewals
• Eligible for settlement after 3-5 years`;
        }
        
        response += `\n\n**Important Notes:**
• Two-stage payment: £561 + £205
• Healthcare surcharge £1,035/year (mandatory)
• Dependants pay same fees separately

**Follow-up Questions:**
• Need details about healthcare surcharge?
• Want to know about dependant applications?
• Need guidance on evidence preparation?`;
        
        return response;
    }
    
    if (query.includes('evidence') || query.includes('document') || query.includes('portfolio')) {
        response += `**Evidence Requirements for Tech Nation Application:**\n\n`;
        response += `**Key Evidence Categories:**

**1. Recognition Outside Immediate Occupation**
• Media coverage in major publications
• Speaking at significant conferences
• Industry awards or honors
• Advisory roles

**2. Technical Expertise**
• Open source contributions with impact
• Technical publications or patents
• Recognition by expert peers

**3. Academic/Commercial Success**
• Research with citations
• Product launches with metrics
• Revenue growth achievements

**4. Innovation in Digital Technology**
• New technologies or methodologies
• Significant tech improvements
• Technology transformation leadership

**Pro Tips:**
• Maximum 10 pieces of evidence
• Quality over quantity
• Include quantifiable metrics
• Show external recognition

**Follow-up Questions:**
• What type of evidence do you currently have?
• Which criteria do you think you're strongest in?
• Need help strengthening any particular area?`;
        
        return response;
    }
    
    // Default response using context
    response = `Based on the Tech Nation guidance provided:\n\n`;
    
    // Try to find relevant lines from context
    const relevantLines = contextLines.filter(line => {
        const lineLower = line.toLowerCase();
        return query.split(' ').some(word => 
            word.length > 3 && lineLower.includes(word.toLowerCase())
        );
    }).slice(0, 5);
    
    if (relevantLines.length > 0) {
        relevantLines.forEach(line => {
            response += `• ${line.trim()}\n`;
        });
        response += `\n`;
    }
    
    response += `I found this information related to your question. For more specific guidance, please ask about:

• **Application Process** - Steps and requirements
• **Evidence Requirements** - What documentation you need
• **Eligibility Criteria** - Who qualifies for the visa
• **Timeline** - How long the process takes

**Would you like me to elaborate on any of these areas?**`;
    
    return response;
}

// Get user-uploaded resume content from KV store
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
        let message, userId;

        // Handle different request formats
        if (body.message) {
            message = body.message;
            userId = body.userId;
        } else if (body.messages) {
            const messages = body.messages;
            message = messages[messages.length - 1]?.content;
            userId = body.userId;
        } else {
            return res.status(400).json({ error: 'No message found in request' });
        }

        if (!message) {
            return res.status(400).json({ error: 'Empty message' });
        }

        // Handle test connection
        if (message === 'test connection') {
            return res.status(200).json({ response: 'API connection successful! Ready to help with Tech Nation guidance 🚀' });
        }

        console.log('Processing message:', message.substring(0, 100));

        // Get guide content (Tech Nation guidance)
        let guideContent;
        try {
            guideContent = await getNotionPageContent();
            if (!guideContent || guideContent.trim().length === 0) {
                console.error('Guide content is empty');
                guideContent = getFallbackGuideContent();
            }
            console.log('Guide content loaded, length:', guideContent.length);
        } catch (error) {
            console.error('Error loading guide content:', error);
            guideContent = getFallbackGuideContent();
        }

        // Get user's resume content if they've uploaded one
        let resumeContent = null;
        if (userId && (message.toLowerCase().includes('resume') || message.toLowerCase().includes('my background') || message.toLowerCase().includes('my profile'))) {
            resumeContent = await getResumeContent(userId);
        }

        // Combine guide and resume content for context
        let combinedContext = guideContent;
        if (resumeContent) {
            combinedContext += `\n\n--- USER'S RESUME CONTENT ---\n${resumeContent}`;
        }

        // Find relevant sections
        const relevantContext = findRelevantSections(combinedContext, message, 4);
        console.log('Found relevant context, length:', relevantContext.length);

        if (!relevantContext || relevantContext.trim().length === 0) {
            const fallback = getFallbackResponse(message);
            return res.status(200).json({ 
                response: fallback || 'I could not find specific information about that in the Tech Nation guidance. Could you please rephrase your question or ask about eligibility criteria, application process, evidence requirements, or timeline?'
            });
        }

        // Generate response
        let response;
        try {
            response = generateIntelligentResponse(message, relevantContext);
            console.log('Response generated, length:', response.length);
        } catch (error) {
            console.error('Response generation failed:', error);
            const basicFallback = getFallbackResponse(message);
            response = basicFallback || 'I encountered an issue processing your request. Please try asking about eligibility, process, documents, or timeline.';
        }

        // Store conversation in KV (non-blocking)
        if (userId && kv) {
            try {
                await kv.set(`chat:${userId}`, JSON.stringify({ 
                    lastMessage: message, 
                    response: response,
                    timestamp: Date.now() 
                }), { ex: 7200 });
            } catch (kvError) {
                console.warn('KV storage failed:', kvError.message);
            }
        }
        
        return res.status(200).json({ response });

    } catch (error) {
        console.error('Chat API Error:', error);
        return res.status(200).json({ 
            response: 'I encountered an unexpected error. Please try again, and if the problem persists, please visit the official Tech Nation website for guidance.'
        });
    }
}

// Fallback guide content
function getFallbackGuideContent() {
    return `Tech Nation Digital Technology Endorsement Guide

ELIGIBILITY REQUIREMENTS
To be eligible for endorsement through Tech Nation's digital technology route, you must:
• Have at least 5 years of experience working in the digital technology sector
• Be able to demonstrate exceptional talent or exceptional promise in digital technology
• Meet the mandatory criteria and at least two of the optional criteria
• Provide evidence that shows your work is in digital technology, not just using digital technology as a tool

MANDATORY CRITERIA
All applicants must provide:
• A valid passport or national identity card
• A CV highlighting your career and achievements in digital technology
• A personal statement of up to 1,000 words explaining how you meet the criteria
• Three letters of recommendation from established leaders in the digital technology sector

OPTIONAL CRITERIA (must meet at least 2 of 4)
1. Evidence of recognition for work outside your immediate occupation that has contributed to the advancement of the sector
2. Evidence of genuine expertise in digital technology, demonstrated through professional experience and recognition by expert peers
3. Evidence of academic contributions through research endorsed by expert peers, or demonstrable commercial successes in digital technology
4. Evidence of innovation in digital technology that has led to new or significantly improved products, technologies, or methodology

APPLICATION PROCESS
Stage 1: Tech Nation Endorsement (£561 fee)
Stage 2: Home Office Visa Application (£205 fee + £1,035/year healthcare surcharge)

EVIDENCE PORTFOLIO
• Maximum 10 pieces of evidence
• Focus on external recognition and quantifiable impact
• Recent evidence preferred (last 5 years)
• Each piece should demonstrate contribution to digital technology sector

RECOMMENDATION LETTERS
• Must be from established leaders in digital technology
• Should demonstrate knowledge of your work and achievements
• Written specifically for this application
• Include recommender's credentials and contact information

TIMELINE EXPECTATIONS
• Evidence preparation: 2-6 months
• Tech Nation decision: 8-12 weeks
• Home Office visa decision: 3 weeks (outside UK), 8 weeks (inside UK)
• You may be able to pay to get a faster decision

COSTS
• Tech Nation endorsement: £561
• Visa application: £205
• Healthcare surcharge: £1,035 per year
• If you're including your partner or children in your application, they'll each need to pay £766
`;
}

// Basic fallback responses for common questions
function getFallbackResponse(message) {
    const query = message.toLowerCase();
    
    if (query.includes('cost') || query.includes('fee') || query.includes('price')) {
        return `**Tech Nation Application Costs:**\n\n• Tech Nation endorsement: £561\n• Visa application: £205\n• **Total: £766**\n\n**Additional Costs:**\n• Healthcare surcharge: £1,035 per year\n• If you're including your partner or children in your application, they'll each need to pay £766`;
    }
    
    if (query.includes('timeline') || query.includes('time') || query.includes('long')) {
        return `**Tech Nation Application Timeline:**\n\n• Evidence preparation: 2-6 months\n• Tech Nation decision: 8-12 weeks\n• Home Office visa decision: 3 weeks (outside UK), 8 weeks (inside UK)\n• You may be able to pay to get a faster decision`;
    }
    
    if (query.includes('eligib')) {
        return `**Tech Nation Eligibility Requirements:**\n\n• At least 5 years of experience in digital technology sector\n• Demonstrate exceptional talent OR exceptional promise\n• Meet mandatory criteria + at least 2 optional criteria\n• Work must be IN digital technology (not just using it as a tool)\n\n**Would you like details about the specific criteria?**`;
    }
    
    return null;
}