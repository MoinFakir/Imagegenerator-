import { useRef } from 'react'
import { FaDownload, FaRedo, FaHome } from 'react-icons/fa'

function VisionBoardCanvas({
  goals,
  quotes,
  affirmation,
  goalImages,
  isLoading,
  loadingProgress,
  onRegenerate,
  onReset,
  boardStyle = 'grid',
  imageSize = 'desktop'
}) {
  const canvasRef = useRef(null)

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
        <p>Generating {goals.length} images for your dreams</p>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${loadingProgress}%` }}
          ></div>
        </div>
        <span className="progress-text">{Math.round(loadingProgress)}% complete</span>
      </div>
    )
  }

  return (
    <div className="vision-board-preview">
      <div
        ref={canvasRef}
        className={`vision-board-canvas ${getGridClass()} ${imageSize}`}
      >
        {/* Title Banner */}
        <div className="board-title-banner">
          <h1 className="board-main-title">My Vision Board</h1>
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
              {/* Overlay removed - clean image display */}
            </div>
          ))}
        </div>

        {/* Quotes Section */}
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
