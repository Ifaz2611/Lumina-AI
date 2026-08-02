import { Icon } from '@iconify/react';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import './Header.scss';
import Logout from '../../../components/Logout/Logout';
import { RootState } from '../../../store/index';
import { clearChat } from '../../../store/user/userSlice';
import ThemeToggle from '../../../components/ThemeToggle';
import { useModelSelector } from './hooks';
import { GEMINI_MODELS } from '../../../constants/models';

// Reusable IconButton component
const IconButton = ({
    icon,
    onClick,
    ariaLabel,
    className = '',
}: {
    icon: string;
    onClick: () => void;
    ariaLabel: string;
    className?: string;
}) => {
    return (
        <button
            className={`icon-button ${className}`}
            onClick={onClick}
            aria-label={ariaLabel}
        >
            <Icon icon={icon} height={24} />
        </button>
    );
};

// Single Model Display Badge (Replaces ModelDropdown)
const ModelBadge = ({ selectedModel }: { selectedModel: string }) => {
    return (
        <div className="model-badge">
            <span>{selectedModel === GEMINI_MODELS.PRO ? 'Gemini Pro' : 'Gemini Flash'}</span>
        </div>
    );
};

function Header() {
    const { name } = useSelector((state: RootState) => state.user);
    const { selectedModel } = useModelSelector();
    const dispatch = useDispatch();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const openGithub = () => {
        window.open('https://github.com/Ifaz2611/Lumina-AI', '_blank');
    };

    return (
        <div className='header'>
            <span className="header-greeting">
            Hello, <strong className="user-name">{name}</strong>
            </span>

            {/* Desktop Buttons */}
            <div className='header-buttons'>
                <ModelBadge selectedModel={selectedModel} />
                <IconButton
                    icon="mdi:github"
                    onClick={openGithub}
                    ariaLabel="GitHub"
                    className="github-button"
                />
                <IconButton
                    icon="mdi:trashcan-outline"
                    onClick={() => dispatch(clearChat())}
                    ariaLabel="Clear chat"
                    className="clear-button"
                />
                <ThemeToggle />
                <Logout />
            </div>

            {/* Mobile Hamburger Menu */}
            <button
                className="hamburger-menu"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
            >
                <Icon icon="mdi:menu" height={28} />
            </button>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="mobile-menu">
                    <ModelBadge selectedModel={selectedModel} />
                    <IconButton
                        icon="mdi:github"
                        onClick={openGithub}
                        ariaLabel="GitHub"
                    />
                    <IconButton
                        icon="mdi:trashcan-outline"
                        onClick={() => dispatch(clearChat())}
                        ariaLabel="Clear chat"
                    />
                    <ThemeToggle />
                    <Logout />
                </div>
            )}
        </div>
    );
}

export default Header;