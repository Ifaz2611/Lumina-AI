import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../../store'
import { createConversation, switchConversation, deleteConversation, renameConversation } from '../../store/user/userSlice'
import { Icon } from '@iconify/react'
import { useState } from 'react'

export default function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { conversations, activeConversationId } = useSelector((s: RootState) => s.user)
  const dispatch = useDispatch()
  const [renaming, setRenaming] = useState<string | null>(null)
  const [draft, setDraft] = useState('')

  if (collapsed) {
    return (
      <button aria-label="Open sidebar" onClick={onToggle} style={{position:'fixed',left:'8px',top:'72px',zIndex:50}}>
        <Icon icon="mdi:menu" height={22} />
      </button>
    )
  }

  return (
    <aside aria-label="Conversations" style={{width:'240px', borderRight:'1px solid var(--light-border)', padding:'12px', display:'flex', flexDirection:'column', gap:'8px', background:'var(--setup-background)', height:'100%'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <strong>Chats</strong>
        <div style={{display:'flex', gap:'4px'}}>
          <button aria-label="New chat" onClick={() => dispatch(createConversation())}><Icon icon="mdi:plus" /></button>
          <button aria-label="Collapse sidebar" onClick={onToggle}><Icon icon="mdi:chevron-left" /></button>
        </div>
      </div>
      <div role="list" style={{overflowY:'auto', flex:1, display:'flex', flexDirection:'column', gap:'4px'}}>
        {Object.values(conversations).sort((a,b)=> b.createdAt.localeCompare(a.createdAt)).map(c => (
          <div key={c.id} role="listitem" style={{display:'flex', alignItems:'center', gap:'4px', background: c.id===activeConversationId ? 'var(--input-focus-background)' : 'transparent', padding:'6px 8px', borderRadius:'8px'}}>
            {renaming===c.id ? (
              <>
                <input value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter'){ dispatch(renameConversation({id:c.id, title:draft})); setRenaming(null)} if(e.key==='Escape') setRenaming(null)}} aria-label="Rename conversation" autoFocus />
                <button onClick={()=>{ dispatch(renameConversation({id:c.id, title:draft})); setRenaming(null)}} aria-label="Save rename">✓</button>
              </>
            ) : (
              <>
                <button onClick={()=>dispatch(switchConversation(c.id))} style={{flex:1, textAlign:'left', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}} aria-label={`Switch to ${c.title}`}>{c.title} <span style={{opacity:0.6, fontSize:'0.7rem'}}>({c.messages.length})</span></button>
                <button aria-label={`Rename ${c.title}`} onClick={()=>{ setRenaming(c.id); setDraft(c.title)}}><Icon icon="mdi:pencil" height={14} /></button>
                <button aria-label={`Delete ${c.title}`} onClick={()=>dispatch(deleteConversation(c.id))}><Icon icon="mdi:delete" height={14} /></button>
              </>
            )}
          </div>
        ))}
      </div>
      <small style={{opacity:0.6}}>Tip: search inside chat toolbar</small>
    </aside>
  )
}
