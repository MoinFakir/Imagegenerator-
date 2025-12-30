function VisionHistory({ history, onSelect }) {
  if (!history || history.length === 0) return null

  const getVisionTypeLabel = (type) => {
    switch (type) {
      case 'money': return '💰 Money & Wealth'
      case 'career': return '💼 Career & Success'
      case 'health': return '🧘 Health & Wellness'
      case 'relationships': return '❤️ Relationships'
      case 'custom': return '🎯 Mixed Goals'
      case 'typevision': return '✏️ Custom Vision'
      default: return '✨ Vision Board'
    }
  }

  // Get the first goal image as thumbnail
  const getThumbnail = (item) => {
    if (item.goalImages) {
      const firstGoalId = item.goals?.[0]?.id
      if (firstGoalId && item.goalImages[firstGoalId]) {
        return item.goalImages[firstGoalId]
      }
      // Get the first available image
      const firstImage = Object.values(item.goalImages).find(img => img)
      if (firstImage) return firstImage
    }
    // Fallback to old structure
    if (item.imageUrl) return item.imageUrl
    return null
  }

  return (
    <section className="history-section">
      <h3 className="history-title">📜 Your Vision Board History</h3>
      <div className="history-grid">
        {history.map(item => {
          const thumbnail = getThumbnail(item)
          return (
            <div
              key={item.id}
              className="history-item"
              onClick={() => onSelect(item)}
            >
              {thumbnail ? (
                <img
                  src={thumbnail}
                  alt="Vision Board"
                  className="history-thumbnail"
                />
              ) : (
                <div className="history-thumbnail-placeholder">
                  <span>{item.goals?.[0]?.emoji || '✨'}</span>
                </div>
              )}
              <div className="history-info">
                <p className="history-type">{getVisionTypeLabel(item.visionType)}</p>
                <p className="history-goals">{item.goals?.length || 0} goals</p>
                <p className="history-date">{item.date}</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default VisionHistory
