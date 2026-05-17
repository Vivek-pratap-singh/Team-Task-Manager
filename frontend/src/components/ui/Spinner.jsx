export default function Spinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-7 h-7 border-2',
    lg: 'w-12 h-12 border-3',
  }
  return (
    <div
      className={`${sizes[size]} rounded-full border-[rgba(200,91,157,0.22)] border-t-[rgba(127,87,213,0.95)] animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    />
  )
}
