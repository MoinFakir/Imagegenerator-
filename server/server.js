const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();
app.use(cors()); // Allows your frontend to talk to this backend
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/generate-image', async (req, res) => {
  try {
    const { prompt, size } = req.body;

    console.log('Generating image with prompt:', prompt);
    console.log('Size:', size);

    // Use Gemini 2.0 Flash with image generation capability
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        responseModalities: ["image", "text"],
      }
    });

    // Add size guidance to the prompt
    const sizeGuide = size === 'mobile'
      ? 'Create a vertical/portrait oriented image suitable for a phone wallpaper.'
      : 'Create a horizontal/landscape oriented image suitable for a desktop wallpaper.';

    const fullPrompt = `${prompt}\n\n${sizeGuide}`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;

    // Extract the Base64 image data from the response
    const parts = response.candidates[0].content.parts;
    const imageData = parts.find(p => p.inlineData);

    if (imageData && imageData.inlineData) {
      res.json({
        success: true,
        image: imageData.inlineData.data,
        mimeType: imageData.inlineData.mimeType || 'image/png'
      });
    } else {
      // If no image, return the text response
      const textPart = parts.find(p => p.text);
      res.status(400).json({
        success: false,
        error: textPart ? textPart.text : 'No image generated'
      });
    }
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Generate quotes based on vision type and goals
app.post('/generate-quotes', async (req, res) => {
  try {
    const { visionType, goals } = req.body;

    console.log('Generating quotes for:', visionType);
    console.log('Goals:', goals);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp"
    });

    const goalTitles = goals?.map(g => g.title).filter(t => t).join(', ') || 'success and happiness';

    const prompt = `Generate exactly 6 short, powerful inspirational quotes for a vision board about "${visionType}" with goals like: ${goalTitles}.

Requirements:
- Each quote should be maximum 10 words
- Make them motivational and positive
- Related to achieving dreams and goals
- Do NOT include author names
- Return ONLY the quotes, one per line
- No numbering, no bullet points, no quotes marks

Example format:
Your dreams are worth the effort
Success begins with believing in yourself
Every day brings new opportunities`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse quotes from response
    const quotes = text
      .split('\n')
      .map(q => q.trim())
      .filter(q => q.length > 0 && q.length < 100)
      .slice(0, 8); // Get up to 8 quotes

    res.json({
      success: true,
      quotes: quotes
    });
  } catch (error) {
    console.error('Quote generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      quotes: [
        "Dream it. Believe it. Achieve it.",
        "Your only limit is your imagination.",
        "Make it happen.",
        "The future belongs to those who believe.",
        "Success starts with a vision."
      ]
    });
  }
});

// Generate personalized questions based on vision type and goals
app.post('/generate-questions', async (req, res) => {
  try {
    const { visionType, goals } = req.body;

    console.log('Generating questions for:', visionType);
    console.log('Goals:', goals);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp"
    });

    const goalTitles = goals?.map(g => g.title).filter(t => t).join(', ') || 'personal growth';
    const goalDetails = goals?.map(g => `${g.emoji} ${g.title}: ${g.description || ''}`).join('\n') || '';

    const prompt = `You are helping someone create a vision board for "${visionType}". 

Their specific goals are:
${goalDetails}

Generate exactly 3 unique, deep, thought-provoking questions that will help them clarify their vision and dreams.

IMPORTANT REQUIREMENTS:
- Each question MUST be different and unique
- Questions should be SPECIFIC to their vision type "${visionType}" and their individual goals
- Ask about their vision, feelings, ideal outcomes, and what success looks like
- Make questions personal and introspective
- Each question should be 12-25 words
- Focus on visualization and emotional connection
- Return ONLY the questions, one per line
- No numbering, no bullet points, no extra text

Examples of GOOD questions for different vision types:
- For Money/Wealth: "Describe your ideal lifestyle when you achieve financial freedom - where do you live and what does your day look like?"
- For Health: "How will your body feel and what activities will you enjoy when you reach your peak fitness?"
- For Career: "What recognition and achievements will make you feel most proud in your professional journey?"

Now generate 3 unique questions specifically for "${visionType}" with goals: ${goalTitles}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse questions from response
    const questions = text
      .split('\n')
      .map(q => q.trim())
      .filter(q => q.length > 0 && q.includes('?'))
      .slice(0, 3); // Get exactly 3 questions

    res.json({
      success: true,
      questions: questions
    });
  } catch (error) {
    console.error('Question generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      questions: [
        "What does success look like for you in this area?",
        "How will achieving this goal change your life?",
        "What steps are you most excited to take?"
      ]
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Gemini proxy server is running' });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`🚀 Gemini proxy server running on http://localhost:${PORT}`);
  console.log('Endpoints:');
  console.log('  POST /generate-image - Generate image from prompt');
  console.log('  POST /generate-questions - Generate personalized questions');
  console.log('  GET /health - Health check');
});
