import './LoadingLine.scss'

interface LoadingLineProps {
    /** Visual style variant */
    variant?: 'gradient' | 'pulse' | 'shimmer' | 'dual'
    /** Width of the loading line (CSS value) */
    width?: string
    /** Height of the loading line (in px) */
    height?: number
    /** Animation speed in seconds */
    speed?: number
    /** Custom color (overrides gradient for single-color variants) */
    color?: string
    /** Additional className */
    className?: string
}

function LoadingLine({
    variant = 'gradient',
    width = '50%',
    height = 4,
    speed = 1.5,
    color,
    className = '',
}: LoadingLineProps) {
    const style = {
        '--line-width': width,
        '--line-height': `${height}px`,
        '--line-speed': `${speed}s`,
        '--line-color': color,
    } as React.CSSProperties

    return (
        <div
            className={`loader-line loader-line--${variant} ${className}`}
            style={style}
        />
    )
}

export default LoadingLine