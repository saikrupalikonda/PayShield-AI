export default function SMSNotification({ text }) {
  return (
    <div style={{
      background: '#fff5f5',
      border: '1px solid #f8c7c7',
      borderRadius: 12,
      padding: 16,
      marginBottom: 14,
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    }}>
      <div style={{ fontSize: 12, color: '#9a3b3b', fontWeight: 700, marginBottom: 6 }}>SMS Alert</div>
      <div style={{ fontSize: 15, lineHeight: 1.5 }}>{text}</div>
    </div>
  );
}
