import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Dynamic params
    const name = searchParams.get('name') || 'Eco Warrior';
    const points = searchParams.get('points') || '0';
    const co2 = searchParams.get('co2') || '0';
    const level = searchParams.get('level') || 'Novice';
    
    // Derived values
    const initial = name.charAt(0).toUpperCase();

    // Color logic based on level
    let levelColor = '#e2e8f0'; // Default gray
    if (level === 'Circular Master') levelColor = '#22c55e'; // Primary Green
    else if (level === 'Eco Hero') levelColor = '#ff8b7c'; // Tertiary
    else if (level === 'Waste Warrior') levelColor = '#3b82f6'; // Blue
    else if (level === 'Eco Starter') levelColor = '#a855f7'; // Purple

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0A0A0A',
            fontFamily: 'sans-serif',
            color: '#FFFFFF',
            padding: '40px',
          }}
        >
          {/* Main Bento Container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              width: '100%',
              height: '100%',
              gap: '24px',
            }}
          >
            {/* Left Column: Profile Card */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                flex: 1,
                backgroundColor: '#171717',
                border: '1px solid #262626',
                borderRadius: '24px',
                padding: '40px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '160px',
                  height: '160px',
                  borderRadius: '80px',
                  backgroundColor: '#22c55e',
                  fontSize: '64px',
                  fontWeight: 'bold',
                  color: '#004b1e',
                  marginBottom: '24px',
                  border: '8px solid rgba(255,255,255,0.05)'
                }}
              >
                {initial}
              </div>

              {/* Name & Level */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '48px', fontWeight: 'bold', letterSpacing: '-0.05em', marginBottom: '8px' }}>
                  {name}
                </span>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px 24px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${levelColor}`,
                    borderRadius: '9999px',
                    color: levelColor,
                    fontSize: '24px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {level}
                </div>
              </div>
            </div>

            {/* Right Column: Stats Grid */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                gap: '24px',
              }}
            >
              {/* Top Right: CO2 Card */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  flex: 1.5,
                  backgroundColor: '#171717',
                  border: '1px solid #262626',
                  borderRadius: '24px',
                  padding: '40px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(34, 197, 94, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '16px',
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
                      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: '24px', color: '#a3a3a3', fontWeight: 600 }}>CO2 Diselamatkan</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '80px', fontWeight: 'bold', color: '#ffffff', letterSpacing: '-0.05em', lineHeight: 1 }}>
                    {co2}
                  </span>
                  <span style={{ fontSize: '32px', color: '#a3a3a3', marginLeft: '12px', fontWeight: 'normal' }}>
                    kg
                  </span>
                </div>
              </div>

              {/* Bottom Right: Points Card */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  flex: 1,
                  backgroundColor: '#171717',
                  border: '1px solid #262626',
                  borderRadius: '24px',
                  padding: '32px 40px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '20px', color: '#a3a3a3', fontWeight: 600, marginBottom: '4px' }}>Total Poin</span>
                    <span style={{ fontSize: '48px', fontWeight: 'bold', color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1 }}>
                      {points}
                    </span>
                  </div>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '16px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#e5e5e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer Branding */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              left: '0',
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '4px', backgroundColor: '#22c55e' }}></div>
              <span style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '-0.02em', color: '#a3a3a3' }}>CircularMetric</span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.error('Error generating OG image', e);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
