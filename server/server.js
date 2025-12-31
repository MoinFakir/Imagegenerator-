const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();
app.use(cors()); // Allows your frontend to talk to this backend
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate fallback quotes dynamically using Gemini
 * @param {number} count - Number of quotes to generate
 * @param {string} context - Optional context for quote generation
 * @returns {Promise<Array<string>>} - Array of generated quotes
 */
async function generateFallbackQuotes(count = 5, context = 'motivation and success') {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp"
    });

    const prompt = `Generate exactly ${count} short, powerful, universal inspirational quotes about ${context}.

Requirements:
- Each quote should be 3-8 words maximum
- Make them motivational and positive
- Universal and timeless
- Return ONLY the quotes, one per line
- No numbering, no bullet points, no quotation marks
- No author names

Examples:
Dream it. Believe it. Achieve it.
Your journey starts today.
Make it happen.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const quotes = text
      .split('\n')
      .map(q => q.trim())
      .filter(q => q.length > 0 && q.length < 100)
      .slice(0, count);

    // If we got quotes, return them, otherwise return minimal defaults
    if (quotes.length > 0) {
      return quotes;
    }
  } catch (error) {
    console.error('Fallback quote generation error:', error);
  }

  // Ultimate fallback if even dynamic generation fails
  const minimalDefaults = [
    "Believe in yourself.",
    "Make it happen.",
    "Dream big.",
    "You are capable.",
    "Success awaits.",
    "Keep going.",
    "Stay focused.",
    "You've got this."
  ];
  return minimalDefaults.slice(0, count);
}

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

    // Generate fallback quotes dynamically
    const fallbackQuotes = await generateFallbackQuotes(6, `${visionType} and achieving goals`);

    res.status(500).json({
      success: false,
      error: error.message,
      quotes: fallbackQuotes
    });
  }
});

// Generate personalized quotes based on user's vision
app.post('/generate-vision-quotes', async (req, res) => {
  try {
    const { userVision, goals } = req.body;

    console.log('Generating quotes from user vision:', userVision);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp"
    });

    const goalTitles = goals?.map(g => g.title).join(', ') || '';

    const prompt = `Based on this person's vision and goals, generate ${goals?.length || 3} short, powerful, inspirational quotes.

User's Vision:
${userVision}

Goals: ${goalTitles}

Requirements:
- Generate exactly ${goals?.length || 3} unique quotes
- Each quote should be 3-8 words maximum
- Make them personal and specific to their vision
- Use motivational, empowering language
- Return ONLY the quotes, one per line
- No numbering, no bullet points, no extra text

Examples of good short quotes:
- Dream it. Believe it. Achieve it.
- Your journey starts today.
- Make it happen.
- Believe in yourself.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse quotes from response
    const quotes = text
      .split('\n')
      .map(q => q.trim())
      .filter(q => q.length > 0 && q.length < 100)
      .slice(0, goals?.length || 3);

    res.json({
      success: true,
      quotes: quotes
    });
  } catch (error) {
    console.error('Quote generation error:', error);

    // Generate fallback quotes dynamically
    const fallbackQuotes = await generateFallbackQuotes(goals?.length || 3, 'personal vision and dreams');

    res.status(500).json({
      success: false,
      error: error.message,
      quotes: fallbackQuotes
    });
  }
});

// Generate individual quotes for each goal
app.post('/generate-individual-quotes', async (req, res) => {
  try {
    const { goals, userVision, visionType } = req.body;

    console.log('Generating individual quotes for each goal');
    console.log('Vision Type:', visionType);
    console.log('Number of goals:', goals?.length);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp"
    });

    // Generate a unique quote for each goal
    const quotePromises = goals.map(async (goal) => {
      const prompt = `Generate ONE short, powerful, inspirational quote specifically for this goal on a vision board.

Vision Type: ${visionType}
Goal: ${goal.title}
Description: ${goal.description || goal.title}
${userVision ? `User's Vision: ${userVision}` : ''}

Requirements:
- Generate EXACTLY ONE quote (3-8 words maximum)
- Make it specific and relevant to this exact goal: "${goal.title}"
- Use motivational, empowering language
- Make it personal and actionable
- Return ONLY the quote text, nothing else
- No quotation marks, no numbering, no extra text

Examples of good short quotes:
- Dream it. Believe it. Achieve it.
- Your journey starts today.
- Make it happen.
- Success is your destiny.`;

      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();

        // Clean up the quote
        const quote = text
          .replace(/^["']|["']$/g, '') // Remove quotes
          .replace(/^\d+\.\s*/, '') // Remove numbering
          .replace(/^-\s*/, '') // Remove bullet points
          .trim();

        return {
          goalId: goal.id,
          quote: quote || "Make your dreams reality."
        };
      } catch (error) {
        console.error(`Error generating quote for goal ${goal.id}:`, error);

        // Generate a single fallback quote dynamically for this goal
        const fallback = await generateFallbackQuotes(1, `${goal.title} and success`);

        return {
          goalId: goal.id,
          quote: fallback[0] || "Believe in your dreams."
        };
      }
    });
    // Wait for all quotes to be generated
    const quotesArray = await Promise.all(quotePromises);

    // Convert to object mapping goalId -> quote
    const quotesMap = quotesArray.reduce((acc, item) => {
      acc[item.goalId] = item.quote;
      return acc;
    }, {});

    console.log('\n✅ All quotes generated successfully!');
    console.log('📋 Final quotes map:', JSON.stringify(quotesMap, null, 2));

    res.json({
      success: true,
      quotes: quotesMap
    });
  } catch (error) {
    console.error('Individual quote generation error:', error);

    // Fallback: generate dynamic quotes for each goal
    const fallbackQuotesArray = await generateFallbackQuotes(goals?.length || 6, 'achieving your dreams');
    const fallbackQuotes = {};

    goals?.forEach((goal, index) => {
      fallbackQuotes[goal.id] = fallbackQuotesArray[index % fallbackQuotesArray.length];
    });

    res.status(500).json({
      success: false,
      error: error.message,
      quotes: fallbackQuotes
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

    // Generate fallback questions dynamically
    const fallbackQuestions = await generateFallbackQuestions(3, visionType, goals);

    res.status(500).json({
      success: false,
      error: error.message,
      questions: fallbackQuestions
    });
  }
});

/**
 * Generate fallback questions dynamically
 */
async function generateFallbackQuestions(count = 3, visionType = 'personal growth', goals = []) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp"
    });

    const prompt = `Generate ${count} simple, thoughtful questions for someone creating a vision board about "${visionType}".

Requirements:
- Each question should be 10-20 words
- Make them introspective and helpful
- Return ONLY the questions, one per line
- No numbering, no bullet points

Examples:
What does success look like for you?
How will achieving this goal change your life?
What steps are you most excited to take?`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const questions = text
      .split('\n')
      .map(q => q.trim())
      .filter(q => q.length > 0 && q.includes('?'))
      .slice(0, count);

    if (questions.length > 0) {
      return questions;
    }
  } catch (error) {
    console.error('Fallback question generation error:', error);
  }

  // Ultimate fallback
  return [
    "What does success look like for you in this area?",
    "How will achieving this goal change your life?",
    "What steps are you most excited to take?"
  ];
}


// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Gemini proxy server is running' });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`🚀 Gemini proxy server running on http://localhost:${PORT}`);
  console.log('Endpoints:');
  console.log('  POST /generate-image - Generate image from prompt');
  console.log('  POST /generate-individual-quotes - Generate unique quotes for each goal');
  console.log('  POST /generate-questions - Generate personalized questions');
  console.log('  GET /health - Health check');
});
