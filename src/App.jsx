import { useState, useEffect } from 'react'
import VisionBoardWizard from './components/VisionBoardWizard'
import VisionBoardCanvas from './components/VisionBoardCanvas'
import VisionHistory from './components/VisionHistory'
import {
  generateMultipleImages,
  generateQuestions,
  generateVisionQuotes,
  generateIndividualQuotes,
  generateVisionBoardPrompt,
  generateVisionBoardImage,
  generateVisionBoardQuote
} from './services/imageGenerator'
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
    timeline: '',
    language: ['English']
  })
  const [goalImages, setGoalImages] = useState({})
  const [collageImage, setCollageImage] = useState(null)
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
    // Load history
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
    setLoadingProgress(10) // Start progress
    setShowBoard(true)
    setGoalImages({})
    setCollageImage(null)

    try {
      // Get user's vision answer
      const userVision = answers[0] || ''

      // Fetch a dynamic quote first
      setLoadingProgress(20)
      console.log('Fetching dynamic quote...')
      const dynamicQuotes = await generateVisionBoardQuote(userVision, formData.visionType, formData.language)
      console.log('Quotes fetched:', dynamicQuotes)

      // Prepare data for prompt generation including the quote
      const visionData = {
        theme: formData.visionType,
        customVisionText: formData.customVisionText, // Add custom vision text
        goals: formData.goals, // Pass full goal objects
        timeline: formData.timeline,
        boardSize: imageSize,
        userVision: userVision,
        quotes: dynamicQuotes
      }

      setLoadingProgress(30)

      // Generate the comprehensive prompt
      console.log('Generating vision board prompt...')
      const prompt = generateVisionBoardPrompt(visionData)
      console.log('Prompt generated:', prompt)

      setLoadingProgress(50)

      // Generate the single collage image
      console.log('Calling Gemini for collage generation...')
      const imageUrl = await generateVisionBoardImage(prompt, imageSize)
      console.log('Collage generated successfully')

      setCollageImage(imageUrl)
      setLoadingProgress(100)

      // Save to history
      const newHistoryItem = {
        id: Date.now(),
        goals: formData.goals,
        collageImage: imageUrl, // Save single image
        goalImages: {}, // Empty for legacy compatibility
        imageQuotes: {},
        quotes: formData.quotes || [],
        affirmation: formData.affirmation,
        visionType: formData.visionType,
        date: new Date().toLocaleDateString()
      }

      const updatedHistory = [newHistoryItem, ...history].slice(0, 5) // Keep only last 5 to save space
      setHistory(updatedHistory)

      try {
        localStorage.setItem('visionBoardHistory', JSON.stringify(updatedHistory))
      } catch (storageError) {
        console.warn('Failed to save to history (quota exceeded):', storageError)
        // If quota exceeded, try saving just the current one or clearing old history
        try {
          // Try saving just the metadata without the heavy image
          const lightHistory = updatedHistory.map(item => ({ ...item, collageImage: null, goalImages: {} }))
          localStorage.setItem('visionBoardHistory', JSON.stringify(lightHistory))
        } catch (e) {
          console.error('Could not save history even without images', e)
        }
      }

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
    setCollageImage(null)
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
    setCollageImage(item.collageImage || null)
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
          imageQuotes={formData.imageQuotes || {}}
          affirmation={formData.affirmation}
          goalImages={goalImages}
          collageImage={collageImage}
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
