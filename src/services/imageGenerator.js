/**
 * Generate a single vision board image using Gemini API via proxy server
 * @param {string} prompt - The detailed prompt for image generation
 * @param {string} size - 'desktop' or 'mobile'
 * @returns {Promise<string>} - The generated image as a data URL
 */
export async function generateVisionBoardImage(prompt, size = 'desktop') {
  const PROXY_URL = 'http://localhost:3002'

  try {
    const response = await fetch(`${PROXY_URL}/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        size: size
      })
    })

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || 'Failed to generate image')
    }

    // Return the image as a data URL
    const mimeType = data.mimeType || 'image/png'
    return `data:${mimeType};base64,${data.image}`
  } catch (error) {
    console.error('Gemini API Error:', error)
    throw error
  }
}

/**
 * Generate multiple images for vision board goals
 * @param {Array} goalPrompts - Array of {goalId, prompt} objects
 * @param {Function} onProgress - Callback for progress updates (percentage)
 * @returns {Promise<Object>} - Object mapping goalId to imageUrl
 */
export async function generateMultipleImages(goalPrompts, onProgress = () => { }) {
  const results = {}
  const total = goalPrompts.length
  let completed = 0

  // Generate images sequentially to avoid rate limiting
  for (const { goalId, prompt } of goalPrompts) {
    try {
      const imageUrl = await generateVisionBoardImage(prompt, 'desktop')
      results[goalId] = imageUrl
      completed++
      onProgress((completed / total) * 100)
    } catch (error) {
      console.error(`Failed to generate image for goal ${goalId}:`, error)
      results[goalId] = null
      completed++
      onProgress((completed / total) * 100)
    }
  }

  return results
}

/**
 * Generate images in parallel (faster but may hit rate limits)
 * @param {Array} goalPrompts - Array of {goalId, prompt} objects
 * @param {Function} onProgress - Callback for progress updates
 * @returns {Promise<Object>} - Object mapping goalId to imageUrl
 */
export async function generateImagesParallel(goalPrompts, onProgress = () => { }) {
  const total = goalPrompts.length
  let completed = 0

  const promises = goalPrompts.map(async ({ goalId, prompt }) => {
    try {
      const imageUrl = await generateVisionBoardImage(prompt, 'desktop')
      completed++
      onProgress((completed / total) * 100)
      return { goalId, imageUrl }
    } catch (error) {
      console.error(`Failed to generate image for goal ${goalId}:`, error)
      completed++
      onProgress((completed / total) * 100)
      return { goalId, imageUrl: null }
    }
  })

  const results = await Promise.all(promises)

  return results.reduce((acc, { goalId, imageUrl }) => {
    acc[goalId] = imageUrl
    return acc
  }, {})
}

/**
 * Generate inspirational quotes using Gemini based on vision type and goals
 * @param {string} visionType - The selected vision type
 * @param {Array} goals - Array of selected goals
 * @returns {Promise<Array>} - Array of quote strings
 */
export async function generateQuotes(visionType, goals) {
  const PROXY_URL = 'http://localhost:3002'

  try {
    const response = await fetch(`${PROXY_URL}/generate-quotes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        visionType: visionType,
        goals: goals
      })
    })

    const data = await response.json()

    if (data.quotes && data.quotes.length > 0) {
      return data.quotes
    }

    // Fallback quotes
    return [
      "Dream it. Believe it. Achieve it.",
      "Your only limit is your imagination.",
      "Make it happen.",
      "The future belongs to those who believe.",
      "Success starts with a vision."
    ]
  } catch (error) {
    console.error('Quote generation error:', error)
    // Return fallback quotes on error
    return [
      "Dream it. Believe it. Achieve it.",
      "Your only limit is your imagination.",
      "Make it happen.",
      "The future belongs to those who believe.",
      "Success starts with a vision."
    ]
  }
}

/**
 * Generate personalized questions using Gemini based on vision type and goals
 * @param {string} visionType - The selected vision type
 * @param {Array} goals - Array of selected goals
 * @returns {Promise<Array>} - Array of question strings
 */
export async function generateQuestions(visionType, goals) {
  const PROXY_URL = 'http://localhost:3002'

  try {
    const response = await fetch(`${PROXY_URL}/generate-questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        visionType: visionType,
        goals: goals
      })
    })

    const data = await response.json()

    if (data.questions && data.questions.length > 0) {
      return data.questions
    }

    // Fallback questions
    return [
      "What does success look like for you in this area?",
      "How will achieving this goal change your life?",
      "What steps are you most excited to take?"
    ]
  } catch (error) {
    console.error('Question generation error:', error)
    // Return fallback questions on error
    return [
      "What does success look like for you in this area?",
      "How will achieving this goal change your life?",
      "What steps are you most excited to take?"
    ]
  }
}

/**
 * Generate personalized quotes based on user's vision
 * @param {string} userVision - User's detailed vision description
 * @param {Array} goals - Array of selected goals
 * @returns {Promise<Array>} - Array of quote strings
 */
export async function generateVisionQuotes(userVision, goals) {
  const PROXY_URL = 'http://localhost:3002'

  try {
    const response = await fetch(`${PROXY_URL}/generate-vision-quotes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userVision: userVision,
        goals: goals
      })
    })

    const data = await response.json()

    if (data.quotes && data.quotes.length > 0) {
      return data.quotes
    }

    // Fallback quotes
    return [
      "Dream it. Believe it. Achieve it.",
      "Make it happen.",
      "Your journey starts now."
    ]
  } catch (error) {
    console.error('Vision quote generation error:', error)
    return [
      "Dream it. Believe it. Achieve it.",
      "Make it happen.",
      "Your journey starts now."
    ]
  }
}

