import { createClient } from "@vercel/kv";
import { getNotionPageContent } from './guide_content.js';

// Initialize the Vercel KV client
const kv = createClient({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.REDIS_TOKEN,
});

// Workflow steps
const WORKFLOW_STEPS = {
  WELCOME: 'welcome',
  EXPERIENCE: 'experience',
  ROLE_SELECTION: 'role_selection',
  TECHNICAL_FOLLOWUP: 'technical_followup',
  BUSINESS_FOLLOWUP: 'business_followup',
  RESUME_UPLOAD: 'resume_upload',
  ANALYSIS: 'analysis'
};

// Get user's current workflow state
async function getUserWorkflowState(userId) {
  if (!userId) return { step: WORKFLOW_STEPS.WELCOME, data: {} };
  
  try {
    const stored = await kv.get(`workflow_${userId}`);
    return stored || { step: WORKFLOW_STEPS.WELCOME, data: {} };
  } catch (error) {
    console.error('Error getting workflow state:', error);
    return { step: WORKFLOW_STEPS.WELCOME, data: {} };
  }
}

// Save user's workflow state
async function saveUserWorkflowState(userId, state) {
  if (!userId) return;
  
  try {
    await kv.set(`workflow_${userId}`, state);
  } catch (error) {
    console.error('Error saving workflow state:', error);
  }
}

// Call OpenRouter API
async function callOpenRouter(prompt, isAnalysis = false) {
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
                    content: isAnalysis ? 
                        'You are a UK Global Talent Visa expert. Analyze the provided information against the Tech Nation criteria and provide specific feedback on strengths and gaps.' :
                        'You are a helpful assistant for UK Global Talent Visa applications. Be concise and encouraging.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: isAnalysis ? 800 : 300,
            temperature: 0.3
        })
    });
    
    if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
}

// Generate workflow responses
function generateWorkflowResponse(step, userInput, workflowData) {
    switch (step) {
        case WORKFLOW_STEPS.WELCOME:
            return {
                message: `Welcome to the UK Global Talent Visa Assessment! 🇬🇧

I'll guide you through a step-by-step evaluation to assess your eligibility and help identify any gaps in your application.

Let's start with your experience:

**How many years of experience do you have in digital technology?**

Please provide a number (e.g., "5 years" or just "5")`,
                nextStep: WORKFLOW_STEPS.EXPERIENCE,
                data: workflowData
            };

        case WORKFLOW_STEPS.EXPERIENCE:
            const years = extractYears(userInput);
            if (years === null) {
                return {
                    message: "Please provide the number of years of experience (e.g., '3 years' or just '3'):",
                    nextStep: WORKFLOW_STEPS.EXPERIENCE,
                    data: workflowData
                };
            }
            
            const updatedData = { ...workflowData, experience: years };
            return {
                message: `Great! ${years} years of experience in digital technology.

Now, let's identify your primary role:

**What is your primary role in digital technology?**

Please choose:
A) **Technical Role** (e.g., Software Engineer, Data Scientist, Technical Lead, CTO, Technical Architect)
B) **Business Role** (e.g., Product Manager, Growth Marketing, Business Development, Founder/CEO, Digital Strategy)

Type 'A' for Technical or 'B' for Business.`,
                nextStep: WORKFLOW_STEPS.ROLE_SELECTION,
                data: updatedData
            };

        case WORKFLOW_STEPS.ROLE_SELECTION:
            const roleChoice = userInput.toLowerCase().trim();
            let role, nextStep, message;
            
            if (roleChoice.includes('a') || roleChoice.includes('technical')) {
                role = 'technical';
                nextStep = WORKFLOW_STEPS.TECHNICAL_FOLLOWUP;
                message = `Perfect! You've selected **Technical Role**.

For technical professionals, the key criteria focus on:

**1. Open-source contributions & technical leadership**
Do you have significant contributions to open-source projects? (GitHub repos, commits, stars, downloads, etc.)

**2. Recognition within the field**
Have you received any awards, given conference talks, published technical papers, or been recognized as a technical expert?

Please briefly describe your experience in these areas:`;
            } else if (roleChoice.includes('b') || roleChoice.includes('business')) {
                role = 'business';
                nextStep = WORKFLOW_STEPS.BUSINESS_FOLLOWUP;
                message = `Perfect! You've selected **Business Role**.

For business professionals, the key criteria focus on:

**1. Business Impact & Commercial Success**
Have you led initiatives that resulted in significant revenue growth, user acquisition, or commercial outcomes?

**2. Public Speaking & Industry Service**
Have you spoken at industry events, served on panels, mentored others, or contributed to the digital technology community outside of work?

Please briefly describe your experience in these areas:`;
            } else {
                return {
                    message: "Please choose 'A' for Technical Role or 'B' for Business Role:",
                    nextStep: WORKFLOW_STEPS.ROLE_SELECTION,
                    data: workflowData
                };
            }
            
            const roleData = { ...workflowData, role };
            return {
                message,
                nextStep,
                data: roleData
            };

        case WORKFLOW_STEPS.TECHNICAL_FOLLOWUP:
        case WORKFLOW_STEPS.BUSINESS_FOLLOWUP:
            const achievementData = { ...workflowData, achievements: userInput };
            return {
                message: `Thank you for sharing your background!

**Next Step: Resume Upload**

Please upload your resume in PDF format. I'll analyze it against the Tech Nation criteria and provide specific feedback on:

✅ **Strengths** in your application
⚠️ **Gaps** that need to be addressed
📋 **Specific recommendations** for improvement

To upload your resume, please drag and drop a PDF file or use the upload button in your chat interface.

Once uploaded, type "analyze" to proceed with the assessment.`,
                nextStep: WORKFLOW_STEPS.RESUME_UPLOAD,
                data: achievementData
            };

        case WORKFLOW_STEPS.RESUME_UPLOAD:
            if (userInput.toLowerCase().includes('analyze')) {
                return {
                    message: "I'll now analyze your information...",
                    nextStep: WORKFLOW_STEPS.ANALYSIS,
                    data: workflowData
                };
            } else {
                return {
                    message: `Please upload your PDF resume and then type "analyze" to proceed with the assessment.`,
                    nextStep: WORKFLOW_STEPS.RESUME_UPLOAD,
                    data: workflowData
                };
            }

        default:
            return {
                message: "Let's start over. Type 'start' to begin the assessment.",
                nextStep: WORKFLOW_STEPS.WELCOME,
                data: {}
            };
    }
}

