export default function PaymentScreen({ onPay, payee, amount, setPayee, setAmount }) {
  return (
    <div style={{
      background: '#f7f7fb',
      borderRadius: 18,
      padding: 20,
      boxShadow: '0 8px 20px rgba(0,0,0,0.08)'
    }}>
      <h3 style={{ marginBottom: 12 }}>New Payment</h3>

      <label style={{ display: 'block', marginBottom: 8 }}>Payee</label>
      <input
        value={payee}
        onChange={(e) => setPayee(e.target.value)}
        style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd', marginBottom: 14 }}
      />

      <label style={{ display: 'block', marginBottom: 8 }}>Amount</label>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd', marginBottom: 18 }}
      />

      <button
        onClick={onPay}
        style={{
          width: '100%',
          padding: 12,
          border: 0,
          borderRadius: 10,
          background: '#2d6df6',
          color: '#fff',
          fontWeight: 700,
          cursor: 'pointer'
        }}
      >
        Pay Now
      </button>
    </div>
  );
}
