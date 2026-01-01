import { useRef, useState, useEffect } from 'react'
import { FaDownload, FaRedo, FaHome } from 'react-icons/fa'

function VisionBoardCanvas({
  goals,
  quotes,
  imageQuotes = {},
  affirmation,
  goalImages,
  isLoading,
  loadingProgress,
  onRegenerate,
  onReset,
  imageSize = 'desktop',
  collageImage
}) {
  const canvasRef = useRef(null)
  const [randomBoardStyle, setRandomBoardStyle] = useState(null)

  // Generate random style on mount
  useEffect(() => {
    const styles = [
      {
        name: 'champagne-elegant',
        border: '6px solid #d4af37',
        borderRadius: '20px',
        headerBg: 'linear-gradient(135deg, #d4af37 0%, #c9a961 100%)',
        headerText: '#2c2416'
      },
      {
        name: 'slate-modern',
        border: '5px solid #64748b',
        borderRadius: '16px',
        headerBg: 'linear-gradient(135deg, #64748b 0%, #94a3b8 100%)',
        headerText: '#ffffff'
      },
      {
        name: 'navy-professional',
        border: '6px solid #1e3a5f',
        borderRadius: '18px',
        headerBg: 'linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%)',
        headerText: '#ffffff'
      },
      {
        name: 'sage-refined',
        border: '5px solid #6b8e7f',
        borderRadius: '20px',
        headerBg: 'linear-gradient(135deg, #6b8e7f 0%, #8ba89f 100%)',
        headerText: '#1a2e25'
      },
      {
        name: 'terracotta-warm',
        border: '6px solid #b8735a',
        borderRadius: '18px',
        headerBg: 'linear-gradient(135deg, #b8735a 0%, #c98d7a 100%)',
        headerText: '#ffffff'
      },
      {
        name: 'mauve-sophisticated',
        border: '5px solid #9d8189',
        borderRadius: '22px',
        headerBg: 'linear-gradient(135deg, #9d8189 0%, #b89ba3 100%)',
        headerText: '#ffffff'
      }
    ]

    const randomStyle = styles[Math.floor(Math.random() * styles.length)]
    setRandomBoardStyle(randomStyle)
  }, [])

  const handleDownload = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    try {
      // Use html2canvas to capture the board
      const html2canvas = (await import('html2canvas')).default
      const capturedCanvas = await html2canvas(canvas, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null
      })

      const link = document.createElement('a')
      link.download = `vision-board-${Date.now()}.png`
      link.href = capturedCanvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download. Please try again.')
    }
  }

  const getGridClass = () => {
    const count = goals.length
    if (count === 1) return 'grid-1'
    if (count === 2) return 'grid-2'
    if (count === 3) return 'grid-3'
    if (count === 4) return 'grid-4'
    if (count === 5) return 'grid-5'
    if (count === 6) return 'grid-6'
    return 'grid-auto'
  }

  if (isLoading) {
    return (
      <div className="vision-board-loading">
        <div className="loading-spinner-large"></div>
        <h2>✨ Creating Your Vision Board...</h2>
        <p>Designing your professional vision board...</p>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${loadingProgress}%` }}
          ></div>
        </div>
        <span className="progress-text">Generating premium vision board...</span>
      </div>
    )
  }

  return (
    <div className="vision-board-preview">
      <div
        ref={canvasRef}
        className={`vision-board-canvas ${getGridClass()} ${imageSize}`}
        style={randomBoardStyle ? {
          border: randomBoardStyle.border,
          borderRadius: randomBoardStyle.borderRadius,
          padding: '0', // Remove padding for full-bleed collage
          overflow: 'hidden' // Ensure collage stays within bounds
        } : {}}
      >
        {collageImage ? (
          // Single Collage Image Display
          <img
            src={collageImage}
            alt="Vision Board Collage"
            className="collage-image-full"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
            crossOrigin="anonymous"
          />
        ) : (
          // Legacy Grid Display (Fallback)
          <>
            {/* Title Banner */}
            <div
              className="board-title-banner"
              style={randomBoardStyle ? {
                background: randomBoardStyle.headerBg
              } : {}}
            >
              <h1
                className="board-main-title"
                style={randomBoardStyle ? {
                  color: randomBoardStyle.headerText
                } : {}}
              >
                My Vision Board
              </h1>
              {affirmation && (
                <p className="board-affirmation">{affirmation}</p>
              )}
            </div>

            {/* Goals Grid */}
            <div className="goals-grid">
              {goals.map((goal, index) => (
                <div key={goal.id} className="goal-cell">
                  {goalImages[goal.id] ? (
                    <img
                      src={goalImages[goal.id]}
                      alt={goal.title}
                      className="goal-image"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="goal-image-placeholder">
                      <span>{goal.emoji}</span>
                    </div>
                  )}
                  {/* Display the unique quote for this image */}
                  {imageQuotes[goal.id] && (
                    <div className="image-quote-overlay">
                      <p className="image-quote-text">"{imageQuotes[goal.id]}"</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* General Quotes Section (if any) */}
            {quotes && quotes.length > 0 && (
              <div className="quotes-section">
                {quotes.map((quote, index) => (
                  <div key={index} className="quote-item">
                    <span className="quote-mark">"</span>
                    <p className="quote-text">{quote}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="board-actions">
        <button className="btn-download" onClick={handleDownload}>
          <FaDownload /> Download Vision Board
        </button>
        <button className="btn-regenerate" onClick={onRegenerate}>
          <FaRedo /> Regenerate
        </button>
        <button className="btn-start-over" onClick={onReset}>
          <FaHome /> Start Over
        </button>
      </div>
    </div>
  )
}

export default VisionBoardCanvas
