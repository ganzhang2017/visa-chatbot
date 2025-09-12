import { createClient } from "@vercel/kv";
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnablePassthrough, RunnableSequence } from '@langchain/core/runnables';
import { getNotionPageContent } from './guide_content.js'; // Assuming this file exists

const kv = createClient({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

async function prepareGuideForRAG() {
    // This is the correct way to import content from the guide file
    const notionText = await getNotionPageContent();
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 100
    });
    const docs = await splitter.createDocuments([notionText]);
    const embeddings = new OpenAIEmbeddings({ openAIApiKey: process.env.OPENROUTER_API_KEY, });
    const vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);
    return vectorStore;
}

const vectorStorePromise = prepareGuideForRAG();

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { message } = req.body;
        const vectorStore = await vectorStorePromise;
        const retriever = vectorStore.asRetriever();

        const model = new ChatOpenAI({
            openAIApiKey: process.env.OPENROUTER_API_KEY,
            modelName: "gpt-4o",
            temperature: 0,
        });

        const promptTemplate = PromptTemplate.fromTemplate(
            `You are a chatbot that helps with the UK Global Talent Visa application. Use the following context to answer the user's question. If the answer is not in the context, say "I can only answer questions about the UK Global Talent Visa based on the provided guide."
            
            Context: {context}
            
            Question: {question}`
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

        const result = await chain.invoke(message);

        return res.status(200).json({ response: result });
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ response: 'Sorry, something went wrong. Please try again.' });
    }
}
