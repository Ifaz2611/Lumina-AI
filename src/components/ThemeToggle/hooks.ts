import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { setTheme } from '../../store/user/userSlice';

export const useThemeToggle = () => {
    const { theme } = useSelector((state: RootState) => state.user);
    const dispatch = useDispatch();

    // Apply theme to document on mount or theme change
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Check for saved theme or system preference on initial load
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme) {
            dispatch(setTheme(savedTheme));
        } else if (systemPrefersDark) {
            dispatch(setTheme('dark'));
        }
    }, [dispatch]);

    const handleThemeToggle = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        dispatch(setTheme(newTheme));
    };

    return { theme, handleThemeToggle };
};