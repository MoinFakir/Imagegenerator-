/**
 * Build prompts for each goal in the vision board
 * @param {Array} goals - Array of goal objects
 * @param {string} visionType - Overall vision type
 * @returns {Array} - Array of prompts for each goal
 */
export function buildGoalPrompts(goals, visionType) {
  // Inspirational quotes to embed in images
  const quotes = [
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

    const negativeConstraints = `Avoid: cartoon, illustration, 3d render, drawing, painting, watermark, blurry, distorted, dark, gloomy`

    const visionContext = getVisionContext(visionType)

    // Select a quote for this goal (cycle through quotes)
    const quote = quotes[index % quotes.length]

    const prompt = `
      Create a stunning, photorealistic image representing: ${goal.title}.
      
      Scene Details: ${goal.description || goal.title}
      Context: ${visionContext}
      
      Style: ${baseStyle}
      
      IMPORTANT: Include this inspirational text overlaid on the image in elegant typography:
      "${quote}"
      
      The text should be:
      - Positioned prominently (bottom third or center of image)
      - White or gold color with subtle shadow for readability
      - Elegant, modern font
      - Integrated naturally into the composition
      
      Requirements:
      - The image must look like a real, high-quality photograph with motivational text overlay.
      - Emotional tone: Uplifting, inspiring, and positive.
      - ${negativeConstraints}
    `.replace(/\s+/g, ' ').trim()

    return {
      goalId: goal.id,
      prompt
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
