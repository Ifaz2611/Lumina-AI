import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { usePromptGenerator } from './hooks'
import { useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { Icon } from '@iconify/react/dist/iconify.js'
import { GEMINI_MODELS } from '../../constants/models'
import CopyCodeButton from './CopyCodeButton'

function PromptGenerator() {
  const { 
    handlePromptChange, handleFileChange, handleSendPrompt, handleKeyDown, 
    data, prompt, textareaRef, loading, error, base64File 
  } = usePromptGenerator()
  
  const { selectedModel } = useSelector((state: RootState) => state.user)
  const messagesContainerRef = useRef<HTMLDivElement>(null)


  useEffect(() => {
    const container = messagesContainerRef.current
    if (container) {
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150
      if (isNearBottom) {
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
      }
    }
  }, [data, loading])

  return (
    <div className='conversation-container'>
      <div className='messages-container' ref={messagesContainerRef}>
        {data && data.length === 0 && !loading && (
          <div style={{ textAlign: 'center', marginTop: '20%', color: 'var(--text-color-secondary)' }}>
            <h2>How can I help you today?</h2>
            <p>Start a conversation by typing a message below.</p>
          </div>
        )}

        {data && data.map((message, index) => (
          <div className={`message-wrapper ${message.type}`} key={index}>
            <span className='message-sender'>
              {message.type === 'inbound' ? 'Gemini' : 'You'}
            </span>
            <div className='message-bubble'>
              {message.type === 'inbound' ? (
                <ReactMarkdown 
                  className='markdown-render' 
                  remarkPlugins={[remarkGfm]}
                  components={{

                    pre: ({ node, ...props }) => {
                      let code = '';
                      try {

                        if (node && node.children && node.children.length > 0 && node.children[0].type === 'element' && node.children[0].tagName === 'code') {
                          const codeNode = node.children[0];
                          if (codeNode && codeNode.children && codeNode.children.length > 0 && codeNode.children[0].type === 'text') {
                            code = codeNode.children[0].value;
                          }
                        }
                      } catch (e) {
                        console.error('Failed to extract code from code block:', e);
                      }
                      return (
                        <div className="code-block-wrapper">
                          <pre {...props} />
                          <CopyCodeButton code={code} />
                        </div>
                      )
                    },
                    // Optional: wrap inline code if you want copy there too
                    code: ({ className, children, ...props }) => {
                      return <code className={className} {...props}>{children}</code>;
                    },
                  }}
                >
                  {message.message}
                </ReactMarkdown>
              ) : (
                <p style={{ margin: 0 }}>{message.message}</p>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className='message-wrapper inbound'>
            <span className='message-sender'>Gemini</span>
            <div className='loading-indicator'>
              <Icon icon="eos-icons:bubble-loading" height={24} />
            </div>
          </div>
        )}

        {error && (
          <div className='error-message'>
            <strong>Error:</strong> {error}
            {error.includes('API') && <><br />Please sign out to enter a new API Key.</>}
          </div>
        )}
      </div>

      <div className='message-input-container'>
        <div className='input-wrapper'>
          {selectedModel === GEMINI_MODELS.FLASH && (
            <div className='file-selector-container'>
              <input
                id='file-input'
                className='file-selector-input'
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              <label 
                htmlFor='file-input' 
                className={`file-selector-label ${base64File ? 'has-file' : ''}`}
                aria-label="Attach image"
              >
                <Icon 
                  icon={base64File ? 'mdi:image-check-outline' : 'mdi:paperclip'} 
                  height={22} 
                />
              </label>
            </div>
          )}
          
          <textarea
            id='prompt'
            value={prompt}
            className='prompt-input'
            placeholder='Message Gemini...'
            onChange={handlePromptChange}
            onKeyDown={handleKeyDown}
            ref={textareaRef}
            rows={1}
          />
        </div>

        <button 
          className='send-button'
          disabled={!prompt.trim() || loading} 
          onClick={handleSendPrompt}
          aria-label="Send message"
        >
          <Icon icon={loading ? "eos-icons:three-dots-loading" : "mdi:arrow-up"} height={24} />
        </button>
      </div>
    </div>
  )
}

export default PromptGenerator