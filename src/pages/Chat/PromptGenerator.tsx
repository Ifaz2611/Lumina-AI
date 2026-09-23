import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { usePromptGenerator } from './hooks'
import { useRef, useEffect, useState, Suspense } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../../store'
import { Icon } from '@iconify/react/dist/iconify.js'
import CopyCodeButton from './CopyCodeButton'
import { deleteMessage, editMessage, clearChat, setSystemInstruction } from '../../store/user/userSlice'

// Lazy load heavy markdown for code-split (119kB)
const Markdown = ReactMarkdown

function PromptGenerator() {
  const {
    handlePromptChange, handleFileChange, handleSendPrompt, handleKeyDown, handleRemoveFile,
    handleDragOver, handleDragLeave, handleDrop, handleRegenerate,
    data, prompt, textareaRef, loading, error, base64File, previewUrl, fileError, isDragging, fileMimeType
  } = usePromptGenerator()

  const { usage, systemInstruction } = useSelector((state: RootState) => state.user)
  const dispatch = useDispatch()
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editDraft, setEditDraft] = useState('')
  const [showSystem, setShowSystem] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredData = searchQuery
    ? data?.filter(m => m.message.toLowerCase().includes(searchQuery.toLowerCase()))
    : data

  useEffect(() => {
    const container = messagesContainerRef.current
    if (container) {
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150
      if (isNearBottom) {
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
      }
    }
  }, [data, loading])

  const exportMarkdown = () => {
    const md = (data || []).map(m => `**${m.type === 'inbound' ? 'Gemini' : 'You'} (${new Date(m.timestamp).toLocaleString()}):**\n\n${m.message}\n`).join('\n---\n\n')
    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'lumina-chat.md'; a.click(); URL.revokeObjectURL(url)
  }

  const copyAll = async () => {
    const text = (data || []).map(m => `${m.type === 'inbound' ? 'Gemini' : 'You'}: ${m.message}`).join('\n\n')
    await navigator.clipboard.writeText(text)
  }

  const friendlyError = (() => {
    if (!error) return null
    if (error.includes('401') || error.includes('403') || error.toLowerCase().includes('api key')) {
      return { title: 'Authentication error', msg: error, code: 401 }
    }
    if (error.includes('429') || error.includes('Rate limited')) {
      return { title: 'Rate limited', msg: error, code: 429 }
    }
    if (error.includes('500') || error.toLowerCase().includes('server')) {
      return { title: 'Server error', msg: error, code: 500 }
    }
    return { title: 'Error', msg: error, code: 0 }
  })()

  return (
    <div className='conversation-container' onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} aria-label="Chat conversation">
      {isDragging && (
        <div className="drag-overlay" role="alert" aria-live="polite">Drop image to attach (JPEG/PNG/WebP, max 4MB)</div>
      )}
      <div className='chat-toolbar' style={{display:'flex',gap:'8px',padding:'8px',alignItems:'center',flexWrap:'wrap'}}>
        <input aria-label="Search messages" placeholder="Search..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} style={{flex:'1 1 160px', maxWidth:'220px'}} />
        <button onClick={copyAll} aria-label="Copy all messages" className="icon-button"><Icon icon="mdi:content-copy" /> Copy all</button>
        <button onClick={exportMarkdown} aria-label="Export markdown" className="icon-button"><Icon icon="mdi:export" /> Export</button>
        <button onClick={() => dispatch(clearChat())} aria-label="Clear chat">Clear</button>
        <button onClick={() => setShowSystem(!showSystem)} aria-expanded={showSystem} aria-controls="system-panel">System: {systemInstruction ? 'on' : 'off'}</button>
        {usage.totalTokens > 0 && <span aria-label="Token usage" style={{fontSize:'0.75rem',opacity:0.7}}>Tokens: {usage.totalTokens} (in {usage.candidatesTokens})</span>}
      </div>
      {showSystem && (
        <div id="system-panel" style={{padding:'8px', borderBottom:'1px solid var(--light-border)'}}>
          <label htmlFor="system-instr" style={{fontSize:'0.85rem'}}>System instruction (personality):</label>
          <textarea id="system-instr" value={systemInstruction} onChange={e=>dispatch(setSystemInstruction(e.target.value))} placeholder="You are a helpful assistant..." rows={2} style={{width:'100%', marginTop:'4px'}} aria-label="System instruction" />
        </div>
      )}
      <div className='messages-container' ref={messagesContainerRef} role="log" aria-live="polite" aria-relevant="additions">
        {data && data.length === 0 && !loading && (
          <div style={{ textAlign: 'center', marginTop: '20%', color: 'var(--text-color-secondary)' }}>
            <h2>How can I help you today?</h2>
            <p>Start a conversation by typing a message below. Tip: drag & drop an image.</p>
          </div>
        )}

        {filteredData && filteredData.map((message, index) => (
          <div className={`message-wrapper ${message.type}`} key={index} tabIndex={0} aria-label={`${message.type === 'inbound' ? 'Gemini' : 'You'} message`}>
            <span className='message-sender'>
              {message.type === 'inbound' ? 'Gemini' : 'You'}
            </span>
            <div className='message-bubble'>
              {editingIndex === index ? (
                <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                  <textarea value={editDraft} onChange={e=>setEditDraft(e.target.value)} aria-label="Edit message" rows={3} style={{width:'100%'}} />
                  <div style={{display:'flex',gap:'8px'}}>
                    <button onClick={() => { dispatch(editMessage({index, message: editDraft})); setEditingIndex(null)}}>Save</button>
                    <button onClick={() => setEditingIndex(null)}>Cancel</button>
                  </div>
                </div>
              ) : message.type === 'inbound' ? (
                <Suspense fallback={<p>{message.message}</p>}>
                  <Markdown
                    className='markdown-render'
                    remarkPlugins={[remarkGfm]}
                    components={{
                      pre: ({ node, ...props }) => {
                        let code = '';
                        try {
                          if (node && node.children && node.children[0] && (node.children[0] as unknown as {type:string; tagName:string; children:{type:string; value:string}[]}).tagName === 'code') {
                            const codeNode = node.children[0] as unknown as { children: {value:string}[] };
                            if (codeNode?.children?.[0]?.value) code = codeNode.children[0].value;
                          }
                        } catch {}
                        return (
                          <div className="code-block-wrapper">
                            <pre {...props} />
                            <CopyCodeButton code={code} />
                          </div>
                        )
                      },
                      code: ({ className, children, ...props }) => <code className={className} {...props}>{children}</code>,
                    }}
                  >
                    {message.message}
                  </Markdown>
                </Suspense>
              ) : (
                <p style={{ margin: 0 }}>{message.message}</p>
              )}
            </div>
            <div style={{display:'flex',gap:'6px',marginTop:'4px'}}>
              <button aria-label={`Copy message ${index+1}`} onClick={() => navigator.clipboard.writeText(message.message)}><Icon icon="mdi:content-copy" height={14} /></button>
              <button aria-label={`Edit message ${index+1}`} onClick={() => { setEditingIndex(index); setEditDraft(message.message)}}><Icon icon="mdi:pencil" height={14} /></button>
              <button aria-label={`Delete message ${index+1}`} onClick={() => dispatch(deleteMessage(index))}><Icon icon="mdi:delete" height={14} /></button>
            </div>
            <time dateTime={message.timestamp} style={{fontSize:'0.7rem',opacity:0.6}}>{new Date(message.timestamp).toLocaleTimeString()}</time>
          </div>
        ))}

        {loading && (
          <div className='message-wrapper inbound' aria-live="polite" aria-busy="true">
            <span className='message-sender'>Gemini</span>
            <div className='loading-indicator' aria-label="Loading">
              <Icon icon="eos-icons:bubble-loading" height={24} />
            </div>
          </div>
        )}

        {friendlyError && (
          <div className='error-message' role="alert" style={{borderLeft:'4px solid #ff4444',padding:'12px'}}>
            <strong>{friendlyError.title} {friendlyError.code ? `(${friendlyError.code})` : ''}:</strong> {friendlyError.msg}
            <div style={{marginTop:'8px',display:'flex',gap:'8px'}}>
              <button onClick={handleRegenerate} disabled={loading} aria-label="Regenerate response">↻ Regenerate</button>
              {friendlyError.code === 401 && <span>Please sign out to enter a new API Key.</span>}
            </div>
          </div>
        )}
      </div>

      {(previewUrl || fileError) && (
        <div style={{padding:'8px', display:'flex',alignItems:'center',gap:'8px', borderTop:'1px solid var(--light-border)'}}>
          {previewUrl && <><img src={previewUrl} alt="Preview" style={{height:'48px',borderRadius:'8px'}} /><span style={{fontSize:'0.75rem'}}>{fileMimeType}</span><button onClick={handleRemoveFile} aria-label="Remove image">✕ Remove</button></>}
          {fileError && <span role="alert" style={{color:'#ff4444',fontSize:'0.8rem'}}>{fileError}</span>}
        </div>
      )}

      <div className='message-input-container'>
        <div className='input-wrapper' style={{flex:1}}>
          <div className='file-selector-container'>
            <input
              id='file-input'
              className='file-selector-input'
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              aria-label="Attach image"
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

          <textarea
            id='prompt'
            value={prompt}
            className='prompt-input'
            placeholder='Message Gemini... (Shift+Enter for new line, drag image to attach)'
            onChange={handlePromptChange}
            onKeyDown={handleKeyDown}
            ref={textareaRef}
            rows={1}
            aria-label="Message input"
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
