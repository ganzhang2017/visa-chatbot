import { createClient } from "@vercel/kv";
import { getNotionPageContent } from './guide_content.js';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnablePassthrough, RunnableSequence } from '@langchain/core/runnables';

// 1. Initialize the Vercel KV client using your Upstash environment variables
const kv = createClient({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.REDIS_TOKEN,
});

// 2. Define Workflow Steps
const WORKFLOW_STEPS = {
    WELCOME: 'welcome',
    EXPERIENCE: 'experience',
    ROLE_SELECTION: 'role_selection',
    TECHNICAL_FOLLOWUP: 'technical_followup',
    BUSINESS_FOLLOWUP: 'business_followup',
    ANALYSIS: 'analysis',
    COMPLETE: 'complete'
};

// 3. Workflow State Management
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

async function saveUserWorkflowState(userId, state) {
    if (!userId) return;
    try {
        await kv.set(`workflow_${userId}`, state);
    } catch (error) {
        console.error('Error saving workflow state:', error);
    }
}

// 4. Generate RAG-Based Analysis
async function generateAnalysis(userData, guideContent) {
    const model = new ChatOpenAI({
        modelName: "gpt-4-turbo-preview", // Use a powerful model for analysis
        openAIApiKey: process.env.OPENROUTER_API_KEY,
        baseURL: "https://openrouter.ai/api/v1",
        temperature: 0.1
    });

    const embeddings = new OpenAIEmbeddings({
        modelName: "text-embedding-3-small",
        openAIApiKey: process.env.OPENROUTER_API_KEY,
        baseURL: "https://openrouter.ai/api/v1"
    });

    // Split the guide content into chunks
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 100,
    });
    const docs = await splitter.createDocuments([guideContent]);
    const vectorStore = new MemoryVectorStore(embeddings);
    await vectorStore.addDocuments(docs);
    const retriever = vectorStore.asRetriever();

    // Create a comprehensive RAG query based on all collected data
    const comprehensiveQuery = `User's Profile:\n- Experience: ${userData.experience}\n- Role: ${userData.role}\n- Specific contributions: ${userData.followUp}\n\nBased on this profile, provide a detailed assessment of the user's eligibility for the UK Global Talent Visa. Use the provided Tech Nation guide context to explain which criteria they likely meet and which areas they need to strengthen. Provide specific quotes or references to the document where possible. Do not invent information. If the provided context doesn't cover a point, state that clearly.`;

    const ragTemplate = `You are a helpful and knowledgeable visa chatbot. Your task is to provide an in-depth analysis of a user's eligibility for the UK Global Talent Visa based on their profile and the provided official guidance.

    User's Profile:
    Experience: {experience}
    Role: {role}
    Specific contributions: {followUp}

    Official UK Global Talent Visa Guidance:
    {context}

    Your analysis must:
    1. Assess the user's profile against the "Exceptional Talent" and "Exceptional Promise" paths.
    2. Based on their experience, identify at least two of the four required criteria they could meet.
    3. Use the provided guidance to explain what evidence the user should provide to demonstrate each criterion.
    4. Highlight any gaps or areas where the user needs more evidence.
    5. Be professional, clear, and easy to understand.`;

    const ragPrompt = PromptTemplate.fromTemplate(ragTemplate);

    const ragChain = RunnableSequence.from([
        {
            context: retriever,
            experience: () => userData.experience,
            role: () => userData.role,
            followUp: () => userData.followUp,
        },
        ragPrompt,
        model,
        new StringOutputParser()
    ]);

    const relevantContext = await retriever.invoke(comprehensiveQuery);
    const contextString = relevantContext.map(doc => doc.pageContent).join("\n\n");
    
    return await ragChain.invoke({
        context: contextString,
        experience: userData.experience,
        role: userData.role,
        followUp: userData.followUp
    });
}

