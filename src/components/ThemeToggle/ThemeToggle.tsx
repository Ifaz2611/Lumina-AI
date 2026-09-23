import { Icon } from '@iconify/react/dist/iconify.js';
import { useThemeToggle } from './hooks';
import './ThemeToggle.scss';

function ThemeToggle() {
    const { theme, handleThemeToggle } = useThemeToggle();
    const icon = theme === 'light' ? 'solar:sun-bold' : theme === 'midnight' ? 'mdi:weather-night' : 'akar-icons:moon-fill'
    const nextLabel = theme === 'light' ? 'midnight' : theme === 'midnight' ? 'dark' : 'light'

    return (
        <button
            className='theme-toggle-container'
            onClick={handleThemeToggle}
            aria-label={`Switch to ${nextLabel} mode (current: ${theme})`}
            title={`Theme: ${theme} (click to cycle)`}
            aria-pressed={theme !== 'light'}
        >
            <Icon
                className='theme-icon'
                icon={icon}
                height={28}
            />
        </button>
    );
}

export default ThemeToggle;