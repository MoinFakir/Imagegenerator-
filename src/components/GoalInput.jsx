import { useState } from 'react'
import { FaPlus, FaCheck } from 'react-icons/fa'

// All available goals organized by category
const ALL_GOALS = {
  money: [
    { emoji: '💰', title: 'Financial Freedom', description: 'Achieve complete financial independence' },
    { emoji: '🏠', title: 'Dream Home', description: 'Own a beautiful luxury home' },
    { emoji: '🚗', title: 'Luxury Car', description: 'Drive my dream car' },
    { emoji: '✈️', title: 'Travel the World', description: 'First-class travel experiences' },
    { emoji: '💎', title: 'Luxury Lifestyle', description: 'Live in abundance and luxury' },
    { emoji: '📈', title: 'Investments', description: 'Build a strong investment portfolio' },
    { emoji: '💵', title: 'Passive Income', description: 'Earn money while I sleep' },
    { emoji: '🏦', title: 'Savings', description: 'Build substantial savings' }
  ],
  career: [
    { emoji: '💼', title: 'Leadership Role', description: 'Become a top executive' },
    { emoji: '🏆', title: 'Recognition', description: 'Win industry awards' },
    { emoji: '📈', title: 'Business Success', description: 'Grow my business/career' },
    { emoji: '🎓', title: 'Expertise', description: 'Become an expert in my field' },
    { emoji: '🚀', title: 'Startup Success', description: 'Launch a successful startup' },
    { emoji: '🤝', title: 'Networking', description: 'Build powerful connections' },
    { emoji: '💡', title: 'Innovation', description: 'Create something revolutionary' },
    { emoji: '👨‍💻', title: 'Dream Job', description: 'Land my perfect position' }
  ],
  health: [
    { emoji: '💪', title: 'Peak Fitness', description: 'Achieve my ideal body' },
    { emoji: '🧘', title: 'Inner Peace', description: 'Daily meditation practice' },
    { emoji: '🥗', title: 'Healthy Eating', description: 'Clean eating habits' },
    { emoji: '🏃', title: 'Active Life', description: 'Run marathons or sports' },
    { emoji: '😴', title: 'Quality Sleep', description: 'Perfect sleep routine' },
    { emoji: '🧠', title: 'Mental Clarity', description: 'Sharp and focused mind' },
    { emoji: '⚡', title: 'High Energy', description: 'Boundless energy daily' },
    { emoji: '🌿', title: 'Wellness', description: 'Complete mind-body wellness' }
  ],
  relationships: [
    { emoji: '❤️', title: 'True Love', description: 'Find or deepen love' },
    { emoji: '👨‍👩‍👧‍👦', title: 'Happy Family', description: 'Strong family bonds' },
    { emoji: '🤝', title: 'True Friends', description: 'Deep meaningful friendships' },
    { emoji: '🌟', title: 'Social Impact', description: 'Help and inspire others' },
    { emoji: '💑', title: 'Perfect Partner', description: 'Ideal romantic relationship' },
    { emoji: '👶', title: 'Parenthood', description: 'Start or grow a family' },
    { emoji: '🏡', title: 'Home Life', description: 'Harmonious home environment' },
    { emoji: '💝', title: 'Self Love', description: 'Deep self-acceptance' }
  ],
  custom: [
    { emoji: '🎯', title: 'Personal Goal', description: 'My unique dream' },
    { emoji: '⭐', title: 'Achievement', description: 'Something I want to achieve' },
    { emoji: '🌈', title: 'Dream Life', description: 'My perfect life vision' },
    { emoji: '🎨', title: 'Creative Goal', description: 'Express my creativity' },
    { emoji: '📚', title: 'Learning', description: 'Master new skills' },
    { emoji: '🌍', title: 'Adventure', description: 'Explore and experience' },
    { emoji: '🏅', title: 'Success', description: 'Achieve my definition of success' },
    { emoji: '✨', title: 'Magic', description: 'Make the impossible possible' }
  ]
}

function GoalInput({ goals, onGoalsChange, maxGoals = 6, visionType = 'custom' }) {
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customGoal, setCustomGoal] = useState({ emoji: '🎯', title: '', description: '' })

  // Get available goals based on vision type
  const availableGoals = ALL_GOALS[visionType] || ALL_GOALS.custom

  const isGoalSelected = (goal) => {
    return goals.some(g => g.title === goal.title)
  }

  const toggleGoal = (goal) => {
    if (isGoalSelected(goal)) {
      // Remove goal
      onGoalsChange(goals.filter(g => g.title !== goal.title))
    } else {
      // Add goal (no limit)
      onGoalsChange([...goals, { ...goal, id: Date.now() + Math.random() * 1000 }])
    }
  }

  const addCustomGoal = () => {
    if (customGoal.title.trim()) {
      onGoalsChange([...goals, { ...customGoal, id: Date.now() }])
      setCustomGoal({ emoji: '🎯', title: '', description: '' })
      setShowCustomInput(false)
    }
  }

  const removeGoal = (id) => {
    onGoalsChange(goals.filter(g => g.id !== id))
  }

  return (
    <div className="goals-container">
      <div className="goals-header">
        <h3>Select Your Goals</h3>
        <span className="goal-count">{goals.length} selected</span>
      </div>

      {/* Available Goals Grid */}
      <div className="goals-selection-grid">
        {availableGoals.map((goal, index) => (
          <div
            key={index}
            className={`goal-select-card ${isGoalSelected(goal) ? 'selected' : ''}`}
            onClick={() => toggleGoal(goal)}
          >
            <span className="goal-select-emoji">{goal.emoji}</span>
            <span className="goal-select-title">{goal.title}</span>
            {isGoalSelected(goal) && (
              <span className="goal-check"><FaCheck /></span>
            )}
          </div>
        ))}
      </div>

      {/* Add Custom Goal Button */}
      {goals.length < maxGoals && (
        <>
          {!showCustomInput ? (
            <button className="add-custom-goal-btn" onClick={() => setShowCustomInput(true)}>
              <FaPlus /> Add Custom Goal
            </button>
          ) : (
            <div className="custom-goal-input">
              <input
                type="text"
                className="goal-title-input"
                placeholder="Custom goal title..."
                value={customGoal.title}
                onChange={(e) => setCustomGoal({ ...customGoal, title: e.target.value })}
              />
              <input
                type="text"
                className="goal-desc-input"
                placeholder="Brief description..."
                value={customGoal.description}
                onChange={(e) => setCustomGoal({ ...customGoal, description: e.target.value })}
              />
              <div className="custom-goal-actions">
                <button className="btn-add-custom" onClick={addCustomGoal} disabled={!customGoal.title.trim()}>
                  Add Goal
                </button>
                <button className="btn-cancel-custom" onClick={() => setShowCustomInput(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default GoalInput
