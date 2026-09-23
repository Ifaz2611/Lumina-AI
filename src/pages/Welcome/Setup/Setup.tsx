import Button from '../../../components/Button'
import './Setup.scss'
import { useSetup } from './hooks'

function Setup() {
    const { handleNameChange, handleApiKeyChange, handleSubmit, getAPI, name, API_KEY, showApiError, apiErrorText, envKeyExists } = useSetup()

    return (
        <div className={`auth-container ${API_KEY ? 'active' : ''}`}>
            <div className='input-container'>
                <label htmlFor='name'>Name</label>
                <input
                    type='text'
                    id='name'
                    value={name}
                    autoComplete='name'
                    placeholder='Full name'
                    onChange={handleNameChange}
                    aria-label='Your name'
                />
            </div>
            <div className='input-container'>
                <label htmlFor='apiKey'>API Key {envKeyExists && <span style={{opacity:0.7}}>(optional – using .env)</span>}</label>
                <input
                    type='password'
                    id='apiKey'
                    value={API_KEY}
                    autoComplete='off'
                    placeholder={envKeyExists ? 'Leave blank to use VITE_GEMINI_API_KEY' : 'AIza... (39 characters)'}
                    onChange={handleApiKeyChange}
                    aria-invalid={showApiError}
                    aria-describedby={showApiError ? 'api-error' : undefined}
                />
                {showApiError && <p id='api-error' role='alert'>{apiErrorText}</p>}
                <p style={{fontSize:'0.75rem', opacity:0.8, marginTop:'6px'}}>🔒 Key is stored in sessionStorage (cleared when tab closes) and never in localStorage. {envKeyExists && 'Env key detected.'}</p>
            </div>
            <div className='buttons-container'>
                <Button className='start-button secondary' onClick={getAPI} aria-label='Get free API key'>Get Free API Key</Button>
                <Button className='start-button' onClick={handleSubmit} aria-label='Start using Lumina'>Start using Lumina</Button>
            </div>
        </div>
    )
}

export default Setup
