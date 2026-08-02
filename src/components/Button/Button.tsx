import './Button.scss'
import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    disabled?: boolean;
    variant?: 'primary' | 'secondary';
    loading?: boolean;
}

function Button({ 
    children, 
    disabled = false, 
    variant = 'primary',
    loading = false,
    className = '', 
    ...buttonProps 
}: ButtonProps) {
    const isDisabled = disabled || loading;
    
    return (
        <button 
            className={`lumina-button 
                lumina-button--${variant} 
                ${isDisabled ? 'lumina-button--disabled' : ''} 
                ${loading ? 'lumina-button--loading' : ''} 
                ${className}`}
            disabled={isDisabled}
            {...buttonProps}
        >
            {loading && <span className="lumina-button__spinner" aria-hidden="true" />}
            <span className={`lumina-button__content ${loading ? 'lumina-button__content--loading' : ''}`}>
                {children}
            </span>
        </button>
    )
}

export default Button