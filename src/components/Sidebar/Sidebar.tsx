import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../../store'
import {
  createConversation,
  switchConversation,
  deleteConversation,
  renameConversation,
} from '../../store/user/userSlice'
import { Icon } from '@iconify/react'
import { useState } from 'react'
import './Sidebar.scss'

export default function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean
  onToggle: () => void
}) {
  const { conversations } = useSelector((s: RootState) => s.user)
  const { activeConversationId } = useSelector((s: RootState) => s.user)
  const dispatch = useDispatch()
  const [renaming, setRenaming] = useState<string | null>(null)
  const [draft, setDraft] = useState('')

  const list = Object.values(conversations).sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  if (collapsed) {
    return (
      <div className="sidebar-collapsed">
        <button className="open-btn" aria-label="Open sidebar" onClick={onToggle}>
          <Icon icon="mdi:menu" height={18} />
        </button>
      </div>
    )
  }

  return (
    <aside className="sidebar" aria-label="Conversations">
      <div className="sidebar-head">
        <div className="sidebar-title">
          Chats <span className="count">{list.length}</span>
        </div>
        <div className="head-actions">
          <button
            className="icon-mini icon-mini--accent"
            aria-label="New chat"
            onClick={() => dispatch(createConversation())}
          >
            <Icon icon="mdi:plus" height={16} />
          </button>
          <button className="icon-mini" aria-label="Collapse sidebar" onClick={onToggle}>
            <Icon icon="mdi:chevron-left" height={16} />
          </button>
        </div>
      </div>

      <div className="sidebar-list" role="list">
        {list.length === 0 && (
          <div className="empty-hint">
            No conversations yet.
            <br />
            Start a new chat →
          </div>
        )}
        {list.map((c) => {
          const isActive = c.id === activeConversationId
          const isRenaming = renaming === c.id
          return (
            <div
              key={c.id}
              role="listitem"
              className={`conv-item ${isActive ? 'active' : ''} ${isRenaming ? 'editing' : ''}`}
            >
              <div className="conv-icon" aria-hidden>
                <Icon icon="mdi:message-outline" height={14} />
              </div>
              {isRenaming ? (
                <>
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        dispatch(renameConversation({ id: c.id, title: draft }))
                        setRenaming(null)
                      }
                      if (e.key === 'Escape') setRenaming(null)
                    }}
                    aria-label="Rename conversation"
                    autoFocus
                  />
                  <button
                    className="ca-btn"
                    onClick={() => {
                      dispatch(renameConversation({ id: c.id, title: draft }))
                      setRenaming(null)
                    }}
                    aria-label="Save rename"
                  >
                    <Icon icon="mdi:check" height={14} />
                  </button>
                  <button className="ca-btn" onClick={() => setRenaming(null)} aria-label="Cancel">
                    <Icon icon="mdi:close" height={14} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => dispatch(switchConversation(c.id))}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      padding: 0,
                    }}
                    aria-label={`Switch to ${c.title}`}
                  >
                    <div className="conv-main">
                      <span className="conv-title">{c.title}</span>
                      <span className="conv-meta">
                        {c.messages.length} messages <span className="dot" aria-hidden />{' '}
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </button>
                  <div className="conv-actions">
                    <button
                      className="ca-btn"
                      aria-label={`Rename ${c.title}`}
                      onClick={() => {
                        setRenaming(c.id)
                        setDraft(c.title)
                      }}
                    >
                      <Icon icon="mdi:pencil-outline" height={13} />
                    </button>
                    <button
                      className="ca-btn ca-btn--danger"
                      aria-label={`Delete ${c.title}`}
                      onClick={() => dispatch(deleteConversation(c.id))}
                    >
                      <Icon icon="mdi:delete-outline" height={13} />
                    </button>
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>

      <div className="sidebar-foot">
        <span className="foot-dot" aria-hidden />
        <span className="foot-text">
          All chats are stored locally in your browser. Tip: use search in the toolbar.
        </span>
      </div>
    </aside>
  )
}
