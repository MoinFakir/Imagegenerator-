import { FaDownload, FaRedo, FaHome, FaDesktop, FaMobileAlt } from 'react-icons/fa'

function ImagePreview({
  imageUrl,
  isLoading,
  onReset,
  imageSize,
  onSizeChange,
  onRegenerate
}) {

  const handleDownload = async () => {
    if (!imageUrl) return

    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `vision-board-${Date.now()}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
      // Fallback: open image in new tab
      window.open(imageUrl, '_blank')
    }
  }

  return (
    <div className="image-preview-section">
      <div className="image-container">
        {isLoading ? (
          <div className="loader-container">
            <div className="loader"></div>
            <p className="loader-text">✨ Manifesting your vision...</p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
              This may take 15-30 seconds
            </p>
          </div>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt="Generated Vision Board"
            className="generated-image"
          />
        ) : (
          <div className="loader-container">
            <p className="loader-text">Something went wrong. Please try again.</p>
          </div>
        )}
      </div>

      {!isLoading && imageUrl && (
        <>
          <div className="size-options">
            <button
              className={`size-btn ${imageSize === 'desktop' ? 'active' : ''}`}
              onClick={() => onSizeChange('desktop')}
            >
              <FaDesktop /> Desktop
            </button>
            <button
              className={`size-btn ${imageSize === 'mobile' ? 'active' : ''}`}
              onClick={() => onSizeChange('mobile')}
            >
              <FaMobileAlt /> Mobile
            </button>
          </div>

          <div className="btn-group" style={{ marginTop: '1.5rem' }}>
            <button className="download-btn" onClick={handleDownload}>
              <FaDownload /> Download Image
            </button>
            <button className="btn-secondary" onClick={onRegenerate}>
              <FaRedo /> Regenerate
            </button>
            <button className="btn-secondary" onClick={onReset}>
              <FaHome /> Start Over
            </button>
          </div>
        </>
      )}

      {!isLoading && !imageUrl && (
        <div className="btn-group" style={{ marginTop: '1.5rem' }}>
          <button className="btn-secondary" onClick={onReset}>
            <FaHome /> Start Over
          </button>
        </div>
      )}
    </div>
  )
}

export default ImagePreview
