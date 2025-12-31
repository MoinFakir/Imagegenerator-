/**
 * Build prompts for each goal in the vision board
 * @param {Array} goals - Array of goal objects
 * @param {string} visionType - Overall vision type
 * @param {string} userVision - User's detailed vision and goal description from step 3
 * @param {Object} goalQuotesMap - Object mapping goalId to unique quote string
 * @returns {Array} - Array of prompts for each goal
 */
export function buildGoalPrompts(goals, visionType, userVision = '', goalQuotesMap = {}) {
  // Default fallback quotes if goal-specific ones aren't provided
  const defaultQuotes = [
    "Dream it. Believe it. Achieve it.",
    "Your only limit is your imagination.",
    "Make it happen.",
    "The future belongs to those who believe.",
    "Success starts with a vision.",
    "Believe in yourself.",
    "You are capable of amazing things.",
    "Every day is a new opportunity."
  ]

  return goals.map((goal, index) => {
    const baseStyle = `High-end editorial photography, 8k resolution, photorealistic, cinematic lighting, vibrant and uplifting colors, sharp focus, highly detailed, professional composition`

    const negativeConstraints = `Avoid: cartoon, illustration, 3d render, drawing, painting, watermark, text overlay, blurry, distorted, dark, gloomy`

    // Get the unique quote for this specific goal (stored separately, not in image)
    const quote = goalQuotesMap[goal.id] || defaultQuotes[index % defaultQuotes.length]

    // Build the prompt with user vision as primary context
    let prompt = ''

    if (userVision && userVision.trim().length > 0) {
      // When user provides vision, make it the PRIMARY directive
      prompt = `
        Create a stunning, photorealistic image for a vision board.
        
        PRIMARY VISION (MUST FOLLOW CLOSELY):
        ${userVision}
        
        Specific Goal: ${goal.title}
        Additional Details: ${goal.description || goal.title}
        Theme: ${getVisionContext(visionType)}
        
        Style: ${baseStyle}
        
        CRITICAL INSTRUCTIONS:
        - The image MUST incorporate specific elements mentioned in the user's vision above
        - If specific objects, activities, or scenes are mentioned (like bikes, cars, beaches, etc.), they MUST be included
        - Make the image reflect the exact scenario and details described by the user
        - DO NOT include any text or quotes in the image
        
        Requirements:
        - The image must look like a real, high-quality photograph WITHOUT any text
        - Emotional tone: Uplifting, inspiring, and positive
        - MUST reflect the user's specific vision and mentioned details
        - ${negativeConstraints}
      `.replace(/\s+/g, ' ').trim()
    } else {
      // Fallback when no user vision provided
      prompt = `
        Create a stunning, photorealistic image representing: ${goal.title}.
        
        Scene Details: ${goal.description || goal.title}
        Context: ${getVisionContext(visionType)}
        
        Style: ${baseStyle}
        
        Requirements:
        - The image must look like a real, high-quality photograph WITHOUT any text
        - Emotional tone: Uplifting, inspiring, and positive
        - DO NOT include any text or quotes in the image
        - ${negativeConstraints}
      `.replace(/\s+/g, ' ').trim()
    }

    return {
      goalId: goal.id,
      prompt,
      quote // Include the quote in the return object for separate display
    }
  })
}

/**
 * Get vision-specific context for prompts
 */
function getVisionContext(visionType) {
  switch (visionType) {
    case 'money':
      return 'luxury lifestyle, wealth, abundance, financial success, prosperity'
    case 'career':
      return 'professional success, achievement, leadership, growth, recognition'
    case 'health':
      return 'wellness, vitality, fitness, balance, healthy lifestyle'
    case 'relationships':
      return 'love, connection, family, friendship, harmony'
    case 'typevision':
      return 'personal dreams, custom vision, unique goals, aspirations'
    default:
      return 'success, happiness, achievement, dream life'
  }
}

/**
 * Get layout configuration based on number of goals
 */
export function getBoardLayout(goalCount) {
  if (goalCount <= 2) {
    return {
      type: 'horizontal',
      columns: 2,
      rows: 1,
      cellAspect: '16/9'
    }
  }
  if (goalCount <= 4) {
    return {
      type: 'grid',
      columns: 2,
      rows: 2,
      cellAspect: '4/3'
    }
  }
  return {
    type: 'grid',
    columns: 3,
    rows: 2,
    cellAspect: '4/3'
  }
}

/**
 * Default quotes for vision boards
 */
export const DEFAULT_QUOTES = [
  "Dream it. Believe it. Achieve it.",
  "Your only limit is your imagination.",
  "Make it happen.",
  "The future belongs to those who believe in their dreams.",
  "Success starts with a vision."
]

/**
 * Default affirmations
 */
export const DEFAULT_AFFIRMATIONS = [
  "I am capable of achieving anything I set my mind to.",
  "I attract abundance and success into my life.",
  "Every day I am getting closer to my goals.",
  "I am worthy of all the good things coming my way.",
  "I create my own reality."
]
