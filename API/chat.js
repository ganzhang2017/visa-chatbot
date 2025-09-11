import { kv } from '@vercel/kv';
import { OpenAI } from 'openai';
import pdf from 'pdf-parse';
import formidable from 'formidable';
import fs from 'fs';
import { SimpleVectorStore } from 'similarity-search';
import { GUIDE_TEXT } from './guide_content';

// Create the OpenAI client to use with OpenRouter
const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

// A simple vector store for RAG
const vectorStore = new SimpleVectorStore();

// This is the one-time preparation step for RAG.
// It happens when the serverless function is "warmed up."
async function prepareGuideForRAG() {
  if (vectorStore.isEmpty()) {
    const textChunks = GUIDE_TEXT.split('\n\n');
    await vectorStore.addTexts(textChunks);
  }
}

// Helper function to send the welcome message
const sendWelcomeMessage = async (sessionId) => {
  const welcomeMessage = "Hi there! I'm your virtual consultant for the UK Global Talent Visa. Let's start with your professional background. How many years of experience do you have in digital technology?";
  await kv.set(sessionId, { state: 'awaiting_experience' });
  return welcomeMessage;
};

// Vercel's serverless function handler
export default async function handler(req, res) {
  // We need to run the RAG preparation function on every invocation
  await prepareGuideForRAG();

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Use a unique session ID for each user
  const sessionId = req.headers['x-session-id'] || 'default-session';

  // Check for the user's current conversation state
  let userData = await kv.get(sessionId);

  // If this is a new conversation, send the first message
  if (!userData || !userData.state) {
    const message = await sendWelcomeMessage(sessionId);
    return res.status(200).json({ reply: message });
  }

  // Handle file upload
  if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
    const form = new formidable.IncomingForm();
    
    try {
      const [fields, files] = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          resolve([fields, files]);
        });
      });

      const resumeFile = files.resume[0];
      const filePath = resumeFile.filepath;

      const pdfData = fs.readFileSync(filePath);
      const parsedPdf = await pdf(pdfData);
      const resumeText = parsedPdf.text;
      
      await kv.set(sessionId, { ...userData, resume: resumeText, state: 'awaiting_analysis' });
      
      const message = 'Thank you! I have your resume. I will now perform the analysis. Please send "Start Analysis" when you are ready.';
      return res.status(200).json({ reply: message });
    } catch (error) {
        console.error("PDF parsing error:", error);
        return res.status(500).json({ reply: 'Sorry, I had trouble reading that PDF. Can you try a different format?' });
    }
  }
  
  const { message } = req.body;

  // State Machine Logic
  switch (userData.state) {
    case 'awaiting_experience':
      const experience = parseInt(message);
      if (isNaN(experience)) {
        return res.status(200).json({ reply: "Please enter a number for your years of experience." });
      }
      await kv.set(sessionId, { ...userData, experience, state: 'awaiting_role_selection' });
      return res.status(200).json({ reply: "Great. What is your primary role? (e.g., Product Manager, Software Engineer, Data Scientist)" });

    case 'awaiting_role_selection':
      const role = message.toLowerCase();
      await kv.set(sessionId, { ...userData, role });

      if (['product manager', 'growth marketing', 'business'].includes(role)) {
        await kv.set(sessionId, { ...userData, state: 'awaiting_business_questions' });
        return res.status(200).json({ reply: "Thank you. Please tell me about a significant business impact you've had. For example, revenue growth or commercial outcomes you've led." });
      } else {
        await kv.set(sessionId, { ...userData, state: 'awaiting_technical_questions' });
        return res.status(200).json({ reply: "Thank you. Please tell me about your contribution to any open-source projects or public recognition you've received (e.g., awards, conference talks)." });
      }

    case 'awaiting_business_questions':
    case 'awaiting_technical_questions':
      const userResponse = message;
      await kv.set(sessionId, { ...userData, additional_info: userResponse, state: 'awaiting_resume_upload' });
      return res.status(200).json({ reply: "Thank you for that. Now, please upload your resume in PDF format." });

    case 'awaiting_resume_upload':
      return res.status(200).json({ reply: "I'm ready for your resume. Please use the upload button." });

    case 'awaiting_analysis':
      if (message.toLowerCase() === 'start analysis') {
        const { experience, role, additional_info, resume } = userData;

        // Perform RAG to find the most relevant document chunks
        const query = `${experience} years, role: ${role}, contributions: ${additional_info}, resume: ${resume}`;
        const relevantChunks = await vectorStore.similaritySearch(query, 3); // Get top 3 chunks

        // Craft the final, augmented prompt for the AI
        const finalPrompt = `
          Based on the following document excerpts and the applicant's profile, provide an analysis against the UK Global Talent Visa (Exceptional Talent) criteria, specifically for a digital technology professional.

          **Document Excerpts:**
          ${relevantChunks.map(chunk => `- ${chunk.pageContent}`).join('\n')}

          **Applicant Profile:**
          - Years of experience: ${experience}
          - Role: ${role}
          - Key achievements/contributions: ${additional_info}
          - Resume Text: ${resume}
          
          Provide a concise analysis in two sections: "Strengths" and "Gaps".
          - **Strengths:** List specific points from the provided information (both the applicant's profile and the document excerpts) that align with the criteria. Use bullet points.
          - **Gaps:** Highlight areas where the profile is weak or needs more evidence. Suggest what kind of additional evidence or information would be needed to meet the criteria.
          - **Strict Instruction:** Do not provide any information that is not present in the document excerpts or the applicant's profile. If a piece of information is not there, state it as a gap.
        `;
        
        try {
          const completion = await openai.chat.completions.create({
            model: "openai/gpt-4o",
            messages: [{ role: 'system', content: finalPrompt }],
          });
          
          const aiReply = completion.choices[0].message.content;
          
          await kv.del(sessionId); 

          return res.status(200).json({ reply: aiReply });
        } catch (error) {
          console.error('OpenRouter API error:', error);
          return res.status(500).json({ reply: 'Sorry, I encountered an issue with the AI analysis. Please try again later.' });
        }
      } else {
        return res.status(200).json({ reply: 'Please type "Start Analysis" to begin the final report.' });
      }

    default:
      await kv.del(sessionId);
      return res.status(200).json({ reply: 'The conversation has ended or an error occurred. Please refresh the page to start over.' });
  }
}

