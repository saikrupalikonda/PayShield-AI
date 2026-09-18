import React, { useState } from 'react';
import SMSNotification from './components/SMSNotification';
import PaymentScreen from './components/PaymentScreen';
import InterlockModal from './components/InterlockModal';
import { evaluateRisk } from './services/apiService';

const scamMessage = 'URGENT! Your refund is pending. Verify your account now to prevent account blockage.';

export default function App() {
  const [payee, setPayee] = useState('Unknown UPI ID');
  const [amount, setAmount] = useState('15000');
  const [riskData, setRiskData] = useState(null);
  const [interlockVisible, setInterlockVisible] = useState(false);

  const handlePay = async () => {
    const result = await evaluateRisk({ payee, amount, smsContext: scamMessage });
    setRiskData(result);
    setInterlockVisible(true);
  };

  return (
    <div style={{ maxWidth: 440, margin: '40px auto', fontFamily: 'sans-serif', padding: 18 }}>
      <h1 style={{ textAlign: 'center' }}>PayShield AI</h1>
      <SMSNotification message={scamMessage} />
      <PaymentScreen
        payee={payee}
        amount={amount}
        setPayee={setPayee}
        setAmount={setAmount}
        onPay={handlePay}
      />

      {interlockVisible && riskData && (
        <InterlockModal
          riskScore={riskData.risk_score}
          reasons={riskData.reasons}
          onStop={() => setInterlockVisible(false)}
          onContinue={() => setInterlockVisible(false)}
        />
      )}
    </div>
  );
}
