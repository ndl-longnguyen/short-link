import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'

export const alt = 'ShortLink - Enterprise URL Shortener & Dynamic QR Studio'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #09090b 0%, #18181b 50%, #000000 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          color: 'white',
          position: 'relative',
          padding: '60px',
        }}
      >
        {/* Glow ambient circle */}
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '600px',
            height: '350px',
            background: 'radial-gradient(circle, rgba(217, 119, 6, 0.25) 0%, rgba(0,0,0,0) 70%)',
            filter: 'blur(40px)',
          }}
        />

        {/* Brand header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '24px',
              border: '2px solid rgba(245, 158, 11, 0.4)',
              background: '#000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 30px rgba(245, 158, 11, 0.2)',
            }}
          >
            <span
              style={{
                fontSize: '44px',
                fontWeight: 900,
                color: '#f59e0b',
                letterSpacing: '-2px',
              }}
            >
              ND
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: '56px',
              fontWeight: 800,
              letterSpacing: '-1.5px',
            }}
          >
            <span>Short</span>
            <span style={{ color: '#f59e0b' }}>Link</span>
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: '38px',
            fontWeight: 700,
            textAlign: 'center',
            maxWidth: '900px',
            lineHeight: 1.3,
            color: '#f4f4f5',
            marginBottom: '20px',
          }}
        >
          Fast URL Shortener, Dynamic QR Codes & Privacy Analytics
        </div>

        {/* Bilingual Subtitle */}
        <div
          style={{
            fontSize: '22px',
            color: '#a1a1aa',
            textAlign: 'center',
            maxWidth: '850px',
            lineHeight: 1.4,
            marginBottom: '40px',
          }}
        >
          Rút gọn liên kết siêu tốc &bull; Tạo mã QR động miễn phí &bull; Thống kê click thời gian thực
        </div>

        {/* Feature Badges */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
          }}
        >
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              padding: '10px 22px',
              borderRadius: '999px',
              fontSize: '18px',
              fontWeight: 600,
              color: '#fbbf24',
            }}
          >
            ⚡ Sub-millisecond Redirect
          </div>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              padding: '10px 22px',
              borderRadius: '999px',
              fontSize: '18px',
              fontWeight: 600,
              color: '#34d399',
            }}
          >
            🔒 Password Protection
          </div>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              padding: '10px 22px',
              borderRadius: '999px',
              fontSize: '18px',
              fontWeight: 600,
              color: '#60a5fa',
            }}
          >
            📊 Detailed Analytics
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
