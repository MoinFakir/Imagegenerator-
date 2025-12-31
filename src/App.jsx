import { useState, useEffect } from 'react'
import VisionBoardWizard from './components/VisionBoardWizard'
import VisionBoardCanvas from './components/VisionBoardCanvas'
import VisionHistory from './components/VisionHistory'
import { generateMultipleImages, generateQuestions } from './services/imageGenerator'
import { buildGoalPrompts } from './utils/boardBuilder'
import './App.css'

function App() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    visionType: '',
    goals: [],
    quotes: [],
    customQuote: '',
    affirmation: '',
    customVisionText: '',
    timeline: ''
  })
  const [goalImages, setGoalImages] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [imageSize, setImageSize] = useState('desktop')
  const [history, setHistory] = useState([])
  const [showBoard, setShowBoard] = useState(false)
  const [availableQuotes, setAvailableQuotes] = useState([])
  const [quotesLoading, setQuotesLoading] = useState(false)
  const [questions, setQuestions] = useState([])
  const [questionsLoading, setQuestionsLoading] = useState(false)
  const [answers, setAnswers] = useState({})

  useEffect(() => {
    const savedHistory = localStorage.getItem('visionBoardHistory')
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }
  }, [])

  const handleFormChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }

      // When vision type changes, reset goals
      if (field === 'visionType') {
        newData.goals = []
      }

      return newData
    })
  }

  const handleNext = async () => {
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleGenerate = async () => {
    setIsLoading(true)
    setLoadingProgress(0)
    setShowBoard(true)
    setGoalImages({})

    try {
      // Build prompts for each goal
      const goalPrompts = buildGoalPrompts(formData.goals, formData.visionType)

      // Generate images with progress tracking
      const images = await generateMultipleImages(goalPrompts, (progress) => {
        setLoadingProgress(progress)
      })

      setGoalImages(images)

      // Compile quotes
      const allQuotes = [
        ...(formData.quotes || []),
        ...(formData.customQuote ? [formData.customQuote] : [])
      ]

      // Save to history
      const newHistoryItem = {
        id: Date.now(),
        goals: formData.goals,
        goalImages: images,
        quotes: allQuotes,
        affirmation: formData.affirmation,
        visionType: formData.visionType,
        date: new Date().toLocaleDateString()
      }
      const updatedHistory = [newHistoryItem, ...history].slice(0, 10)
      setHistory(updatedHistory)
      localStorage.setItem('visionBoardHistory', JSON.stringify(updatedHistory))
    } catch (error) {
      console.error('Error generating vision board:', error)
      alert('Failed to generate vision board. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setCurrentStep(1)
    setFormData({
      visionType: '',
      goals: [],
      quotes: [],
      customQuote: '',
      affirmation: '',
      customVisionText: '',
      timeline: ''
    })
    setGoalImages({})
    setShowBoard(false)
    setLoadingProgress(0)
  }

  const handleHistorySelect = (item) => {
    setFormData(prev => ({
      ...prev,
      goals: item.goals,
      visionType: item.visionType,
      quotes: item.quotes || [],
      affirmation: item.affirmation || ''
    }))
    setGoalImages(item.goalImages || {})
    setShowBoard(true)
  }

  // Compile all quotes for the canvas
  const allQuotes = [
    ...(formData.quotes || []),
    ...(formData.customQuote ? [formData.customQuote] : [])
  ]

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">✨ Vision Board Generator</h1>
        <p className="app-subtitle">Transform your dreams into stunning visual inspiration</p>
      </header>

      {!showBoard ? (
        <VisionBoardWizard
          currentStep={currentStep}
          formData={formData}
          onFormChange={handleFormChange}
          onNext={handleNext}
          onBack={handleBack}
          onGenerate={handleGenerate}
          imageSize={imageSize}
          onSizeChange={setImageSize}
          availableQuotes={availableQuotes}
          quotesLoading={quotesLoading}
          questions={questions}
          questionsLoading={questionsLoading}
          answers={answers}
          onAnswersChange={setAnswers}
        />
      ) : (
        <VisionBoardCanvas
          goals={formData.goals}
          quotes={allQuotes}
          affirmation={formData.affirmation}
          goalImages={goalImages}
          isLoading={isLoading}
          loadingProgress={loadingProgress}
          onRegenerate={handleGenerate}
          onReset={handleReset}
          boardStyle="grid"
          imageSize={imageSize}
        />
      )}
    </div>
  )
}

export default App
