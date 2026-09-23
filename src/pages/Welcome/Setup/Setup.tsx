import Button from '../../../components/Button'
import './Setup.scss'
import { useSetup } from './hooks'

function Setup() {
  const {
    handleNameChange,
    handleApiKeyChange,
    handleSubmit,
    getAPI,
    name,
    API_KEY,
    showApiError,
    apiErrorText,
    envKeyExists,
  } = useSetup()

  return (
    <div className={`auth-container ${API_KEY ? 'active' : ''}`}>
      <div className="auth-header">
        <h2>Welcome to Lumina</h2>
        <p>
          Enter your name and Gemini API key to start chatting. Your key stays in this tab only.
        </p>
      </div>
      <div className="input-container">
        <label htmlFor="name">Your name</label>
        <input
          type="text"
          id="name"
          value={name}
          autoComplete="name"
          placeholder="Ada Lovelace"
          onChange={handleNameChange}
          aria-label="Your name"
        />
      </div>
      <div className="input-container">
        <label htmlFor="apiKey">
          Gemini API Key {envKeyExists && <span className="optional">optional — using .env</span>}
        </label>
        <input
          type="password"
          id="apiKey"
          value={API_KEY}
          autoComplete="off"
          placeholder={
            envKeyExists
              ? 'Leave blank to use VITE_GEMINI_API_KEY'
              : 'Paste your Gemini API key (e.g. AIza... or AQ....)'
          }
          onChange={handleApiKeyChange}
          aria-invalid={showApiError}
          aria-describedby={showApiError ? 'api-error' : undefined}
        />
        {showApiError && (
          <p id="api-error" role="alert">
            {apiErrorText}
          </p>
        )}
        <p className="hint">
          🔒 Stored in sessionStorage — cleared when you close the tab. Never saved to localStorage.{' '}
          {envKeyExists && '· Env key detected.'}
        </p>
      </div>
      <div className="buttons-container">
        <Button variant="secondary" onClick={getAPI} aria-label="Get free API key">
          Get Free API Key
        </Button>
        <Button variant="primary" onClick={handleSubmit} aria-label="Start using Lumina">
          Continue →
        </Button>
      </div>
      <div className="auth-footer">
        By continuing you agree to connect directly to Google’s Gemini API from your browser.
      </div>
    </div>
  )
}

export default Setup
