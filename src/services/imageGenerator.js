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

