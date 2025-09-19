// api/chat-zh.js - Chinese Version
import { createClient } from "@vercel/kv";
import { getNotionPageContent } from './guide_content.js';
import { OpenAI } from 'openai';

// Initialize OpenRouter client
const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
        "HTTP-Referer": process.env.YOUR_SITE_URL || "http://localhost:3000",
        "X-Title": "UK Global Talent Visa Assistant - Chinese",
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

// Enhanced semantic search - same as English version
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

// Generate response using OpenAI in Chinese
async function generateAIResponse(context, userMessage, resumeContent = null) {
    try {
        let systemPrompt = `你是英国全球人才签证专家，专门从事通过Tech Nation的数字技术路径申请。你的角色是基于官方Tech Nation指南提供可行的指导。

重要指导原则：
1. 只提供申请人获得签证需要采取的具体行动步骤
2. 不要评估成功机会或可能性
3. 专注于他们需要做什么，而不是他们是否会成功
4. 鼓励但实用
5. 始终参考官方标准和要求
6. 提供具体的下一步行动

请使用以下官方Tech Nation指南作为您的知识库：
${context}`;

        if (resumeContent) {
            systemPrompt += `\n\n用户提供了他们的简历/背景信息：
${resumeContent}

根据他们的背景，提供个性化的指导，告诉他们应该采取哪些具体步骤来加强他们的申请。`;
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

        console.log('Sending request to OpenRouter (Chinese)...');
        
        const completion = await openai.chat.completions.create({
            model: "openai/gpt-oss-120b:free", // You can change this to any model available on OpenRouter
            messages: messages,
            max_tokens: 1000,
            temperature: 0.7,
        });

        const response = completion.choices[0]?.message?.content;
        
        if (!response) {
            throw new Error('No response from OpenAI');
        }

        console.log('Received Chinese response from OpenRouter, length:', response.length);
        return response;

    } catch (error) {
        console.error('OpenRouter API Error (Chinese):', error);
        
        if (error.status === 402 || error.message.includes('credits') || error.message.includes('insufficient_quota')) {
            return '很抱歉，由于API限制，我目前无法访问我的AI功能。请稍后再试，或访问官方Tech Nation网站获取指导。';
        }
        
        if (error.status === 429 || error.code === 'rate_limit_exceeded') {
            return '我目前正在经历高需求。请稍等片刻再试。';
        }
        
        if (error.status === 401) {
            return '我正在经历身份验证问题。请稍后再试。';
        }
        
        // Return intelligent fallback in Chinese
        return getIntelligentFallback(userMessage, context);
    }
}

// Chinese intelligent fallback system
function getIntelligentFallback(prompt, context) {
    const query = prompt.toLowerCase();
    
    if (query.includes('流程') || query.includes('如何') || query.includes('步骤') || query.includes('process') || query.includes('how')) {
        return `**Tech Nation申请流程：**

**第一步：Tech Nation背书申请**
• 费用：£561
• 处理时间：8-12周（标准）
• 通过Tech Nation门户在线提交

**第二步：内政部签证申请**
• 费用：£205
• 处理时间：3周（英国境外），8周（英国境内）
• 需要额外文件和生物识别预约

**您需要做什么：**

1. **准备证据档案（2-6个月）**
   • 收集4个标准类别的证据
   • 最多10项证据
   • 专注于外部认可和可量化的影响

2. **获得推荐信**
   • 从数字技术领域的知名领导者那里获得3封信
   • 确保他们个人了解您的工作
   • 信件应专门为此申请而写

3. **提交申请**
   • 首先提交Tech Nation申请（£561）
   • 等待背书决定
   • 然后申请实际签证（£205）

**总投资：** £766 + 每年£1,035医疗附加费

**下一步：**
• 详细审查4个标准类别
• 开始收集显示外部认可的证据
• 识别您网络中的潜在推荐人`;
    }
    
    if (query.includes('证据') || query.includes('文件') || query.includes('档案') || query.includes('evidence') || query.includes('document')) {
        return `**证据要求 - 您需要准备的内容：**

**主要证据类别（需要满足4项中的至少2项）：**

**1. 工作外的认可**
• 主要出版物的媒体报道
• 在重要会议上发言
• 行业奖项或荣誉
• 顾问角色或专家小组

**2. 技术专长**
• 有可衡量影响的开源贡献
• 技术出版物或专利
• 专家同行的认可
• 领导技术创新

**3. 学术/商业成功**
• 有引用和同行认可的研究
• 有影响指标的产品发布
• 收入增长成就
• 技术产品的成功扩展

**4. 数字技术创新**
• 您创建的新技术或方法
• 对现有技术的重大改进
• 技术转型中的领导力

**您应该做什么：**
• 审查每个类别并确定您最强的领域
• 收集您成就的可量化指标
• 收集外部验证（奖项、媒体报道、同行认可）
• 记录您在日常工作之外的影响
• 准备一个引人注目的叙述，展示您对数字技术的贡献

**专业提示：**
• 质量胜过数量 - 最多10项
• 展示外部认可，不仅仅是内部成就
• 尽可能包含指标
• 专注于最近的工作（最好是过去5年）`;
    }
    
    return `根据Tech Nation指南，您需要专注于以下方面：

**必要步骤：**

1. **满足基本要求**
   • 数字技术领域5年以上经验
   • 清楚证明在数字技术领域工作（不仅仅是使用它）

2. **选择您的路径**
   • 杰出人才：已经被认可的领导者
   • 杰出潜力：有潜力成为领导者（早期职业）

3. **准备强有力的证据**
   • 专注于外部认可
   • 展示可量化的影响
   • 证明对该行业的贡献

4. **获得高质量推荐**
   • 来自知名数字技术领导者的3封信
   • 个人了解您工作的人
   • 专门为此申请而写

**立即采取的下一步：**
• 详细审查4个证据标准
• 确定您最强的2个标准领域
• 开始记录您的成就和指标
• 开始联系潜在的推荐人

您想让我详细说明这些领域中的任何一个吗？`;
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
                response: '中文API连接成功！🇨🇳 使用OpenRouter AI驱动的回复与PDF指南。' 
            });
        }

        console.log('Processing Chinese message:', message.substring(0, 100));

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
                error: '无法加载指导内容。请稍后重试。' 
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
                error: '无法在指南中找到相关信息。请尝试重新表述您的问题。' 
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
                    language: 'zh'
                }), { ex: 7200 });
            } catch (kvError) {
                console.warn('KV storage failed:', kvError.message);
            }
        }
        
        return res.status(200).json({ response });

    } catch (error) {
        console.error('Chinese Chat API Error:', error);
        return res.status(500).json({ 
            error: '我遇到了意外错误。请重试，如果问题持续存在，请访问官方Tech Nation网站获取指导。'
        });
    }
}
            