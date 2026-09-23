import { GEMINI_MODELS, MODEL_LABELS } from '../../../constants/models'
import { useModelSelector } from './hooks'
import { useState } from 'react'
import { Icon } from '@iconify/react'

export default function ModelSelector() {
  const { selectedModel, generationConfig, systemInstruction, handleSelectModel, handleTempChange, handleTopPChange, handleStreamingToggle } = useModelSelector()
  const [open, setOpen] = useState(false)

  return (
    <div className="model-selector">
      <button
        className="model-badge"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select model"
      >
        <span>{MODEL_LABELS[selectedModel] || selectedModel}</span>
        <Icon icon={open ? 'mdi:chevron-up' : 'mdi:chevron-down'} height={18} />
      </button>
      {open && (
        <div className="model-dropdown" role="listbox" onKeyDown={e => e.key === 'Escape' && setOpen(false)}>
          <label htmlFor="model-select" className="sr-only">Gemini model</label>
          <select id="model-select" value={selectedModel} onChange={handleSelectModel} aria-label="Gemini model">
            {Object.values(GEMINI_MODELS).map(m => (
              <option key={m} value={m}>{MODEL_LABELS[m]}</option>
            ))}
          </select>
          <div className="gen-controls">
            <label>Temperature: {generationConfig.temperature.toFixed(2)}
              <input type="range" min="0" max="1" step="0.05" value={generationConfig.temperature} onChange={handleTempChange} aria-label="Temperature" />
            </label>
            <label>Top P: {generationConfig.topP.toFixed(2)}
              <input type="range" min="0" max="1" step="0.05" value={generationConfig.topP} onChange={handleTopPChange} aria-label="Top P" />
            </label>
            <label style={{display:'flex',gap:'6px',alignItems:'center'}}>
              <input type="checkbox" checked={generationConfig.streaming} onChange={handleStreamingToggle} aria-label="Streaming" />
              Streaming
            </label>
            {systemInstruction !== undefined && <span style={{fontSize:'0.7rem',opacity:0.7}}>System prompt editable in chat settings</span>}
          </div>
        </div>
      )}
    </div>
  )
}