/**
 * Generate individual quotes for each goal
 * @param {Array} goals - Array of goal objects with id, title, description
 * @param {string} userVision - User's detailed vision description
 * @param {string} visionType - The selected vision type
 * @returns {Promise<Object>} - Object mapping goalId to quote string
 */
export async function generateIndividualQuotes(goals, userVision, visionType) {
  const PROXY_URL = 'http://localhost:3002'  // Use local server
  console.log('🎯 Calling local server to generate individual quotes...')

  try {
    const response = await fetch(`${PROXY_URL}/generate-individual-quotes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        goals: goals,
        userVision: userVision,
        visionType: visionType
      })
    })

    const data = await response.json()

    console.log('✅ Received quotes from server:', data)

    if (data.quotes && Object.keys(data.quotes).length > 0) {
      return data.quotes
    }

    // Fallback: create basic quotes for each goal
    const fallbackQuotes = {}
    const defaultQuotes = [
      "Dream it. Believe it. Achieve it.",
      "Make it happen.",
      "Your journey starts now.",
      "Success is yours.",
      "Believe in yourself.",
      "You are unstoppable."
    ]

    goals.forEach((goal, index) => {
      fallbackQuotes[goal.id] = defaultQuotes[index % defaultQuotes.length]
    })

    return fallbackQuotes
  } catch (error) {
    console.error('Individual quote generation error:', error)

    // Fallback: create basic quotes for each goal
    const fallbackQuotes = {}
    const defaultQuotes = [
      "Dream it. Believe it. Achieve it.",
      "Make it happen.",
      "Your journey starts now.",
      "Success is yours.",
      "Believe in yourself.",
      "You are unstoppable."
    ]

    goals.forEach((goal, index) => {
      fallbackQuotes[goal.id] = defaultQuotes[index % defaultQuotes.length]
    })

    return fallbackQuotes
  }
}

// Vision Board Prompt Generation Maps
const THEME_MAP = {
  career: "Professional career advancement and leadership excellence",
  wealth: "Financial abundance, luxury lifestyle, and wealth creation",
  health: "Optimal health, fitness, wellness, and vitality",
  relationships: "Deep meaningful connections, love, and harmonious relationships",
  personal: "Personal growth, self-improvement, and inner transformation",
  travel: "Global adventures, exploration, and cultural experiences",
  creativity: "Artistic expression, innovation, and creative mastery",
  education: "Knowledge acquisition, learning, and academic achievement",
  spirituality: "Spiritual awakening, mindfulness, and inner peace",
  business: "Entrepreneurial success, business empire, and market leadership"
}

const GOAL_MAP = {
  // Career goals
  promotion: "climbing the corporate ladder to executive positions",
  leadership: "becoming an influential leader and mentor",
  skills: "mastering new professional skills and expertise",
  networking: "building powerful professional networks",

  // Wealth goals
  investment: "smart investments and passive income streams",
  luxury: "luxury lifestyle with premium possessions (mansion, sports car, private jet)",
  savings: "substantial savings and financial security",
  empire: "building a financial empire and generational wealth",

  // Health goals
  fitness: "achieving peak physical fitness and athletic performance",
  nutrition: "optimal nutrition and healthy lifestyle",
  energy: "boundless energy and vitality",
  longevity: "longevity and vibrant aging",

  // Relationship goals
  romance: "deep romantic love and partnership",
  family: "strong family bonds and quality time",
  friendship: "meaningful friendships and social connections",
  community: "community involvement and positive impact",

  // Personal goals
  confidence: "unshakeable confidence and self-belief",
  mindset: "growth mindset and mental resilience",
  habits: "powerful daily habits and routines",
  purpose: "discovering and living life purpose",

  // Travel goals
  destinations: "visiting dream destinations worldwide",
  adventure: "thrilling adventures and experiences",
  culture: "immersing in diverse cultures",
  freedom: "location independence and travel freedom",

  // Creativity goals
  art: "creating impactful art and creative works",
  innovation: "pioneering innovations and breakthroughs",
  expression: "authentic self-expression and artistry",
  mastery: "mastering creative crafts and techniques",

  // Education goals
  degree: "earning advanced degrees and certifications",
  knowledge: "acquiring deep knowledge and wisdom",
  teaching: "sharing knowledge and mentoring others",
  research: "conducting groundbreaking research",

  // Spirituality goals
  meditation: "deep meditation and mindfulness practice",
  awakening: "spiritual awakening and enlightenment",
  peace: "inner peace and emotional balance",
  connection: "connection to higher consciousness",

  // Business goals
  startup: "launching successful startups and ventures",
  growth: "scaling business to new heights",
  impact: "creating positive global impact",
  innovation: "disrupting industries with innovation"
}

const TIMELINE_MAP = {
  "3months": "Short-term sprint: immediate action and quick wins within 90 days",
  "6months": "Mid-term focus: building momentum over the next half year",
  "1year": "Annual vision: transformative changes within 12 months",
  "3years": "Long-term mastery: strategic planning for 3-year horizon",
  "5years": "Legacy building: creating lasting impact over 5 years"
}

const SIZE_MAP = {
  desktop: "landscape orientation, 16:9 aspect ratio, high resolution suitable for desktop wallpaper",
  mobile: "portrait orientation, 9:16 aspect ratio, optimized for mobile screens"
}

/**
 * Generate a detailed prompt for vision board collage creation
 * @param {Object} data - Vision board data containing theme, goals, timeline, size, and user vision
 * @returns {string} - Detailed prompt for image generation
 */
export function generateVisionBoardPrompt(data) {
  const themeText = THEME_MAP[data.theme] || data.theme
  const goalsText = data.goals.map(g => {
    // If g is an object, use its title or fallback to id
    const key = typeof g === 'object' ? (g.title || g.id) : g

    // Try to find in map, otherwise use the key/title itself
    // Clean key (lowercase) for map lookup
    const mapKey = String(key).toLowerCase().split(' ')[0]

    return GOAL_MAP[mapKey] || GOAL_MAP[key] || (typeof g === 'object' ? (g.description || g.title) : g)
  }).join(", ")
  const timelineText = TIMELINE_MAP[data.timeline] || data.timeline
  const sizeText = SIZE_MAP[data.boardSize] || SIZE_MAP.desktop

  const userText = data.userVision
    ? `Personal vision statement: "${data.userVision}"`
    : ""
  const quoteText = data.quote || "SUCCESS"

  // Determine color scheme based on theme
  let colorScheme = ""
  if (data.theme === "wealth" || data.theme === "business") {
    colorScheme = "Luxurious color palette: deep blacks, rich golds, warm browns, elegant whites"
  } else if (data.theme === "career") {
    colorScheme = "Professional color palette: clean whites, corporate blues, modern grays, accent golds"
  } else if (data.theme === "health") {
    colorScheme = "Vibrant color palette: energetic greens, fresh blues, pure whites, natural earth tones"
  } else if (data.theme === "spirituality") {
    colorScheme = "Serene color palette: calming purples, peaceful blues, soft whites, gentle pastels"
  } else {
    colorScheme = "Harmonious color palette with balanced, aesthetically pleasing tones"
  }

  return `
A high-resolution, professional vision board collage in a grid layout, featuring a sophisticated color palette of ${colorScheme}. The aesthetic is 'Modern Executive' and 'Luxury Achievement.'

The layout must include:
1. Centerpiece: A high-impact image representing ${themeText}.
2. Professional Milestones: Images of ${goalsText}.
3. Inspiration: A clean, minimalist graphic with the quote "${quoteText}" in large, bold, elegant typography.
4. Personal Identity: A professional figure that looks like: "${userText}", reflecting a 'Success' mindset.
5. Lifestyle Rewards: High-end imagery matching the theme of ${data.theme} (e.g., luxury travel, premium lifestyle).
6. Wellness & Discipline: A minimalist shot representing focus, discipline, and ${timelineText}.

Style Requirements: Cinematic lighting, sharp focus, consistent color grading across all panels.
TEXT POLICY: Text should appear ONLY in the dedicated "Inspiration" panel. Render the quote "${quoteText}" clearly. All other images must remain text-free.
8k resolution, photorealistic style, UHD, Raw Photo, Fujifilm GFX 100 type quality.


Full-bleed digital art, NO BORDERS, NO FRAMES, NO WALLS, NO ROOMBACKGROUND.
This is a direct digital export of the design, NOT a mockup of a screen or poster.
The image should extend to the very edges of the canvas.
Flat 2D composition, high fidelity digital graphic design.
`.trim()
}

/**
 * Generate a single quote for the vision board based on user vision
 * @param {string} userVision - The user's vision text
 * @param {string} theme - The selected theme
 * @returns {Promise<string>} - A single quote string
 */
export async function generateVisionBoardQuote(userVision, theme) {
  const PROXY_URL = 'http://localhost:3002'
  const fallbackQuote = "Dream it. Believe it. Achieve it."

  try {
    const response = await fetch(`${PROXY_URL}/generate-vision-quotes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userVision: userVision || `My vision for ${theme}`,
        goals: [] // We just want one general quote
      })
    })

    const data = await response.json()
    if (data.quotes && data.quotes.length > 0) {
      return data.quotes[0]
    }
    return fallbackQuote
  } catch (error) {
    console.error('Error fetching quote:', error)
    return fallbackQuote
  }
}



