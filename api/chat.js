import { createClient } from "@vercel/kv";
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnablePassthrough, RunnableSequence } from '@langchain/core/runnables';
import { getNotionPageContent } from './guide_content.js';
import { Embeddings } from '@langchain/core/embeddings';
import OpenAI from 'openai';

// Initialize the Vercel KV client
const kv = createClient({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.REDIS_TOKEN,
});

// Custom OpenRouter Embeddings class that properly handles baseURL
class OpenRouterEmbeddings extends Embeddings {
  constructor(fields = {}) {
    super(fields);
    this.modelName = fields.modelName || "text-embedding-ada-002";
    
    console.log('🔧 Initializing OpenRouterEmbeddings with:', {
      modelName: this.modelName,
      baseURL: fields.baseURL,
      hasApiKey: !!fields.openAIApiKey
    });
    
    this.client = new OpenAI({
      apiKey: fields.openAIApiKey || process.env.OPENROUTER_API_KEY,
      baseURL: fields.baseURL || "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000",
        "X-Title": "Visa Chatbot"
      }
    });
  }

  async embedDocuments(texts) {
    try {
      console.log(`🔍 Creating embeddings for ${texts.length} documents`);
      
      const response = await this.client.embeddings.create({
        model: this.modelName,
        input: texts,
      });
      
      console.log('✅ Embeddings created successfully');
      return response.data.map(item => item.embedding);
    } catch (error) {
      console.error('❌ Embedding error:', {
        message: error.message,
        status: error.status,
        type: error.type,
        code: error.code
      });
      throw error;
    }
  }

  async embedQuery(text) {
    const embeddings = await this.embedDocuments([text]);
    return embeddings[0];
  }
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
    console.log('🚀 Handler started');
    
    try {
        // Log environment variables (safely)
        console.log('🔐 Environment check:', {
            hasOpenRouterKey: !!process.env.OPENROUTER_API_KEY,
            hasRedisUrl: !!process.env.UPSTASH_REDIS_URL,
            hasRedisToken: !!process.env.REDIS_TOKEN,
            vercelUrl: process.env.VERCEL_URL
        });

        const { messages, userId } = await getRequestBody(req);

        if (!messages) {
            return res.status(400).json({ error: 'Missing messages in request' });
        }

        const currentMessage = messages[messages.length - 1];
        if (!currentMessage) {
            return res.status(400).json({ error: 'No current message found' });
        }

        console.log('💬 Processing message:', currentMessage.content);

        // Initialize ChatOpenAI with OpenRouter
        console.log('🤖 Initializing ChatOpenAI...');
        const model = new ChatOpenAI({
            modelName: "openai/gpt-4",
            openAIApiKey: process.env.OPENROUTER_API_KEY,
            baseURL: "https://openrouter.ai/api/v1",
            temperature: 0.5,
            defaultHeaders: {
                "HTTP-Referer": process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000",
                "X-Title": "Visa Chatbot"
            }
        });

        // Use the PDF content from guide_content.js
        console.log('📄 Getting content...');
        const notionContent = await getNotionPageContent();
        console.log('📄 Content length:', notionContent.length);
        
        console.log('✂️ Splitting content...');
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 500,
            chunkOverlap: 50,
        });

        const docs = await splitter.createDocuments([notionContent]);
        console.log('📝 Created documents:', docs.length);
        
        // Use our custom OpenRouter embeddings class
        console.log('🔧 Creating embeddings...');
        const embeddings = new OpenRouterEmbeddings({
            openAIApiKey: process.env.OPENROUTER_API_KEY,
            baseURL: "https://openrouter.ai/api/v1",
            modelName: "text-embedding-ada-002"
        });

        console.log('🗃️ Creating vector store...');
        const vectorStore = new MemoryVectorStore(embeddings);
        
        console.log('📚 Adding documents to vector store...');
        await vectorStore.addDocuments(docs);
        
        console.log('🔍 Creating retriever...');
        const retriever = vectorStore.asRetriever();

        const standaloneQuestionTemplate = `Given a chat history and the latest user question which might reference context in the chat history, formulate a standalone question which can be understood without the chat history. Do NOT answer the question, just reformulate it if needed and otherwise return it as is.

        Chat history:
        {chat_history}

        Latest user question: {question}`;
        
        const standaloneQuestionPrompt = PromptTemplate.fromTemplate(standaloneQuestionTemplate);

        const answerTemplate = `You are a helpful and knowledgeable visa chatbot. Your task is to answer user questions about the UK Global Talent Visa. Your answers should be based strictly on the provided context. If the user asks a question that is not covered in the context, politely tell them that you don't have information on that topic.

        Context: {context}

        Question: {question}`;
        
        const answerPrompt = PromptTemplate.fromTemplate(answerTemplate);

        const chatHistory = messages.slice(0, -1).map(msg => `${msg.role}: ${msg.content}`).join('\n');
        
        console.log('🔗 Building chains...');
        const standaloneQuestionChain = standaloneQuestionPrompt.pipe(model).pipe(new StringOutputParser());

        const retrieverChain = RunnableSequence.from([
            prevResult => prevResult.standalone_question,
            retriever,
            (documents) => documents.map(doc => doc.pageContent).join('\n\n')
        ]);

        const answerChain = answerPrompt.pipe(model).pipe(new StringOutputParser());

        const chain = RunnableSequence.from([
            {
                standalone_question: standaloneQuestionChain,
                original_input: new RunnablePassthrough()
            },
            {
                context: retrieverChain,
                question: ({ original_input }) => original_input.question,
                chat_history: ({ original_input }) => original_input.chat_history
            },
            answerChain
        ]);

        console.log('🚀 Invoking chain...');
        const response = await chain.invoke({ 
            question: currentMessage.content, 
            chat_history: chatHistory 
        });

        console.log('✅ Got response, saving to KV...');
        if (userId) {
            await kv.set(userId, JSON.stringify(messages));
        }
        
        console.log('🎉 Success! Returning response');
        return res.status(200).json({ response });

    } catch (error) {
        console.error('❌ API Error:', {
            message: error.message,
            name: error.name,
            stack: error.stack,
            status: error.status,
            type: error.type,
            code: error.code
        });
        
        return res.status(500).json({ 
            error: error.message,
            type: error.constructor.name 
        });
    }
};

export default handler;

