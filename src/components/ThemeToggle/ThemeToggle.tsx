import { Icon } from '@iconify/react/dist/iconify.js';
import { useThemeToggle } from './hooks';
import './ThemeToggle.scss';

function ThemeToggle() {
    const { theme, handleThemeToggle } = useThemeToggle();

    return (
        <button
            className='theme-toggle-container'
            onClick={handleThemeToggle}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            aria-pressed={theme === 'dark'}
        >
            <Icon
                className='theme-icon'
                icon={theme === 'light' ? 'solar:sun-bold' : 'akar-icons:moon-fill'}
                height={28}
            />
        </button>
    );
}

export default ThemeToggle;