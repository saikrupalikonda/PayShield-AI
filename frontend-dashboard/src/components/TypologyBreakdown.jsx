const TypologyBreakdown = () => {
  const segments = [
    { label: 'Refund', value: 42, color: '#f59e0b' },
    { label: 'Urgency', value: 35, color: '#ef4444' },
    { label: 'Impersonation', value: 23, color: '#3b82f6' },
  ];

  return (
    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
      <h3>Typology Breakdown</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        {segments.map((segment) => (
          <div key={segment.label}>
            <div style={{ width: '18px', height: '18px', background: segment.color, borderRadius: '50%', display: 'inline-block', marginRight: '8px' }} />
            {segment.label} ({segment.value}%)
          </div>
        ))}
      </div>
    </div>
  );
};

export default TypologyBreakdown;
