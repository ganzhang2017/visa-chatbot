import { createClient } from "@vercel/kv";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnablePassthrough, RunnableSequence } from "@langchain/core/runnables";
import { getNotionPageContent } from "./guide_content.js";
import { OpenAI } from "openai"; // <-- New Import

// Initialize the Vercel KV client
const kv = createClient({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.REDIS_TOKEN,
});

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
      return res.status(400).json({ error: "Missing messages in request" });
    }

    const currentMessage = messages[messages.length - 1];
    if (!currentMessage) {
      return res.status(400).json({ error: "No current message found" });
    }

    // Configure the OpenAI client to use OpenRouter's API
    const openaiClient = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
    });

    const model = new ChatOpenAI({
      modelName: "gpt-4",
      openAIApiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
      temperature: 0.5,
    });

    // Use the PDF/Notion content from guide_content.js
    const notionContent = await getNotionPageContent();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 50,
    });

    const docs = await splitter.createDocuments([notionContent]);

    // Manually create embeddings using the configured openai client
    const embeddings = await openaiClient.embeddings.create({
      model: "text-embedding-3-small", // A model supported by OpenRouter
      input: docs.map(doc => doc.pageContent),
    });

    const vectorStore = new MemoryVectorStore();
    await vectorStore.addDocuments(docs, embeddings.data.map(e => e.embedding));

    const retriever = vectorStore.asRetriever();

    const standaloneQuestionTemplate = `Given a chat history and the latest user question which might reference context in the chat history, formulate a standalone question which can be understood without the chat history. Do NOT answer the question, just reformulate it if needed and otherwise return it as is.

Chat history:
{chat_history}

Latest user question: {question}`;

    const standaloneQuestionPrompt = PromptTemplate.fromTemplate(
      standaloneQuestionTemplate
    );

    const answerTemplate = `You are a helpful and knowledgeable visa chatbot. Your task is to answer user questions about the UK Global Talent Visa. Your answers should be based strictly on the provided context. If the user asks a question that is not covered in the context, politely tell them that you don't have information on that topic.

Context: {context}

Question: {question}`;

    const answerPrompt = PromptTemplate.fromTemplate(answerTemplate);

    const chatHistory = messages
      .slice(0, -1)
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join("\n");

    const standaloneQuestionChain = standaloneQuestionPrompt
      .pipe(model)
      .pipe(new StringOutputParser());

    const retrieverChain = RunnableSequence.from([
      (prevResult) => prevResult.standalone_question,
      retriever,
      (documents) => documents.map((doc) => doc.pageContent).join("\n\n"),
    ]);

    const answerChain = answerPrompt.pipe(model).pipe(new StringOutputParser());

    const chain = RunnableSequence.from([
      {
        standalone_question: standaloneQuestionChain,
        original_input: new RunnablePassthrough(),
      },
      {
        context: retrieverChain,
        question: ({ original_input }) => original_input.question,
        chat_history: ({ original_input }) => original_input.chat_history,
      },
      answerChain,
    ]);

    const response = await chain.invoke({
      question: currentMessage.content,
      chat_history: chatHistory,
    });

    await kv.set(userId, JSON.stringify(messages));

    return res.status(200).json({ response });
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({
      response: "⚠️ Sorry, something went wrong while processing your request.",
      error: error.message,
    });
  }
};

export default handler;

