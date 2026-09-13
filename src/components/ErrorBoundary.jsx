import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, info) {
    console.error('[Vizara] Uncaught error', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#050014',
          color: '#e2e8f0',
          padding: 24,
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: 520,
            background: 'rgba(16,13,46,0.9)',
            border: '1px solid rgba(148,163,184,0.14)',
            borderRadius: 16,
            padding: 28
          }}>
            <h2 style={{ fontWeight: 900, marginBottom: 8 }}>Something broke · Vizara</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: 16 }}>
              {String(this.state.error?.message || 'Unexpected error')}
            </p>
            <button
              onClick={() => { localStorage.clear(); location.reload() }}
              style={{
                background: 'linear-gradient(135deg,#7c3aed,#a855f7)',
                color: '#fff',
                border: 'none',
                padding: '10px 18px',
                borderRadius: 10,
                fontWeight: 700,
                cursor: 'pointer',
                marginRight: 10
              }}
            >
              Reload & clear cache
            </button>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{
                background: 'transparent',
                color: '#94a3b8',
                border: '1px solid rgba(148,163,184,0.14)',
                padding: '10px 18px',
                borderRadius: 10,
                cursor: 'pointer'
              }}
            >
              Dismiss
            </button>
            <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: 14, fontFamily: 'JetBrains Mono, monospace' }}>
              If this repeats, report at github.com/anomalyco/opencode
            </p>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
