import Spinner from './Spinner'

export default function Button({
  children,
  variant = 'primary',
  size = '',
  loading = false,
  disabled = false,
  className = '',
  ...props
}) {
  const variantClass = {
    primary:   'btn-primary',
    secondary: 'btn-secondary',
    danger:    'btn-danger',
    ghost:     'btn-ghost',
  }[variant] || 'btn-primary'

  const sizeClass = { sm: 'btn-sm', lg: 'btn-lg' }[size] || ''

  return (
    <button
      disabled={disabled || loading}
      className={`${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  )
}
