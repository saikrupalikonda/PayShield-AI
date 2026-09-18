export default function InterlockModal({ riskScore, onContinue, onStop }) {
  const isHighRisk = riskScore >= 60;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(20, 20, 35, 0.55)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        width: '100%',
        maxWidth: 380,
        padding: 22,
        boxShadow: '0 12px 32px rgba(0,0,0,0.18)'
      }}>
        <div style={{ fontSize: 12, color: '#7c7c7c', textTransform: 'uppercase', letterSpacing: 1 }}>Security check</div>
        <h3 style={{ margin: '10px 0', color: isHighRisk ? '#b52d2d' : '#1d1d1d' }}>Risk score: {riskScore}/100</h3>
        <p style={{ marginBottom: 20, color: '#3c3c3c' }}>
          {isHighRisk
            ? 'This payment matches scam patterns including urgency and impersonation cues. Please stop and verify the request before proceeding.'
            : 'The transaction looks mostly normal, but review the details before confirming.'}
        </p>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onStop}
            style={{
              flex: 1,
              background: '#ef4444',
              color: 'white',
              border: 0,
              borderRadius: 10,
              padding: 12,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            STOP & VERIFY
          </button>
          <button
            onClick={onContinue}
            style={{
              flex: 1,
              background: '#22c55e',
              color: 'white',
              border: 0,
              borderRadius: 10,
              padding: 12,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            CONTINUE
          </button>
        </div>
      </div>
    </div>
  );
}