// Extract years from user input
function extractYears(input) {
    const match = input.match(/(\d+)/);
    return match ? parseInt(match[1]) : null;
}

// Generate comprehensive analysis
async function generateAnalysis(workflowData, guideContent) {
    const { experience, role, achievements } = workflowData;
    
    const analysisPrompt = `
Based on the UK Global Talent Visa criteria from Tech Nation, analyze this applicant:

**Applicant Profile:**
- Years of Experience: ${experience} years
- Primary Role: ${role}
- Key Achievements: ${achievements}

**Tech Nation Criteria Context:**
${guideContent.substring(0, 3000)}

**Please provide:**
1. **STRENGTHS**: What aspects of their profile align well with the criteria
2. **GAPS**: What's missing or needs improvement
3. **SPECIFIC RECOMMENDATIONS**: Concrete next steps to strengthen their application
4. **OVERALL ASSESSMENT**: Brief summary of their current readiness

Be specific and actionable in your feedback.`;

    return await callOpenRouter(analysisPrompt, true);
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

        // Get current workflow state
        const workflowState = await getUserWorkflowState(userId);
        let { step, data } = workflowState;

        // Handle restart command
        if (currentMessage.content.toLowerCase().includes('start') || 
            currentMessage.content.toLowerCase().includes('restart')) {
            step = WORKFLOW_STEPS.WELCOME;
            data = {};
        }

        let response;

        // Handle analysis step separately
        if (step === WORKFLOW_STEPS.ANALYSIS) {
            const guideContent = await getNotionPageContent();
            response = await generateAnalysis(data, guideContent);
            
            // Reset workflow after analysis
            const newState = { step: WORKFLOW_STEPS.WELCOME, data: {} };
            await saveUserWorkflowState(userId, newState);
        } else {
            // Generate workflow response
            const workflowResponse = generateWorkflowResponse(step, currentMessage.content, data);
            response = workflowResponse.message;
            
            // Save updated workflow state
            const newState = { 
                step: workflowResponse.nextStep, 
                data: workflowResponse.data 
            };
            await saveUserWorkflowState(userId, newState);
        }

        return res.status(200).json({ response });

    } catch (error) {
        console.error('API Error:', error.message);
        return res.status(500).json({ 
            error: 'I apologize, but I encountered an error. Please type "start" to begin the assessment.',
            details: error.message
        });
    }
};

export default handler;