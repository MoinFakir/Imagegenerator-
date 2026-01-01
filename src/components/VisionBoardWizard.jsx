import { FaArrowRight, FaArrowLeft, FaMagic, FaDesktop, FaMobileAlt } from 'react-icons/fa'
import StepProgress from './StepProgress'
import GoalInput from './GoalInput'
import { DEFAULT_QUOTES, DEFAULT_AFFIRMATIONS } from '../utils/boardBuilder'

const VISION_TYPES = [
  {
    id: 'money',
    icon: '💰',
    title: 'Money & Wealth',
    desc: 'Financial freedom, abundance, luxury lifestyle',
    color: '#ffd700'
  },
  {
    id: 'career',
    icon: '💼',
    title: 'Career & Success',
    desc: 'Professional growth, achievements, leadership',
    color: '#667eea'
  },
  {
    id: 'health',
    icon: '🧘',
    title: 'Health & Wellness',
    desc: 'Fitness, mindfulness, balanced lifestyle',
    color: '#00d4aa'
  },
  {
    id: 'relationships',
    icon: '❤️',
    title: 'Relationships',
    desc: 'Love, family, meaningful connections',
    color: '#ff6b9d'
  },
  {
    id: 'custom',
    icon: '🎯',
    title: 'Mixed Goals',
    desc: 'Combine different life areas',
    color: '#f093fb'
  },
  {
    id: 'typevision',
    icon: '✏️',
    title: 'Type Your Vision',
    desc: 'Write your own custom vision',
    color: '#00bcd4'
  }
]

