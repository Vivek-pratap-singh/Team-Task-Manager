import { CheckSquare } from 'lucide-react'
import { Link } from 'react-router-dom'

function AuthArtwork() {
  return (
    <div className="auth-art">
      <div className="auth-glow glow-1" />
      <div className="auth-glow glow-2" />
      <div className="auth-art-frame">
        <span className="auth-stem stem-1" />
        <span className="auth-stem stem-2" />
        <span className="auth-stem stem-3" />
        <span className="auth-leaf leaf-1" />
        <span className="auth-leaf leaf-2" />
        <span className="auth-leaf leaf-3" />
        <span className="auth-leaf leaf-4" />
        <span className="auth-leaf leaf-5" />
        <span className="auth-leaf leaf-6" />
        <span className="auth-leaf leaf-7" />
        <div className="auth-pot" />
      </div>
    </div>
  )
}

export default function AuthShell({
  title,
  subtitle,
  footerText,
  footerLinkText,
  footerLinkTo,
  children,
}) {
  return (
    <div className="auth-screen">
      <div className="auth-shell">
        <section className="auth-hero">
          <div className="auth-hero-copy">
            <span className="auth-pill">
              <CheckSquare size={13} />
              Team Task Manager
            </span>
            <h2 className="auth-hero-title">Calm surfaces for focused work.</h2>
            <p className="auth-hero-subtitle">
              A soft glass interface that keeps the workflow visible, organized, and easy to trust.
            </p>
          </div>

          <AuthArtwork />
        </section>

        <section className="auth-panel">
          <div className="auth-panel-inner">
            <div className="mb-8 text-center">
              <h1 className="auth-panel-title">{title}</h1>
              <p className="auth-panel-copy">{subtitle}</p>
            </div>

            {children}

            {footerText && footerLinkText && footerLinkTo && (
              <p className="mt-6 text-center text-sm text-[color:var(--text-muted)]">
                {footerText}{' '}
                <Link to={footerLinkTo} className="auth-inline-link font-semibold">
                  {footerLinkText}
                </Link>
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
