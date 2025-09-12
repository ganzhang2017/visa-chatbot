import { createClient } from "@vercel/kv";
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnablePassthrough, RunnableSequence } from '@langchain/core/runnables';
import { getNotionPageContent } from './guide_content.js'; // Ensure 'guide_content.js' has a named export

// Use the new environment variable for the URL to fix the Upstash error
const kv = createClient({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.REDIS_TOKEN,
});

const stages = {
    START: 'start',
    YEARS_EXPERIENCE: 'years_experience',
    ROLE_SELECTION: 'role_selection',
    ROLE_SPECIFIC: 'role_specific',
    RESUME_UPLOAD: 'resume_upload',
    ANALYSIS: 'analysis'
};

const stagePrompts = {
    [stages.START]: 'Welcome! I will guide you through a pre-screening for the UK Global Talent Visa. How many years of experience do you have in digital technology?',
    [stages.YEARS_EXPERIENCE]: 'What is your primary role? (e.g., Technical, Business, Product Manager)',
    // Add more prompts here as you build the flow...
};

async function prepareGuideForRAG() {
    const notionText = await getNotionPageContent();
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 100
    });
    const docs = await splitter.createDocuments([notionText]);
    const embeddings = new OpenAIEmbeddings({ openAIApiKey: process.env.OPENROUTER_API_KEY });
    const vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);
    return vectorStore;
}

const vectorStorePromise = prepareGuideForRAG();

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { message, sessionId, isResumeAnalysis } = req.body;
        
        let currentState = await kv.get(sessionId) || stages.START;

        if (isResumeAnalysis) {
            // Handle the resume analysis request directly
            const vectorStore = await vectorStorePromise;
            const retriever = vectorStore.asRetriever();
            const model = new ChatOpenAI({
                openAIApiKey: process.env.OPENROUTER_API_KEY,
                modelName: "gpt-4o",
                temperature: 0,
            });

            const promptTemplate = PromptTemplate.fromTemplate(
                `You are an expert visa consultant. Your task is to analyze the provided resume against the context about the UK Global Talent Visa criteria. Provide a clear evaluation of the candidate's chances of qualifying and highlight any key gaps.
                
                Context: {context}
                
                Resume: {question}`
            );

            const chain = RunnableSequence.from([
                {
                    context: retriever,
                    question: new RunnablePassthrough()
                },
                promptTemplate,
                model,
                new StringOutputParser()
            ]);

            const analysisResult = await chain.invoke(message);
            
            // Reset the state after analysis
            await kv.set(sessionId, stages.START);
            
            return res.status(200).json({ response: analysisResult });
        }

        // Handle the conversational flow
        let nextStage = '';
        let responseMessage = '';

        if (message === 'start') {
            nextStage = stages.YEARS_EXPERIENCE;
            responseMessage = stagePrompts[nextStage];
        } else if (currentState === stages.YEARS_EXPERIENCE) {
            // Logic for Years of Experience
            nextStage = stages.ROLE_SELECTION;
            responseMessage = stagePrompts[nextStage];
        } else if (currentState === stages.ROLE_SELECTION) {
            // Logic for Role Selection
            nextStage = stages.ROLE_SPECIFIC;
            responseMessage = 'Based on your role, please tell me about your contributions...';
        } 
        
        // Save the next state
        await kv.set(sessionId, nextStage);

        return res.status(200).json({ response: responseMessage });
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ response: 'Sorry, something went wrong. Please try again.' });
    }
}
