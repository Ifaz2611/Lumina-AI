import { useState, useEffect } from 'react'
import './Welcome.scss'
import Button from '../../components/Button'
import Setup from './Setup'
import ThemeToggle from '../../components/ThemeToggle'

function Welcome() {
  const [showInputs, setShowInputs] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="welcome-page">
      {/* Animated background layers */}
      <div className="background" aria-hidden>
        <div className="gradient-orb orb-1" />
        <div className="gradient-orb orb-2" />
        <div className="gradient-orb orb-3" />
        <div className="grid-overlay" />
        <div className="noise-overlay" />
      </div>

      <div className="theme-toggle-wrapper">
        <ThemeToggle />
      </div>

      <div className={`heading ${mounted ? 'mounted' : ''}`}>
        <div className="badge">
          <span className="badge-dot" />
          Powered by Gemini 2.0 · Private by design
        </div>

        <h1 className={showInputs ? 'small-h1' : ''}>
          Chat with <span className="gradient-text">Gemini</span>
        </h1>

        {!showInputs ? (
          <>
            <h3>
              Google’s most capable model —{' '}
              <span className="highlight">right in your browser, no middleman.</span>
              <br />
              Fast, private, and beautifully simple.
            </h3>

            <div className="cta-container">
              <Button className="start-button" onClick={() => setShowInputs(true)}>
                <span>Get started</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12h14M12 5l7 7-7 7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Button>

              <div className="feature-pills">
                <div className="pill">Lightning fast</div>
                <div className="pill">Private</div>
                <div className="pill">No tracking</div>
              </div>
            </div>
          </>
        ) : (
          <Setup />
        )}
      </div>

      <span className="disclaimer">
        <span className="dot-indicator" />
        Direct connection to Google Gemini API — your key never leaves this device.
      </span>
    </div>
  )
}

export default Welcome
