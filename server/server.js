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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Gemini proxy server is running' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Gemini proxy server running on http://localhost:${PORT}`);
  console.log('Endpoints:');
  console.log('  POST /generate-image - Generate image from prompt');
  console.log('  GET /health - Health check');
});