function VisionBoardWizard({
  currentStep,
  formData,
  onFormChange,
  onNext,
  onBack,
  onGenerate,
  imageSize,
  onSizeChange,
  availableQuotes = [],
  quotesLoading = false,
  questions = [],
  questionsLoading = false,
  answers = {},
  onAnswersChange
}) {

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        // If typevision is selected, require the custom text
        if (formData.visionType === 'typevision') {
          return formData.customVisionText && formData.customVisionText.trim().length > 10
        }
        return formData.visionType !== ''
      case 2: return formData.goals.length >= 1
      case 3: return Object.keys(answers).length >= 1 // At least 1 answer required
      case 4: return formData.timeline !== '' // Timeline is required
      case 5: return true // Size selection is optional
      default: return false
    }
  }

  const handleQuoteToggle = (quote) => {
    const current = formData.quotes || []
    if (current.includes(quote)) {
      onFormChange('quotes', current.filter(q => q !== quote))
    } else {
      // No limit - add quote
      onFormChange('quotes', [...current, quote])
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <h2 className="step-title">What's your primary focus?</h2>
            <p className="step-subtitle">Choose the main theme for your vision board</p>
            <div className="vision-type-grid">
              {VISION_TYPES.map(type => {
                const isSelected = formData.visionType === type.id
                const isTypeVision = type.id === 'typevision'

                return (
                  <div
                    key={type.id}
                    className={`vision-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => onFormChange('visionType', type.id)}
                  >
                    {isTypeVision && isSelected ? (
                      <textarea
                        className="custom-textarea card-embedded-textarea"
                        placeholder="Type your dream..."
                        value={formData.customVisionText || ''}
                        onChange={(e) => onFormChange('customVisionText', e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                    ) : (
                      <>
                        <span className="vision-icon">{type.icon}</span>
                        <h3 className="vision-title">{type.title}</h3>
                        <p className="vision-desc">{type.desc}</p>
                      </>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Show text input when Type Your Vision is selected */}
            {/* Removed external input block */}
          </div>
        )

      case 2:
        return (
          <div className="step-content">
            <h2 className="step-title">Select Your Goals</h2>
            {/* <p className="step-subtitle">
              Choose 2-6 goals for your vision board (each will get its own image)
            </p> */}
            <GoalInput
              goals={formData.goals}
              onGoalsChange={(goals) => onFormChange('goals', goals)}
              maxGoals={6}
              visionType={formData.visionType}
            />
          </div>
        )

      case 3:
        return (
          <div className="step-content">
            <h2 className="step-title">Tell Me More</h2>
            <p className="step-subtitle">Share your vision and goals in detail</p>

            <div className="form-section">
              <label className="form-label">✨ Tell me more about your vision and goal</label>
              <textarea
                className="custom-textarea"
                placeholder="Describe your vision, what you want to achieve, how it will make you feel, and what success looks like to you..."
                value={answers[0] || ''}
                onChange={(e) => {
                  const newAnswers = { ...answers, 0: e.target.value }
                  onAnswersChange(newAnswers)
                }}
                rows={8}
              />
            </div>

            <div className="form-section">
              <label className="form-label">🗣️ Quote Language</label>
              <div className="language-grid">
                {['English', 'Hindi', 'Marathi'].map(lang => {
                  const isSelected = Array.isArray(formData.language)
                    ? formData.language.includes(lang)
                    : formData.language === lang;

                  return (
                    <div
                      key={lang}
                      className={`language-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        let currentLangs = Array.isArray(formData.language) ? [...formData.language] : [formData.language];

                        if (currentLangs.includes(lang)) {
                          // Allow removing only if it's not the last one
                          if (currentLangs.length > 1) {
                            currentLangs = currentLangs.filter(l => l !== lang);
                          }
                        } else {
                          currentLangs.push(lang);
                        }
                        onFormChange('language', currentLangs);
                      }}
                    >
                      <div className="custom-checkbox">
                        <i>✓</i>
                      </div>
                      <span className="language-name">{lang}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )

      case 4:
        const TIMELINE_OPTIONS = [
          { id: '1month', label: '1 Month', icon: '🌱' },
          { id: '3months', label: '3 Months', icon: '🌿' },
          { id: '6months', label: '6 Months', icon: '🌳' },
          { id: '1year', label: '1 Year', icon: '⭐' },
          { id: '5years', label: '5 Years', icon: '🏆' },
          { id: 'lifetime', label: 'Lifetime', icon: '👑' }
        ]

        return (
          <div className="step-content">
            <h2 className="step-title">Set Your Timeline</h2>
            <p className="step-subtitle">When do you want to achieve these goals?</p>

            <div className="form-section">
              <label className="form-label">📅 Choose your timeline</label>
              <div className="timeline-grid">
                {TIMELINE_OPTIONS.map(option => (
                  <div
                    key={option.id}
                    className={`timeline-option ${formData.timeline === option.id ? 'selected' : ''}`}
                    onClick={() => onFormChange('timeline', option.id)}
                  >
                    <span className="timeline-icon">{option.icon}</span>
                    <span className="timeline-label">{option.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 5:
        const TIMELINE_LABELS = {
          '1month': '1 Month',
          '3months': '3 Months',
          '6months': '6 Months',
          '1year': '1 Year',
          '5years': '5 Years',
          'lifetime': 'Lifetime'
        }

        return (
          <div className="step-content">
            <h2 className="step-title">Final Settings</h2>
            <p className="step-subtitle">Choose your vision board size and review</p>

            <div className="form-section">
              <label className="form-label">📐 Vision Board Size</label>
              <div className="size-options-large">
                <button
                  className={`size-option-card ${imageSize === 'desktop' ? 'active' : ''}`}
                  onClick={() => onSizeChange('desktop')}
                >
                  <FaDesktop className="size-icon" />
                  <span className="size-label">Desktop</span>
                  <span className="size-dimensions">1920 × 1080</span>
                </button>
                <button
                  className={`size-option-card ${imageSize === 'mobile' ? 'active' : ''}`}
                  onClick={() => onSizeChange('mobile')}
                >
                  <FaMobileAlt className="size-icon" />
                  <span className="size-label">Mobile</span>
                  <span className="size-dimensions">1080 × 1920</span>
                </button>
              </div>
            </div>

            <div className="summary-section">
              <h3>📋 Summary</h3>
              <div className="summary-item">
                <span>Theme:</span>
                <strong>{VISION_TYPES.find(t => t.id === formData.visionType)?.title}</strong>
              </div>
              <div className="summary-item">
                <span>Goals:</span>
                <strong>{formData.goals.length} items</strong>
              </div>
              <div className="summary-item">
                <span>Timeline:</span>
                <strong>{TIMELINE_LABELS[formData.timeline] || 'Not set'}</strong>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="wizard-container">
      <StepProgress currentStep={currentStep} totalSteps={5} />

      {renderStep()}

      <div className="btn-group">
        {currentStep > 1 && (
          <button className="btn-secondary" onClick={onBack}>
            <FaArrowLeft /> Back
          </button>
        )}

        {currentStep < 5 ? (
          <button
            className="btn-primary-gold"
            onClick={onNext}
            disabled={!canProceed()}
          >
            Continue <FaArrowRight />
          </button>
        ) : (
          <button
            className="btn-primary-gold generate-btn"
            onClick={onGenerate}
            disabled={!canProceed()}
          >
            <FaMagic /> Generate Vision Board
          </button>
        )}
      </div>
    </div>
  )
}

export default VisionBoardWizard
