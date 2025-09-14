import { Formidable } from 'formidable';
import pdf from 'pdf-parse/lib/pdf-parse.js';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const form = new Formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB limit
      allowEmptyFiles: false,
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Form parsing error:', err);
        return res.status(500).json({ error: 'Failed to parse form data.' });
      }

      // Handle both single file and array formats
      const file = Array.isArray(files.file) ? files.file[0] : files.file;
      
      if (!file) {
        return res.status(400).json({ error: 'No resume file uploaded.' });
      }

      // Validate file type
      if (file.mimetype !== 'application/pdf') {
        return res.status(400).json({ error: 'Please upload a PDF file only.' });
      }

      try {
        // Read and parse PDF content
        const dataBuffer = fs.readFileSync(file.filepath);
        const data = await pdf(dataBuffer);
        
        // Extract useful information from the PDF
        const resumeText = data.text;
        const pageCount = data.numpages;
        
        // You could implement more sophisticated analysis here
        // For example, extract skills, experience, education, etc.
        const hasRelevantSkills = checkForRelevantSkills(resumeText);
        const experienceLevel = estimateExperienceLevel(resumeText);
        
        // Clean up temp file
        try {
          fs.unlinkSync(file.filepath);
        } catch (cleanupError) {
          console.warn('Failed to cleanup temp file:', cleanupError);
        }
        
        // Log for debugging
        console.log(`Processed resume: ${file.originalFilename} (${pageCount} pages)`);
        console.log(`Has relevant skills: ${hasRelevantSkills}`);
        console.log(`Experience level: ${experienceLevel}`);
        
        // Generate personalized response based on analysis
        const personalizedMessage = generatePersonalizedMessage(
          file.originalFilename, 
          hasRelevantSkills, 
          experienceLevel
        );
        
        res.status(200).json({
          success: true,
          response: personalizedMessage,
          metadata: {
            filename: file.originalFilename,
            pages: pageCount,
            hasRelevantSkills,
            experienceLevel
          }
        });
        
      } catch (pdfError) {
        console.error('PDF processing error:', pdfError);
        
        // Clean up temp file even on error
        try {
          fs.unlinkSync(file.filepath);
        } catch (cleanupError) {
          console.warn('Failed to cleanup temp file after error:', cleanupError);
        }
        
        res.status(200).json({ 
          success: true,
          response: `I've received your resume "${file.originalFilename}" but had some trouble reading the PDF content. No worries though - I can still help you with Global Talent Visa questions! What would you like to know?`
        });
      }
    });
    
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Something went wrong processing your request.'
    });
  }
}

// Helper function to check for relevant skills
function checkForRelevantSkills(text) {
  const techSkills = [
    'javascript', 'python', 'java', 'react', 'node.js', 'aws', 'docker',
    'machine learning', 'ai', 'data science', 'blockchain', 'cloud computing',
    'software engineering', 'full stack', 'backend', 'frontend', 'devops'
  ];
  
  const researchSkills = [
    'research', 'phd', 'doctorate', 'postdoc', 'publication', 'journal',
    'conference', 'peer review', 'grant', 'funding', 'academia'
  ];
  
  const artsSkills = [
    'design', 'creative', 'art', 'music', 'film', 'theater', 'writing',
    'photography', 'animation', 'media', 'creative director'
  ];
  
  const allSkills = [...techSkills, ...researchSkills, ...artsSkills];
  const lowerText = text.toLowerCase();
  
  return allSkills.some(skill => lowerText.includes(skill));
}

// Helper function to estimate experience level
function estimateExperienceLevel(text) {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('senior') || lowerText.includes('lead') || 
      lowerText.includes('principal') || lowerText.includes('director') ||
      lowerText.includes('head of')) {
    return 'senior';
  }
  
  if (lowerText.includes('manager') || lowerText.includes('team lead') ||
      lowerText.includes('architect') || lowerText.includes('consultant')) {
    return 'mid-level';
  }
  
  if (lowerText.includes('junior') || lowerText.includes('graduate') ||
      lowerText.includes('intern') || lowerText.includes('entry level')) {
    return 'junior';
  }
  
  // Count years of experience mentions
  const yearMatches = text.match(/(\d+)\+?\s*years?/gi);
  if (yearMatches) {
    const years = Math.max(...yearMatches.map(match => parseInt(match)));
    if (years >= 8) return 'senior';
    if (years >= 3) return 'mid-level';
    return 'junior';
  }
  
  return 'unknown';
}

// Helper function to generate personalized message
function generatePersonalizedMessage(filename, hasRelevantSkills, experienceLevel) {
  let message = `📄 Excellent! I've analyzed your resume "${filename}". `;
  
  if (hasRelevantSkills) {
    message += "I can see you have skills relevant to the Global Talent Visa! ";
    
    switch (experienceLevel) {
      case 'senior':
        message += "With your senior-level experience, you're likely a strong candidate for the 'Exceptional Talent' route. ";
        break;
      case 'mid-level':
        message += "Your experience level suggests you might be a good fit for either 'Exceptional Promise' or 'Exceptional Talent' routes. ";
        break;
      case 'junior':
        message += "The 'Exceptional Promise' route might be perfect for someone at your career stage. ";
        break;
      default:
        message += "Based on your background, I can help determine which route (Exceptional Talent vs Promise) suits you best. ";
    }
  } else {
    message += "I'd love to learn more about your specific field to give you the most relevant advice. ";
  }
  
  message += "\n\nWhat would you like to explore first:\n• Eligibility assessment\n• Endorsing bodies for your field\n• Application strategy\n• Required evidence";
  
  return message;
}