// 5. Workflow Response Logic
function generateWorkflowResponse(step, message, data) {
    let nextStep = step;
    let responseMessage = '';
    let updatedData = { ...data };

    switch (step) {
        case WORKFLOW_STEPS.WELCOME:
            nextStep = WORKFLOW_STEPS.EXPERIENCE;
            responseMessage = "Hello! I can help you assess your eligibility for the UK Global Talent Visa in digital technology. First, how many years of experience do you have in the digital technology sector?";
            break;
        case WORKFLOW_STEPS.EXPERIENCE:
            // Assuming the message is a number
            const years = parseInt(message.trim(), 10);
            if (!isNaN(years) && years > 0) {
                updatedData.experience = years;
                nextStep = WORKFLOW_STEPS.ROLE_SELECTION;
                responseMessage = `Great. What is your primary role? Please specify whether it's a **Technical** role (e.g., Engineer, Developer, Data Scientist) or a **Business** role (e.g., Founder, Product Manager, C-level executive)?`;
            } else {
                responseMessage = "Please enter a valid number for your years of experience.";
                nextStep = WORKFLOW_STEPS.EXPERIENCE;
            }
            break;
        case WORKFLOW_STEPS.ROLE_SELECTION:
            const roleInput = message.toLowerCase().trim();
            if (roleInput.includes('technical')) {
                updatedData.role = 'Technical';
                nextStep = WORKFLOW_STEPS.TECHNICAL_FOLLOWUP;
                responseMessage = "Thanks. Could you describe your **technical contributions**? For example, have you contributed to open-source projects, received any recognition within your field (awards, conference talks), or have any publications?";
            } else if (roleInput.includes('business')) {
                updatedData.role = 'Business';
                nextStep = WORKFLOW_STEPS.BUSINESS_FOLLOWUP;
                responseMessage = "Thank you. Could you describe your **business impact**? For example, what commercial outcomes (revenue growth, user metrics) have you driven, or have you done any public speaking or voluntary mentorship?";
            } else {
                responseMessage = "I didn't understand that. Please specify 'Technical' or 'Business'.";
                nextStep = WORKFLOW_STEPS.ROLE_SELECTION;
            }
            break;
        case WORKFLOW_STEPS.TECHNICAL_FOLLOWUP:
        case WORKFLOW_STEPS.BUSINESS_FOLLOWUP:
            updatedData.followUp = message;
            nextStep = WORKFLOW_STEPS.ANALYSIS;
            responseMessage = "Thank you. I have all the information I need. Please wait while I analyze your profile against the UK Global Talent Visa criteria.";
            break;
        default:
            nextStep = WORKFLOW_STEPS.WELCOME;
            responseMessage = "I'm sorry, an error occurred. Please type 'start' to begin the assessment.";
            break;
    }

    return { message: responseMessage, nextStep, data: updatedData };
}

// 6. Main Handler Function
export const handler = async (req, res) => {
    try {
        const { messages, userId } = req.body;
        if (!messages || !userId) {
            return res.status(400).json({ error: 'Missing messages or userId' });
        }
        const currentMessage = messages[messages.length - 1];

        // Retrieve the current workflow state
        let { step, data } = await getUserWorkflowState(userId);

        // Reset the workflow if the user types 'start'
        if (currentMessage.content.toLowerCase().trim() === 'start') {
            step = WORKFLOW_STEPS.WELCOME;
            data = {};
        }

        let botResponse;

        // Perform RAG analysis if the workflow is at the final step
        if (step === WORKFLOW_STEPS.ANALYSIS) {
            const guideContent = await getNotionPageContent();
            botResponse = await generateAnalysis(data, guideContent);
            // After analysis, set the state to complete or welcome to prevent re-running
            await saveUserWorkflowState(userId, { step: WORKFLOW_STEPS.COMPLETE, data: {} });
        } else {
            // Otherwise, move through the guided workflow
            const { message, nextStep, data: updatedData } = generateWorkflowResponse(step, currentMessage.content, data);
            await saveUserWorkflowState(userId, { step: nextStep, data: updatedData });
            botResponse = message;
        }

        return res.status(200).json({ response: botResponse });
    } catch (error) {
        console.error('API Error:', error.message);
        return res.status(500).json({
            error: 'I apologize, but I encountered an error. Please type "start" to begin the assessment again.',
            details: error.message
        });
    }
};

export default handler;