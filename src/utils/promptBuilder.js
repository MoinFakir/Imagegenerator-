/**
 * Build a detailed prompt for vision board image generation
 * @param {Object} formData - The form data from the wizard
 * @returns {string} - A detailed, optimized prompt for image generation
 */
export function buildPrompt(formData) {
  const { visionType, goalType, userDescription, moneyDetails, timeline } = formData

  // Base style and quality modifiers
  const baseStyle = `Ultra realistic, cinematic digital art, 4K quality, bright positive mood, modern aesthetic, clean composition, soft dramatic lighting, inspirational atmosphere, vision board style, no text, no letters, no words, no watermarks`

  // Timeline modifier
  const timelineModifier = getTimelineModifier(timeline)

  // Vision type specific elements
  let visionElements = ''

  switch (visionType) {
    case 'money':
      visionElements = `
        Luxury lifestyle, financial freedom, abundance and wealth visualization,
        golden tones, warm rich colors, success imagery,
        confident stress-free atmosphere, prosperity symbols,
        modern luxury home interior or exterior, high-end lifestyle,
        investment success, passive income lifestyle,
        ${moneyDetails ? moneyDetails : 'luxury car, beautiful home, financial security'}
      `
      break

    case 'career':
      visionElements = `
        Professional success, career achievement, leadership presence,
        modern executive office environment, awards and recognition,
        confident professional posture, growth-focused imagery,
        business success, corporate achievement, professional excellence,
        ambitious and accomplished atmosphere,
        ${moneyDetails ? moneyDetails : 'corner office, professional recognition, team leadership'}
      `
      break

    case 'health':
      visionElements = `
        Healthy vibrant lifestyle, wellness and fitness,
        calm peaceful environment, fit and active body,
        nature elements, mindfulness and balance,
        morning sunlight, fresh air, vitality and energy,
        meditation space, workout success, healthy living,
        ${moneyDetails ? moneyDetails : 'yoga practice, outdoor fitness, healthy meal prep'}
      `
      break

    case 'custom':
    default:
      visionElements = `
        Personal dream lifestyle, aspirational imagery,
        emotional fulfillment, life goals achieved,
        positive atmosphere, dream come true visualization,
        ${moneyDetails ? moneyDetails : 'beautiful environment, success and happiness'}
      `
      break
  }

  // Combine all elements into a comprehensive prompt
  const prompt = `
    ${baseStyle},
    
    MAIN GOAL: ${goalType},
    
    DETAILED VISION: ${userDescription},
    
    VISUAL ELEMENTS: ${visionElements},
    
    TIMELINE FEELING: ${timelineModifier},
    
    Show the end result as already achieved, future success already manifested,
    emotionally uplifting and motivating imagery,
    suitable for a vision board or desktop wallpaper,
    photorealistic quality with artistic touch
  `.replace(/\s+/g, ' ').trim()

  return prompt
}

/**
 * Get timeline-specific imagery modifiers
 */
function getTimelineModifier(timeline) {
  switch (timeline) {
    case '1month':
      return 'immediate fresh start, new beginnings, quick wins, early morning light'
    case '3months':
      return 'building momentum, growth in progress, spring energy, blossoming success'
    case '6months':
      return 'substantial progress, half-year achievements, summer abundance'
    case '1year':
      return 'major milestone achieved, annual success, full cycle completion, celebration'
    case '5years':
      return 'long-term success, established wealth, lasting achievement, legacy building'
    case 'lifetime':
      return 'ultimate life achievement, generational success, timeless prosperity, lifetime fulfillment'
    default:
      return 'success achieved, goals manifested, dreams realized'
  }
}
