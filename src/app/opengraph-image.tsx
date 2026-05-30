import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'ScopeFlow — Gerador de Propostas e Contratos para Devs'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #111827 0%, #1f2937 50%, #134e40 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background decoration */}
        <div
          style={{
            position: 'absolute',
            top: -120,
            right: -120,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(42, 107, 92, 0.25)',
            filter: 'blur(80px)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -80,
            left: -80,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(42, 107, 92, 0.15)',
            filter: 'blur(60px)',
            display: 'flex',
          }}
        />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <svg width="56" height="56" viewBox="0 0 60 60" fill="none">
            <rect width="60" height="60" rx="14" fill="#2A6B5C" />
            <rect x="13" y="34" width="7" height="13" rx="2" fill="white" opacity="0.40" />
            <rect x="23" y="26" width="7" height="21" rx="2" fill="white" opacity="0.65" />
            <rect x="33" y="17" width="7" height="30" rx="2" fill="white" />
          </svg>
          <span style={{ fontSize: 36, fontWeight: 900, color: 'white', letterSpacing: '-1px' }}>
            SCOPEFLOW
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 54,
            fontWeight: 800,
            color: 'white',
            textAlign: 'center',
            lineHeight: 1.1,
            letterSpacing: '-2px',
            maxWidth: 900,
            marginBottom: 20,
            display: 'flex',
          }}
        >
          Propostas e Contratos
          <br />
          para Devs Profissionais
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 22,
            color: 'rgba(255,255,255,0.6)',
            textAlign: 'center',
            maxWidth: 700,
            lineHeight: 1.4,
            display: 'flex',
          }}
        >
          Calcule preços, gere propostas e assine contratos digitais em minutos.
        </div>

        {/* Feature chips */}
        <div style={{ display: 'flex', gap: 12, marginTop: 40 }}>
          {['Propostas PDF', 'Contratos Digitais', 'Assinatura Online'].map((label) => (
            <div
              key={label}
              style={{
                padding: '10px 20px',
                borderRadius: 999,
                background: 'rgba(42, 107, 92, 0.3)',
                border: '1px solid rgba(42, 107, 92, 0.5)',
                color: 'rgba(255,255,255,0.85)',
                fontSize: 16,
                fontWeight: 600,
                display: 'flex',
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  )
}
