import type { OGImageConfig } from '../types'

type DefaultTemplateProps = Pick<OGImageConfig, 'title' | 'description'>

/**
 * Default OG image template — gradient background with brand label, title, and description.
 * Uses inline styles only (Satori requirement — no CSS classes or external stylesheets).
 */
export function DefaultTemplate({ title, description }: DefaultTemplateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        width: '100%',
        height: '100%',
        padding: '80px',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        color: '#f8fafc',
        fontFamily: 'Inter',
      }}
    >
      <div
        style={{
          display: 'flex',
          fontSize: 28,
          fontWeight: 600,
          color: '#61B5C2',
          marginBottom: 24,
        }}
      >
        crax
      </div>
      <div
        style={{
          display: 'flex',
          fontSize: 64,
          fontWeight: 700,
          lineHeight: 1.1,
          marginBottom: description ? 24 : 0,
        }}
      >
        {title}
      </div>
      {description && (
        <div
          style={{
            display: 'flex',
            fontSize: 32,
            fontWeight: 400,
            color: '#94a3b8',
            lineHeight: 1.4,
          }}
        >
          {description}
        </div>
      )}
    </div>
  )
}