import { Icon } from '@iconify/react'
import { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import './Header.scss'
import Logout from '../../../components/Logout/Logout'
import { RootState } from '../../../store/index'
import { clearChat } from '../../../store/user/userSlice'
import ThemeToggle from '../../../components/ThemeToggle'
import ModelSelector from './ModelSelector'

// Reusable IconButton component
const IconButton = ({
  icon,
  onClick,
  ariaLabel,
  className = '',
}: {
  icon: string
  onClick: () => void
  ariaLabel: string
  className?: string
}) => {
  return (
    <button className={`icon-button ${className}`} onClick={onClick} aria-label={ariaLabel}>
      <Icon icon={icon} height={24} />
    </button>
  )
}

function Header() {
  const { name } = useSelector((state: RootState) => state.user)
  const dispatch = useDispatch()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isMenuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false)
      // focus trap: Tab cycles within menu
      if (e.key === 'Tab' && menuRef.current) {
        const focusable = menuRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    const onClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClickOutside)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClickOutside)
    }
  }, [isMenuOpen])

  const openGithub = () => {
    window.open('https://github.com/Ifaz2611/Lumina-AI', '_blank')
  }

  return (
    <div className="header">
      <div className="brand">
        <div className="brand-mark" aria-hidden>
          L
        </div>
        <div className="brand-text">
          <strong>Lumina</strong>
          <span>Gemini · Private</span>
        </div>
      </div>
      <span className="header-greeting">
        Hello, <strong className="user-name">{name || 'there'}</strong>
      </span>

      {/* Desktop Buttons */}
      <div className="header-buttons">
        <ModelSelector />
        <IconButton
          icon="mdi:github"
          onClick={openGithub}
          ariaLabel="GitHub – open repository"
          className="github-button"
        />
        <IconButton
          icon="mdi:trashcan-outline"
          onClick={() => dispatch(clearChat())}
          ariaLabel="Clear chat history"
          className="clear-button"
        />
        <ThemeToggle />
        <Logout />
      </div>

      {/* Mobile Hamburger Menu */}
      <button
        ref={buttonRef}
        className="hamburger-menu"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isMenuOpen}
        aria-controls="mobile-menu"
      >
        <Icon icon={isMenuOpen ? 'mdi:close' : 'mdi:menu'} height={22} />
      </button>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div
          id="mobile-menu"
          className="mobile-menu"
          ref={menuRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <ModelSelector />
          <IconButton
            icon="mdi:github"
            onClick={() => {
              openGithub()
              setIsMenuOpen(false)
            }}
            ariaLabel="GitHub – open repository"
          />
          <IconButton
            icon="mdi:trashcan-outline"
            onClick={() => {
              dispatch(clearChat())
              setIsMenuOpen(false)
            }}
            ariaLabel="Clear chat history"
          />
          <ThemeToggle />
          <Logout />
        </div>
      )}
    </div>
  )
}

export default Header
