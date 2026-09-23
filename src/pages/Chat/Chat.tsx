// Chat.tsx
import Header from './Header'
import PromptGenerator from './PromptGenerator'
import Sidebar from '../../components/Sidebar/Sidebar'
import { useState } from 'react'
import ConsentBanner from '../../components/ConsentBanner/ConsentBanner'
import './Chat.scss'

function Chat() {
    const [collapsed, setCollapsed] = useState(false)
    return (
        <div className='chat-page-container'>
            <Header />
            <ConsentBanner />
            <div style={{display:'flex', flex:1, overflow:'hidden'}}>
                <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
                <div style={{flex:1, overflow:'hidden', display:'flex', flexDirection:'column'}}>
                    <PromptGenerator />
                </div>
            </div>
        </div>
    )
}

export default Chat