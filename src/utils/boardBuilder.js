/**
 * Build prompts for each goal in the vision board
 * @param {Array} goals - Array of goal objects
 * @param {string} visionType - Overall vision type
 * @returns {Array} - Array of prompts for each goal
 */
export function buildGoalPrompts(goals, visionType) {
  return goals.map(goal => {
    const baseStyle = `Ultra realistic, cinematic photography, 4K quality, bright positive mood, 
      modern aesthetic, soft dramatic lighting, inspirational atmosphere, 
      no text, no letters, no words, no watermarks, clean composition`

    const visionContext = getVisionContext(visionType)

    const prompt = `
      ${baseStyle},
      
      GOAL: ${goal.title},
      DETAILS: ${goal.description || goal.title},
      CONTEXT: ${visionContext},
      
      Create a beautiful, aspirational image representing this goal as already achieved,
      emotionally uplifting and motivating, suitable for a vision board section,
      photorealistic quality with artistic touch, single cohesive scene
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
