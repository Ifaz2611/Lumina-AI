import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { usePromptGenerator } from './hooks'
import { useRef, useEffect, useState, Suspense } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../../store'
import { Icon } from '@iconify/react/dist/iconify.js'
import CopyCodeButton from './CopyCodeButton'
import {
  deleteMessage,
  editMessage,
  clearChat,
  setSystemInstruction,
} from '../../store/user/userSlice'

const Markdown = ReactMarkdown

const STARTERS = [
  { title: 'Explain quantum computing', desc: 'In simple terms with an analogy' },
  { title: 'Write a React hook', desc: 'useLocalStorage with TypeScript safety' },
  { title: 'Plan a 3-day trip to Kyoto', desc: 'Temples, food, and hidden gems' },
  { title: 'Debug this error', desc: 'Paste your stack trace and get help' },
]

function PromptGenerator() {
  const {
    handlePromptChange,
    handleFileChange,
    handleSendPrompt,
    handleKeyDown,
    handleRemoveFile,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleRegenerate,
    data,
    prompt,
    textareaRef,
    loading,
    error,
    base64File,
    previewUrl,
    fileError,
    isDragging,
    fileMimeType,
  } = usePromptGenerator()

  const { usage, systemInstruction } = useSelector((state: RootState) => state.user)
  const dispatch = useDispatch()
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editDraft, setEditDraft] = useState('')
  const [showSystem, setShowSystem] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredData = searchQuery
    ? data?.filter((m) => m.message.toLowerCase().includes(searchQuery.toLowerCase()))
    : data

  useEffect(() => {
    const container = messagesContainerRef.current
    if (container) {
      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight < 150
      if (isNearBottom) {
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
      }
    }
  }, [data, loading])

  const exportMarkdown = () => {
    const md = (data || [])
      .map(
        (m) =>
          `**${m.type === 'inbound' ? 'Gemini' : 'You'} (${new Date(m.timestamp).toLocaleString()}):**\n\n${m.message}\n`
      )
      .join('\n---\n\n')
    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'lumina-chat.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  const copyAll = async () => {
    const text = (data || [])
      .map((m) => `${m.type === 'inbound' ? 'Gemini' : 'You'}: ${m.message}`)
      .join('\n\n')
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

  const handleStarter = (title: string, desc: string) => {
    // dispatch directly via handler by setting prompt and sending
    const full = `${title} — ${desc}`
    // set via textarea and trigger send by directly dispatching key
    // we reuse prompt state: set then send next tick
    // For simplicity, just fill the input
    if (textareaRef.current) {
      textareaRef.current.value = full
      textareaRef.current.dispatchEvent(new Event('change', { bubbles: true }))
    }
    // also set state imperatively (since hook controls prompt)
    // quick workaround: trigger prompt change via native setter is complex; just use clipboard + paste illusion
    // Instead expose a hidden dispatch: we directly set prompt via handler is not exported, so fallback to manual
    // We'll set via DOM and then call handler
    // Simpler: just set prompt state via effect - we will call handlePromptChange manually
    const e = { target: { value: full } } as React.ChangeEvent<HTMLTextAreaElement>
    handlePromptChange(e)
    setTimeout(() => textareaRef.current?.focus(), 0)
  }

  return (
    <div
      className="conversation-container"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      aria-label="Chat conversation"
    >
      {isDragging && (
        <div className="drag-overlay" role="alert" aria-live="polite">
          Drop image to attach — JPEG / PNG / WebP / GIF · max 4 MB
        </div>
      )}

      <div className="chat-toolbar">
        <div className="toolbar-search">
          <Icon icon="mdi:magnify" height={16} className="search-icon" />
          <input
            aria-label="Search messages"
            placeholder="Search conversation…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="toolbar-actions">
          <button onClick={copyAll} aria-label="Copy all messages" className="tb-btn">
            <Icon icon="mdi:content-copy" height={14} /> Copy
          </button>
          <button onClick={exportMarkdown} aria-label="Export markdown" className="tb-btn">
            <Icon icon="mdi:export" height={14} /> Export
          </button>
          <button
            onClick={() => dispatch(clearChat())}
            aria-label="Clear chat"
            className="tb-btn tb-btn--ghost"
          >
            <Icon icon="mdi:trash-can-outline" height={14} /> Clear
          </button>
          <button
            onClick={() => setShowSystem(!showSystem)}
            aria-expanded={showSystem}
            aria-controls="system-panel"
            className={`system-toggle ${systemInstruction ? 'active' : ''}`}
          >
            <Icon icon={showSystem ? 'mdi:tune-variant' : 'mdi:tune'} height={14} /> System{' '}
            {systemInstruction ? '· on' : ''}
          </button>
          {usage.totalTokens > 0 && (
            <span className="token-badge" aria-label="Token usage">
              <Icon icon="mdi:memory" height={12} /> {usage.totalTokens.toLocaleString()} tokens
            </span>
          )}
        </div>
      </div>

      {showSystem && (
        <div id="system-panel" className="system-panel">
          <label htmlFor="system-instr">System instruction — shape Gemini’s personality</label>
          <textarea
            id="system-instr"
            value={systemInstruction}
            onChange={(e) => dispatch(setSystemInstruction(e.target.value))}
            placeholder="You are a helpful, concise assistant that explains with examples..."
            rows={2}
            aria-label="System instruction"
          />
        </div>
      )}

      <div
        className="messages-container"
        ref={messagesContainerRef}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {data && data.length === 0 && !loading && (
          <div className="empty-state">
            <div className="empty-icon" aria-hidden>
              <Icon icon="mdi:sparkles" height={26} />
            </div>
            <h2>How can I help you today?</h2>
            <p>
              Start a conversation, drop an image, or try one of these prompts. Your chats stay in
              this browser.
            </p>
            <div className="prompt-starters">
              {STARTERS.map((s) => (
                <button
                  key={s.title}
                  className="starter"
                  onClick={() => handleStarter(s.title, s.desc)}
                  aria-label={`Try: ${s.title}`}
                >
                  <strong>{s.title}</strong>
                  <span>{s.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {filteredData &&
          filteredData.map((message, index) => (
            <div
              className={`message-wrapper ${message.type}`}
              key={index}
              tabIndex={0}
              aria-label={`${message.type === 'inbound' ? 'Gemini' : 'You'} message`}
            >
              <div className="avatar" aria-hidden>
                {message.type === 'inbound' ? (
                  <Icon icon="mdi:creation" height={16} />
                ) : (
                  'You'.slice(0, 2)
                )}
              </div>
              <div className="message-content">
                <span className="message-sender">
                  {message.type === 'inbound' ? 'Gemini' : 'You'}
                </span>
                <div className="message-bubble">
                  {editingIndex === index ? (
                    <div className="edit-box">
                      <textarea
                        value={editDraft}
                        onChange={(e) => setEditDraft(e.target.value)}
                        aria-label="Edit message"
                        rows={3}
                        autoFocus
                      />
                      <div className="edit-actions">
                        <button
                          className="btn-save"
                          onClick={() => {
                            dispatch(editMessage({ index, message: editDraft }))
                            setEditingIndex(null)
                          }}
                        >
                          Save
                        </button>
                        <button className="btn-cancel" onClick={() => setEditingIndex(null)}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : message.type === 'inbound' ? (
                    <Suspense fallback={<p>{message.message}</p>}>
                      <Markdown
                        className="markdown-render"
                        remarkPlugins={[remarkGfm]}
                        components={{
                          pre: ({ node, ...props }) => {
                            let code = ''
                            try {
                              if (
                                node &&
                                node.children &&
                                node.children[0] &&
                                (
                                  node.children[0] as unknown as {
                                    type: string
                                    tagName: string
                                    children: { type: string; value: string }[]
                                  }
                                ).tagName === 'code'
                              ) {
                                const codeNode = node.children[0] as unknown as {
                                  children: { value: string }[]
                                }
                                if (codeNode?.children?.[0]?.value)
                                  code = codeNode.children[0].value
                              }
                            } catch {}
                            return (
                              <div className="code-block-wrapper">
                                <pre {...props} />
                                <CopyCodeButton code={code} />
                              </div>
                            )
                          },
                          code: ({ className, children, ...props }) => (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          ),
                        }}
                      >
                        {message.message}
                      </Markdown>
                    </Suspense>
                  ) : (
                    <p style={{ margin: 0 }}>{message.message}</p>
                  )}
                </div>
                <div className="message-actions">
                  <button
                    className="act-btn"
                    aria-label={`Copy message ${index + 1}`}
                    onClick={() => navigator.clipboard.writeText(message.message)}
                  >
                    <Icon icon="mdi:content-copy" height={14} />
                  </button>
                  <button
                    className="act-btn"
                    aria-label={`Edit message ${index + 1}`}
                    onClick={() => {
                      setEditingIndex(index)
                      setEditDraft(message.message)
                    }}
                  >
                    <Icon icon="mdi:pencil" height={14} />
                  </button>
                  <button
                    className="act-btn"
                    aria-label={`Delete message ${index + 1}`}
                    onClick={() => dispatch(deleteMessage(index))}
                  >
                    <Icon icon="mdi:delete-outline" height={14} />
                  </button>
                  <time dateTime={message.timestamp}>
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </time>
                </div>
              </div>
            </div>
          ))}

        {loading && (
          <div className="loading-indicator" aria-live="polite" aria-busy="true">
            <div
              className="avatar"
              style={{
                background: 'var(--bg-muted)',
                border: '1px solid var(--border)',
                color: 'var(--text-tertiary)',
              }}
              aria-hidden
            >
              <Icon icon="mdi:creation" height={16} />
            </div>
            <div className="dots" aria-label="Loading">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}

        {friendlyError && (
          <div className="error-message" role="alert">
            <div>
              <strong>
                {friendlyError.title} {friendlyError.code ? `(${friendlyError.code})` : ''}
              </strong>{' '}
              — {friendlyError.msg}
            </div>
            <div className="error-actions">
              <button
                className="btn-regen"
                onClick={handleRegenerate}
                disabled={loading}
                aria-label="Regenerate response"
              >
                <Icon icon="mdi:refresh" height={16} /> Regenerate
              </button>
              {friendlyError.code === 401 && (
                <span style={{ fontSize: '12px', opacity: 0.8, alignSelf: 'center' }}>
                  Try signing out to enter a new API key.
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="composer-wrap">
        <div className="composer-inner">
          {(previewUrl || fileError) && (
            <div className="attach-preview">
              {previewUrl && (
                <>
                  <img src={previewUrl} alt="Preview" />
                  <span className="meta">{fileMimeType} · attached</span>
                  <button
                    className="remove-btn"
                    onClick={handleRemoveFile}
                    aria-label="Remove image"
                  >
                    Remove
                  </button>
                </>
              )}
              {fileError && (
                <span role="alert" className="file-error">
                  {fileError}
                </span>
              )}
            </div>
          )}

          <div className="input-dock">
            <div className="input-actions-left">
              <input
                id="file-input"
                className="file-selector-input"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileChange}
                aria-label="Attach image"
              />
              <label
                htmlFor="file-input"
                className={`file-selector-label ${base64File ? 'has-file' : ''}`}
                aria-label="Attach image"
                title="Attach image"
              >
                <Icon icon={base64File ? 'mdi:image-check-outline' : 'mdi:paperclip'} height={18} />
              </label>
            </div>

            <textarea
              id="prompt"
              value={prompt}
              className="prompt-input"
              placeholder="Ask anything…  (Shift + Enter for new line)"
              onChange={handlePromptChange}
              onKeyDown={handleKeyDown}
              ref={textareaRef}
              rows={1}
              aria-label="Message input"
            />

            <button
              className="send-button"
              disabled={!prompt.trim() || loading}
              onClick={handleSendPrompt}
              aria-label="Send message"
              title="Send"
            >
              <Icon icon={loading ? 'eos-icons:three-dots-loading' : 'mdi:arrow-up'} height={20} />
            </button>
          </div>
          <div className="composer-hint">
            Lumina connects directly to Gemini — your API key never leaves this device. ·{' '}
            <span style={{ opacity: 0.7 }}>↵ send · ⇧↵ new line</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PromptGenerator
