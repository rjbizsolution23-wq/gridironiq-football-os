'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: '2rem', fontFamily: 'system-ui, sans-serif', backgroundColor: '#0f172a', color: '#f8fafc' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', paddingTop: '4rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Something went wrong!</h2>
          <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
            {error?.message || 'An unexpected error occurred in GridironIQ.'}
          </p>
          <button
            onClick={() => reset()}
            style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.375rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
