import { FaCheck } from 'react-icons/fa'

function StepProgress({ currentStep, totalSteps }) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1)

  return (
    <div className="progress-container">
      {steps.map((step, index) => (
        <div key={step} className="progress-step">
          <div
            className={`step-circle ${step === currentStep ? 'active' :
                step < currentStep ? 'completed' : ''
              }`}
          >
            {step < currentStep ? <FaCheck /> : step}
          </div>
          {index < steps.length - 1 && (
            <div
              className={`step-line ${step < currentStep ? 'active' : ''}`}
            />
          )}
        </div>
      ))}
    </div>
  )
}

export default StepProgress
