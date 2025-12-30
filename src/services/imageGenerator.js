/**
 * Generate a single vision board image using Gemini API via proxy server
 * @param {string} prompt - The detailed prompt for image generation
 * @param {string} size - 'desktop' or 'mobile'
 * @returns {Promise<string>} - The generated image as a data URL
 */
export async function generateVisionBoardImage(prompt, size = 'desktop') {
  const PROXY_URL = 'http://localhost:3001'

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
  const PROXY_URL = 'http://localhost:3001'

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

