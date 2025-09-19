// api/chat-zh.js - Chinese Chat API
import { OpenAI } from 'openai';
import { getNotionPageContent } from './guide_content.js';

// Initialize OpenRouter client
const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
        "HTTP-Referer": process.env.YOUR_SITE_URL || "https://your-chinese-app.vercel.app",
        "X-Title": "UK Global Talent Visa Assistant - Chinese",
    }
});

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
        .filter(word => word.length > 2);
    
    const scoredParagraphs = paragraphs.map(paragraph => {
        const paraLower = paragraph.toLowerCase();
        let score = 0;
        
        if (paraLower.includes(queryLower)) {
            score += 25;
        }
        
        queryWords.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            const matches = (paraLower.match(regex) || []).length;
            const wordWeight = word.length > 6 ? 4 : word.length > 4 ? 3 : 2;
            score += matches * wordWeight;
        });
        
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

// Generate response using OpenAI in Chinese
async function generateAIResponse(context, userMessage, resumeContent = null) {
    try {
        let systemPrompt = `你是英国全球人才签证专家，专门从事通过Tech Nation的数字技术路径申请。

回复格式要求：
- 使用清晰的 • 符号作为项目符号
- 将信息格式化为易读的部分
- 使用 **粗体** 标记重要标题
- 将复杂信息分解为易消化的步骤
- 避免使用 <br> 标签 - 使用适当的换行
- 对顺序步骤使用编号列表
- 保持段落简短而专注

指导原则：
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

        console.log('发送请求到OpenRouter（中文）...');
        
        const completion = await openai.chat.completions.create({
            model: "openai/gpt-oss-120b",
            messages: messages,
            max_tokens: 1500,
            temperature: 0.7,
        });

        const response = completion.choices[0]?.message?.content;
        
        if (!response) {
            throw new Error('No response from OpenRouter');
        }

        console.log('收到OpenRouter中文回复，长度:', response.length);
        return response;

    } catch (error) {
        console.error('OpenRouter API错误（中文）:', error);
        
        if (error.status === 402 || error.message.includes('credits') || error.message.includes('insufficient_quota')) {
            return '很抱歉，由于API限制，我目前无法访问我的AI功能。请稍后再试，或访问官方Tech Nation网站获取指导。';
        }
        
        if (error.status === 429 || error.code === 'rate_limit_exceeded') {
            return '我目前正在经历高需求。请稍等片刻再试。';
        }
        
        if (error.status === 401 || error.status === 403) {
            return '我正在经历身份验证问题。请稍后再试。';
        }
        
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

**总投资：** £766 + 每年£1,035医疗附加费`;
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
• 开始联系潜在的推荐人`;
}

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

        if (message === 'test connection') {
            return res.status(200).json({ 
                response: '中文API连接成功！🇨🇳 使用OpenRouter AI驱动的回复。' 
            });
        }

        console.log('处理中文消息:', message.substring(0, 100));

        // Get guide content with fallback
        let guideContent;
        try {
            guideContent = await getNotionPageContent();
            if (!guideContent || guideContent.trim().length === 0) {
                guideContent = "英国全球人才签证指南 - 数字技术路线\n\n此签证适用于数字技术领域的杰出人才或有潜力的领导者。";
            }
        } catch (error) {
            console.error('加载指南内容错误:', error);
            guideContent = "英国全球人才签证指南 - 数字技术路线\n\n此签证适用于数字技术领域的杰出人才或有潜力的领导者。";
        }

        // Find relevant sections
        const relevantContext = findRelevantSections(guideContent, message, 4);

        // Generate AI response
        const response = await generateAIResponse(relevantContext, message, resumeContent);
        
        return res.status(200).json({ response });

    } catch (error) {
        console.error('中文聊天API错误:', error);
        return res.status(500).json({ 
            error: '我遇到了意外错误。请重试，如果问题持续存在，请访问官方Tech Nation网站获取指导。'
        });
    }
}