const LiveRiskFeed = () => {
  const alerts = [
    { id: 1, payee: 'Random UPI ID', score: 92, type: 'Refund scam' },
    { id: 2, payee: 'Unknown merchant', score: 89, type: 'Urgency script' },
    { id: 3, payee: 'Bank Support', score: 68, type: 'Impersonation' },
  ];

  return (
    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
      <h3>Live Risk Feed</h3>
      <ul style={{ paddingLeft: 18 }}>
        {alerts.map((alert) => (
          <li key={alert.id} style={{ marginBottom: 8 }}>
            <strong>{alert.payee}</strong> — {alert.type} — risk {alert.score}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LiveRiskFeed;
